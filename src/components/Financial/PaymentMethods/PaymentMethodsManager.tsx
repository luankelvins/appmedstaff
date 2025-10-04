import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, CreditCard, Banknote, Smartphone, FileText, Building2, MoreHorizontal } from 'lucide-react';
import { PaymentMethod, PaymentMethodFormData, BankAccount, ValidationResult } from '../../../types/financial';

interface PaymentMethodsManagerProps {
  onMethodSelect?: (method: PaymentMethod) => void;
  bankAccounts?: BankAccount[];
}

const PaymentMethodsManager: React.FC<PaymentMethodsManagerProps> = ({ 
  onMethodSelect,
  bankAccounts = []
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [filteredMethods, setFilteredMethods] = useState<PaymentMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check' | 'other'>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data para demonstração
  const mockMethods: PaymentMethod[] = [
    {
      id: '1',
      name: 'Dinheiro',
      type: 'cash',
      description: 'Pagamentos em espécie',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '2',
      name: 'Cartão de Crédito Visa',
      type: 'credit_card',
      description: 'Cartão de crédito empresarial',
      isActive: true,
      bankAccountId: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '3',
      name: 'PIX',
      type: 'pix',
      description: 'Transferência instantânea via PIX',
      isActive: true,
      bankAccountId: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '4',
      name: 'Transferência Bancária',
      type: 'bank_transfer',
      description: 'TED/DOC entre bancos',
      isActive: true,
      bankAccountId: '2',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '5',
      name: 'Cartão de Débito',
      type: 'debit_card',
      description: 'Débito automático',
      isActive: true,
      bankAccountId: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '6',
      name: 'Cheque',
      type: 'check',
      description: 'Pagamento via cheque',
      isActive: false,
      bankAccountId: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ];

  useEffect(() => {
    loadMethods();
  }, []);

  useEffect(() => {
    filterMethods();
  }, [methods, searchTerm, filterType, showInactive]);

  const loadMethods = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMethods(mockMethods);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMethods = () => {
    let filtered = methods.filter(method => {
      const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (method.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesType = filterType === 'all' || method.type === filterType;
      const matchesActive = showInactive || method.isActive;
      
      return matchesSearch && matchesType && matchesActive;
    });

    setFilteredMethods(filtered);
  };

  const handleCreateMethod = () => {
    setEditingMethod(null);
    setIsModalOpen(true);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsModalOpen(true);
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
      try {
        setMethods(prev => prev.filter(method => method.id !== methodId));
      } catch (error) {
        console.error('Erro ao excluir forma de pagamento:', error);
      }
    }
  };

  const handleSaveMethod = async (formData: PaymentMethodFormData) => {
    try {
      if (editingMethod) {
        const updatedMethod: PaymentMethod = {
          ...editingMethod,
          ...formData,
          updatedAt: new Date(),
          updatedBy: 'current-user'
        };
        setMethods(prev => prev.map(method => 
          method.id === editingMethod.id ? updatedMethod : method
        ));
      } else {
        const newMethod: PaymentMethod = {
          id: Date.now().toString(),
          ...formData,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'current-user',
          updatedBy: 'current-user'
        };
        setMethods(prev => [...prev, newMethod]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar forma de pagamento:', error);
    }
  };

  const getMethodTypeLabel = (type: string) => {
    const types = {
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      bank_transfer: 'Transferência Bancária',
      pix: 'PIX',
      check: 'Cheque',
      other: 'Outro'
    };
    return types[type as keyof typeof types] || type;
  };

  const getMethodTypeIcon = (type: string) => {
    const icons = {
      cash: <Banknote className="h-4 w-4" />,
      credit_card: <CreditCard className="h-4 w-4" />,
      debit_card: <CreditCard className="h-4 w-4" />,
      bank_transfer: <Building2 className="h-4 w-4" />,
      pix: <Smartphone className="h-4 w-4" />,
      check: <FileText className="h-4 w-4" />,
      other: <MoreHorizontal className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <MoreHorizontal className="h-4 w-4" />;
  };

  const getMethodTypeColor = (type: string) => {
    const colors = {
      cash: 'bg-green-100 text-green-800',
      credit_card: 'bg-blue-100 text-blue-800',
      debit_card: 'bg-purple-100 text-purple-800',
      bank_transfer: 'bg-orange-100 text-orange-800',
      pix: 'bg-teal-100 text-teal-800',
      check: 'bg-gray-100 text-gray-800',
      other: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getMethodStats = () => {
    const stats = {
      total: methods.filter(m => m.isActive).length,
      byType: {} as Record<string, number>
    };

    methods.filter(m => m.isActive).forEach(method => {
      stats.byType[method.type] = (stats.byType[method.type] || 0) + 1;
    });

    return stats;
  };

  const stats = getMethodStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formas de Pagamento</h2>
          <p className="text-gray-600">Gerencie os métodos de pagamento disponíveis</p>
        </div>
        <button
          onClick={handleCreateMethod}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Forma de Pagamento
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Ativo</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Banknote className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Dinheiro</p>
              <p className="text-xl font-semibold">{stats.byType.cash || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">PIX</p>
              <p className="text-xl font-semibold">{stats.byType.pix || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cartões</p>
              <p className="text-xl font-semibold">
                {(stats.byType.credit_card || 0) + (stats.byType.debit_card || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar formas de pagamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os tipos</option>
            <option value="cash">Dinheiro</option>
            <option value="credit_card">Cartão de Crédito</option>
            <option value="debit_card">Cartão de Débito</option>
            <option value="bank_transfer">Transferência Bancária</option>
            <option value="pix">PIX</option>
            <option value="check">Cheque</option>
            <option value="other">Outro</option>
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mostrar inativas</span>
          </label>
        </div>
      </div>

      {/* Lista de Formas de Pagamento */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredMethods.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma forma de pagamento encontrada</p>
            <p className="text-sm">Adicione sua primeira forma de pagamento</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMethods.map((method) => (
              <div key={method.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                      {getMethodTypeIcon(method.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getMethodTypeColor(method.type)}`}>
                          {getMethodTypeLabel(method.type)}
                        </span>
                        {!method.isActive && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            Inativa
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {method.description && (
                          <p className="mb-1">{method.description}</p>
                        )}
                        {method.bankAccountId && (
                          <p className="text-xs text-blue-600">
                            Vinculada à conta bancária
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onMethodSelect && (
                      <button
                        onClick={() => onMethodSelect(method)}
                        className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Selecionar
                      </button>
                    )}
                    <button
                      onClick={() => handleEditMethod(method)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMethod(method.id)}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Forma de Pagamento */}
      {isModalOpen && (
        <PaymentMethodModal
          method={editingMethod}
          bankAccounts={bankAccounts}
          onSave={handleSaveMethod}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

// Modal para criar/editar forma de pagamento
interface PaymentMethodModalProps {
  method: PaymentMethod | null;
  bankAccounts: BankAccount[];
  onSave: (formData: PaymentMethodFormData) => void;
  onClose: () => void;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  method,
  bankAccounts,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<PaymentMethodFormData>({
    name: method?.name || '',
    type: method?.type || 'cash',
    description: method?.description || '',
    bankAccountId: method?.bankAccountId || ''
  });
  const [errors, setErrors] = useState<ValidationResult>({ isValid: true, errors: [] });

  const validateForm = (): ValidationResult => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push({ field: 'name', message: 'Nome é obrigatório', code: 'required' });
    }

    if (formData.name.length > 100) {
      errors.push({ field: 'name', message: 'Nome deve ter no máximo 100 caracteres', code: 'max_length' });
    }

    if (formData.description && formData.description.length > 500) {
      errors.push({ field: 'description', message: 'Descrição deve ter no máximo 500 caracteres', code: 'max_length' });
    }

    // Verificar se tipos que precisam de conta bancária têm uma selecionada
    const typesNeedingAccount = ['credit_card', 'debit_card', 'bank_transfer', 'pix'];
    if (typesNeedingAccount.includes(formData.type) && !formData.bankAccountId) {
      errors.push({ field: 'bankAccountId', message: 'Conta bancária é obrigatória para este tipo', code: 'required' });
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm();
    setErrors(validation);

    if (validation.isValid) {
      onSave(formData);
    }
  };

  const typeOptions = [
    { value: 'cash', label: 'Dinheiro', icon: '💵', color: 'green' },
    { value: 'credit_card', label: 'Cartão de Crédito', icon: '💳', color: 'blue' },
    { value: 'debit_card', label: 'Cartão de Débito', icon: '💳', color: 'purple' },
    { value: 'bank_transfer', label: 'Transferência Bancária', icon: '🏦', color: 'indigo' },
    { value: 'pix', label: 'PIX', icon: '⚡', color: 'orange' },
    { value: 'check', label: 'Cheque', icon: '📝', color: 'gray' },
    { value: 'other', label: 'Outro', icon: '💼', color: 'slate' }
  ];

  const needsBankAccount = ['credit_card', 'debit_card', 'bank_transfer', 'pix'].includes(formData.type);
  const selectedType = typeOptions.find(opt => opt.value === formData.type);

  const getTypeIcon = (type: string) => {
    const option = typeOptions.find(opt => opt.value === type);
    return option?.icon || '💳';
  };

  const getTypeLabel = (type: string) => {
    const option = typeOptions.find(opt => opt.value === type);
    return option?.label || 'Método de Pagamento';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">
            {method ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
          </h3>
          <p className="text-blue-100 text-sm mt-1">
            {method ? 'Atualize as informações da forma de pagamento' : 'Configure uma nova forma de pagamento para suas transações'}
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Informações Básicas
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Forma de Pagamento *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.errors.find(e => e.field === 'name') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Cartão Corporativo, PIX Empresa, Dinheiro Caixa..."
                  />
                  {errors.errors.find(e => e.field === 'name') && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.errors.find(e => e.field === 'name')?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Pagamento *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      type: e.target.value as PaymentMethodFormData['type'],
                      bankAccountId: ['credit_card', 'debit_card', 'bank_transfer', 'pix'].includes(e.target.value) 
                        ? prev.bankAccountId 
                        : ''
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {typeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      errors.errors.find(e => e.field === 'description') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Descrição ou observações sobre esta forma de pagamento..."
                    rows={3}
                  />
                  {errors.errors.find(e => e.field === 'description') && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.errors.find(e => e.field === 'description')?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Configurações Bancárias */}
            {needsBankAccount && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Configurações Bancárias
                </h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conta Bancária Vinculada *
                    </label>
                    <select
                      value={formData.bankAccountId}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankAccountId: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.errors.find(e => e.field === 'bankAccountId') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">🏛️ Selecione uma conta bancária</option>
                      {bankAccounts.filter(acc => acc.isActive).map(account => (
                        <option key={account.id} value={account.id}>
                          🏦 {account.name} - {account.bank} (Ag: {account.agency})
                        </option>
                      ))}
                    </select>
                    {errors.errors.find(e => e.field === 'bankAccountId') && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <span className="text-red-500">⚠</span>
                        {errors.errors.find(e => e.field === 'bankAccountId')?.message}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      💡 Esta conta será usada para transações com este método de pagamento
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                Pré-visualização
              </h4>
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <span className="text-xl">{getTypeIcon(formData.type)}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {formData.name || 'Nome da forma de pagamento'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getTypeLabel(formData.type)}
                  </div>
                  {needsBankAccount && formData.bankAccountId && (
                    <div className="text-sm text-gray-600">
                      Vinculado à: {bankAccounts.find(acc => acc.id === formData.bankAccountId)?.name || 'Conta selecionada'}
                    </div>
                  )}
                  {formData.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.description}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedType?.color === 'green' ? 'bg-green-100 text-green-800' :
                    selectedType?.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    selectedType?.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                    selectedType?.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {needsBankAccount ? 'Bancário' : 'Físico'}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md"
          >
            {method ? '✏️ Atualizar Método' : '➕ Criar Método'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsManager;