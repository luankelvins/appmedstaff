import React, { useState, useEffect } from 'react';
import { 
  Expense, 
  FinancialCategory, 
  BankAccount, 
  PaymentMethod, 
  TransactionStatus,
  RecurrenceConfig,
  FinancialFilter
} from '../../../types/financial';
import { financialService } from '../../../utils/financialService';
import { PaginationParams, PaginatedResponse } from '../../../utils/paginationService';
import Pagination from '../../Common/Pagination';
import { AdvancedFilters } from '../../Common/AdvancedFilters';
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
  Save,
  Plus,
  Repeat,
  AlertCircle
} from 'lucide-react';
import FinancialRecurrenceConfig from '../Recurrence/FinancialRecurrenceConfig';

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
  recurrence: RecurrenceConfig;
  tags: string[];
  notes: string;
  tagInput: string;
}

const ExpensesManager: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<LocalExpenseFormData>({
    description: '',
    amount: 0,
    categoryId: '',
    bankAccountId: '',
    paymentMethodId: '',
    dueDate: '',
    status: 'pending',
    recurrence: { isRecurrent: false },
    tags: [],
    notes: '',
    tagInput: ''
  });
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para filtros avançados
  const [advancedFilter, setAdvancedFilter] = useState<FinancialFilter>({});

  // Carregar dados reais
  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [expensesData, categoriesData, bankAccountsData, paymentMethodsData] = await Promise.all([
        financialService.getExpenses(),
        financialService.getCategories(),
        financialService.getBankAccounts(),
        financialService.getPaymentMethods()
      ]);

      setExpenses(expensesData);
      setCategories(categoriesData.filter(cat => cat.type === 'expense'));
      setBankAccounts(bankAccountsData);
      setPaymentMethods(paymentMethodsData);
    } catch (err) {
      setError('Erro ao carregar dados financeiros');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Carregar despesas quando parâmetros de paginação mudarem
  useEffect(() => {
    loadExpenses();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, advancedFilter]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoriesData, bankAccountsData, paymentMethodsData] = await Promise.all([
        financialService.getCategories(),
        financialService.getBankAccounts(),
        financialService.getPaymentMethods()
      ]);

      setCategories(categoriesData.filter(cat => cat.type === 'expense'));
      setBankAccounts(bankAccountsData);
      setPaymentMethods(paymentMethodsData);

      // Carregar despesas paginadas
      await loadExpenses();
    } catch (err) {
      setError('Erro ao carregar dados. Tente novamente.');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      setPaginationLoading(true);
      setError(null);

      // Construir filtros combinando filtros básicos e avançados
      const filter: FinancialFilter = {
        ...advancedFilter
      };
      
      if (statusFilter !== 'all') {
        filter.status = [statusFilter as TransactionStatus];
      }
      if (searchTerm) {
        filter.searchTerm = searchTerm;
      }

      // Parâmetros de paginação
      const params: PaginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        sortBy: 'due_date',
        sortOrder: 'desc'
      };

      const result = await financialService.getExpensesPaginated(params, filter);
      
      setExpenses(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.totalItems);
    } catch (err) {
      setError('Erro ao carregar despesas. Tente novamente.');
      console.error('Erro ao carregar despesas:', err);
    } finally {
      setPaginationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const expenseData = {
        description: formData.description,
        amount: formData.amount,
        categoryId: formData.categoryId,
        bankAccountId: formData.bankAccountId,
        paymentMethodId: formData.paymentMethodId,
        dueDate: new Date(formData.dueDate),
        paidDate: formData.paidDate ? new Date(formData.paidDate) : undefined,
        status: formData.status,
        recurrence: formData.recurrence || { isRecurrent: false },
        tags: formData.tags,
        notes: formData.notes,
        createdBy: 'current-user', // TODO: Substituir por contexto de autenticação real
        updatedBy: 'current-user'
      };

      if (editingExpense) {
        await financialService.updateExpense(editingExpense.id, expenseData);
      } else {
        await financialService.createExpense(expenseData);
      }
      
      resetForm();
      
      // Recarregar dados paginados
      await loadExpenses();
    } catch (err) {
      console.error('Erro ao salvar despesa:', err);
      setError('Erro ao salvar despesa');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      categoryId: expense.categoryId || '',
      bankAccountId: expense.bankAccountId || '',
      paymentMethodId: expense.paymentMethodId || '',
      dueDate: expense.dueDate.toISOString().split('T')[0],
      paidDate: expense.paidDate?.toISOString().split('T')[0],
      status: expense.status,
      recurrence: expense.recurrence,
      tags: expense.tags || [],
      notes: expense.notes || '',
      tagInput: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await financialService.deleteExpense(id);
        
        // Recarregar dados paginados
        await loadExpenses();
      } catch (err) {
        console.error('Erro ao excluir despesa:', err);
        setError('Erro ao excluir despesa');
      }
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
      status: 'pending',
      recurrence: { isRecurrent: false },
      tags: [],
      notes: '',
      tagInput: ''
    });
    setEditingExpense(null);
    setIsModalOpen(false);
  };



  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'N/A';
  };

  const getBankAccountName = (accountId: string) => {
    return bankAccounts.find(acc => acc.id === accountId)?.name || 'N/A';
  };

  const getPaymentMethodName = (methodId: string) => {
    return paymentMethods.find(method => method.id === methodId)?.name || 'N/A';
  };

  // Funções para gerenciar tags
  const handleTagsChange = (value: string) => {
    setFormData({ ...formData, tagInput: value });
  };

  const addTag = () => {
    const newTag = formData.tagInput.trim();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag],
        tagInput: ''
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Função para gerenciar recorrência
  const handleRecurrenceChange = (recurrenceConfig: RecurrenceConfig) => {
    setFormData({ ...formData, recurrence: recurrenceConfig });
  };

  const handleRecurrenceToggle = (isEnabled: boolean) => {
    setFormData({
      ...formData,
      recurrence: {
        ...formData.recurrence,
        isRecurrent: isEnabled
      }
    });
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

  // Handlers de paginação
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1); // Reset para primeira página
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset para primeira página
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as TransactionStatus | 'all');
    setCurrentPage(1); // Reset para primeira página
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
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar despesas..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Pago</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
        
        {/* Filtros Avançados */}
        <AdvancedFilters
          filter={advancedFilter}
          onFilterChange={setAdvancedFilter}
          categories={categories}
          type="expense"
        />
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
            {expenses.map((expense) => (
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

      {/* Paginação */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPage={true}
          showInfo={true}
        />
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

                {/* Recorrência */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Repeat className="h-5 w-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-800">Recorrência</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="recurrent"
                        checked={formData.recurrence.isRecurrent}
                        onChange={(e) => handleRecurrenceToggle(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="recurrent" className="text-sm font-medium text-gray-700">
                        Esta despesa é recorrente
                      </label>
                    </div>

                    {formData.recurrence.isRecurrent && (
                      <FinancialRecurrenceConfig
                        recurrenceConfig={formData.recurrence}
                        onChange={handleRecurrenceChange}
                        isEnabled={formData.recurrence.isRecurrent}
                        onToggle={handleRecurrenceToggle}
                      />
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="h-5 w-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-800">Tags</h4>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Tags existentes */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Input para nova tag */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.tagInput}
                        onChange={(e) => handleTagsChange(e.target.value)}
                        onKeyPress={handleTagKeyPress}
                        placeholder="Digite uma tag e pressione Enter"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Adicionar</span>
                      </button>
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
                      <div>
                        <span className="font-medium text-gray-600">Recorrência:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                          formData.recurrence.isRecurrent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          <Repeat className="h-3 w-3 mr-1" />
                          {formData.recurrence.isRecurrent ? 
                            `${formData.recurrence.period === 'daily' ? 'Diário' :
                              formData.recurrence.period === 'weekly' ? 'Semanal' :
                              formData.recurrence.period === 'biweekly' ? 'Quinzenal' :
                              formData.recurrence.period === 'monthly' ? 'Mensal' :
                              formData.recurrence.period === 'quarterly' ? 'Trimestral' :
                              formData.recurrence.period === 'semiannual' ? 'Semestral' :
                              formData.recurrence.period === 'annual' ? 'Anual' : 'Personalizado'
                            }${(formData.recurrence.interval && formData.recurrence.interval > 1) ? ` (${formData.recurrence.interval}x)` : ''}` : 
                            'Não recorrente'
                          }
                        </span>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-600">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {formData.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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