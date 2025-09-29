import React from 'react'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import DashboardWidget from '../DashboardWidget'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

const FinancialWidget: React.FC<BaseWidgetProps> = ({ onRefresh, onConfigure, className }) => {
  return (
    <DashboardWidget
      id="financial"
      title="Financeiro"
      subtitle="Indicadores do mês"
      size="large"
      refreshable
      configurable
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Receita</p>
              <p className="text-2xl font-bold text-green-700">R$ 125.4K</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">+12.5% vs mês anterior</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Despesas</p>
              <p className="text-2xl font-bold text-blue-700">R$ 89.2K</p>
            </div>
            <TrendingDown className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">-5.2% vs mês anterior</p>
        </div>
      </div>
    </DashboardWidget>
  )
}

export default FinancialWidget