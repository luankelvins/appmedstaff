import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Hash,
  MessageCircle
} from 'lucide-react'
import { ChatMessage, ChatUser, ChatChannel, TypingIndicator } from '../../types/chat'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ChatWindowProps {
  conversation: ChatChannel | { id: string; name: string; type: 'direct'; participants: string[] } | null
  messages: ChatMessage[]
  users: ChatUser[]
  currentUserId: string
  typingUsers: TypingIndicator[]
  onSendMessage: (content: string, type?: 'text' | 'file' | 'image') => void
  onStartTyping: () => void
  onStopTyping: () => void
  loading?: boolean
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  users,
  currentUserId,
  typingUsers,
  onSendMessage,
  onStartTyping,
  onStopTyping,
  loading = false
}) => {
  const [messageText, setMessageText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<number>()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim())
      setMessageText('')
      handleStopTyping()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value)
    
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true)
      onStartTyping()
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 1000)
  }

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false)
      onStopTyping()
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId)
  }

  const getConversationTitle = () => {
    if (!conversation) return ''
    
    if ('members' in conversation) {
      // É um canal
      return conversation.name
    } else {
      // É uma conversa direta
      const otherUserId = conversation.participants.find(p => p !== currentUserId)
      const otherUser = getUserById(otherUserId || '')
      return otherUser?.name || 'Usuário'
    }
  }

  const getConversationSubtitle = () => {
    if (!conversation) return ''
    
    if ('members' in conversation) {
      // É um canal
      return `${conversation.members.length} membros`
    } else {
      // É uma conversa direta
      const otherUserId = conversation.participants.find(p => p !== currentUserId)
      const otherUser = getUserById(otherUserId || '')
      if (otherUser?.isOnline) {
        return 'Online'
      } else if (otherUser?.lastSeen) {
        return `Visto ${formatDistanceToNow(new Date(otherUser.lastSeen), { 
          addSuffix: true, 
          locale: ptBR 
        })}`
      }
      return 'Offline'
    }
  }

  const isConsecutiveMessage = (currentMsg: ChatMessage, prevMsg: ChatMessage | undefined) => {
    if (!prevMsg) return false
    
    const timeDiff = new Date(currentMsg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime()
    const isSameSender = currentMsg.senderId === prevMsg.senderId
    const isWithinTimeLimit = timeDiff < 5 * 60 * 1000 // 5 minutos
    
    return isSameSender && isWithinTimeLimit
  }

  const currentTypingUsers = typingUsers.filter(t => 
    t.conversationId === conversation?.id && t.userId !== currentUserId
  )

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione uma conversa
          </h3>
          <p className="text-gray-500">
            Escolha um canal ou inicie uma conversa direta para começar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="mr-3">
            {'members' in conversation ? (
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Hash className="w-5 h-5 text-blue-600" />
              </div>
            ) : (
              <div className="relative">
                {(() => {
                  const otherUserId = conversation.participants.find(p => p !== currentUserId)
                  const otherUser = getUserById(otherUserId || '')
                  return otherUser ? (
                    <>
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        otherUser.isOnline ? 'bg-green-400' : 'bg-gray-400'
                      }`} />
                    </>
                  ) : null
                })()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {getConversationTitle()}
            </h2>
            <p className="text-sm text-gray-500">
              {getConversationSubtitle()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!('members' in conversation) && (
            <>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Video className="w-5 h-5" />
              </button>
            </>
          )}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Info className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const sender = getUserById(message.senderId)
              const prevMessage = index > 0 ? messages[index - 1] : undefined
              const isConsecutive = isConsecutiveMessage(message, prevMessage)
              const isOwnMessage = message.senderId === currentUserId

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                    isConsecutive ? 'mt-1' : 'mt-4'
                  }`}
                >
                  <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isConsecutive && !isOwnMessage && (
                      <img
                        src={sender?.avatar}
                        alt={sender?.name}
                        className="w-8 h-8 rounded-full mr-3 flex-shrink-0"
                      />
                    )}
                    
                    <div className={`${isConsecutive && !isOwnMessage ? 'ml-11' : ''}`}>
                      {!isConsecutive && (
                        <div className={`flex items-center mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-sm font-medium text-gray-900">
                            {isOwnMessage ? 'Você' : sender?.name}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatDistanceToNow(new Date(message.timestamp), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                      )}
                      
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>

                      {isOwnMessage && message.readBy && message.readBy.length > 1 && (
                        <div className="flex justify-end mt-1">
                          <span className="text-xs text-gray-500">
                            Lida por {message.readBy.length - 1} pessoa(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Typing indicators */}
            {currentTypingUsers.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>
                  {currentTypingUsers.map(t => getUserById(t.userId)?.name).join(', ')} está digitando...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Mensagem para ${getConversationTitle()}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Smile className="w-5 h-5" />
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}