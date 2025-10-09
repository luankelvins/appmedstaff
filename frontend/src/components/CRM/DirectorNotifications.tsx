import React, { useState, useEffect } from 'react'
import { Bell, AlertTriangle, Clock, Users, TrendingUp, X } from 'lucide-react'
import { leadMonitoringService } from '../../utils/leadMonitoringService'
import { leadDistributionService } from '../../utils/leadDistributionService'
import { leadTaskService } from '../../utils/leadTaskService'

interface DirectorNotification {
  id: string
  type: 'escalation' | 'timeout' | 'capacity_alert' | 'performance_alert'
  title: string
  message: string
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  leadId?: string
  responsavelId?: string
  read: boolean
  actionRequired: boolean
}

interface NotificationStats {
  totalUnread: number
  escalations: number
  timeouts: number
  capacityAlerts: number
  performanceAlerts: number
}

export const DirectorNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<DirectorNotification[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    totalUnread: 0,
    escalations: 0,
    timeouts: 0,
    capacityAlerts: 0,
    performanceAlerts: 0
  })
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all')

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 60000) // Atualizar a cada minuto
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      // Obter estatísticas de monitoramento
      const monitoringStats = leadMonitoringService.obterEstatisticas()
      
      // Obter capacidade da equipe
      const capacidadeEquipe = await leadDistributionService.verificarCapacidadeEquipe()
      
      // Obter estatísticas de tarefas
      const taskStats = await leadTaskService.getEstatisticasTarefas()

      // Gerar notificações baseadas nos dados
      const newNotifications: DirectorNotification[] = []

      // Notificações de escalação
      if (monitoringStats.totalEscalacoes > 0) {
        newNotifications.push({
          id: `escalation_${Date.now()}`,
          type: 'escalation',
          title: 'Leads Escalados',
          message: `${monitoringStats.totalEscalacoes} leads foram escalados para sua análise`,
          timestamp: new Date(),
          priority: 'high',
          read: false,
          actionRequired: true
        })
      }

      // Notificações de capacidade
      if (capacidadeEquipe.percentualUso > 90) {
        newNotifications.push({
          id: `capacity_${Date.now()}`,
          type: 'capacity_alert',
          title: 'Capacidade da Equipe Crítica',
          message: `Equipe está ${capacidadeEquipe.percentualUso.toFixed(1)}% da capacidade máxima`,
          timestamp: new Date(),
          priority: 'critical',
          read: false,
          actionRequired: true
        })
      } else if (capacidadeEquipe.percentualUso > 75) {
        newNotifications.push({
          id: `capacity_warning_${Date.now()}`,
          type: 'capacity_alert',
          title: 'Capacidade da Equipe Alta',
          message: `Equipe está ${capacidadeEquipe.percentualUso.toFixed(1)}% da capacidade máxima`,
          timestamp: new Date(),
          priority: 'medium',
          read: false,
          actionRequired: false
        })
      }

      // Notificações de performance
      if (taskStats.vencidas > 5) {
        newNotifications.push({
          id: `performance_${Date.now()}`,
          type: 'performance_alert',
          title: 'Muitas Tarefas Vencidas',
          message: `${taskStats.vencidas} tarefas estão vencidas na equipe`,
          timestamp: new Date(),
          priority: 'high',
          read: false,
          actionRequired: true
        })
      }

      // Notificações de timeout
      if (monitoringStats.totalRedistribuicoes > 0) {
        newNotifications.push({
          id: `timeout_${Date.now()}`,
          type: 'timeout',
          title: 'Redistribuições por Timeout',
          message: `${monitoringStats.totalRedistribuicoes} leads foram redistribuídos por timeout`,
          timestamp: new Date(),
          priority: 'medium',
          read: false,
          actionRequired: false
        })
      }

      setNotifications(prev => {
        // Mesclar com notificações existentes, evitando duplicatas
        const existingIds = prev.map(n => n.id)
        const filteredNew = newNotifications.filter(n => !existingIds.includes(n.id))
        return [...prev, ...filteredNew].slice(-50) // Manter apenas as 50 mais recentes
      })

      // Atualizar estatísticas
      const unreadNotifications = notifications.filter(n => !n.read)
      setStats({
        totalUnread: unreadNotifications.length,
        escalations: unreadNotifications.filter(n => n.type === 'escalation').length,
        timeouts: unreadNotifications.filter(n => n.type === 'timeout').length,
        capacityAlerts: unreadNotifications.filter(n => n.type === 'capacity_alert').length,
        performanceAlerts: unreadNotifications.filter(n => n.type === 'performance_alert').length
      })

    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read)
      case 'critical':
        return notifications.filter(n => n.priority === 'critical' || n.priority === 'high')
      default:
        return notifications
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'escalation': return <TrendingUp className="w-4 h-4" />
      case 'timeout': return <Clock className="w-4 h-4" />
      case 'capacity_alert': return <Users className="w-4 h-4" />
      case 'performance_alert': return <AlertTriangle className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {stats.totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {stats.totalUnread > 9 ? '9+' : stats.totalUnread}
          </span>
        )}
      </button>

      {/* Painel de notificações */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Cabeçalho */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notificações do Diretor
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Estatísticas rápidas */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="text-lg font-bold text-red-600">{stats.escalations}</div>
                <div className="text-xs text-red-600">Escalações</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded">
                <div className="text-lg font-bold text-orange-600">{stats.capacityAlerts}</div>
                <div className="text-xs text-orange-600">Capacidade</div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded ${
                  filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm rounded ${
                  filter === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Não lidas
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-3 py-1 text-sm rounded ${
                  filter === 'critical' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Críticas
              </button>
            </div>
            
            {stats.totalUnread > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {getFilteredNotifications().length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação encontrada
              </div>
            ) : (
              getFilteredNotifications().map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded ${getPriorityColor(notification.priority)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {notification.timestamp.toLocaleTimeString()}
                        </span>
                        
                        <div className="flex space-x-2">
                          {notification.actionRequired && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                              Ação necessária
                            </span>
                          )}
                          
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Marcar como lida
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DirectorNotifications