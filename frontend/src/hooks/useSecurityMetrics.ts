import { useState, useEffect, useCallback, useRef } from 'react'

interface SecurityMetrics {
  timestamp: string
  period: string
  summary: {
    totalAlerts: number
    criticalAlerts: number
    systemHealth: string
    lastUpdate: string
  }
  trends: {
    alertsLast1h: number
    alertsLast6h: number
    alertsLast24h: number
  }
}

interface CacheEntry {
  data: SecurityMetrics
  timestamp: number
  period: string
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos
const API_BASE_URL = 'http://localhost:3001'

// Cache global para compartilhar entre instâncias
const metricsCache = new Map<string, CacheEntry>()

export const useSecurityMetrics = (period: string = '24h') => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getCacheKey = (period: string) => `security-metrics-${period}`

  const isValidCache = (entry: CacheEntry, period: string): boolean => {
    const now = Date.now()
    return (
      entry.period === period &&
      (now - entry.timestamp) < CACHE_DURATION
    )
  }

  const fetchMetrics = useCallback(async (forceFetch: boolean = false) => {
    const cacheKey = getCacheKey(period)
    const cachedEntry = metricsCache.get(cacheKey)

    // Verificar cache primeiro
    if (!forceFetch && cachedEntry && isValidCache(cachedEntry, period)) {
      setMetrics(cachedEntry.data)
      setLoading(false)
      setError(null)
      setLastUpdate(new Date(cachedEntry.timestamp))
      return
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/security-dashboard/public-metrics?period=${period}`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        const metricsData = data.data
        
        // Atualizar cache
        metricsCache.set(cacheKey, {
          data: metricsData,
          timestamp: Date.now(),
          period: period
        })

        setMetrics(metricsData)
        setLastUpdate(new Date())
        setError(null)
      } else {
        throw new Error(data.message || 'Erro ao carregar métricas')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return // Requisição cancelada, não é um erro
      }

      console.error('Erro ao buscar métricas de segurança:', err)
      setError(err.message || 'Erro ao carregar dados de segurança')
      
      // Tentar usar cache expirado como fallback
      if (cachedEntry) {
        setMetrics(cachedEntry.data)
        setLastUpdate(new Date(cachedEntry.timestamp))
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [period])

  const refresh = useCallback(() => {
    fetchMetrics(true)
  }, [fetchMetrics])

  // Retry automático em caso de erro
  const scheduleRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
    
    retryTimeoutRef.current = setTimeout(() => {
      fetchMetrics()
    }, 10000) // Retry após 10 segundos
  }, [fetchMetrics])

  useEffect(() => {
    fetchMetrics()

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [fetchMetrics])

  // Retry automático em caso de erro
  useEffect(() => {
    if (error && !loading) {
      scheduleRetry()
    }
  }, [error, loading, scheduleRetry])

  return {
    metrics,
    loading,
    error,
    lastUpdate,
    refresh,
    isFromCache: () => {
      const cacheKey = getCacheKey(period)
      const cachedEntry = metricsCache.get(cacheKey)
      return cachedEntry && isValidCache(cachedEntry, period)
    }
  }
}