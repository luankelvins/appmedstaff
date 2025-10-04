import React, { useState, useEffect } from 'react';
import { 
  Expense, 
  FinancialCategory, 
  BankAccount, 
  PaymentMethod, 
  TransactionStatus,
  RecurrenceConfig 
} from '../../../types/financial';
import { 
  DollarSign, 
  Calendar, 
  CreditCard, 
  Building2, 
  Tag, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  X,
  Save
} from 'lucide-react';

// Interface local para dados do formulário
interface LocalExpenseFormData {
  description: string;
  amount: number;
  categoryId: string;
  bankAccountId: string;
  paymentMethodId: string;
  dueDate: string;
  paidDate?: string;
  status: TransactionStatus;
  recurrence?: RecurrenceConfig;
  notes?: string;
}

const ExpensesManager: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<LocalExpenseFormData>({
    description: '',
    amount: 0,
    categoryId: '',
    bankAccountId: '',
    paymentMethodId: '',
    dueDate: '',
    status: 'pending'
  });
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');

  // Mock data
  useEffect(() => {
    setCategories([
      { id: '1', name: 'Escritório', type: 'expense', description: 'Despesas de escritório', color: '#3B82F6', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'admin', updatedBy: 'admin' },
      { id: '2', name: 'Marketing', type: 'expense', description: 'Despesas de marketing', color: '#10B981', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'admin', updatedBy: 'admin' },
      { id: '3', name: 'Tecnologia', type: 'expense', description: 'Despesas de TI', color: '#8B5CF6', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'admin', updatedBy: 'admin' }
    ]);

    setBankAccounts([
      { id: '1', name: 'Conta Corrente Principal', accountNumber: '12345-6', agency: '0001', bank: 'Banco do Brasil', accountType: 'checking', balance: 50000, isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'admin', updatedBy: 'admin' },
      { id: '2', name: 'Conta Poupança', accountNumber: '78910-1', agency: '0002', bank: 'Itaú', accountType: 'savings', balance: 25000, isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'admin', updatedBy: 'admin' }
    ]);

    setPaymentMethods([
      { id: '1', name: 'Transferência Bancária', type: 'bank_transfer', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'admin', updatedBy: 'admin' },
      { id: '2', name: 'Cartão de Crédito', type: 'credit_card', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'admin', updatedBy: 'admin' },
      { id: '3', name: 'PIX', type: 'pix', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'admin', updatedBy: 'admin' }
    ]);

    setExpenses([
      {
        id: '1',
        description: 'Material de escritório',
        amount: 500,
        categoryId: '1',
        bankAccountId: '1',
        paymentMethodId: '1',
        dueDate: new Date('2024-01-15'),
        paidDate: new Date('2024-01-14'),
        status: 'confirmed' as TransactionStatus,
        recurrence: { isRecurrent: false },
        notes: 'Compra de papelaria e suprimentos',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: 'admin'
      },
      {
        id: '2',
        description: 'Campanha Google Ads',
        amount: 2000,
        categoryId: '2',
        bankAccountId: '1',
        paymentMethodId: '2',
        dueDate: new Date('2024-01-20'),
        status: 'pending' as TransactionStatus,
        recurrence: { isRecurrent: false },
        notes: 'Campanha de marketing digital',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: 'admin'
      }
    ]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExpense) {
      setExpenses(expenses.map(expense => 
        expense.id === editingExpense.id 
          ? {
              ...expense,
              description: formData.description,
              amount: formData.amount,
              categoryId: formData.categoryId,
              bankAccountId: formData.bankAccountId,
              paymentMethodId: formData.paymentMethodId,
              dueDate: new Date(formData.dueDate),
              paidDate: formData.paidDate ? new Date(formData.paidDate) : undefined,
              status: formData.status,
              recurrence: formData.recurrence || { isRecurrent: false },
              notes: formData.notes,
              updatedAt: new Date(),
              updatedBy: 'admin'
            }
          : expense
      ));
    } else {
      const newExpense: Expense = {
        id: Date.now().toString(),
        description: formData.description,
        amount: formData.amount,
        categoryId: formData.categoryId,
        bankAccountId: formData.bankAccountId,
        paymentMethodId: formData.paymentMethodId,
        dueDate: new Date(formData.dueDate),
        paidDate: formData.paidDate ? new Date(formData.paidDate) : undefined,
        status: formData.status,
        recurrence: formData.recurrence || { isRecurrent: false },
        notes: formData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: 'admin'
      };
      setExpenses([...expenses, newExpense]);
    }
    
    resetForm();
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      categoryId: expense.categoryId,
      bankAccountId: expense.bankAccountId,
      paymentMethodId: expense.paymentMethodId,
      dueDate: expense.dueDate.toISOString().split('T')[0],
      paidDate: expense.paidDate?.toISOString().split('T')[0],
      status: expense.status,
      recurrence: expense.recurrence,
      notes: expense.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      categoryId: '',
      bankAccountId: '',
      paymentMethodId: '',
      dueDate: '',
      status: 'pending'
    });
    setEditingExpense(null);
    setIsModalOpen(false);
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'N/A';
  };

  const getBankAccountName = (accountId: string) => {
    return bankAccounts.find(acc => acc.id === accountId)?.name || 'N/A';
  };

  const getPaymentMethodName = (methodId: string) => {
    return paymentMethods.find(method => method.id === methodId)?.name || 'N/A';
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: TransactionStatus) => {
    switch (status) {
      case 'confirmed': return 'Pago';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Despesas</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Nova Despesa
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Buscar despesas..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="confirmed">Pago</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {/* Lista de Despesas */}
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
                Vencimento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                  <div className="text-sm text-gray-500">{expense.notes}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getCategoryName(expense.categoryId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.dueDate.toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                    {getStatusText(expense.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-0 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {editingExpense ? 'Atualize as informações da despesa' : 'Preencha os dados da nova despesa'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informações Básicas */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-800">Informações Básicas</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Ex: Aluguel do escritório"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        Valor *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="0,00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Data de Vencimento *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Status e Configurações */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-800">Status e Configurações</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status *
                      </label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as TransactionStatus })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="pending">Pendente</option>
                        <option value="confirmed">Pago</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>

                    {formData.status === 'confirmed' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="inline h-4 w-4 mr-1" />
                          Data de Pagamento
                        </label>
                        <input
                          type="date"
                          value={formData.paidDate || ''}
                          onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Categorização e Contas */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="h-5 w-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-800">Categorização e Contas</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria *
                      </label>
                      <select
                        required
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building2 className="inline h-4 w-4 mr-1" />
                        Conta Bancária *
                      </label>
                      <select
                        required
                        value={formData.bankAccountId}
                        onChange={(e) => setFormData({ ...formData, bankAccountId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Selecione uma conta</option>
                        {bankAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CreditCard className="inline h-4 w-4 mr-1" />
                        Forma de Pagamento *
                      </label>
                      <select
                        required
                        value={formData.paymentMethodId}
                        onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Selecione uma forma de pagamento</option>
                        {paymentMethods.map((method) => (
                          <option key={method.id} value={method.id}>
                            {method.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-800">Observações</h4>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas Adicionais
                    </label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Informações adicionais sobre a despesa..."
                    />
                  </div>
                </div>

                {/* Preview */}
                {(formData.description || formData.amount) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-blue-800">Prévia da Despesa</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Descrição:</span>
                        <p className="text-gray-800">{formData.description || 'Não informado'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Valor:</span>
                        <p className="text-gray-800 font-semibold">
                          {formData.amount ? `R$ ${formData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                          formData.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          formData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {formData.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {formData.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {formData.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                          {formData.status === 'confirmed' ? 'Pago' : 
                           formData.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Categoria:</span>
                        <p className="text-gray-800">
                          {formData.categoryId ? categories.find(c => c.id === formData.categoryId)?.name : 'Não selecionada'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingExpense ? 'Atualizar' : 'Salvar'} Despesa</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesManager;