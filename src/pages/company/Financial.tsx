import React, { useState } from 'react'
import { DollarSign, Plus, TrendingUp, TrendingDown, BarChart3, Calendar, Filter, Download } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
  createdBy: string
}

interface Launch {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  account: string
}

interface DREData {
  period: string
  revenue: number
  expenses: number
  grossProfit: number
  netProfit: number
  margin: number
}

const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Material de escritório',
    amount: 450.00,
    category: 'Administrativo',
    date: '2024-01-20',
    status: 'approved',
    createdBy: 'Ana Oliveira'
  },
  {
    id: '2',
    description: 'Software de gestão',
    amount: 1200.00,
    category: 'Tecnologia',
    date: '2024-01-18',
    status: 'pending',
    createdBy: 'João Silva'
  },
  {
    id: '3',
    description: 'Almoço de negócios',
    amount: 180.00,
    category: 'Comercial',
    date: '2024-01-15',
    status: 'approved',
    createdBy: 'Maria Santos'
  }
]

const mockLaunches: Launch[] = [
  {
    id: '1',
    description: 'Prestação de serviços - Cliente A',
    amount: 15000.00,
    type: 'income',
    category: 'Receita de Serviços',
    date: '2024-01-20',
    account: 'Conta Corrente Principal'
  },
  {
    id: '2',
    description: 'Pagamento de fornecedor',
    amount: 3500.00,
    type: 'expense',
    category: 'Fornecedores',
    date: '2024-01-19',
    account: 'Conta Corrente Principal'
  },
  {
    id: '3',
    description: 'Consultoria médica - Cliente B',
    amount: 8000.00,
    type: 'income',
    category: 'Receita de Consultoria',
    date: '2024-01-18',
    account: 'Conta Corrente Principal'
  }
]

const mockDRE: DREData = {
  period: 'Janeiro 2024',
  revenue: 125000.00,
  expenses: 78000.00,
  grossProfit: 47000.00,
  netProfit: 35000.00,
  margin: 28.0
}

const statusLabels = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

export const Financial: React.FC = () => {
  const permissions = usePermissions()
  const [activeTab, setActiveTab] = useState<'expenses' | 'launches' | 'dre'>('expenses')
  const [expenses] = useState<Expense[]>(mockExpenses)
  const [launches] = useState<Launch[]>(mockLaunches)
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01')

  const handleCreateExpense = () => {
    // Implementar criação de despesa
    console.log('Criar nova despesa')
  }

  const handleCreateLaunch = () => {
    // Implementar criação de lançamento
    console.log('Criar novo lançamento')
  }

  const handleApproveExpense = (id: string) => {
    // Implementar aprovação de despesa
    console.log('Aprovar despesa:', id)
  }

  const handleRejectExpense = (id: string) => {
    // Implementar rejeição de despesa
    console.log('Rejeitar despesa:', id)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (!permissions.hasPermission('finance.expenses.create') && 
      !permissions.hasPermission('finance.launches.create') && 
      !permissions.hasPermission('finance.dre.view')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acesso negado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Você não tem permissão para acessar esta seção.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-600">Gestão de despesas, lançamentos e DRE</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(permissions.hasPermission('finance.expenses.create') || permissions.hasPermission('finance.expenses.update')) && (
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign className="inline-block w-4 h-4 mr-2" />
              Despesas
            </button>
          )}
          {(permissions.hasPermission('finance.launches.create') || permissions.hasPermission('finance.launches.update')) && (
            <button
              onClick={() => setActiveTab('launches')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'launches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="inline-block w-4 h-4 mr-2" />
              Lançamentos
            </button>
          )}
          {permissions.hasPermission('finance.dre.view') && (
            <button
              onClick={() => setActiveTab('dre')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dre'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="inline-block w-4 h-4 mr-2" />
              DRE
            </button>
          )}
        </nav>
      </div>

      {/* Despesas */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">Todas as categorias</option>
                <option value="administrativo">Administrativo</option>
                <option value="tecnologia">Tecnologia</option>
                <option value="comercial">Comercial</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
              </select>
            </div>
            {permissions.hasPermission('finance.expenses.create') && (
              <button
                onClick={handleCreateExpense}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Nova Despesa</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado por
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expense.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[expense.status]}`}>
                        {statusLabels[expense.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.createdBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {expense.status === 'pending' && permissions.hasPermission('finance.expenses.update') && (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleApproveExpense(expense.id)}
                            className="text-green-600 hover:text-green-900 text-xs bg-green-100 px-2 py-1 rounded"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleRejectExpense(expense.id)}
                            className="text-red-600 hover:text-red-900 text-xs bg-red-100 px-2 py-1 rounded"
                          >
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lançamentos */}
      {activeTab === 'launches' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">Todos os tipos</option>
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>
            {permissions.hasPermission('finance.launches.create') && (
              <button
                onClick={handleCreateLaunch}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Novo Lançamento</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conta
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {launches.map((launch) => (
                  <tr key={launch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {launch.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        launch.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {launch.type === 'income' ? (
                          <>
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Receita
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3 mr-1" />
                            Despesa
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={launch.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(launch.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {launch.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(launch.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {launch.account}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRE */}
      {activeTab === 'dre' && permissions.hasPermission('finance.dre.view') && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
              <Download size={20} />
              <span>Exportar DRE</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Demonstrativo de Resultado do Exercício - {mockDRE.period}
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-900">Receita Bruta</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(mockDRE.revenue)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-900">(-) Despesas Operacionais</span>
                <span className="text-sm font-semibold text-red-600">
                  {formatCurrency(mockDRE.expenses)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-900">Lucro Bruto</span>
                <span className="text-sm font-semibold text-blue-600">
                  {formatCurrency(mockDRE.grossProfit)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b-2 border-gray-300">
                <span className="text-base font-semibold text-gray-900">Lucro Líquido</span>
                <span className="text-base font-bold text-green-600">
                  {formatCurrency(mockDRE.netProfit)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-sm font-medium text-gray-900">Margem Líquida</span>
                <span className="text-sm font-semibold text-blue-600">
                  {mockDRE.margin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}