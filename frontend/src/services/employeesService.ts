/**
 * Serviço de Funcionários
 * 
 * Gerencia todas as operações relacionadas aos funcionários,
 * incluindo CRUD completo, busca, filtros e estatísticas.
 */

import { httpClient, type ApiResponse } from './httpClient'
import { API_ENDPOINTS, buildQueryString, type PaginationParams, type SearchParams } from '../config/api'
import type { 
  Employee, 
  EmployeeInsert, 
  EmployeeUpdate 
} from '../types/database'

// ==================== INTERFACES ====================

interface EmployeeFilters {
  status?: 'ativo' | 'inativo' | 'suspenso'
  departamento?: string
  cargo?: string
  dataAdmissaoInicio?: string
  dataAdmissaoFim?: string
  salarioMin?: number
  salarioMax?: number
}

interface EmployeeSearchParams extends SearchParams {
  filters?: EmployeeFilters
}

interface EmployeeStats {
  total: number
  ativos: number
  inativos: number
  suspensos: number
  porDepartamento: Record<string, number>
  porCargo: Record<string, number>
  admissoesUltimoMes: number
  demissoesUltimoMes: number
}

interface EmployeeCreateRequest extends Omit<EmployeeInsert, 'id'> {
  senha?: string
  confirmarSenha?: string
}

interface EmployeeUpdateRequest extends EmployeeUpdate {
  // Campos específicos para atualização
}

interface EmployeeStatusUpdate {
  status: 'ativo' | 'inativo' | 'suspenso'
  motivo?: string
  observacoes?: string
}

// ==================== CLASSE DO SERVIÇO ====================

class EmployeesService {
  
  // ==================== OPERAÇÕES CRUD ====================

  /**
   * Lista funcionários com paginação e filtros
   */
  async getEmployees(params?: EmployeeSearchParams): Promise<ApiResponse<Employee[]>> {
    try {
      const queryString = params ? buildQueryString(params) : ''
      const endpoint = `${API_ENDPOINTS.EMPLOYEES.LIST}${queryString}`
      
      return await httpClient.get<Employee[]>(endpoint)
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error)
      throw error
    }
  }

  /**
   * Obtém funcionário por ID
   */
  async getEmployeeById(id: string): Promise<ApiResponse<Employee>> {
    try {
      return await httpClient.get<Employee>(API_ENDPOINTS.EMPLOYEES.GET_BY_ID(id))
    } catch (error) {
      console.error(`Erro ao buscar funcionário ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria novo funcionário
   */
  async createEmployee(employeeData: EmployeeCreateRequest): Promise<ApiResponse<Employee>> {
    try {
      return await httpClient.post<Employee>(
        API_ENDPOINTS.EMPLOYEES.CREATE,
        employeeData
      )
    } catch (error) {
      console.error('Erro ao criar funcionário:', error)
      throw error
    }
  }

  /**
   * Atualiza funcionário existente
   */
  async updateEmployee(id: string, employeeData: EmployeeUpdateRequest): Promise<ApiResponse<Employee>> {
    try {
      return await httpClient.put<Employee>(
        API_ENDPOINTS.EMPLOYEES.UPDATE(id),
        employeeData
      )
    } catch (error) {
      console.error(`Erro ao atualizar funcionário ${id}:`, error)
      throw error
    }
  }

  /**
   * Remove funcionário
   */
  async deleteEmployee(id: string): Promise<ApiResponse> {
    try {
      return await httpClient.delete(API_ENDPOINTS.EMPLOYEES.DELETE(id))
    } catch (error) {
      console.error(`Erro ao remover funcionário ${id}:`, error)
      throw error
    }
  }

  // ==================== OPERAÇÕES ESPECÍFICAS ====================

  /**
   * Atualiza status do funcionário
   */
  async updateEmployeeStatus(id: string, statusData: EmployeeStatusUpdate): Promise<ApiResponse<Employee>> {
    try {
      return await httpClient.patch<Employee>(
        API_ENDPOINTS.EMPLOYEES.UPDATE_STATUS(id),
        statusData
      )
    } catch (error) {
      console.error(`Erro ao atualizar status do funcionário ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca funcionários por termo
   */
  async searchEmployees(query: string, params?: PaginationParams): Promise<ApiResponse<Employee[]>> {
    try {
      const searchParams = { q: query, ...params }
      const queryString = buildQueryString(searchParams)
      const endpoint = `${API_ENDPOINTS.EMPLOYEES.SEARCH}${queryString}`
      
      return await httpClient.get<Employee[]>(endpoint)
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error)
      throw error
    }
  }

  /**
   * Obtém estatísticas dos funcionários
   */
  async getEmployeeStats(): Promise<ApiResponse<EmployeeStats>> {
    try {
      return await httpClient.get<EmployeeStats>(API_ENDPOINTS.EMPLOYEES.STATS)
    } catch (error) {
      console.error('Erro ao obter estatísticas dos funcionários:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE FILTRO ====================

  /**
   * Filtra funcionários por status
   */
  async getEmployeesByStatus(status: 'ativo' | 'inativo' | 'suspenso', params?: PaginationParams): Promise<ApiResponse<Employee[]>> {
    try {
      const filters: EmployeeFilters = { status }
      const searchParams: EmployeeSearchParams = { filters, ...params }
      
      return await this.getEmployees(searchParams)
    } catch (error) {
      console.error(`Erro ao buscar funcionários por status ${status}:`, error)
      throw error
    }
  }

  /**
   * Filtra funcionários por departamento
   */
  async getEmployeesByDepartment(departamento: string, params?: PaginationParams): Promise<ApiResponse<Employee[]>> {
    try {
      const filters: EmployeeFilters = { departamento }
      const searchParams: EmployeeSearchParams = { filters, ...params }
      
      return await this.getEmployees(searchParams)
    } catch (error) {
      console.error(`Erro ao buscar funcionários por departamento ${departamento}:`, error)
      throw error
    }
  }

  /**
   * Filtra funcionários por cargo
   */
  async getEmployeesByCargo(cargo: string, params?: PaginationParams): Promise<ApiResponse<Employee[]>> {
    try {
      const filters: EmployeeFilters = { cargo }
      const searchParams: EmployeeSearchParams = { filters, ...params }
      
      return await this.getEmployees(searchParams)
    } catch (error) {
      console.error(`Erro ao buscar funcionários por cargo ${cargo}:`, error)
      throw error
    }
  }

  /**
   * Filtra funcionários por faixa salarial
   */
  async getEmployeesBySalaryRange(salarioMin?: number, salarioMax?: number, params?: PaginationParams): Promise<ApiResponse<Employee[]>> {
    try {
      const filters: EmployeeFilters = { salarioMin, salarioMax }
      const searchParams: EmployeeSearchParams = { filters, ...params }
      
      return await this.getEmployees(searchParams)
    } catch (error) {
      console.error('Erro ao buscar funcionários por faixa salarial:', error)
      throw error
    }
  }

  /**
   * Filtra funcionários por período de admissão
   */
  async getEmployeesByAdmissionPeriod(
    dataInicio: string, 
    dataFim: string, 
    params?: PaginationParams
  ): Promise<ApiResponse<Employee[]>> {
    try {
      const filters: EmployeeFilters = { 
        dataAdmissaoInicio: dataInicio, 
        dataAdmissaoFim: dataFim 
      }
      const searchParams: EmployeeSearchParams = { filters, ...params }
      
      return await this.getEmployees(searchParams)
    } catch (error) {
      console.error('Erro ao buscar funcionários por período de admissão:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE DADOS ESPECÍFICOS ====================

  /**
   * Atualiza dados profissionais do funcionário
   */
  async updateProfessionalData(id: string, dadosProfissionais: any): Promise<ApiResponse<Employee>> {
    try {
      return await this.updateEmployee(id, { dados_profissionais: dadosProfissionais })
    } catch (error) {
      console.error(`Erro ao atualizar dados profissionais do funcionário ${id}:`, error)
      throw error
    }
  }

  /**
   * Atualiza dados financeiros do funcionário
   */
  async updateFinancialData(id: string, dadosFinanceiros: any): Promise<ApiResponse<Employee>> {
    try {
      return await this.updateEmployee(id, { dados_financeiros: dadosFinanceiros })
    } catch (error) {
      console.error(`Erro ao atualizar dados financeiros do funcionário ${id}:`, error)
      throw error
    }
  }

  /**
   * Atualiza endereço do funcionário
   */
  async updateAddress(id: string, endereco: any): Promise<ApiResponse<Employee>> {
    try {
      return await this.updateEmployee(id, { endereco })
    } catch (error) {
      console.error(`Erro ao atualizar endereço do funcionário ${id}:`, error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE VALIDAÇÃO ====================

  /**
   * Valida CPF único
   */
  async validateCpf(cpf: string, excludeId?: string): Promise<ApiResponse<{ isValid: boolean; message?: string }>> {
    try {
      const params = { cpf, excludeId }
      const queryString = buildQueryString(params)
      const endpoint = `/employees/validate-cpf${queryString}`
      
      return await httpClient.get<{ isValid: boolean; message?: string }>(endpoint)
    } catch (error) {
      console.error('Erro ao validar CPF:', error)
      throw error
    }
  }

  /**
   * Valida email único
   */
  async validateEmail(email: string, excludeId?: string): Promise<ApiResponse<{ isValid: boolean; message?: string }>> {
    try {
      const params = { email, excludeId }
      const queryString = buildQueryString(params)
      const endpoint = `/employees/validate-email${queryString}`
      
      return await httpClient.get<{ isValid: boolean; message?: string }>(endpoint)
    } catch (error) {
      console.error('Erro ao validar email:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE RELATÓRIO ====================

  /**
   * Exporta lista de funcionários
   */
  async exportEmployees(
    format: 'csv' | 'excel' | 'pdf' = 'excel',
    filters?: EmployeeFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      const params = { format, ...filters }
      const queryString = buildQueryString(params)
      const endpoint = `/employees/export${queryString}`
      
      return await httpClient.get<{ downloadUrl: string }>(endpoint)
    } catch (error) {
      console.error('Erro ao exportar funcionários:', error)
      throw error
    }
  }

  /**
   * Gera relatório de funcionários
   */
  async generateReport(
    reportType: 'summary' | 'detailed' | 'custom',
    params?: any
  ): Promise<ApiResponse<{ reportUrl: string }>> {
    try {
      const requestData = { reportType, ...params }
      
      return await httpClient.post<{ reportUrl: string }>(
        '/employees/generate-report',
        requestData
      )
    } catch (error) {
      console.error('Erro ao gerar relatório de funcionários:', error)
      throw error
    }
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Formata dados do funcionário para exibição
   */
  formatEmployeeForDisplay(employee: Employee): {
    id: string
    nome: string
    email: string
    cpf: string
    status: string
    statusLabel: string
    telefone?: string
    departamento?: string
    cargo?: string
  } {
    return {
      id: employee.id,
      nome: employee.nome,
      email: employee.email,
      cpf: employee.cpf,
      status: employee.status,
      statusLabel: this.getStatusLabel(employee.status),
      telefone: employee.telefone,
      departamento: employee.dados_profissionais?.departamento,
      cargo: employee.dados_profissionais?.cargo
    }
  }

  /**
   * Obtém label do status
   */
  private getStatusLabel(status: string): string {
    const statusLabels = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      suspenso: 'Suspenso'
    }
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  /**
   * Valida dados do funcionário
   */
  validateEmployeeData(employeeData: EmployeeCreateRequest | EmployeeUpdateRequest): {
    isValid: boolean
    errors: Record<string, string[]>
  } {
    const errors: Record<string, string[]> = {}

    // Validação de nome
    if ('nome' in employeeData && (!employeeData.nome || employeeData.nome.trim().length < 2)) {
      errors.nome = ['Nome deve ter pelo menos 2 caracteres']
    }

    // Validação de email
    if ('email' in employeeData && employeeData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(employeeData.email)) {
        errors.email = ['Email deve ter um formato válido']
      }
    }

    // Validação de CPF
    if ('cpf' in employeeData && employeeData.cpf) {
      if (!this.isValidCpf(employeeData.cpf)) {
        errors.cpf = ['CPF deve ter um formato válido']
      }
    }

    // Validação de telefone
    if ('telefone' in employeeData && employeeData.telefone) {
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
      if (!phoneRegex.test(employeeData.telefone)) {
        errors.telefone = ['Telefone deve ter o formato (XX) XXXXX-XXXX']
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Valida CPF
   */
  private isValidCpf(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cleanCpf = cpf.replace(/\D/g, '')
    
    // Verifica se tem 11 dígitos
    if (cleanCpf.length !== 11) return false
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false
    
    // Validação dos dígitos verificadores
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCpf.charAt(9))) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCpf.charAt(10))) return false
    
    return true
  }
}

// ==================== EXPORTAÇÃO ====================

export const employeesService = new EmployeesService()
export default employeesService

// Exportar tipos para uso em outros arquivos
export type {
  EmployeeFilters,
  EmployeeSearchParams,
  EmployeeStats,
  EmployeeCreateRequest,
  EmployeeUpdateRequest,
  EmployeeStatusUpdate
}