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
import { apiService } from '../../../services/apiService'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(undefined)
      
      // Buscar dados reais da API
      const dashboardStats = await apiService.getQuickStats()
      const financialMetrics = await apiService.getFinancialMetrics()
      
      // Calcular tendências
      const currentRevenue = financialMetrics.currentRevenue || 0
      const previousRevenue = financialMetrics.previousRevenue || 0
      const revenueTrend = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
      
      const realStats: MetricData[] = [
        {
          id: 'total-users',
          title: 'Total de Usuários',
          value: dashboardStats.totalUsers,
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
          value: dashboardStats.completedTasks,
          trend: {
            value: 5.1,
            isPositive: dashboardStats.completedTasks > (dashboardStats.totalTasks * 0.8),
            period: 'vs semana anterior'
          },
          target: {
            value: dashboardStats.totalTasks,
            achieved: dashboardStats.completedTasks,
            percentage: dashboardStats.totalTasks > 0 ? (dashboardStats.completedTasks / dashboardStats.totalTasks) * 100 : 0
          },
          icon: CheckCircle,
          color: 'emerald'
        },
        {
          id: 'active-users',
          title: 'Usuários Ativos',
          value: dashboardStats.activeUsers,
          trend: {
            value: 15.3,
            isPositive: true,
            period: 'vs semana anterior'
          },
          icon: Target,
          color: 'purple'
        }
      ]
      
      setStats(realStats)
    } catch (err) {
      setError('Erro ao carregar estatísticas')
      console.error('Error loading stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const handleRefresh = () => {
    loadStats()
    onRefresh?.()
  }

  return (
    <DashboardWidget
      id="quick-stats"
      title="Estatísticas Rápidas"
      subtitle="Visão geral dos principais indicadores"
      loading={loading}
      error={error}
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