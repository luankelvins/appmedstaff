import React from 'react'
import { 
  Search, 
  Archive, 
  Bell, 
  BellOff, 
  Pin, 
  PinOff, 
  Trash2, 
  Download, 
  Settings,
  UserMinus,
  Flag
} from 'lucide-react'
import { ChatConversation } from '../../types/chat'

interface ChatOptionsMenuProps {
  isOpen: boolean
  onClose: () => void
  conversation: ChatConversation | null
  onSearchMessages?: () => void
  onToggleNotifications?: () => void
  onTogglePin?: () => void
  onArchiveConversation?: () => void
  onDeleteConversation?: () => void
  onExportChat?: () => void
  onReportUser?: () => void
  onBlockUser?: () => void
}

export const ChatOptionsMenu: React.FC<ChatOptionsMenuProps> = ({
  isOpen,
  onClose,
  conversation,
  onSearchMessages,
  onToggleNotifications,
  onTogglePin,
  onArchiveConversation,
  onDeleteConversation,
  onExportChat,
  onReportUser,
  onBlockUser
}) => {
  if (!isOpen || !conversation) return null

  const isDirectMessage = conversation.type === 'direct'
  const isPinned = false // TODO: Implementar lógica de pin
  const notificationsEnabled = true // TODO: Implementar lógica de notificações

  const handleAction = (action?: () => void) => {
    if (action) {
      action()
    }
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-56 py-1">
        {/* Search */}
        <button
          onClick={() => handleAction(onSearchMessages)}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Search className="w-4 h-4 mr-3" />
          Buscar Mensagens
        </button>

        {/* Pin/Unpin */}
        <button
          onClick={() => handleAction(onTogglePin)}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {isPinned ? (
            <>
              <PinOff className="w-4 h-4 mr-3" />
              Desafixar Conversa
            </>
          ) : (
            <>
              <Pin className="w-4 h-4 mr-3" />
              Fixar Conversa
            </>
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={() => handleAction(onToggleNotifications)}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {notificationsEnabled ? (
            <>
              <BellOff className="w-4 h-4 mr-3" />
              Silenciar Notificações
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-3" />
              Ativar Notificações
            </>
          )}
        </button>

        <div className="border-t border-gray-100 my-1" />

        {/* Export Chat */}
        <button
          onClick={() => handleAction(onExportChat)}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4 mr-3" />
          Exportar Conversa
        </button>

        {/* Archive */}
        <button
          onClick={() => handleAction(onArchiveConversation)}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Archive className="w-4 h-4 mr-3" />
          Arquivar Conversa
        </button>

        {/* Direct Message specific options */}
        {isDirectMessage && (
          <>
            <div className="border-t border-gray-100 my-1" />
            
            <button
              onClick={() => handleAction(onReportUser)}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Flag className="w-4 h-4 mr-3" />
              Reportar Usuário
            </button>

            <button
              onClick={() => handleAction(onBlockUser)}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <UserMinus className="w-4 h-4 mr-3" />
              Bloquear Usuário
            </button>
          </>
        )}

        <div className="border-t border-gray-100 my-1" />

        {/* Delete */}
        <button
          onClick={() => handleAction(onDeleteConversation)}
          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-3" />
          {isDirectMessage ? 'Excluir Conversa' : 'Sair do Canal'}
        </button>
      </div>
    </>
  )
}