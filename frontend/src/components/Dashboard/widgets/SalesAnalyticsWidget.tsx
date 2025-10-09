import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target,
  ShoppingCart,
  Eye,
  MousePointer,
  CreditCard,
  Award,
  Calendar,
  BarChart3
} from 'lucide-react'
import DashboardWidget from '../DashboardWidget'
import { widgetDataService } from '../../../utils/widgetDataService'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

interface SalesMetric {
  id: string
  name: string
  value: number
  previousValue: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  target?: number
  format: 'currency' | 'percentage' | 'number'
}

interface FunnelStage {
  id: string
  name: string
  count: number
  percentage: number
  conversionRate: number
  icon: React.ReactNode
}

interface TopProduct {
  id: string
  name: string
  revenue: number
  units: number
  growth: number
}

const SalesAnalyticsWidget: React.FC<BaseWidgetProps> = ({ 
  onRefresh, 
  onConfigure, 
  className 
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)
  const [salesMetrics, setSalesMetrics] = useState<SalesMetric[]>([])
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('month')

  useEffect(() => {
    loadSalesData()
  }, [selectedPeriod])

  const loadSalesData = async () => {
    setLoading(true)
    setError(undefined)
    
    try {
      // Carregar dados reais do Supabase
      const [salesMetricsData, funnelData, topProductsData] = await Promise.all([
        widgetDataService.getSalesMetrics(),
        widgetDataService.getSalesFunnel(),
        widgetDataService.getTopProducts()
      ])

      // Processar métricas de vendas
      const processedMetrics: SalesMetric[] = salesMetricsData.map((metric, index) => {
        const previousMetric = salesMetricsData[index + 1] || metric
        const growth = previousMetric.revenue > 0 
          ? ((metric.revenue - previousMetric.revenue) / previousMetric.revenue) * 100
          : 0

        return [
          {
            id: 'revenue',
            name: 'Receita Total',
            value: metric.revenue,
            previousValue: previousMetric.revenue,
            unit: 'R$',
            trend: (growth >= 0 ? 'up' : 'down') as 'up' | 'down' | 'stable',
            target: metric.revenue * 1.1, // Meta de 10% acima do atual
            format: 'currency' as const
          },
          {
            id: 'conversion-rate',
            name: 'Taxa de Conversão',
            value: metric.conversion_rate,
            previousValue: previousMetric.conversion_rate,
            unit: '%',
            trend: (metric.conversion_rate >= previousMetric.conversion_rate ? 'up' : 'down') as 'up' | 'down' | 'stable',
            target: 4.0,
            format: 'percentage' as const
          },
          {
            id: 'avg-deal-size',
            name: 'Ticket Médio',
            value: metric.avg_deal_size,
            previousValue: previousMetric.avg_deal_size,
            unit: 'R$',
            trend: (metric.avg_deal_size >= previousMetric.avg_deal_size ? 'up' : 'down') as 'up' | 'down' | 'stable',
            format: 'currency' as const
          },
          {
            id: 'leads-generated',
            name: 'Leads Gerados',
            value: metric.leads_generated,
            previousValue: previousMetric.leads_generated,
            unit: '',
            trend: (metric.leads_generated >= previousMetric.leads_generated ? 'up' : 'down') as 'up' | 'down' | 'stable',
            target: 150,
            format: 'number' as const
          }
        ]
      }).flat().slice(0, 4) // Pegar apenas as primeiras 4 métricas

      // Processar dados do funil
      const processedFunnel: FunnelStage[] = funnelData.map(stage => ({
        id: stage.stage.toLowerCase(),
        name: stage.stage,
        count: stage.count,
        percentage: (stage.value / funnelData[0]?.value || 1) * 100,
        conversionRate: stage.conversion_rate,
        icon: getStageIcon(stage.stage)
      }))

      // Processar top produtos
      const processedTopProducts: TopProduct[] = topProductsData.map(product => ({
        id: product.id,
        name: product.product_name,
        revenue: product.revenue,
        units: product.sales_count,
        growth: product.growth_rate
      }))

      setSalesMetrics(processedMetrics)
      setFunnelData(processedFunnel)
      setTopProducts(processedTopProducts)
    } catch (err) {
      console.error('Erro ao carregar dados de vendas:', err)
      setError('Erro ao carregar dados de vendas')
    } finally {
      setLoading(false)
    }
  }

  const getStageIcon = (stageName: string) => {
    switch (stageName.toLowerCase()) {
      case 'visitantes':
      case 'visitors':
        return <Eye className="w-4 h-4" />
      case 'leads':
        return <Users className="w-4 h-4" />
      case 'oportunidades':
      case 'opportunities':
        return <Target className="w-4 h-4" />
      case 'propostas':
      case 'proposals':
        return <MousePointer className="w-4 h-4" />
      case 'vendas':
      case 'sales':
        return <CreditCard className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  const handleRefresh = () => {
    loadSalesData()
    onRefresh?.()
  }

  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
      case 'currency':
        return `${unit}${value.toLocaleString('pt-BR')}`
      case 'percentage':
        return `${value.toFixed(1)}${unit}`
      case 'number':
        return value.toLocaleString('pt-BR')
      default:
        return `${value}${unit}`
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-gray-600'
  }

  const getProgressColor = (value: number, target?: number) => {
    if (!target) return 'bg-medstaff-primary'
    const percentage = (value / target) * 100
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <DashboardWidget
      id="sales-analytics"
      title="Análise de Vendas"
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
          {salesMetrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">{metric.name}</span>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatValue(metric.value, metric.format, metric.unit)}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-medium ${getTrendColor(metric.value, metric.previousValue)}`}>
                    {metric.value > metric.previousValue ? '+' : ''}
                    {metric.format === 'currency' 
                      ? `R$${(metric.value - metric.previousValue).toLocaleString('pt-BR')}`
                      : `${(metric.value - metric.previousValue).toFixed(1)}${metric.unit}`
                    }
                  </div>
                  <div className="text-xs text-gray-500">vs anterior</div>
                </div>
              </div>
              
              {/* Barra de Progresso para metas */}
              {metric.target && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Meta: {formatValue(metric.target, metric.format, metric.unit)}</span>
                    <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metric.value, metric.target)}`}
                      style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Funil de Vendas */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <ShoppingCart className="w-4 h-4 text-medstaff-primary" />
            <h4 className="text-sm font-semibold text-gray-900">Funil de Vendas</h4>
          </div>
          
          <div className="space-y-2">
            {funnelData.map((stage, index) => (
              <div
                key={stage.id}
                className="relative"
              >
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-medstaff-light rounded-lg">
                      {stage.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                      <p className="text-xs text-gray-500">
                        {stage.count.toLocaleString('pt-BR')} • {stage.percentage.toFixed(1)}% do total
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-medstaff-primary">
                      {stage.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">conversão</div>
                  </div>
                </div>
                
                {/* Barra de Progresso Visual do Funil */}
                <div className="mt-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="h-1 bg-gradient-to-r from-medstaff-primary to-medstaff-secondary rounded-full transition-all duration-300"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Produtos */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Award className="w-4 h-4 text-medstaff-primary" />
            <h4 className="text-sm font-semibold text-gray-900">Top Produtos</h4>
          </div>
          
          <div className="space-y-2">
            {topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.units} unidades vendidas
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-medstaff-primary">
                    R${product.revenue.toLocaleString('pt-BR')}
                  </div>
                  <div className={`text-xs font-medium ${
                    product.growth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.growth > 0 ? '+' : ''}{product.growth.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-medstaff-light to-medstaff-accent/20 border border-medstaff-secondary/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-medstaff-primary" />
            <h4 className="text-sm font-semibold text-medstaff-primary">Insights de Vendas</h4>
          </div>
          <div className="space-y-1 text-sm text-medstaff-dark">
            <p>• Receita cresceu 6.1% em relação ao período anterior</p>
            <p>• Taxa de conversão melhorou significativamente (+0.6%)</p>
            <p>• Plano Premium lidera em receita com crescimento de 12.5%</p>
          </div>
        </div>
      </div>
    </DashboardWidget>
  )
}

export default SalesAnalyticsWidget