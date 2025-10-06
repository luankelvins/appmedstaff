import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card'
import { Badge } from '../UI/Badge'
import { Button } from '../UI/Button'
import { 
  useSecurityValidation, 
  useComplianceValidation, 
  useRiskAnalysis,
  useSecurityMonitoring 
} from '../../hooks/useSecurityValidation'
import { SecurityAlert } from '../../services/securityValidationService'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity,
  Eye,
  Clock,
  Users,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface SecurityDashboardProps {
  className?: string
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className }) => {
  const {
    alerts,
    metrics,
    loading,
    error,
    getAlerts,
    resolveAlert,
    refreshMetrics,
    getUnresolvedAlertsCount,
    getCriticalAlertsCount,
    getAlertsByType,
    getAlertsBySeverity
  } = useSecurityValidation()

  const { complianceStatus } = useComplianceValidation()
  const { riskLevel, riskFactors } = useRiskAnalysis()
  const { isMonitoring, realtimeAlerts, startMonitoring, stopMonitoring } = useSecurityMonitoring()

  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null)
  const [activeTab, setActiveTab] = useState<'alerts' | 'compliance' | 'metrics' | 'monitoring'>('alerts')

  // Estatísticas rápidas
  const unresolvedCount = getUnresolvedAlertsCount()
  const criticalCount = getCriticalAlertsCount()
  const highSeverityCount = getAlertsBySeverity('high').length
  const mediumSeverityCount = getAlertsBySeverity('medium').length

  // Função para resolver alerta
  const handleResolveAlert = async (alertId: string) => {
    const success = await resolveAlert(alertId, 'current-user-id') // TODO: pegar ID do usuário atual
    if (success) {
      setSelectedAlert(null)
    }
  }

  // Função para obter cor do badge baseado na severidade
  const getSeverityColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  // Função para obter ícone baseado no tipo de alerta
  const getAlertIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'suspicious_activity': return <Eye className="h-4 w-4" />
      case 'data_breach': return <XCircle className="h-4 w-4" />
      case 'unauthorized_access': return <TrendingUp className="h-4 w-4" />
      case 'compliance_violation': return <AlertTriangle className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  // Função para obter cor do nível de risco
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  useEffect(() => {
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(() => {
      refreshMetrics()
      getAlerts({ limit: 50 })
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshMetrics, getAlerts])

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Segurança</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de segurança e conformidade
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isMonitoring ? 'Parar Monitoramento' : 'Iniciar Monitoramento'}
          </Button>
          <Button variant="outline" onClick={() => refreshMetrics()}>
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alertas de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
            <div>
              <h4 className="text-red-800 font-medium">Erro</h4>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Não Resolvidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unresolvedCount}</div>
            <p className="text-xs text-muted-foreground">
              {criticalCount} críticos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível de Risco</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(riskLevel)}`}>
              {riskLevel.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground">
              {riskFactors.length} fatores identificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Conformidade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.complianceScore || 0}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${metrics?.complianceScore || 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalAlerts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.resolvedAlerts || 0} resolvidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navegação por abas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'alerts', label: 'Alertas' },
            { id: 'compliance', label: 'Conformidade' },
            { id: 'metrics', label: 'Métricas' },
            { id: 'monitoring', label: 'Monitoramento' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das abas */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de alertas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Segurança</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Alertas ordenados por severidade e data
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                      <p>Nenhum alerta encontrado</p>
                    </div>
                  ) : (
                    alerts.slice(0, 10).map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAlert?.id === alert.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getAlertIcon(alert.type)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{alert.title}</h4>
                                <Badge variant={getSeverityColor(alert.severity)}>
                                  {alert.severity}
                                </Badge>
                                {alert.resolved && (
                                  <Badge variant="outline">Resolvido</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {alert.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(alert.timestamp).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes do alerta selecionado */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Alerta</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAlert ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">{selectedAlert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedAlert.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Tipo:</span>
                        <span className="text-sm">{selectedAlert.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Severidade:</span>
                        <Badge variant={getSeverityColor(selectedAlert.severity)}>
                          {selectedAlert.severity}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Usuário:</span>
                        <span className="text-sm">{selectedAlert.userId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Data:</span>
                        <span className="text-sm">
                          {new Date(selectedAlert.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {selectedAlert.metadata && (
                      <div>
                        <h5 className="font-medium mb-2">Metadados:</h5>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(selectedAlert.metadata, null, 2)}
                        </pre>
                      </div>
                    )}

                    {!selectedAlert.resolved && (
                      <Button 
                        onClick={() => handleResolveAlert(selectedAlert.id)}
                        className="w-full"
                      >
                        Resolver Alerta
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Selecione um alerta para ver os detalhes
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status de Conformidade</CardTitle>
              <p className="text-sm text-muted-foreground">
                Conformidade com regulamentações
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">LGPD</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${complianceStatus.lgpd.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">{complianceStatus.lgpd.score}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">GDPR</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${complianceStatus.gdpr.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">{complianceStatus.gdpr.score}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">SOX</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${complianceStatus.sox.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">{complianceStatus.sox.score}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">ISO 27001</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${complianceStatus.iso27001.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">{complianceStatus.iso27001.score}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Violações Recentes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Violações de conformidade identificadas
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getAlertsByType('compliance_violation').slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center space-x-3 p-2 border rounded">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
                {getAlertsByType('compliance_violation').length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhuma violação encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total:</span>
                  <span className="font-medium">{metrics?.totalAlerts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Críticos:</span>
                  <span className="font-medium text-red-600">{metrics?.criticalAlerts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Resolvidos:</span>
                  <span className="font-medium text-green-600">{metrics?.resolvedAlerts || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tempo de Resolução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Tempo Médio:</span>
                  <span className="font-medium">
                    {metrics?.averageResolutionTime || 0}h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Score de Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Risco Atual:</span>
                  <span className="font-medium text-orange-600">
                    {metrics?.riskScore || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${metrics?.riskScore || 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <Card>
          <CardHeader>
            <CardTitle>Monitoramento em Tempo Real</CardTitle>
            <p className="text-sm text-muted-foreground">
              Status: {isMonitoring ? 'Ativo' : 'Inativo'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status do Monitoramento:</span>
                <Badge variant={isMonitoring ? "default" : "secondary"}>
                  {isMonitoring ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              {realtimeAlerts.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Alertas Recentes:</h4>
                  <div className="space-y-2">
                    {realtimeAlerts.map((alert, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded">
                        {getAlertIcon(alert.type)}
                        <span className="text-sm">{alert.title}</span>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SecurityDashboard