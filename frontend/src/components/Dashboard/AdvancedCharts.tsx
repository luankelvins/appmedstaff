import React from 'react'
import { BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react'

interface ChartDataPoint {
  label: string
  value: number
  color?: string
  percentage?: number
}

interface TimeSeriesPoint {
  date: string
  value: number
  label?: string
}

interface ChartProps {
  title: string
  data: ChartDataPoint[] | TimeSeriesPoint[]
  type: 'bar' | 'donut' | 'line' | 'area'
  height?: number
  showLegend?: boolean
  showValues?: boolean
  className?: string
}

const BarChart: React.FC<{ data: ChartDataPoint[]; height: number; showValues: boolean }> = ({ 
  data, 
  height, 
  showValues 
}) => {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="flex items-end space-x-2" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div className="relative w-full">
            {showValues && (
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                {item.value}
              </div>
            )}
            <div 
              className={`w-full rounded-t transition-all duration-500 ${
                item.color || 'bg-blue-500'
              }`}
              style={{ 
                height: `${(item.value / maxValue) * (height - 40)}px`,
                minHeight: '4px'
              }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-600 text-center truncate w-full">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}

const DonutChart: React.FC<{ data: ChartDataPoint[]; showLegend: boolean }> = ({ 
  data, 
  showLegend 
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0
  
  const colors = [
    'stroke-blue-500',
    'stroke-green-500', 
    'stroke-yellow-500',
    'stroke-red-500',
    'stroke-purple-500',
    'stroke-indigo-500'
  ]
  
  return (
    <div className="flex items-center space-x-6">
      <div className="relative">
        <svg width="120" height="120" className="transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const strokeDasharray = `${percentage * 3.14} 314`
            const strokeDashoffset = -cumulativePercentage * 3.14
            cumulativePercentage += percentage
            
            return (
              <circle
                key={index}
                cx="60"
                cy="60"
                r="50"
                fill="none"
                strokeWidth="10"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={colors[index % colors.length]}
                style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>
      
      {showLegend && (
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  colors[index % colors.length].replace('stroke-', 'bg-')
                }`}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">
                {item.value} ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const LineChart: React.FC<{ data: TimeSeriesPoint[]; height: number }> = ({ 
  data, 
  height 
}) => {
  if (data.length === 0) return null
  
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1
  
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 280
    const y = height - 40 - ((point.value - minValue) / range) * (height - 60)
    return `${x},${y}`
  }).join(' ')
  
  return (
    <div className="relative">
      <svg width="300" height={height} className="overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={20 + (i * (height - 40) / 4)}
            x2="280"
            y2={20 + (i * (height - 40) / 4)}
            stroke="#f3f4f6"
            strokeWidth="1"
          />
        ))}
        
        {/* Area */}
        <polygon
          points={`0,${height-20} ${points} 280,${height-20}`}
          fill="url(#areaGradient)"
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Points */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 280
          const y = height - 40 - ((point.value - minValue) / range) * (height - 60)
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill="#3B82F6"
              stroke="white"
              strokeWidth="2"
            />
          )
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-2">
        {data.map((point, index) => (
          <span key={index} className="text-xs text-gray-500">
            {point.date}
          </span>
        ))}
      </div>
    </div>
  )
}

export const AdvancedChart: React.FC<ChartProps> = ({
  title,
  data,
  type,
  height = 200,
  showLegend = true,
  showValues = true,
  className = ''
}) => {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <BarChart data={data as ChartDataPoint[]} height={height} showValues={showValues} />
      case 'donut':
        return <DonutChart data={data as ChartDataPoint[]} showLegend={showLegend} />
      case 'line':
      case 'area':
        return <LineChart data={data as TimeSeriesPoint[]} height={height} />
      default:
        return <div>Tipo de gráfico não suportado</div>
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'bar':
        return BarChart3
      case 'donut':
        return PieChart
      case 'line':
        return TrendingUp
      case 'area':
        return Activity
      default:
        return BarChart3
    }
  }

  const Icon = getIcon()

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Icon className="w-5 h-5 mr-2 text-gray-600" />
          {title}
        </h3>
      </div>
      
      <div className="flex justify-center">
        {renderChart()}
      </div>
    </div>
  )
}

export default AdvancedChart