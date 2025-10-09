import React from 'react'
import { Clock, AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../UI/Card'
import { Badge } from '../UI/Badge'

interface SecurityAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  message: string
  timestamp: string
  source: string
  resolved: boolean
}

interface SecurityHistoryProps {
  period: string
}

const SecurityHistory: React.FC<SecurityHistoryProps> = ({ period }) => {
  // Dados simulados baseados no período
  const getAlertsForPeriod = (period: string): SecurityAlert[] => {
    const baseAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'critical',
        message: 'Múltiplas tentativas de login falharam para usuário admin',
        timestamp: '2025-10-09T19:30:00Z',
        source: 'Sistema de Autenticação',
        resolved: false
      },
      {
        id: '2',
        type: 'warning',
        message: 'Rate limiting ativado para IP 192.168.1.100',
        timestamp: '2025-10-09T19:25:00Z',
        source: 'Middleware de Segurança',
        resolved: true
      },
      {
        id: '3',
        type: 'info',
        message: 'Backup de segurança concluído com sucesso',
        timestamp: '2025-10-09T19:00:00Z',
        source: 'Sistema de Backup',
        resolved: true
      },
      {
        id: '4',
        type: 'critical',
        message: 'Tentativa de acesso não autorizado detectada',
        timestamp: '2025-10-09T18:45:00Z',
        source: 'Sistema de Monitoramento',
        resolved: true
      },
      {
        id: '5',
        type: 'warning',
        message: 'Uso elevado de CPU detectado no servidor',
        timestamp: '2025-10-09T18:30:00Z',
        source: 'Monitor de Performance',
        resolved: false
      }
    ]

    // Filtrar baseado no período
    const now = new Date()
    const periodHours = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 168,
      '30d': 720
    }[period] || 24

    return baseAlerts.filter(alert => {
      const alertTime = new Date(alert.timestamp)
      const diffHours = (now.getTime() - alertTime.getTime()) / (1000 * 60 * 60)
      return diffHours <= periodHours
    })
  }

  const alerts = getAlertsForPeriod(period)

  const getAlertIcon = (type: string, resolved: boolean) => {
    if (resolved) return <CheckCircle className="w-4 h-4 text-green-500" />
    
    switch (type) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getAlertBadge = (type: string, resolved: boolean) => {
    if (resolved) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Resolvido</Badge>
    }

    switch (type) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Crítico</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Aviso</Badge>
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Info</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Desconhecido</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Histórico de Alertas ({alerts.length} registros)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum alerta encontrado para o período selecionado</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-colors ${
                  alert.resolved 
                    ? 'bg-gray-50 border-gray-200' 
                    : alert.type === 'critical' 
                      ? 'bg-red-50 border-red-200'
                      : alert.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getAlertIcon(alert.type, alert.resolved)}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${alert.resolved ? 'text-gray-600' : 'text-gray-900'}`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {alert.source}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-2">
                    {getAlertBadge(alert.type, alert.resolved)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SecurityHistory