/**
 * Serviço de Leads
 * 
 * Gerencia todas as operações relacionadas aos leads,
 * incluindo CRUD completo, follow-up, conversões e estatísticas.
 */

import { httpClient, type ApiResponse } from './httpClient'
import { API_ENDPOINTS, buildQueryString, type PaginationParams, type SearchParams } from '../config/api'

// ==================== INTERFACES ====================

interface Lead {
  id: string
  nome: string
  email: string
  telefone?: string
  empresa?: string
  cargo?: string
  origem: 'website' | 'indicacao' | 'evento' | 'cold_call' | 'social_media' | 'outro'
  status: 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado' | 'perdido'
  responsavel_id?: string
  valor_estimado?: number
  probabilidade?: number
  data_contato?: Date
  data_follow_up?: Date
  observacoes?: string
  tags?: string[]
  dados_adicionais?: any // JSONB
  created_at: Date
  updated_at: Date
}

interface LeadFilters {
  status?: 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado' | 'perdido'
  origem?: 'website' | 'indicacao' | 'evento' | 'cold_call' | 'social_media' | 'outro'
  responsavel_id?: string
  data_contato_inicio?: string
  data_contato_fim?: string
  data_follow_up_inicio?: string
  data_follow_up_fim?: string
  valor_min?: number
  valor_max?: number
  probabilidade_min?: number
  probabilidade_max?: number
  tags?: string[]
  sem_follow_up?: boolean
  follow_up_vencido?: boolean
}

interface LeadSearchParams extends SearchParams {
  filters?: LeadFilters
}

interface LeadStats {
  total: number
  novos: number
  contatados: number
  qualificados: number
  em_proposta: number
  em_negociacao: number
  fechados: number
  perdidos: number
  por_origem: Record<string, number>
  por_responsavel: Record<string, number>
  valor_total_pipeline: number
  valor_medio_lead: number
  taxa_conversao: number
  tempo_medio_conversao: number
  follow_ups_pendentes: number
  follow_ups_vencidos: number
}

interface LeadCreateRequest {
  nome: string
  email: string
  telefone?: string
  empresa?: string
  cargo?: string
  origem: 'website' | 'indicacao' | 'evento' | 'cold_call' | 'social_media' | 'outro'
  responsavel_id?: string
  valor_estimado?: number
  probabilidade?: number
  data_follow_up?: Date
  observacoes?: string
  tags?: string[]
  dados_adicionais?: any
}

interface LeadUpdateRequest {
  nome?: string
  email?: string
  telefone?: string
  empresa?: string
  cargo?: string
  origem?: 'website' | 'indicacao' | 'evento' | 'cold_call' | 'social_media' | 'outro'
  responsavel_id?: string
  valor_estimado?: number
  probabilidade?: number
  data_follow_up?: Date
  observacoes?: string
  tags?: string[]
  dados_adicionais?: any
}

interface LeadStatusUpdate {
  status: 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado' | 'perdido'
  observacoes?: string
  data_contato?: Date
  valor_fechado?: number
  motivo_perda?: string
}

interface LeadFollowUp {
  id: string
  lead_id: string
  tipo: 'ligacao' | 'email' | 'reuniao' | 'whatsapp' | 'outro'
  descricao: string
  data_agendada: Date
  data_realizada?: Date
  status: 'agendado' | 'realizado' | 'cancelado'
  resultado?: string
  proxima_acao?: string
  created_at: Date
}

interface LeadFollowUpCreate {
  tipo: 'ligacao' | 'email' | 'reuniao' | 'whatsapp' | 'outro'
  descricao: string
  data_agendada: Date
  resultado?: string
  proxima_acao?: string
}

// ==================== CLASSE DO SERVIÇO ====================

class LeadsService {
  
  // ==================== OPERAÇÕES CRUD ====================

  /**
   * Lista leads com paginação e filtros
   */
  async getLeads(params?: LeadSearchParams): Promise<ApiResponse<Lead[]>> {
    try {
      const queryString = params ? buildQueryString(params) : ''
      const endpoint = `${API_ENDPOINTS.LEADS.LIST}${queryString}`
      
      return await httpClient.get<Lead[]>(endpoint)
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
      throw error
    }
  }

  /**
   * Obtém lead por ID
   */
  async getLeadById(id: string): Promise<ApiResponse<Lead>> {
    try {
      return await httpClient.get<Lead>(API_ENDPOINTS.LEADS.GET_BY_ID(id))
    } catch (error) {
      console.error(`Erro ao buscar lead ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria novo lead
   */
  async createLead(leadData: LeadCreateRequest): Promise<ApiResponse<Lead>> {
    try {
      return await httpClient.post<Lead>(
        API_ENDPOINTS.LEADS.CREATE,
        leadData
      )
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      throw error
    }
  }

  /**
   * Atualiza lead existente
   */
  async updateLead(id: string, leadData: LeadUpdateRequest): Promise<ApiResponse<Lead>> {
    try {
      return await httpClient.put<Lead>(
        API_ENDPOINTS.LEADS.UPDATE(id),
        leadData
      )
    } catch (error) {
      console.error(`Erro ao atualizar lead ${id}:`, error)
      throw error
    }
  }

  /**
   * Remove lead
   */
  async deleteLead(id: string): Promise<ApiResponse> {
    try {
      return await httpClient.delete(API_ENDPOINTS.LEADS.DELETE(id))
    } catch (error) {
      console.error(`Erro ao remover lead ${id}:`, error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE STATUS ====================

  /**
   * Atualiza status do lead
   */
  async updateLeadStatus(id: string, statusData: LeadStatusUpdate): Promise<ApiResponse<Lead>> {
    try {
      return await httpClient.patch<Lead>(
        API_ENDPOINTS.LEADS.UPDATE_STATUS(id),
        statusData
      )
    } catch (error) {
      console.error(`Erro ao atualizar status do lead ${id}:`, error)
      throw error
    }
  }

  /**
   * Marca lead como contatado
   */
  async markAsContacted(id: string, observacoes?: string): Promise<ApiResponse<Lead>> {
    try {
      return await this.updateLeadStatus(id, { 
        status: 'contatado', 
        observacoes,
        data_contato: new Date()
      })
    } catch (error) {
      console.error(`Erro ao marcar lead ${id} como contatado:`, error)
      throw error
    }
  }

  /**
   * Marca lead como qualificado
   */
  async markAsQualified(id: string, observacoes?: string): Promise<ApiResponse<Lead>> {
    try {
      return await this.updateLeadStatus(id, { 
        status: 'qualificado', 
        observacoes 
      })
    } catch (error) {
      console.error(`Erro ao marcar lead ${id} como qualificado:`, error)
      throw error
    }
  }

  /**
   * Marca lead como fechado
   */
  async markAsClosed(id: string, valorFechado: number, observacoes?: string): Promise<ApiResponse<Lead>> {
    try {
      return await this.updateLeadStatus(id, { 
        status: 'fechado', 
        observacoes,
        valor_fechado: valorFechado
      })
    } catch (error) {
      console.error(`Erro ao marcar lead ${id} como fechado:`, error)
      throw error
    }
  }

  /**
   * Marca lead como perdido
   */
  async markAsLost(id: string, motivoPerda: string, observacoes?: string): Promise<ApiResponse<Lead>> {
    try {
      return await this.updateLeadStatus(id, { 
        status: 'perdido', 
        observacoes,
        motivo_perda: motivoPerda
      })
    } catch (error) {
      console.error(`Erro ao marcar lead ${id} como perdido:`, error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE FILTRO ====================

  /**
   * Filtra leads por status
   */
  async getLeadsByStatus(
    status: 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado' | 'perdido', 
    params?: PaginationParams
  ): Promise<ApiResponse<Lead[]>> {
    try {
      const filters: LeadFilters = { status }
      const searchParams: LeadSearchParams = { filters, ...params }
      
      return await this.getLeads(searchParams)
    } catch (error) {
      console.error(`Erro ao buscar leads por status ${status}:`, error)
      throw error
    }
  }

  /**
   * Filtra leads por origem
   */
  async getLeadsByOrigin(
    origem: 'website' | 'indicacao' | 'evento' | 'cold_call' | 'social_media' | 'outro', 
    params?: PaginationParams
  ): Promise<ApiResponse<Lead[]>> {
    try {
      const filters: LeadFilters = { origem }
      const searchParams: LeadSearchParams = { filters, ...params }
      
      return await this.getLeads(searchParams)
    } catch (error) {
      console.error(`Erro ao buscar leads por origem ${origem}:`, error)
      throw error
    }
  }

  /**
   * Obtém leads por responsável
   */
  async getLeadsByResponsible(responsibleId: string, params?: PaginationParams): Promise<ApiResponse<Lead[]>> {
    try {
      const queryString = params ? buildQueryString(params) : ''
      const endpoint = `${API_ENDPOINTS.LEADS.BY_RESPONSIBLE(responsibleId)}${queryString}`
      
      return await httpClient.get<Lead[]>(endpoint)
    } catch (error) {
      console.error(`Erro ao buscar leads do responsável ${responsibleId}:`, error)
      throw error
    }
  }

  /**
   * Obtém leads sem follow-up agendado
   */
  async getLeadsWithoutFollowUp(params?: PaginationParams): Promise<ApiResponse<Lead[]>> {
    try {
      const filters: LeadFilters = { sem_follow_up: true }
      const searchParams: LeadSearchParams = { filters, ...params }
      
      return await this.getLeads(searchParams)
    } catch (error) {
      console.error('Erro ao buscar leads sem follow-up:', error)
      throw error
    }
  }

  /**
   * Obtém leads com follow-up vencido
   */
  async getLeadsWithOverdueFollowUp(params?: PaginationParams): Promise<ApiResponse<Lead[]>> {
    try {
      const filters: LeadFilters = { follow_up_vencido: true }
      const searchParams: LeadSearchParams = { filters, ...params }
      
      return await this.getLeads(searchParams)
    } catch (error) {
      console.error('Erro ao buscar leads com follow-up vencido:', error)
      throw error
    }
  }

  /**
   * Filtra leads por faixa de valor
   */
  async getLeadsByValueRange(valorMin?: number, valorMax?: number, params?: PaginationParams): Promise<ApiResponse<Lead[]>> {
    try {
      const filters: LeadFilters = { valor_min: valorMin, valor_max: valorMax }
      const searchParams: LeadSearchParams = { filters, ...params }
      
      return await this.getLeads(searchParams)
    } catch (error) {
      console.error('Erro ao buscar leads por faixa de valor:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE FOLLOW-UP ====================

  /**
   * Obtém follow-ups do lead
   */
  async getLeadFollowUps(leadId: string): Promise<ApiResponse<LeadFollowUp[]>> {
    try {
      return await httpClient.get<LeadFollowUp[]>(`/leads/${leadId}/follow-ups`)
    } catch (error) {
      console.error(`Erro ao obter follow-ups do lead ${leadId}:`, error)
      throw error
    }
  }

  /**
   * Cria follow-up para o lead
   */
  async createFollowUp(leadId: string, followUpData: LeadFollowUpCreate): Promise<ApiResponse<LeadFollowUp>> {
    try {
      return await httpClient.post<LeadFollowUp>(
        `/leads/${leadId}/follow-ups`,
        followUpData
      )
    } catch (error) {
      console.error(`Erro ao criar follow-up para o lead ${leadId}:`, error)
      throw error
    }
  }

  /**
   * Atualiza follow-up
   */
  async updateFollowUp(leadId: string, followUpId: string, followUpData: Partial<LeadFollowUpCreate>): Promise<ApiResponse<LeadFollowUp>> {
    try {
      return await httpClient.put<LeadFollowUp>(
        `/leads/${leadId}/follow-ups/${followUpId}`,
        followUpData
      )
    } catch (error) {
      console.error(`Erro ao atualizar follow-up ${followUpId}:`, error)
      throw error
    }
  }

  /**
   * Marca follow-up como realizado
   */
  async markFollowUpAsCompleted(
    leadId: string, 
    followUpId: string, 
    resultado: string, 
    proximaAcao?: string
  ): Promise<ApiResponse<LeadFollowUp>> {
    try {
      return await httpClient.patch<LeadFollowUp>(
        `/leads/${leadId}/follow-ups/${followUpId}/complete`,
        {
          resultado,
          proxima_acao: proximaAcao,
          data_realizada: new Date(),
          status: 'realizado'
        }
      )
    } catch (error) {
      console.error(`Erro ao marcar follow-up ${followUpId} como realizado:`, error)
      throw error
    }
  }

  /**
   * Obtém follow-ups pendentes
   */
  async getPendingFollowUps(params?: PaginationParams): Promise<ApiResponse<LeadFollowUp[]>> {
    try {
      const queryString = params ? buildQueryString(params) : ''
      const endpoint = `${API_ENDPOINTS.LEADS.FOLLOW_UP}${queryString}`
      
      return await httpClient.get<LeadFollowUp[]>(endpoint)
    } catch (error) {
      console.error('Erro ao buscar follow-ups pendentes:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE BUSCA ====================

  /**
   * Busca leads por termo
   */
  async searchLeads(query: string, params?: PaginationParams): Promise<ApiResponse<Lead[]>> {
    try {
      const searchParams = { q: query, ...params }
      const queryString = buildQueryString(searchParams)
      const endpoint = `${API_ENDPOINTS.LEADS.LIST}${queryString}`
      
      return await httpClient.get<Lead[]>(endpoint)
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE ESTATÍSTICAS ====================

  /**
   * Obtém estatísticas dos leads
   */
  async getLeadStats(): Promise<ApiResponse<LeadStats>> {
    try {
      return await httpClient.get<LeadStats>(API_ENDPOINTS.LEADS.STATS)
    } catch (error) {
      console.error('Erro ao obter estatísticas dos leads:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE ATRIBUIÇÃO ====================

  /**
   * Atribui lead a um responsável
   */
  async assignLead(id: string, responsavelId: string): Promise<ApiResponse<Lead>> {
    try {
      return await this.updateLead(id, { responsavel_id: responsavelId })
    } catch (error) {
      console.error(`Erro ao atribuir lead ${id}:`, error)
      throw error
    }
  }

  /**
   * Remove atribuição do lead
   */
  async unassignLead(id: string): Promise<ApiResponse<Lead>> {
    try {
      return await this.updateLead(id, { responsavel_id: undefined })
    } catch (error) {
      console.error(`Erro ao remover atribuição do lead ${id}:`, error)
      throw error
    }
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Formata lead para exibição
   */
  formatLeadForDisplay(lead: Lead): {
    id: string
    nome: string
    email: string
    telefone?: string
    empresa?: string
    status: string
    statusLabel: string
    statusColor: string
    origem: string
    origemLabel: string
    valor_estimado?: number
    probabilidade?: number
    responsavel_id?: string
    hasFollowUpPending: boolean
    isFollowUpOverdue: boolean
    tags?: string[]
  } {
    return {
      id: lead.id,
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      empresa: lead.empresa,
      status: lead.status,
      statusLabel: this.getStatusLabel(lead.status),
      statusColor: this.getStatusColor(lead.status),
      origem: lead.origem,
      origemLabel: this.getOriginLabel(lead.origem),
      valor_estimado: lead.valor_estimado,
      probabilidade: lead.probabilidade,
      responsavel_id: lead.responsavel_id,
      hasFollowUpPending: this.hasFollowUpPending(lead),
      isFollowUpOverdue: this.isFollowUpOverdue(lead),
      tags: lead.tags
    }
  }

  /**
   * Obtém label do status
   */
  private getStatusLabel(status: string): string {
    const statusLabels = {
      novo: 'Novo',
      contatado: 'Contatado',
      qualificado: 'Qualificado',
      proposta: 'Proposta',
      negociacao: 'Negociação',
      fechado: 'Fechado',
      perdido: 'Perdido'
    }
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  /**
   * Obtém cor do status
   */
  private getStatusColor(status: string): string {
    const statusColors = {
      novo: '#6B7280',        // gray
      contatado: '#3B82F6',   // blue
      qualificado: '#8B5CF6', // purple
      proposta: '#F59E0B',    // yellow
      negociacao: '#F97316',  // orange
      fechado: '#10B981',     // green
      perdido: '#EF4444'      // red
    }
    return statusColors[status as keyof typeof statusColors] || '#6B7280'
  }

  /**
   * Obtém label da origem
   */
  private getOriginLabel(origem: string): string {
    const originLabels = {
      website: 'Website',
      indicacao: 'Indicação',
      evento: 'Evento',
      cold_call: 'Cold Call',
      social_media: 'Redes Sociais',
      outro: 'Outro'
    }
    return originLabels[origem as keyof typeof originLabels] || origem
  }

  /**
   * Verifica se tem follow-up pendente
   */
  private hasFollowUpPending(lead: Lead): boolean {
    return !!lead.data_follow_up && new Date(lead.data_follow_up) >= new Date()
  }

  /**
   * Verifica se o follow-up está vencido
   */
  private isFollowUpOverdue(lead: Lead): boolean {
    return !!lead.data_follow_up && new Date(lead.data_follow_up) < new Date()
  }

  /**
   * Valida dados do lead
   */
  validateLeadData(leadData: LeadCreateRequest | LeadUpdateRequest): {
    isValid: boolean
    errors: Record<string, string[]>
  } {
    const errors: Record<string, string[]> = {}

    // Validação de nome
    if ('nome' in leadData && (!leadData.nome || leadData.nome.trim().length < 2)) {
      errors.nome = ['Nome deve ter pelo menos 2 caracteres']
    }

    // Validação de email
    if ('email' in leadData && leadData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(leadData.email)) {
        errors.email = ['Email deve ter um formato válido']
      }
    }

    // Validação de telefone
    if ('telefone' in leadData && leadData.telefone) {
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
      if (!phoneRegex.test(leadData.telefone)) {
        errors.telefone = ['Telefone deve ter o formato (XX) XXXXX-XXXX']
      }
    }

    // Validação de valor estimado
    if ('valor_estimado' in leadData && leadData.valor_estimado !== undefined && leadData.valor_estimado < 0) {
      errors.valor_estimado = ['Valor estimado deve ser positivo']
    }

    // Validação de probabilidade
    if ('probabilidade' in leadData && leadData.probabilidade !== undefined) {
      if (leadData.probabilidade < 0 || leadData.probabilidade > 100) {
        errors.probabilidade = ['Probabilidade deve estar entre 0 e 100']
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

// ==================== EXPORTAÇÃO ====================

export const leadsService = new LeadsService()
export default leadsService

// Exportar tipos para uso em outros arquivos
export type {
  Lead,
  LeadFilters,
  LeadSearchParams,
  LeadStats,
  LeadCreateRequest,
  LeadUpdateRequest,
  LeadStatusUpdate,
  LeadFollowUp,
  LeadFollowUpCreate
}