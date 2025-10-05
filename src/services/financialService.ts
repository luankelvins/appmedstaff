import { supabase } from '../config/supabase';
import { financialCacheService } from './financialCacheService';
import { paginationService, PaginationParams, PaginatedResponse } from './paginationService';
import type {
  FinancialCategory,
  BankAccount,
  PaymentMethod,
  Revenue,
  Expense,
  FinancialNotification,
  FinancialStats,
  FinancialFilter,
  FinancialReport,
  FinancialSettings
} from '../types/financial';

export class FinancialService {
  // ==================== CATEGORIAS ====================
  
  /**
   * Obtém todas as categorias financeiras
   */
  async getCategories(type?: 'income' | 'expense'): Promise<FinancialCategory[]> {
    try {
      // Verifica cache primeiro
      const cached = financialCacheService.getCategoriesCache();
      if (cached) {
        return cached;
      }

      let query = supabase
        .from('financial_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const categories = (data || []).map(this.mapCategoryFromDB);
      
      // Armazena no cache
      financialCacheService.setCategoriesCache(categories);
      
      return categories;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new Error('Falha ao carregar categorias financeiras');
    }
  }

  /**
   * Cria uma nova categoria financeira
   */
  async createCategory(category: Omit<FinancialCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialCategory> {
    try {
      const { data, error } = await supabase
        .from('financial_categories')
        .insert([{
          name: category.name,
          type: category.type,
          description: category.description,
          color: category.color,
          icon: category.icon,
          parent_category_id: category.parentCategoryId,
          is_active: category.isActive
        }])
        .select()
        .single();

      if (error) throw error;

      // Invalida cache de categorias
      financialCacheService.invalidateCategoriesCache();

      return this.mapCategoryFromDB(data);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw new Error('Falha ao criar categoria financeira');
    }
  }

  async updateCategory(id: string, updates: Partial<FinancialCategory>): Promise<FinancialCategory> {
    const { data, error } = await supabase
      .from('financial_categories')
      .update({
        name: updates.name,
        description: updates.description,
        color: updates.color,
        icon: updates.icon,
        is_active: updates.isActive
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Invalida cache de categorias
    financialCacheService.invalidateCategoriesCache();
    
    return this.mapCategoryFromDB(data);
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    
    // Invalida cache de categorias
    financialCacheService.invalidateCategoriesCache();
  }

  // ==================== CONTAS BANCÁRIAS ====================

  async getBankAccounts(): Promise<BankAccount[]> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data?.map(this.mapBankAccountFromDB) || [];
  }

  async createBankAccount(account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankAccount> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert([{
        name: account.name,
        bank: account.bank,
        account_number: account.accountNumber,
        agency: account.agency,
        account_type: account.accountType,
        balance: account.balance,
        description: account.description,
        is_active: account.isActive
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapBankAccountFromDB(data);
  }

  async updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update({
        name: updates.name,
        bank: updates.bank,
        account_number: updates.accountNumber,
        agency: updates.agency,
        account_type: updates.accountType,
        balance: updates.balance,
        description: updates.description,
        is_active: updates.isActive
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapBankAccountFromDB(data);
  }

  // ==================== FORMAS DE PAGAMENTO ====================

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select(`
        *,
        bank_account:bank_accounts(*)
      `)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data?.map(this.mapPaymentMethodFromDB) || [];
  }

  async createPaymentMethod(method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod> {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([{
        name: method.name,
        type: method.type,
        description: method.description,
        bank_account_id: method.bankAccountId,
        is_active: method.isActive
      }])
      .select(`
        *,
        bank_account:bank_accounts(*)
      `)
      .single();

    if (error) throw error;
    return this.mapPaymentMethodFromDB(data);
  }

  // ==================== RECEITAS ====================

  async getRevenues(filter?: FinancialFilter): Promise<Revenue[]> {
    try {
      // Verifica cache primeiro
      const cached = financialCacheService.getRevenuesCache(filter);
      if (cached) {
        return cached;
      }

      let query = supabase
        .from('revenues')
        .select(`
          *,
          category:financial_categories(*),
          payment_method:payment_methods(*),
          bank_account:bank_accounts(*)
        `)
        .order('received_date', { ascending: false });

      if (filter) {
        if (filter.status && filter.status.length > 0) {
          query = query.in('status', filter.status);
        }
        if (filter.categoryIds && filter.categoryIds.length > 0) {
          query = query.in('category_id', filter.categoryIds);
        }
        if (filter.startDate) query = query.gte('received_date', filter.startDate.toISOString().split('T')[0]);
        if (filter.endDate) query = query.lte('received_date', filter.endDate.toISOString().split('T')[0]);
        if (filter.searchTerm) {
          query = query.or(`description.ilike.%${filter.searchTerm}%,payer_name.ilike.%${filter.searchTerm}%`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const revenues = data?.map(this.mapRevenueFromDB) || [];
      
      // Armazena no cache
      financialCacheService.setRevenuesCache(revenues, filter);
      
      return revenues;
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      throw new Error('Falha ao carregar receitas');
    }
  }

  async getRevenuesPaginated(
    params: PaginationParams,
    filter?: FinancialFilter
  ): Promise<PaginatedResponse<Revenue>> {
    try {
      const selectFields = `
        *,
        category:financial_categories(*),
        payment_method:payment_methods(*),
        bank_account:bank_accounts(*)
      `;

      const additionalFilters = (query: any) => {
        if (filter) {
          if (filter.status && filter.status.length > 0) {
            query = query.in('status', filter.status);
          }
          if (filter.categoryIds && filter.categoryIds.length > 0) {
            query = query.in('category_id', filter.categoryIds);
          }
          if (filter.startDate) {
            query = query.gte('received_date', filter.startDate.toISOString().split('T')[0]);
          }
          if (filter.endDate) {
            query = query.lte('received_date', filter.endDate.toISOString().split('T')[0]);
          }
        }
        return query;
      };

      // Configurar campos de busca
      const searchFields = ['description', 'payer_name', 'notes'];
      const paginationParams = {
        ...params,
        searchFields: params.search ? searchFields : undefined,
        sortBy: params.sortBy || 'received_date',
        sortOrder: params.sortOrder || 'desc' as const
      };

      const result = await paginationService.paginate<any>(
        'revenues',
        paginationParams,
        selectFields,
        additionalFilters
      );

      // Mapear os dados para o formato correto
      const mappedData = result.data.map(this.mapRevenueFromDB);

      return {
        ...result,
        data: mappedData
      };
    } catch (error) {
      console.error('Erro ao buscar receitas paginadas:', error);
      throw error;
    }
  }

  async createRevenue(revenue: Omit<Revenue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Revenue> {
    try {
      const { data, error } = await supabase
        .from('revenues')
        .insert([{
          description: revenue.description,
          amount: revenue.amount,
          due_date: revenue.dueDate,
          received_date: revenue.receivedDate,
          status: revenue.status,
          category_id: revenue.categoryId,
          payment_method_id: revenue.paymentMethodId,
          bank_account_id: revenue.bankAccountId,
          is_recurrent: revenue.recurrence.isRecurrent,
          recurrence_config: revenue.recurrence,
          client_name: revenue.clientName,
          invoice_number: revenue.invoiceNumber,
          notes: revenue.notes,
          tags: revenue.tags,
          attachments: revenue.attachments
        }])
        .select(`
          *,
          category:financial_categories(*),
          payment_method:payment_methods(*),
          bank_account:bank_accounts(*)
        `)
        .single();

      if (error) throw error;

      // Invalida cache de receitas
      financialCacheService.invalidateRevenuesCache();

      return this.mapRevenueFromDB(data);
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      throw new Error('Falha ao criar receita');
    }
  }

  async updateRevenue(id: string, updates: Partial<Revenue>): Promise<Revenue> {
    try {
      const { data, error } = await supabase
        .from('revenues')
        .update({
          description: updates.description,
          amount: updates.amount,
          due_date: updates.dueDate,
          received_date: updates.receivedDate,
          status: updates.status,
          category_id: updates.categoryId,
          payment_method_id: updates.paymentMethodId,
          bank_account_id: updates.bankAccountId,
          is_recurrent: updates.recurrence?.isRecurrent,
          recurrence_config: updates.recurrence,
          client_name: updates.clientName,
          invoice_number: updates.invoiceNumber,
          notes: updates.notes,
          tags: updates.tags,
          attachments: updates.attachments
        })
        .eq('id', id)
        .select(`
          *,
          category:financial_categories(*),
          payment_method:payment_methods(*),
          bank_account:bank_accounts(*)
        `)
        .single();

      if (error) throw error;

      // Invalida cache de receitas
      financialCacheService.invalidateRevenuesCache();

      return this.mapRevenueFromDB(data);
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      throw new Error('Falha ao atualizar receita');
    }
  }

  async deleteRevenue(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('revenues')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalida cache de receitas
      financialCacheService.invalidateRevenuesCache();
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
      throw new Error('Falha ao deletar receita');
    }
  }

  async getExpenses(filter?: FinancialFilter): Promise<Expense[]> {
    try {
      // Verifica cache primeiro
      const cached = financialCacheService.getExpensesCache(filter);
      if (cached) {
        return cached;
      }

      let query = supabase
        .from('expenses')
        .select(`
          *,
          category:financial_categories(*),
          payment_method:payment_methods(*),
          bank_account:bank_accounts(*)
        `)
        .order('due_date', { ascending: false });

      if (filter) {
        if (filter.status && filter.status.length > 0) {
          query = query.in('status', filter.status);
        }
        if (filter.categoryIds && filter.categoryIds.length > 0) {
          query = query.in('category_id', filter.categoryIds);
        }
        if (filter.startDate) query = query.gte('due_date', filter.startDate.toISOString().split('T')[0]);
        if (filter.endDate) query = query.lte('due_date', filter.endDate.toISOString().split('T')[0]);
        if (filter.searchTerm) {
          query = query.or(`description.ilike.%${filter.searchTerm}%,supplier_name.ilike.%${filter.searchTerm}%`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const expenses = data?.map(this.mapExpenseFromDB) || [];
      
      // Armazena no cache
      financialCacheService.setExpensesCache(expenses, filter);
      
      return expenses;
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      throw new Error('Falha ao carregar despesas');
    }
  }

  async getExpensesPaginated(
    params: PaginationParams,
    filter?: FinancialFilter
  ): Promise<PaginatedResponse<Expense>> {
    try {
      const selectFields = `
        *,
        category:financial_categories(*),
        payment_method:payment_methods(*),
        bank_account:bank_accounts(*)
      `;

      const additionalFilters = (query: any) => {
        if (filter) {
          if (filter.status && filter.status.length > 0) {
            query = query.in('status', filter.status);
          }
          if (filter.categoryIds && filter.categoryIds.length > 0) {
            query = query.in('category_id', filter.categoryIds);
          }
          if (filter.startDate) {
            query = query.gte('due_date', filter.startDate.toISOString().split('T')[0]);
          }
          if (filter.endDate) {
            query = query.lte('due_date', filter.endDate.toISOString().split('T')[0]);
          }
        }
        return query;
      };

      // Configurar campos de busca
      const searchFields = ['description', 'supplier_name', 'notes'];
      const paginationParams = {
        ...params,
        searchFields: params.search ? searchFields : undefined,
        sortBy: params.sortBy || 'due_date',
        sortOrder: params.sortOrder || 'desc' as const
      };

      const result = await paginationService.paginate<any>(
        'expenses',
        paginationParams,
        selectFields,
        additionalFilters
      );

      // Mapear os dados para o formato correto
      const mappedData = result.data.map(this.mapExpenseFromDB);

      return {
        ...result,
        data: mappedData
      };
    } catch (error) {
      console.error('Erro ao buscar despesas paginadas:', error);
      throw error;
    }
  }

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          description: expense.description,
          amount: expense.amount,
          due_date: expense.dueDate,
          paid_date: expense.paidDate,
          status: expense.status,
          category_id: expense.categoryId,
          payment_method_id: expense.paymentMethodId,
          bank_account_id: expense.bankAccountId,
          is_recurrent: expense.recurrence.isRecurrent,
          recurrence_config: expense.recurrence,
          supplier_name: expense.supplierName,
          invoice_number: expense.invoiceNumber,
          notes: expense.notes,
          tags: expense.tags,
          attachments: expense.attachments
        }])
        .select(`
          *,
          category:financial_categories(*),
          payment_method:payment_methods(*),
          bank_account:bank_accounts(*)
        `)
        .single();

      if (error) throw error;

      // Invalida cache de despesas
      financialCacheService.invalidateExpensesCache();

      return this.mapExpenseFromDB(data);
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      throw new Error('Falha ao criar despesa');
    }
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          description: updates.description,
          amount: updates.amount,
          due_date: updates.dueDate,
          paid_date: updates.paidDate,
          status: updates.status,
          category_id: updates.categoryId,
          payment_method_id: updates.paymentMethodId,
          bank_account_id: updates.bankAccountId,
          recurrence_config: updates.recurrence,
          is_recurrent: updates.recurrence?.isRecurrent,
          supplier_name: updates.supplierName,
          invoice_number: updates.invoiceNumber,
          notes: updates.notes,
          tags: updates.tags,
          attachments: updates.attachments,
          updated_at: new Date().toISOString(),
          updated_by: updates.updatedBy
        })
        .eq('id', id)
        .select(`
          *,
          category:financial_categories(*),
          payment_method:payment_methods(*),
          bank_account:bank_accounts(*)
        `)
        .single();

      if (error) throw error;

      // Invalida cache de despesas
      financialCacheService.invalidateExpensesCache();

      return this.mapExpenseFromDB(data);
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      throw new Error('Falha ao atualizar despesa');
    }
  }

  async deleteExpense(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalida cache de despesas
      financialCacheService.invalidateExpensesCache();
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      throw new Error('Falha ao deletar despesa');
    }
  }

  // ==================== ESTATÍSTICAS ====================

  async getFinancialStats(filter?: FinancialFilter): Promise<FinancialStats> {
    // Buscar receitas
    const revenuesQuery = supabase.from('revenues').select('amount, status, due_date');
    const expensesQuery = supabase.from('expenses').select('amount, status, due_date');

    if (filter?.startDate) {
      revenuesQuery.gte('due_date', filter.startDate.toISOString().split('T')[0]);
      expensesQuery.gte('due_date', filter.startDate.toISOString().split('T')[0]);
    }
    if (filter?.endDate) {
      revenuesQuery.lte('due_date', filter.endDate.toISOString().split('T')[0]);
      expensesQuery.lte('due_date', filter.endDate.toISOString().split('T')[0]);
    }

    const [revenuesResult, expensesResult] = await Promise.all([
      revenuesQuery,
      expensesQuery
    ]);

    if (revenuesResult.error) throw revenuesResult.error;
    if (expensesResult.error) throw expensesResult.error;

    const revenues = revenuesResult.data || [];
    const expenses = expensesResult.data || [];

    const totalRevenues = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const receivedRevenues = revenues.filter(r => r.status === 'received').reduce((sum, r) => sum + r.amount, 0);
    const paidExpenses = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);

    return {
      totalRevenue: totalRevenues,
      totalExpenses,
      netIncome: receivedRevenues - paidExpenses,
      pendingRevenue: totalRevenues - receivedRevenues,
      pendingExpenses: totalExpenses - paidExpenses,
      overdueRevenue: revenues.filter(r => r.status === 'overdue').reduce((sum, r) => sum + r.amount, 0),
      overdueExpenses: expenses.filter(e => e.status === 'overdue').reduce((sum, e) => sum + e.amount, 0),
      transactionCount: {
        revenue: revenues.length,
        expense: expenses.length
      },
      categoryBreakdown: [],
      monthlyTrend: []
    };
  }

  // ==================== NOTIFICAÇÕES ====================

  async getNotifications(unreadOnly = false): Promise<FinancialNotification[]> {
    let query = supabase
      .from('financial_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data?.map(this.mapNotificationFromDB) || [];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  }

  // ==================== MAPEAMENTO DE DADOS ====================

  private mapCategoryFromDB(data: any): FinancialCategory {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
      color: data.color,
      icon: data.icon,
      parentCategoryId: data.parent_category_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || '',
      updatedBy: data.updated_by || ''
    };
  }

  private mapBankAccountFromDB(data: any): BankAccount {
    return {
      id: data.id,
      name: data.name,
      bank: data.bank,
      accountNumber: data.account_number,
      agency: data.agency,
      accountType: data.account_type,
      balance: Number(data.balance),
      isActive: data.is_active,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || '',
      updatedBy: data.updated_by || ''
    };
  }

  private mapPaymentMethodFromDB(data: any): PaymentMethod {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      description: data.description,
      isActive: data.is_active,
      bankAccountId: data.bank_account_id,
      bankAccount: data.bank_account ? this.mapBankAccountFromDB(data.bank_account) : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || '',
      updatedBy: data.updated_by || ''
    };
  }

  private mapRevenueFromDB(data: any): Revenue {
    return {
      id: data.id,
      description: data.description,
      amount: Number(data.amount),
      dueDate: data.due_date,
      receivedDate: data.received_date,
      status: data.status,
      categoryId: data.category_id,
      paymentMethodId: data.payment_method_id,
      bankAccountId: data.bank_account_id,
      recurrence: data.recurrence_config || { isRecurrent: data.is_recurrent || false },
      clientName: data.client_name,
      invoiceNumber: data.invoice_number,
      notes: data.notes,
      tags: data.tags || [],
      attachments: data.attachments || [],
      category: data.category ? this.mapCategoryFromDB(data.category) : undefined,
      paymentMethod: data.payment_method ? this.mapPaymentMethodFromDB(data.payment_method) : undefined,
      bankAccount: data.bank_account ? this.mapBankAccountFromDB(data.bank_account) : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || '',
      updatedBy: data.updated_by || ''
    };
  }

  private mapExpenseFromDB(data: any): Expense {
    return {
      id: data.id,
      description: data.description,
      amount: Number(data.amount),
      dueDate: data.due_date,
      paidDate: data.paid_date,
      status: data.status,
      categoryId: data.category_id,
      paymentMethodId: data.payment_method_id,
      bankAccountId: data.bank_account_id,
      recurrence: data.recurrence_config || { isRecurrent: data.is_recurrent || false },
      supplierName: data.supplier_name,
      invoiceNumber: data.invoice_number,
      notes: data.notes,
      tags: data.tags || [],
      attachments: data.attachments || [],
      category: data.category ? this.mapCategoryFromDB(data.category) : undefined,
      paymentMethod: data.payment_method ? this.mapPaymentMethodFromDB(data.payment_method) : undefined,
      bankAccount: data.bank_account ? this.mapBankAccountFromDB(data.bank_account) : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || '',
      updatedBy: data.updated_by || ''
    };
  }

  private mapNotificationFromDB(data: any): FinancialNotification {
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      message: data.message,
      entityType: data.entity_type,
      entityId: data.entity_id,
      isRead: data.is_read,
      priority: data.priority,
      actionRequired: data.action_required,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || '',
      updatedBy: data.updated_by || ''
    };
  }
}

export const financialService = new FinancialService();