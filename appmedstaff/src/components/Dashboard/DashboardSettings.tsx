import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Eye, 
  EyeOff, 
  GripVertical, 
  RotateCcw,
  Monitor,
  Moon,
  Sun,
  Grid3X3,
  List,
  Minimize2
} from 'lucide-react'
import userPreferencesService, { UserPreferences, DashboardWidget } from '../../services/userPreferencesService'

interface DashboardSettingsProps {
  isOpen: boolean
  onClose: () => void
  onPreferencesChange: (preferences: UserPreferences) => void
}

const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  isOpen,
  onClose,
  onPreferencesChange
}) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'widgets' | 'layout' | 'notifications'>('widgets')

  useEffect(() => {
    if (isOpen) {
      loadPreferences()
    }
  }, [isOpen])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const prefs = await userPreferencesService.getPreferences()
      setPreferences(prefs)
    } catch (error) {
      console.error('Erro ao carregar preferências:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWidgetToggle = async (widgetId: string) => {
    if (!preferences) return

    try {
      await userPreferencesService.toggleWidget(widgetId)
      const updatedPrefs = await userPreferencesService.getPreferences()
      setPreferences(updatedPrefs)
      onPreferencesChange(updatedPrefs)
    } catch (error) {
      console.error('Erro ao atualizar widget:', error)
    }
  }

  const handleThemeChange = async (theme: UserPreferences['theme']) => {
    if (!preferences) return

    try {
      await userPreferencesService.updateTheme(theme)
      const updatedPrefs = await userPreferencesService.getPreferences()
      setPreferences(updatedPrefs)
      onPreferencesChange(updatedPrefs)
    } catch (error) {
      console.error('Erro ao atualizar tema:', error)
    }
  }

  const handleLayoutChange = async (layout: UserPreferences['dashboardLayout']) => {
    if (!preferences) return

    try {
      await userPreferencesService.updateDashboardLayout(layout)
      const updatedPrefs = await userPreferencesService.getPreferences()
      setPreferences(updatedPrefs)
      onPreferencesChange(updatedPrefs)
    } catch (error) {
      console.error('Erro ao atualizar layout:', error)
    }
  }

  const handleNotificationChange = async (key: keyof UserPreferences['notifications'], value: boolean) => {
    if (!preferences) return

    try {
      await userPreferencesService.updateNotificationSettings({ [key]: value })
      const updatedPrefs = await userPreferencesService.getPreferences()
      setPreferences(updatedPrefs)
      onPreferencesChange(updatedPrefs)
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error)
    }
  }

  const handleResetToDefaults = async () => {
    if (!confirm('Tem certeza que deseja restaurar as configurações padrão?')) return

    try {
      await userPreferencesService.resetToDefaults()
      const updatedPrefs = await userPreferencesService.getPreferences()
      setPreferences(updatedPrefs)
      onPreferencesChange(updatedPrefs)
    } catch (error) {
      console.error('Erro ao restaurar configurações:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Configurações do Dashboard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('widgets')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'widgets'
                ? 'text-medstaff-primary border-b-2 border-medstaff-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Widgets
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'layout'
                ? 'text-medstaff-primary border-b-2 border-medstaff-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Layout
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'text-medstaff-primary border-b-2 border-medstaff-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Notificações
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medstaff-primary"></div>
            </div>
          ) : (
            <>
              {/* Widgets Tab */}
              {activeTab === 'widgets' && preferences && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Widgets Disponíveis
                    </h3>
                    <button
                      onClick={handleResetToDefaults}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restaurar Padrão
                    </button>
                  </div>

                  {preferences.widgets
                    .sort((a, b) => a.position - b.position)
                    .map((widget) => (
                      <div
                        key={widget.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <GripVertical className="w-4 h-4 text-gray-400 mr-3 cursor-move" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {widget.title}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {widget.type} • {widget.size}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleWidgetToggle(widget.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            widget.enabled
                              ? 'text-green-600 bg-green-100 hover:bg-green-200'
                              : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {widget.enabled ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* Layout Tab */}
              {activeTab === 'layout' && preferences && (
                <div className="space-y-6">
                  {/* Tema */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Tema</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Claro', icon: Sun },
                        { value: 'dark', label: 'Escuro', icon: Moon },
                        { value: 'auto', label: 'Auto', icon: Monitor }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => handleThemeChange(value as UserPreferences['theme'])}
                          className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                            preferences.theme === value
                              ? 'border-medstaff-primary bg-medstaff-primary bg-opacity-10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Layout do Dashboard */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Layout do Dashboard</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'grid', label: 'Grade', icon: Grid3X3 },
                        { value: 'list', label: 'Lista', icon: List },
                        { value: 'compact', label: 'Compacto', icon: Minimize2 }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => handleLayoutChange(value as UserPreferences['dashboardLayout'])}
                          className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                            preferences.dashboardLayout === value
                              ? 'border-medstaff-primary bg-medstaff-primary bg-opacity-10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && preferences && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Preferências de Notificação
                  </h3>

                  {[
                    { key: 'email', label: 'Notificações por Email', description: 'Receber atualizações por email' },
                    { key: 'push', label: 'Notificações Push', description: 'Notificações no navegador' },
                    { key: 'taskReminders', label: 'Lembretes de Tarefas', description: 'Alertas para tarefas próximas do vencimento' },
                    { key: 'projectUpdates', label: 'Atualizações de Projetos', description: 'Notificações sobre mudanças em projetos' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">{description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.notifications[key as keyof UserPreferences['notifications']]}
                          onChange={(e) => handleNotificationChange(
                            key as keyof UserPreferences['notifications'],
                            e.target.checked
                          )}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-medstaff-primary peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medstaff-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardSettings