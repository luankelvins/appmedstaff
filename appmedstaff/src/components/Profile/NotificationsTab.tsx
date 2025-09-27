import React, { useState } from 'react'
import { Bell, Mail, MessageSquare, Calendar, FileText, Users, Settings, Volume2, VolumeX, Smartphone } from 'lucide-react'
import { NotificationPreferences } from '../../types/profile'

interface NotificationsTabProps {
  preferences: NotificationPreferences
  onUpdate: (preferences: NotificationPreferences) => Promise<void>
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  preferences,
  onUpdate
}) => {
  const [formData, setFormData] = useState<NotificationPreferences>(preferences)
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleEmailChange = (field: string, value: any) => {
    const newData = {
      ...formData,
      email: {
        ...formData.email,
        [field]: value
      }
    }
    setFormData(newData)
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(preferences))
  }

  const handlePushChange = (field: string, value: any) => {
    const newData = {
      ...formData,
      push: {
        ...formData.push,
        [field]: value
      }
    }
    setFormData(newData)
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(preferences))
  }

  const handleInAppChange = (field: string, value: any) => {
    const newData = {
      ...formData,
      inApp: {
        ...formData.inApp,
        [field]: value
      }
    }
    setFormData(newData)
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(preferences))
  }

  const handleEmailTypesChange = (type: string, value: boolean) => {
    const newData = {
      ...formData,
      email: {
        ...formData.email,
        types: {
          ...formData.email.types,
          [type]: value
        }
      }
    }
    setFormData(newData)
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(preferences))
  }

  const handlePushTypesChange = (type: string, value: boolean) => {
    const newData = {
      ...formData,
      push: {
        ...formData.push,
        types: {
          ...formData.push.types,
          [type]: value
        }
      }
    }
    setFormData(newData)
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(preferences))
  }

  const handleInAppTypesChange = (type: string, value: boolean) => {
    const newData = {
      ...formData,
      inApp: {
        ...formData.inApp,
        types: {
          ...formData.inApp.types,
          [type]: value
        }
      }
    }
    setFormData(newData)
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(preferences))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onUpdate(formData)
      setHasChanges(false)
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(preferences)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Notificações por Email */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Notificações por Email
        </h3>
        
        <div className="space-y-4">
          {/* Email Ativado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {formData.email.enabled ? (
                <Volume2 className="w-5 h-5 text-green-500" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Notificações por Email
                </label>
                <p className="text-sm text-gray-500">
                  Receber notificações por email
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.email.enabled}
                onChange={(e) => handleEmailChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Frequência de Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequência de Email
            </label>
            <select
              value={formData.email.frequency}
              onChange={(e) => handleEmailChange('frequency', e.target.value)}
              disabled={!formData.email.enabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="immediate">Imediato</option>
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>

          {/* Tipos de Email */}
          {formData.email.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipos de Notificação por Email
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email-tasks"
                    checked={formData.email.types.tasks}
                    onChange={(e) => handleEmailTypesChange('tasks', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="email-tasks" className="text-sm text-gray-700">
                    Tarefas atribuídas e atualizações
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email-mentions"
                    checked={formData.email.types.mentions}
                    onChange={(e) => handleEmailTypesChange('mentions', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="email-mentions" className="text-sm text-gray-700">
                    Menções em conversas
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email-updates"
                    checked={formData.email.types.updates}
                    onChange={(e) => handleEmailTypesChange('updates', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="email-updates" className="text-sm text-gray-700">
                    Atualizações do sistema
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email-security"
                    checked={formData.email.types.security}
                    onChange={(e) => handleEmailTypesChange('security', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="email-security" className="text-sm text-gray-700">
                    Alertas de segurança
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email-marketing"
                    checked={formData.email.types.marketing}
                    onChange={(e) => handleEmailTypesChange('marketing', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="email-marketing" className="text-sm text-gray-700">
                    Novidades e promoções
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notificações Push */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Smartphone className="w-5 h-5 mr-2" />
          Notificações Push
        </h3>
        
        <div className="space-y-4">
          {/* Push Ativado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {formData.push.enabled ? (
                <Volume2 className="w-5 h-5 text-green-500" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Notificações Push
                </label>
                <p className="text-sm text-gray-500">
                  Receber notificações push no dispositivo
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.push.enabled}
                onChange={(e) => handlePushChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Tipos de Push */}
          {formData.push.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipos de Notificação Push
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="push-tasks"
                    checked={formData.push.types.tasks}
                    onChange={(e) => handlePushTypesChange('tasks', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="push-tasks" className="text-sm text-gray-700">
                    Tarefas atribuídas e atualizações
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="push-mentions"
                    checked={formData.push.types.mentions}
                    onChange={(e) => handlePushTypesChange('mentions', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="push-mentions" className="text-sm text-gray-700">
                    Menções em conversas
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="push-chat"
                    checked={formData.push.types.chat}
                    onChange={(e) => handlePushTypesChange('chat', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="push-chat" className="text-sm text-gray-700">
                    Mensagens do chat
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="push-updates"
                    checked={formData.push.types.updates}
                    onChange={(e) => handlePushTypesChange('updates', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="push-updates" className="text-sm text-gray-700">
                    Atualizações do sistema
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notificações In-App */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notificações no App
        </h3>
        
        <div className="space-y-4">
          {/* In-App Ativado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {formData.inApp.enabled ? (
                <Volume2 className="w-5 h-5 text-green-500" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Notificações no App
                </label>
                <p className="text-sm text-gray-500">
                  Mostrar notificações dentro do aplicativo
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inApp.enabled}
                onChange={(e) => handleInAppChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Configurações de Som e Desktop */}
          {formData.inApp.enabled && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Som das Notificações
                  </label>
                  <p className="text-sm text-gray-500">
                    Reproduzir som ao receber notificações
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inApp.sound}
                    onChange={(e) => handleInAppChange('sound', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Notificações Desktop
                  </label>
                  <p className="text-sm text-gray-500">
                    Mostrar notificações na área de trabalho
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inApp.desktop}
                    onChange={(e) => handleInAppChange('desktop', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Tipos de In-App */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipos de Notificação no App
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="inapp-tasks"
                      checked={formData.inApp.types.tasks}
                      onChange={(e) => handleInAppTypesChange('tasks', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="inapp-tasks" className="text-sm text-gray-700">
                      Tarefas atribuídas e atualizações
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="inapp-mentions"
                      checked={formData.inApp.types.mentions}
                      onChange={(e) => handleInAppTypesChange('mentions', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="inapp-mentions" className="text-sm text-gray-700">
                      Menções em conversas
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="inapp-chat"
                      checked={formData.inApp.types.chat}
                      onChange={(e) => handleInAppTypesChange('chat', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="inapp-chat" className="text-sm text-gray-700">
                      Mensagens do chat
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="inapp-updates"
                      checked={formData.inApp.types.updates}
                      onChange={(e) => handleInAppTypesChange('updates', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="inapp-updates" className="text-sm text-gray-700">
                      Atualizações do sistema
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="inapp-system"
                      checked={formData.inApp.types.system}
                      onChange={(e) => handleInAppTypesChange('system', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="inapp-system" className="text-sm text-gray-700">
                      Alertas do sistema
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Botões de Ação */}
      {hasChanges && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}