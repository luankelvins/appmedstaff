import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import DashboardWidget from '../DashboardWidget'
import { widgetDataService } from '../../../services/widgetDataService'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

const FinancialWidget: React.FC<BaseWidgetProps> = ({ onRefresh, onConfigure, className }) => {
  const [financialData, setFinancialData] = useState<{
    revenue: number
    expenses: number
    revenueGrowth: number
    expenseGrowth: number
  }>({
    revenue: 0,
    expenses: 0,
    revenueGrowth: 0,
    expenseGrowth: 0
  })
  const [loading, setLoading] = useState(true)

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      const metrics = await widgetDataService.getFinancialMetrics()
      
      if (metrics.length > 0) {
        const currentMonth = metrics[0]
        const previousMonth = metrics[1] || currentMonth
        
        const revenueGrowth = previousMonth.revenue > 0 
          ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
          : 0
        
        const expenseGrowth = previousMonth.expenses > 0
          ? ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
          : 0

        setFinancialData({
          revenue: currentMonth.revenue,
          expenses: currentMonth.expenses,
          revenueGrowth,
          expenseGrowth
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFinancialData()
  }, [])

  const handleRefresh = () => {
    loadFinancialData()
    onRefresh?.()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <DashboardWidget
        id="financial"
        title="Financeiro"
        subtitle="Indicadores do mês"
        size="large"
        refreshable
        configurable
        onRefresh={handleRefresh}
        onConfigure={onConfigure}
        className={className}
      >
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardWidget>
    )
  }

  return (
    <DashboardWidget
      id="financial"
      title="Financeiro"
      subtitle="Indicadores do mês"
      size="large"
      refreshable
      configurable
      onRefresh={handleRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Receita</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(financialData.revenue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">{formatPercentage(financialData.revenueGrowth)} vs mês anterior</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Despesas</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(financialData.expenses)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">{formatPercentage(financialData.expenseGrowth)} vs mês anterior</p>
        </div>
      </div>
    </DashboardWidget>
  )
}

export default FinancialWidget