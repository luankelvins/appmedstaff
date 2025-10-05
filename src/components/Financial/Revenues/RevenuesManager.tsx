import React, { useState, useEffect } from 'react';
import { 
  Revenue, 
  FinancialCategory, 
  BankAccount, 
  PaymentMethod, 
  TransactionStatus,
  RecurrenceConfig,
  FinancialFilter
} from '../../../types/financial';
import { financialService } from '../../../services/financialService';
import { PaginationParams, PaginatedResponse } from '../../../services/paginationService';
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
  AlertCircle, 
  XCircle,
  Repeat,
  Eye
} from 'lucide-react';

// Interfaces locais para o formulário
interface LocalRevenueFormData {
  description: string;
  amount: number;
  dueDate: string;
  receivedDate: string;
  status: TransactionStatus;
  categoryId: string;
  bankAccountId: string;
  paymentMethodId: string;
  isRecurring: boolean;
  tags: string[];
  notes: string;
}

const RevenuesManager: React.FC = () => {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [paginationLoading, setPaginationLoading] = useState(false);

  // Estado para filtros avançados
  const [advancedFilter, setAdvancedFilter] = useState<FinancialFilter>({});

  const [formData, setFormData] = useState<LocalRevenueFormData>({
    description: '',
    amount: 0,
    dueDate: '',
    receivedDate: '',
    status: 'pending',
    categoryId: '',
    bankAccountId: '',
    paymentMethodId: '',
    isRecurring: false,
    tags: [],
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  // Carregar receitas quando parâmetros de paginação mudarem
  useEffect(() => {
    loadRevenues();
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
      
      setCategories(categoriesData.filter(cat => cat.type === 'income'));
      setBankAccounts(bankAccountsData);
      setPaymentMethods(paymentMethodsData);

      // Carregar receitas paginadas
      await loadRevenues();
    } catch (err) {
      setError('Erro ao carregar dados. Tente novamente.');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRevenues = async () => {
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
        sortBy: 'received_date',
        sortOrder: 'desc'
      };

      const result = await financialService.getRevenuesPaginated(params, filter);
      
      setRevenues(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.totalItems);
    } catch (err) {
      setError('Erro ao carregar receitas. Tente novamente.');
      console.error('Erro ao carregar receitas:', err);
    } finally {
      setPaginationLoading(false);
    }
  };

  // Helper functions for better UX
  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Data de vencimento é obrigatória';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória';
    }

    if (!formData.bankAccountId) {
      newErrors.bankAccountId = 'Conta bancária é obrigatória';
    }

    if (!formData.paymentMethodId) {
      newErrors.paymentMethodId = 'Forma de pagamento é obrigatória';
    }

    if (formData.status === 'confirmed' && !formData.receivedDate) {
      newErrors.receivedDate = 'Data de recebimento é obrigatória quando status é "Confirmado"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      dueDate: '',
      receivedDate: '',
      status: 'pending',
      categoryId: '',
      bankAccountId: '',
      paymentMethodId: '',
      isRecurring: false,
      tags: [],
      notes: ''
    });
    setErrors({});
    setEditingRevenue(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const revenueData = {
        description: formData.description,
        amount: formData.amount,
        dueDate: new Date(formData.dueDate),
        receivedDate: formData.receivedDate ? new Date(formData.receivedDate) : undefined,
        status: formData.status,
        categoryId: formData.categoryId,
        bankAccountId: formData.bankAccountId,
        paymentMethodId: formData.paymentMethodId,
        recurrence: {
          isRecurrent: formData.isRecurring
        },
        tags: formData.tags,
        notes: formData.notes,
        createdBy: 'current-user', // TODO: Pegar do contexto de autenticação
        updatedBy: 'current-user'  // TODO: Pegar do contexto de autenticação
      };
      
      if (editingRevenue) {
        // Atualizar receita existente
        await financialService.updateRevenue(editingRevenue.id, revenueData);
      } else {
        // Criar nova receita
        await financialService.createRevenue(revenueData);
      }

      setIsModalOpen(false);
      resetForm();
      
      // Recarregar dados paginados
      await loadRevenues();
    } catch (err) {
      setError('Erro ao salvar receita. Tente novamente.');
      console.error('Erro ao salvar receita:', err);
    }
  };

  const handleEdit = (revenue: Revenue) => {
    setEditingRevenue(revenue);
    setFormData({
      description: revenue.description,
      amount: revenue.amount,
      dueDate: revenue.dueDate.toISOString().split('T')[0],
      receivedDate: revenue.receivedDate ? revenue.receivedDate.toISOString().split('T')[0] : '',
      status: revenue.status,
      categoryId: revenue.categoryId,
      bankAccountId: revenue.bankAccountId || '',
      paymentMethodId: revenue.paymentMethodId,
      isRecurring: revenue.recurrence.isRecurrent,
      tags: revenue.tags || [],
      notes: revenue.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await financialService.deleteRevenue(id);
        // Recarregar dados paginados
        await loadRevenues();
      } catch (err) {
        setError('Erro ao excluir receita. Tente novamente.');
        console.error('Erro ao excluir receita:', err);
      }
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  // Handlers de paginação
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Resetar para primeira página
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Resetar para primeira página
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Resetar para primeira página
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'N/A';
  };

  const getBankAccountName = (bankAccountId: string) => {
    return bankAccounts.find(acc => acc.id === bankAccountId)?.name || 'N/A';
  };

  const getPaymentMethodName = (paymentMethodId: string) => {
    return paymentMethods.find(pm => pm.id === paymentMethodId)?.name || 'N/A';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Vencido';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const totalRevenues = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
  const confirmedRevenues = revenues.filter(r => r.status === 'confirmed').reduce((sum, revenue) => sum + revenue.amount, 0);
  const pendingRevenues = revenues.filter(r => r.status === 'pending').reduce((sum, revenue) => sum + revenue.amount, 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando receitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Receitas</h2>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nova Receita
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total de Receitas</h3>
          <p className="text-2xl font-bold text-gray-900">
            R$ {totalRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Confirmado</h3>
          <p className="text-2xl font-bold text-green-600">
            R$ {confirmedRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Pendente</h3>
          <p className="text-2xl font-bold text-yellow-600">
            R$ {pendingRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
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
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por descrição..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
        
        {/* Filtros Avançados */}
        <AdvancedFilters
          filter={advancedFilter}
          onFilterChange={setAdvancedFilter}
          categories={categories}
          type="income"
        />
      </div>

      {/* Paginação */}
       <div className="mb-6">
         <Pagination
           currentPage={currentPage}
           totalPages={totalPages}
           totalItems={totalItems}
           itemsPerPage={itemsPerPage}
           onPageChange={handlePageChange}
           onItemsPerPageChange={handleItemsPerPageChange}
         />
       </div>

      {/* Lista de Receitas */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
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
                  Vencimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recorrente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenues.map((revenue) => (
                <tr key={revenue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {revenue.description}
                      </div>
                      {revenue.notes && (
                        <div className="text-sm text-gray-500">
                          {revenue.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    R$ {revenue.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {revenue.dueDate.toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(revenue.status)}`}>
                      {getStatusText(revenue.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCategoryName(revenue.categoryId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {revenue.recurrence.isRecurrent ? (
                      <span className="text-blue-600">Sim</span>
                    ) : (
                      <span className="text-gray-500">Não</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(revenue)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(revenue.id)}
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
      </div>

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {editingRevenue ? 'Editar Receita' : 'Nova Receita'}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {editingRevenue ? 'Atualize as informações da receita' : 'Preencha os dados para criar uma nova receita'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informações Básicas */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Informações Básicas</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                          placeholder="Ex: Venda de produtos médicos"
                        />
                        {errors.description && (
                          <div className="flex items-center mt-2 text-red-600">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">{errors.description}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            errors.amount ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                          placeholder="0,00"
                        />
                        {errors.amount && (
                          <div className="flex items-center mt-2 text-red-600">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">{errors.amount}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Vencimento *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            errors.dueDate ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        />
                        {errors.dueDate && (
                          <div className="flex items-center mt-2 text-red-600">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">{errors.dueDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status e Configurações */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Status e Configurações</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status *
                      </label>
                      <div className="relative">
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TransactionStatus }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors appearance-none bg-white"
                        >
                          <option value="pending">Pendente</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="overdue">Vencido</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          {getStatusIcon(formData.status)}
                        </div>
                      </div>
                    </div>

                    {formData.status === 'confirmed' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Recebimento *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            value={formData.receivedDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, receivedDate: e.target.value }))}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                              errors.receivedDate ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                          />
                          {errors.receivedDate && (
                            <div className="flex items-center mt-2 text-red-600">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm">{errors.receivedDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isRecurring}
                          onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <Repeat className="w-5 h-5 text-gray-600" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Receita recorrente</span>
                          <p className="text-xs text-gray-500">Esta receita se repetirá automaticamente</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Categorização e Contas */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Categorização e Contas</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria *
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none bg-white ${
                            errors.categoryId ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <option value="">Selecione uma categoria</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {errors.categoryId && (
                          <div className="flex items-center mt-2 text-red-600">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">{errors.categoryId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conta Bancária *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          value={formData.bankAccountId}
                          onChange={(e) => setFormData(prev => ({ ...prev, bankAccountId: e.target.value }))}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none bg-white ${
                            errors.bankAccountId ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <option value="">Selecione uma conta</option>
                          {bankAccounts.map(account => (
                            <option key={account.id} value={account.id}>
                              {account.name}
                            </option>
                          ))}
                        </select>
                        {errors.bankAccountId && (
                          <div className="flex items-center mt-2 text-red-600">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">{errors.bankAccountId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Forma de Pagamento *
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          value={formData.paymentMethodId}
                          onChange={(e) => setFormData(prev => ({ ...prev, paymentMethodId: e.target.value }))}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none bg-white ${
                            errors.paymentMethodId ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <option value="">Selecione uma forma</option>
                          {paymentMethods.map(method => (
                            <option key={method.id} value={method.id}>
                              {method.name}
                            </option>
                          ))}
                        </select>
                        {errors.paymentMethodId && (
                          <div className="flex items-center mt-2 text-red-600">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">{errors.paymentMethodId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (separadas por vírgula)
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.tags.join(', ')}
                          onChange={(e) => handleTagsChange(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
                          placeholder="vendas, produtos, hospital"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Observações</h4>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações adicionais
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors resize-none"
                      placeholder="Informações adicionais sobre esta receita..."
                    />
                  </div>
                </div>

                {/* Preview */}
                {(formData.description || formData.amount > 0) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-blue-900">Prévia da Receita</h4>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-900">{formData.description || 'Nova Receita'}</h5>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(formData.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(formData.status)}`}>
                            {getStatusText(formData.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Valor:</span>
                          <span className="ml-2 font-semibold text-green-600">{formatCurrency(formData.amount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Vencimento:</span>
                          <span className="ml-2">{formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('pt-BR') : '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Categoria:</span>
                          <span className="ml-2">{getCategoryName(formData.categoryId) || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Recorrente:</span>
                          <span className="ml-2">{formData.isRecurring ? 'Sim' : 'Não'}</span>
                        </div>
                      </div>
                      
                      {formData.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {formData.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{editingRevenue ? 'Atualizar Receita' : 'Criar Receita'}</span>
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

export default RevenuesManager;