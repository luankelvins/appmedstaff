import { 
  ValidationError, 
  ValidationResult, 
  RevenueFormData, 
  ExpenseFormData, 
  CategoryFormData, 
  BankAccountFormData, 
  PaymentMethodFormData,
  FinancialCategory,
  BankAccount,
  PaymentMethod
} from '../types/financial';

// Utilitários de validação
export class FinancialValidator {
  // Validação de CPF/CNPJ
  static validateCPFCNPJ(value: string): boolean {
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length === 11) {
      return this.validateCPF(cleanValue);
    } else if (cleanValue.length === 14) {
      return this.validateCNPJ(cleanValue);
    }
    
    return false;
  }

  private static validateCPF(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    
    return remainder === parseInt(cpf.charAt(10));
  }

  private static validateCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cnpj.charAt(12))) return false;
    
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return digit2 === parseInt(cnpj.charAt(13));
  }

  // Validação de email
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validação de telefone brasileiro
  static validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  // Validação de valor monetário
  static validateAmount(amount: number, min = 0.01, max = 999999999.99): boolean {
    return amount >= min && amount <= max && Number.isFinite(amount);
  }

  // Validação de data
  static validateDate(date: Date, allowPast = true, allowFuture = true): boolean {
    if (!date || isNaN(date.getTime())) return false;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (!allowPast && inputDate < today) return false;
    if (!allowFuture && inputDate > today) return false;
    
    return true;
  }

  // Validação de número de conta bancária
  static validateAccountNumber(accountNumber: string): boolean {
    const cleanNumber = accountNumber.replace(/\D/g, '');
    return cleanNumber.length >= 4 && cleanNumber.length <= 20;
  }

  // Validação de agência bancária
  static validateAgency(agency: string): boolean {
    const cleanAgency = agency.replace(/\D/g, '');
    return cleanAgency.length >= 3 && cleanAgency.length <= 6;
  }

  // Validação de número de nota fiscal
  static validateInvoiceNumber(invoiceNumber: string): boolean {
    return invoiceNumber.trim().length >= 1 && invoiceNumber.trim().length <= 50;
  }

  // Validação de tags
  static validateTags(tags: string[]): boolean {
    if (tags.length > 10) return false;
    return tags.every(tag => tag.trim().length > 0 && tag.trim().length <= 30);
  }
}

// Validadores específicos para cada formulário
export class FinancialFormValidators {
  
