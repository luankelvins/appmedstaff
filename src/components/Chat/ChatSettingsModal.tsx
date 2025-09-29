import React, { useState } from 'react'
import { 
  X, 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Clock, 
  Users, 
  Shield,
  Palette,
  Download,
  Trash2
} from 'lucide-react'
import { ChatConversation } from '../../types/chat'

interface ChatSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: ChatConversation | null
}

interface ChatSettings {
  notifications: boolean
  soundEnabled: boolean
  showReadReceipts: boolean
  showTypingIndicators: boolean
  autoDeleteMessages: boolean
  autoDeleteDays: number
  theme: 'light' | 'dark' | 'auto'
  fontSize: 'small' | 'medium' | 'large'
}

export const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({
  isOpen,
  onClose,
  conversation
}) => {
  const [settings, setSettings] = useState<ChatSettings>({
    notifications: true,
    soundEnabled: true,
    showReadReceipts: true,
    showTypingIndicators: true,
    autoDeleteMessages: false,
    autoDeleteDays: 30,
    theme: 'auto',
    fontSize: 'medium'
  })

  const [activeTab, setActiveTab] = useState<'general' | 'privacy' | 'appearance'>('general')

  if (!isOpen || !conversation) return null

  const handleSettingChange = (key: keyof ChatSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar as configurações
    console.log('Salvando configurações:', settings)
    onClose()
  }

  const handleExportChat = () => {
    // Implementar exportação do chat
    console.log('Exportando chat...')
  }

  const handleClearHistory = () => {
    // Implementar limpeza do histórico
    if (confirm('Tem certeza que deseja limpar todo o histórico desta conversa? Esta ação não pode ser desfeita.')) {
      console.log('Limpando histórico...')
    }
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Configurações do Chat
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Chat Info */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-lg mr-4">
                {conversation.type === 'group' ? '#' : (conversation.name || 'Chat').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{conversation.name || 'Chat'}</h3>
                <p className="text-sm text-gray-500">
                  {conversation.type === 'group' ? 'Grupo' : 'Conversa direta'} • {conversation.participants.length} participantes
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'general', label: 'Geral', icon: Bell },
              { id: 'privacy', label: 'Privacidade', icon: Shield },
              { id: 'appearance', label: 'Aparência', icon: Palette }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Notificações</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="w-4 h-4 mr-3 text-gray-500" />
                        <span className="text-sm text-gray-700">Receber notificações</span>
                      </div>
                      <button
                        onClick={() => handleSettingChange('notifications', !settings.notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Volume2 className="w-4 h-4 mr-3 text-gray-500" />
                        <span className="text-sm text-gray-700">Sons de notificação</span>
                      </div>
                      <button
                        onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Mensagens</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-3 text-gray-500" />
                        <span className="text-sm text-gray-700">Confirmações de leitura</span>
                      </div>
                      <button
                        onClick={() => handleSettingChange('showReadReceipts', !settings.showReadReceipts)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.showReadReceipts ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.showReadReceipts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-3 text-gray-500" />
                        <span className="text-sm text-gray-700">Indicadores de digitação</span>
                      </div>
                      <button
                        onClick={() => handleSettingChange('showTypingIndicators', !settings.showTypingIndicators)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.showTypingIndicators ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.showTypingIndicators ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Exclusão Automática</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-3 text-gray-500" />
                        <span className="text-sm text-gray-700">Excluir mensagens automaticamente</span>
                      </div>
                      <button
                        onClick={() => handleSettingChange('autoDeleteMessages', !settings.autoDeleteMessages)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.autoDeleteMessages ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.autoDeleteMessages ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {settings.autoDeleteMessages && (
                      <div className="ml-7">
                        <label className="block text-sm text-gray-700 mb-2">Excluir após:</label>
                        <select
                          value={settings.autoDeleteDays}
                          onChange={(e) => handleSettingChange('autoDeleteDays', parseInt(e.target.value))}
                          className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={7}>7 dias</option>
                          <option value={30}>30 dias</option>
                          <option value={90}>90 dias</option>
                          <option value={365}>1 ano</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Dados</h4>
                  <div className="space-y-3">
                    <button
                      onClick={handleExportChat}
                      className="w-full flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                    >
                      <Download className="w-4 h-4 mr-3" />
                      Exportar histórico do chat
                    </button>

                    <button
                      onClick={handleClearHistory}
                      className="w-full flex items-center p-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Limpar histórico do chat
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Tema</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Claro' },
                      { value: 'dark', label: 'Escuro' },
                      { value: 'auto', label: 'Automático' }
                    ].map(theme => (
                      <button
                        key={theme.value}
                        onClick={() => handleSettingChange('theme', theme.value)}
                        className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                          settings.theme === theme.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Tamanho da Fonte</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'small', label: 'Pequena' },
                      { value: 'medium', label: 'Média' },
                      { value: 'large', label: 'Grande' }
                    ].map(size => (
                      <button
                        key={size.value}
                        onClick={() => handleSettingChange('fontSize', size.value)}
                        className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                          settings.fontSize === size.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </>
  )
}