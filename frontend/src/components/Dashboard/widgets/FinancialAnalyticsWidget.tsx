import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  Building,
  Users
} from 'lucide-react'
import DashboardWidget from '../DashboardWidget'
import { financialService } from '../../../utils/financialService'
import { Revenue, Expense, FinancialCategory } from '../../../types/financial'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

interface FinancialMetric {
  id: string
  name: string
  value: number
  previousValue: number
  change: number
  changePercentage: number
  trend: 'up' | 'down' | 'stable'
  target?: number
  format: 'currency' | 'percentage' | 'number'
}

interface ExpenseCategory {
  id: string
  name: string
  amount: number
  percentage: number
  color: string
  change: number
}

interface RevenueSource {
  id: string
  name: string
  amount: number
  percentage: number
  growth: number
}

interface FinancialAlert {
  id: string
  type: 'budget' | 'target' | 'expense' | 'revenue'
  message: string
  severity: 'low' | 'medium' | 'high'
  value?: number
}

const FinancialAnalyticsWidget: React.FC<BaseWidgetProps> = ({ 
  onRefresh, 
  onConfigure, 
  className 
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)
  const [metrics, setMetrics] = useState<FinancialMetric[]>([])
  const [expenses, setExpenses] = useState<ExpenseCategory[]>([])
  const [revenues, setRevenues] = useState<RevenueSource[]>([])
  const [alerts, setAlerts] = useState<FinancialAlert[]>([])
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [activeView, setActiveView] = useState<'overview' | 'expenses' | 'revenue' | 'alerts'>('overview')

  useEffect(() => {
    loadFinancialData()
  }, [period])

  const loadFinancialData = async () => {
    setLoading(true)
    setError(undefined)
    
    try {
      // Carregar dados reais do financialService
      const [revenuesData, expensesData, categoriesData] = await Promise.all([
        financialService.getRevenues(),
        financialService.getExpenses(),
        financialService.getCategories()
      ])

      // Calcular métricas baseadas nos dados reais
      const totalRevenue = revenuesData.reduce((sum: number, revenue: Revenue) => sum + revenue.amount, 0)
      const totalExpenses = expensesData.reduce((sum: number, expense: Expense) => sum + expense.amount, 0)
      const netIncome = totalRevenue - totalExpenses
      const margin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0

      // Para simplificar, vamos usar valores anteriores simulados (em produção, seria histórico real)
      const previousRevenue = totalRevenue * 0.95
      const previousExpenses = totalExpenses * 1.05
      const previousNetIncome = previousRevenue - previousExpenses

      const revenueChange = totalRevenue - previousRevenue
      const expenseChange = totalExpenses - previousExpenses
      const netIncomeChange = netIncome - previousNetIncome

      const calculatedMetrics: FinancialMetric[] = [
        {
          id: 'revenue',
          name: 'Receita Total',
          value: totalRevenue,
          previousValue: previousRevenue,
          change: revenueChange,
          changePercentage: previousRevenue > 0 ? (revenueChange / previousRevenue) * 100 : 0,
          trend: revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'stable',
          target: totalRevenue * 1.1,
          format: 'currency'
        },
        {
          id: 'expenses',
          name: 'Despesas Totais',
          value: totalExpenses,
          previousValue: previousExpenses,
          change: expenseChange,
          changePercentage: previousExpenses > 0 ? (expenseChange / previousExpenses) * 100 : 0,
          trend: expenseChange < 0 ? 'up' : expenseChange > 0 ? 'down' : 'stable',
          format: 'currency'
        },
        {
          id: 'profit',
          name: 'Lucro Líquido',
          value: netIncome,
          previousValue: previousNetIncome,
          change: netIncomeChange,
          changePercentage: previousNetIncome > 0 ? (netIncomeChange / previousNetIncome) * 100 : 0,
          trend: netIncomeChange > 0 ? 'up' : netIncomeChange < 0 ? 'down' : 'stable',
          target: totalRevenue * 0.3,
          format: 'currency'
        },
        {
          id: 'margin',
          name: 'Margem de Lucro',
          value: margin,
          previousValue: previousNetIncome > 0 ? (previousNetIncome / previousRevenue) * 100 : 0,
          change: margin - (previousNetIncome > 0 ? (previousNetIncome / previousRevenue) * 100 : 0),
          changePercentage: 0,
          trend: margin > (previousNetIncome > 0 ? (previousNetIncome / previousRevenue) * 100 : 0) ? 'up' : 'down',
          target: 35,
          format: 'percentage'
        }
      ]

      // Agrupar despesas por categoria
      const expensesByCategory = expensesData.reduce((acc: { [key: string]: number }, expense: Expense) => {
        const category = categoriesData.find((cat: FinancialCategory) => cat.id === expense.categoryId)
        const categoryName = category?.name || 'Outros'
        acc[categoryName] = (acc[categoryName] || 0) + expense.amount
        return acc
      }, {})

      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']
      const calculatedExpenses: ExpenseCategory[] = Object.entries(expensesByCategory).map(([name, amount], index) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        amount: amount as number,
        percentage: totalExpenses > 0 ? ((amount as number) / totalExpenses) * 100 : 0,
        color: colors[index % colors.length],
        change: Math.random() * 10 - 5 // Simulado para demonstração
      }))

      // Agrupar receitas por categoria
      const revenuesByCategory = revenuesData.reduce((acc: { [key: string]: number }, revenue: Revenue) => {
        const category = categoriesData.find((cat: FinancialCategory) => cat.id === revenue.categoryId)
        const categoryName = category?.name || 'Outros'
        acc[categoryName] = (acc[categoryName] || 0) + revenue.amount
        return acc
      }, {})

      const calculatedRevenues: RevenueSource[] = Object.entries(revenuesByCategory).map(([name, amount]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        amount: amount as number,
        percentage: totalRevenue > 0 ? ((amount as number) / totalRevenue) * 100 : 0,
        growth: Math.random() * 20 - 5 // Simulado para demonstração
      }))

      // Gerar alertas baseados nos dados reais
      const calculatedAlerts: FinancialAlert[] = []
      
      if (margin < 20) {
        calculatedAlerts.push({
          id: 'low-margin',
          type: 'target',
          message: `Margem de lucro baixa (${margin.toFixed(1)}%)`,
          severity: 'high',
          value: margin
        })
      }

      if (totalExpenses > totalRevenue * 0.8) {
        calculatedAlerts.push({
          id: 'high-expenses',
          type: 'expense',
          message: 'Despesas representam mais de 80% da receita',
          severity: 'medium'
        })
      }

      setMetrics(calculatedMetrics)
      setExpenses(calculatedExpenses)
      setRevenues(calculatedRevenues)
      setAlerts(calculatedAlerts)
    } catch (err) {
      setError('Erro ao carregar dados financeiros')
      console.error('Erro ao carregar dados financeiros:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadFinancialData()
    onRefresh?.()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return formatPercentage(value)
      default:
        return value.toLocaleString('pt-BR')
    }
  }

  const getTrendIcon = (trend: string, size = 'w-4 h-4') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className={`${size} text-green-500`} />
      case 'down':
        return <ArrowDownRight className={`${size} text-red-500`} />
      default:
        return <div className={`${size} bg-gray-400 rounded-full`} />
    }
  }

  const getChangeColor = (change: number) => {
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'budget':
        return <Wallet className="w-4 h-4 text-blue-500" />
      case 'target':
        return <Target className="w-4 h-4 text-green-500" />
      case 'expense':
        return <CreditCard className="w-4 h-4 text-red-500" />
      case 'revenue':
        return <DollarSign className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <DashboardWidget
      id="financial-analytics"
      title="Análise Financeira"
      subtitle={`Período: ${period === 'month' ? 'Mensal' : period === 'quarter' ? 'Trimestral' : 'Anual'}`}
      loading={loading}
      error={error}
      size="large"
      refreshable
      configurable
      onRefresh={handleRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="space-y-4">
        {/* Controles de Período */}
        <div className="flex justify-between items-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'month', label: 'Mês' },
              { key: 'quarter', label: 'Trimestre' },
              { key: 'year', label: 'Ano' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key as any)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  period === key
                    ? 'bg-white text-medstaff-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'overview', label: 'Geral', icon: BarChart3 },
              { key: 'expenses', label: 'Despesas', icon: PieChart },
              { key: 'revenue', label: 'Receita', icon: TrendingUp },
              { key: 'alerts', label: 'Alertas', icon: AlertTriangle }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as any)}
                className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeView === key
                    ? 'bg-white text-medstaff-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo das Views */}
        {activeView === 'overview' && (
          <div className="space-y-4">
            {/* Métricas Principais */}
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">{metric.name}</span>
                    {getTrendIcon(metric.trend, 'w-3 h-3')}
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-lg font-bold text-gray-900">
                      {formatValue(metric.value, metric.format)}
                    </div>
                    <div className={`text-xs font-medium ${getChangeColor(metric.change)}`}>
                      {metric.change > 0 ? '+' : ''}{formatValue(Math.abs(metric.change), metric.format)} 
                      ({metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%)
                    </div>
                  </div>

                  {/* Progresso para Meta (se houver) */}
                  {metric.target && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Meta</span>
                        <span className="font-medium">{formatValue(metric.target, metric.format)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-medstaff-primary h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Resumo Rápido */}
            <div className="bg-gradient-to-r from-medstaff-light to-medstaff-accent/20 border border-medstaff-secondary/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Building className="w-4 h-4 text-medstaff-primary" />
                <h4 className="text-sm font-semibold text-medstaff-primary">Resumo Financeiro</h4>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-medstaff-primary">
                    {formatCurrency(metrics.find(m => m.id === 'revenue')?.value || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Receita Total</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-medstaff-primary">
                    {formatCurrency(metrics.find(m => m.id === 'profit')?.value || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Lucro Líquido</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-medstaff-primary">
                    {formatPercentage(metrics.find(m => m.id === 'margin')?.value || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Margem</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'expenses' && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: expense.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expense.name}</p>
                    <p className="text-xs text-gray-500">{expense.percentage.toFixed(1)}% do total</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </div>
                  <div className={`text-xs font-medium ${getChangeColor(expense.change)}`}>
                    {expense.change > 0 ? '+' : ''}{expense.change.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === 'revenue' && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {revenues.map((revenue) => (
              <div
                key={revenue.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-medstaff-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-medstaff-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{revenue.name}</p>
                    <p className="text-xs text-gray-500">{revenue.percentage}% da receita total</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {formatCurrency(revenue.amount)}
                  </div>
                  <div className={`text-xs font-medium ${getChangeColor(revenue.growth)}`}>
                    {revenue.growth > 0 ? '+' : ''}{revenue.growth.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === 'alerts' && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start space-x-3 p-3 border-l-4 rounded-r-lg ${getAlertColor(alert.severity)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  {alert.value && (
                    <p className="text-xs text-gray-500 mt-1">Valor: {alert.value}%</p>
                  )}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {alert.severity === 'high' ? 'Alta' : alert.severity === 'medium' ? 'Média' : 'Baixa'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardWidget>
  )
}

export default FinancialAnalyticsWidget