import { ChatMessage, TypingIndicator, ChatNotification } from '../types/chat'

export interface WebSocketEvent {
  type: 'message' | 'typing_start' | 'typing_stop' | 'user_status' | 'read' | 'notification'
  data: any
  timestamp: string
}

export interface WebSocketMessage {
  id: string
  type: string
  payload: any
  timestamp: string
}

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, ((event: WebSocketEvent) => void)[]> = new Map()
  private isConnecting = false
  private messageQueue: WebSocketMessage[] = []
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(private url: string = 'ws://localhost:8080/chat') {
    // Não conectar automaticamente - apenas quando explicitamente solicitado
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        return
      }

      this.isConnecting = true

      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket conectado')
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.processMessageQueue()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketEvent = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket desconectado:', event.code, event.reason)
          this.isConnecting = false
          this.stopHeartbeat()
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.warn('WebSocket não disponível - funcionalidade em tempo real desabilitada')
          this.isConnecting = false
          reject(new Error('WebSocket connection failed'))
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  disconnect(): void {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close(1000, 'Desconexão intencional')
      this.ws = null
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Tentando reconectar em ${delay}ms (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.connect().catch(console.error)
    }, delay)
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', {})
      }
    }, 30000) // Ping a cada 30 segundos
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()
      if (message) {
        this.ws.send(JSON.stringify(message))
      }
    }
  }

  private handleMessage(event: WebSocketEvent): void {
    const eventListeners = this.listeners.get(event.type) || []
    const globalListeners = this.listeners.get('*') || []
    
    const allEventListeners = [...eventListeners, ...globalListeners]
    allEventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Erro ao executar listener:', error)
      }
    })
  }

  send(type: string, payload: any): void {
    const message: WebSocketMessage = {
      id: this.generateId(),
      type,
      payload,
      timestamp: new Date().toISOString()
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      // Adiciona à fila se não estiver conectado
      this.messageQueue.push(message)
      
      // Tenta conectar se não estiver conectado
      if (!this.isConnecting && (!this.ws || this.ws.readyState === WebSocket.CLOSED)) {
        this.connect().catch(console.error)
      }
    }
  }

  // Métodos específicos do chat
  sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    this.send('send_message', message)
  }

  startTyping(userId: string, conversationId: string): void {
    this.send('typing_start', { userId, conversationId })
  }

  stopTyping(userId: string, conversationId: string): void {
    this.send('typing_stop', { userId, conversationId })
  }

  markAsRead(conversationId: string, userId: string, messageIds: string[]): void {
    this.send('mark_read', { conversationId, userId, messageIds })
  }

  updateUserStatus(userId: string, isOnline: boolean): void {
    this.send('user_status', { userId, isOnline })
  }

  joinRoom(roomId: string): void {
    this.send('join_room', { roomId })
  }

  leaveRoom(roomId: string): void {
    this.send('leave_room', { roomId })
  }

  // Sistema de eventos
  on(eventType: string, listener: (event: WebSocketEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    
    this.listeners.get(eventType)!.push(listener)
    
    // Retorna função para remover o listener
    return () => {
      const listeners = this.listeners.get(eventType)
      if (listeners) {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }

  off(eventType: string, listener?: (event: WebSocketEvent) => void): void {
    if (!listener) {
      this.listeners.delete(eventType)
      return
    }

    const listeners = this.listeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'closing'
      case WebSocket.CLOSED: return 'disconnected'
      default: return 'unknown'
    }
  }
}

// Instância singleton
export const websocketService = new WebSocketService()

// Removido auto-conectar para evitar erros quando não há servidor WebSocket
// if (typeof window !== 'undefined') {
//   websocketService.connect().catch(console.error)
// }

export default websocketService