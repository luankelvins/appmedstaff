import { useState, useEffect, useCallback } from 'react'
import { securityValidationService, SecurityAlert, SecurityMetrics } from '../utils/securityValidationService'
import { AuditLog } from '../types/audit'

export interface UseSecurityValidationReturn {
  // Estado
  alerts: SecurityAlert[]
  metrics: SecurityMetrics | null
  loading: boolean
  error: string | null

  // Ações
  analyzeSecurityEvent: (auditLog: AuditLog) => Promise<SecurityAlert[]>
  getAlerts: (filters?: {
    type?: SecurityAlert['type']
    severity?: SecurityAlert['severity']
    resolved?: boolean
    userId?: string
    limit?: number
  }) => Promise<void>
  resolveAlert: (alertId: string, resolvedBy: string) => Promise<boolean>
  refreshMetrics: () => Promise<void>
  
  // Utilitários
  getUnresolvedAlertsCount: () => number
  getCriticalAlertsCount: () => number
  getAlertsByType: (type: SecurityAlert['type']) => SecurityAlert[]
  getAlertsBySeverity: (severity: SecurityAlert['severity']) => SecurityAlert[]
}

export const useSecurityValidation = (): UseSecurityValidationReturn => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Analisar evento de segurança
  const analyzeSecurityEvent = useCallback(async (auditLog: AuditLog): Promise<SecurityAlert[]> => {
    try {
      setError(null)
      const newAlerts = await securityValidationService.analyzeSecurityEvent(auditLog)
      
      // Atualizar lista de alertas se novos alertas foram gerados
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev])
      }
      
      return newAlerts
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao analisar evento de segurança'
      setError(errorMessage)
      console.error('Erro ao analisar evento de segurança:', err)
      return []
    }
  }, [])

  // Buscar alertas
  const getAlerts = useCallback(async (filters?: {
    type?: SecurityAlert['type']
    severity?: SecurityAlert['severity']
    resolved?: boolean
    userId?: string
    limit?: number
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      const fetchedAlerts = await securityValidationService.getSecurityAlerts(filters)
      setAlerts(fetchedAlerts)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar alertas'
      setError(errorMessage)
      console.error('Erro ao buscar alertas:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Resolver alerta
  const resolveAlert = useCallback(async (alertId: string, resolvedBy: string): Promise<boolean> => {
    try {
      setError(null)
      const success = await securityValidationService.resolveAlert(alertId, resolvedBy)
      
      if (success) {
        // Atualizar o alerta na lista local
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, resolved: true, resolvedBy, resolvedAt: new Date() }
            : alert
        ))
      }
      
      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao resolver alerta'
      setError(errorMessage)
      console.error('Erro ao resolver alerta:', err)
      return false
    }
  }, [])

  // Atualizar métricas
  const refreshMetrics = useCallback(async () => {
    try {
      setError(null)
      const newMetrics = await securityValidationService.getSecurityMetrics()
      setMetrics(newMetrics)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar métricas'
      setError(errorMessage)
      console.error('Erro ao buscar métricas:', err)
    }
  }, [])

  // Utilitários
  const getUnresolvedAlertsCount = useCallback((): number => {
    return alerts.filter(alert => !alert.resolved).length
  }, [alerts])

  const getCriticalAlertsCount = useCallback((): number => {
    return alerts.filter(alert => alert.severity === 'critical' && !alert.resolved).length
  }, [alerts])

  const getAlertsByType = useCallback((type: SecurityAlert['type']): SecurityAlert[] => {
    return alerts.filter(alert => alert.type === type)
  }, [alerts])

  const getAlertsBySeverity = useCallback((severity: SecurityAlert['severity']): SecurityAlert[] => {
    return alerts.filter(alert => alert.severity === severity)
  }, [alerts])

  // Carregar dados iniciais
  useEffect(() => {
    getAlerts({ limit: 50 })
    refreshMetrics()
  }, [getAlerts, refreshMetrics])

  return {
    // Estado
    alerts,
    metrics,
    loading,
    error,

    // Ações
    analyzeSecurityEvent,
    getAlerts,
    resolveAlert,
    refreshMetrics,

    // Utilitários
    getUnresolvedAlertsCount,
    getCriticalAlertsCount,
    getAlertsByType,
    getAlertsBySeverity
  }
}

// Hook específico para monitoramento em tempo real
export const useSecurityMonitoring = () => {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [realtimeAlerts, setRealtimeAlerts] = useState<SecurityAlert[]>([])
  
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    // Implementar WebSocket ou polling para monitoramento em tempo real
    console.log('Monitoramento de segurança iniciado')
  }, [])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
    console.log('Monitoramento de segurança parado')
  }, [])

  const addRealtimeAlert = useCallback((alert: SecurityAlert) => {
    setRealtimeAlerts(prev => [alert, ...prev.slice(0, 9)]) // Manter apenas os 10 mais recentes
  }, [])

  return {
    isMonitoring,
    realtimeAlerts,
    startMonitoring,
    stopMonitoring,
    addRealtimeAlert
  }
}

// Hook para validações específicas de conformidade
export const useComplianceValidation = () => {
  const [complianceStatus, setComplianceStatus] = useState<{
    lgpd: { score: number; violations: number }
    gdpr: { score: number; violations: number }
    sox: { score: number; violations: number }
    iso27001: { score: number; violations: number }
  }>({
    lgpd: { score: 100, violations: 0 },
    gdpr: { score: 100, violations: 0 },
    sox: { score: 100, violations: 0 },
    iso27001: { score: 100, violations: 0 }
  })

  const checkLGPDCompliance = useCallback(async (action: string, metadata?: Record<string, any>) => {
    // Verificar conformidade LGPD
    const personalDataActions = ['hr.collaborators.view_personal_data', 'data.collaborator.export']
    
    if (personalDataActions.includes(action)) {
      const hasConsent = metadata?.consent || false
      if (!hasConsent) {
        return {
          compliant: false,
          violation: 'Acesso a dados pessoais sem consentimento'
        }
      }
    }

    return { compliant: true }
  }, [])

  const checkGDPRCompliance = useCallback(async (action: string, metadata?: Record<string, any>) => {
    // Verificar conformidade GDPR
    const dataProcessingActions = ['data.collaborator.export', 'data.contact.export']
    
    if (dataProcessingActions.includes(action)) {
      const hasLegalBasis = metadata?.legalBasis || false
      if (!hasLegalBasis) {
        return {
          compliant: false,
          violation: 'Processamento de dados sem base legal'
        }
      }
    }

    return { compliant: true }
  }, [])

  const checkSOXCompliance = useCallback(async (action: string, metadata?: Record<string, any>) => {
    // Verificar conformidade SOX
    const financialActions = ['finance.expenses.create', 'finance.launches.create']
    
    if (financialActions.includes(action)) {
      const hasApproval = metadata?.approval || false
      const hasAuditTrail = metadata?.auditTrail || false
      
      if (!hasApproval || !hasAuditTrail) {
        return {
          compliant: false,
          violation: 'Transação financeira sem aprovação ou trilha de auditoria'
        }
      }
    }

    return { compliant: true }
  }, [])

  const checkISO27001Compliance = useCallback(async (action: string, metadata?: Record<string, any>) => {
    // Verificar conformidade ISO 27001
    const sensitiveActions = ['rbac.role.create', 'rbac.permission.assign', 'admin.settings.update']
    
    if (sensitiveActions.includes(action)) {
      const hasMFA = metadata?.mfaVerified || false
      if (!hasMFA) {
        return {
          compliant: false,
          violation: 'Ação sensível sem verificação MFA'
        }
      }
    }

    return { compliant: true }
  }, [])

  const validateCompliance = useCallback(async (action: string, metadata?: Record<string, any>) => {
    const results = await Promise.all([
      checkLGPDCompliance(action, metadata),
      checkGDPRCompliance(action, metadata),
      checkSOXCompliance(action, metadata),
      checkISO27001Compliance(action, metadata)
    ])

    return {
      lgpd: results[0],
      gdpr: results[1],
      sox: results[2],
      iso27001: results[3]
    }
  }, [checkLGPDCompliance, checkGDPRCompliance, checkSOXCompliance, checkISO27001Compliance])

  return {
    complianceStatus,
    validateCompliance,
    checkLGPDCompliance,
    checkGDPRCompliance,
    checkSOXCompliance,
    checkISO27001Compliance
  }
}

// Hook para análise de riscos
export const useRiskAnalysis = () => {
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low')
  const [riskFactors, setRiskFactors] = useState<string[]>([])

  const analyzeRisk = useCallback(async (auditLog: AuditLog): Promise<{
    level: 'low' | 'medium' | 'high' | 'critical'
    score: number
    factors: string[]
  }> => {
    const factors: string[] = []
    let score = 0

    // Fatores de risco baseados na ação
    const highRiskActions = [
      'rbac.role.create', 'rbac.permission.assign', 'admin.settings.update',
      'data.collaborator.export', 'hr.collaborators.view_salary'
    ]

    if (highRiskActions.includes(auditLog.action)) {
      score += 30
      factors.push('Ação de alto risco')
    }

    // Fatores de risco baseados no horário
    const hour = new Date(auditLog.timestamp).getHours()
    if (hour >= 22 || hour <= 6) {
      score += 20
      factors.push('Atividade fora do horário comercial')
    }

    // Fatores de risco baseados no sucesso da ação
    if (!auditLog.success) {
      score += 15
      factors.push('Ação falhada')
    }

    // Fatores de risco baseados em metadados
    if (auditLog.meta?.suspicious) {
      score += 25
      factors.push('Atividade marcada como suspeita')
    }

    // Determinar nível de risco
    let level: 'low' | 'medium' | 'high' | 'critical'
    if (score >= 70) level = 'critical'
    else if (score >= 50) level = 'high'
    else if (score >= 30) level = 'medium'
    else level = 'low'

    setRiskLevel(level)
    setRiskFactors(factors)

    return { level, score, factors }
  }, [])

  return {
    riskLevel,
    riskFactors,
    analyzeRisk
  }
}