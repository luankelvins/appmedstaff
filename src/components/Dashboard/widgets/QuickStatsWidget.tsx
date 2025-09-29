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
      
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockStats: MetricData[] = [
        {
          id: 'total-clients',
          title: 'Total de Clientes',
          value: 1247,
          trend: {
            value: 12.5,
            isPositive: true,
            period: 'vs mês anterior'
          },
          icon: Users,
          color: 'blue'
        },
        {
          id: 'revenue',
          title: 'Receita Mensal',
          value: 'R$ 125.430',
          trend: {
            value: 8.2,
            isPositive: true,
            period: 'vs mês anterior'
          },
          target: {
            value: 150000,
            achieved: 125430,
            percentage: 83.6
          },
          icon: DollarSign,
          color: 'green'
        },
        {
          id: 'completed-tasks',
          title: 'Tarefas Concluídas',
          value: 89,
          trend: {
            value: 5.1,
            isPositive: false,
            period: 'vs semana anterior'
          },
          target: {
            value: 100,
            achieved: 89,
            percentage: 89
          },
          icon: CheckCircle,
          color: 'purple'
        },
        {
          id: 'pending-tasks',
          title: 'Tarefas Pendentes',
          value: 23,
          trend: {
            value: 15.3,
            isPositive: false,
            period: 'vs semana anterior'
          },
          icon: Clock,
          color: 'yellow'
        },
        {
          id: 'conversion-rate',
          title: 'Taxa de Conversão',
          value: '24.8%',
          trend: {
            value: 3.2,
            isPositive: true,
            period: 'vs mês anterior'
          },
          target: {
            value: 30,
            achieved: 24.8,
            percentage: 82.7
          },
          icon: Target,
          color: 'indigo'
        },
        {
          id: 'urgent-issues',
          title: 'Questões Urgentes',
          value: 5,
          trend: {
            value: 2.1,
            isPositive: true,
            period: 'vs ontem'
          },
          icon: AlertCircle,
          color: 'red'
        }
      ]
      
      setStats(mockStats)
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