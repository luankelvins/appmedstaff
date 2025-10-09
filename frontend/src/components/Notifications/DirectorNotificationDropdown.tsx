import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, Users, TrendingDown, X, Eye, CheckCircle } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'
import { directorNotificationService, DirectorAlert, DirectorDashboardData } from '../../utils/directorNotificationService'

const DirectorNotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [alerts, setAlerts] = useState<DirectorAlert[]>([])
  const [dashboardData, setDashboardData] = useState<DirectorDashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const { hasRole, user } = usePermissions()

  // Verificar se o usuário é diretor comercial
  const isDirectorComercial = hasRole('diretor_comercial') || user?.role.slug === 'diretor_comercial'

  useEffect(() => {
    if (isDirectorComercial) {
      loadNotifications()
      // Atualizar a cada 5 minutos
      const interval = setInterval(loadNotifications, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isDirectorComercial])

  const loadNotifications = async () => {
    if (!isDirectorComercial) return
    
    setLoading(true)
    try {
      const [alertsData, dashboard] = await Promise.all([
        directorNotificationService.getAlertasAtivos(),
        directorNotificationService.gerarDashboardData()
      ])
      setAlerts(alertsData)
      setDashboardData(dashboard)
    } catch (error) {
      console.error('Erro ao carregar notificações do diretor:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      await directorNotificationService.resolverAlerta(alertId)
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    } catch (error) {
      console.error('Erro ao resolver alerta:', error)
    }
  }

  const getAlertIcon = (type: DirectorAlert['type']) => {
    switch (type) {
      case 'escalation':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'capacity_critical':
        return <Users className="w-4 h-4 text-orange-500" />
      case 'performance_issue':
        return <TrendingDown className="w-4 h-4 text-yellow-500" />
      case 'timeout_pattern':
        return <Clock className="w-4 h-4 text-red-500" />
      case 'team_overload':
        return <Users className="w-4 h-4 text-red-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getAlertColor = (severity: DirectorAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50'
      case 'high':
        return 'border-l-orange-500 bg-orange-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      default:
        return 'border-l-gray-300 bg-gray-50'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    return `${Math.floor(diffInMinutes / 1440)}d atrás`
  }

  // Não renderizar se não for diretor comercial
  if (!isDirectorComercial) {
    return null
  }

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical')
  const hasUnresolvedAlerts = alerts.length > 0

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors duration-200 ${
          hasUnresolvedAlerts 
            ? 'text-red-600 hover:bg-red-50' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="Notificações da Diretoria"
      >
        <AlertTriangle className="w-5 h-5" />
        {hasUnresolvedAlerts && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {alerts.length > 9 ? '9+' : alerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Alertas da Diretoria
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {dashboardData && (
                <div className="mt-2 text-sm text-gray-600">
                  Equipe: {dashboardData.teamPerformance.length} membros • 
                  Capacidade: {dashboardData.teamPerformance.reduce((acc, m) => acc + m.utilizacao, 0) / dashboardData.teamPerformance.length || 0}%
                </div>
              )}
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Carregando alertas...</p>
                </div>
              ) : alerts.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum alerta ativo</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Tudo funcionando normalmente
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border-l-4 ${getAlertColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {alert.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {alert.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTime(alert.timestamp.toISOString())}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                alert.severity === 'critical' 
                                  ? 'bg-red-100 text-red-800'
                                  : alert.severity === 'high'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {alert.severity === 'critical' ? 'Crítico' : 
                                 alert.severity === 'high' ? 'Alto' : 'Médio'}
                              </span>
                            </div>
                            {dashboardData?.recommendations && dashboardData.recommendations.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Recomendações:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {dashboardData.recommendations.slice(0, 2).map((rec, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="text-gray-400 mr-1">•</span>
                                      {rec.title}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Resolver alerta"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    // Aqui poderia navegar para uma página de dashboard detalhado
                    setIsOpen(false)
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver Dashboard Completo
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default DirectorNotificationDropdown