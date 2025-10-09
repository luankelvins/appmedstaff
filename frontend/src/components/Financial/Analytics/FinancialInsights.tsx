import React, { useState } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Info, 
  CheckCircle, 
  Lightbulb,
  X,
  ChevronRight,
  Target
} from 'lucide-react';

interface FinancialInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'info' | 'success';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation?: string;
}

interface FinancialInsightsProps {
  insights: FinancialInsight[];
}

const FinancialInsights: React.FC<FinancialInsightsProps> = ({ insights }) => {
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  const getInsightIcon = (type: FinancialInsight['type']) => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'opportunity':
        return TrendingUp;
      case 'success':
        return CheckCircle;
      case 'info':
      default:
        return Info;
    }
  };

  const getInsightColors = (type: FinancialInsight['type']) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          text: 'text-red-700'
        };
      case 'opportunity':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          text: 'text-blue-700'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          text: 'text-green-700'
        };
      case 'info':
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          text: 'text-gray-700'
        };
    }
  };

  const getImpactBadge = (impact: FinancialInsight['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDismiss = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
  };

  const toggleExpanded = (insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  };

  const visibleInsights = insights.filter(insight => !dismissedInsights.has(insight.id));

  if (visibleInsights.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tudo em ordem!</h3>
          <p className="text-gray-600">Não há insights críticos no momento.</p>
        </div>
      </div>
    );
  }

  // Agrupar insights por tipo
  const groupedInsights = visibleInsights.reduce((groups, insight) => {
    if (!groups[insight.type]) {
      groups[insight.type] = [];
    }
    groups[insight.type].push(insight);
    return groups;
  }, {} as Record<string, FinancialInsight[]>);

  // Ordenar por prioridade
  const typeOrder = ['warning', 'opportunity', 'success', 'info'];
  const sortedTypes = Object.keys(groupedInsights).sort((a, b) => 
    typeOrder.indexOf(a) - typeOrder.indexOf(b)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-900">Insights Financeiros</h2>
        </div>
        <span className="text-sm text-gray-500">
          {visibleInsights.length} insight{visibleInsights.length !== 1 ? 's' : ''} disponível{visibleInsights.length !== 1 ? 'is' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {sortedTypes.map(type => {
          const typeInsights = groupedInsights[type];
          const typeLabels = {
            warning: 'Alertas',
            opportunity: 'Oportunidades',
            success: 'Sucessos',
            info: 'Informações'
          };

          return (
            <div key={type} className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                {typeLabels[type as keyof typeof typeLabels]} ({typeInsights.length})
              </h3>
              
              {typeInsights.map(insight => {
                const Icon = getInsightIcon(insight.type);
                const colors = getInsightColors(insight.type);
                const isExpanded = expandedInsights.has(insight.id);

                return (
                  <div
                    key={insight.id}
                    className={`${colors.bg} ${colors.border} border rounded-lg p-4 transition-all duration-200`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className={`w-5 h-5 ${colors.icon} mt-0.5 flex-shrink-0`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className={`font-medium ${colors.title}`}>
                              {insight.title}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactBadge(insight.impact)}`}>
                              {insight.impact === 'high' ? 'Alto' : insight.impact === 'medium' ? 'Médio' : 'Baixo'} impacto
                            </span>
                          </div>
                          
                          <p className={`text-sm ${colors.text} mb-3`}>
                            {insight.description}
                          </p>

                          {insight.actionable && insight.recommendation && (
                            <div className="space-y-2">
                              <button
                                onClick={() => toggleExpanded(insight.id)}
                                className={`flex items-center gap-1 text-sm font-medium ${colors.title} hover:underline`}
                              >
                                <Target className="w-4 h-4" />
                                Recomendação
                                <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </button>
                              
                              {isExpanded && (
                                <div className={`p-3 bg-white rounded-lg border ${colors.border}`}>
                                  <p className="text-sm text-gray-700">
                                    {insight.recommendation}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDismiss(insight.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded"
                        title="Dispensar insight"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Resumo de ações */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Resumo de Ações</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {visibleInsights.filter(i => i.type === 'warning').length}
            </div>
            <div className="text-gray-600">Alertas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {visibleInsights.filter(i => i.type === 'opportunity').length}
            </div>
            <div className="text-gray-600">Oportunidades</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {visibleInsights.filter(i => i.actionable).length}
            </div>
            <div className="text-gray-600">Ações Disponíveis</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialInsights;