import React, { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { useChatNotifications } from '../hooks/useChatNotifications'

interface ChatNotificationButtonProps {
  className?: string
}

export const ChatNotificationButton: React.FC<ChatNotificationButtonProps> = ({ 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    unreadCount, 
    lastMessage, 
    hasNewMessages, 
    markAllAsRead,
    requestNotificationPermission 
  } = useChatNotifications()

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen && hasNewMessages) {
      // Marcar como visualizado quando abrir
      markAllAsRead()
    }
  }

  const handleRequestPermission = async () => {
    await requestNotificationPermission()
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="relative">
      {/* Botão de notificação */}
      <button
        onClick={handleToggle}
        className={`relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
        title="Chat Interno"
      >
        <MessageCircle className="h-5 w-5" />
        
        {/* Badge de contagem */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Indicador de nova mensagem */}
        {hasNewMessages && unreadCount === 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 rounded-full h-3 w-3"></span>
        )}
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Chat Interno</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="max-h-96 overflow-y-auto">
            {unreadCount > 0 ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    {unreadCount} mensagem{unreadCount > 1 ? 's' : ''} não lida{unreadCount > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Marcar como lidas
                  </button>
                </div>

                {/* Última mensagem */}
                {lastMessage && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        Última mensagem
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(lastMessage.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {lastMessage.content}
                    </p>
                  </div>
                )}

                {/* Botão para abrir chat */}
                <button
                  onClick={() => {
                    // Aqui você pode implementar a navegação para o chat
                    console.log('Abrir chat interno')
                    setIsOpen(false)
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Abrir Chat
                </button>
              </div>
            ) : (
              <div className="p-4 text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-3">
                  Nenhuma mensagem não lida
                </p>
                <button
                  onClick={() => {
                    // Aqui você pode implementar a navegação para o chat
                    console.log('Abrir chat interno')
                    setIsOpen(false)
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Abrir Chat
                </button>
              </div>
            )}

            {/* Configurações de notificação */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleRequestPermission}
                className="w-full text-left text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                🔔 Ativar notificações do navegador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para fechar o dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}