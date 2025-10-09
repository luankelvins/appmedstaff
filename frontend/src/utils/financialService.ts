import db from '../config/database';
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
  
  async getCategories(type?: 'income' | 'expense'): Promise<FinancialCategory[]> {
    try {
      const cached = financialCacheService.getCategoriesCache();
      if (cached) {
        return cached;
      }

      let query = 'SELECT * FROM financial_categories WHERE is_active = true';
      const params: any[] = [];
      
      if (type) {
        query += ' AND type = $1';
        params.push(type);
      }
      
      query += ' ORDER BY name';

      const result = await db.query(query, params);
      const categories = result.rows.map(this.mapCategoryFromDB);
      
      financialCacheService.setCategoriesCache(categories);
      return categories;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  async createCategory(category: Omit<FinancialCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialCategory> {
    try {
      const query = `
        INSERT INTO financial_categories (name, type, description, color, icon, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const result = await db.query(query, [
        category.name,
        category.type,
        category.description,
        category.color,
        category.icon,
        true
      ]);
      
      financialCacheService.invalidateCategoriesCache();
      return this.mapCategoryFromDB(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }

  // ==================== CONTAS BANCÁRIAS ====================
  
  async getBankAccounts(): Promise<BankAccount[]> {
    try {
      const query = 'SELECT * FROM bank_accounts WHERE is_active = true ORDER BY name';
      const result = await db.query(query);
      return result.rows.map(this.mapBankAccountFromDB);
    } catch (error) {
      console.error('Erro ao buscar contas bancárias:', error);
      throw error;
    }
  }

  async createBankAccount(account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankAccount> {
    try {
      const query = `
        INSERT INTO bank_accounts (name, bank_name, account_number, account_type, balance, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const result = await db.query(query, [
         account.name,
         account.bank,
         account.accountNumber,
         account.accountType,
         account.balance,
         true
       ]);
      
      return this.mapBankAccountFromDB(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar conta bancária:', error);
      throw error;
    }
  }

  // ==================== RECEITAS ====================
  
  async getRevenues(filter?: FinancialFilter): Promise<Revenue[]> {
    try {
      let query = 'SELECT * FROM revenues WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filter?.startDate) {
        query += ` AND date >= $${paramIndex}`;
        params.push(filter.startDate);
        paramIndex++;
      }

      if (filter?.endDate) {
        query += ` AND date <= $${paramIndex}`;
        params.push(filter.endDate);
        paramIndex++;
      }

      if (filter?.categoryIds && filter.categoryIds.length > 0) {
         query += ` AND category_id = ANY($${paramIndex})`;
         params.push(filter.categoryIds);
         paramIndex++;
       }

      query += ' ORDER BY date DESC';

      const result = await db.query(query, params);
      return result.rows.map(this.mapRevenueFromDB);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      throw error;
    }
  }

  async createRevenue(revenue: Omit<Revenue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Revenue> {
    try {
      const query = `
        INSERT INTO revenues (description, amount, date, category_id, payment_method_id, bank_account_id, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const result = await db.query(query, [
         revenue.description,
         revenue.amount,
         revenue.dueDate,
         revenue.categoryId,
         revenue.paymentMethodId,
         revenue.bankAccountId,
         revenue.status || 'pending',
         revenue.notes
       ]);
      
      return this.mapRevenueFromDB(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      throw error;
    }
  }

  // ==================== DESPESAS ====================
  
  async getExpenses(filter?: FinancialFilter): Promise<Expense[]> {
    try {
      let query = 'SELECT * FROM expenses WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filter?.startDate) {
        query += ` AND date >= $${paramIndex}`;
        params.push(filter.startDate);
        paramIndex++;
      }

      if (filter?.endDate) {
        query += ` AND date <= $${paramIndex}`;
        params.push(filter.endDate);
        paramIndex++;
      }

      if (filter?.categoryIds && filter.categoryIds.length > 0) {
         query += ` AND category_id = ANY($${paramIndex})`;
         params.push(filter.categoryIds);
         paramIndex++;
       }

      query += ' ORDER BY date DESC';

      const result = await db.query(query, params);
      return result.rows.map(this.mapExpenseFromDB);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      throw error;
    }
  }

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    try {
      const query = `
        INSERT INTO expenses (description, amount, date, category_id, payment_method_id, bank_account_id, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const result = await db.query(query, [
         expense.description,
         expense.amount,
         expense.dueDate,
         expense.categoryId,
         expense.paymentMethodId,
         expense.bankAccountId,
         expense.status || 'pending',
         expense.notes
       ]);
      
      return this.mapExpenseFromDB(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      throw error;
    }
  }

  // ==================== MÉTODOS DE PAGAMENTO ====================
  
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const query = 'SELECT * FROM payment_methods WHERE is_active = true ORDER BY name';
      const result = await db.query(query);
      return result.rows.map(this.mapPaymentMethodFromDB);
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      // Retornar métodos padrão em caso de erro
       return [
         { id: '1', name: 'Dinheiro', type: 'cash', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'system', updatedBy: 'system' },
         { id: '2', name: 'Cartão de Crédito', type: 'credit_card', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'system', updatedBy: 'system' },
         { id: '3', name: 'Cartão de Débito', type: 'debit_card', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'system', updatedBy: 'system' },
         { id: '4', name: 'PIX', type: 'pix', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'system', updatedBy: 'system' },
         { id: '5', name: 'Transferência Bancária', type: 'bank_transfer', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'system', updatedBy: 'system' }
       ];
    }
  }

  // ==================== NOTIFICAÇÕES ====================
  
  async getNotifications(): Promise<FinancialNotification[]> {
    try {
      const query = `
        SELECT 
          'expense' as type,
          id,
          description as title,
          'Despesa vencendo em breve' as message,
          due_date as date,
          amount,
          status,
          'warning' as priority
        FROM expenses 
        WHERE status = 'pending' AND due_date <= CURRENT_DATE + INTERVAL '7 days'
        
        UNION ALL
        
        SELECT 
          'revenue' as type,
          id,
          description as title,
          'Receita vencendo em breve' as message,
          due_date as date,
          amount,
          status,
          'info' as priority
        FROM revenues 
        WHERE status = 'pending' AND due_date <= CURRENT_DATE + INTERVAL '7 days'
        
        ORDER BY date ASC
        LIMIT 10
      `;
      
      const result = await db.query(query);
      return result.rows.map(this.mapNotificationFromDB);
    } catch (error) {
      console.error('Erro ao buscar notificações financeiras:', error);
      // Retornar array vazio em caso de erro
      return [];
    }
  }

  // ==================== ESTATÍSTICAS ====================
  
  async getFinancialStats(filter?: FinancialFilter): Promise<FinancialStats> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filter?.startDate) {
        whereClause += ` AND date >= $${paramIndex}`;
        params.push(filter.startDate);
        paramIndex++;
      }

      if (filter?.endDate) {
        whereClause += ` AND date <= $${paramIndex}`;
        params.push(filter.endDate);
        paramIndex++;
      }

      // Buscar receitas
      const revenueQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM revenues ${whereClause}`;
      const revenueResult = await db.query(revenueQuery, params);
      const totalRevenue = parseFloat(revenueResult.rows[0]?.total || '0');

      // Buscar despesas
      const expenseQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM expenses ${whereClause}`;
      const expenseResult = await db.query(expenseQuery, params);
      const totalExpense = parseFloat(expenseResult.rows[0]?.total || '0');

      return {
        totalRevenue,
        totalExpenses: totalExpense,
        netIncome: totalRevenue - totalExpense,
        pendingRevenue: 0,
        pendingExpenses: 0,
        overdueRevenue: 0,
        overdueExpenses: 0,
        transactionCount: {
          revenue: 0,
          expense: 0
        },
        categoryBreakdown: [],
        monthlyTrend: []
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas financeiras:', error);
      throw error;
    }
  }

  // ==================== MAPEAMENTO DE DADOS ====================
  
  private mapCategoryFromDB(data: any): FinancialCategory {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      description: data.description,
      color: data.color,
      icon: data.icon,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || 'system',
      updatedBy: data.updated_by || 'system'
    };
  }

  private mapBankAccountFromDB(data: any): BankAccount {
    return {
      id: data.id,
      name: data.name,
      bank: data.bank,
      accountNumber: data.account_number,
      agency: data.agency || '',
      accountType: data.account_type,
      balance: data.balance,
      isActive: data.is_active,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || 'system',
      updatedBy: data.updated_by || 'system'
    };
  }

  private mapRevenueFromDB(data: any): Revenue {
    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      dueDate: data.due_date,
      receivedDate: data.received_date,
      categoryId: data.category_id,
      paymentMethodId: data.payment_method_id,
      bankAccountId: data.bank_account_id,
      status: data.status,
      notes: data.notes,
      recurrence: {
        isRecurrent: false
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || 'system',
      updatedBy: data.updated_by || 'system'
    };
  }

  private mapExpenseFromDB(data: any): Expense {
    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      dueDate: data.due_date,
      paidDate: data.paid_date,
      categoryId: data.category_id,
      paymentMethodId: data.payment_method_id,
      bankAccountId: data.bank_account_id,
      status: data.status,
      notes: data.notes,
      recurrence: {
        isRecurrent: false
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || 'system',
      updatedBy: data.updated_by || 'system'
    };
  }

  private mapPaymentMethodFromDB(data: any): PaymentMethod {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || 'system',
      updatedBy: data.updated_by || 'system'
    };
  }

  private mapNotificationFromDB(data: any): FinancialNotification {
    return {
      id: data.id,
      type: data.type === 'expense' ? 'due_date' : 'due_date',
      title: data.title,
      message: data.message,
      entityType: data.type,
      entityId: data.id,
      isRead: false,
      priority: data.priority,
      actionRequired: true,
      dueDate: new Date(data.date),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      updatedBy: 'system'
    };
  }
}

export const financialService = new FinancialService();