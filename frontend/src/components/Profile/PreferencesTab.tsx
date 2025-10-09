import React, { useState } from 'react'
import { Save, X, Edit3, Monitor, Sun, Moon, Globe, Clock, Layout, Bell } from 'lucide-react'
import { UserPreferences } from '../../types/profile'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { preferencesSchema } from '../../utils/validationSchemas'

interface PreferencesTabProps {
  preferences: UserPreferences
  onUpdate: (preferences: Partial<UserPreferences>) => Promise<void>
}

export const PreferencesTab: React.FC<PreferencesTabProps> = ({
  preferences,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false)

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<UserPreferences>({
    resolver: zodResolver(preferencesSchema) as any,
    defaultValues: preferences
  })

  const formData = watch()

  const onSubmit = async (data: UserPreferences) => {
    try {
      await onUpdate(data)
      setIsEditing(false)
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error)
    }
  }

  const handleCancel = () => {
    reset(preferences)
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof UserPreferences, value: any) => {
    setValue(field, value)
  }

  const handleNestedChange = (section: keyof UserPreferences, field: string, value: any) => {
    const currentSection = formData[section] as any
    setValue(section, {
      ...currentSection,
      [field]: value
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Preferências</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Editar
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Aparência */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
            <Layout className="w-5 h-5 mr-2 text-gray-500" />
            Aparência
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema
              </label>
              <div className="flex space-x-3">
                {['light', 'dark', 'system'].map((theme) => (
                  <label key={theme} className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value={theme}
                      checked={formData.theme === theme}
                      onChange={(e) => handleInputChange('theme', e.target.value as any)}
                      disabled={!isEditing}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      {theme === 'light' && <Sun className="w-4 h-4 mr-1" />}
                      {theme === 'dark' && <Moon className="w-4 h-4 mr-1" />}
                      {theme === 'system' && <Monitor className="w-4 h-4 mr-1" />}
                      <span className="text-sm text-gray-700 capitalize">{theme}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value as any)}
                disabled={!isEditing}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configurações Regionais */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-gray-500" />
            Configurações Regionais
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato de Data
              </label>
              <select
                value={formData.dateFormat}
                onChange={(e) => handleInputChange('dateFormat', e.target.value as any)}
                disabled={!isEditing}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato de Hora
              </label>
              <select
                value={formData.timeFormat}
                onChange={(e) => handleInputChange('timeFormat', e.target.value as any)}
                disabled={!isEditing}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="12h">12 horas (AM/PM)</option>
                <option value="24h">24 horas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuso Horário
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                disabled={!isEditing}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                <option value="America/New_York">Nova York (GMT-5)</option>
                <option value="Europe/London">Londres (GMT+0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-gray-500" />
            Notificações
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notificações por Email
                </label>
                <p className="text-xs text-gray-500">
                  Receber notificações importantes por email
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications?.email?.enabled || false}
                onChange={(e) => handleNestedChange('notifications', 'email', {
                  ...formData.notifications?.email,
                  enabled: e.target.checked
                })}
                disabled={!isEditing}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notificações Push
                </label>
                <p className="text-xs text-gray-500">
                  Receber notificações push no navegador
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications?.push?.enabled || false}
                onChange={(e) => handleNestedChange('notifications', 'push', {
                  ...formData.notifications?.push,
                  enabled: e.target.checked
                })}
                disabled={!isEditing}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Privacidade */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">
            Privacidade
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibilidade do Perfil
              </label>
              <select
                value={formData.privacy?.profileVisibility || 'team'}
                onChange={(e) => handleNestedChange('privacy', 'profileVisibility', e.target.value)}
                disabled={!isEditing}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="public">Público</option>
                <option value="team">Apenas equipe</option>
                <option value="private">Privado</option>
              </select>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}