import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  X,
  Eye,
  ArrowRight
} from 'lucide-react'
import DashboardWidget from '../DashboardWidget'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'system' | 'task' | 'commercial' | 'financial' | 'operational'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  read: boolean
  createdAt: string
  actionUrl?: string
}

const NotificationsWidget: React.FC<BaseWidgetProps> = ({ 
  onRefresh, 
  onConfigure, 
  className 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(undefined)
      
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Nova tarefa atribuída',
          message: 'Você foi designado para revisar a proposta comercial',
          type: 'info',
          category: 'task',
          priority: 'high',
          read: false,
          createdAt: '2024-01-15T10:30:00Z',
          actionUrl: '/tasks/123'
        },
        {
          id: '2',
          title: 'Pagamento vencido',
          message: 'Fatura #1234 está vencida há 3 dias',
          type: 'warning',
          category: 'financial',
          priority: 'urgent',
          read: false,
          createdAt: '2024-01-15T09:15:00Z',
          actionUrl: '/financial/invoices/1234'
        },
        {
          id: '3',
          title: 'Lead convertido',
          message: 'Lead "Clínica São Paulo" foi convertido em cliente',
          type: 'success',
          category: 'commercial',
          priority: 'medium',
          read: false,
          createdAt: '2024-01-15T08:45:00Z',
          actionUrl: '/clients/456'
        },
        {
          id: '4',
          title: 'Backup concluído',
          message: 'Backup automático do sistema realizado com sucesso',
          type: 'success',
          category: 'system',
          priority: 'low',
          read: true,
          createdAt: '2024-01-14T23:00:00Z'
        },
        {
          id: '5',
          title: 'Erro no processamento',
          message: 'Falha ao processar documento. Verifique os dados',
          type: 'error',
          category: 'operational',
          priority: 'high',
          read: false,
          createdAt: '2024-01-14T16:20:00Z',
          actionUrl: '/documents/error-log'
        }
      ]
      
      setNotifications(mockNotifications)
    } catch (err) {
      setError('Erro ao carregar notificações')
      console.error('Error loading notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleRefresh = () => {
    loadNotifications()
    onRefresh?.()
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const handleDismiss = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    )
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getNotificationColor = (type: Notification['type'], read: boolean) => {
    const baseClasses = read ? 'opacity-60' : ''
    
    switch (type) {
      case 'success':
        return `bg-green-50 border-green-200 ${baseClasses}`
      case 'warning':
        return `bg-yellow-50 border-yellow-200 ${baseClasses}`
      case 'error':
        return `bg-red-50 border-red-200 ${baseClasses}`
      default:
        return `bg-blue-50 border-blue-200 ${baseClasses}`
    }
  }

  const getPriorityIndicator = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      case 'high':
        return <div className="w-2 h-2 bg-orange-500 rounded-full" />
      case 'medium':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}min`
    } else if (diffInHours < 24) {
      return `${diffInHours}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d`
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <DashboardWidget
      id="notifications"
      title="Notificações"
      subtitle={unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
      loading={loading}
      error={error}
      size="small"
      refreshable
      configurable
      onRefresh={handleRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {notifications.slice(0, 6).map((notification) => (
          <div
            key={notification.id}
            className={`
              p-3 rounded-lg border transition-all hover:shadow-sm
              ${getNotificationColor(notification.type, notification.read)}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                    {notification.title}
                  </h4>
                  <div className="flex items-center space-x-1 ml-2">
                    {getPriorityIndicator(notification.priority)}
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(notification.createdAt)}
                    </span>
                  </div>
                </div>
                
                <p className={`text-xs mb-2 ${notification.read ? 'text-gray-500' : 'text-gray-600'}`}>
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    notification.category === 'system' ? 'bg-gray-100 text-gray-600' :
                    notification.category === 'task' ? 'bg-blue-100 text-blue-600' :
                    notification.category === 'commercial' ? 'bg-purple-100 text-purple-600' :
                    notification.category === 'financial' ? 'bg-green-100 text-green-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {notification.category}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Marcar como lida"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Dispensar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {notification.actionUrl && (
                      <button
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalhes"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {notifications.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        )}
        
        {notifications.length > 6 && (
          <div className="pt-3 border-t border-gray-200">
            <button className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
              <span>Ver todas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </DashboardWidget>
  )
}

export default NotificationsWidget