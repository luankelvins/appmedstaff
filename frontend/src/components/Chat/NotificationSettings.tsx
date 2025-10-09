import React, { useState, useEffect } from 'react'
import { Bell, BellOff, Volume2, VolumeX, Settings } from 'lucide-react'
import { chatNotificationService } from '../../utils/chatNotificationService'

interface NotificationSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [permissionState, setPermissionState] = useState(chatNotificationService.getPermissionState())

  useEffect(() => {
    setPermissionState(chatNotificationService.getPermissionState())
    setSoundEnabled(chatNotificationService.isSoundEnabled())
  }, [isOpen])

  const handleRequestPermission = async () => {
    const granted = await chatNotificationService.requestPermission()
    setNotificationsEnabled(granted)
    setPermissionState(chatNotificationService.getPermissionState())
  }

  const handleToggleSound = () => {
    const newSoundState = !soundEnabled
    setSoundEnabled(newSoundState)
    chatNotificationService.setSoundEnabled(newSoundState)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configurações de Notificação
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Suporte a notificações */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Suporte a Notificações</p>
                <p className="text-sm text-gray-500">
                  {chatNotificationService.isSupported() 
                    ? 'Seu navegador suporta notificações'
                    : 'Seu navegador não suporta notificações'
                  }
                </p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              chatNotificationService.isSupported() ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>

          {/* Permissão de notificações */}
          {chatNotificationService.isSupported() && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  {permissionState.granted ? (
                    <Bell className="w-5 h-5 text-green-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Notificações do Navegador</p>
                  <p className="text-sm text-gray-500">
                    {permissionState.granted && 'Permissão concedida'}
                    {permissionState.denied && 'Permissão negada'}
                    {permissionState.default && 'Permissão não solicitada'}
                  </p>
                </div>
              </div>
              {!permissionState.granted && !permissionState.denied && (
                <button
                  onClick={handleRequestPermission}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Permitir
                </button>
              )}
              {permissionState.denied && (
                <p className="text-sm text-red-600">
                  Ative nas configurações do navegador
                </p>
              )}
            </div>
          )}

          {/* Som das notificações */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-purple-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">Som de Notificação</p>
                <p className="text-sm text-gray-500">
                  Reproduzir som quando receber mensagens
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Informações adicionais */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Como funcionam as notificações?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Notificações aparecem apenas quando a janela não está em foco</li>
              <li>• Sons são reproduzidos sempre que uma mensagem chegar</li>
              <li>• Você pode desativar sons a qualquer momento</li>
              <li>• Notificações são fechadas automaticamente após 5 segundos</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}