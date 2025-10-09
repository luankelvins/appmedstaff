import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

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
  [key: string]: any; // Index signature para compatibilidade com recharts
}

interface AdvancedFinancialChartsProps {
  data: ChartData[];
  categoryData: CategoryData[];
  loading?: boolean;
}

type ChartType = 'trend' | 'comparison' | 'forecast' | 'category' | 'combined';
type TimeRange = '3m' | '6m' | '12m' | '24m';

const AdvancedFinancialCharts: React.FC<AdvancedFinancialChartsProps> = ({
  data,
  categoryData,
  loading = false
}) => {
  const [activeChart, setActiveChart] = useState<ChartType>('trend');
  const [timeRange, setTimeRange] = useState<TimeRange>('12m');
  const [showForecast, setShowForecast] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getFilteredData = () => {
    const months = {
      '3m': 3,
      '6m': 6,
      '12m': 12,
      '24m': 24
    };
    return data.slice(-months[timeRange]);
  };

  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return 0;
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  const filteredData = getFilteredData();
  const revenueTrend = calculateTrend(filteredData.map(d => d.revenue));
  const profitTrend = calculateTrend(filteredData.map(d => d.profit));

  const chartTypes = [
    { id: 'trend', label: 'Tendências', icon: TrendingUp },
    { id: 'comparison', label: 'Comparação', icon: BarChart3 },
    { id: 'forecast', label: 'Previsão', icon: Activity },
    { id: 'category', label: 'Categorias', icon: PieChartIcon },
    { id: 'combined', label: 'Combinado', icon: BarChart3 }
  ];

  const timeRanges = [
    { id: '3m', label: '3 meses' },
    { id: '6m', label: '6 meses' },
    { id: '12m', label: '12 meses' },
    { id: '24m', label: '24 meses' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const renderTrendChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={filteredData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={formatCurrency}
        />
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), '']}
          labelStyle={{ color: '#374151' }}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#3b82f6" 
          strokeWidth={3}
          name="Receita"
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#ef4444" 
          strokeWidth={3}
          name="Despesas"
          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="profit" 
          stroke="#10b981" 
          strokeWidth={3}
          name="Lucro"
          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
        />
        {showForecast && (
          <Line 
            type="monotone" 
            dataKey="forecast" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Previsão"
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderComparisonChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={filteredData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={formatCurrency}
        />
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), '']}
          labelStyle={{ color: '#374151' }}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar 
          dataKey="revenue" 
          fill="#3b82f6" 
          name="Receita Atual"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="previousYearRevenue" 
          fill="#93c5fd" 
          name="Receita Ano Anterior"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderForecastChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={filteredData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={formatCurrency}
        />
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), '']}
          labelStyle={{ color: '#374151' }}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          fill="#3b82f6" 
          fillOpacity={0.3}
          stroke="#3b82f6"
          name="Receita Histórica"
        />
        <Line 
          type="monotone" 
          dataKey="forecast" 
          stroke="#8b5cf6" 
          strokeWidth={3}
          strokeDasharray="5 5"
          name="Previsão"
          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderCategoryChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name} (${percentage}%)`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), '']}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderCombinedChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={filteredData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={formatCurrency}
        />
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), '']}
          labelStyle={{ color: '#374151' }}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar 
          dataKey="revenue" 
          fill="#3b82f6" 
          name="Receita"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="expenses" 
          fill="#ef4444" 
          name="Despesas"
          radius={[4, 4, 0, 0]}
        />
        <Line 
          type="monotone" 
          dataKey="profit" 
          stroke="#10b981" 
          strokeWidth={3}
          name="Lucro"
          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (activeChart) {
      case 'trend':
        return renderTrendChart();
      case 'comparison':
        return renderComparisonChart();
      case 'forecast':
        return renderForecastChart();
      case 'category':
        return renderCategoryChart();
      case 'combined':
        return renderCombinedChart();
      default:
        return renderTrendChart();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Análise Financeira Avançada
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>Receita: {revenueTrend > 0 ? '+' : ''}{formatPercentage(revenueTrend)}</span>
            </div>
            <div className="flex items-center gap-1">
              {profitTrend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span>Lucro: {profitTrend > 0 ? '+' : ''}{formatPercentage(profitTrend)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 lg:mt-0">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        {/* Chart Type Selector */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {chartTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setActiveChart(type.id as ChartType)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                  activeChart === type.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Time Range & Options */}
        <div className="flex items-center gap-2">
          {activeChart === 'forecast' && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showForecast}
                onChange={(e) => setShowForecast(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Mostrar Previsão
            </label>
          )}
          
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
            {timeRanges.map(range => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id as TimeRange)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  timeRange === range.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full">
        {renderChart()}
      </div>

      {/* Chart Info */}
      {activeChart === 'category' && (
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryData.map((category, index) => (
            <div key={index} className="text-center">
              <div 
                className="w-4 h-4 rounded mx-auto mb-2"
                style={{ backgroundColor: category.color }}
              ></div>
              <div className="text-sm font-medium text-gray-900">{category.name}</div>
              <div className="text-xs text-gray-600">{formatCurrency(category.value)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedFinancialCharts;