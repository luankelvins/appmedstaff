/**
 * Serviço de Despesas/Financeiro
 * 
 * Gerencia todas as operações relacionadas às despesas,
 * incluindo CRUD completo, aprovações, relatórios e estatísticas.
 */

import { httpClient, type ApiResponse } from './httpClient'
import { API_ENDPOINTS, buildQueryString, type PaginationParams, type SearchParams } from '../config/api'

// ==================== INTERFACES ====================

interface Expense {
  id: string
  descricao: string
  valor: number
  data_vencimento: Date
  data_pagamento?: Date
  categoria_id: string
  metodo_pagamento_id?: string
  conta_bancaria_id?: string
  funcionario_id?: string
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'paga' | 'vencida'
  tipo: 'fixa' | 'variavel' | 'extraordinaria'
  recorrente: boolean
  frequencia_recorrencia?: 'mensal' | 'trimestral' | 'semestral' | 'anual'
  observacoes?: string
  comprovante_url?: string
  aprovado_por?: string
  data_aprovacao?: Date
  motivo_rejeicao?: string
  tags?: string[]
  dados_extras?: any // JSONB
  created_at: Date
  updated_at: Date
}

interface FinancialCategory {
  id: string
  nome: string
  descricao?: string
  cor: string
  ativa: boolean
  created_at: Date
  updated_at: Date
}

interface PaymentMethod {
  id: string
  nome: string
  tipo: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'transferencia' | 'pix' | 'boleto' | 'cheque'
  ativo: boolean
  created_at: Date
  updated_at: Date
}

interface BankAccount {
  id: string
  nome: string
  banco: string
  agencia: string
  conta: string
  tipo: 'corrente' | 'poupanca' | 'investimento'
  saldo_atual: number
  ativa: boolean
  created_at: Date
  updated_at: Date
}

interface ExpenseFilters {
  status?: 'pendente' | 'aprovada' | 'rejeitada' | 'paga' | 'vencida'
  tipo?: 'fixa' | 'variavel' | 'extraordinaria'
  categoria_id?: string
  funcionario_id?: string
  metodo_pagamento_id?: string
  conta_bancaria_id?: string
  data_vencimento_inicio?: string
  data_vencimento_fim?: string
  data_pagamento_inicio?: string
  data_pagamento_fim?: string
  valor_min?: number
  valor_max?: number
  recorrente?: boolean
  vencidas?: boolean
  vencendo_em?: number // dias
  tags?: string[]
}

interface ExpenseSearchParams extends SearchParams {
  filters?: ExpenseFilters
}

interface ExpenseStats {
  total_despesas: number
  total_valor: number
  total_pagas: number
  total_pendentes: number
  total_vencidas: number
  valor_pago: number
  valor_pendente: number
  valor_vencido: number
  por_categoria: Record<string, { quantidade: number; valor: number }>
  por_status: Record<string, number>
  por_tipo: Record<string, number>
  media_mensal: number
  projecao_mensal: number
  economia_mes_anterior: number
}

interface ExpenseCreateRequest {
  descricao: string
  valor: number
  data_vencimento: Date
  categoria_id: string
  metodo_pagamento_id?: string
  conta_bancaria_id?: string
  funcionario_id?: string
  tipo: 'fixa' | 'variavel' | 'extraordinaria'
  recorrente?: boolean
  frequencia_recorrencia?: 'mensal' | 'trimestral' | 'semestral' | 'anual'
  observacoes?: string
  comprovante_url?: string
  tags?: string[]
  dados_extras?: any
}

interface ExpenseUpdateRequest {
  descricao?: string
  valor?: number
  data_vencimento?: Date
  categoria_id?: string
  metodo_pagamento_id?: string
  conta_bancaria_id?: string
  funcionario_id?: string
  tipo?: 'fixa' | 'variavel' | 'extraordinaria'
  recorrente?: boolean
  frequencia_recorrencia?: 'mensal' | 'trimestral' | 'semestral' | 'anual'
  observacoes?: string
  comprovante_url?: string
  tags?: string[]
  dados_extras?: any
}

interface ExpenseApprovalRequest {
  aprovado: boolean
  observacoes?: string
  motivo_rejeicao?: string
}

interface ExpensePaymentRequest {
  data_pagamento: Date
  metodo_pagamento_id: string
  conta_bancaria_id: string
  valor_pago?: number
  observacoes?: string
  comprovante_url?: string
}

interface FinancialReport {
  periodo: string
  total_receitas: number
  total_despesas: number
  saldo: number
  despesas_por_categoria: Record<string, number>
  despesas_por_mes: Record<string, number>
  comparativo_mes_anterior: {
    receitas: number
    despesas: number
    variacao_percentual: number
  }
}

// ==================== CLASSE DO SERVIÇO ====================

class ExpensesService {
  
  // ==================== OPERAÇÕES CRUD ====================

  /**
   * Lista despesas com paginação e filtros
   */
  async getExpenses(params?: ExpenseSearchParams): Promise<ApiResponse<Expense[]>> {
    try {
      const queryString = params ? buildQueryString(params) : ''
      const endpoint = `${API_ENDPOINTS.EXPENSES.LIST}${queryString}`
      
      return await httpClient.get<Expense[]>(endpoint)
    } catch (error) {
      console.error('Erro ao buscar despesas:', error)
      throw error
    }
  }

