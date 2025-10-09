import React from 'react'

interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

interface SimpleChartProps {
  data: ChartDataPoint[]
  title: string
  type?: 'bar' | 'donut'
  loading?: boolean
  height?: number
}

export const SimpleChart = ({ 
  data, 
  title, 
  type = 'bar', 
  loading = false,
  height = 200 
}: SimpleChartProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className={`bg-gray-300 rounded animate-pulse`} style={{ height: `${height}px` }}></div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (type === 'donut') {
    const radius = 80
    const strokeWidth = 20
    const normalizedRadius = radius - strokeWidth * 2
    const circumference = normalizedRadius * 2 * Math.PI
    
    let cumulativePercentage = 0

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg
              height={radius * 2}
              width={radius * 2}
              className="transform -rotate-90"
            >
              <circle
                stroke="#f3f4f6"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100
                const strokeDasharray = `${percentage * circumference / 100} ${circumference}`
                const strokeDashoffset = -cumulativePercentage * circumference / 100
                cumulativePercentage += percentage
                
                return (
                  <circle
                    key={index}
                    stroke={item.color || `hsl(${index * 137.5}, 70%, 50%)`}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-300"
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color || `hsl(${index * 137.5}, 70%, 50%)` }}
                ></div>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
          
          return (
            <div key={index} className="flex items-center">
              <div className="w-20 text-sm text-gray-600 truncate">
                {item.label}
              </div>
              <div className="flex-1 mx-3">
                <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color || `hsl(${index * 137.5}, 70%, 50%)`
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-12 text-sm font-medium text-gray-900 text-right">
                {item.value}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SimpleChart