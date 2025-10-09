import React, { useState, Suspense } from 'react'
import { RefreshCw, Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, Clock, Activity } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './UI/Card'
import { Alert, AlertDescription } from './UI/Alert'
import { Badge } from './UI/Badge'
import { SecurityChart, SecurityFilters, SecurityHistory } from './SecurityDashboard/index'
import { useSecurityMetrics } from '../hooks/useSecurityMetrics'

interface SecurityMetrics {
  timestamp: string;
  period: string;
  summary: {
    totalAlerts: number;
    criticalAlerts: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
    lastUpdate: string;
  };
  trends: {
    alertsLast1h: number;
    alertsLast6h: number;
    alertsLast24h: number;
  };
}

const SecurityDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const { metrics, loading, error, lastUpdate, refresh, isFromCache } = useSecurityMetrics(selectedPeriod);

  const handleRefresh = () => {
    refresh()
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    // O hook useSecurityMetrics irá automaticamente buscar novos dados quando o período mudar
  }

  const handleExport = () => {
    if (!metrics) return

    const exportData = {
      timestamp: new Date().toISOString(),
      period: selectedPeriod,
      metrics: metrics,
      generatedBy: 'Sistema de Segurança MedStaff'
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-seguranca-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando métricas de segurança...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar métricas: {error}
          <button 
            onClick={handleRefresh}
            className="ml-2 text-blue-600 hover:text-blue-800 underline"
          >
            Tentar novamente
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert className="m-4">
        <AlertDescription>
          Nenhuma métrica disponível no momento.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Segurança</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </span>
              {isFromCache() && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                  Cache
                </Badge>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
        </div>
      </div>

      {/* Status Geral do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getHealthIcon(metrics.summary.systemHealth)}
              <span className="text-lg font-semibold">
                Status: {metrics.summary.systemHealth === 'healthy' ? 'Saudável' : 
                        metrics.summary.systemHealth === 'warning' ? 'Atenção' : 'Crítico'}
              </span>
            </div>
            <Badge className={getHealthColor(metrics.summary.systemHealth)}>
              {metrics.summary.systemHealth.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Alertas (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {metrics.summary.totalAlerts}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {metrics.summary.criticalAlerts}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Requerem atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Alertas Recentes (1h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {metrics.trends.alertsLast1h}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Última hora
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tendências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Tendências de Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Última 1 hora</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((metrics.trends.alertsLast1h / 10) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold">{metrics.trends.alertsLast1h}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Últimas 6 horas</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((metrics.trends.alertsLast6h / 50) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold">{metrics.trends.alertsLast6h}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Últimas 24 horas</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((metrics.trends.alertsLast24h / 100) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold">{metrics.trends.alertsLast24h}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros e Ações */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>}>
        <SecurityFilters
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          onExport={handleExport}
        />
      </Suspense>

      {/* Gráfico de Tendências */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
        <SecurityChart
          title="Distribuição de Alertas por Período"
          data={[
            { label: 'Última hora', value: metrics.trends.alertsLast1h },
            { label: 'Últimas 6 horas', value: metrics.trends.alertsLast6h },
            { label: 'Últimas 24 horas', value: metrics.trends.alertsLast24h }
          ]}
          color="#EF4444"
        />
      </Suspense>

      {/* Histórico de Alertas */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>}>
        <SecurityHistory period={selectedPeriod} />
      </Suspense>

      {/* Alertas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-sm">Tentativas de login bloqueadas</span>
              </div>
              <Badge className="bg-red-100 text-red-800 border-red-200">Crítico</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-sm">Rate limiting ativado</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Aviso</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Sistema funcionando normalmente</span>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">Info</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Período de análise:</span>
              <span className="ml-2">{metrics.period}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Última atualização:</span>
              <span className="ml-2">
                {new Date(metrics.summary.lastUpdate).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;