import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Filter,
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardMetricsService, DashboardMetrics, MetricCard } from '../../utils/dashboardMetricsService';
import { LeadPipelineCard } from '../../types/crm';

interface DashboardSummaryProps {
  leadCards: LeadPipelineCard[];
  refreshInterval?: number; // em segundos
  onRefresh?: () => void;
}

const COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  red: '#EF4444',
  yellow: '#F59E0B',
  purple: '#8B5CF6',
  gray: '#6B7280'
};

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ 
  leadCards, 
  refreshInterval = 300,
  onRefresh 
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricCards, setMetricCards] = useState<MetricCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'time' | 'performance' | 'trends'>('overview');

  useEffect(() => {
    loadMetrics();
    
    // Auto-refresh
    if (refreshInterval > 0) {
      const interval = setInterval(loadMetrics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [leadCards, refreshInterval]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const calculatedMetrics = await dashboardMetricsService.calculateMetrics(leadCards);
      const cards = dashboardMetricsService.generateMetricCards(calculatedMetrics);
      
      setMetrics(calculatedMetrics);
      setMetricCards(cards);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadMetrics();
    onRefresh?.();
  };

  const formatValue = (value: string | number, format: MetricCard['format']): string => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(value);
      case 'time':
        return `${value.toFixed(1)} dias`;
      case 'number':
        return value.toLocaleString('pt-BR');
      default:
        return value.toString();
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getIcon = (iconName: string) => {
    const iconProps = { className: "w-6 h-6" };
    switch (iconName) {
      case 'Users': return <Users {...iconProps} />;
      case 'TrendingUp': return <TrendingUp {...iconProps} />;
      case 'Clock': return <Clock {...iconProps} />;
      case 'Target': return <Target {...iconProps} />;
      case 'AlertTriangle': return <AlertTriangle {...iconProps} />;
      case 'Calendar': return <Calendar {...iconProps} />;
      default: return <Users {...iconProps} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Carregando métricas...</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Erro ao carregar métricas do dashboard</p>
        <button 
          onClick={handleRefresh}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Preparar dados para gráficos
  const stageTimeData = Object.entries(metrics.timeMetrics.tempoMedioPorEstagio).map(([stage, time]) => ({
    stage: stage.replace('_', ' ').toUpperCase(),
    tempo: Number(time.toFixed(1))
  }));

  const trendData = metrics.trends.ultimosSete.novosLeads.map((leads, index) => ({
    dia: `Dia ${index + 1}`,
    novosLeads: leads,
    conversoes: metrics.trends.ultimosSete.conversoes[index],
    perdas: metrics.trends.ultimosSete.perdas[index]
  }));

  const performanceData = Object.entries(metrics.performance.leadsPorResponsavel).map(([responsavel, data]) => ({
    responsavel: responsavel.split(' ')[0], // Primeiro nome apenas
    taxaConversao: Number(data.taxaConversao.toFixed(1)),
    totalLeads: data.total
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Métricas</h2>
          <p className="text-gray-600">Visão geral do desempenho comercial</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button>
          
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'time', label: 'Métricas de Tempo' },
            { id: 'performance', label: 'Performance' },
            { id: 'trends', label: 'Tendências' }
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metricCards.map((card) => (
              <div key={card.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-${card.color}-100`}>
                    <div className={`text-${card.color}-600`}>
                      {getIcon(card.icon)}
                    </div>
                  </div>
                  {card.trend && (
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(card.trend.direction)}
                      <span className={`text-sm font-medium ${
                        card.trend.direction === 'up' ? 'text-green-600' : 
                        card.trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {Math.abs(card.trend.value).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formatValue(card.value, card.format)}
                  </h3>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  {card.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                  )}
                  {card.trend && (
                    <p className="text-xs text-gray-500 mt-1">{card.trend.period}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {(metrics.alerts.leadsSemContato.length > 0 || metrics.alerts.leadsVencidos.length > 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-medium text-yellow-800">Alertas</h3>
              </div>
              <div className="mt-2 space-y-2">
                {metrics.alerts.leadsSemContato.length > 0 && (
                  <p className="text-sm text-yellow-700">
                    {metrics.alerts.leadsSemContato.length} leads sem contato há mais de 24h
                  </p>
                )}
                {metrics.alerts.leadsVencidos.length > 0 && (
                  <p className="text-sm text-yellow-700">
                    {metrics.alerts.leadsVencidos.length} leads vencidos precisam de atenção
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Time Metrics Tab */}
      {activeTab === 'time' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tempo por Estágio */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tempo Médio por Estágio
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} dias`, 'Tempo Médio']} />
                  <Bar dataKey="tempo" fill={COLORS.blue} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* SLA Compliance */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Compliance SLA
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Contato Inicial 24h</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {metrics.timeMetrics.slaCompliance.contatoInicial24h.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metrics.timeMetrics.slaCompliance.contatoInicial24h >= 90 ? 'bg-green-500' :
                        metrics.timeMetrics.slaCompliance.contatoInicial24h >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metrics.timeMetrics.slaCompliance.contatoInicial24h}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {metrics.timeMetrics.leadsSemContato24h}
                    </div>
                    <div className="text-sm text-red-700">Sem contato 24h</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {metrics.timeMetrics.leadsVencidos}
                    </div>
                    <div className="text-sm text-yellow-700">Leads vencidos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance por Responsável */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Taxa de Conversão por Responsável
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="responsavel" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Taxa de Conversão']} />
                  <Bar dataKey="taxaConversao" fill={COLORS.green} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ranking de Performance
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-900">Melhor Performance</div>
                      <div className="text-sm text-green-700">
                        {metrics.performance.melhorPerformance.responsavel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {metrics.performance.melhorPerformance.taxaConversao.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-600">
                        {metrics.performance.melhorPerformance.tempoMedioConversao.toFixed(1)} dias
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-red-900">Precisa Melhorar</div>
                      <div className="text-sm text-red-700">
                        {metrics.performance.piorPerformance.responsavel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {metrics.performance.piorPerformance.taxaConversao.toFixed(1)}%
                      </div>
                      <div className="text-sm text-red-600">
                        {metrics.performance.piorPerformance.tempoMedioConversao.toFixed(1)} dias
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tendências dos Últimos 7 Dias
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="novosLeads" 
                  stroke={COLORS.blue} 
                  strokeWidth={2}
                  name="Novos Leads"
                />
                <Line 
                  type="monotone" 
                  dataKey="conversoes" 
                  stroke={COLORS.green} 
                  strokeWidth={2}
                  name="Conversões"
                />
                <Line 
                  type="monotone" 
                  dataKey="perdas" 
                  stroke={COLORS.red} 
                  strokeWidth={2}
                  name="Perdas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Comparação Mensal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(metrics.trends.comparacaoMesAnterior).map(([key, data]) => (
              <div key={key} className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {key === 'novosLeads' ? 'Novos Leads' :
                   key === 'conversoes' ? 'Conversões' :
                   key === 'taxaConversao' ? 'Taxa Conversão' :
                   'Tempo Médio Conversão'}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">
                    {key === 'taxaConversao' ? `${data.atual.toFixed(1)}%` :
                     key === 'tempoMedioConversao' ? `${data.atual.toFixed(1)}d` :
                     data.atual.toString()}
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    data.variacao > 0 ? 'text-green-600' : 
                    data.variacao < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getTrendIcon(data.variacao > 0 ? 'up' : data.variacao < 0 ? 'down' : 'stable')}
                    <span className="text-sm font-medium">
                      {Math.abs(data.variacao).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSummary;