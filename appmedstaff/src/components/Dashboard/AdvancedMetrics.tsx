import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart
} from 'lucide-react'

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

interface AdvancedMetricsProps {
  metrics: MetricData[]
  loading?: boolean
  className?: string
}

const formatTrend = (trend: MetricData['trend']) => {
  if (!trend) return null
  
  const TrendIcon = trend.isPositive ? TrendingUp : TrendingDown
  const colorClass = trend.isPositive ? 'text-green-600' : 'text-red-600'
  
  return (
    <div className={`flex items-center space-x-1 text-sm ${colorClass}`}>
      <TrendIcon className="w-4 h-4" />
      <span>{Math.abs(trend.value)}%</span>
      <span className="text-gray-500">vs {trend.period}</span>
    </div>
  )
}

const formatTarget = (target: MetricData['target']) => {
  if (!target) return null
  
  const isOnTrack = target.percentage >= 80
  const colorClass = isOnTrack ? 'bg-green-500' : target.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  
  return (
    <div className="mt-2">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Meta: {target.value}</span>
        <span>{target.percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${Math.min(target.percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}

export const AdvancedMetrics: React.FC<AdvancedMetricsProps> = ({ 
  metrics, 
  loading = false, 
  className = '' 
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {metrics.map((metric) => {
        const Icon = metric.icon
        
        return (
          <div 
            key={metric.id} 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              {metric.trend && formatTrend(metric.trend)}
            </div>
            
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {metric.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {typeof metric.value === 'number' 
                  ? metric.value.toLocaleString('pt-BR') 
                  : metric.value
                }
              </p>
            </div>
            
            {metric.description && (
              <p className="text-sm text-gray-500 mb-3">
                {metric.description}
              </p>
            )}
            
            {metric.target && formatTarget(metric.target)}
          </div>
        )
      })}
    </div>
  )
}

export default AdvancedMetrics