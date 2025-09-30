import React, { useState } from 'react'
import { 
  Search, 
  Plus, 
  Hash, 
  MessageCircle, 
  Users, 
  Settings,
  ChevronDown,
  ChevronRight,
  Circle,
  Dot
} from 'lucide-react'
import { ChatChannel, ChatConversation, ChatUser } from '../../types/chat'

interface ChatSidebarProps {
  channels: ChatChannel[]
  conversations: ChatConversation[]
  users: ChatUser[]
  activeConversation: string | null
  onSelectConversation: (id: string, type: 'channel' | 'direct') => void
  onCreateChannel: () => void
  onStartDirectMessage: (userId: string) => void
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  channels,
  conversations,
  users,
  activeConversation,
  onSelectConversation,
  onCreateChannel,
  onStartDirectMessage
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSections, setExpandedSections] = useState({
    channels: true,
    directMessages: true,
    users: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredConversations = conversations.filter(conv => {
    const otherUser = users.find(u => 
      conv.participants.find(p => p !== 'current-user') === u.id
    )
    return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getUnreadCount = (id: string, type: 'channel' | 'conversation') => {
    if (type === 'channel') {
      return channels.find(c => c.id === id)?.unreadCount || 0
    }
    return conversations.find(c => c.id === id)?.unreadCount || 0
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Chat Interno</h2>
          <button
            onClick={onCreateChannel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Criar canal"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Channels */}
        <div className="p-2">
          <button
            onClick={() => toggleSection('channels')}
            className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center">
              {expandedSections.channels ? (
                <ChevronDown className="w-4 h-4 mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2" />
              )}
              <Hash className="w-4 h-4 mr-2" />
              Canais
            </div>
            <span className="text-xs text-gray-500">{filteredChannels.length}</span>
          </button>

          {expandedSections.channels && (
            <div className="ml-6 mt-1 space-y-1">
              {filteredChannels.map(channel => {
                const unreadCount = getUnreadCount(channel.id, 'channel')
                const isActive = activeConversation === channel.id

                return (
                  <button
                    key={channel.id}
                    onClick={() => onSelectConversation(channel.id, 'channel')}
                    className={`w-full flex items-center justify-between p-2 text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center min-w-0">
                      <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{channel.name}</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Direct Messages */}
        <div className="p-2">
          <button
            onClick={() => toggleSection('directMessages')}
            className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center">
              {expandedSections.directMessages ? (
                <ChevronDown className="w-4 h-4 mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2" />
              )}
              <MessageCircle className="w-4 h-4 mr-2" />
              Mensagens Diretas
            </div>
            <span className="text-xs text-gray-500">{filteredConversations.length}</span>
          </button>

          {expandedSections.directMessages && (
            <div className="ml-6 mt-1 space-y-1">
              {filteredConversations.map(conversation => {
                const otherUser = users.find(u => 
                  conversation.participants.find(p => p !== 'current-user') === u.id
                )
                const unreadCount = getUnreadCount(conversation.id, 'conversation')
                const isActive = activeConversation === conversation.id

                if (!otherUser) return null

                return (
                  <button
                    key={conversation.id}
                    onClick={() => onSelectConversation(conversation.id, 'direct')}
                    className={`w-full flex items-center justify-between p-2 text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center min-w-0">
                      <div className="relative mr-3">
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          otherUser.isOnline ? 'bg-green-400' : 'bg-gray-400'
                        }`} />
                      </div>
                      <span className="truncate">{otherUser.name}</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Online Users */}
        <div className="p-2">
          <button
            onClick={() => toggleSection('users')}
            className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center">
              {expandedSections.users ? (
                <ChevronDown className="w-4 h-4 mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2" />
              )}
              <Users className="w-4 h-4 mr-2" />
              Usuários Online
            </div>
            <span className="text-xs text-gray-500">
              {filteredUsers.filter(u => u.isOnline).length}
            </span>
          </button>

          {expandedSections.users && (
            <div className="ml-6 mt-1 space-y-1">
              {filteredUsers
                .filter(user => user.isOnline)
                .map(user => (
                  <button
                    key={user.id}
                    onClick={() => onStartDirectMessage(user.id)}
                    className="w-full flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="relative mr-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{user.name}</div>
                      <div className="truncate text-xs text-gray-500">{user.role}</div>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <Settings className="w-4 h-4 mr-3" />
          Configurações do Chat
        </button>
      </div>
    </div>
  )
}