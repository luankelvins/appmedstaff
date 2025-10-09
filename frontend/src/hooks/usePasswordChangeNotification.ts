import { useCallback } from 'react'
import { useToastContext } from '../contexts/ToastContext'

interface PasswordChangeNotificationData {
  userEmail: string
  oldPassword: string
  newPassword: string
  changedBy: string
  timestamp: Date
}

export const usePasswordChangeNotification = () => {
  const { success, info } = useToastContext()

  const notifyPasswordChange = useCallback((data: PasswordChangeNotificationData) => {
    // Notificação de sucesso para o administrador
    success(`Senha atualizada com sucesso para ${data.userEmail}`)
    
    // Notificação informativa sobre a mudança
    info(`A senha foi alterada por motivos de segurança. Nova senha: ${data.newPassword}`)
    
    // Log para auditoria
    console.log('Password change notification:', {
      userEmail: data.userEmail,
      changedBy: data.changedBy,
      timestamp: data.timestamp,
      // Não loggar senhas em produção
      ...(import.meta.env.DEV && { 
        oldPassword: data.oldPassword,
        newPassword: data.newPassword 
      })
    })
  }, [success, info]) // Dependências do useCallback

  return {
    notifyPasswordChange
  }
}