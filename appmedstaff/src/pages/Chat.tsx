import React, { useState, useEffect } from 'react'
import { usePermissions } from '../hooks/usePermissions'
import { useChat } from '../services/chatService'
import { ChatSidebar } from '../components/Chat/ChatSidebar'
import { ChatWindow } from '../components/Chat/ChatWindow'
import { ChatChannel, ChatConversation } from '../types/chat'

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
    markAsRead,
    startTyping,
    stopTyping
  } = useChat()

  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [activeConversationType, setActiveConversationType] = useState<'channel' | 'direct' | null>(null)
  const [showCreateChannel, setShowCreateChannel] = useState(false)

  // ID do usuário atual (em uma implementação real, viria do contexto de autenticação)
  const currentUserId = 'user1'

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation)
      markAsRead(activeConversation, currentUserId)
    }
  }, [activeConversation, loadMessages, markAsRead, currentUserId])

  const handleSelectConversation = (id: string, type: 'channel' | 'direct') => {
    setActiveConversation(id)
    setActiveConversationType(type)
  }

  const handleSendMessage = async (content: string, type: 'text' | 'file' | 'image' = 'text') => {
    if (!activeConversation || !activeConversationType) return

    try {
      if (activeConversationType === 'channel') {
        await sendMessage({
          content,
          senderId: currentUserId,
          channelId: activeConversation,
          type,
          readBy: [currentUserId]
        })
      } else {
        // Para mensagens diretas, encontrar o destinatário
        const conversation = conversations.find(c => c.id === activeConversation)
        const receiverId = conversation?.participants.find(p => p !== currentUserId)
        
        if (receiverId) {
          await sendMessage({
            content,
            senderId: currentUserId,
            receiverId,
            type,
            readBy: [currentUserId]
          })
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const handleStartDirectMessage = (userId: string) => {
    // Verificar se já existe uma conversa com este usuário
    const existingConversation = conversations.find(c => 
      c.participants.includes(currentUserId) && c.participants.includes(userId)
    )

    if (existingConversation) {
      handleSelectConversation(existingConversation.id, 'direct')
    } else {
      // Criar nova conversa (em uma implementação real, seria uma chamada à API)
      const newConversationId = `conv_${Date.now()}`
      handleSelectConversation(newConversationId, 'direct')
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

  const getCurrentConversation = (): ChatChannel | { id: string; name: string; type: 'direct'; participants: string[] } | null => {
    if (!activeConversation || !activeConversationType) return null

    if (activeConversationType === 'channel') {
      return channels.find(c => c.id === activeConversation) || null
    } else {
      const conversation = conversations.find(c => c.id === activeConversation)
      if (conversation) {
        const otherUserId = conversation.participants.find(p => p !== currentUserId)
        const otherUser = users.find(u => u.id === otherUserId)
        
        return {
          id: conversation.id,
          name: otherUser?.name || 'Usuário',
          type: 'direct',
          participants: conversation.participants
        }
      }
      
      // Para novas conversas diretas
      if (activeConversation.startsWith('conv_')) {
        return {
          id: activeConversation,
          name: 'Nova Conversa',
          type: 'direct',
          participants: [currentUserId]
        }
      }
    }

    return null
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
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
        onCreateChannel={() => setShowCreateChannel(true)}
        onStartDirectMessage={handleStartDirectMessage}
      />
      
      <ChatWindow
        conversation={getCurrentConversation()}
        messages={messages}
        users={users}
        currentUserId={currentUserId}
        typingUsers={typingUsers}
        onSendMessage={handleSendMessage}
        onStartTyping={handleStartTyping}
        onStopTyping={handleStopTyping}
        loading={loading}
      />

      {/* Modal para criar canal (implementar depois) */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Criar Novo Canal</h3>
            <p className="text-gray-600 mb-4">
              Funcionalidade em desenvolvimento...
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateChannel(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}