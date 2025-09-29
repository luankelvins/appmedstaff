import React, { useState } from 'react'
import { 
  X, 
  Settings, 
  Bell, 
  BellOff, 
  Archive, 
  UserMinus, 
  Users, 
  Calendar, 
  FileText, 
  Image, 
  Download,
  Search,
  MoreVertical,
  Pin,
  Star,
  Phone,
  Video,
  UserPlus,
  Trash2
} from 'lucide-react'
import { ChatConversation, ChatUser, ChatMessage } from '../../types/chat'
import { ChatSettingsModal } from './ChatSettingsModal'

interface ChatInfoPanelProps {
  isOpen: boolean
  onClose: () => void
  conversation: ChatConversation | null
  users: ChatUser[]
  currentUserId: string
  onStartCall?: () => void
  onStartVideoCall?: () => void
}

export const ChatInfoPanel: React.FC<ChatInfoPanelProps> = ({
  isOpen,
  onClose,
  conversation,
  users,
  currentUserId,
  onStartCall,
  onStartVideoCall
}) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  if (!isOpen || !conversation) return null

  const getParticipants = () => {
    if (conversation.type === 'direct') {
      return users.filter(user => 
        conversation.participants.includes(user.id) && user.id !== currentUserId
      )
    }
    return users.filter(user => conversation.participants.includes(user.id))
  }

  const participants = getParticipants()
  const isDirectMessage = conversation.type === 'direct'
  const otherUser = isDirectMessage ? participants[0] : null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isDirectMessage ? 'Informações do Contato' : 'Informações do Canal'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="p-6 text-center border-b border-gray-200">
          {isDirectMessage && otherUser ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{otherUser.name}</h3>
              <p className="text-sm text-gray-500 mb-1">{otherUser.department}</p>
              <p className="text-sm text-gray-500">{otherUser.role}</p>
              <div className="flex items-center justify-center mt-2">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-gray-500">
                  {otherUser.isOnline ? 'Online' : otherUser.lastSeen ? `Visto ${otherUser.lastSeen}` : 'Offline'}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                #
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{conversation.name}</h3>
              <p className="text-sm text-gray-500">{participants.length} membros</p>
            </>
          )}
        </div>

        {/* Actions */}
        {isDirectMessage && (
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onStartCall}
                className="flex flex-col items-center p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Phone className="w-6 h-6 mb-1" />
                <span className="text-xs">Ligar</span>
              </button>
              <button
                onClick={onStartVideoCall}
                className="flex flex-col items-center p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Video className="w-6 h-6 mb-1" />
                <span className="text-xs">Vídeo</span>
              </button>
            </div>
          </div>
        )}

        {/* Members */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              {isDirectMessage ? 'Contato' : `Membros (${participants.length})`}
            </h4>
            {!isDirectMessage && (
              <button 
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                onClick={() => console.log('Adicionar membro')}
                title="Adicionar membro"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {participants.map((user) => (
              <div key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.role}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Configurações</h4>
          <div className="space-y-1">
            <button 
              className="w-full flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => console.log('Configurar notificações')}
            >
              <Bell className="w-4 h-4 mr-3" />
              Notificações
            </button>
            <button 
              className="w-full flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsSettingsModalOpen(true)}
            >
              <Settings className="w-4 h-4 mr-3" />
              Configurações do Chat
            </button>
            {!isDirectMessage && (
              <>
                <button 
                  className="w-full flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => console.log('Arquivar conversa')}
                >
                  <Archive className="w-4 h-4 mr-3" />
                  Arquivar Conversa
                </button>
                <button 
                  className="w-full flex items-center p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => console.log('Sair do canal')}
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Sair do Canal
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Settings Modal */}
      <ChatSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        conversation={conversation}
      />
    </>
  )
}