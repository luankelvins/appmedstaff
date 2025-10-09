import { LeadForm, LeadPipelineCard, LeadPipelineStage, ContactAttempt, LeadStatus } from '../types/crm'
import db from '../config/database'
import leadDistributionService from './leadDistributionService'
import { leadTaskService } from './leadTaskService'

// Interface para contato simplificado (usado na aba Contatos)
export interface ContactLead {
  id: string
  name: string
  email: string
  phone: string
  type: 'lead'
  company?: string
  position?: string
  city?: string
  state?: string
  status: 'qualificado' | 'nao_qualificado' | 'nao_definido'
  createdAt: Date
  lastContact?: Date
  dataUltimoContato?: Date
  notes?: string
  pipelineStage?: LeadPipelineStage
  motivoDesqualificacao?: string
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live em milissegundos
}

class LeadsService {
  private subscribers: Array<(leads: LeadPipelineCard[]) => void> = []
  private cache = new Map<string, CacheEntry<any>>()
  private readonly CACHE_TTL = {
    PIPELINE_STATS: 5 * 60 * 1000, // 5 minutos
    LEADS_STATS: 3 * 60 * 1000,    // 3 minutos
    ALL_LEADS: 2 * 60 * 1000       // 2 minutos
  }

  constructor() {
    // Não precisamos mais inicializar dados mockados
  }

  // Métodos de cache
  private getCacheKey(method: string, params?: any): string {
    return params ? `${method}_${JSON.stringify(params)}` : method
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (entry && (Date.now() - entry.timestamp) < entry.ttl) {
      return entry.data as T
    }
    if (entry) {
      this.cache.delete(key)
    }
    return null
  }

  private clearCache(): void {
    this.cache.clear()
  }

