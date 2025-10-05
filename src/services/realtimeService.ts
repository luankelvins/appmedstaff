import { supabase } from '../config/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

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
  private channels: Map<string, RealtimeChannel> = new Map()
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

  constructor() {
    this.setupConnectionMonitoring()
  }

  /**
   * Inscreve-se em mudanças de uma tabela específica
   */
  subscribe(
    config: SubscriptionConfig,
    handler: EventHandler
  ): string {
    const subscriptionId = this.generateSubscriptionId(config)
    
    try {
      // Criar ou reutilizar canal
      let channel = this.channels.get(subscriptionId)
      
      if (!channel) {
        channel = supabase
          .channel(subscriptionId)
          .on(
            'postgres_changes' as any,
            {
              event: config.event || '*',
              schema: config.schema || 'public',
              table: config.table,
              filter: config.filter
            },
            (payload: any) => {
              this.handleRealtimeEvent(payload, subscriptionId)
            }
          )
          .subscribe((status) => {
            this.handleSubscriptionStatus(subscriptionId, status)
          })

        this.channels.set(subscriptionId, channel)
      }

      // Adicionar handler
      if (!this.eventHandlers.has(subscriptionId)) {
        this.eventHandlers.set(subscriptionId, new Set())
      }
      this.eventHandlers.get(subscriptionId)!.add(handler)

      // Atualizar status
      this.updateConnectionStatus()

      console.log(`✅ Inscrito em ${config.table} com ID: ${subscriptionId}`)
      return subscriptionId
    } catch (error) {
      console.error('Erro ao criar inscrição:', error)
      this.notifyErrorHandlers(error as Error)
      throw error
    }
  }

  /**
   * Remove inscrição específica
   */
  unsubscribe(subscriptionId: string, handler?: EventHandler): void {
    try {
      if (handler) {
        // Remover handler específico
        const handlers = this.eventHandlers.get(subscriptionId)
        if (handlers) {
          handlers.delete(handler)
          if (handlers.size === 0) {
            this.removeSubscription(subscriptionId)
          }
        }
      } else {
        // Remover toda a inscrição
        this.removeSubscription(subscriptionId)
      }

      this.updateConnectionStatus()
      console.log(`❌ Desinscrição realizada: ${subscriptionId}`)
    } catch (error) {
      console.error('Erro ao remover inscrição:', error)
      this.notifyErrorHandlers(error as Error)
    }
  }

  /**
   * Remove todas as inscrições
   */
  unsubscribeAll(): void {
    try {
      this.channels.forEach((channel, subscriptionId) => {
        channel.unsubscribe()
        this.channels.delete(subscriptionId)
      })
      
      this.eventHandlers.clear()
      this.updateConnectionStatus()
      
      console.log('❌ Todas as inscrições removidas')
    } catch (error) {
      console.error('Erro ao remover todas as inscrições:', error)
      this.notifyErrorHandlers(error as Error)
    }
  }

  /**
   * Adiciona handler para mudanças de status de conexão
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler)
    
    // Retorna função para remover o handler
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
   * Obtém status atual da conexão
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus }
  }

  /**
   * Força reconexão
   */
  async reconnect(): Promise<void> {
    try {
      console.log('🔄 Forçando reconexão...')
      
      // Desconectar tudo
      this.unsubscribeAll()
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Resetar status
      this.connectionStatus.reconnectAttempts = 0
      
      console.log('✅ Reconexão forçada concluída')
    } catch (error) {
      console.error('Erro na reconexão forçada:', error)
      this.notifyErrorHandlers(error as Error)
    }
  }

  /**
   * Testa latência da conexão
   */
  async testLatency(): Promise<number> {
    const start = Date.now()
    
    try {
      // Fazer uma query simples para testar latência
      await supabase.from('profiles').select('id').limit(1)
      const latency = Date.now() - start
      
      this.connectionStatus.latency = latency
      return latency
    } catch (error) {
      console.error('Erro ao testar latência:', error)
      throw error
    }
  }

  /**
   * Métodos de conveniência para tabelas específicas
   */
  
  subscribeToNotifications(userId: string, handler: EventHandler): string {
    return this.subscribe(
      {
        table: 'notifications',
        event: '*',
        filter: `user_id=eq.${userId}`
      },
      handler
    )
  }

  subscribeToTasks(handler: EventHandler): string {
    return this.subscribe(
      {
        table: 'tasks',
        event: '*'
      },
      handler
    )
  }

  subscribeToSystemMetrics(handler: EventHandler): string {
    return this.subscribe(
      {
        table: 'system_metrics',
        event: 'INSERT'
      },
      handler
    )
  }

  subscribeToFinancialMetrics(handler: EventHandler): string {
    return this.subscribe(
      {
        table: 'financial_metrics',
        event: '*'
      },
      handler
    )
  }

  subscribeToProductivityMetrics(handler: EventHandler): string {
    return this.subscribe(
      {
        table: 'productivity_metrics',
        event: '*'
      },
      handler
    )
  }

  subscribeToTeamPerformance(handler: EventHandler): string {
    return this.subscribe(
      {
        table: 'team_performance',
        event: '*'
      },
      handler
    )
  }

  subscribeToHRMetrics(handler: EventHandler): string {
    return this.subscribe(
      {
        table: 'hr_metrics',
        event: '*'
      },
      handler
    )
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private generateSubscriptionId(config: SubscriptionConfig): string {
    const parts = [
      config.table,
      config.event || 'all',
      config.filter || 'no-filter',
      config.schema || 'public'
    ]
    return parts.join(':').replace(/[^a-zA-Z0-9:_-]/g, '_')
  }

  private handleRealtimeEvent(payload: any, subscriptionId: string): void {
    try {
      const event: RealtimeEvent = {
        type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
        table: payload.table,
        record: payload.new,
        old_record: payload.old,
        timestamp: new Date().toISOString(),
        eventId: `${subscriptionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      // Notificar todos os handlers desta inscrição
      const handlers = this.eventHandlers.get(subscriptionId)
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(event)
          } catch (error) {
            console.error('Erro no handler de evento:', error)
            this.notifyErrorHandlers(error as Error)
          }
        })
      }

      console.log(`📡 Evento recebido: ${event.type} em ${event.table}`)
    } catch (error) {
      console.error('Erro ao processar evento realtime:', error)
      this.notifyErrorHandlers(error as Error)
    }
  }

  private handleSubscriptionStatus(subscriptionId: string, status: string): void {
    console.log(`📡 Status da inscrição ${subscriptionId}: ${status}`)
    
    if (status === 'SUBSCRIBED') {
      this.connectionStatus.isConnected = true
      this.connectionStatus.reconnectAttempts = 0
    } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
      this.connectionStatus.isConnected = false
      this.attemptReconnect()
    }

    this.updateConnectionStatus()
  }

  private removeSubscription(subscriptionId: string): void {
    const channel = this.channels.get(subscriptionId)
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(subscriptionId)
    }
    
    this.eventHandlers.delete(subscriptionId)
  }

  private updateConnectionStatus(): void {
    const wasConnected = this.connectionStatus.isConnected
    
    this.connectionStatus = {
      ...this.connectionStatus,
      subscriptions: Array.from(this.channels.keys()),
      lastHeartbeat: new Date()
    }

    // Notificar mudança de status se necessário
    if (wasConnected !== this.connectionStatus.isConnected) {
      this.notifyConnectionHandlers()
    }
  }

  private notifyConnectionHandlers(): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(this.getConnectionStatus())
      } catch (error) {
        console.error('Erro no handler de conexão:', error)
      }
    })
  }

  private notifyErrorHandlers(error: Error): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error)
      } catch (handlerError) {
        console.error('Erro no handler de erro:', handlerError)
      }
    })
  }

  private setupConnectionMonitoring(): void {
    // Heartbeat a cada 30 segundos
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.testLatency()
        this.connectionStatus.lastHeartbeat = new Date()
      } catch (error) {
        console.warn('Falha no heartbeat:', error)
        this.connectionStatus.isConnected = false
        this.updateConnectionStatus()
      }
    }, 30000)
  }

  private attemptReconnect(): void {
    if (this.connectionStatus.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de tentativas de reconexão atingido')
      return
    }

    this.connectionStatus.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.connectionStatus.reconnectAttempts - 1)

    console.log(`🔄 Tentativa de reconexão ${this.connectionStatus.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`)

    this.reconnectTimeout = setTimeout(() => {
      this.reconnect()
    }, delay)
  }

  /**
   * Cleanup ao destruir o serviço
   */
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    
    this.unsubscribeAll()
    this.connectionHandlers.clear()
    this.errorHandlers.clear()
  }
}

// Instância global do serviço de tempo real
export const realtimeService = new RealtimeService()