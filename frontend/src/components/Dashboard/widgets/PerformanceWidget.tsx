import React from 'react'
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react'
import DashboardWidget from '../DashboardWidget'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

const PerformanceWidget: React.FC<BaseWidgetProps> = ({ onRefresh, onConfigure, className }) => {
  return (
    <DashboardWidget
      id="performance"
      title="Performance"
      subtitle="Métricas de desempenho"
      size="large"
      refreshable
      configurable
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Produtividade</span>
            </div>
            <span className="text-lg font-bold text-blue-700">87%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Metas</span>
            </div>
            <span className="text-lg font-bold text-green-700">92%</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">Crescimento</span>
            </div>
            <span className="text-lg font-bold text-purple-700">+15%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">Eficiência</span>
            </div>
            <span className="text-lg font-bold text-orange-700">94%</span>
          </div>
        </div>
      </div>
    </DashboardWidget>
  )
}

export default PerformanceWidget