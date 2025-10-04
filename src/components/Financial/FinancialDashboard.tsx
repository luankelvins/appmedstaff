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

  // Mock data para relatórios
  const mockCategories: FinancialCategory[] = [
    {
      id: '1',
      name: 'Serviços',
      type: 'income',
      color: '#10B981',
      description: 'Receitas de serviços prestados',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '2',
      name: 'Produtos',
      type: 'income',
      color: '#3B82F6',
      description: 'Receitas de vendas de produtos',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ];

  const mockBankAccounts: BankAccount[] = [
    {
      id: '1',
      name: 'Conta Corrente Principal',
      bank: 'Banco do Brasil',
      accountNumber: '12345-6',
      agency: '1234',
      accountType: 'checking',
      balance: 50000,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ];

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: '1',
      name: 'PIX',
      type: 'pix',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ];

  const mockRevenues: Revenue[] = [
    {
      id: '1',
      description: 'Serviço de consultoria',
      amount: 5000,
      dueDate: new Date('2024-01-30'),
      categoryId: '1',
      paymentMethodId: '1',
      bankAccountId: '1',
      status: 'pending',
      recurrence: { isRecurrent: false },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ];

  const mockExpenses: Expense[] = [
    {
      id: '1',
      description: 'Aluguel do escritório',
      amount: 3000,
      dueDate: new Date('2024-01-31'),
      categoryId: '1',
      paymentMethodId: '1',
      bankAccountId: '1',
      status: 'pending',
      recurrence: { isRecurrent: true, period: 'monthly', interval: 1 },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ];

  // Mock data para estatísticas
  useEffect(() => {
    setStats({
      totalRevenue: 45000,
      totalExpenses: 32000,
      netIncome: 13000,
      pendingRevenue: 8500,
      pendingExpenses: 5200,
      overdueRevenue: 1200,
      overdueExpenses: 800,
      transactionCount: {
        revenue: 28,
        expense: 45
      },
      categoryBreakdown: [
        { categoryId: '1', categoryName: 'Serviços', amount: 25000, percentage: 55.6 },
        { categoryId: '2', categoryName: 'Produtos', amount: 15000, percentage: 33.3 },
        { categoryId: '3', categoryName: 'Consultoria', amount: 5000, percentage: 11.1 }
      ],
      monthlyTrend: [
        { month: 'Jan', revenue: 42000, expenses: 28000, netIncome: 14000 },
        { month: 'Fev', revenue: 38000, expenses: 30000, netIncome: 8000 },
        { month: 'Mar', revenue: 45000, expenses: 32000, netIncome: 13000 }
      ]
    });

    setNotifications([
      {
        id: '1',
        type: 'due_date',
        title: 'Vencimentos Próximos',
        message: '5 transações vencem nos próximos 3 dias',
        entityType: 'expense',
        entityId: '1',
        isRead: false,
        priority: 'high',
        actionRequired: true,
        dueDate: new Date('2024-01-25'),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        id: '2',
        type: 'overdue',
        title: 'Transações Vencidas',
        message: '2 despesas estão em atraso',
        entityType: 'expense',
        entityId: '2',
        isRead: false,
        priority: 'high',
        actionRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system'
      }
    ]);
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
      case 'bank-accounts':
        return <BankAccountsManager />;
      case 'payment-methods':
        return <PaymentMethodsManager />;
      case 'recurrence':
        return <RecurrenceManager />;
      case 'reports':
          return (
            <FinancialReports 
              revenues={mockRevenues}
              expenses={mockExpenses}
              categories={mockCategories}
              bankAccounts={mockBankAccounts}
              paymentMethods={mockPaymentMethods}
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