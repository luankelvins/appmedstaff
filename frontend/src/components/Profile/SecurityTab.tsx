import React, { useState } from 'react'
import { Save, X, Edit3, Shield, Smartphone, Monitor, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { UserProfile, SecurityFormData, PasswordChangeRequest } from '../../types/profile'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { passwordChangeSchema } from '../../utils/validationSchemas'
import { usePasswordValidation } from '../../hooks/useFormValidation'

interface SecurityTabProps {
  profile: UserProfile
  onPasswordChange: (data: PasswordChangeRequest) => Promise<void>
  onToggle2FA: (enabled: boolean) => Promise<void>
  onRemoveTrustedDevice: (deviceId: string) => Promise<void>
  isUpdating: boolean
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  profile,
  onPasswordChange,
  onToggle2FA,
  onRemoveTrustedDevice,
  isUpdating
}) => {
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<PasswordChangeRequest>({
    resolver: zodResolver(passwordChangeSchema) as any,
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const { validatePasswordStrength, getPasswordStrengthColor } = usePasswordValidation()
  const newPassword = watch('newPassword')
  const passwordStrengthData = newPassword ? validatePasswordStrength(newPassword) : null

  const onSubmit = async (data: PasswordChangeRequest) => {
    try {
      await onPasswordChange(data)
      reset()
      setIsEditingPassword(false)
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditingPassword(false)
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleToggle2FA = async () => {
    try {
      await onToggle2FA(!profile.security?.twoFactorEnabled)
    } catch (error) {
      console.error('Erro ao alterar 2FA:', error)
    }
  }

  const handleRemoveDevice = async (deviceId: string) => {
    if (window.confirm('Tem certeza que deseja remover este dispositivo?')) {
      try {
        await onRemoveTrustedDevice(deviceId)
      } catch (error) {
        console.error('Erro ao remover dispositivo:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Alteração de Senha */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Senha</h2>
            <p className="text-sm text-gray-600">
              Última alteração: {profile.security?.lastPasswordChange 
                ? formatDistanceToNow(new Date(profile.security.lastPasswordChange), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })
                : 'Nunca'
              }
            </p>
          </div>
          
          {!isEditingPassword && (
            <button
              onClick={() => setIsEditingPassword(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Alterar Senha
            </button>
          )}
        </div>

        {isEditingPassword && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Senha Atual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha Atual *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  {...register('currentPassword')}
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  {...register('newPassword')}
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.newPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.newPassword.message}
                </p>
              )}
              
              {/* Indicador de força da senha */}
              {passwordStrengthData && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Força da senha:</span>
                    <span className={getPasswordStrengthColor(passwordStrengthData.strength)}>
                      {passwordStrengthData.strength === 'weak' && 'Fraca'}
                      {passwordStrengthData.strength === 'fair' && 'Regular'}
                      {passwordStrengthData.strength === 'good' && 'Boa'}
                      {passwordStrengthData.strength === 'strong' && 'Forte'}
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        passwordStrengthData.strength === 'weak' ? 'bg-red-500 w-1/4' :
                        passwordStrengthData.strength === 'fair' ? 'bg-yellow-500 w-2/4' :
                        passwordStrengthData.strength === 'good' ? 'bg-blue-500 w-3/4' :
                        'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="grid grid-cols-2 gap-2">
                      <div className={passwordStrengthData.checks.length ? 'text-green-600' : 'text-gray-400'}>
                        ✓ Pelo menos 8 caracteres
                      </div>
                      <div className={passwordStrengthData.checks.uppercase ? 'text-green-600' : 'text-gray-400'}>
                        ✓ Letra maiúscula
                      </div>
                      <div className={passwordStrengthData.checks.lowercase ? 'text-green-600' : 'text-gray-400'}>
                        ✓ Letra minúscula
                      </div>
                      <div className={passwordStrengthData.checks.number ? 'text-green-600' : 'text-gray-400'}>
                        ✓ Número
                      </div>
                      <div className={passwordStrengthData.checks.symbol ? 'text-green-600' : 'text-gray-400'}>
                        ✓ Símbolo especial
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end space-x-3 pt-4">
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
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Alterar Senha
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Autenticação de Dois Fatores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Autenticação de Dois Fatores
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {profile.security?.twoFactorEnabled 
                ? 'Sua conta está protegida com autenticação de dois fatores'
                : 'Adicione uma camada extra de segurança à sua conta'
              }
            </p>
          </div>
          
          <button
            onClick={handleToggle2FA}
            disabled={isUpdating}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              profile.security?.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                profile.security?.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Dispositivos Confiáveis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dispositivos Confiáveis
        </h3>
        
        {profile.security?.deviceTrust?.trustedDevices && profile.security.deviceTrust.trustedDevices.length > 0 ? (
           <div className="space-y-3">
             {profile.security.deviceTrust.trustedDevices.map((device) => (
               <div key={device.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                 <div className="flex items-center space-x-3">
                   {device.type === 'mobile' ? (
                     <Smartphone className="w-5 h-5 text-gray-400" />
                   ) : (
                     <Monitor className="w-5 h-5 text-gray-400" />
                   )}
                   <div>
                     <p className="text-sm font-medium text-gray-900">{device.name}</p>
                     <p className="text-xs text-gray-500">
                       {device.browser} • {device.os}
                     </p>
                     <p className="text-xs text-gray-500">
                       Último acesso: {formatDistanceToNow(new Date(device.lastUsed), { 
                         addSuffix: true, 
                         locale: ptBR 
                       })}
                     </p>
                   </div>
                 </div>
                 
                 <button
                   onClick={() => handleRemoveDevice(device.id)}
                   disabled={isUpdating}
                   className="inline-flex items-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))}
           </div>
         ) : (
           <p className="text-gray-500 text-sm">Nenhum dispositivo confiável configurado</p>
         )}
      </div>
    </div>
  )
}