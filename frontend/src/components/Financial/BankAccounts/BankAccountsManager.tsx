import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, CreditCard, Building2, TrendingUp, AlertCircle } from 'lucide-react';
import { BankAccount, BankAccountFormData, ValidationResult } from '../../../types/financial';
import { financialService } from '../../../utils/financialService';

interface BankAccountsManagerProps {
  onAccountSelect?: (account: BankAccount) => void;
}

const BankAccountsManager: React.FC<BankAccountsManagerProps> = ({ onAccountSelect }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<BankAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'checking' | 'savings' | 'investment'>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm, filterType, showInactive]);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financialService.getBankAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      setError('Erro ao carregar contas bancárias');
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = accounts.filter(account => {
      const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           account.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           account.accountNumber.includes(searchTerm);
      const matchesType = filterType === 'all' || account.accountType === filterType;
      const matchesActive = showInactive || account.isActive;
      
      return matchesSearch && matchesType && matchesActive;
    });

    setFilteredAccounts(filtered);
  };

  const handleCreateAccount = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta bancária?')) {
      try {
        await financialService.deleteBankAccount(accountId);
        setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        setError('Erro ao excluir conta bancária');
      }
    }
  };

  const handleSaveAccount = async (formData: BankAccountFormData) => {
    try {
      if (editingAccount) {
        const updatedAccount = await financialService.updateBankAccount(editingAccount.id, formData);
        setAccounts(prev => prev.map(acc => 
          acc.id === editingAccount.id ? updatedAccount : acc
        ));
      } else {
        const accountData = {
          ...formData,
          isActive: true,
          createdBy: 'current-user',
          updatedBy: 'current-user'
        };
        const newAccount = await financialService.createBankAccount(accountData);
        setAccounts(prev => [...prev, newAccount]);
      }
      setIsModalOpen(false);
      setEditingAccount(null);
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      setError('Erro ao salvar conta bancária');
    }
  };

  const getTotalBalance = () => {
    return accounts
      .filter(acc => acc.isActive)
      .reduce((total, acc) => total + acc.balance, 0);
  };

  const getAccountTypeLabel = (type: string) => {
    const types = {
      checking: 'Conta Corrente',
      savings: 'Poupança',
      investment: 'Investimento'
    };
    return types[type as keyof typeof types] || type;
  };

  const getAccountTypeIcon = (type: string) => {
    const icons = {
      checking: <CreditCard className="h-4 w-4" />,
      savings: <Building2 className="h-4 w-4" />,
      investment: <TrendingUp className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <CreditCard className="h-4 w-4" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Contas Bancárias</h2>
          <p className="text-gray-600">Gerencie suas contas bancárias e saldos</p>
        </div>
        <button
          onClick={handleCreateAccount}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Conta
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-red-800 font-medium">Erro</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo Total</p>
              <p className="text-2xl font-bold text-green-600">
                {showBalances ? formatCurrency(getTotalBalance()) : '••••••'}
              </p>
            </div>
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Contas Correntes</p>
              <p className="text-xl font-semibold">
                {accounts.filter(acc => acc.accountType === 'checking' && acc.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Poupanças</p>
              <p className="text-xl font-semibold">
                {accounts.filter(acc => acc.accountType === 'savings' && acc.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Investimentos</p>
              <p className="text-xl font-semibold">
                {accounts.filter(acc => acc.accountType === 'investment' && acc.isActive).length}
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
                placeholder="Buscar contas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'checking' | 'savings' | 'investment')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os tipos</option>
            <option value="checking">Conta Corrente</option>
            <option value="savings">Poupança</option>
            <option value="investment">Investimento</option>
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

      {/* Lista de Contas */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredAccounts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma conta encontrada</p>
            <p className="text-sm">Adicione sua primeira conta bancária</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAccounts.map((account) => (
              <div key={account.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      {getAccountTypeIcon(account.accountType)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{account.name}</h3>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {getAccountTypeLabel(account.accountType)}
                        </span>
                        {!account.isActive && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            Inativa
                          </span>
                        )}
                        {account.balance < 0 && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p>{account.bank} • Ag: {account.agency} • CC: {account.accountNumber}</p>
                        {account.description && (
                          <p className="mt-1">{account.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Saldo</p>
                      <p className={`text-lg font-semibold ${
                        account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {showBalances ? formatCurrency(account.balance) : '••••••'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {onAccountSelect && (
                      <button
                        onClick={() => onAccountSelect(account)}
                        className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Selecionar
                      </button>
                    )}
                    <button
                      onClick={() => handleEditAccount(account)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
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

      {/* Modal de Conta */}
      {isModalOpen && (
        <BankAccountModal
          account={editingAccount}
          onSave={handleSaveAccount}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

// Modal para criar/editar conta bancária
interface BankAccountModalProps {
  account: BankAccount | null;
  onSave: (formData: BankAccountFormData) => void;
  onClose: () => void;
}

const BankAccountModal: React.FC<BankAccountModalProps> = ({
  account,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<BankAccountFormData>({
    name: account?.name || '',
    bank: account?.bank || '',
    accountNumber: account?.accountNumber || '',
    agency: account?.agency || '',
    accountType: account?.accountType || 'checking',
    balance: account?.balance || 0,
    description: account?.description || ''
  });
  const [errors, setErrors] = useState<ValidationResult>({ isValid: true, errors: [] });

  const validateForm = (): ValidationResult => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push({ field: 'name', message: 'Nome é obrigatório', code: 'required' });
    }

    if (!formData.bank.trim()) {
      errors.push({ field: 'bank', message: 'Banco é obrigatório', code: 'required' });
    }

    if (!formData.accountNumber.trim()) {
      errors.push({ field: 'accountNumber', message: 'Número da conta é obrigatório', code: 'required' });
    }

    if (!formData.agency.trim()) {
      errors.push({ field: 'agency', message: 'Agência é obrigatória', code: 'required' });
    }

    if (formData.balance < 0) {
      errors.push({ field: 'balance', message: 'Saldo não pode ser negativo', code: 'invalid' });
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

  const bankOptions = [
    'Banco do Brasil', 'Itaú', 'Bradesco', 'Santander', 'Caixa Econômica Federal',
    'Nubank', 'Inter', 'C6 Bank', 'BTG Pactual', 'Sicoob', 'Sicredi', 'Outro'
  ];

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'checking': return '🏦';
      case 'savings': return '🐷';
      case 'investment': return '📈';
      default: return '💳';
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking': return 'Conta Corrente';
      case 'savings': return 'Poupança';
      case 'investment': return 'Investimento';
      default: return 'Conta';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">
            {account ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
          </h3>
          <p className="text-green-100 text-sm mt-1">
            {account ? 'Atualize as informações da conta bancária' : 'Preencha os dados para criar uma nova conta bancária'}
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Informações Básicas
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Conta *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      errors.errors.find(e => e.field === 'name') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Conta Corrente Principal, Poupança Reserva..."
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
                    Banco *
                  </label>
                  <select
                    value={formData.bank}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      errors.errors.find(e => e.field === 'bank') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">🏛️ Selecione um banco</option>
                    {bankOptions.map(bank => (
                      <option key={bank} value={bank}>🏦 {bank}</option>
                    ))}
                  </select>
                  {errors.errors.find(e => e.field === 'bank') && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.errors.find(e => e.field === 'bank')?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Conta *
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value as 'checking' | 'savings' | 'investment' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="checking">🏦 Conta Corrente</option>
                    <option value="savings">🐷 Poupança</option>
                    <option value="investment">📈 Investimento</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dados Bancários */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Dados Bancários
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agência *
                  </label>
                  <input
                    type="text"
                    value={formData.agency}
                    onChange={(e) => setFormData(prev => ({ ...prev, agency: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      errors.errors.find(e => e.field === 'agency') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ex: 1234"
                  />
                  {errors.errors.find(e => e.field === 'agency') && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.errors.find(e => e.field === 'agency')?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número da Conta *
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      errors.errors.find(e => e.field === 'accountNumber') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ex: 12345-6"
                  />
                  {errors.errors.find(e => e.field === 'accountNumber') && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.errors.find(e => e.field === 'accountNumber')?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saldo Inicial
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      errors.errors.find(e => e.field === 'balance') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="0,00"
                  />
                  {errors.errors.find(e => e.field === 'balance') && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.errors.find(e => e.field === 'balance')?.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    💡 Valor atual: {formatCurrency(formData.balance)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                    placeholder="Descrição ou observações sobre a conta..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                Pré-visualização
              </h4>
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <span className="text-xl">{getAccountTypeIcon(formData.accountType)}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {formData.name || 'Nome da conta'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formData.bank || 'Banco'} • {getAccountTypeLabel(formData.accountType)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Ag: {formData.agency || '0000'} • Conta: {formData.accountNumber || '00000-0'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(formData.balance)}
                  </div>
                  <div className="text-xs text-gray-500">Saldo inicial</div>
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
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-md"
          >
            {account ? '✏️ Atualizar Conta' : '➕ Criar Conta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankAccountsManager;