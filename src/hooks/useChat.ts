import { useState, useEffect, useCallback } from 'react'
import { chatService, ChatChannel, ChatMessage } from '../services/chatService'
import { useAuth } from '../contexts/AuthContext'

export interface UseChatReturn {
  channels: ChatChannel[]
  messages: ChatMessage[]
  loading: boolean
  activeChannel: string | null
  unreadCount: number
  sendMessage: (content: string, type?: 'text' | 'file' | 'image', replyTo?: string) => Promise<void>
  loadMessages: (channelId: string) => Promise<void>
  createChannel: (name: string, description: string, type: 'public' | 'private', members: string[]) => Promise<void>
  startDirectConversation: (userId: string) => Promise<void>
  setActiveChannel: (channelId: string | null) => void
  markAsRead: (channelId: string) => Promise<void>
  editMessage: (messageId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  refreshChannels: () => Promise<void>
}

export const useChat = (): UseChatReturn => {
  const { user } = useAuth()
  const [channels, setChannels] = useState<ChatChannel[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChannel, setActiveChannelState] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Carregar canais do usuário
  const refreshChannels = useCallback(async () => {
    if (!user?.id) return

    try {
      const userChannels = await chatService.getMyChannels(user.id)
      setChannels(userChannels)
      
      // Calcular total de mensagens não lidas
      const total = userChannels.reduce((sum, ch) => sum + (ch.unread_count || 0), 0)
      setUnreadCount(total)
    } catch (error) {
      console.error('Erro ao carregar canais:', error)
    }
  }, [user?.id])

  useEffect(() => {
    refreshChannels()
  }, [refreshChannels])

  // Carregar mensagens de um canal
  const loadMessages = useCallback(async (channelId: string) => {
    try {
      setLoading(true)
      const channelMessages = await chatService.getMessages(channelId, 100)
      setMessages(channelMessages)
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Enviar mensagem
  const sendMessage = useCallback(async (
    content: string,
    type: 'text' | 'file' | 'image' = 'text',
    replyTo?: string
  ) => {
    if (!user?.id || !activeChannel) return

    try {
      const message = await chatService.sendMessage(
        activeChannel,
        user.id,
        content,
        type,
        replyTo
      )

      if (message) {
        // Adicionar mensagem localmente (será atualizada pelo realtime)
        setMessages(prev => [...prev, message])
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      throw error
    }
  }, [user?.id, activeChannel])

  // Criar canal
  const createChannel = useCallback(async (
    name: string,
    description: string,
    type: 'public' | 'private',
    members: string[]
  ) => {
    if (!user?.id) return

    try {
      const channel = await chatService.createChannel(
        name,
        description,
        type,
        user.id,
        members
      )

      if (channel) {
        await refreshChannels()
        setActiveChannelState(channel.id)
      }
    } catch (error) {
      console.error('Erro ao criar canal:', error)
      throw error
    }
  }, [user?.id, refreshChannels])

  // Iniciar conversa direta
  const startDirectConversation = useCallback(async (userId: string) => {
    if (!user?.id) return

    try {
      const channel = await chatService.startDirectConversation(user.id, userId)

      if (channel) {
        await refreshChannels()
        setActiveChannelState(channel.id)
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error)
      throw error
    }
  }, [user?.id, refreshChannels])

  // Marcar como lido
  const markAsRead = useCallback(async (channelId: string) => {
    if (!user?.id) return

    try {
      await chatService.markAsRead(user.id, channelId)
      await refreshChannels()
    } catch (error) {
      console.error('Erro ao marcar como lido:', error)
    }
  }, [user?.id, refreshChannels])

  // Editar mensagem
  const editMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const success = await chatService.editMessage(messageId, content)
      if (success && activeChannel) {
        await loadMessages(activeChannel)
      }
    } catch (error) {
      console.error('Erro ao editar mensagem:', error)
      throw error
    }
  }, [activeChannel, loadMessages])

  // Deletar mensagem
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const success = await chatService.deleteMessage(messageId)
      if (success && activeChannel) {
        await loadMessages(activeChannel)
      }
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error)
      throw error
    }
  }, [activeChannel, loadMessages])

  // Definir canal ativo
  const setActiveChannel = useCallback((channelId: string | null) => {
    setActiveChannelState(channelId)
    if (channelId) {
      loadMessages(channelId)
    }
  }, [loadMessages])

  // Subscrever a mensagens em tempo real
  useEffect(() => {
    if (!activeChannel) return

    const unsubscribe = chatService.subscribeToMessages(
      activeChannel,
      (message) => {
        setMessages(prev => {
          // Evitar duplicatas
          if (prev.find(m => m.id === message.id)) {
            return prev
          }
          return [...prev, message]
        })
      }
    )

    return () => {
      unsubscribe()
    }
  }, [activeChannel])

  // Marcar como lido quando abrir canal
  useEffect(() => {
    if (activeChannel && user?.id) {
      markAsRead(activeChannel)
    }
  }, [activeChannel, user?.id, markAsRead])

  return {
    channels,
    messages,
    loading,
    activeChannel,
    unreadCount,
    sendMessage,
    loadMessages,
    createChannel,
    startDirectConversation,
    setActiveChannel,
    markAsRead,
    editMessage,
    deleteMessage,
    refreshChannels
  }
}


