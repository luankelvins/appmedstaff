import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card'
import { Button } from '@/components/UI/Button'
import { Badge } from '@/components/UI/Badge'
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  RefreshCw,
  Download,
  Trash2,
  Settings,
  AlertTriangle
} from 'lucide-react'
import { widgetDataService } from '@/services/widgetDataService'
import type { FullReport } from '@/services/performanceMonitor'

export const PerformanceDashboard: React.FC = () => {
  const [report, setReport] = useState<FullReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [latency, setLatency] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'operations' | 'system' | 'settings'>('operations')

  const loadPerformanceData = async () => {
    try {
      setLoading(true)
      const [fullReport, systemLatency] = await Promise.all([
        widgetDataService.getPerformanceReport(),
        widgetDataService.testSystemLatency()
      ])
      
      setReport(fullReport)
      setLatency(systemLatency)
    } catch (error) {
      console.error('Erro ao carregar dados de performance:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        setRefreshInterval(null)
      }
      setAutoRefresh(false)
    } else {
      const interval = setInterval(loadPerformanceData, 30000) // 30 segundos
      setRefreshInterval(interval)
      setAutoRefresh(true)
    }
  }

  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      const data = widgetDataService.exportPerformanceData(format)
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `performance-data-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
    }
  }

  const handleCleanupData = async () => {
    try {
      widgetDataService.cleanupPerformanceData(24) // Limpar dados de mais de 24h
      await loadPerformanceData()
    } catch (error) {
      console.error('Erro ao limpar dados:', error)
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  const getPerformanceStatus = (duration: number) => {
    if (duration < 100) return { color: 'bg-green-500', label: 'Excelente' }
    if (duration < 500) return { color: 'bg-yellow-500', label: 'Bom' }
    if (duration < 1000) return { color: 'bg-orange-500', label: 'Lento' }
    return { color: 'bg-red-500', label: 'Crítico' }
  }

  useEffect(() => {
    loadPerformanceData()
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [])

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados de performance...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Performance</h2>
          <p className="text-gray-600">
            Monitoramento em tempo real do sistema
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPerformanceData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={toggleAutoRefresh}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Pausar' : 'Auto-refresh'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportData('json')}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCleanupData}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Latência do Sistema</p>
                <p className="text-2xl font-bold">
                  {latency ? formatDuration(latency) : '--'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Operações Totais</p>
                <p className="text-2xl font-bold">
                  {report?.operations.totalOperations || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">
                  {report?.operations.totalOperations 
                    ? Math.round((report.operations.successfulOperations / report.operations.totalOperations) * 100)
                    : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold">
                  {report?.operations.averageDuration 
                    ? formatDuration(report.operations.averageDuration)
                    : '--'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navegação por abas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('operations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'operations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Operações
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'system'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sistema
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Configurações
          </button>
        </nav>
      </div>

      {/* Conteúdo das abas */}
      {activeTab === 'operations' && (
        <Card>
          <CardHeader>
            <CardTitle>Operações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report?.operations.operations.slice(0, 10).map((op, index) => {
                const status = getPerformanceStatus(op.duration)
                return (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${status.color}`} />
                      <span className="font-medium">{op.name}</span>
                      <Badge variant={op.success ? "default" : "destructive"}>
                        {op.success ? 'Sucesso' : 'Erro'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{formatDuration(op.duration)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(op.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Memória</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Uso de Memória</span>
                  <span>{report?.system.memory.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${report?.system.memory.percentage || 0}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {formatBytes(report?.system.memory.used || 0)} / {formatBytes(report?.system.memory.total || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rede</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Tipo de Conexão:</span>
                <Badge>{report?.system.network.effectiveType || 'N/A'}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Velocidade:</span>
                <span className="text-sm font-mono">
                  {report?.system.network.downlink || 0} Mbps
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">RTT:</span>
                <span className="text-sm font-mono">
                  {report?.system.network.rtt || 0}ms
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Monitoramento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Monitoramento Automático</h4>
                <p className="text-sm text-gray-600">
                  Coleta automática de métricas de performance
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  widgetDataService.startPerformanceMonitoring()
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Iniciar
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Configurar Alertas</h4>
                <p className="text-sm text-gray-600">
                  Definir limites para alertas de performance
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  widgetDataService.setupPerformanceAlerts()
                }}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PerformanceDashboard