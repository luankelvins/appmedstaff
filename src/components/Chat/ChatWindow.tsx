import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Image,
  File,
  X,
  Download,
  Reply,
  Edit,
  Trash2,
  Copy,
  Heart,
  ThumbsUp,
  Laugh,
  MessageCircle
} from 'lucide-react'
import { ChatConversation, ChatMessage, ChatUser, TypingIndicator, ChatAttachment } from '../../types/chat'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useWebSocket } from '../../hooks/useWebSocket'
import { EmojiPicker } from './EmojiPicker'
import { ChatInfoPanel } from './ChatInfoPanel'
import { ChatOptionsMenu } from './ChatOptionsMenu'
import { CallModal } from './CallModal'

interface ChatWindowProps {
  conversation: ChatConversation | null
  messages: ChatMessage[]
  users: ChatUser[]
  currentUserId: string
  typingIndicators: TypingIndicator[]
  onSendMessage: (content: string, attachments?: ChatAttachment[]) => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  users,
  currentUserId,
  onSendMessage,
  typingIndicators = []
}) => {
  const [messageText, setMessageText] = useState('')
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showChatInfo, setShowChatInfo] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const [callType, setCallType] = useState<'voice' | 'video'>('voice')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { websocketService } = useWebSocket()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }, [conversation])

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        if (conversation) {
          websocketService.stopTyping(currentUserId, conversation.id)
        }
      }
    }
  }, [conversation, currentUserId, websocketService])

  const handleSendMessage = () => {
    if (messageText.trim() || attachments.length > 0) {
      onSendMessage(messageText.trim(), attachments)
      setMessageText('')
      setAttachments([])
      if (conversation) {
        websocketService.stopTyping(currentUserId, conversation.id)
        setIsTyping(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (editingMessageId) {
        handleSaveEdit()
      } else {
        handleSendMessage()
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (editingMessageId) {
      setEditingText(value)
    } else {
      setMessageText(value)
      
      // Indicador de digitação via WebSocket
      if (value.trim() && !isTyping && conversation) {
        setIsTyping(true)
        websocketService.startTyping(currentUserId, conversation.id)
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        if (conversation) {
          websocketService.stopTyping(currentUserId, conversation.id)
        }
        typingTimeoutRef.current = null
      }, 1000)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    
    // Simulate file upload
    setTimeout(() => {
      const newAttachments: ChatAttachment[] = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }))
      
      setAttachments(prev => [...prev, ...newAttachments])
      setIsUploading(false)
    }, 1000)
  }

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId))
  }

  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId)
    setEditingText(currentContent)
    setSelectedMessage(null)
  }

  const handleSaveEdit = () => {
    if (editingMessageId && editingText.trim()) {
      // TODO: Implementar edição de mensagem via WebSocket
      console.log('Editando mensagem:', editingMessageId, editingText.trim())
    }
    setEditingMessageId(null)
    setEditingText('')
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingText('')
  }

  const handleReactToMessage = (messageId: string, emoji: string) => {
    // TODO: Implementar reação via WebSocket
    console.log('Reagindo à mensagem:', messageId, emoji)
    setSelectedMessage(null)
  }

  const handleDeleteMessage = (messageId: string) => {
    // TODO: Implementar exclusão via WebSocket
    console.log('Excluindo mensagem:', messageId)
    setSelectedMessage(null)
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessageText(prev => prev + emoji)
    messageInputRef.current?.focus()
  }

  const handleStartCall = (type: 'voice' | 'video') => {
    setCallType(type)
    setShowCallModal(true)
    console.log(`Iniciando chamada de ${type}`)
  }

  const handleShowChatInfo = () => {
    setShowChatInfo(true)
  }

  const handleShowOptionsMenu = () => {
    setShowOptionsMenu(true)
  }

  // Funções do menu de opções
  const handleSearchMessages = () => {
    console.log('Buscar mensagens')
  }

  const handleToggleNotifications = () => {
    console.log('Alternar notificações')
  }

  const handleTogglePin = () => {
    console.log('Alternar fixação')
  }

  const handleArchiveConversation = () => {
    console.log('Arquivar conversa')
  }

  const handleDeleteConversation = () => {
    console.log('Excluir conversa')
  }

  const handleExportChat = () => {
    console.log('Exportar chat')
  }

  const handleReportUser = () => {
    console.log('Reportar usuário')
  }

  const handleBlockUser = () => {
    console.log('Bloquear usuário')
  }

  const handleDownloadAttachment = (attachment: ChatAttachment) => {
    // Criar um link temporário para download
    const link = document.createElement('a')
    link.href = attachment.url
    link.download = attachment.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR })
  }

  const getConversationTitle = () => {
    if (!conversation) return ''
    
    if (conversation.type === 'group') {
      return `# ${conversation.name}`
    } else {
      const otherUser = users.find(u => 
        conversation.participants.find(p => p !== currentUserId) === u.id
      )
      return otherUser?.name || 'Conversa'
    }
  }

  const getConversationSubtitle = () => {
    if (!conversation) return ''
    
    if (conversation.type === 'group') {
      return `${conversation.participants.length} membros`
    } else {
      const otherUser = users.find(u => 
        conversation.participants.find(p => p !== currentUserId) === u.id
      )
      return otherUser?.isOnline ? 'Online' : 'Offline'
    }
  }

  const isConsecutiveMessage = (currentMsg: ChatMessage, prevMsg: ChatMessage | undefined) => {
    if (!prevMsg) return false
    return (
      currentMsg.senderId === prevMsg.senderId &&
      new Date(currentMsg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 300000 // 5 minutes
    )
  }

  const emojis = ['❤️', '👍', '😂', '😮', '😢', '😡']

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma conversa</h3>
          <p className="text-gray-500">Escolha uma conversa existente ou inicie uma nova</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            {conversation.type === 'direct' && (
              <div className="relative mr-2 sm:mr-3 flex-shrink-0">
                {(() => {
                  const otherUser = users.find(u => 
                    conversation.participants.find(p => p !== currentUserId) === u.id
                  )
                  return otherUser ? (
                    <>
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${
                        otherUser.isOnline ? 'bg-green-400' : 'bg-gray-400'
                      }`} />
                    </>
                  ) : null
                })()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{getConversationTitle()}</h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{getConversationSubtitle()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {conversation.type === 'direct' && (
              <>
                <button 
                  onClick={() => handleStartCall('voice')}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={() => handleStartCall('video')}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            )}
            <button 
              onClick={handleShowChatInfo}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="relative">
              <button 
                onClick={handleShowOptionsMenu}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              {/* Options Menu */}
              <ChatOptionsMenu
                isOpen={showOptionsMenu}
                onClose={() => setShowOptionsMenu(false)}
                conversation={conversation}
                onSearchMessages={handleSearchMessages}
                onToggleNotifications={handleToggleNotifications}
                onTogglePin={handleTogglePin}
                onArchiveConversation={handleArchiveConversation}
                onDeleteConversation={handleDeleteConversation}
                onExportChat={handleExportChat}
                onReportUser={handleReportUser}
                onBlockUser={handleBlockUser}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm sm:text-base">Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const sender = users.find(u => u.id === message.senderId)
            const isOwnMessage = message.senderId === currentUserId
            const isConsecutive = isConsecutiveMessage(message, messages[index - 1])
            const isEditing = editingMessageId === message.id

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                  isConsecutive ? 'mt-1' : 'mt-3 sm:mt-4'
                }`}
              >
                <div className={`flex max-w-[85%] sm:max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isConsecutive && !isOwnMessage && sender && (
                    <img
                      src={sender.avatar}
                      alt={sender.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 sm:mr-3 flex-shrink-0"
                    />
                  )}
                  
                  <div className={`${isConsecutive && !isOwnMessage ? 'ml-8 sm:ml-11' : ''} min-w-0 flex-1`}>
                    {!isConsecutive && (
                      <div className={`flex items-center mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {isOwnMessage ? 'Você' : sender?.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-1 sm:ml-2 flex-shrink-0">
                          {formatMessageTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    <div
                      className={`relative group ${
                        isOwnMessage
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      } rounded-lg px-3 sm:px-4 py-2`}
                      onMouseEnter={() => setSelectedMessage(message.id)}
                      onMouseLeave={() => setSelectedMessage(null)}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap text-sm sm:text-base break-words">{message.content}</p>
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1 sm:space-y-2">
                              {message.attachments.map(attachment => (
                                <div
                                  key={attachment.id}
                                  className={`flex items-center p-1.5 sm:p-2 rounded ${
                                    isOwnMessage ? 'bg-blue-400' : 'bg-gray-200'
                                  }`}
                                >
                                  {attachment.type.startsWith('image/') ? (
                                    <Image className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                                  ) : (
                                    <File className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                                  )}
                                  <span className="text-xs sm:text-sm truncate flex-1 min-w-0">{attachment.name}</span>
                                  <button 
                                    className="ml-1 sm:ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded flex-shrink-0"
                                    onClick={() => handleDownloadAttachment(attachment)}
                                    title="Baixar arquivo"
                                  >
                                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.reactions.map((reaction, reactionIndex) => {
                                const reactionCount = message.reactions?.filter(r => r.emoji === reaction.emoji).length || 1
                                return (
                                  <button
                                    key={`${reaction.emoji}-${reactionIndex}`}
                                    className={`flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs border transition-colors ${
                                      isOwnMessage 
                                        ? 'bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200' 
                                        : 'bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200'
                                    }`}
                                    onClick={() => handleReactToMessage(message.id, reaction.emoji)}
                                  >
                                    <span className="text-sm">{reaction.emoji}</span>
                                    <span className="ml-1 font-medium">{reactionCount}</span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Message Actions */}
                      {selectedMessage === message.id && !isEditing && (
                        <div className={`absolute top-0 ${isOwnMessage ? 'left-0' : 'right-0'} transform ${
                          isOwnMessage ? '-translate-x-full' : 'translate-x-full'
                        } flex items-center space-x-0.5 sm:space-x-1 bg-white border border-gray-200 rounded-lg shadow-lg p-0.5 sm:p-1 z-10`}>
                          {/* Emoji reactions */}
                          {emojis.slice(0, 3).map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReactToMessage(message.id, emoji)}
                              className="p-0.5 sm:p-1 hover:bg-gray-100 rounded text-xs sm:text-sm"
                            >
                              {emoji}
                            </button>
                          ))}
                          
                          <div className="w-px h-3 sm:h-4 bg-gray-200" />
                          
                          {/* Message actions */}
                          <button
                            onClick={() => navigator.clipboard.writeText(message.content)}
                            className="p-0.5 sm:p-1 hover:bg-gray-100 rounded"
                            title="Copiar"
                          >
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                          </button>
                          
                          {isOwnMessage && (
                            <>
                              <button
                                onClick={() => handleEditMessage(message.id, message.content)}
                                className="p-0.5 sm:p-1 hover:bg-gray-100 rounded"
                                title="Editar"
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="p-0.5 sm:p-1 hover:bg-gray-100 rounded"
                                title="Excluir"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        
        {/* Typing Indicators */}
        {typingIndicators.length > 0 && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-sm text-gray-600">
                {typingIndicators.map(indicator => {
                  const user = users.find(u => u.id === indicator.userId)
                  return user?.name
                }).filter(Boolean).join(', ')} está digitando...
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center bg-gray-100 rounded-lg p-2"
              >
                {attachment.type.startsWith('image/') ? (
                  <Image className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-600" />
                ) : (
                  <File className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-600" />
                )}
                <span className="text-xs sm:text-sm text-gray-700 truncate max-w-24 sm:max-w-32">{attachment.name}</span>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="ml-2 p-1 hover:bg-gray-100 rounded flex-shrink-0"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end space-x-1 sm:space-x-2">
          <div className="flex-1">
            <textarea
              ref={messageInputRef}
              value={editingMessageId ? editingText : messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              rows={1}
              style={{ minHeight: '36px', maxHeight: '120px' }}
            />
          </div>
          
          <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.txt"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Anexar arquivo"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Adicionar emoji"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button
              onClick={editingMessageId ? handleSaveEdit : handleSendMessage}
              disabled={(!messageText.trim() && attachments.length === 0) || isUploading}
              className="p-1.5 sm:p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={editingMessageId ? "Salvar edição" : "Enviar mensagem"}
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        
        {isUploading && (
          <div className="mt-2 text-sm text-gray-500">
            Enviando arquivo(s)...
          </div>
        )}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-50">
          <EmojiPicker
            isOpen={showEmojiPicker}
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* Chat Info Panel */}
      <ChatInfoPanel
        isOpen={showChatInfo}
        onClose={() => setShowChatInfo(false)}
        conversation={conversation}
        users={users}
        currentUserId={currentUserId}
        onStartCall={() => handleStartCall('voice')}
        onStartVideoCall={() => handleStartCall('video')}
      />



      {/* Call Modal */}
      {conversation && (
        <CallModal
          isOpen={showCallModal}
          onClose={() => setShowCallModal(false)}
          callType={callType}
          otherUser={users.find(u => 
            conversation.participants.find(p => p !== currentUserId) === u.id
          ) || users[0]}
        />
      )}
    </div>
  )
}