import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  Users, 
  TrendingUp, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { ContactAnalytics, TeamContactAnalytics } from '../../services/contactAnalyticsService';
import { LeadPipelineCard } from '../../types/crm';

interface ContactAnalyticsDashboardProps {
  leadCards: LeadPipelineCard[];
  selectedResponsavel?: string;
  onResponsavelChange?: (responsavel: string) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const ContactAnalyticsDashboard: React.FC<ContactAnalyticsDashboardProps> = ({
  leadCards,
  selectedResponsavel,
  onResponsavelChange
}) => {
  const [analytics, setAnalytics] = useState<ContactAnalytics | null>(null);
  const [teamAnalytics, setTeamAnalytics] = useState<TeamContactAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'performance' | 'team'>('overview');

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const { contactAnalyticsService } = await import('../../services/contactAnalyticsService');
        
        if (selectedResponsavel) {
          // Analytics para responsável específico
          const responsavelLeads = leadCards.filter(card => card.responsavelAtual === selectedResponsavel);
          if (responsavelLeads.length > 0) {
            const leadAnalytics = responsavelLeads.map(lead => 
              contactAnalyticsService.analyzeLeadContacts(lead)
            );
            // Combinar analytics de múltiplos leads
            setAnalytics(combineLeadAnalytics(leadAnalytics));
          }
        } else {
          // Analytics da equipe
          const teamData = contactAnalyticsService.analyzeTeamContacts(leadCards);
          setTeamAnalytics(teamData);
          setAnalytics(teamData.teamOverview);
        }
      } catch (error) {
        console.error('Erro ao carregar analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [leadCards, selectedResponsavel]);

  const combineLeadAnalytics = (analyticsArray: ContactAnalytics[]): ContactAnalytics => {
    // Implementação simplificada para combinar analytics
    if (analyticsArray.length === 0) return getEmptyAnalytics();
    
    const combined = analyticsArray[0];
    // Aqui você implementaria a lógica para combinar múltiplas analytics
    return combined;
  };

  const getEmptyAnalytics = (): ContactAnalytics => ({
    totalAttempts: 0,
    successRate: 0,
    averageAttemptsToSuccess: 0,
    averageResponseTime: 0,
    byType: {
      ligacao: { total: 0, successCount: 0, successRate: 0 },
      whatsapp: { total: 0, successCount: 0, successRate: 0 },
      email: { total: 0, successCount: 0, successRate: 0 },
      presencial: { total: 0, successCount: 0, successRate: 0 }
    },
    byResult: {
      sucesso: { count: 0, percentage: 0 },
      sem_resposta: { count: 0, percentage: 0 },
      ocupado: { count: 0, percentage: 0 },
      numero_invalido: { count: 0, percentage: 0 },
      nao_atende: { count: 0, percentage: 0 },
      reagendar: { count: 0, percentage: 0 }
    },
    trends: { daily: [], hourly: [], weekday: [] },
    performance: {
      bestPerformingType: 'ligacao',
      bestPerformingHour: 9,
      bestPerformingDay: 'Segunda',
      averageTimeBetweenAttempts: 0,
      conversionFunnel: { firstAttempt: 0, secondAttempt: 0, thirdAttempt: 0, fourthPlusAttempt: 0 }
    },
    recommendations: []
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ligacao': return <Phone className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'presencial': return <Users className="w-4 h-4" />;
      default: return <Phone className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ligacao': return 'Ligação';
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'E-mail';
      case 'presencial': return 'Presencial';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum dado de contato disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com seletor de responsável */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics de Contato</h2>
        
        {onResponsavelChange && (
          <select
            value={selectedResponsavel || ''}
            onChange={(e) => onResponsavelChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toda a equipe</option>
            {teamAnalytics && Object.entries(teamAnalytics.byResponsavel).map(([id, data]) => (
              <option key={id} value={id}>
                {data.responsavelName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'trends', label: 'Tendências', icon: TrendingUp },
            { id: 'performance', label: 'Performance', icon: Target },
            { id: 'team', label: 'Equipe', icon: Users }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Cards de métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Tentativas</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalAttempts}</p>
                </div>
                <Phone className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.successRate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tentativas até Sucesso</p>
                  <p className="text-2xl font-bold text-orange-600">{analytics.averageAttemptsToSuccess.toFixed(1)}</p>
                </div>
                <Target className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tempo Médio (h)</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.averageResponseTime.toFixed(1)}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Gráficos por tipo e resultado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance por tipo */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Tipo de Contato</h3>
              <div className="space-y-4">
                {Object.entries(analytics.byType).map(([type, data]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(type)}
                      <span className="font-medium">{getTypeLabel(type)}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{data.total} tentativas</div>
                      <div className="font-semibold text-green-600">{data.successRate.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribuição de resultados */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Resultados</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.byResult).map(([result, data]) => ({
                      name: result,
                      value: data.count,
                      percentage: data.percentage
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={(entry: any) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                  >
                    {Object.entries(analytics.byResult).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recomendações */}
          {analytics.recommendations.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendações</h3>
              <div className="space-y-3">
                {analytics.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">{rec.title}</h4>
                      <p className="text-sm text-blue-700">{rec.description}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                        rec.impact === 'high' ? 'bg-red-100 text-red-800' :
                        rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        Impacto {rec.impact === 'high' ? 'Alto' : rec.impact === 'medium' ? 'Médio' : 'Baixo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Tendência diária */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendência Diária (Últimos 30 dias)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.trends.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="attempts" stroke="#3B82F6" name="Tentativas" />
                <Line type="monotone" dataKey="successRate" stroke="#10B981" name="Taxa de Sucesso %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tendência por hora */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Hora do Dia</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.trends.hourly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attempts" fill="#3B82F6" name="Tentativas" />
                <Bar dataKey="successRate" fill="#10B981" name="Taxa de Sucesso %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tendência por dia da semana */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Dia da Semana</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.trends.weekday}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attempts" fill="#3B82F6" name="Tentativas" />
                <Bar dataKey="successRate" fill="#10B981" name="Taxa de Sucesso %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Métricas de performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h4 className="font-medium text-gray-900 mb-2">Melhor Canal</h4>
              <div className="flex items-center space-x-2">
                {getTypeIcon(analytics.performance.bestPerformingType)}
                <span className="text-lg font-semibold">{getTypeLabel(analytics.performance.bestPerformingType)}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h4 className="font-medium text-gray-900 mb-2">Melhor Horário</h4>
              <p className="text-lg font-semibold">{analytics.performance.bestPerformingHour}:00h</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h4 className="font-medium text-gray-900 mb-2">Melhor Dia</h4>
              <p className="text-lg font-semibold">{analytics.performance.bestPerformingDay}</p>
            </div>
          </div>

          {/* Funil de conversão */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Funil de Conversão</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.performance.conversionFunnel.firstAttempt}</div>
                <div className="text-sm text-gray-600">1ª Tentativa</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.performance.conversionFunnel.secondAttempt}</div>
                <div className="text-sm text-gray-600">2ª Tentativa</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{analytics.performance.conversionFunnel.thirdAttempt}</div>
                <div className="text-sm text-gray-600">3ª Tentativa</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{analytics.performance.conversionFunnel.fourthPlusAttempt}</div>
                <div className="text-sm text-gray-600">4+ Tentativas</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && teamAnalytics && (
        <div className="space-y-6">
          {/* Comparações da equipe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h4 className="font-medium text-gray-900 mb-2">Top Performer</h4>
              <p className="text-lg font-semibold text-green-600">
                {teamAnalytics.byResponsavel[teamAnalytics.comparisons.topPerformer]?.responsavelName || 'N/A'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h4 className="font-medium text-gray-900 mb-2">Performance Média</h4>
              <p className="text-lg font-semibold text-blue-600">
                {teamAnalytics.byResponsavel[teamAnalytics.comparisons.averagePerformer]?.responsavelName || 'N/A'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h4 className="font-medium text-gray-900 mb-2">Precisam Melhorar</h4>
              <p className="text-lg font-semibold text-red-600">
                {teamAnalytics.comparisons.needsImprovement.length} pessoas
              </p>
            </div>
          </div>

          {/* Ranking da equipe */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ranking da Equipe</h3>
            <div className="space-y-3">
              {Object.entries(teamAnalytics.byResponsavel)
                .sort((a, b) => b[1].successRate - a[1].successRate)
                .map(([id, data], index) => (
                  <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-gray-500">#{index + 1}</span>
                      <span className="font-medium">{data.responsavelName}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{data.successRate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">{data.totalAttempts} tentativas</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recomendações da equipe */}
          {teamAnalytics.teamRecommendations.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendações para a Equipe</h3>
              <div className="space-y-3">
                {teamAnalytics.teamRecommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900">{rec.title}</h4>
                    <p className="text-sm text-yellow-700">{rec.description}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                      </span>
                      <span className="text-xs text-gray-600">
                        {rec.targetResponsaveis.length} pessoa(s) afetada(s)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactAnalyticsDashboard;