import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  Filter, 
  RefreshCw, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { financialService } from '../../../services/financialService';
import { Revenue, Expense, FinancialCategory } from '../../../types/financial';
import { FinancialExport } from './FinancialExport';

interface AnalyticsData {
  revenues: Revenue[];
  expenses: Expense[];
  categories: FinancialCategory[];
}

interface ChartData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  previousYearRevenue?: number;
  previousYearExpenses?: number;
  forecast?: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  percentage: number;
  [key: string]: any;
}

interface KPIData {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  burnRate: number;
  runway: number;
  revenueChange: number;
  expenseChange: number;
  profitChange: number;
}

interface FinancialInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'info' | 'success';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation?: string;
}

type ViewType = 'overview' | 'trends' | 'categories' | 'insights' | 'export';
type DateRange = '7d' | '30d' | '90d' | '12m' | 'custom';

const FinancialAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenues: [],
    expenses: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [revenues, expenses, categories] = await Promise.all([
        financialService.getRevenues(),
        financialService.getExpenses(),
        financialService.getCategories()
      ]);

      setAnalyticsData({
        revenues,
        expenses,
        categories
      });
    } catch (err) {
      setError('Erro ao carregar dados de análise financeira');
      console.error('Erro ao carregar analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (revenues: Revenue[], expenses: Expense[]): ChartData[] => {
    const monthlyData = new Map<string, { revenue: number; expenses: number }>();

    // Processar receitas
    revenues.forEach(revenue => {
      const month = new Date(revenue.dueDate).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { revenue: 0, expenses: 0 });
      }
      
      monthlyData.get(month)!.revenue += revenue.amount;
    });

    // Processar despesas
    expenses.forEach(expense => {
      const month = new Date(expense.dueDate).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { revenue: 0, expenses: 0 });
      }
      
      monthlyData.get(month)!.expenses += expense.amount;
    });

    // Converter para array e calcular lucro
    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses,
      // Dados simulados para demonstração
      previousYearRevenue: data.revenue * 0.85,
      previousYearExpenses: data.expenses * 0.9,
      forecast: data.revenue * 1.1
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  const processCategoryData = (expenses: Expense[], categories: FinancialCategory[]): CategoryData[] => {
    const categoryTotals = new Map<string, number>();
    
    expenses.forEach(expense => {
      const category = categories.find(cat => cat.id === expense.categoryId);
      const categoryName = category?.name || 'Outros';
      
      categoryTotals.set(categoryName, (categoryTotals.get(categoryName) || 0) + expense.amount);
    });

    const total = Array.from(categoryTotals.values()).reduce((sum, value) => sum + value, 0);
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    return Array.from(categoryTotals.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
      percentage: total > 0 ? (value / total) * 100 : 0
    }));
  };

  const calculateKPIs = (revenues: Revenue[], expenses: Expense[]): KPIData => {
    const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    // Calcular burn rate (média mensal de despesas)
    const monthlyExpenses = new Map<string, number>();
    expenses.forEach(expense => {
      const month = new Date(expense.dueDate).toISOString().slice(0, 7);
      monthlyExpenses.set(month, (monthlyExpenses.get(month) || 0) + expense.amount);
    });
    const burnRate = monthlyExpenses.size > 0 
      ? Array.from(monthlyExpenses.values()).reduce((sum, value) => sum + value, 0) / monthlyExpenses.size
      : 0;

    // Calcular runway (meses que o dinheiro durará)
    const runway = burnRate > 0 ? totalRevenue / burnRate : 0;

    return {
      totalRevenue,
      totalExpenses,
      netIncome,
      profitMargin,
      burnRate,
      runway,
      revenueChange: 15.2, // Dados simulados
      expenseChange: -8.5,
      profitChange: 23.7
    };
  };

  const generateInsights = (kpis: KPIData, chartData: ChartData[]): FinancialInsight[] => {
    const insights: FinancialInsight[] = [];

    // Insight sobre margem de lucro
    if (kpis.profitMargin < 10) {
      insights.push({
        id: 'low-profit-margin',
        type: 'warning',
        title: 'Margem de Lucro Baixa',
        description: `Sua margem de lucro atual é de ${kpis.profitMargin.toFixed(1)}%, abaixo do recomendado.`,
        impact: 'high',
        actionable: true,
        recommendation: 'Considere revisar seus custos operacionais e estratégias de precificação para melhorar a rentabilidade.'
      });
    }

    // Insight sobre crescimento de receita
    if (kpis.revenueChange > 10) {
      insights.push({
        id: 'revenue-growth',
        type: 'success',
        title: 'Crescimento de Receita Positivo',
        description: `Sua receita cresceu ${kpis.revenueChange}% no período analisado.`,
        impact: 'medium',
        actionable: false
      });
    }

    // Insight sobre runway
    if (kpis.runway < 6) {
      insights.push({
        id: 'low-runway',
        type: 'warning',
        title: 'Runway Baixo',
        description: `Com o burn rate atual, você tem aproximadamente ${kpis.runway.toFixed(1)} meses de runway.`,
        impact: 'high',
        actionable: true,
        recommendation: 'Considere reduzir custos ou aumentar receitas para estender o runway financeiro.'
      });
    }

    // Insight sobre tendência de lucro
    const recentProfit = chartData.slice(-3).map(d => d.profit);
    const profitTrend = recentProfit.length > 1 
      ? recentProfit[recentProfit.length - 1] - recentProfit[0]
      : 0;

    if (profitTrend > 0) {
      insights.push({
        id: 'profit-trend',
        type: 'opportunity',
        title: 'Tendência de Lucro Positiva',
        description: 'Seu lucro tem mostrado uma tendência crescente nos últimos meses.',
        impact: 'medium',
        actionable: true,
        recommendation: 'Mantenha as estratégias atuais e considere investir em crescimento.'
      });
    }

    return insights;
  };

  const chartData = processChartData(analyticsData.revenues, analyticsData.expenses);
  const categoryData = processCategoryData(analyticsData.expenses, analyticsData.categories);
  const kpiData = calculateKPIs(analyticsData.revenues, analyticsData.expenses);
  const insights = generateInsights(kpiData, chartData);

  const viewOptions = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'trends', label: 'Tendências', icon: TrendingUp },
    { id: 'categories', label: 'Categorias', icon: PieChart },
    { id: 'insights', label: 'Insights', icon: Activity }
  ];

  const dateRangeOptions = [
    { id: '7d', label: '7 dias' },
    { id: '30d', label: '30 dias' },
    { id: '90d', label: '90 dias' },
    { id: '12m', label: '12 meses' },
    { id: 'custom', label: 'Personalizado' }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Erro</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            onClick={loadAnalyticsData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Análise Financeira</h1>
          <p className="text-gray-600 mt-1">
            Análise avançada e insights sobre sua performance financeira
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <button
            onClick={loadAnalyticsData}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* View Selector */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {viewOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setCurrentView(option.id as ViewType)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                  currentView === option.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {dateRangeOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="space-y-6">
        {currentView === 'overview' && (
          <div className="space-y-6">
            {/* KPIs Simplificados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {kpiData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Despesas Total</p>
                    <p className="text-2xl font-bold text-red-600">
                      R$ {kpiData.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                    <p className={`text-2xl font-bold ${kpiData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {kpiData.netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Margem de Lucro</p>
                    <p className={`text-2xl font-bold ${kpiData.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpiData.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <Percent className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Gráfico Simplificado */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendência Financeira</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Gráfico de tendências será implementado</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'trends' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Tendências</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p>Análise de tendências será implementada</p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'categories' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise por Categorias</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryData.map((category, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {((category.value / kpiData.totalExpenses) * 100).toFixed(1)}% do total
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'insights' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights Financeiros</h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-gray-700 mt-1">{insight.description}</p>
                  {insight.recommendation && (
                    <p className="text-sm text-blue-600 mt-2">
                      <strong>Recomendação:</strong> {insight.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'export' && (
          <FinancialExport 
            revenues={analyticsData.revenues}
            expenses={analyticsData.expenses}
            categories={analyticsData.categories}
          />
        )}
      </div>
    </div>
  );
};

export default FinancialAnalyticsDashboard;