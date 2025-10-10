import React from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Target,
  Activity,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useWebSocketDashboard } from '../../hooks/useWebSocketDashboard';
import { usePollingDashboard } from '../../hooks/usePollingDashboard';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <div className={`w-6 h-6 bg-${color}-300 rounded`}></div>
          </div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-4">
          <div className="w-20 h-6 bg-gray-200 rounded mb-2"></div>
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 ${trend.isPositive ? '' : 'rotate-180'}`} />
            <span className="text-sm font-medium">{trend.value.toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </h3>
        <p className="text-sm text-gray-600">{title}</p>
        {trend && (
          <p className="text-xs text-gray-500 mt-1">{trend.period}</p>
        )}
      </div>
    </div>
  );
};

const IntegratedDashboard: React.FC = () => {
  const { 
    data, 
    loading, 
    error, 
    lastUpdated, 
    refresh 
  } = useDashboardData({
    autoRefresh: false, // Desabilitado quando WebSocket está ativo
    refreshInterval: 300,
    enablePolling: false,
    pollingInterval: 30
  });

  const {
    isConnected,
    connectionState,
    lastMessage,
    error: wsError,
    connect,
    disconnect,
    requestUpdate
  } = useWebSocketDashboard({
    autoConnect: true,
    enableRealTimeUpdates: true,
    subscribeToNotifications: true,
    subscribeToMetrics: true
  });

  const {
    status: pollingStatus,
    start: startPolling,
    stop: stopPolling,
    pause: pausePolling,
    resume: resumePolling,
    runNow: runPollingNow,
    isEnabled: pollingEnabled,
    setEnabled: setPollingEnabled
  } = usePollingDashboard({
    autoStart: !isConnected, // Inicia polling apenas se WebSocket não estiver conectado
    onDataUpdate: (type, data) => {
      console.log(`Dados atualizados via polling: ${type}`, data);
    },
    onError: (type, error) => {
      console.error(`Erro no polling: ${type}`, error);
    }
  });

  // Componente de status WebSocket
  const WebSocketStatus = () => (
    <div className="flex items-center space-x-2 text-sm">
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-green-600">WebSocket Conectado</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-red-600">WebSocket Desconectado</span>
        </>
      )}
      <span className="text-gray-500">({connectionState})</span>
      {lastMessage && (
        <span className="text-xs text-gray-400">
          Última atualização: {new Date(lastMessage.timestamp).toLocaleTimeString()}
        </span>
      )}
    </div>
  );

  // Componente de status de polling
  const PollingStatus = () => (
    <div className="flex items-center space-x-2 text-sm">
      {pollingStatus.isActive ? (
        <>
          <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
          <span className="text-blue-600">Polling Ativo</span>
        </>
      ) : (
        <>
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Polling Inativo</span>
        </>
      )}
      {pollingStatus.lastUpdate && (
        <span className="text-xs text-gray-400">
          Última atualização: {pollingStatus.lastUpdate.toLocaleTimeString()}
        </span>
      )}
      {pollingStatus.errorCount > 0 && (
        <span className="text-xs text-red-500">
          Erros: {pollingStatus.errorCount}
        </span>
      )}
    </div>
  );

  const handleRefresh = () => {
    refresh();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Integrado
            </h1>
            <p className="text-gray-600">
              Dados em tempo real do sistema
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Última atualização: {lastUpdated.toLocaleString('pt-BR')}
              </p>
            )}
            <WebSocketStatus />
            <PollingStatus />
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            
            {isConnected ? (
              <button
                onClick={disconnect}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <WifiOff className="h-4 w-4" />
                <span>Desconectar</span>
              </button>
            ) : (
              <button
                onClick={connect}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Wifi className="h-4 w-4" />
                <span>Conectar</span>
              </button>
            )}
            
            <button
              onClick={() => requestUpdate()}
              disabled={!isConnected}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Activity className="h-4 w-4" />
              <span>Solicitar Atualização</span>
            </button>

            {/* Controles de Polling */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPollingEnabled(!pollingEnabled)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  pollingEnabled 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>{pollingEnabled ? 'Desabilitar' : 'Habilitar'} Polling</span>
              </button>

              {pollingEnabled && (
                <>
                  {pollingStatus.isActive ? (
                    <button
                      onClick={pausePolling}
                      className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Pausar</span>
                    </button>
                  ) : (
                    <button
                      onClick={resumePolling}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Activity className="h-4 w-4" />
                      <span>Retomar</span>
                    </button>
                  )}

                  <button
                    onClick={() => runPollingNow()}
                    className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Executar Agora</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Estatísticas Gerais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Usuários"
              value={data.quickStats?.totalUsers || 0}
              icon={Users}
              color="blue"
              loading={loading}
              trend={{
                value: 12.5,
                isPositive: true,
                period: 'vs mês anterior'
              }}
            />
            <MetricCard
              title="Usuários Ativos"
              value={data.quickStats?.activeUsers || 0}
              icon={Activity}
              color="green"
              loading={loading}
              trend={{
                value: 8.3,
                isPositive: true,
                period: 'vs semana anterior'
              }}
            />
            <MetricCard
              title="Tarefas Concluídas"
              value={data.quickStats?.completedTasks || 0}
              icon={CheckCircle}
              color="emerald"
              loading={loading}
              trend={{
                value: data.quickStats?.taskCompletionRate || 0,
                isPositive: (data.quickStats?.taskCompletionRate || 0) > 80,
                period: 'taxa de conclusão'
              }}
            />
            <MetricCard
              title="Taxa de Conversão"
              value={`${(data.quickStats?.conversionRate || 0).toFixed(1)}%`}
              icon={Target}
              color="purple"
              loading={loading}
              trend={{
                value: 5.2,
                isPositive: true,
                period: 'vs mês anterior'
              }}
            />
          </div>
        </div>

        {/* Financial Metrics */}
        {data.financialMetrics && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Métricas Financeiras
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard
                title="Receita Total"
                value={`R$ ${data.financialMetrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                icon={DollarSign}
                color="green"
                loading={loading}
              />
              <MetricCard
                title="Receita Mensal"
                value={`R$ ${data.financialMetrics.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                icon={TrendingUp}
                color="blue"
                loading={loading}
              />
              <MetricCard
                title="Margem de Lucro"
                value={`${data.financialMetrics.profitMargin.toFixed(1)}%`}
                icon={Target}
                color="purple"
                loading={loading}
                trend={{
                  value: 3.2,
                  isPositive: data.financialMetrics.profitMargin > 20,
                  period: 'vs mês anterior'
                }}
              />
            </div>
          </div>
        )}

        {/* System Metrics */}
        {data.systemMetrics && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Métricas do Sistema
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Uptime"
                value={`${data.systemMetrics.uptime.toFixed(1)}%`}
                icon={Activity}
                color="green"
                loading={loading}
              />
              <MetricCard
                title="Tempo de Resposta"
                value={`${data.systemMetrics.responseTime}ms`}
                icon={Clock}
                color="blue"
                loading={loading}
              />
              <MetricCard
                title="Uso de CPU"
                value={`${data.systemMetrics.cpuUsage.toFixed(1)}%`}
                icon={Activity}
                color={data.systemMetrics.cpuUsage > 80 ? 'red' : 'yellow'}
                loading={loading}
              />
              <MetricCard
                title="Uso de Memória"
                value={`${data.systemMetrics.memoryUsage.toFixed(1)}%`}
                icon={Activity}
                color={data.systemMetrics.memoryUsage > 80 ? 'red' : 'green'}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Notifications */}
        {data.notifications && data.notifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Notificações Recentes
            </h2>
            <div className="bg-white rounded-lg shadow">
              {data.notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${
                    notification.type === 'error' ? 'border-red-500 bg-red-50' :
                    notification.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    notification.type === 'success' ? 'border-green-500 bg-green-50' :
                    'border-blue-500 bg-blue-50'
                  } ${notification.read ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegratedDashboard;