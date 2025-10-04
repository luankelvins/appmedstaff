// Tipos base para o sistema financeiro

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Categoria Financeira
export interface FinancialCategory extends BaseEntity {
  name: string;
  description?: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  isActive: boolean;
  parentCategoryId?: string;
  subcategories?: FinancialCategory[];
}

// Conta Bancária
export interface BankAccount extends BaseEntity {
  name: string;
  bank: string;
  accountNumber: string;
  agency: string;
  accountType: 'checking' | 'savings' | 'investment';
  balance: number;
  isActive: boolean;
  description?: string;
}

// Forma de Pagamento
export interface PaymentMethod extends BaseEntity {
  name: string;
  type: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check' | 'other';
  description?: string;
  isActive: boolean;
  bankAccountId?: string;
  bankAccount?: BankAccount;
}

// Periodicidade para recorrência
export type RecurrencePeriod = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';

// Configuração de Recorrência
export interface RecurrenceConfig {
  isRecurrent: boolean;
  period?: RecurrencePeriod;
  interval?: number; // Ex: a cada 2 meses
  endDate?: Date;
  maxOccurrences?: number;
  nextDueDate?: Date;
  lastGeneratedDate?: Date;
}

// Status de transação
export type TransactionStatus = 'pending' | 'confirmed' | 'cancelled' | 'overdue';

// Receita
export interface Revenue extends BaseEntity {
  description: string;
  amount: number;
  dueDate: Date;
  receivedDate?: Date;
  status: TransactionStatus;
  categoryId: string;
  category?: FinancialCategory;
  paymentMethodId: string;
  paymentMethod?: PaymentMethod;
  bankAccountId?: string;
  bankAccount?: BankAccount;
  recurrence: RecurrenceConfig;
  notes?: string;
  attachments?: string[];
  tags?: string[];
  clientId?: string;
  clientName?: string;
  invoiceNumber?: string;
  parentTransactionId?: string; // Para transações recorrentes
}

// Despesa
export interface Expense extends BaseEntity {
  description: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: TransactionStatus;
  categoryId: string;
  category?: FinancialCategory;
  paymentMethodId: string;
  paymentMethod?: PaymentMethod;
  bankAccountId?: string;
  bankAccount?: BankAccount;
  recurrence: RecurrenceConfig;
  notes?: string;
  attachments?: string[];
  tags?: string[];
  supplierId?: string;
  supplierName?: string;
  invoiceNumber?: string;
  parentTransactionId?: string; // Para transações recorrentes
}

// Histórico de alterações
export interface ChangeHistory extends BaseEntity {
  entityType: 'revenue' | 'expense' | 'category' | 'payment_method' | 'bank_account';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
}

// Filtros para consultas
export interface FinancialFilter {
  startDate?: Date;
  endDate?: Date;
  categoryIds?: string[];
  paymentMethodIds?: string[];
  bankAccountIds?: string[];
  status?: TransactionStatus[];
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  tags?: string[];
  isRecurrent?: boolean;
  type?: 'income' | 'expense';
}

// Estatísticas financeiras
export interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  pendingRevenue: number;
  pendingExpenses: number;
  overdueRevenue: number;
  overdueExpenses: number;
  transactionCount: {
    revenue: number;
    expense: number;
  };
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    revenue: number;
    expenses: number;
    netIncome: number;
  }[];
}

// Notificação
export interface FinancialNotification extends BaseEntity {
  type: 'due_date' | 'overdue' | 'recurrence_confirmation' | 'low_balance';
  title: string;
  message: string;
  entityType: 'revenue' | 'expense' | 'bank_account';
  entityId: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  dueDate?: Date;
}

// Validação de dados
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

// Formulários
export interface RevenueFormData {
  description: string;
  amount: number;
  dueDate: Date;
  categoryId: string;
  paymentMethodId: string;
  bankAccountId?: string;
  recurrence: RecurrenceConfig;
  notes?: string;
  tags?: string[];
  clientName?: string;
  invoiceNumber?: string;
}

export interface ExpenseFormData {
  description: string;
  amount: number;
  dueDate: Date;
  categoryId: string;
  paymentMethodId: string;
  bankAccountId?: string;
  recurrence: RecurrenceConfig;
  notes?: string;
  tags?: string[];
  supplierName?: string;
  invoiceNumber?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  parentCategoryId?: string;
}

export interface BankAccountFormData {
  name: string;
  bank: string;
  accountNumber: string;
  agency: string;
  accountType: 'checking' | 'savings' | 'investment';
  balance: number;
  description?: string;
}

export interface PaymentMethodFormData {
  name: string;
  type: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check' | 'other';
  description?: string;
  bankAccountId?: string;
}

// Relatórios
export interface FinancialReport {
  id: string;
  name: string;
  type: 'cash_flow' | 'profit_loss' | 'category_analysis' | 'payment_method_analysis' | 'custom';
  period: {
    startDate: Date;
    endDate: Date;
  };
  filters: FinancialFilter;
  data: any;
  generatedAt: Date;
  generatedBy: string;
}

// Configurações do sistema
export interface FinancialSettings {
  defaultCurrency: string;
  fiscalYearStart: number; // Mês (1-12)
  notificationSettings: {
    dueDateReminder: number; // Dias antes do vencimento
    overdueReminder: number; // Dias após vencimento
    recurrenceConfirmation: boolean;
    lowBalanceAlert: number; // Valor mínimo
  };
  autoApprovalLimits: {
    revenue: number;
    expense: number;
  };
  backupSettings: {
    autoBackup: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
  };
}