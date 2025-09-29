import { useState, useEffect, useCallback } from 'react'
import { websocketService, WebSocketEvent } from '../services/websocketService'

export interface WebSocketStatus {
  isConnected: boolean
  connectionState: string
  lastError: string | null
  reconnectAttempts: number
}

export const useWebSocket = () => {
  const [status, setStatus] = useState<WebSocketStatus>({
    isConnected: false,
    connectionState: 'disconnected',
    lastError: null,
    reconnectAttempts: 0
  })

  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Monitora status de conectividade
  useEffect(() => {
    const updateStatus = () => {
      setStatus(prev => ({
        ...prev,
        isConnected: websocketService.isConnected,
        connectionState: websocketService.connectionState
      }))
    }

    // Atualiza status inicial
    updateStatus()

    // Monitora mudanças de conectividade
    const interval = setInterval(updateStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  // Monitora conectividade da internet
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Tenta reconectar quando volta online
      if (!websocketService.isConnected) {
        websocketService.connect().catch(console.error)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Conecta automaticamente quando o componente monta
  useEffect(() => {
    if (isOnline && !websocketService.isConnected) {
      websocketService.connect().catch(error => {
        setStatus(prev => ({
          ...prev,
          lastError: error.message || 'Erro de conexão'
        }))
      })
    }
  }, [isOnline])

  const connect = useCallback(async () => {
    try {
      await websocketService.connect()
      setStatus(prev => ({
        ...prev,
        lastError: null
      }))
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Erro de conexão'
      }))
      throw error
    }
  }, [])

  const disconnect = useCallback(() => {
    websocketService.disconnect()
  }, [])

  const subscribe = useCallback((eventType: string, callback: (event: WebSocketEvent) => void) => {
    return websocketService.on(eventType, callback)
  }, [])

  const send = useCallback((type: string, payload: any) => {
    websocketService.send(type, payload)
  }, [])

  return {
    status,
    isOnline,
    connect,
    disconnect,
    subscribe,
    send,
    websocketService
  }
}

export default useWebSocket