import React, { useState, useEffect } from 'react';
import RevenuesManager from './Revenues/RevenuesManager';
import ExpensesManager from './Expenses/ExpensesManager';
import FinancialCategoriesManager from './Categories/FinancialCategoriesManager';
import BankAccountsManager from './BankAccounts/BankAccountsManager';
import PaymentMethodsManager from './PaymentMethods/PaymentMethodsManager';
import RecurrenceManager from './Recurrence/RecurrenceManager';
import FinancialReports from './Reports/FinancialReports';
import FinancialCharts from './Charts/FinancialCharts';
import DREManager from './DRE/DREManager';
import { FinancialStats, Revenue, Expense, FinancialNotification, FinancialCategory, BankAccount, PaymentMethod } from '../../types/financial';
import { financialService } from '../../services/financialService';

type FinancialView = 
  | 'overview' 
  | 'revenues' 
  | 'expenses' 
  | 'categories' 
  | 'bankAccounts' 
  | 'paymentMethods' 
  | 'recurrence' 
  | 'reports'
  | 'dre';

const FinancialDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<FinancialView>('overview');
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [notifications, setNotifications] = useState<FinancialNotification[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<(Revenue | Expense)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para dados reais
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Função para carregar dados financeiros
  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        categoriesData,
        bankAccountsData,
        paymentMethodsData,
        revenuesData,
        expensesData,
        notificationsData
      ] = await Promise.all([
        financialService.getCategories(),
        financialService.getBankAccounts(),
        financialService.getPaymentMethods(),
        financialService.getRevenues(),
        financialService.getExpenses(),
        financialService.getNotifications()
      ]);

      setCategories(categoriesData);
      setBankAccounts(bankAccountsData);
      setPaymentMethods(paymentMethodsData);
      setRevenues(revenuesData);
      setExpenses(expensesData);
      setNotifications(notificationsData);

      // Calcular estatísticas baseadas nos dados reais
      calculateStats(revenuesData, expensesData, categoriesData);

      // Definir transações recentes (últimas 10)
      const allTransactions = [...revenuesData, ...expensesData]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setRecentTransactions(allTransactions);

    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
      setError('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  // Função para calcular estatísticas
  const calculateStats = (revenuesData: Revenue[], expensesData: Expense[], categoriesData: FinancialCategory[]) => {
    const totalRevenue = revenuesData.reduce((sum, revenue) => sum + revenue.amount, 0);
    const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    const pendingRevenue = revenuesData
      .filter(r => r.status === 'pending')
      .reduce((sum, revenue) => sum + revenue.amount, 0);

    const pendingExpenses = expensesData
      .filter(e => e.status === 'pending')
      .reduce((sum, expense) => sum + expense.amount, 0);

    const now = new Date();
    const overdueRevenue = revenuesData
      .filter(r => r.status === 'pending' && new Date(r.dueDate) < now)
      .reduce((sum, revenue) => sum + revenue.amount, 0);

    const overdueExpenses = expensesData
      .filter(e => e.status === 'pending' && new Date(e.dueDate) < now)
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Breakdown por categoria
    const categoryBreakdown = categoriesData.map(category => {
      const categoryRevenues = revenuesData
        .filter(r => r.categoryId === category.id)
        .reduce((sum, revenue) => sum + revenue.amount, 0);
      
      return {
        categoryId: category.id,
        categoryName: category.name,
        amount: categoryRevenues,
        percentage: totalRevenue > 0 ? (categoryRevenues / totalRevenue) * 100 : 0
      };
    }).filter(item => item.amount > 0);

    // Trend mensal (últimos 3 meses)
    const monthlyTrend = calculateMonthlyTrend(revenuesData, expensesData);

    setStats({
      totalRevenue,
      totalExpenses,
      netIncome,
      pendingRevenue,
      pendingExpenses,
      overdueRevenue,
      overdueExpenses,
      transactionCount: {
        revenue: revenuesData.length,
        expense: expensesData.length
      },
      categoryBreakdown,
      monthlyTrend
    });
  };

  // Função para calcular trend mensal
  const calculateMonthlyTrend = (revenuesData: Revenue[], expensesData: Expense[]) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const trend = [];

    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthRevenues = revenuesData
        .filter(r => {
          const createdDate = new Date(r.createdAt);
          return createdDate >= monthStart && createdDate <= monthEnd;
        })
        .reduce((sum, revenue) => sum + revenue.amount, 0);

      const monthExpenses = expensesData
        .filter(e => {
          const createdDate = new Date(e.createdAt);
          return createdDate >= monthStart && createdDate <= monthEnd;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      trend.push({
        month: months[date.getMonth()],
        revenue: monthRevenues,
        expenses: monthExpenses,
        netIncome: monthRevenues - monthExpenses
      });
    }

    return trend;
  };

  useEffect(() => {
    loadFinancialData();
  }, []);



  const renderOverview = () => (
    <div className="space-y-6 p-6">
      {/* Notificações */}
      {notifications.filter(n => !n.isRead).length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Alertas Importantes
          </h3>
          <div className="space-y-3">
            {notifications.filter(n => !n.isRead).slice(0, 3).map(notification => (
              <div key={notification.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div>
                  <p className="text-red-800 font-medium">{notification.title}</p>
                  <p className="text-red-600 text-sm">{notification.message}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  notification.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {notification.priority === 'high' ? 'Alta' : 'Média'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Componente de Gráficos Financeiros */}
      {stats && (
        <FinancialCharts
          monthlyTrend={stats.monthlyTrend}
          categoryBreakdown={stats.categoryBreakdown}
          stats={{
            totalRevenue: stats.totalRevenue,
            totalExpenses: stats.totalExpenses,
            netIncome: stats.netIncome,
            pendingRevenue: stats.pendingRevenue,
            pendingExpenses: stats.pendingExpenses,
            overdueRevenue: stats.overdueRevenue,
            overdueExpenses: stats.overdueExpenses
          }}
        />
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return renderOverview();
      case 'revenues':
        return <RevenuesManager />;
      case 'expenses':
        return <ExpensesManager />;
      case 'categories':
        return <FinancialCategoriesManager />;
      case 'bankAccounts':
        return <BankAccountsManager />;
      case 'paymentMethods':
        return <PaymentMethodsManager />;
      case 'recurrence':
        return <RecurrenceManager />;
      case 'reports':
          return (
            <FinancialReports 
              revenues={revenues}
              expenses={expenses}
              categories={categories}
              bankAccounts={bankAccounts}
              paymentMethods={paymentMethods}
            />
          );
      case 'dre':
        return <DREManager />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Sistema Financeiro</h1>
          <p className="text-gray-600">Gestão completa das finanças da empresa</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setCurrentView('revenues')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'revenues'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setCurrentView('expenses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'expenses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => setCurrentView('recurrence')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'recurrence'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recorrência
            </button>
            <button
              onClick={() => setCurrentView('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categorias
            </button>
            <button
              onClick={() => setCurrentView('bankAccounts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'bankAccounts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contas Bancárias
            </button>
            <button
              onClick={() => setCurrentView('paymentMethods')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'paymentMethods'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Formas de Pagamento
            </button>
            <button
              onClick={() => setCurrentView('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Relatórios
            </button>
            <button
              onClick={() => setCurrentView('dre')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'dre'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              DRE
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default FinancialDashboard;