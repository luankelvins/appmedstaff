import db from '../config/database'
import { websocketService, WebSocketEvent } from './websocketService'

// ==================== INTERFACES ====================

export interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any
  old_record?: any
  timestamp: string
  eventId: string
}

export interface SubscriptionConfig {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  schema?: string
}

export interface ConnectionStatus {
  isConnected: boolean
  lastHeartbeat?: Date
  reconnectAttempts: number
  subscriptions: string[]
  latency?: number
}

export type EventHandler = (event: RealtimeEvent) => void
export type ConnectionHandler = (status: ConnectionStatus) => void
export type ErrorHandler = (error: Error) => void

// ==================== SERVIÇO DE TEMPO REAL ====================

export class RealtimeService {
  private subscriptions: Map<string, SubscriptionConfig> = new Map()
  private eventHandlers: Map<string, Set<EventHandler>> = new Map()
  private connectionHandlers: Set<ConnectionHandler> = new Set()
  private errorHandlers: Set<ErrorHandler> = new Set()
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    reconnectAttempts: 0,
    subscriptions: []
  }
  private heartbeatInterval?: NodeJS.Timeout
  private reconnectTimeout?: NodeJS.Timeout
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private wsUnsubscribe?: () => void

  constructor() {
    // Não conectar automaticamente - apenas quando explicitamente solicitado
    // this.setupWebSocketConnection()
  }

  /**
   * Configura conexão WebSocket para receber eventos em tempo real
   */
  private setupWebSocketConnection(): void {
    // Conecta ao WebSocket se não estiver conectado
    if (!websocketService.isConnected) {
      websocketService.connect().catch(error => {
        console.warn('WebSocket não disponível - funcionalidade em tempo real desabilitada:', error.message)
        // Não notificar como erro crítico, apenas como aviso
      })
    }

    // Escuta eventos de realtime via WebSocket
    this.wsUnsubscribe = websocketService.on('realtime', (event: WebSocketEvent) => {
      this.handleRealtimeEvent(event.data)
    })

    // Atualiza status de conexão baseado no WebSocket
    this.updateConnectionStatus()
  }

  /**
   * Subscreve a eventos de uma tabela específica
   */
  subscribe(
    config: SubscriptionConfig,
    handler: EventHandler
  ): string {
    const subscriptionId = this.generateSubscriptionId(config)
    
    // Armazena configuração da subscription
    this.subscriptions.set(subscriptionId, config)
    
    // Adiciona handler
    if (!this.eventHandlers.has(subscriptionId)) {
      this.eventHandlers.set(subscriptionId, new Set())
    }
    this.eventHandlers.get(subscriptionId)!.add(handler)

    // Simula subscription (em produção, seria configurado no backend)
    console.log(`[RealtimeService] Subscribed to ${config.table} events:`, config)
    
    this.updateConnectionStatus()
    
    return subscriptionId
  }

  /**
   * Remove subscription
   */
  unsubscribe(subscriptionId: string, handler?: EventHandler): void {
    if (handler) {
      const handlers = this.eventHandlers.get(subscriptionId)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.eventHandlers.delete(subscriptionId)
          this.subscriptions.delete(subscriptionId)
        }
      }
    } else {
      this.eventHandlers.delete(subscriptionId)
      this.subscriptions.delete(subscriptionId)
    }

    this.updateConnectionStatus()
  }

  /**
   * Remove todas as subscriptions
   */
  unsubscribeAll(): void {
    this.eventHandlers.clear()
    this.subscriptions.clear()
    this.updateConnectionStatus()
  }

  /**
   * Adiciona handler para mudanças de conexão
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler)
    return () => {
      this.connectionHandlers.delete(handler)
    }
  }

  /**
   * Adiciona handler para erros
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler)
    return () => {
      this.errorHandlers.delete(handler)
    }
  }

  /**
   * Retorna status da conexão
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus }
  }

  /**
   * Força reconexão
   */
  async reconnect(): Promise<void> {
    try {
      await websocketService.connect()
      this.connectionStatus.reconnectAttempts = 0
      this.updateConnectionStatus()
    } catch (error) {
      this.connectionStatus.reconnectAttempts++
      this.notifyErrorHandlers(error as Error)
      
      if (this.connectionStatus.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    }
  }

  /**
   * Testa latência da conexão
   */
  async testLatency(): Promise<number> {
    const start = Date.now()
    
    try {
      // Simula ping via WebSocket
      websocketService.send('ping', { timestamp: start })
      return Date.now() - start
    } catch (error) {
      console.error('Erro ao testar latência:', error)
      return -1
    }
  }

  // ==================== MÉTODOS DE CONVENIÊNCIA ====================

  /**
   * Subscreve a notificações de um usuário
   */
  subscribeToNotifications(userId: string, handler: EventHandler): string {
    return this.subscribe({
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, handler)
  }

  subscribeToTasks(handler: EventHandler): string {
    return this.subscribe({
      table: 'tasks'
    }, handler)
  }

  subscribeToSystemMetrics(handler: EventHandler): string {
    return this.subscribe({
      table: 'system_metrics'
    }, handler)
  }

  subscribeToFinancialMetrics(handler: EventHandler): string {
    return this.subscribe({
      table: 'financial_metrics'
    }, handler)
  }

  subscribeToProductivityMetrics(handler: EventHandler): string {
    return this.subscribe({
      table: 'productivity_metrics'
    }, handler)
  }

  subscribeToTeamPerformance(handler: EventHandler): string {
    return this.subscribe({
      table: 'team_performance'
    }, handler)
  }

  subscribeToHRMetrics(handler: EventHandler): string {
    return this.subscribe({
      table: 'hr_metrics'
    }, handler)
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private generateSubscriptionId(config: SubscriptionConfig): string {
    const { table, event = '*', filter = '', schema = 'public' } = config
    return `${schema}.${table}.${event}.${filter}`.replace(/[^a-zA-Z0-9._-]/g, '_')
  }

  private handleRealtimeEvent(payload: any): void {
    try {
      const event: RealtimeEvent = {
        type: payload.eventType || 'UPDATE',
        table: payload.table || 'unknown',
        record: payload.new || payload.record,
        old_record: payload.old,
        timestamp: new Date().toISOString(),
        eventId: this.generateEventId()
      }

      // Notifica handlers relevantes
      this.eventHandlers.forEach((handlers, subscriptionId) => {
        const config = this.subscriptions.get(subscriptionId)
        if (config && this.eventMatchesSubscription(event, config)) {
          handlers.forEach(handler => {
            try {
              handler(event)
            } catch (error) {
              console.error('Erro ao processar evento realtime:', error)
              this.notifyErrorHandlers(error as Error)
            }
          })
        }
      })
    } catch (error) {
      console.error('Erro ao processar evento realtime:', error)
      this.notifyErrorHandlers(error as Error)
    }
  }

  private eventMatchesSubscription(event: RealtimeEvent, config: SubscriptionConfig): boolean {
    // Verifica se o evento corresponde à configuração da subscription
    if (config.table !== event.table) return false
    if (config.event && config.event !== '*' && config.event !== event.type) return false
    
    // TODO: Implementar filtros mais complexos se necessário
    return true
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private updateConnectionStatus(): void {
    this.connectionStatus = {
      ...this.connectionStatus,
      isConnected: websocketService.isConnected,
      lastHeartbeat: new Date(),
      subscriptions: Array.from(this.subscriptions.keys())
    }
    this.notifyConnectionHandlers()
  }

  private notifyConnectionHandlers(): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(this.connectionStatus)
      } catch (error) {
        console.error('Erro ao notificar handler de conexão:', error)
      }
    })
  }

  private notifyErrorHandlers(error: Error): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error)
      } catch (error) {
        console.error('Erro ao notificar handler de erro:', error)
      }
    })
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    const delay = this.reconnectDelay * Math.pow(2, this.connectionStatus.reconnectAttempts - 1)
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnect()
    }, delay)
  }

  /**
   * Limpa recursos e desconecta
   */
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    if (this.wsUnsubscribe) {
      this.wsUnsubscribe()
    }
    this.unsubscribeAll()
  }
}

// Instância singleton
export const realtimeService = new RealtimeService()