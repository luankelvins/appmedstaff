import { 
  ValidationError, 
  ValidationResult, 
  RevenueFormData, 
  ExpenseFormData, 
  CategoryFormData, 
  BankAccountFormData, 
  PaymentMethodFormData 
} from '../types/financial';

/**
 * Classe utilitária para validações financeiras específicas
 */
export class FinancialValidator {
  
  /**
   * Valida CPF ou CNPJ
   */
  static validateCpfCnpj(value: string): boolean {
    if (!value) return false;
    
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length === 11) {
      return this.validateCpf(cleanValue);
    } else if (cleanValue.length === 14) {
      return this.validateCnpj(cleanValue);
    }
    
    return false;
  }

  private static validateCpf(cpf: string): boolean {
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

  private static validateCnpj(cnpj: string): boolean {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit1 !== parseInt(cnpj.charAt(12))) return false;
    
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return digit2 === parseInt(cnpj.charAt(13));
  }

  /**
   * Valida email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida telefone brasileiro
   */
  static validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  /**
   * Valida valor monetário
   */
  static validateMonetaryAmount(amount: number): boolean {
    return amount > 0 && Number.isFinite(amount) && amount <= 999999999.99;
  }

  /**
   * Valida data
   */
  static validateDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Valida data futura
   */
  static validateFutureDate(date: Date): boolean {
    return this.validateDate(date) && date > new Date();
  }

  /**
   * Valida número de conta bancária
   */
  static validateAccountNumber(accountNumber: string): boolean {
    const cleanNumber = accountNumber.replace(/\D/g, '');
    return cleanNumber.length >= 4 && cleanNumber.length <= 20;
  }

  /**
   * Valida agência bancária
   */
  static validateAgency(agency: string): boolean {
    const cleanAgency = agency.replace(/\D/g, '');
    return cleanAgency.length >= 3 && cleanAgency.length <= 6;
  }

  /**
   * Valida número de nota fiscal
   */
  static validateInvoiceNumber(invoiceNumber: string): boolean {
    return invoiceNumber.trim().length >= 1 && invoiceNumber.trim().length <= 50;
  }

  /**
   * Valida tags
   */
  static validateTags(tags: string[]): boolean {
    if (!Array.isArray(tags)) return false;
    return tags.every(tag => 
      typeof tag === 'string' && 
      tag.trim().length > 0 && 
      tag.trim().length <= 30
    );
  }
}

/**
 * Classe para validação de formulários financeiros
 */
export class FinancialFormValidators {

  /**
   * Valida dados de receita
   */
  static validateRevenue(data: RevenueFormData): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar descrição
    if (!data.description || data.description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Descrição é obrigatória',
        code: 'REQUIRED_FIELD'
      });
    } else if (data.description.trim().length > 255) {
      errors.push({
        field: 'description',
        message: 'Descrição deve ter no máximo 255 caracteres',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Validar valor
    if (!data.amount || !FinancialValidator.validateMonetaryAmount(data.amount)) {
      errors.push({
        field: 'amount',
        message: 'Valor deve ser maior que zero e válido',
        code: 'INVALID_AMOUNT'
      });
    }

    // Validar data de vencimento
    if (!data.dueDate || !FinancialValidator.validateDate(data.dueDate)) {
      errors.push({
        field: 'dueDate',
        message: 'Data de vencimento é obrigatória e deve ser válida',
        code: 'INVALID_DATE'
      });
    }

    // Validar categoria
    if (!data.categoryId || data.categoryId.trim().length === 0) {
      errors.push({
        field: 'categoryId',
        message: 'Categoria é obrigatória',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validar forma de pagamento
    if (!data.paymentMethodId || data.paymentMethodId.trim().length === 0) {
      errors.push({
        field: 'paymentMethodId',
        message: 'Forma de pagamento é obrigatória',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validar configuração de recorrência
    if (data.recurrence.isRecurrent) {
      if (!data.recurrence.period) {
        errors.push({
          field: 'recurrence.period',
          message: 'Período de recorrência é obrigatório quando a receita é recorrente',
          code: 'REQUIRED_FIELD'
        });
      }

      if (data.recurrence.interval && data.recurrence.interval <= 0) {
        errors.push({
          field: 'recurrence.interval',
          message: 'Intervalo deve ser maior que zero',
          code: 'INVALID_VALUE'
        });
      }

      if (data.recurrence.endDate && !FinancialValidator.validateDate(data.recurrence.endDate)) {
        errors.push({
          field: 'recurrence.endDate',
          message: 'Data de fim da recorrência deve ser válida',
          code: 'INVALID_DATE'
        });
      }

      if (data.recurrence.maxOccurrences && data.recurrence.maxOccurrences <= 0) {
        errors.push({
          field: 'recurrence.maxOccurrences',
          message: 'Número máximo de ocorrências deve ser maior que zero',
          code: 'INVALID_VALUE'
        });
      }
    }

    // Validar tags
    if (data.tags && !FinancialValidator.validateTags(data.tags)) {
      errors.push({
        field: 'tags',
        message: 'Tags devem ser válidas (máximo 30 caracteres cada)',
        code: 'INVALID_TAGS'
      });
    }

    // Validar número da nota fiscal
    if (data.invoiceNumber && !FinancialValidator.validateInvoiceNumber(data.invoiceNumber)) {
      errors.push({
        field: 'invoiceNumber',
        message: 'Número da nota fiscal deve ter entre 1 e 50 caracteres',
        code: 'INVALID_INVOICE_NUMBER'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida dados de despesa
   */
  static validateExpense(data: ExpenseFormData): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar descrição
    if (!data.description || data.description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Descrição é obrigatória',
        code: 'REQUIRED_FIELD'
      });
    } else if (data.description.trim().length > 255) {
      errors.push({
        field: 'description',
        message: 'Descrição deve ter no máximo 255 caracteres',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Validar valor
    if (!data.amount || !FinancialValidator.validateMonetaryAmount(data.amount)) {
      errors.push({
        field: 'amount',
        message: 'Valor deve ser maior que zero e válido',
        code: 'INVALID_AMOUNT'
      });
    }

    // Validar data de vencimento
    if (!data.dueDate || !FinancialValidator.validateDate(data.dueDate)) {
      errors.push({
        field: 'dueDate',
        message: 'Data de vencimento é obrigatória e deve ser válida',
        code: 'INVALID_DATE'
      });
    }

    // Validar categoria
    if (!data.categoryId || data.categoryId.trim().length === 0) {
      errors.push({
        field: 'categoryId',
        message: 'Categoria é obrigatória',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validar forma de pagamento
    if (!data.paymentMethodId || data.paymentMethodId.trim().length === 0) {
      errors.push({
        field: 'paymentMethodId',
        message: 'Forma de pagamento é obrigatória',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validar configuração de recorrência
    if (data.recurrence.isRecurrent) {
      if (!data.recurrence.period) {
        errors.push({
          field: 'recurrence.period',
          message: 'Período de recorrência é obrigatório quando a despesa é recorrente',
          code: 'REQUIRED_FIELD'
        });
      }

      if (data.recurrence.interval && data.recurrence.interval <= 0) {
        errors.push({
          field: 'recurrence.interval',
          message: 'Intervalo deve ser maior que zero',
          code: 'INVALID_VALUE'
        });
      }

      if (data.recurrence.endDate && !FinancialValidator.validateDate(data.recurrence.endDate)) {
        errors.push({
          field: 'recurrence.endDate',
          message: 'Data de fim da recorrência deve ser válida',
          code: 'INVALID_DATE'
        });
      }

      if (data.recurrence.maxOccurrences && data.recurrence.maxOccurrences <= 0) {
        errors.push({
          field: 'recurrence.maxOccurrences',
          message: 'Número máximo de ocorrências deve ser maior que zero',
          code: 'INVALID_VALUE'
        });
      }
    }

    // Validar tags
    if (data.tags && !FinancialValidator.validateTags(data.tags)) {
      errors.push({
        field: 'tags',
        message: 'Tags devem ser válidas (máximo 30 caracteres cada)',
        code: 'INVALID_TAGS'
      });
    }

    // Validar número da nota fiscal
    if (data.invoiceNumber && !FinancialValidator.validateInvoiceNumber(data.invoiceNumber)) {
      errors.push({
        field: 'invoiceNumber',
        message: 'Número da nota fiscal deve ter entre 1 e 50 caracteres',
        code: 'INVALID_INVOICE_NUMBER'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida dados de categoria
   */
  static validateCategory(data: CategoryFormData): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar nome
    if (!data.name || data.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Nome da categoria é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    } else if (data.name.trim().length > 100) {
      errors.push({
        field: 'name',
        message: 'Nome da categoria deve ter no máximo 100 caracteres',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Validar tipo
    if (!data.type || !['income', 'expense'].includes(data.type)) {
      errors.push({
        field: 'type',
        message: 'Tipo da categoria deve ser "income" ou "expense"',
        code: 'INVALID_TYPE'
      });
    }

    // Validar cor
    if (!data.color || !/^#[0-9A-F]{6}$/i.test(data.color)) {
      errors.push({
        field: 'color',
        message: 'Cor deve ser um código hexadecimal válido (ex: #FF0000)',
        code: 'INVALID_COLOR'
      });
    }

    // Validar descrição (opcional)
    if (data.description && data.description.trim().length > 255) {
      errors.push({
        field: 'description',
        message: 'Descrição deve ter no máximo 255 caracteres',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida dados de conta bancária
   */
  static validateBankAccount(data: BankAccountFormData): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar nome
    if (!data.name || data.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Nome da conta é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    } else if (data.name.trim().length > 100) {
      errors.push({
        field: 'name',
        message: 'Nome da conta deve ter no máximo 100 caracteres',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Validar banco
    if (!data.bank || data.bank.trim().length === 0) {
      errors.push({
        field: 'bank',
        message: 'Nome do banco é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    } else if (data.bank.trim().length > 100) {
      errors.push({
        field: 'bank',
        message: 'Nome do banco deve ter no máximo 100 caracteres',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Validar número da conta
    if (!data.accountNumber || !FinancialValidator.validateAccountNumber(data.accountNumber)) {
      errors.push({
        field: 'accountNumber',
        message: 'Número da conta deve ter entre 4 e 20 dígitos',
        code: 'INVALID_ACCOUNT_NUMBER'
      });
    }

    // Validar agência
    if (!data.agency || !FinancialValidator.validateAgency(data.agency)) {
      errors.push({
        field: 'agency',
        message: 'Agência deve ter entre 3 e 6 dígitos',
        code: 'INVALID_AGENCY'
      });
    }

    // Validar tipo da conta
    if (!data.accountType || !['checking', 'savings', 'investment'].includes(data.accountType)) {
      errors.push({
        field: 'accountType',
        message: 'Tipo da conta deve ser "checking", "savings" ou "investment"',
        code: 'INVALID_ACCOUNT_TYPE'
      });
    }

    // Validar saldo inicial
    if (data.balance === undefined || data.balance === null || !Number.isFinite(data.balance)) {
      errors.push({
        field: 'balance',
        message: 'Saldo inicial é obrigatório e deve ser um número válido',
        code: 'INVALID_BALANCE'
      });
    }

    // Validar descrição (opcional)
    if (data.description && data.description.trim().length > 255) {
      errors.push({
        field: 'description',
        message: 'Descrição deve ter no máximo 255 caracteres',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida dados de forma de pagamento
   */
  static validatePaymentMethod(data: PaymentMethodFormData): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar nome
    if (!data.name || data.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Nome da forma de pagamento é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    } else if (data.name.trim().length > 100) {
      errors.push({
        field: 'name',
        message: 'Nome da forma de pagamento deve ter no máximo 100 caracteres',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Validar tipo
    const validTypes = ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'check', 'other'];
    if (!data.type || !validTypes.includes(data.type)) {
      errors.push({
        field: 'type',
        message: `Tipo deve ser um dos seguintes: ${validTypes.join(', ')}`,
        code: 'INVALID_TYPE'
      });
    }

    // Validar descrição (opcional)
    if (data.description && data.description.trim().length > 255) {
      errors.push({
        field: 'description',
        message: 'Descrição deve ter no máximo 255 caracteres',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Utilitários para formatação e mensagens de erro
 */
export class ValidationUtils {
  
  /**
   * Formata CPF
   */
  static formatCpf(cpf: string): string {
    const cleanCpf = cpf.replace(/\D/g, '');
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata CNPJ
   */
  static formatCnpj(cnpj: string): string {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formata telefone
   */
  static formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }

  /**
   * Formata valor monetário
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }

  /**
   * Obtém mensagem de erro amigável
   */
  static getErrorMessage(error: ValidationError): string {
    const messages: Record<string, string> = {
      'REQUIRED_FIELD': 'Este campo é obrigatório',
      'INVALID_AMOUNT': 'Valor inválido',
      'INVALID_DATE': 'Data inválida',
      'INVALID_EMAIL': 'Email inválido',
      'INVALID_PHONE': 'Telefone inválido',
      'INVALID_CPF_CNPJ': 'CPF/CNPJ inválido',
      'MAX_LENGTH_EXCEEDED': 'Texto muito longo',
      'INVALID_COLOR': 'Cor inválida',
      'INVALID_TYPE': 'Tipo inválido',
      'INVALID_ACCOUNT_NUMBER': 'Número da conta inválido',
      'INVALID_AGENCY': 'Agência inválida',
      'INVALID_BALANCE': 'Saldo inválido',
      'INVALID_TAGS': 'Tags inválidas',
      'INVALID_INVOICE_NUMBER': 'Número da nota fiscal inválido',
      'INVALID_VALUE': 'Valor inválido'
    };

    return messages[error.code] || error.message;
  }
}