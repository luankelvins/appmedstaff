import React, { useState, useEffect } from 'react'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Target
} from 'lucide-react'
import DashboardWidget from '../DashboardWidget'
import { AdvancedMetrics } from '../AdvancedMetrics'
import { useDashboardData } from '../../../hooks/useDashboardData'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

interface MetricData {
  id: string
  title: string
  value: string | number
  previousValue?: string | number
  trend?: {
    value: number
    isPositive: boolean
    period: string
  }
  target?: {
    value: number
    achieved: number
    percentage: number
  }
  icon: React.ElementType
  color: string
  description?: string
}

const QuickStatsWidget: React.FC<BaseWidgetProps> = ({ 
  onRefresh, 
  onConfigure, 
  className 
}) => {
  const [stats, setStats] = useState<MetricData[]>([])
  
  // Usar o hook para buscar dados do dashboard
  const { 
    data, 
    loading, 
    error, 
    refresh 
  } = useDashboardData({
    autoRefresh: true,
    refreshInterval: 300, // 5 minutos
    enablePolling: true,
    pollingInterval: 60 // 1 minuto para dados críticos
  });

  // Processar dados quando disponíveis
  useEffect(() => {
    if (data.quickStats && data.financialMetrics) {
      const { quickStats, financialMetrics } = data;
      
      // Calcular tendências
      const currentRevenue = financialMetrics.monthlyRevenue || 0;
      const previousRevenue = financialMetrics.totalRevenue - financialMetrics.monthlyRevenue || 0;
      const revenueTrend = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      
      const realStats: MetricData[] = [
        {
          id: 'total-users',
          title: 'Total de Usuários',
          value: quickStats.totalUsers,
          trend: {
            value: 12.5, // Pode ser calculado com dados históricos
            isPositive: true,
            period: 'vs mês anterior'
          },
          icon: Users,
          color: 'blue'
        },
        {
          id: 'revenue',
          title: 'Receita Mensal',
          value: `R$ ${currentRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          trend: {
            value: Math.abs(revenueTrend),
            isPositive: revenueTrend >= 0,
            period: 'vs mês anterior'
          },
          target: {
            value: 500000, // Meta mensal
            achieved: currentRevenue,
            percentage: (currentRevenue / 500000) * 100
          },
          icon: DollarSign,
          color: 'green'
        },
        {
          id: 'completed-tasks',
          title: 'Tarefas Concluídas',
          value: quickStats.completedTasks,
          trend: {
            value: quickStats.taskCompletionRate,
            isPositive: quickStats.taskCompletionRate > 80,
            period: 'vs semana anterior'
          },
          target: {
            value: quickStats.totalTasks,
            achieved: quickStats.completedTasks,
            percentage: quickStats.taskCompletionRate
          },
          icon: CheckCircle,
          color: 'emerald'
        },
        {
          id: 'active-users',
          title: 'Usuários Ativos',
          value: quickStats.activeUsers,
          trend: {
            value: 15.3,
            isPositive: true,
            period: 'vs semana anterior'
          },
          icon: Target,
          color: 'purple'
        }
      ];
      
      setStats(realStats);
    }
  }, [data.quickStats, data.financialMetrics]);

  const handleRefresh = () => {
    refresh();
    onRefresh?.();
  }

  return (
    <DashboardWidget
      id="quick-stats"
      title="Estatísticas Rápidas"
      subtitle="Visão geral dos principais indicadores"
      loading={loading}
      error={error || undefined}
      size="large"
      refreshable
      configurable
      onRefresh={handleRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <AdvancedMetrics
        metrics={stats}
        loading={loading}
      />
    </DashboardWidget>
  )
}

export default QuickStatsWidget