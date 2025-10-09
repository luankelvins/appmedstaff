import React from 'react'
import { Users, Target, TrendingUp } from 'lucide-react'
import DashboardWidget from '../DashboardWidget'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

const CommercialWidget: React.FC<BaseWidgetProps> = ({ onRefresh, onConfigure, className }) => {
  return (
    <DashboardWidget
      id="commercial"
      title="Comercial"
      subtitle="Pipeline e conversões"
      size="medium"
      refreshable
      configurable
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Leads Ativos</p>
              <p className="text-2xl font-bold">47</p>
            </div>
          </div>
          <span className="text-sm text-green-600">+8</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Taxa Conversão</p>
              <p className="text-2xl font-bold">24.8%</p>
            </div>
          </div>
          <span className="text-sm text-green-600">+3.2%</span>
        </div>
      </div>
    </DashboardWidget>
  )
}

export default CommercialWidget