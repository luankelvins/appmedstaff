import React, { useState, useMemo } from 'react';
import { 
  FinancialReport, 
  FinancialFilter, 
  Revenue, 
  Expense, 
  FinancialCategory,
  BankAccount,
  PaymentMethod,
  TransactionStatus 
} from '../../../types/financial';

interface FinancialReportsProps {
  revenues: Revenue[];
  expenses: Expense[];
  categories: FinancialCategory[];
  bankAccounts: BankAccount[];
  paymentMethods: PaymentMethod[];
}

const FinancialReports: React.FC<FinancialReportsProps> = ({
  revenues,
  expenses,
  categories,
  bankAccounts,
  paymentMethods
}) => {
  const [filters, setFilters] = useState<FinancialFilter>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    categoryIds: [],
    bankAccountIds: [],
    paymentMethodIds: [],
    status: [],
    minAmount: undefined,
    maxAmount: undefined,
    searchTerm: ''
  });

  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'category' | 'monthly'>('summary');

  // Filtrar transações baseado nos filtros
  const filteredRevenues = useMemo(() => {
    return revenues.filter(revenue => {
      const date = new Date(revenue.dueDate);
      const matchesDate = (!filters.startDate || date >= filters.startDate) && 
                         (!filters.endDate || date <= filters.endDate);
      const matchesCategory = !filters.categoryIds || filters.categoryIds.length === 0 || 
                             filters.categoryIds.includes(revenue.categoryId);
      const matchesBankAccount = !filters.bankAccountIds || filters.bankAccountIds.length === 0 || 
                                (revenue.bankAccountId && filters.bankAccountIds.includes(revenue.bankAccountId));
      const matchesPaymentMethod = !filters.paymentMethodIds || filters.paymentMethodIds.length === 0 || 
                                  filters.paymentMethodIds.includes(revenue.paymentMethodId);
      const matchesStatus = !filters.status || filters.status.length === 0 || 
                           filters.status.includes(revenue.status);
      const matchesAmount = (!filters.minAmount || revenue.amount >= filters.minAmount) && 
                           (!filters.maxAmount || revenue.amount <= filters.maxAmount);
      const matchesSearch = !filters.searchTerm || 
                           revenue.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           (revenue.notes && revenue.notes.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      return matchesDate && matchesCategory && matchesBankAccount && matchesPaymentMethod && 
             matchesStatus && matchesAmount && matchesSearch;
    });
  }, [revenues, filters]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const date = new Date(expense.dueDate);
      const matchesDate = (!filters.startDate || date >= filters.startDate) && 
                         (!filters.endDate || date <= filters.endDate);
      const matchesCategory = !filters.categoryIds || filters.categoryIds.length === 0 || 
                             filters.categoryIds.includes(expense.categoryId);
      const matchesBankAccount = !filters.bankAccountIds || filters.bankAccountIds.length === 0 || 
                                (expense.bankAccountId && filters.bankAccountIds.includes(expense.bankAccountId));
      const matchesPaymentMethod = !filters.paymentMethodIds || filters.paymentMethodIds.length === 0 || 
                                  filters.paymentMethodIds.includes(expense.paymentMethodId);
      const matchesStatus = !filters.status || filters.status.length === 0 || 
                           filters.status.includes(expense.status);
      const matchesAmount = (!filters.minAmount || expense.amount >= filters.minAmount) && 
                           (!filters.maxAmount || expense.amount <= filters.maxAmount);
      const matchesSearch = !filters.searchTerm || 
                           expense.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           (expense.notes && expense.notes.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      return matchesDate && matchesCategory && matchesBankAccount && matchesPaymentMethod && 
             matchesStatus && matchesAmount && matchesSearch;
    });
  }, [expenses, filters]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalRevenues = filteredRevenues.reduce((sum, rev) => sum + rev.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const confirmedRevenues = filteredRevenues
      .filter(rev => rev.status === 'confirmed')
      .reduce((sum, rev) => sum + rev.amount, 0);
    const confirmedExpenses = filteredExpenses
      .filter(exp => exp.status === 'confirmed')
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      totalRevenues,
      totalExpenses,
      confirmedRevenues,
      confirmedExpenses,
      balance: totalRevenues - totalExpenses,
      confirmedBalance: confirmedRevenues - confirmedExpenses,
      pendingRevenues: totalRevenues - confirmedRevenues,
      pendingExpenses: totalExpenses - confirmedExpenses
    };
  }, [filteredRevenues, filteredExpenses]);

  // Relatório por categoria
  const categoryReport = useMemo(() => {
    const categoryStats = categories.map(category => {
      const categoryRevenues = filteredRevenues.filter(rev => rev.categoryId === category.id);
      const categoryExpenses = filteredExpenses.filter(exp => exp.categoryId === category.id);
      
      return {
        category: category.name,
        color: category.color,
        revenues: categoryRevenues.reduce((sum, rev) => sum + rev.amount, 0),
        expenses: categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        count: categoryRevenues.length + categoryExpenses.length
      };
    }).filter(stat => stat.revenues > 0 || stat.expenses > 0);

    return categoryStats;
  }, [categories, filteredRevenues, filteredExpenses]);

  // Relatório mensal
  const monthlyReport = useMemo(() => {
    const months: { [key: string]: { revenues: number; expenses: number } } = {};
    
    filteredRevenues.forEach(revenue => {
      const monthKey = new Date(revenue.dueDate).toISOString().substring(0, 7);
      if (!months[monthKey]) months[monthKey] = { revenues: 0, expenses: 0 };
      months[monthKey].revenues += revenue.amount;
    });

    filteredExpenses.forEach(expense => {
      const monthKey = new Date(expense.dueDate).toISOString().substring(0, 7);
      if (!months[monthKey]) months[monthKey] = { revenues: 0, expenses: 0 };
      months[monthKey].expenses += expense.amount;
    });

    return Object.entries(months)
      .map(([month, data]) => ({
        month,
        ...data,
        balance: data.revenues - data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredRevenues, filteredExpenses]);

  const handleFilterChange = (field: keyof FinancialFilter, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      categoryIds: [],
      bankAccountIds: [],
      paymentMethodIds: [],
      status: [],
      minAmount: undefined,
      maxAmount: undefined,
      searchTerm: ''
    });
  };

  const exportReport = () => {
    const reportData = {
      type: reportType,
      period: `${filters.startDate?.toLocaleDateString() || 'N/A'} - ${filters.endDate?.toLocaleDateString() || 'N/A'}`,
      stats,
      categoryReport,
      monthlyReport,
      filteredRevenues,
      filteredExpenses
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filtros Avançados</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Categorias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categorias
            </label>
            <select
              multiple
              value={filters.categoryIds}
              onChange={(e) => handleFilterChange('categoryIds', Array.from(e.target.selectedOptions, option => option.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Contas Bancárias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contas Bancárias
            </label>
            <select
              multiple
              value={filters.bankAccountIds}
              onChange={(e) => handleFilterChange('bankAccountIds', Array.from(e.target.selectedOptions, option => option.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {bankAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} - {account.bank}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              multiple
              value={filters.status}
              onChange={(e) => handleFilterChange('status', Array.from(e.target.selectedOptions, option => option.value as TransactionStatus))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Valor Mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Mínimo
            </label>
            <input
              type="number"
              step="0.01"
              value={filters.minAmount || ''}
              onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Valor Máximo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Máximo
            </label>
            <input
              type="number"
              step="0.01"
              value={filters.maxAmount || ''}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              placeholder="Descrição ou observações..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Limpar Filtros
          </button>
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Tipo de Relatório */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex gap-2 mb-4">
          {[
            { key: 'summary', label: 'Resumo' },
            { key: 'detailed', label: 'Detalhado' },
            { key: 'category', label: 'Por Categoria' },
            { key: 'monthly', label: 'Mensal' }
          ].map(type => (
            <button
              key={type.key}
              onClick={() => setReportType(type.key as any)}
              className={`px-4 py-2 rounded-md ${
                reportType === type.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Resumo Geral */}
        {reportType === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-800">Total de Receitas</h4>
              <p className="text-2xl font-bold text-green-600">
                R$ {stats.totalRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-green-600">
                Confirmadas: R$ {stats.confirmedRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-red-800">Total de Despesas</h4>
              <p className="text-2xl font-bold text-red-600">
                R$ {stats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-red-600">
                Confirmadas: R$ {stats.confirmedExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${stats.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <h4 className={`text-sm font-medium ${stats.balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                Saldo Total
              </h4>
              <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-sm ${stats.confirmedBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                Confirmado: R$ {stats.confirmedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800">Pendentes</h4>
              <p className="text-lg font-bold text-yellow-600">
                R$ {stats.pendingRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-yellow-600">
                Despesas: R$ {stats.pendingExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        {/* Relatório Detalhado */}
        {reportType === 'detailed' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">Receitas ({filteredRevenues.length})</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRevenues.map(revenue => (
                      <tr key={revenue.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {revenue.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          R$ {revenue.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(revenue.dueDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            revenue.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            revenue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {revenue.status === 'confirmed' ? 'Confirmado' :
                             revenue.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3">Despesas ({filteredExpenses.length})</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map(expense => (
                      <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            expense.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {expense.status === 'confirmed' ? 'Confirmado' :
                             expense.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Relatório por Categoria */}
        {reportType === 'category' && (
          <div className="space-y-4">
            {categoryReport.map(stat => (
              <div key={stat.category} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  ></div>
                  <h4 className="text-lg font-semibold">{stat.category}</h4>
                  <span className="text-sm text-gray-500">({stat.count} transações)</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Receitas</p>
                    <p className="text-lg font-semibold text-green-600">
                      R$ {stat.revenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Despesas</p>
                    <p className="text-lg font-semibold text-red-600">
                      R$ {stat.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Saldo</p>
                    <p className={`text-lg font-semibold ${
                      (stat.revenues - stat.expenses) >= 0 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      R$ {(stat.revenues - stat.expenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Relatório Mensal */}
        {reportType === 'monthly' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mês
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receitas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Despesas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyReport.map(month => (
                  <tr key={month.month}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(month.month + '-01').toLocaleDateString('pt-BR', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      R$ {month.revenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      R$ {month.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={month.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}>
                        R$ {month.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReports;