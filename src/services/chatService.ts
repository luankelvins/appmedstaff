import { useState, useEffect, useCallback } from 'react'
import { 
  ChatUser, 
  ChatMessage, 
  ChatChannel, 
  ChatConversation, 
  ChatFilter, 
  ChatStats,
  TypingIndicator,
  ChatNotification
} from '../types/chat'
import { websocketService, WebSocketEvent } from './websocketService'
import { chatNotificationService } from './chatNotificationService'

// Mock data para demonstração
const mockUsers: ChatUser[] = [
  {
    id: 'user1',
    name: 'João Silva',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    role: 'Gerente Comercial',
    department: 'Comercial',
    isOnline: true
  },
  {
    id: 'user2',
    name: 'Maria Santos',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
    role: 'Analista Financeiro',
    department: 'Financeiro',
    isOnline: true
  },
  {
    id: 'user3',
    name: 'Pedro Costa',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    role: 'Analista Operacional',
    department: 'Operacional',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'user4',
    name: 'Ana Oliveira',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
    role: 'Analista RH',
    department: 'RH',
    isOnline: true
  }
]

const mockChannels: ChatChannel[] = [
  {
    id: 'channel1',
    name: 'Geral',
    description: 'Canal geral da empresa',
    type: 'public',
    members: ['user1', 'user2', 'user3', 'user4'],
    admins: ['user1'],
    createdBy: 'user1',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    unreadCount: 2
  },
  {
    id: 'channel2',
    name: 'Comercial',
    description: 'Discussões da equipe comercial',
    type: 'private',
    members: ['user1', 'user2'],
    admins: ['user1'],
    createdBy: 'user1',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    unreadCount: 0
  },
  {
    id: 'channel3',
    name: 'Financeiro',
    description: 'Assuntos financeiros',
    type: 'private',
    members: ['user1', 'user2', 'user4'],
    admins: ['user2'],
    createdBy: 'user2',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    unreadCount: 1
  }
]

const mockMessages: ChatMessage[] = [
  {
    id: 'msg1',
    content: 'Bom dia pessoal! Como estão os números de hoje?',
    senderId: 'user1',
    channelId: 'channel1',
    type: 'text',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    readBy: ['user1', 'user2']
  },
  {
    id: 'msg2',
    content: 'Oi João! Os números estão bons, vou enviar o relatório em breve.',
    senderId: 'user2',
    channelId: 'channel1',
    type: 'text',
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    readBy: ['user1', 'user2']
  },
  {
    id: 'msg3',
    content: 'Perfeito! Obrigado Maria.',
    senderId: 'user1',
    channelId: 'channel1',
    type: 'text',
    timestamp: new Date(Date.now() - 2700000).toISOString(),
    readBy: ['user1']
  },
  {
    id: 'msg4',
    content: 'Oi Maria, você pode me ajudar com uma dúvida sobre o relatório?',
    senderId: 'user1',
    receiverId: 'user2',
    type: 'text',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    readBy: ['user1']
  },
  {
    id: 'msg5',
    content: 'Claro! Qual é a dúvida?',
    senderId: 'user2',
    receiverId: 'user1',
    type: 'text',
    timestamp: new Date(Date.now() - 1500000).toISOString(),
    readBy: ['user2']
  }
]

const mockConversations: ChatConversation[] = [
  {
    id: 'conv1',
    participants: ['user1', 'user2'],
    type: 'direct',
    unreadCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1500000).toISOString(),
    lastMessage: mockMessages.find(m => m.id === 'msg5')
  },
  {
    id: 'conv2',
    participants: ['user1', 'user3'],
    type: 'direct',
    unreadCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
]

// Gerenciador de chat com WebSocket
class ChatManager {
  private listeners: ((event: WebSocketEvent) => void)[] = []
  private typingUsers: Map<string, TypingIndicator> = new Map()
  private unsubscribeWebSocket: (() => void) | null = null

  constructor() {
    this.initializeWebSocket()
  }

  private initializeWebSocket() {
    // Conecta aos eventos do WebSocket
    this.unsubscribeWebSocket = websocketService.on('*', (event) => {
      this.handleWebSocketEvent(event)
    })
  }

  private handleWebSocketEvent(event: WebSocketEvent) {
    // Processa eventos específicos
    switch (event.type) {
      case 'message':
        this.handleNewMessage(event.data)
        this.notifyListeners(event)
        break
      case 'typing_start':
        this.handleTypingStart(event.data)
        break
      case 'typing_stop':
        this.handleTypingStop(event.data)
        break
      case 'user_status':
      case 'read':
        this.notifyListeners(event)
        break
    }
  }

  private handleNewMessage(message: ChatMessage) {
    // Encontrar o remetente
    const sender = mockUsers.find(user => user.id === message.senderId)
    if (!sender) return

    // Determinar o nome da conversa
    let conversationName = 'Chat'
    
    if (message.channelId) {
      const channel = mockChannels.find(ch => ch.id === message.channelId)
      conversationName = channel?.name || 'Canal'
    } else if (message.receiverId) {
      conversationName = `Conversa com ${sender.name}`
    }

    // Mostrar notificação
    chatNotificationService.showMessageNotification(message, sender, conversationName)
  }

  private handleTypingStart(data: { userId: string; conversationId: string }) {
    const indicator: TypingIndicator = {
      userId: data.userId,
      conversationId: data.conversationId,
      timestamp: new Date().toISOString()
    }

    this.typingUsers.set(`${data.userId}_${data.conversationId}`, indicator)
    this.notifyListeners({ type: 'typing_start', data: indicator, timestamp: new Date().toISOString() })
  }

  private handleTypingStop(data: { userId: string; conversationId: string }) {
    const key = `${data.userId}_${data.conversationId}`
    if (this.typingUsers.has(key)) {
      this.typingUsers.delete(key)
      this.notifyListeners({ type: 'typing_stop', data, timestamp: new Date().toISOString() })
    }
  }

  private notifyListeners(event: WebSocketEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Erro ao notificar listener:', error)
      }
    })
  }

  subscribe(callback: (event: WebSocketEvent) => void) {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) this.listeners.splice(index, 1)
    }
  }

  sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      readBy: [message.senderId]
    }

    mockMessages.push(newMessage)
    
    // Atualizar última mensagem da conversa/canal
    if (message.channelId) {
      const channel = mockChannels.find(c => c.id === message.channelId)
      if (channel) {
        channel.lastMessage = newMessage
        // Incrementar contador de não lidas para outros usuários
        channel.members.forEach(memberId => {
          if (memberId !== message.senderId) {
            channel.unreadCount = (channel.unreadCount || 0) + 1
          }
        })
      }
    } else if (message.receiverId) {
      const conversation = mockConversations.find(c => 
        c.participants.includes(message.senderId) && 
        c.participants.includes(message.receiverId!)
      )
      if (conversation) {
        conversation.lastMessage = newMessage
        conversation.updatedAt = newMessage.timestamp
        conversation.unreadCount = (conversation.unreadCount || 0) + 1
      }
    }

    // Envia via WebSocket
    websocketService.sendMessage(message)

    return newMessage
  }

  markAsRead(conversationId: string, userId: string) {
    const messages = mockMessages.filter(m => 
      m.channelId === conversationId || 
      (m.receiverId === userId && m.senderId !== userId) ||
      (m.senderId === userId && m.receiverId !== userId)
    )

    messages.forEach(message => {
      if (!message.readBy?.includes(userId)) {
        message.readBy = [...(message.readBy || []), userId]
      }
    })

    // Resetar contador de não lidas
    const channel = mockChannels.find(c => c.id === conversationId)
    if (channel) {
      channel.unreadCount = 0
    }

    const conversation = mockConversations.find(c => c.id === conversationId)
    if (conversation) {
      conversation.unreadCount = 0
    }

    websocketService.markAsRead(conversationId, userId, [])
  }

  startTyping(userId: string, conversationId: string) {
    websocketService.startTyping(userId, conversationId)
  }

  stopTyping(userId: string, conversationId: string) {
    websocketService.stopTyping(userId, conversationId)
  }

  updateUserStatus(userId: string, isOnline: boolean) {
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      user.isOnline = isOnline
      if (!isOnline) {
        user.lastSeen = new Date().toISOString()
      }

      websocketService.updateUserStatus(userId, isOnline)
    }
  }

  joinRoom(roomId: string) {
    websocketService.joinRoom(roomId)
  }

  leaveRoom(roomId: string) {
    websocketService.leaveRoom(roomId)
  }

  disconnect() {
    if (this.unsubscribeWebSocket) {
      this.unsubscribeWebSocket()
      this.unsubscribeWebSocket = null
    }
  }
}

const chatManager = new ChatManager()

