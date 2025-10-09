import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

// ==================== INTERFACES ====================

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  timestamp: number
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  success: (title: string, message?: string, options?: Partial<Notification>) => string
  error: (title: string, message?: string, options?: Partial<Notification>) => string
  warning: (title: string, message?: string, options?: Partial<Notification>) => string
  info: (title: string, message?: string, options?: Partial<Notification>) => string
}

// ==================== CONTEXTO ====================

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider')
  }
  return context
}

// ==================== PROVIDER ====================

interface NotificationProviderProps {
  children: React.ReactNode
  maxNotifications?: number
  defaultDuration?: number
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 5,
  defaultDuration = 5000
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? defaultDuration
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      // Limitar número máximo de notificações
      return updated.slice(0, maxNotifications)
    })

    // Auto-remover se não for persistente
    if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [defaultDuration, maxNotifications])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Métodos de conveniência
  const success = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, type: 'success', title, message })
  }, [addNotification])

  const error = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, type: 'error', title, message, persistent: true })
  }, [addNotification])

  const warning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, type: 'warning', title, message })
  }, [addNotification])

  const info = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, type: 'info', title, message })
  }, [addNotification])

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// ==================== COMPONENTE DE NOTIFICAÇÃO ====================

interface NotificationItemProps {
  notification: Notification
  onRemove: (id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onRemove(notification.id)
    }, 300) // Duração da animação de saída
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isRemoving ? 'scale-95' : 'scale-100'}
        max-w-sm w-full ${getBackgroundColor()} border rounded-lg shadow-lg pointer-events-auto
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>
              {notification.title}
            </p>
            {notification.message && (
              <p className={`mt-1 text-sm ${getTextColor()} opacity-90`}>
                {notification.message}
              </p>
            )}
            {notification.action && (
              <div className="mt-3">
                <button
                  onClick={notification.action.onClick}
                  className={`text-sm font-medium ${getTextColor()} hover:opacity-80 underline`}
                >
                  {notification.action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleRemove}
              className={`inline-flex ${getTextColor()} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded-md`}
            >
              <span className="sr-only">Fechar</span>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== CONTAINER DE NOTIFICAÇÕES ====================

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  )
}

// ==================== HOOK PARA NOTIFICAÇÕES DE API ====================

export const useApiNotifications = () => {
  const { success, error, warning, info } = useNotifications()

  const notifySuccess = useCallback((message: string, title: string = 'Sucesso') => {
    return success(title, message)
  }, [success])

  const notifyError = useCallback((err: Error | string, title: string = 'Erro') => {
    const message = typeof err === 'string' ? err : err.message
    return error(title, message)
  }, [error])

  const notifyApiError = useCallback((err: any, title: string = 'Erro na API') => {
    let message = 'Ocorreu um erro inesperado'
    
    if (err?.message) {
      message = err.message
    } else if (err?.error) {
      message = err.error
    } else if (typeof err === 'string') {
      message = err
    }

    return error(title, message)
  }, [error])

  const notifyValidationError = useCallback((errors: Record<string, string[]>) => {
    const firstField = Object.keys(errors)[0]
    const firstError = errors[firstField]?.[0]
    
    if (firstError) {
      return error('Erro de validação', firstError)
    }
    
    return error('Erro de validação', 'Verifique os dados informados')
  }, [error])

  return {
    notifySuccess,
    notifyError,
    notifyApiError,
    notifyValidationError,
    notifyWarning: warning,
    notifyInfo: info
  }
}

export default NotificationProvider