  // Métodos de subscrição
  public clearStatsCache(): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes('Stats') || key.includes('Pipeline')
    )
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  subscribe(callback: (leads: LeadPipelineCard[]) => void) {
    this.subscribers.push(callback)
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) this.subscribers.splice(index, 1)
    }
  }

  private notifySubscribers() {
    this.getAllLeads().then(leads => {
      this.subscribers.forEach(callback => callback(leads))
    })
  }

  async getAllLeads(): Promise<LeadPipelineCard[]> {
    const cacheKey = this.getCacheKey('getAllLeads')
    const cached = this.getCache<LeadPipelineCard[]>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const query = `
        SELECT 
          id, nome, email, telefone, empresa, cargo, cidade, estado,
          pipeline_status, pipeline_stage, responsavel_id, origem,
          produtos_interesse, observacoes, data_criacao, data_atualizacao,
          stage_changed_at, stage_history, contact_attempts, motivo_desqualificacao
        FROM leads 
        ORDER BY data_criacao DESC
      `
      
      const result = await db.query(query)
      const leads = result.rows.map(this.mapDatabaseLeadToPipelineCard)
      
      this.setCache(cacheKey, leads, this.CACHE_TTL.ALL_LEADS)
      return leads
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
      throw error
    }
  }

  private parseProductsInterest(products: any): string[] {
    if (!products) return []
    
    if (typeof products === 'string') {
      try {
        return JSON.parse(products)
      } catch {
        return [products]
      }
    }
    
    if (Array.isArray(products)) {
      return products
    }
    
    return []
  }

  private mapDatabaseLeadToPipelineCard(dbLead: any): LeadPipelineCard {
    return {
      id: dbLead.id,
      leadId: dbLead.id,
      leadData: {
        id: dbLead.id,
        nome: dbLead.nome,
        email: dbLead.email,
        telefone: dbLead.telefone,
        empresa: dbLead.empresa,
        cargo: dbLead.cargo,
        cidade: dbLead.cidade,
        estado: dbLead.estado,
        produtosInteresse: this.parseProductsInterest(dbLead.produtos_interesse),
        origem: dbLead.origem,
        observacoes: dbLead.observacoes,
        dataCriacao: dbLead.data_criacao,
         dataUltimaAtualizacao: dbLead.data_atualizacao,
         desfecho: 'nao_definido' as LeadStatus,
         criadoPor: dbLead.responsavel_id || 'sistema'
      },
      currentStage: dbLead.pipeline_stage as LeadPipelineStage,
      status: 'nao_definido' as LeadStatus,
      responsavelAtual: dbLead.responsavel_id || '',
      dataDistribuicao: new Date(dbLead.data_criacao),
      dataUltimaAtualizacao: new Date(dbLead.data_atualizacao || dbLead.data_criacao),
      tempoNoEstagio: this.calculateDaysInStage(dbLead.stage_changed_at || dbLead.data_criacao),
      tempoTotalPipeline: this.calculateDaysInStage(dbLead.data_criacao),
      stageHistory: [],
      contactAttempts: [],
      tasks: [],
      criadoPor: dbLead.responsavel_id || 'sistema',
      dataCriacao: new Date(dbLead.data_criacao)
    }
  }

  private calculateDaysInStage(stageChangedAt: string): number {
    const stageDate = new Date(stageChangedAt)
    const now = new Date()
    return Math.floor((now.getTime() - stageDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  private calculateDaysInPipeline(createdAt: string): number {
    const createdDate = new Date(createdAt)
    const now = new Date()
    return Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  private parseStageHistory(stageHistory: any): any[] {
    if (!stageHistory) return []
    if (typeof stageHistory === 'string') {
      try {
        return JSON.parse(stageHistory)
      } catch {
        return []
      }
    }
    return Array.isArray(stageHistory) ? stageHistory : []
  }

  private parseContactAttempts(contactAttempts: any): ContactAttempt[] {
    if (!contactAttempts) return []
    if (typeof contactAttempts === 'string') {
      try {
        return JSON.parse(contactAttempts)
      } catch {
        return []
      }
    }
    return Array.isArray(contactAttempts) ? contactAttempts : []
  }

  async getContactLeads(): Promise<ContactLead[]> {
    try {
      const query = `
        SELECT 
          id, nome, email, telefone, empresa, cargo, cidade, estado,
          pipeline_status, pipeline_stage, data_criacao, data_ultimo_contato,
          observacoes, motivo_desqualificacao
        FROM leads 
        ORDER BY data_criacao DESC
      `
      
      const result = await db.query(query)
      
      return result.rows.map(lead => ({
        id: lead.id,
        name: lead.nome,
        email: lead.email,
        phone: lead.telefone,
        type: 'lead' as const,
        company: lead.empresa,
        position: lead.cargo,
        city: lead.cidade,
        state: lead.estado,
        status: this.mapPipelineStatusToContactStatus(lead.pipeline_status),
        createdAt: new Date(lead.data_criacao),
        lastContact: lead.data_ultimo_contato ? new Date(lead.data_ultimo_contato) : undefined,
        dataUltimoContato: lead.data_ultimo_contato ? new Date(lead.data_ultimo_contato) : undefined,
        notes: lead.observacoes,
        pipelineStage: lead.pipeline_stage,
        motivoDesqualificacao: lead.motivo_desqualificacao
      }))
    } catch (error) {
      console.error('Erro ao buscar contatos de leads:', error)
      throw error
    }
  }

  private mapPipelineStatusToContactStatus(pipelineStatus: string): 'qualificado' | 'nao_qualificado' | 'nao_definido' {
    switch (pipelineStatus) {
      case 'qualificado':
        return 'qualificado'
      case 'nao_qualificado':
        return 'nao_qualificado'
      default:
        return 'nao_definido'
    }
  }

  async updateLead(leadId: string, leadData: LeadForm): Promise<void> {
    try {
      const query = `
        UPDATE leads 
        SET nome = $1, email = $2, telefone = $3, empresa = $4, cargo = $5,
            cidade = $6, estado = $7, origem = $8, produtos_interesse = $9,
            observacoes = $10, data_atualizacao = NOW()
        WHERE id = $11
      `
      
      await db.query(query, [
        leadData.nome,
        leadData.email,
        leadData.telefone,
        leadData.empresa,
        leadData.cargo,
        leadData.cidade,
        leadData.estado,
        leadData.origem,
        JSON.stringify(leadData.produtosInteresse),
        leadData.observacoes,
        leadId
      ])
      
      this.clearCache()
      this.notifySubscribers()
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
      throw error
    }
  }

  async createLead(leadData: LeadForm): Promise<LeadPipelineCard> {
    try {
      const query = `
        INSERT INTO leads (
          nome, email, telefone, empresa, cargo, cidade, estado,
          origem, produtos_interesse, observacoes, pipeline_status,
          pipeline_stage, data_criacao, data_atualizacao, stage_changed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), NOW())
        RETURNING *
      `
      
      const result = await db.query(query, [
        leadData.nome,
        leadData.email,
        leadData.telefone,
        leadData.empresa,
        leadData.cargo,
        leadData.cidade,
        leadData.estado,
        leadData.origem,
        JSON.stringify(leadData.produtosInteresse),
        leadData.observacoes,
        'nao_definido',
        'novo'
      ])
      
      const newLead = this.mapDatabaseLeadToPipelineCard(result.rows[0])
      
      this.clearCache()
      this.notifySubscribers()
      
      return newLead
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      throw error
    }
  }

  async assignLeadToUser(leadId: string, userId: string): Promise<void> {
    try {
      const query = `
        UPDATE leads 
        SET responsavel_id = $1, data_atualizacao = NOW()
        WHERE id = $2
      `
      
      await db.query(query, [userId, leadId])
      
      this.clearCache()
      this.notifySubscribers()
    } catch (error) {
      console.error('Erro ao atribuir lead:', error)
      throw error
    }
  }

  async updateLeadStage(leadId: string, newStage: LeadPipelineStage): Promise<void> {
    try {
      // Buscar histórico atual
      const currentQuery = `SELECT stage_history FROM leads WHERE id = $1`
      const currentResult = await db.query(currentQuery, [leadId])
      
      let stageHistory = []
      if (currentResult.rows[0]?.stage_history) {
        stageHistory = this.parseStageHistory(currentResult.rows[0].stage_history)
      }
      
      // Adicionar nova entrada no histórico
      stageHistory.push({
        stage: newStage,
        timestamp: new Date().toISOString(),
        changedBy: 'system' // Pode ser melhorado para incluir o usuário atual
      })
      
      const query = `
        UPDATE leads 
        SET pipeline_stage = $1, stage_changed_at = NOW(), 
            stage_history = $2, data_atualizacao = NOW()
        WHERE id = $3
      `
      
      await db.query(query, [newStage, JSON.stringify(stageHistory), leadId])
      
      this.clearCache()
      this.notifySubscribers()
    } catch (error) {
      console.error('Erro ao atualizar estágio do lead:', error)
      throw error
    }
  }

  async addContactAttempt(leadId: string, attempt: Omit<ContactAttempt, 'id' | 'leadPipelineId'>): Promise<void> {
    try {
      // Buscar tentativas atuais
      const currentQuery = `SELECT contact_attempts FROM leads WHERE id = $1`
      const currentResult = await db.query(currentQuery, [leadId])
      
      let contactAttempts: ContactAttempt[] = []
      if (currentResult.rows[0]?.contact_attempts) {
        contactAttempts = this.parseContactAttempts(currentResult.rows[0].contact_attempts)
      }
      
      // Adicionar nova tentativa
      const newAttempt = {
        ...attempt,
        id: Date.now().toString(),
        leadPipelineId: leadId
      }
      contactAttempts.push(newAttempt)
      
      const query = `
        UPDATE leads 
        SET contact_attempts = $1, data_ultimo_contato = NOW(), data_atualizacao = NOW()
        WHERE id = $2
      `
      
      await db.query(query, [JSON.stringify(contactAttempts), leadId])
      
      this.clearCache()
      this.notifySubscribers()
    } catch (error) {
      console.error('Erro ao adicionar tentativa de contato:', error)
      throw error
    }
  }

  async qualifyLead(leadId: string, selectedPipelines: string[]): Promise<void> {
    try {
      const query = `
        UPDATE leads 
        SET pipeline_status = 'qualificado', data_atualizacao = NOW()
        WHERE id = $1
      `
      
      await db.query(query, [leadId])
      
      this.clearCache()
      this.notifySubscribers()
    } catch (error) {
      console.error('Erro ao qualificar lead:', error)
      throw error
    }
  }

  async disqualifyLead(leadId: string, reason: string, customReason?: string): Promise<void> {
    try {
      const finalReason = reason === 'outro' ? customReason : reason
      
      const query = `
        UPDATE leads 
        SET pipeline_status = 'nao_qualificado', motivo_desqualificacao = $1, data_atualizacao = NOW()
        WHERE id = $2
      `
      
      await db.query(query, [finalReason, leadId])
      
      this.clearCache()
      this.notifySubscribers()
    } catch (error) {
      console.error('Erro ao desqualificar lead:', error)
      throw error
    }
  }

  async getLeadById(leadId: string): Promise<LeadPipelineCard | undefined> {
    try {
      const query = `
        SELECT 
          id, nome, email, telefone, empresa, cargo, cidade, estado,
          pipeline_status, pipeline_stage, responsavel_id, origem,
          produtos_interesse, observacoes, data_criacao, data_atualizacao,
          stage_changed_at, stage_history, contact_attempts, motivo_desqualificacao
        FROM leads 
        WHERE id = $1
      `
      
      const result = await db.query(query, [leadId])
      
      if (result.rows.length === 0) {
        return undefined
      }
      
      return this.mapDatabaseLeadToPipelineCard(result.rows[0])
    } catch (error) {
      console.error('Erro ao buscar lead por ID:', error)
      throw error
    }
  }

  async getLeadsStats(): Promise<{
    total: number
    qualificado: number
    nao_qualificado: number
    nao_definido: number
    taxaQualificacao: number
    novosHoje: number
    novosEstaSemana: number
    novosEsteMes: number
  }> {
    const cacheKey = this.getCacheKey('getLeadsStats')
    const cached = this.getCache<any>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN pipeline_status = 'qualificado' THEN 1 END) as qualificado,
          COUNT(CASE WHEN pipeline_status = 'nao_qualificado' THEN 1 END) as nao_qualificado,
          COUNT(CASE WHEN pipeline_status = 'nao_definido' THEN 1 END) as nao_definido,
          COUNT(CASE WHEN DATE(data_criacao) = CURRENT_DATE THEN 1 END) as novos_hoje,
          COUNT(CASE WHEN data_criacao >= DATE_TRUNC('week', CURRENT_DATE) THEN 1 END) as novos_esta_semana,
          COUNT(CASE WHEN data_criacao >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as novos_este_mes
        FROM leads
      `
      
      const result = await db.query(query)
      const row = result.rows[0]
      
      const stats = {
        total: parseInt(row?.total || '0'),
        qualificado: parseInt(row?.qualificado || '0'),
        nao_qualificado: parseInt(row?.nao_qualificado || '0'),
        nao_definido: parseInt(row?.nao_definido || '0'),
        taxaQualificacao: parseInt(row?.total || '0') > 0 ? (parseInt(row?.qualificado || '0') / parseInt(row?.total || '0')) * 100 : 0,
        novosHoje: parseInt(row?.novos_hoje || '0'),
        novosEstaSemana: parseInt(row?.novos_esta_semana || '0'),
        novosEsteMes: parseInt(row?.novos_este_mes || '0')
      }
      
      this.setCache(cacheKey, stats, this.CACHE_TTL.LEADS_STATS)
      return stats
    } catch (error) {
      console.error('Erro ao calcular estatísticas de leads:', error)
      throw error
    }
  }
}

const leadsService = new LeadsService()
export default leadsService