// Serviços de API
export const chatService = {
  async getUsers(): Promise<ChatUser[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...mockUsers]
  },

  async getChannels(): Promise<ChatChannel[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...mockChannels]
  },

  async getConversations(): Promise<ChatConversation[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...mockConversations]
  },

  async getMessages(conversationId: string, limit = 50): Promise<ChatMessage[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const messages = mockMessages.filter(m => 
      m.channelId === conversationId || 
      (m.receiverId && (m.senderId === conversationId || m.receiverId === conversationId))
    )

    return messages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-limit)
  },

  async sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return chatManager.sendMessage(message)
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))
    chatManager.markAsRead(conversationId, userId)
  },

  async createChannel(channel: Omit<ChatChannel, 'id' | 'createdAt'>): Promise<ChatChannel> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const newChannel: ChatChannel = {
      ...channel,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      unreadCount: 0
    }

    mockChannels.push(newChannel)
    return newChannel
  },

  async joinChannel(channelId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const channel = mockChannels.find(c => c.id === channelId)
    if (channel && !channel.members.includes(userId)) {
      channel.members.push(userId)
    }
  },

  async leaveChannel(channelId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const channel = mockChannels.find(c => c.id === channelId)
    if (channel) {
      channel.members = channel.members.filter(id => id !== userId)
    }
  },

  async getStats(): Promise<ChatStats> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const totalMessages = mockMessages.length
    const totalConversations = mockConversations.length
    const totalChannels = mockChannels.length
    const onlineUsers = mockUsers.filter(u => u.isOnline).length
    const unreadMessages = mockChannels.reduce((sum, c) => sum + (c.unreadCount || 0), 0) +
                          mockConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)

    return {
      totalMessages,
      totalConversations,
      totalChannels,
      onlineUsers,
      unreadMessages
    }
  }
}

// Hook para gerenciar chat
export const useChat = () => {
  const [users, setUsers] = useState<ChatUser[]>([])
  const [channels, setChannels] = useState<ChatChannel[]>([])
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [stats, setStats] = useState<ChatStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([])

  const loadUsers = useCallback(async () => {
    try {
      const data = await chatService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }, [])

  const loadChannels = useCallback(async () => {
    try {
      const data = await chatService.getChannels()
      setChannels(data)
    } catch (error) {
      console.error('Erro ao carregar canais:', error)
    }
  }, [])

  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations()
      setConversations(data)
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoading(true)
    try {
      const data = await chatService.getMessages(conversationId)
      setMessages(data)
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    try {
      const newMessage = await chatService.sendMessage(message)
      setMessages(prev => [...prev, newMessage])
      return newMessage
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      throw error
    }
  }, [])

  const markAsRead = useCallback(async (conversationId: string, userId: string) => {
    try {
      await chatService.markAsRead(conversationId, userId)
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const data = await chatService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }, [])

  // Subscrição para eventos em tempo real
  useEffect(() => {
    const unsubscribe = chatManager.subscribe((event) => {
      switch (event.type) {
        case 'message':
          setMessages(prev => [...prev, event.data])
          loadChannels()
          loadConversations()
          loadStats()
          break
        case 'read':
          setMessages(prev => 
            prev.map(m => ({
              ...m,
              readBy: m.readBy?.includes(event.data.userId) 
                ? m.readBy 
                : [...(m.readBy || []), event.data.userId]
            }))
          )
          break
        case 'typing_start':
          setTypingUsers(prev => [...prev.filter(t => 
            !(t.userId === event.data.userId && t.conversationId === event.data.conversationId)
          ), event.data])
          break
        case 'typing_stop':
          setTypingUsers(prev => prev.filter(t => 
            !(t.userId === event.data.userId && t.conversationId === event.data.conversationId)
          ))
          break
        case 'user_status':
          setUsers(prev => prev.map(u => 
            u.id === event.data.userId 
              ? { ...u, isOnline: event.data.isOnline }
              : u
          ))
          break
      }
    })

    return unsubscribe
  }, [loadChannels, loadConversations, loadStats])

  useEffect(() => {
    loadUsers()
    loadChannels()
    loadConversations()
    loadStats()
  }, [loadUsers, loadChannels, loadConversations, loadStats])

  return {
    users,
    channels,
    conversations,
    messages,
    stats,
    loading,
    typingUsers,
    loadMessages,
    sendMessage,
    markAsRead,
    startTyping: chatManager.startTyping.bind(chatManager),
    stopTyping: chatManager.stopTyping.bind(chatManager)
  }
}