import React, { useState } from 'react'
import { 
  X, 
  Search, 
  MessageCircle, 
  Hash, 
  Users, 
  Plus,
  Check,
  Globe,
  Lock
} from 'lucide-react'
import { ChatUser } from '../../types/chat'

interface NewConversationModalProps {
  isOpen: boolean
  onClose: () => void
  users: ChatUser[]
  currentUserId: string
  onStartDirectMessage: (userId: string) => void
  onCreateChannel: (name: string, description: string, type: 'public' | 'private', members: string[]) => void
}

type TabType = 'direct' | 'channel'

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUserId,
  onStartDirectMessage,
  onCreateChannel
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('direct')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  
  // Channel creation states
  const [channelName, setChannelName] = useState('')
  const [channelDescription, setChannelDescription] = useState('')
  const [channelType, setChannelType] = useState<'public' | 'private'>('public')

  if (!isOpen) return null

  const availableUsers = users.filter(user => user.id !== currentUserId)
  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUserSelect = (userId: string) => {
    if (activeTab === 'direct') {
      onStartDirectMessage(userId)
      onClose()
      resetForm()
    } else {
      setSelectedUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      )
    }
  }

  const handleCreateChannel = () => {
    if (!channelName.trim()) return
    
    onCreateChannel(
      channelName.trim(),
      channelDescription.trim(),
      channelType,
      selectedUsers
    )
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setSearchTerm('')
    setSelectedUsers([])
    setChannelName('')
    setChannelDescription('')
    setChannelType('public')
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Nova Conversa
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'direct'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Mensagem Direta
            </button>
            <button
              onClick={() => setActiveTab('channel')}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'channel'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Hash className="w-4 h-4 mr-2" />
              Criar Canal
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'direct' && (
              <div>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar pessoas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Users List */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum usuário encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredUsers.map(user => (
                        <button
                          key={user.id}
                          onClick={() => handleUserSelect(user.id)}
                          className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.role} • {user.department}
                            </p>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'channel' && (
              <div className="space-y-4">
                {/* Channel Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Canal
                  </label>
                  <input
                    type="text"
                    placeholder="ex: equipe-desenvolvimento"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Channel Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    placeholder="Descreva o propósito deste canal..."
                    value={channelDescription}
                    onChange={(e) => setChannelDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Channel Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo do Canal
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setChannelType('public')}
                      className={`w-full flex items-center p-3 border-2 rounded-lg transition-colors ${
                        channelType === 'public'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Globe className="w-5 h-5 mr-3 text-gray-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">Público</p>
                        <p className="text-xs text-gray-500">Qualquer pessoa pode encontrar e participar</p>
                      </div>
                      {channelType === 'public' && (
                        <Check className="w-5 h-5 ml-auto text-blue-600" />
                      )}
                    </button>

                    <button
                      onClick={() => setChannelType('private')}
                      className={`w-full flex items-center p-3 border-2 rounded-lg transition-colors ${
                        channelType === 'private'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Lock className="w-5 h-5 mr-3 text-gray-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">Privado</p>
                        <p className="text-xs text-gray-500">Apenas membros convidados podem participar</p>
                      </div>
                      {channelType === 'private' && (
                        <Check className="w-5 h-5 ml-auto text-blue-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Add Members */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adicionar Membros ({selectedUsers.length} selecionados)
                  </label>
                  
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar pessoas para adicionar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Selected Users */}
                  {selectedUsers.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(userId => {
                          const user = users.find(u => u.id === userId)
                          if (!user) return null
                          return (
                            <span
                              key={userId}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {user.name}
                              <button
                                onClick={() => handleUserSelect(userId)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Users List */}
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleUserSelect(user.id)}
                        className={`w-full flex items-center p-2 hover:bg-gray-50 transition-colors text-left ${
                          selectedUsers.includes(user.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.department}
                          </p>
                        </div>
                        {selectedUsers.includes(user.id) && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab === 'channel' && (
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateChannel}
                disabled={!channelName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Criar Canal
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}