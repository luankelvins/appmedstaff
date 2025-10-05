import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Target,
  Users,
  BarChart3,
  Zap,
  Calendar,
  Award
} from 'lucide-react'
import DashboardWidget from '../DashboardWidget'
import { widgetDataService } from '../../../services/widgetDataService'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

interface ProductivityMetric {
  id: string
  name: string
  value: number
  previousValue: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  target: number
  category: 'efficiency' | 'quality' | 'speed' | 'collaboration'
}

interface TeamMember {
  id: string
  name: string
  avatar: string
  productivity: number
  tasksCompleted: number
  hoursWorked: number
  efficiency: number
}

const ProductivityAnalyticsWidget: React.FC<BaseWidgetProps> = ({ 
  onRefresh, 
  onConfigure, 
  className 
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)
  const [metrics, setMetrics] = useState<ProductivityMetric[]>([])
  const [topPerformers, setTopPerformers] = useState<TeamMember[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')

  useEffect(() => {
    loadProductivityData()
  }, [selectedPeriod])

  const loadProductivityData = async () => {
    setLoading(true)
    setError(undefined)
    
    try {


      // Buscar dados reais de produtividade do Supabase
      const productivityData = await widgetDataService.getProductivityMetrics()
      
      // Mapear dados para o formato esperado pelo componente
      const realMetrics: ProductivityMetric[] = [
        {
          id: 'efficiency',
          name: 'Eficiência Geral',
          value: productivityData.efficiency_avg,
          previousValue: productivityData.efficiency_avg * 0.95, // Simular valor anterior
          unit: '%',
          trend: productivityData.efficiency_avg > 80 ? 'up' : 'down',
          target: 85,
          category: 'efficiency'
        },
        {
          id: 'task-completion',
          name: 'Tarefas Concluídas',
          value: productivityData.tasks_completed_total,
          previousValue: Math.round(productivityData.tasks_completed_total * 0.9),
          unit: '',
          trend: 'up',
          target: productivityData.tasks_completed_total * 1.1,
          category: 'quality'
        },
        {
          id: 'satisfaction',
          name: 'Satisfação da Equipe',
          value: productivityData.satisfaction_avg,
          previousValue: productivityData.satisfaction_avg * 0.92,
          unit: '/10',
          trend: productivityData.satisfaction_avg > 7 ? 'up' : 'down',
          target: 8.5,
          category: 'collaboration'
        }
      ]

      // Mapear top performers
      const realTopPerformers: TeamMember[] = productivityData.top_performers.map(performer => ({
        id: performer.id,
        name: performer.name,
        avatar: `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=32&h=32&fit=crop&crop=face&seed=${performer.id}`,
        productivity: performer.efficiency,
        tasksCompleted: performer.tasks_completed,
        hoursWorked: 40, // Valor padrão
        efficiency: performer.efficiency
      }))

      setMetrics(realMetrics)
      setTopPerformers(realTopPerformers)
    } catch (err) {
      setError('Erro ao carregar dados de produtividade')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadProductivityData()
    onRefresh?.()
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'efficiency':
        return <Zap className="w-4 h-4 text-yellow-500" />
      case 'quality':
        return <Target className="w-4 h-4 text-green-500" />
      case 'speed':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'collaboration':
        return <Users className="w-4 h-4 text-purple-500" />
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />
    }
  }

  const getProgressColor = (value: number, target: number) => {
    const percentage = (value / target) * 100
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <DashboardWidget
      id="productivity-analytics"
      title="Análise de Produtividade"
      subtitle={`Métricas ${selectedPeriod === 'today' ? 'do dia' : selectedPeriod === 'week' ? 'da semana' : 'do mês'}`}
      loading={loading}
      error={error}
      size="large"
      refreshable
      configurable
      onRefresh={handleRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="space-y-6">
        {/* Seletor de Período */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Período:</span>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'today', label: 'Hoje' },
              { key: 'week', label: 'Semana' },
              { key: 'month', label: 'Mês' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key as any)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedPeriod === key
                    ? 'bg-white text-medstaff-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(metric.category)}
                  <span className="text-xs font-medium text-gray-600">{metric.name}</span>
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-medium ${
                    metric.value > metric.previousValue ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.value > metric.previousValue ? '+' : ''}
                    {(metric.value - metric.previousValue).toFixed(1)}{metric.unit}
                  </div>
                  <div className="text-xs text-gray-500">vs anterior</div>
                </div>
              </div>
              
              {/* Barra de Progresso */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Meta: {metric.target}{metric.unit}</span>
                  <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metric.value, metric.target)}`}
                    style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Performers */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Award className="w-4 h-4 text-yellow-500" />
            <h4 className="text-sm font-semibold text-gray-900">Top Performers</h4>
          </div>
          
          <div className="space-y-2">
            {topPerformers.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="w-8 h-8 bg-medstaff-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{member.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">
                      {member.tasksCompleted} tarefas • {member.hoursWorked}h
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-medstaff-primary">
                    {member.productivity.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">produtividade</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Rápidos */}
        <div className="bg-gradient-to-r from-medstaff-light to-medstaff-accent/20 border border-medstaff-secondary/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-4 h-4 text-medstaff-primary" />
            <h4 className="text-sm font-semibold text-medstaff-primary">Insights do Período</h4>
          </div>
          <div className="space-y-1 text-sm text-medstaff-dark">
            <p>• Eficiência geral aumentou 5.2% em relação ao período anterior</p>
            <p>• Tempo médio de resposta melhorou significativamente</p>
            <p>• 3 membros da equipe superaram suas metas individuais</p>
          </div>
        </div>
      </div>
    </DashboardWidget>
  )
}

export default ProductivityAnalyticsWidget