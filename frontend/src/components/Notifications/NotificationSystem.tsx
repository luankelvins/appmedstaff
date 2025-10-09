import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

// Interfaces
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
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

// Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Hook para usar notificações
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider')
  }
  return context
}

// Provider
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remover se não for persistente
    if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// Componente individual de notificação
const NotificationItem: React.FC<{
  notification: Notification
  onRemove: (id: string) => void
}> = ({ notification, onRemove }) => {
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

  return (
    <div className={`
      max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border
      ${getBackgroundColor()}
      transform transition-all duration-300 ease-in-out
      hover:scale-105
    `}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            {notification.message && (
              <p className="mt-1 text-sm text-gray-500">
                {notification.message}
              </p>
            )}
            {notification.action && (
              <div className="mt-3">
                <button
                  onClick={notification.action.onClick}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  {notification.action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => onRemove(notification.id)}
            >
              <span className="sr-only">Fechar</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Container de notificações
const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
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

// Hook para notificações de API
export const useApiNotifications = () => {
  const { addNotification } = useNotifications()

  const notifySuccess = useCallback((title: string, message?: string) => {
    addNotification({
      type: 'success',
      title,
      message
    })
  }, [addNotification])

  const notifyError = useCallback((title: string, message?: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      persistent: true
    })
  }, [addNotification])

  const notifyWarning = useCallback((title: string, message?: string) => {
    addNotification({
      type: 'warning',
      title,
      message
    })
  }, [addNotification])

  const notifyInfo = useCallback((title: string, message?: string) => {
    addNotification({
      type: 'info',
      title,
      message
    })
  }, [addNotification])

  const notifyValidationError = useCallback((errors: Record<string, string>) => {
    const errorMessages = Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ')

    addNotification({
      type: 'error',
      title: 'Erro de Validação',
      message: errorMessages,
      persistent: true
    })
  }, [addNotification])

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyValidationError
  }
}