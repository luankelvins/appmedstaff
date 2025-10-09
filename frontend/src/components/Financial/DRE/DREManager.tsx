import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  FileText,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Revenue, Expense, FinancialCategory } from '../../../types/financial';
import { financialService } from '../../../utils/financialService';

interface DREData {
  period: string;
  receitaBruta: number;
  deducoes: number;
  receitaLiquida: number;
  custoProdutosVendidos: number;
  lucroBruto: number;
  despesasOperacionais: {
    vendas: number;
    administrativas: number;
    financeiras: number;
    total: number;
  };
  lucroOperacional: number;
  receitasNaoOperacionais: number;
  despesasNaoOperacionais: number;
  lucroAntesImposto: number;
  impostos: number;
  lucroLiquido: number;
  margens: {
    bruta: number;
    operacional: number;
    liquida: number;
  };
}

interface DREFilters {
  startDate: string;
  endDate: string;
  categories: string[];
  comparison: 'none' | 'previous_period' | 'same_period_last_year';
  includeProjections: boolean;
}

interface DREManagerProps {}

const DREManager: React.FC<DREManagerProps> = () => {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<DREFilters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    categories: [],
    comparison: 'previous_period',
    includeProjections: false
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'detailed' | 'summary'>('detailed');

  // Carregar dados do financialService
  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [revenuesData, expensesData, categoriesData] = await Promise.all([
        financialService.getRevenues(),
        financialService.getExpenses(),
        financialService.getCategories()
      ]);
      
      setRevenues(revenuesData);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Erro ao carregar dados financeiros. Tente novamente.');
      console.error('Erro ao carregar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const calculateDRE = useMemo((): DREData => {

    // Filtrar por período
    const filteredRevenues = revenues.filter((revenue: Revenue) => {
      const date = new Date(revenue.dueDate);
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      return date >= start && date <= end;
    });

    const filteredExpenses = expenses.filter((expense: Expense) => {
      const date = new Date(expense.dueDate);
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      return date >= start && date <= end;
    });

    // Calcular receitas
    const receitaBruta = filteredRevenues.reduce((sum: number, revenue: Revenue) => sum + revenue.amount, 0);
    const deducoes = receitaBruta * 0.08; // Simulando impostos sobre vendas
    const receitaLiquida = receitaBruta - deducoes;

    // Calcular custos e despesas por categoria
    const custoProdutosVendidos = filteredExpenses
      .filter((expense: Expense) => expense.categoryId === '2') // Categoria de produtos
      .reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

    const lucroBruto = receitaLiquida - custoProdutosVendidos;

    // Despesas operacionais
    const despesasVendas = filteredExpenses
      .filter((expense: Expense) => expense.categoryId === '5') // Marketing
      .reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

    const despesasAdministrativas = filteredExpenses
      .filter((expense: Expense) => ['3', '4'].includes(expense.categoryId || '')) // Pessoal + Infraestrutura
      .reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

    const despesasFinanceiras = filteredExpenses
      .filter((expense: Expense) => expense.categoryId === '6') // Categoria financeira (se existir)
      .reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

    const totalDespesasOperacionais = despesasVendas + despesasAdministrativas + despesasFinanceiras;

    const lucroOperacional = lucroBruto - totalDespesasOperacionais;

    // Receitas e despesas não operacionais (simuladas)
    const receitasNaoOperacionais = 0;
    const despesasNaoOperacionais = 0;

    const lucroAntesImposto = lucroOperacional + receitasNaoOperacionais - despesasNaoOperacionais;
    const impostos = Math.max(0, lucroAntesImposto * 0.25); // 25% de imposto
    const lucroLiquido = lucroAntesImposto - impostos;

    // Calcular margens
    const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;
    const margemOperacional = receitaLiquida > 0 ? (lucroOperacional / receitaLiquida) * 100 : 0;
    const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;

    return {
      period: `${new Date(filters.startDate).toLocaleDateString('pt-BR')} - ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`,
      receitaBruta,
      deducoes,
      receitaLiquida,
      custoProdutosVendidos,
      lucroBruto,
      despesasOperacionais: {
        vendas: despesasVendas,
        administrativas: despesasAdministrativas,
        financeiras: despesasFinanceiras,
        total: totalDespesasOperacionais
      },
      lucroOperacional,
      receitasNaoOperacionais,
      despesasNaoOperacionais,
      lucroAntesImposto,
      impostos,
      lucroLiquido,
      margens: {
        bruta: margemBruta,
        operacional: margemOperacional,
        liquida: margemLiquida
      }
    };
  }, [filters, revenues, expenses]);

  const handleExportDRE = () => {
    // Implementar exportação para PDF/Excel
    console.log('Exportando DRE...', calculateDRE);
  };

  const getIndicatorColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getIndicatorIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4" />;
    if (value < 0) return <TrendingDown className="w-4 h-4" />;
    return <BarChart3 className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Demonstrativo de Resultado do Exercício (DRE)
            </h1>
            <p className="text-blue-100 mt-2">
              Análise detalhada da performance financeira da empresa
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button
              onClick={handleExportDRE}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Filtros de Análise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comparação
              </label>
              <select
                value={filters.comparison}
                onChange={(e) => setFilters(prev => ({ ...prev, comparison: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="none">Sem comparação</option>
                <option value="previous_period">Período anterior</option>
                <option value="same_period_last_year">Mesmo período ano anterior</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modo de Visualização
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'detailed' | 'summary')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="detailed">Detalhado</option>
                <option value="summary">Resumido</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">Margem Bruta</h4>
            <div className={getIndicatorColor(calculateDRE.margens.bruta)}>
              {getIndicatorIcon(calculateDRE.margens.bruta)}
            </div>
          </div>
          <p className={`text-2xl font-bold ${getIndicatorColor(calculateDRE.margens.bruta)}`}>
            {formatPercentage(calculateDRE.margens.bruta)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {formatCurrency(calculateDRE.lucroBruto)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">Margem Operacional</h4>
            <div className={getIndicatorColor(calculateDRE.margens.operacional)}>
              {getIndicatorIcon(calculateDRE.margens.operacional)}
            </div>
          </div>
          <p className={`text-2xl font-bold ${getIndicatorColor(calculateDRE.margens.operacional)}`}>
            {formatPercentage(calculateDRE.margens.operacional)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {formatCurrency(calculateDRE.lucroOperacional)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">Margem Líquida</h4>
            <div className={getIndicatorColor(calculateDRE.margens.liquida)}>
              {getIndicatorIcon(calculateDRE.margens.liquida)}
            </div>
          </div>
          <p className={`text-2xl font-bold ${getIndicatorColor(calculateDRE.margens.liquida)}`}>
            {formatPercentage(calculateDRE.margens.liquida)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {formatCurrency(calculateDRE.lucroLiquido)}
          </p>
        </div>
      </div>

      {/* DRE Detalhado */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              DRE - {calculateDRE.period}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Atualizado em:</span>
              <span className="text-sm font-medium">{new Date().toLocaleString('pt-BR')}</span>
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Receitas */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-semibold text-gray-900">RECEITA BRUTA</span>
                <span className="font-bold text-green-600 text-lg">
                  {formatCurrency(calculateDRE.receitaBruta)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 pl-4">
                <span className="text-gray-700">(-) Deduções e Impostos</span>
                <span className="text-red-600 font-medium">
                  {formatCurrency(calculateDRE.deducoes)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200 bg-green-50 px-4 rounded-lg">
                <span className="font-semibold text-green-800">RECEITA LÍQUIDA</span>
                <span className="font-bold text-green-700 text-lg">
                  {formatCurrency(calculateDRE.receitaLiquida)}
                </span>
              </div>
            </div>

            {/* Custos */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 pl-4">
                <span className="text-gray-700">(-) Custo dos Produtos Vendidos</span>
                <span className="text-red-600 font-medium">
                  {formatCurrency(calculateDRE.custoProdutosVendidos)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200 bg-blue-50 px-4 rounded-lg">
                <span className="font-semibold text-blue-800">LUCRO BRUTO</span>
                <span className={`font-bold text-lg ${getIndicatorColor(calculateDRE.lucroBruto)}`}>
                  {formatCurrency(calculateDRE.lucroBruto)}
                </span>
              </div>
            </div>

            {/* Despesas Operacionais */}
            <div className="space-y-3">
              <div className="font-semibold text-gray-900 py-2">DESPESAS OPERACIONAIS</div>
              
              {viewMode === 'detailed' && (
                <>
                  <div className="flex justify-between items-center py-2 pl-4">
                    <span className="text-gray-700">(-) Despesas de Vendas</span>
                    <span className="text-red-600 font-medium">
                      {formatCurrency(calculateDRE.despesasOperacionais.vendas)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 pl-4">
                    <span className="text-gray-700">(-) Despesas Administrativas</span>
                    <span className="text-red-600 font-medium">
                      {formatCurrency(calculateDRE.despesasOperacionais.administrativas)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 pl-4">
                    <span className="text-gray-700">(-) Despesas Financeiras</span>
                    <span className="text-red-600 font-medium">
                      {formatCurrency(calculateDRE.despesasOperacionais.financeiras)}
                    </span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between items-center py-2 pl-4 border-b border-gray-100">
                <span className="font-medium text-gray-800">Total Despesas Operacionais</span>
                <span className="text-red-600 font-bold">
                  {formatCurrency(calculateDRE.despesasOperacionais.total)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200 bg-purple-50 px-4 rounded-lg">
                <span className="font-semibold text-purple-800">LUCRO OPERACIONAL</span>
                <span className={`font-bold text-lg ${getIndicatorColor(calculateDRE.lucroOperacional)}`}>
                  {formatCurrency(calculateDRE.lucroOperacional)}
                </span>
              </div>
            </div>

            {/* Resultado Final */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 pl-4">
                <span className="text-gray-700">(-) Impostos sobre o Lucro</span>
                <span className="text-red-600 font-medium">
                  {formatCurrency(calculateDRE.impostos)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-4 border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 px-6 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-lg">LUCRO LÍQUIDO</span>
                  {calculateDRE.lucroLiquido > 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <span className={`font-bold text-xl ${getIndicatorColor(calculateDRE.lucroLiquido)}`}>
                  {formatCurrency(calculateDRE.lucroLiquido)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análise de Performance */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Análise de Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Indicadores de Rentabilidade</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Margem Bruta:</span>
                <span className={`text-sm font-medium ${getIndicatorColor(calculateDRE.margens.bruta)}`}>
                  {formatPercentage(calculateDRE.margens.bruta)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Margem Operacional:</span>
                <span className={`text-sm font-medium ${getIndicatorColor(calculateDRE.margens.operacional)}`}>
                  {formatPercentage(calculateDRE.margens.operacional)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Margem Líquida:</span>
                <span className={`text-sm font-medium ${getIndicatorColor(calculateDRE.margens.liquida)}`}>
                  {formatPercentage(calculateDRE.margens.liquida)}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Composição de Custos</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Custos/Receita:</span>
                <span className="text-sm font-medium">
                  {formatPercentage((calculateDRE.custoProdutosVendidos / calculateDRE.receitaLiquida) * 100)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Despesas Op./Receita:</span>
                <span className="text-sm font-medium">
                  {formatPercentage((calculateDRE.despesasOperacionais.total / calculateDRE.receitaLiquida) * 100)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Impostos/Receita:</span>
                <span className="text-sm font-medium">
                  {formatPercentage((calculateDRE.impostos / calculateDRE.receitaLiquida) * 100)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DREManager;