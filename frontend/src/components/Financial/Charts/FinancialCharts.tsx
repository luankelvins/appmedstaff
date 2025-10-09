import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, DollarSign } from 'lucide-react';

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  netIncome: number;
}

interface CategoryData {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color?: string;
}

interface FinancialChartsProps {
  monthlyTrend: MonthlyData[];
  categoryBreakdown: CategoryData[];
  stats: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    pendingRevenue: number;
    pendingExpenses: number;
    overdueRevenue: number;
    overdueExpenses: number;
  };
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({
  monthlyTrend,
  categoryBreakdown,
  stats
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMaxValue = () => {
    const maxRevenue = Math.max(...monthlyTrend.map(m => m.revenue));
    const maxExpenses = Math.max(...monthlyTrend.map(m => m.expenses));
    return Math.max(maxRevenue, maxExpenses);
  };

  const maxValue = getMaxValue();

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Receitas Totais</p>
              <p className="text-2xl font-bold text-green-800">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Pendente: {formatCurrency(stats.pendingRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Despesas Totais</p>
              <p className="text-2xl font-bold text-red-800">
                {formatCurrency(stats.totalExpenses)}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Pendente: {formatCurrency(stats.pendingExpenses)}
              </p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${stats.netIncome >= 0 ? 'from-blue-50 to-blue-100' : 'from-orange-50 to-orange-100'} p-6 rounded-xl shadow-sm border ${stats.netIncome >= 0 ? 'border-blue-200' : 'border-orange-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${stats.netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                Lucro Líquido
              </p>
              <p className={`text-2xl font-bold ${stats.netIncome >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                {formatCurrency(stats.netIncome)}
              </p>
              <p className={`text-xs mt-1 ${stats.netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                Margem: {((stats.netIncome / stats.totalRevenue) * 100).toFixed(1)}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stats.netIncome >= 0 ? 'bg-blue-200' : 'bg-orange-200'}`}>
              <BarChart3 className={`w-6 h-6 ${stats.netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Em Atraso</p>
              <p className="text-2xl font-bold text-yellow-800">
                {formatCurrency(stats.overdueRevenue + stats.overdueExpenses)}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Receitas: {formatCurrency(stats.overdueRevenue)}
              </p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Tendência Mensal */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Tendência Mensal
          </h3>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Receitas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Despesas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Lucro Líquido</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {monthlyTrend.map((month, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{month.month}</span>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-green-600 font-medium">
                    {formatCurrency(month.revenue)}
                  </span>
                  <span className="text-red-600 font-medium">
                    {formatCurrency(month.expenses)}
                  </span>
                  <span className={`font-bold ${month.netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {formatCurrency(month.netIncome)}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-1 h-6">
                {/* Barra de Receitas */}
                <div className="flex-1 bg-gray-100 rounded-l-md relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-l-md transition-all duration-500"
                    style={{ width: `${(month.revenue / maxValue) * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {month.revenue > maxValue * 0.1 && 'R'}
                  </div>
                </div>
                
                {/* Barra de Despesas */}
                <div className="flex-1 bg-gray-100 rounded-r-md relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-400 to-red-500 h-full rounded-r-md transition-all duration-500"
                    style={{ width: `${(month.expenses / maxValue) * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {month.expenses > maxValue * 0.1 && 'D'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown por Categoria */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            Receitas por Categoria
          </h3>
          <div className="text-sm text-gray-500">
            Total: {formatCurrency(categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0))}
          </div>
        </div>
        
        <div className="space-y-4">
          {categoryBreakdown.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color || '#6B7280' }}
                  ></div>
                  <span className="font-medium text-gray-900">{category.categoryName}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-gray-500">{category.percentage.toFixed(1)}%</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-purple-400 to-purple-500"
                  style={{ 
                    width: `${category.percentage}%`,
                    backgroundColor: category.color || '#8B5CF6'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">Taxa de Crescimento</h4>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="space-y-2">
            {monthlyTrend.length >= 2 && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Receitas</span>
                  <span className="font-medium text-green-600">
                    {(((monthlyTrend[monthlyTrend.length - 1].revenue - monthlyTrend[monthlyTrend.length - 2].revenue) / monthlyTrend[monthlyTrend.length - 2].revenue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Lucro</span>
                  <span className="font-medium text-blue-600">
                    {(((monthlyTrend[monthlyTrend.length - 1].netIncome - monthlyTrend[monthlyTrend.length - 2].netIncome) / Math.abs(monthlyTrend[monthlyTrend.length - 2].netIncome)) * 100).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">Eficiência Operacional</h4>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Margem Bruta</span>
              <span className="font-medium">
                {((stats.netIncome / stats.totalRevenue) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>ROI Mensal</span>
              <span className="font-medium">
                {monthlyTrend.length > 0 ? ((monthlyTrend[monthlyTrend.length - 1].netIncome / monthlyTrend[monthlyTrend.length - 1].expenses) * 100).toFixed(1) : '0'}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">Saúde Financeira</h4>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Liquidez</span>
              <span className={`font-medium ${stats.totalRevenue > stats.totalExpenses ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalRevenue > stats.totalExpenses ? 'Positiva' : 'Negativa'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Risco</span>
              <span className={`font-medium ${(stats.overdueRevenue + stats.overdueExpenses) / stats.totalRevenue < 0.1 ? 'text-green-600' : 'text-yellow-600'}`}>
                {(stats.overdueRevenue + stats.overdueExpenses) / stats.totalRevenue < 0.1 ? 'Baixo' : 'Médio'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;