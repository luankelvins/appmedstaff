import React from 'react'
import { usePermissions } from '../hooks/usePermissions'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../contexts/AuthContext'
import { ChatSidebar } from '../components/Chat/ChatSidebar'
import { ChatWindow } from '../components/Chat/ChatWindow'
import { MessageSquare } from 'lucide-react'

export const ChatReal: React.FC = () => {
  const { hasPermission } = usePermissions()
  const { user } = useAuth()
  const {
    channels,
    messages,
    loading,
    activeChannel,
    sendMessage,
    setActiveChannel,
    createChannel,
    startDirectConversation
  } = useChat()

  // Verificar permissões
  if (!hasPermission('chat.view')) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
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

  // Encontrar canal ativo
  const currentChannel = channels.find(ch => ch.id === activeChannel)

  // Buscar informações dos usuários (mock por enquanto - pode ser melhorado)
  const users = [
    { id: user?.id || '', name: user?.name || 'Você', avatar: user?.avatar, status: 'online' as const },
    // Outros usuários podem vir do employeeService ou profileService
  ]

  const handleSelectConversation = (conversationId: string) => {
    setActiveChannel(conversationId)
  }

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const handleCreateChannel = async (
    name: string,
    description: string,
    type: 'public' | 'private',
    members: string[]
  ) => {
    try {
      await createChannel(name, description, type, members)
    } catch (error) {
      console.error('Erro ao criar canal:', error)
    }
  }

  const handleStartDirectMessage = async (userId: string) => {
    try {
      await startDirectConversation(userId)
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error)
    }
  }

  // Converter ChatChannel para ChatConversation (compatibilidade com componentes existentes)
  const currentConversation = currentChannel ? {
    id: currentChannel.id,
    participants: [], // TODO: buscar membros reais
    type: currentChannel.type === 'direct' ? 'direct' as const : 'group' as const,
    name: currentChannel.name,
    description: currentChannel.description,
    avatar: undefined,
    createdAt: currentChannel.created_at,
    lastMessage: messages[messages.length - 1]
  } : null

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      <ChatSidebar
        channels={channels.filter(ch => ch.type !== 'direct').map(ch => ({
          id: ch.id,
          name: ch.name,
          description: ch.description,
          type: ch.type as 'public' | 'private',
          members: [], // TODO: buscar membros
          unreadCount: ch.unread_count || 0,
          lastMessage: messages.filter(m => m.channel_id === ch.id).pop()
        }))}
        conversations={channels.filter(ch => ch.type === 'direct').map(ch => ({
          id: ch.id,
          participants: [], // TODO: buscar participantes
          type: 'direct' as const,
          name: ch.name,
          lastMessage: messages.filter(m => m.channel_id === ch.id).pop(),
          unreadCount: ch.unread_count || 0
        }))}
        users={users}
        currentUserId={user?.id || ''}
        activeConversation={activeChannel}
        onSelectConversation={handleSelectConversation}
        onCreateChannel={handleCreateChannel}
        onStartDirectMessage={handleStartDirectMessage}
      />
      
      <ChatWindow
        conversation={currentConversation}
        messages={messages.map(msg => ({
          id: msg.id,
          senderId: msg.user_id,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          type: msg.type as 'text' | 'file' | 'image',
          status: 'sent' as const,
          isEdited: msg.is_edited,
          replyTo: msg.reply_to
        }))}
        users={users}
        currentUserId={user?.id || ''}
        typingIndicators={[]} // TODO: implementar indicadores de digitação
        onSendMessage={handleSendMessage}
      />
    </div>
  )
}

export default ChatReal


