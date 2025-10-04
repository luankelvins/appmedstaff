import React, { useState, useEffect } from 'react'
import { useProfile } from '../services/profileService'
import { ProfileHeader } from '../components/Profile/ProfileHeader'
import { ProfileTabs } from '../components/Profile/ProfileTabs'
import { PersonalInfoTab } from '../components/Profile/PersonalInfoTab'
import { PreferencesTab } from '../components/Profile/PreferencesTab'
import { SecurityTab } from '../components/Profile/SecurityTab'
import { ActivityTab } from '../components/Profile/ActivityTab'
import { NotificationsTab } from '../components/Profile/NotificationsTab'
import { HourBankTab } from '../components/Profile/HourBankTab'
import { TimeEditRequestTab } from '../components/Profile/TimeEditRequestTab'
import { ProfileUpdateRequest, PasswordChangeRequest, UserPreferences, NotificationPreferences } from '../types/profile'
import { hasPermission } from '../utils/permissions'
import { Loader2 } from 'lucide-react'

export type ProfileTab = 'personal' | 'preferences' | 'security' | 'activity' | 'notifications' | 'hour-bank' | 'time-edit-requests'

export const Profile: React.FC = () => {
  const { profile, loading, error, updateProfile, changePassword, uploadAvatar, exportActivity } = useProfile()
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal')

  // Verificar permissões
  useEffect(() => {
    if (!hasPermission('profile.view')) {
      // Redirecionar ou mostrar erro de acesso negado
      console.warn('Usuário não tem permissão para visualizar perfil')
    }
  }, [])

  const handleProfileUpdate = async (data: ProfileUpdateRequest) => {
    try {
      await updateProfile(data)
      // Mostrar notificação de sucesso
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      // Mostrar notificação de erro
    }
  }

  const handlePasswordChange = async (data: PasswordChangeRequest) => {
    try {
      await changePassword(data)
      // Mostrar notificação de sucesso
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      // Mostrar notificação de erro
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      const response = await uploadAvatar(file)
      // Atualizar avatar no perfil
      await updateProfile({ avatar: response.url })
      // Mostrar notificação de sucesso
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error)
      // Mostrar notificação de erro
    }
  }

  const handlePreferencesUpdate = async (preferences: Partial<UserPreferences>) => {
    try {
      await updateProfile({ preferences } as ProfileUpdateRequest)
      // Mostrar notificação de sucesso
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error)
      // Mostrar notificação de erro
    }
  }

  const handleNotificationsUpdate = async (notifications: NotificationPreferences) => {
    try {
      await updateProfile({ 
        preferences: { 
          ...profile?.preferences,
          notifications 
        } 
      })
      // Mostrar notificação de sucesso
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error)
      // Mostrar notificação de erro
    }
  }

  const handleExportActivity = async () => {
    try {
      await exportActivity()
      // Mostrar notificação de sucesso
    } catch (error) {
      console.error('Erro ao exportar atividade:', error)
      // Mostrar notificação de erro
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Carregando perfil...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Erro ao carregar perfil
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg font-semibold mb-2">
            Perfil não encontrado
          </div>
          <p className="text-gray-500">
            Não foi possível carregar as informações do perfil.
          </p>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoTab
            profile={profile}
            onUpdate={handleProfileUpdate}
            canEdit={hasPermission('profile.update')}
          />
        )
      
      case 'preferences':
        return (
          <PreferencesTab
            preferences={profile.preferences}
            onUpdate={handlePreferencesUpdate}
          />
        )
      
      case 'security':
        return (
          <SecurityTab
            profile={profile}
            onPasswordChange={handlePasswordChange}
            onToggle2FA={async (enabled: boolean) => {
              await updateProfile({ security: { twoFactorEnabled: enabled } })
            }}
            onRemoveTrustedDevice={async (deviceId: string) => {
              const updatedDevices = profile.security.deviceTrust.trustedDevices.filter(d => d.id !== deviceId)
              await updateProfile({ 
                security: { 
                  deviceTrust: { 
                    ...profile.security.deviceTrust, 
                    trustedDevices: updatedDevices 
                  } 
                } 
              })
            }}
            isUpdating={false}
          />
        )
      
      case 'activity':
        return (
          <ActivityTab
            userId={profile.id}
            onExportActivity={handleExportActivity}
          />
        )
      
      case 'notifications':
        return (
          <NotificationsTab
            preferences={profile.preferences.notifications}
            onUpdate={handleNotificationsUpdate}
          />
        )
      
      case 'hour-bank':
        return (
          <HourBankTab
            employeeId={profile.id}
          />
        )
      
      case 'time-edit-requests':
        return (
          <TimeEditRequestTab
            employeeId={profile.id}
            employeeName={profile.name}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header do Perfil */}
        <ProfileHeader
          profile={profile}
          onAvatarUpload={handleAvatarUpload}
          isUpdating={false}
        />

        {/* Navegação por Tabs */}
        <div className="mt-8">
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Conteúdo da Tab Ativa */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default Profile