import React from 'react'

interface SecurityChartProps {
  data: {
    label: string
    value: number
  }[]
  title: string
  color?: string
}

export const SecurityChart: React.FC<SecurityChartProps> = ({ 
  data, 
  title, 
  color = '#3B82F6' 
}) => {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 min-w-0 flex-1">
              {item.label}
            </span>
            <div className="flex items-center ml-4 flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: color
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 min-w-0">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum dado disponível</p>
        </div>
      )}
    </div>
  )
}

export default SecurityChart