  // Validação de receita
  static validateRevenue(
    data: RevenueFormData, 
    existingRevenues: any[] = [],
    categories: FinancialCategory[] = [],
    bankAccounts: BankAccount[] = [],
    paymentMethods: PaymentMethod[] = []
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Descrição
    if (!data.description?.trim()) {
      errors.push({ field: 'description', message: 'Descrição é obrigatória', code: 'required' });
    } else if (data.description.length < 3) {
      errors.push({ field: 'description', message: 'Descrição deve ter pelo menos 3 caracteres', code: 'min_length' });
    } else if (data.description.length > 255) {
      errors.push({ field: 'description', message: 'Descrição deve ter no máximo 255 caracteres', code: 'max_length' });
    }

    // Valor
    if (!FinancialValidator.validateAmount(data.amount)) {
      errors.push({ field: 'amount', message: 'Valor deve ser maior que R$ 0,01 e menor que R$ 999.999.999,99', code: 'invalid_amount' });
    }

    // Data de vencimento
    if (!data.dueDate) {
      errors.push({ field: 'dueDate', message: 'Data de vencimento é obrigatória', code: 'required' });
    } else if (!FinancialValidator.validateDate(data.dueDate)) {
      errors.push({ field: 'dueDate', message: 'Data de vencimento inválida', code: 'invalid_date' });
    }

    // Categoria
    if (!data.categoryId) {
      errors.push({ field: 'categoryId', message: 'Categoria é obrigatória', code: 'required' });
    } else {
      const category = categories.find(c => c.id === data.categoryId);
      if (!category) {
        errors.push({ field: 'categoryId', message: 'Categoria não encontrada', code: 'not_found' });
      } else if (category.type !== 'income') {
        errors.push({ field: 'categoryId', message: 'Categoria deve ser do tipo receita', code: 'invalid_type' });
      }
    }

    // Forma de pagamento
    if (!data.paymentMethodId) {
      errors.push({ field: 'paymentMethodId', message: 'Forma de pagamento é obrigatória', code: 'required' });
    } else if (!paymentMethods.find(p => p.id === data.paymentMethodId)) {
      errors.push({ field: 'paymentMethodId', message: 'Forma de pagamento não encontrada', code: 'not_found' });
    }

    // Conta bancária (se especificada)
    if (data.bankAccountId && !bankAccounts.find(b => b.id === data.bankAccountId)) {
      errors.push({ field: 'bankAccountId', message: 'Conta bancária não encontrada', code: 'not_found' });
    }

    // Nome do cliente
    if (data.clientName && data.clientName.length > 255) {
      errors.push({ field: 'clientName', message: 'Nome do cliente deve ter no máximo 255 caracteres', code: 'max_length' });
    }

    // Número da nota fiscal
    if (data.invoiceNumber && !FinancialValidator.validateInvoiceNumber(data.invoiceNumber)) {
      errors.push({ field: 'invoiceNumber', message: 'Número da nota fiscal inválido', code: 'invalid_format' });
    }

    // Tags
    if (data.tags && !FinancialValidator.validateTags(data.tags)) {
      errors.push({ field: 'tags', message: 'Tags inválidas (máximo 10 tags, cada uma com até 30 caracteres)', code: 'invalid_tags' });
    }

    // Notas
    if (data.notes && data.notes.length > 1000) {
      errors.push({ field: 'notes', message: 'Notas devem ter no máximo 1000 caracteres', code: 'max_length' });
    }

    // Validação de recorrência
    if (data.recurrence?.isRecurrent) {
      if (!data.recurrence.frequency) {
        errors.push({ field: 'recurrence.frequency', message: 'Frequência de recorrência é obrigatória', code: 'required' });
      }
      if (!data.recurrence.interval || data.recurrence.interval < 1) {
        errors.push({ field: 'recurrence.interval', message: 'Intervalo deve ser maior que zero', code: 'invalid_interval' });
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validação de despesa
  static validateExpense(
    data: ExpenseFormData,
    existingExpenses: any[] = [],
    categories: FinancialCategory[] = [],
    bankAccounts: BankAccount[] = [],
    paymentMethods: PaymentMethod[] = []
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Descrição
    if (!data.description?.trim()) {
      errors.push({ field: 'description', message: 'Descrição é obrigatória', code: 'required' });
    } else if (data.description.length < 3) {
      errors.push({ field: 'description', message: 'Descrição deve ter pelo menos 3 caracteres', code: 'min_length' });
    } else if (data.description.length > 255) {
      errors.push({ field: 'description', message: 'Descrição deve ter no máximo 255 caracteres', code: 'max_length' });
    }

    // Valor
    if (!FinancialValidator.validateAmount(data.amount)) {
      errors.push({ field: 'amount', message: 'Valor deve ser maior que R$ 0,01 e menor que R$ 999.999.999,99', code: 'invalid_amount' });
    }

    // Data de vencimento
    if (!data.dueDate) {
      errors.push({ field: 'dueDate', message: 'Data de vencimento é obrigatória', code: 'required' });
    } else if (!FinancialValidator.validateDate(data.dueDate)) {
      errors.push({ field: 'dueDate', message: 'Data de vencimento inválida', code: 'invalid_date' });
    }

    // Categoria
    if (!data.categoryId) {
      errors.push({ field: 'categoryId', message: 'Categoria é obrigatória', code: 'required' });
    } else {
      const category = categories.find(c => c.id === data.categoryId);
      if (!category) {
        errors.push({ field: 'categoryId', message: 'Categoria não encontrada', code: 'not_found' });
      } else if (category.type !== 'expense') {
        errors.push({ field: 'categoryId', message: 'Categoria deve ser do tipo despesa', code: 'invalid_type' });
      }
    }

    // Forma de pagamento
    if (!data.paymentMethodId) {
      errors.push({ field: 'paymentMethodId', message: 'Forma de pagamento é obrigatória', code: 'required' });
    } else if (!paymentMethods.find(p => p.id === data.paymentMethodId)) {
      errors.push({ field: 'paymentMethodId', message: 'Forma de pagamento não encontrada', code: 'not_found' });
    }

    // Conta bancária (se especificada)
    if (data.bankAccountId && !bankAccounts.find(b => b.id === data.bankAccountId)) {
      errors.push({ field: 'bankAccountId', message: 'Conta bancária não encontrada', code: 'not_found' });
    }

    // Nome do fornecedor
    if (data.supplierName && data.supplierName.length > 255) {
      errors.push({ field: 'supplierName', message: 'Nome do fornecedor deve ter no máximo 255 caracteres', code: 'max_length' });
    }

    // Número da nota fiscal
    if (data.invoiceNumber && !FinancialValidator.validateInvoiceNumber(data.invoiceNumber)) {
      errors.push({ field: 'invoiceNumber', message: 'Número da nota fiscal inválido', code: 'invalid_format' });
    }

    // Tags
    if (data.tags && !FinancialValidator.validateTags(data.tags)) {
      errors.push({ field: 'tags', message: 'Tags inválidas (máximo 10 tags, cada uma com até 30 caracteres)', code: 'invalid_tags' });
    }

    // Notas
    if (data.notes && data.notes.length > 1000) {
      errors.push({ field: 'notes', message: 'Notas devem ter no máximo 1000 caracteres', code: 'max_length' });
    }

    // Validação de recorrência
    if (data.recurrence?.isRecurrent) {
      if (!data.recurrence.frequency) {
        errors.push({ field: 'recurrence.frequency', message: 'Frequência de recorrência é obrigatória', code: 'required' });
      }
      if (!data.recurrence.interval || data.recurrence.interval < 1) {
        errors.push({ field: 'recurrence.interval', message: 'Intervalo deve ser maior que zero', code: 'invalid_interval' });
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validação de categoria
  static validateCategory(
    data: CategoryFormData,
    existingCategories: FinancialCategory[] = []
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Nome
    if (!data.name?.trim()) {
      errors.push({ field: 'name', message: 'Nome é obrigatório', code: 'required' });
    } else if (data.name.length < 2) {
      errors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres', code: 'min_length' });
    } else if (data.name.length > 100) {
      errors.push({ field: 'name', message: 'Nome deve ter no máximo 100 caracteres', code: 'max_length' });
    }

    // Verificar duplicação
    const existingCategory = existingCategories.find(cat => 
      cat.name.toLowerCase() === data.name.toLowerCase()
    );
    if (existingCategory) {
      errors.push({ field: 'name', message: 'Já existe uma categoria com este nome', code: 'duplicate' });
    }

    // Descrição
    if (data.description && data.description.length > 500) {
      errors.push({ field: 'description', message: 'Descrição deve ter no máximo 500 caracteres', code: 'max_length' });
    }

    // Tipo
    if (!data.type || !['income', 'expense'].includes(data.type)) {
      errors.push({ field: 'type', message: 'Tipo deve ser receita ou despesa', code: 'invalid_type' });
    }

    // Cor
    if (!data.color || !/^#[0-9A-F]{6}$/i.test(data.color)) {
      errors.push({ field: 'color', message: 'Cor deve estar no formato hexadecimal (#RRGGBB)', code: 'invalid_color' });
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validação de conta bancária
  static validateBankAccount(
    data: BankAccountFormData,
    existingAccounts: BankAccount[] = []
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Nome
    if (!data.name?.trim()) {
      errors.push({ field: 'name', message: 'Nome é obrigatório', code: 'required' });
    } else if (data.name.length < 2) {
      errors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres', code: 'min_length' });
    } else if (data.name.length > 100) {
      errors.push({ field: 'name', message: 'Nome deve ter no máximo 100 caracteres', code: 'max_length' });
    }

    // Banco
    if (!data.bank?.trim()) {
      errors.push({ field: 'bank', message: 'Banco é obrigatório', code: 'required' });
    } else if (data.bank.length > 100) {
      errors.push({ field: 'bank', message: 'Nome do banco deve ter no máximo 100 caracteres', code: 'max_length' });
    }

    // Número da conta
    if (!data.accountNumber?.trim()) {
      errors.push({ field: 'accountNumber', message: 'Número da conta é obrigatório', code: 'required' });
    } else if (!FinancialValidator.validateAccountNumber(data.accountNumber)) {
      errors.push({ field: 'accountNumber', message: 'Número da conta inválido', code: 'invalid_format' });
    }

    // Agência
    if (!data.agency?.trim()) {
      errors.push({ field: 'agency', message: 'Agência é obrigatória', code: 'required' });
    } else if (!FinancialValidator.validateAgency(data.agency)) {
      errors.push({ field: 'agency', message: 'Agência inválida', code: 'invalid_format' });
    }

    // Verificar duplicação
    const existingAccount = existingAccounts.find(acc => 
      acc.bank === data.bank && 
      acc.accountNumber === data.accountNumber && 
      acc.agency === data.agency
    );
    if (existingAccount) {
      errors.push({ field: 'accountNumber', message: 'Já existe uma conta com estes dados', code: 'duplicate' });
    }

    // Tipo de conta
    if (!data.accountType || !['checking', 'savings', 'investment'].includes(data.accountType)) {
      errors.push({ field: 'accountType', message: 'Tipo de conta inválido', code: 'invalid_type' });
    }

    // Saldo
    if (!Number.isFinite(data.balance)) {
      errors.push({ field: 'balance', message: 'Saldo deve ser um número válido', code: 'invalid_number' });
    }

    // Descrição
    if (data.description && data.description.length > 500) {
      errors.push({ field: 'description', message: 'Descrição deve ter no máximo 500 caracteres', code: 'max_length' });
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validação de forma de pagamento
  static validatePaymentMethod(
    data: PaymentMethodFormData,
    existingMethods: PaymentMethod[] = [],
    bankAccounts: BankAccount[] = []
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Nome
    if (!data.name?.trim()) {
      errors.push({ field: 'name', message: 'Nome é obrigatório', code: 'required' });
    } else if (data.name.length < 2) {
      errors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres', code: 'min_length' });
    } else if (data.name.length > 100) {
      errors.push({ field: 'name', message: 'Nome deve ter no máximo 100 caracteres', code: 'max_length' });
    }

    // Verificar duplicação
    const existingMethod = existingMethods.find(method => 
      method.name.toLowerCase() === data.name.toLowerCase()
    );
    if (existingMethod) {
      errors.push({ field: 'name', message: 'Já existe uma forma de pagamento com este nome', code: 'duplicate' });
    }

    // Tipo
    const validTypes = ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'check', 'other'];
    if (!data.type || !validTypes.includes(data.type)) {
      errors.push({ field: 'type', message: 'Tipo de pagamento inválido', code: 'invalid_type' });
    }

    // Conta bancária (obrigatória para alguns tipos)
    const typesNeedingAccount = ['credit_card', 'debit_card', 'bank_transfer', 'pix'];
    if (typesNeedingAccount.includes(data.type) && !data.bankAccountId) {
      errors.push({ field: 'bankAccountId', message: 'Conta bancária é obrigatória para este tipo', code: 'required' });
    }

    // Verificar se conta bancária existe
    if (data.bankAccountId && !bankAccounts.find(acc => acc.id === data.bankAccountId)) {
      errors.push({ field: 'bankAccountId', message: 'Conta bancária não encontrada', code: 'not_found' });
    }

    // Descrição
    if (data.description && data.description.length > 500) {
      errors.push({ field: 'description', message: 'Descrição deve ter no máximo 500 caracteres', code: 'max_length' });
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Função utilitária para formatar mensagens de erro
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(error => error.message).join(', ');
};

// Função para obter mensagem de erro específica por campo
export const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
  const error = errors.find(err => err.field === field);
  return error?.message;
};