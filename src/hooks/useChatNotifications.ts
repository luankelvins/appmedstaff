import { useState, useEffect, useCallback } from 'react'
import { chatService } from '../services/chatService'
import { chatNotificationService } from '../services/chatNotificationService'
import { ChatMessage, ChatUser } from '../types/chat'
import { WebSocketEvent } from '../services/websocketService'

interface ChatNotificationState {
  unreadCount: number
  lastMessage: ChatMessage | null
  hasNewMessages: boolean
}

// Simulação de chatManager para subscrição (já que não está exportado)
class ChatNotificationManager {
  private listeners: ((event: WebSocketEvent) => void)[] = []

  subscribe(callback: (event: WebSocketEvent) => void) {
    this.listeners.push(callback)
    
    // Simular eventos de mensagem para demonstração
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% de chance de nova mensagem
        const mockMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          content: 'Nova mensagem de teste',
          senderId: 'user2',
          channelId: 'channel1',
          type: 'text',
          timestamp: new Date().toISOString(),
          readBy: []
        }
        
        this.listeners.forEach(listener => {
          listener({
            type: 'message',
            data: mockMessage,
            timestamp: new Date().toISOString()
          })
        })
      }
    }, 10000) // A cada 10 segundos

    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
      clearInterval(interval)
    }
  }
}

const chatNotificationManager = new ChatNotificationManager()

export const useChatNotifications = () => {
  const [notificationState, setNotificationState] = useState<ChatNotificationState>({
    unreadCount: 0,
    lastMessage: null,
    hasNewMessages: false
  })

  // Carregar contagem inicial de mensagens não lidas
  const loadUnreadCount = useCallback(async () => {
    try {
      const stats = await chatService.getStats()
      setNotificationState(prev => ({
        ...prev,
        unreadCount: stats.unreadMessages
      }))
    } catch (error) {
      console.error('Erro ao carregar contagem de mensagens não lidas:', error)
    }
  }, [])

  // Marcar todas as mensagens como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      // Aqui você implementaria a lógica para marcar todas as mensagens como lidas
      // Por enquanto, vamos apenas resetar o estado local
      setNotificationState(prev => ({
        ...prev,
        unreadCount: 0,
        hasNewMessages: false
      }))
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error)
    }
  }, [])

  // Solicitar permissão para notificações
  const requestNotificationPermission = useCallback(async () => {
    return await chatNotificationService.requestPermission()
  }, [])

  // Efeito para escutar novas mensagens
  useEffect(() => {
    // Carregar contagem inicial
    loadUnreadCount()

    // Subscrever aos eventos de chat
    const unsubscribe = chatNotificationManager.subscribe((event: WebSocketEvent) => {
      switch (event.type) {
        case 'message':
          const message = event.data as ChatMessage
          
          // Atualizar estado de notificação
          setNotificationState(prev => ({
            unreadCount: prev.unreadCount + 1,
            lastMessage: message,
            hasNewMessages: true
          }))

          // Mostrar notificação do sistema se necessário
          if (message.senderId !== 'current-user-id') { // Substitua pela lógica real de usuário atual
            const sender: ChatUser = {
              id: message.senderId,
              name: 'Usuário',
              avatar: '',
              role: 'Usuário',
              department: 'Geral',
              isOnline: true,
              lastSeen: new Date().toISOString()
            }
            
            chatNotificationService.showMessageNotification(
              message,
              sender,
              'Chat Interno'
            )
          }
          break

        case 'read':
          // Recarregar contagem quando mensagens são marcadas como lidas
          loadUnreadCount()
          break
      }
    })

    return unsubscribe
  }, [loadUnreadCount])

  return {
    unreadCount: notificationState.unreadCount,
    lastMessage: notificationState.lastMessage,
    hasNewMessages: notificationState.hasNewMessages,
    markAllAsRead,
    requestNotificationPermission,
    refreshUnreadCount: loadUnreadCount
  }
}