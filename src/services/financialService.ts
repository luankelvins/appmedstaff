import { supabase } from '../config/supabase';
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
  
  async getCategories(type?: 'income' | 'expense'): Promise<FinancialCategory[]> {
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
    return data || [];
  }

  async createCategory(category: Omit<FinancialCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialCategory> {
    const { data, error } = await supabase
      .from('financial_categories')
      .insert([{
        name: category.name,
        description: category.description,
        type: category.type,
        color: category.color,
        icon: category.icon,
        parent_category_id: category.parentCategoryId,
        is_active: category.isActive
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapCategoryFromDB(data);
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
    return this.mapCategoryFromDB(data);
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
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
    let query = supabase
      .from('revenues')
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
        query = query.or(`description.ilike.%${filter.searchTerm}%,client_name.ilike.%${filter.searchTerm}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data?.map(this.mapRevenueFromDB) || [];
  }

  async createRevenue(revenue: Omit<Revenue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Revenue> {
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
    return this.mapRevenueFromDB(data);
  }

  async updateRevenue(id: string, updates: Partial<Revenue>): Promise<Revenue> {
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
    return this.mapRevenueFromDB(data);
  }

  async getExpenses(filter?: FinancialFilter): Promise<Expense[]> {
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
    return data?.map(this.mapExpenseFromDB) || [];
  }

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
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
    return this.mapExpenseFromDB(data);
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
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
        is_recurrent: updates.recurrence?.isRecurrent,
        recurrence_config: updates.recurrence,
        supplier_name: updates.supplierName,
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
    return this.mapExpenseFromDB(data);
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