  /**
   * Obtém despesa por ID
   */
  async getExpenseById(id: string): Promise<ApiResponse<Expense>> {
    try {
      return await httpClient.get<Expense>(API_ENDPOINTS.EXPENSES.GET_BY_ID(id))
    } catch (error) {
      console.error(`Erro ao buscar despesa ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria nova despesa
   */
  async createExpense(expenseData: ExpenseCreateRequest): Promise<ApiResponse<Expense>> {
    try {
      return await httpClient.post<Expense>(
        API_ENDPOINTS.EXPENSES.CREATE,
        expenseData
      )
    } catch (error) {
      console.error('Erro ao criar despesa:', error)
      throw error
    }
  }

  /**
   * Atualiza despesa existente
   */
  async updateExpense(id: string, expenseData: ExpenseUpdateRequest): Promise<ApiResponse<Expense>> {
    try {
      return await httpClient.put<Expense>(
        API_ENDPOINTS.EXPENSES.UPDATE(id),
        expenseData
      )
    } catch (error) {
      console.error(`Erro ao atualizar despesa ${id}:`, error)
      throw error
    }
  }

  /**
   * Remove despesa
   */
  async deleteExpense(id: string): Promise<ApiResponse> {
    try {
      return await httpClient.delete(API_ENDPOINTS.EXPENSES.DELETE(id))
    } catch (error) {
      console.error(`Erro ao remover despesa ${id}:`, error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE APROVAÇÃO ====================



  /**
   * Marca despesa como paga
   */
  async markAsPaid(id: string, paymentData: ExpensePaymentRequest): Promise<ApiResponse<Expense>> {
    try {
      return await httpClient.patch<Expense>(
        `/expenses/${id}/pay`,
        paymentData
      )
    } catch (error) {
      console.error(`Erro ao marcar despesa ${id} como paga:`, error)
      throw error
    }
  }

  /**
   * Cancela despesa
   */
  async cancelExpense(id: string, observacoes?: string): Promise<ApiResponse<Expense>> {
    try {
      return await httpClient.patch<Expense>(
        `/expenses/${id}/cancel`,
        { observacoes }
      )
    } catch (error) {
      console.error(`Erro ao cancelar despesa ${id}:`, error)
      throw error
    }
  }

  /**
   * Adiciona anexo à despesa
   */
  async addAttachment(id: string, file: File, descricao?: string): Promise<ApiResponse<Expense>> {
    try {
      return await httpClient.uploadFile<Expense>(
        `/expenses/${id}/anexos`,
        file,
        { descricao }
      )
    } catch (error) {
      console.error(`Erro ao adicionar anexo à despesa ${id}:`, error)
      throw error
    }
  }

  /**
   * Remove anexo da despesa
   */
  async removeAttachment(id: string, anexoId: string): Promise<ApiResponse> {
    try {
      return await httpClient.delete(`/expenses/${id}/anexos/${anexoId}`)
    } catch (error) {
      console.error(`Erro ao remover anexo ${anexoId} da despesa ${id}:`, error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE FILTRO ====================

  /**
   * Obtém despesas por status
   */
  async getExpensesByStatus(
    status: 'pendente' | 'aprovada' | 'rejeitada' | 'paga' | 'vencida',
    params?: PaginationParams
  ): Promise<ApiResponse<Expense[]>> {
    try {
      const filters: ExpenseFilters = { status }
      const searchParams: ExpenseSearchParams = { filters, ...params }
      
      return await this.getExpenses(searchParams)
    } catch (error) {
      console.error(`Erro ao buscar despesas por status ${status}:`, error)
      throw error
    }
  }

  /**
   * Obtém despesas vencidas
   */
  async getOverdueExpenses(params?: PaginationParams): Promise<ApiResponse<Expense[]>> {
    try {
      const queryString = params ? buildQueryString(params) : ''
      const endpoint = `${API_ENDPOINTS.EXPENSES.OVERDUE}${queryString}`
      
      return await httpClient.get<Expense[]>(endpoint)
    } catch (error) {
      console.error('Erro ao buscar despesas vencidas:', error)
      throw error
    }
  }

  /**
   * Obtém despesas que vencem em breve
   */
  async getDueSoonExpenses(days: number = 7, params?: PaginationParams): Promise<ApiResponse<Expense[]>> {
    try {
      const queryString = params ? buildQueryString({ ...params, days }) : `?days=${days}`
      const endpoint = `${API_ENDPOINTS.EXPENSES.DUE_SOON}${queryString}`
      
      return await httpClient.get<Expense[]>(endpoint)
    } catch (error) {
      console.error('Erro ao buscar despesas que vencem em breve:', error)
      throw error
    }
  }

  /**
   * Filtra despesas por categoria
   */
  async getExpensesByCategory(categoryId: string, params?: PaginationParams): Promise<ApiResponse<Expense[]>> {
    try {
      const filters: ExpenseFilters = { categoria_id: categoryId }
      const searchParams: ExpenseSearchParams = { filters, ...params }
      
      return await this.getExpenses(searchParams)
    } catch (error) {
      console.error(`Erro ao buscar despesas por categoria ${categoryId}:`, error)
      throw error
    }
  }

  /**
   * Filtra despesas por funcionário
   */
  async getExpensesByEmployee(employeeId: string, params?: PaginationParams): Promise<ApiResponse<Expense[]>> {
    try {
      const filters: ExpenseFilters = { funcionario_id: employeeId }
      const searchParams: ExpenseSearchParams = { filters, ...params }
      
      return await this.getExpenses(searchParams)
    } catch (error) {
      console.error(`Erro ao buscar despesas por funcionário ${employeeId}:`, error)
      throw error
    }
  }

  /**
   * Filtra despesas por período
   */
  async getExpensesByPeriod(
    startDate: string, 
    endDate: string, 
    params?: PaginationParams
  ): Promise<ApiResponse<Expense[]>> {
    try {
      const filters: ExpenseFilters = { 
        data_vencimento_inicio: startDate,
        data_vencimento_fim: endDate
      }
      const searchParams: ExpenseSearchParams = { filters, ...params }
      
      return await this.getExpenses(searchParams)
    } catch (error) {
      console.error('Erro ao buscar despesas por período:', error)
      throw error
    }
  }

  /**
   * Filtra despesas recorrentes
   */
  async getRecurringExpenses(params?: PaginationParams): Promise<ApiResponse<Expense[]>> {
    try {
      const filters: ExpenseFilters = { recorrente: true }
      const searchParams: ExpenseSearchParams = { filters, ...params }
      
      return await this.getExpenses(searchParams)
    } catch (error) {
      console.error('Erro ao buscar despesas recorrentes:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE BUSCA ====================

  /**
   * Busca despesas por termo
   */
  async searchExpenses(query: string, params?: PaginationParams): Promise<ApiResponse<Expense[]>> {
    try {
      const searchParams = { q: query, ...params }
      const queryString = buildQueryString(searchParams)
      const endpoint = `${API_ENDPOINTS.EXPENSES.LIST}${queryString}`
      
      return await httpClient.get<Expense[]>(endpoint)
    } catch (error) {
      console.error('Erro ao buscar despesas:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE ESTATÍSTICAS ====================

  /**
   * Obtém estatísticas das despesas
   */
  async getExpenseStats(period?: string): Promise<ApiResponse<ExpenseStats>> {
    try {
      const endpoint = period 
        ? `/expenses/stats?period=${period}`
        : '/expenses/stats'
      
      return await httpClient.get<ExpenseStats>(endpoint)
    } catch (error) {
      console.error('Erro ao obter estatísticas das despesas:', error)
      throw error
    }
  }

  /**
   * Obtém total de despesas por período
   */
  async getTotalByPeriod(period: string): Promise<ApiResponse<{ total: number }>> {
    try {
      return await httpClient.get<{ total: number }>(
        API_ENDPOINTS.EXPENSES.TOTAL_BY_PERIOD(period)
      )
    } catch (error) {
      console.error(`Erro ao obter total por período ${period}:`, error)
      throw error
    }
  }

  /**
   * Obtém relatório financeiro
   */
  async getFinancialReport(
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<FinancialReport>> {
    try {
      const queryString = buildQueryString({ start_date: startDate, end_date: endDate })
      const endpoint = `/expenses/report${queryString}`
      
      return await httpClient.get<FinancialReport>(endpoint)
    } catch (error) {
      console.error('Erro ao obter relatório financeiro:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE CATEGORIAS ====================

  /**
   * Lista categorias financeiras
   */
  async getCategories(): Promise<ApiResponse<FinancialCategory[]>> {
    try {
      return await httpClient.get<FinancialCategory[]>('/financial-categories')
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      throw error
    }
  }

  /**
   * Cria nova categoria
   */
  async createCategory(categoryData: Omit<FinancialCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<FinancialCategory>> {
    try {
      return await httpClient.post<FinancialCategory>('/financial-categories', categoryData)
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE MÉTODOS DE PAGAMENTO ====================

  /**
   * Lista métodos de pagamento
   */
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    try {
      return await httpClient.get<PaymentMethod[]>('/payment-methods')
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error)
      throw error
    }
  }

  /**
   * Cria novo método de pagamento
   */
  async createPaymentMethod(methodData: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<PaymentMethod>> {
    try {
      return await httpClient.post<PaymentMethod>('/payment-methods', methodData)
    } catch (error) {
      console.error('Erro ao criar método de pagamento:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE CONTAS BANCÁRIAS ====================

  /**
   * Lista contas bancárias
   */
  async getBankAccounts(): Promise<ApiResponse<BankAccount[]>> {
    try {
      return await httpClient.get<BankAccount[]>('/bank-accounts')
    } catch (error) {
      console.error('Erro ao buscar contas bancárias:', error)
      throw error
    }
  }

  /**
   * Cria nova conta bancária
   */
  async createBankAccount(accountData: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<BankAccount>> {
    try {
      return await httpClient.post<BankAccount>('/bank-accounts', accountData)
    } catch (error) {
      console.error('Erro ao criar conta bancária:', error)
      throw error
    }
  }

  /**
   * Atualiza saldo da conta bancária
   */
  async updateAccountBalance(accountId: string, newBalance: number): Promise<ApiResponse<BankAccount>> {
    try {
      return await httpClient.patch<BankAccount>(
        `/bank-accounts/${accountId}/balance`,
        { saldo_atual: newBalance }
      )
    } catch (error) {
      console.error(`Erro ao atualizar saldo da conta ${accountId}:`, error)
      throw error
    }
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Formata despesa para exibição
   */
  formatExpenseForDisplay(expense: Expense): {
    id: string
    descricao: string
    valor: string
    valorNumerico: number
    data_vencimento: string
    data_pagamento?: string
    status: string
    statusLabel: string
    statusColor: string
    tipo: string
    tipoLabel: string
    isOverdue: boolean
    isDueSoon: boolean
    daysUntilDue: number
    recorrente: boolean
    tags?: string[]
  } {
    const now = new Date()
    const dueDate = new Date(expense.data_vencimento)
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      id: expense.id,
      descricao: expense.descricao,
      valor: this.formatCurrency(expense.valor),
      valorNumerico: expense.valor,
      data_vencimento: this.formatDate(expense.data_vencimento),
      data_pagamento: expense.data_pagamento ? this.formatDate(expense.data_pagamento) : undefined,
      status: expense.status,
      statusLabel: this.getStatusLabel(expense.status),
      statusColor: this.getStatusColor(expense.status),
      tipo: expense.tipo,
      tipoLabel: this.getTypeLabel(expense.tipo),
      isOverdue: diffDays < 0 && expense.status !== 'paga',
      isDueSoon: diffDays <= 7 && diffDays >= 0 && expense.status !== 'paga',
      daysUntilDue: diffDays,
      recorrente: expense.recorrente,
      tags: expense.tags
    }
  }

  /**
   * Obtém label do status
   */
  private getStatusLabel(status: string): string {
    const statusLabels = {
      pendente: 'Pendente',
      aprovada: 'Aprovada',
      rejeitada: 'Rejeitada',
      paga: 'Paga',
      vencida: 'Vencida'
    }
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  /**
   * Obtém cor do status
   */
  private getStatusColor(status: string): string {
    const statusColors = {
      pendente: '#F59E0B',    // yellow
      aprovada: '#10B981',    // green
      rejeitada: '#EF4444',   // red
      paga: '#059669',        // emerald
      vencida: '#DC2626'      // red-600
    }
    return statusColors[status as keyof typeof statusColors] || '#6B7280'
  }

  /**
   * Obtém label do tipo
   */
  private getTypeLabel(tipo: string): string {
    const typeLabels = {
      fixa: 'Fixa',
      variavel: 'Variável',
      extraordinaria: 'Extraordinária'
    }
    return typeLabels[tipo as keyof typeof typeLabels] || tipo
  }

  /**
   * Formata valor monetário
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  /**
   * Formata data
   */
  private formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  /**
   * Valida dados da despesa
   */
  validateExpenseData(expenseData: ExpenseCreateRequest | ExpenseUpdateRequest): {
    isValid: boolean
    errors: Record<string, string[]>
  } {
    const errors: Record<string, string[]> = {}

    // Validação de descrição
    if ('descricao' in expenseData && (!expenseData.descricao || expenseData.descricao.trim().length < 3)) {
      errors.descricao = ['Descrição deve ter pelo menos 3 caracteres']
    }

    // Validação de valor
    if ('valor' in expenseData && (expenseData.valor === undefined || expenseData.valor <= 0)) {
      errors.valor = ['Valor deve ser maior que zero']
    }

    // Validação de data de vencimento
    if ('data_vencimento' in expenseData && expenseData.data_vencimento) {
      const dueDate = new Date(expenseData.data_vencimento)
      if (isNaN(dueDate.getTime())) {
        errors.data_vencimento = ['Data de vencimento deve ser válida']
      }
    }

    // Validação de categoria
    if ('categoria_id' in expenseData && (!expenseData.categoria_id || expenseData.categoria_id.trim().length === 0)) {
      errors.categoria_id = ['Categoria é obrigatória']
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

// ==================== EXPORTAÇÃO ====================

export const expensesService = new ExpensesService()
export default expensesService

// Exportar tipos para uso em outros arquivos
export type {
  Expense,
  FinancialCategory,
  PaymentMethod,
  BankAccount,
  ExpenseFilters,
  ExpenseSearchParams,
  ExpenseStats,
  ExpenseCreateRequest,
  ExpenseUpdateRequest,
  ExpenseApprovalRequest,
  ExpensePaymentRequest,
  FinancialReport
}