import React, { useState, useEffect } from 'react'
import { usePermissions } from '../hooks/usePermissions'
import { useChat } from '../utils/chatService'
import { ChatSidebar } from '../components/Chat/ChatSidebar'
import { ChatWindow } from '../components/Chat/ChatWindow'
import { ChatChannel, ChatConversation, ChatAttachment } from '../types/chat'

export const Chat: React.FC = () => {
  const { hasPermission } = usePermissions()
  const {
    users,
    channels,
    conversations,
    messages,
    loading,
    typingUsers,
    loadMessages,
    sendMessage,
    startTyping,
    stopTyping
  } = useChat()

  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [activeConversationType, setActiveConversationType] = useState<'channel' | 'conversation' | null>(null)

  // ID do usuário atual (em um app real, viria do contexto de autenticação)
  const currentUserId = 'user1'

  const handleSelectConversation = (conversationId: string, type: 'channel' | 'conversation') => {
    setActiveConversation(conversationId)
    setActiveConversationType(type)
    loadMessages(conversationId)
  }

  const handleSendMessage = async (content: string, attachments?: ChatAttachment[]) => {
    if (!activeConversation || !activeConversationType) return

    const messageData = {
      content,
      senderId: currentUserId,
      type: 'text' as const,
      attachments,
      ...(activeConversationType === 'channel' 
        ? { channelId: activeConversation }
        : { receiverId: getOtherParticipant() }
      )
    }

    try {
      await sendMessage(messageData)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const handleStartDirectMessage = (userId: string) => {
    // Procurar conversa existente ou criar uma nova
    const existingConversation = conversations.find(conv => 
      conv.participants.includes(userId) && conv.participants.includes(currentUserId)
    )

    if (existingConversation) {
      handleSelectConversation(existingConversation.id, 'conversation')
    } else {
      // Em um app real, criaria uma nova conversa
      console.log('Criar nova conversa com:', userId)
    }
  }

  const handleStartTyping = () => {
    if (activeConversation) {
      startTyping(currentUserId, activeConversation)
    }
  }

  const handleStopTyping = () => {
    if (activeConversation) {
      stopTyping(currentUserId, activeConversation)
    }
  }

  const getOtherParticipant = () => {
    if (activeConversationType !== 'conversation') return undefined
    
    const conversation = conversations.find(c => c.id === activeConversation)
    return conversation?.participants.find(p => p !== currentUserId)
  }

  const getCurrentConversation = (): ChatConversation | null => {
    if (!activeConversation || !activeConversationType) return null

    if (activeConversationType === 'channel') {
      // Converter ChatChannel para ChatConversation
      const channel = channels.find(c => c.id === activeConversation)
      if (channel) {
        return {
          id: channel.id,
          participants: channel.members,
          type: 'group',
          name: channel.name,
          lastMessage: channel.lastMessage,
          unreadCount: channel.unreadCount,
          createdAt: channel.createdAt,
          updatedAt: channel.createdAt
        }
      }
      return null
    } else {
      return conversations.find(c => c.id === activeConversation) || null
    }
  }

  // Verificar permissões
  if (!hasPermission('chat.view')) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar o chat interno.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-gray-50">
      <ChatSidebar
        channels={channels}
        conversations={conversations}
        users={users}
        currentUserId={currentUserId}
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
        onCreateChannel={(name: string, description: string, type: 'public' | 'private', members: string[]) => {
          // Em um app real, criaria o canal através do serviço
          console.log('Criar canal:', { name, description, type, members })
          // setShowCreateChannel(true) // Removido pois agora usamos o modal integrado
        }}
        onStartDirectMessage={handleStartDirectMessage}
      />
      
      <ChatWindow
        conversation={getCurrentConversation()}
        messages={messages}
        users={users}
        currentUserId={currentUserId}
        typingIndicators={typingUsers}
        onSendMessage={handleSendMessage}
      />


    </div>
  )
}