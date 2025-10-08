import { LeadForm, LeadPipelineCard, LeadPipelineStage, ContactAttempt } from '../types/crm'
import { supabase } from '../config/supabase'
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
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  private clearCache(): void {
    this.cache.clear()
  }

  // Método público para limpar cache de estatísticas
  public clearStatsCache(): void {
    const statsKey = this.getCacheKey('getLeadsStats')
    this.cache.delete(statsKey)
    console.log('[LeadsService] Cache de estatísticas limpo')
  }

  // Subscrever para mudanças nos leads
  subscribe(callback: (leads: LeadPipelineCard[]) => void) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  // Notificar subscribers sobre mudanças
  private notifySubscribers() {
    this.getAllLeads().then(leads => {
      this.subscribers.forEach(callback => callback(leads))
    })
  }

  // Buscar todos os leads do banco de dados
  async getAllLeads(): Promise<LeadPipelineCard[]> {
    const cacheKey = this.getCacheKey('getAllLeads')
    
    // Verificar cache primeiro
    const cachedData = this.getCache<LeadPipelineCard[]>(cacheKey)
    if (cachedData) {
      console.log('[LeadsService] Retornando leads do cache')
      return cachedData
    }

    try {
      console.log('[LeadsService] Buscando leads do banco de dados...')
      
      // Usar timeout para evitar queries longas
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na busca de leads')), 10000) // 10 segundos
      })

      // Primeiro tenta com JOIN, se falhar busca sem JOIN
      const queryPromise = supabase
        .from('leads')
        .select(`
          *,
          assigned_to_employee:employees(
            id,
            email,
            dados_pessoais
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1000) // Limitar para evitar queries muito grandes

      let { data: leads, error } = await Promise.race([queryPromise, timeoutPromise])

      // Se der erro no JOIN (foreign key não existe), busca sem JOIN
      if (error) {
        console.warn('Erro ao buscar leads com JOIN, buscando sem JOIN:', error)
        
        const fallbackPromise = supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000)
        
        const response = await Promise.race([fallbackPromise, timeoutPromise])
        leads = response.data
        
        if (response.error) {
          console.error('Erro ao buscar leads:', response.error)
          // Tentar retornar dados expirados do cache como último recurso
          const expiredCache = this.cache.get(cacheKey)
          if (expiredCache) {
            console.log('[LeadsService] Retornando dados expirados do cache como fallback')
            return expiredCache.data
          }
          return []
        }
      }

      if (!leads) {
        return []
      }

      const mappedLeads = leads.map(lead => this.mapDatabaseLeadToPipelineCard(lead))
      
      // Salvar no cache
      this.setCache(cacheKey, mappedLeads, this.CACHE_TTL.ALL_LEADS)
      console.log(`[LeadsService] ${mappedLeads.length} leads salvos no cache`)

      return mappedLeads
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
      
      // Tentar retornar dados expirados do cache como fallback
      const expiredCache = this.cache.get(cacheKey)
      if (expiredCache) {
        console.log('[LeadsService] Retornando dados expirados do cache como fallback')
        return expiredCache.data
      }
      
      return []
    }
  }

  // Helper: Converter products_interest para array
  private parseProductsInterest(products: any): string[] {
    if (!products) return []
    if (Array.isArray(products)) return products
    if (typeof products === 'string') {
      try {
        // Tentar fazer parse de JSON
        const parsed = JSON.parse(products)
        return Array.isArray(parsed) ? parsed : [products]
      } catch {
        // Se não for JSON, assumir que é uma string separada por vírgula
        return products.split(',').map(p => p.trim()).filter(Boolean)
      }
    }
    return []
  }

  // Mapear dados do banco para o formato LeadPipelineCard
  private mapDatabaseLeadToPipelineCard(dbLead: any): LeadPipelineCard {
    return {
      id: dbLead.id,
      leadId: dbLead.id,
      leadData: {
        id: dbLead.id,
        nome: dbLead.name,
        telefone: dbLead.phone,
        email: dbLead.email,
        empresa: dbLead.company || '',
        cargo: dbLead.position || '',
        cidade: dbLead.city || '',
        estado: dbLead.state || '',
        produtosInteresse: this.parseProductsInterest(dbLead.products_interest),
        origem: dbLead.source || 'site',
        origemDetalhes: dbLead.origem_detalhes || '',
        observacoes: dbLead.notes || '',
        responsavel: dbLead.assigned_to || '',
        status: dbLead.status || 'novo',
        dataCriacao: dbLead.created_at,
        criadoPor: dbLead.created_by || 'sistema'
      },
      currentStage: (dbLead.pipeline_stage || 'novo_lead') as LeadPipelineStage,
      status: dbLead.qualification_status || 'nao_definido',
      responsavelAtual: dbLead.assigned_to,
      responsavelNome: dbLead.assigned_to_employee?.dados_pessoais?.nome_completo || 'Não atribuído',
      responsavelFoto: dbLead.assigned_to_employee?.dados_pessoais?.foto_url || null,
      dataDistribuicao: new Date(dbLead.assigned_at || dbLead.created_at),
      dataUltimaAtualizacao: new Date(dbLead.updated_at),
      tempoNoEstagio: this.calculateDaysInStage(dbLead.stage_changed_at || dbLead.created_at),
      tempoTotalPipeline: this.calculateDaysInPipeline(dbLead.created_at),
      stageHistory: this.parseStageHistory(dbLead.stage_history),
      contactAttempts: this.parseContactAttempts(dbLead.contact_attempts),
      tasks: dbLead.tasks || [],
      observacoes: dbLead.notes || '',
      criadoPor: dbLead.created_by || 'sistema',
      dataCriacao: new Date(dbLead.created_at)
    }
  }

  // Calcular dias no estágio atual
  private calculateDaysInStage(stageChangedAt: string): number {
    const now = new Date()
    const stageDate = new Date(stageChangedAt)
    const diffTime = Math.abs(now.getTime() - stageDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Calcular dias total no pipeline
  private calculateDaysInPipeline(createdAt: string): number {
    const now = new Date()
    const createdDate = new Date(createdAt)
    const diffTime = Math.abs(now.getTime() - createdDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Parse do histórico de estágios
  private parseStageHistory(stageHistory: any): any[] {
    if (!stageHistory) return []
    try {
      return Array.isArray(stageHistory) ? stageHistory : JSON.parse(stageHistory)
    } catch {
      return []
    }
  }

  // Parse das tentativas de contato
  private parseContactAttempts(contactAttempts: any): ContactAttempt[] {
    if (!contactAttempts) return []
    try {
      return Array.isArray(contactAttempts) ? contactAttempts : JSON.parse(contactAttempts)
    } catch {
      return []
    }
  }

  // Buscar leads para a aba de contatos
  async getContactLeads(): Promise<ContactLead[]> {
    try {
      // Primeiro tenta com JOIN, se falhar busca sem JOIN
      let { data: leads, error } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_to_employee:employees(
            id,
            email,
            dados_pessoais
          )
        `)
        .order('created_at', { ascending: false })

      // Se der erro no JOIN (foreign key não existe), busca sem JOIN
      if (error) {
        console.warn('Erro ao buscar leads com JOIN, buscando sem JOIN:', error)
        const response = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
        
        leads = response.data
        if (response.error) {
          console.error('Erro ao buscar leads para contatos:', response.error)
          return []
        }
      }

      if (!leads) {
        return []
      }

      return leads.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        type: 'lead' as const,
        company: lead.company,
        position: lead.position,
        city: lead.city,
        state: lead.state,
        source: lead.source,
        origem_detalhes: lead.origem_detalhes,
        assigned_to: lead.assigned_to,
        assigned_to_name: lead.assigned_to_employee?.dados_pessoais?.nome_completo || 'Não atribuído',
        assigned_to_photo: lead.assigned_to_employee?.dados_pessoais?.foto_url || null,
        status: this.mapPipelineStatusToContactStatus(lead.qualification_status),
        createdAt: new Date(lead.created_at),
        lastContact: lead.last_contact_at ? new Date(lead.last_contact_at) : undefined,
        dataUltimoContato: lead.last_contact_at ? new Date(lead.last_contact_at) : undefined,
        notes: lead.notes,
        pipelineStage: lead.pipeline_stage as LeadPipelineStage,
        motivoDesqualificacao: lead.disqualification_reason
      }))
    } catch (error) {
      console.error('Erro ao buscar leads para contatos:', error)
      return []
    }
  }

  // Mapear status do pipeline para status de contato
  private mapPipelineStatusToContactStatus(pipelineStatus: string): 'qualificado' | 'nao_qualificado' | 'nao_definido' {
    switch (pipelineStatus) {
      case 'qualificado':
        return 'qualificado'
      case 'desqualificado':
        return 'nao_qualificado'
      default:
        return 'nao_definido'
    }
  }

  // Atualizar lead existente
  async updateLead(leadId: string, leadData: LeadForm): Promise<void> {
    try {
      // Verificar se responsavel é UUID válido
      const isValidUUID = (str: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        return uuidRegex.test(str)
      }

      const updatedLead: any = {
        name: leadData.nome,
        email: leadData.email,
        phone: leadData.telefone,
        company: leadData.empresa,
        position: leadData.cargo,
        city: leadData.cidade,
        state: leadData.estado,
        products_interest: leadData.produtosInteresse,
        source: leadData.origem,
        origem_detalhes: leadData.origemDetalhes || null,
        notes: leadData.observacoes,
        updated_at: new Date().toISOString()
      }

      // Só adicionar assigned_to se for UUID válido
      if (leadData.responsavel && isValidUUID(leadData.responsavel)) {
        updatedLead.assigned_to = leadData.responsavel
      }

      const { error } = await supabase
        .from('leads')
        .update(updatedLead)
        .eq('id', leadId)

      if (error) {
        throw new Error(`Erro ao atualizar lead: ${error.message}`)
      }

      this.notifySubscribers()
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
      throw error
    }
  }

  // Criar novo lead
  async createLead(leadData: LeadForm): Promise<LeadPipelineCard> {
    try {
      // Verificar se responsavel é UUID válido
      const isValidUUID = (str: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        return uuidRegex.test(str)
      }

      const newLead: any = {
        name: leadData.nome,
        email: leadData.email,
        phone: leadData.telefone,
        company: leadData.empresa,
        position: leadData.cargo,
        city: leadData.cidade,
        state: leadData.estado,
        products_interest: leadData.produtosInteresse,
        source: leadData.origem || 'site',
        origem_detalhes: leadData.origemDetalhes || null,
        notes: leadData.observacoes,
        status: 'novo',
        pipeline_stage: 'novo_lead',
        qualification_status: 'nao_definido',
        created_by: leadData.criadoPor || 'sistema',
        stage_changed_at: new Date().toISOString(),
        stage_history: JSON.stringify([{
          stage: 'novo_lead',
          responsavel: leadData.responsavel && isValidUUID(leadData.responsavel) ? leadData.responsavel : null,
          dataInicio: new Date(),
          observacoes: leadData.observacoes || 'Lead criado automaticamente'
        }]),
        contact_attempts: JSON.stringify([])
      }

      // Só adicionar assigned_to se for UUID válido
      if (leadData.responsavel && isValidUUID(leadData.responsavel)) {
        newLead.assigned_to = leadData.responsavel
      }

      const { data: createdLead, error } = await supabase
        .from('leads')
        .insert(newLead)
        .select()
        .single()

      if (error) {
        throw new Error(`Erro ao criar lead: ${error.message}`)
      }

      // Distribuir o lead automaticamente
      // Mapear createdLead para LeadForm format
      const leadFormData: any = {
        ...leadData,
        produtosInteresse: createdLead.products_interest || leadData.produtosInteresse
      }
      
      const distribuicao = leadDistributionService.distribuirLead(leadFormData)
      if (distribuicao.responsavelAtual) {
        await this.assignLeadToUser(createdLead.id, distribuicao.responsavelAtual)
      }

      // Criar tarefa inicial
      await leadTaskService.criarTarefaAutomatica(createdLead.id, distribuicao.responsavelAtual)

      const pipelineCard = this.mapDatabaseLeadToPipelineCard(createdLead)
      this.notifySubscribers()
      
      return pipelineCard
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      throw error
    }
  }

  // Atribuir lead a um usuário
  async assignLeadToUser(leadId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          assigned_to: userId,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      if (error) {
        throw new Error(`Erro ao atribuir lead: ${error.message}`)
      }

      this.notifySubscribers()
    } catch (error) {
      console.error('Erro ao atribuir lead:', error)
      throw error
    }
  }

  // Atualizar estágio do lead
  async updateLeadStage(leadId: string, newStage: LeadPipelineStage): Promise<void> {
    try {
      // Buscar lead atual para obter histórico e status atual
      const { data: currentLead, error: fetchError } = await supabase
        .from('leads')
        .select('stage_history, assigned_to, qualification_status')
        .eq('id', leadId)
        .single()

      if (fetchError) {
        throw new Error(`Erro ao buscar lead: ${fetchError.message}`)
      }

      // Atualizar histórico de estágios
      const currentHistory = this.parseStageHistory(currentLead.stage_history)
      const newHistoryEntry = {
        stage: newStage,
        responsavel: currentLead.assigned_to,
        dataInicio: new Date(),
        observacoes: `Movido para ${newStage}`
      }
      const updatedHistory = [...currentHistory, newHistoryEntry]

      // Preparar dados para atualização
      const updateData: any = {
        pipeline_stage: newStage,
        stage_changed_at: new Date().toISOString(),
        stage_history: JSON.stringify(updatedHistory),
        updated_at: new Date().toISOString()
      }

      // Lógica automática de desfecho: quando chegar ao estágio "desfecho"
      // e o status ainda não foi definido, marcar como "nao_definido"
      if (newStage === 'desfecho' && (!currentLead.qualification_status || currentLead.qualification_status === 'nao_informado')) {
        updateData.qualification_status = 'nao_definido'
      }

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)

      if (error) {
        throw new Error(`Erro ao atualizar estágio: ${error.message}`)
      }

      this.notifySubscribers()
    } catch (error) {
      console.error('Erro ao atualizar estágio do lead:', error)
      throw error
    }
  }

  // Adicionar tentativa de contato
  async addContactAttempt(leadId: string, attempt: Omit<ContactAttempt, 'id' | 'leadPipelineId'>): Promise<void> {
    try {
      // Buscar tentativas atuais
      const { data: currentLead, error: fetchError } = await supabase
        .from('leads')
        .select('contact_attempts')
        .eq('id', leadId)
        .single()

      if (fetchError) {
        throw new Error(`Erro ao buscar lead: ${fetchError.message}`)
      }

      const currentAttempts = this.parseContactAttempts(currentLead.contact_attempts)
      const newAttempt = {
        ...attempt,
        id: `attempt-${Date.now()}`,
        leadPipelineId: leadId
      }
      const updatedAttempts = [...currentAttempts, newAttempt]

      const { error } = await supabase
        .from('leads')
        .update({
          contact_attempts: JSON.stringify(updatedAttempts),
          last_contact_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      if (error) {
        throw new Error(`Erro ao adicionar tentativa de contato: ${error.message}`)
      }

      this.notifySubscribers()
    } catch (error) {
      console.error('Erro ao adicionar tentativa de contato:', error)
      throw error
    }
  }

  // Completar tarefa
  async completeTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'concluida',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) {
        throw new Error(`Erro ao completar tarefa: ${error.message}`)
      }

      this.notifySubscribers()
    } catch (error) {
      console.error('Erro ao completar tarefa:', error)
      throw error
    }
  }

  // Qualificar lead
  async qualifyLead(leadId: string, selectedPipelines: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          qualification_status: 'qualificado',
          selected_pipelines: selectedPipelines,
          qualified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      if (error) {
        throw new Error(`Erro ao qualificar lead: ${error.message}`)
      }

      this.notifySubscribers()
    } catch (error) {
      console.error('Erro ao qualificar lead:', error)
      throw error
    }
  }

  // Desqualificar lead
  async disqualifyLead(leadId: string, reason: string, customReason?: string): Promise<void> {
    try {
      const disqualificationReason = reason === 'outro' ? customReason : reason

      const { error } = await supabase
        .from('leads')
        .update({
          qualification_status: 'desqualificado',
          // TODO: Adicionar coluna disqualification_reason
          // disqualification_reason: disqualificationReason,
          disqualified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      if (error) {
        throw new Error(`Erro ao desqualificar lead: ${error.message}`)
      }

      this.notifySubscribers()
    } catch (error) {
      console.error('Erro ao desqualificar lead:', error)
      throw error
    }
  }

  // Buscar lead por ID
  async getLeadById(leadId: string): Promise<LeadPipelineCard | undefined> {
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .select(`
          *,
          tasks:tasks(*)
        `)
        .eq('id', leadId)
        .single()

      if (error) {
        console.error('Erro ao buscar lead por ID:', error)
        return undefined
      }

      return this.mapDatabaseLeadToPipelineCard(lead)
    } catch (error) {
      console.error('Erro ao buscar lead por ID:', error)
      return undefined
    }
  }

  // Buscar leads por pipeline
  async getLeadsByPipeline(pipeline: string): Promise<LeadPipelineCard[]> {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select(`
          *,
          tasks:tasks(*)
        `)
        .eq('pipeline_stage', pipeline)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar leads por pipeline:', error)
        return []
      }

      return leads.map(lead => this.mapDatabaseLeadToPipelineCard(lead))
    } catch (error) {
      console.error('Erro ao buscar leads por pipeline:', error)
      return []
    }
  }

  // Buscar leads qualificados
  async getQualifiedLeads(): Promise<LeadPipelineCard[]> {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select(`
          *,
          tasks:tasks(*)
        `)
        .eq('qualification_status', 'qualificado')
        .order('qualified_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar leads qualificados:', error)
        return []
      }

      return leads.map(lead => this.mapDatabaseLeadToPipelineCard(lead))
    } catch (error) {
      console.error('Erro ao buscar leads qualificados:', error)
      return []
    }
  }

  // Buscar leads desqualificados
  async getDisqualifiedLeads(): Promise<LeadPipelineCard[]> {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select(`
          *,
          tasks:tasks(*)
        `)
        .eq('qualification_status', 'desqualificado')
        .order('disqualified_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar leads desqualificados:', error)
        return []
      }

      return leads.map(lead => this.mapDatabaseLeadToPipelineCard(lead))
    } catch (error) {
      console.error('Erro ao buscar leads desqualificados:', error)
      return []
    }
  }

  // Estatísticas de desqualificação
  async getDisqualificationStats(): Promise<Record<string, number>> {
    try {
      // TODO: Adicionar coluna disqualification_reason na tabela leads
      // Por enquanto, retornar dados vazios
      console.warn('Coluna disqualification_reason não existe na tabela leads')
      return {}
    } catch (error) {
      console.error('Erro ao buscar estatísticas de desqualificação:', error)
      return {}
    }
  }

  // Buscar leads desqualificados por período
  async getDisqualifiedLeadsByPeriod(startDate: Date, endDate: Date): Promise<LeadPipelineCard[]> {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select(`
          *,
          tasks:tasks(*)
        `)
        .eq('qualification_status', 'desqualificado')
        .gte('disqualified_at', startDate.toISOString())
        .lte('disqualified_at', endDate.toISOString())
        .order('disqualified_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar leads desqualificados por período:', error)
        return []
      }

      return leads.map(lead => this.mapDatabaseLeadToPipelineCard(lead))
    } catch (error) {
      console.error('Erro ao buscar leads desqualificados por período:', error)
      return []
    }
  }

  // Estatísticas de desqualificação por período
  async getDisqualificationStatsByPeriod(startDate: Date, endDate: Date): Promise<Record<string, number>> {
    try {
      // TODO: Adicionar coluna disqualification_reason na tabela leads
      console.warn('Coluna disqualification_reason não existe na tabela leads')
      return {}
    } catch (error) {
      console.error('Erro ao buscar estatísticas de desqualificação por período:', error)
      return {}
    }
  }

  // ============================================================================
  // MÉTODOS DE ESTATÍSTICAS E INDICADORES
  // ============================================================================

  /**
   * Busca estatísticas gerais dos leads direto do banco
   */
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
    
    // Verificar cache primeiro
    const cachedData = this.getCache<any>(cacheKey)
    if (cachedData) {
      console.log('[LeadsService] Retornando estatísticas do cache')
      return cachedData
    }

    try {
      console.log('[LeadsService] Calculando estatísticas de leads...')
      
      // Buscar todos os leads de uma vez para calcular estatísticas
      const { data: allLeads, error } = await supabase
        .from('leads')
        .select('qualification_status, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar leads para estatísticas:', error)
        throw error
      }

      if (!allLeads) {
        throw new Error('Nenhum lead encontrado')
      }

      // Calcular datas de referência
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      
      const inicioSemana = new Date()
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
      inicioSemana.setHours(0, 0, 0, 0)

      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0, 0, 0, 0)

      // Calcular estatísticas a partir dos dados carregados
      let total = allLeads.length
      let qualificado = 0
      let nao_qualificado = 0
      let nao_definido = 0
      let novosHoje = 0
      let novosEstaSemana = 0
      let novosEsteMes = 0

      allLeads.forEach(lead => {
        // Contagem por status de qualificação
        switch (lead.qualification_status) {
          case 'qualificado':
            qualificado++
            break
          case 'nao_qualificado':
            nao_qualificado++
            break
          case 'nao_definido':
          default:
            nao_definido++
            break
        }

        // Contagem por período de criação
        if (lead.created_at) {
          const createdAt = new Date(lead.created_at)
          
          if (createdAt >= hoje) {
            novosHoje++
          }
          
          if (createdAt >= inicioSemana) {
            novosEstaSemana++
          }
          
          if (createdAt >= inicioMes) {
            novosEsteMes++
          }
        }
      })

      // Calcular taxa de qualificação
      const totalDefinidos = qualificado + nao_qualificado
      const taxaQualificacao = totalDefinidos > 0 
        ? (qualificado / totalDefinidos) * 100 
        : 0

      const stats = {
        total,
        qualificado,
        nao_qualificado,
        nao_definido,
        taxaQualificacao: Math.round(taxaQualificacao * 10) / 10,
        novosHoje,
        novosEstaSemana,
        novosEsteMes
      }

      // Salvar no cache
      this.setCache(cacheKey, stats, this.CACHE_TTL.LEADS_STATS)
      console.log('[LeadsService] Estatísticas salvas no cache')

      return stats
    } catch (error) {
      console.error('Erro ao buscar estatísticas de leads:', error)
      
      // Tentar retornar dados expirados do cache como fallback
      const expiredCache = this.cache.get(cacheKey)
      if (expiredCache) {
        console.log('[LeadsService] Retornando dados expirados do cache como fallback')
        return expiredCache.data
      }

      // Fallback com dados padrão
      return {
        total: 0,
        qualificado: 0,
        nao_qualificado: 0,
        nao_definido: 0,
        taxaQualificacao: 0,
        novosHoje: 0,
        novosEstaSemana: 0,
        novosEsteMes: 0
      }
    }
  }

  /**
   * Busca estatísticas por estágio do pipeline
   */
  async getLeadsByStage(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('pipeline_stage')

      if (error) throw error

      const stats: Record<string, number> = {}
      data?.forEach(lead => {
        const stage = lead.pipeline_stage || 'novo_lead'
        stats[stage] = (stats[stage] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Erro ao buscar leads por estágio:', error)
      return {}
    }
  }

  /**
   * Busca estatísticas por fonte de origem
   */
  async getLeadsBySource(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('source')

      if (error) throw error

      const stats: Record<string, number> = {}
      data?.forEach(lead => {
        const source = lead.source || 'desconhecido'
        stats[source] = (stats[source] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Erro ao buscar leads por fonte:', error)
      return {}
    }
  }

  /**
   * Busca estatísticas de conversão por responsável
   */
  async getConversionByAssigned(): Promise<Array<{
    responsavel: string
    total: number
    qualificados: number
    taxaConversao: number
  }>> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('assigned_to, qualification_status')
        .not('assigned_to', 'is', null)

      if (error) throw error

      const stats: Record<string, { total: number, qualificados: number }> = {}
      
      data?.forEach(lead => {
        const assigned = lead.assigned_to || 'Não Atribuído'
        if (!stats[assigned]) {
          stats[assigned] = { total: 0, qualificados: 0 }
        }
        stats[assigned].total++
        if (lead.qualification_status === 'qualificado') {
          stats[assigned].qualificados++
        }
      })

      return Object.entries(stats).map(([responsavel, data]) => ({
        responsavel,
        total: data.total,
        qualificados: data.qualificados,
        taxaConversao: data.total > 0 
          ? Math.round((data.qualificados / data.total) * 1000) / 10 
          : 0
      })).sort((a, b) => b.taxaConversao - a.taxaConversao)
    } catch (error) {
      console.error('Erro ao buscar conversão por responsável:', error)
      return []
    }
  }

  /**
   * Busca estatísticas do Pipeline de Leads
   */
  async getPipelineStats(): Promise<any> {
    const cacheKey = this.getCacheKey('getPipelineStats')
    
    // Verificar cache primeiro
    const cachedStats = this.getCache(cacheKey)
    if (cachedStats) {
      console.log('[LeadsService] Retornando estatísticas do cache')
      return cachedStats
    }

    try {
      const { data: allLeads, error } = await supabase
        .from('leads')
        .select('*')

      if (error) throw error

      // Total de leads
      const totalLeads = allLeads?.length || 0

      // Leads por estágio
      const leadsPorEstagio: Record<string, number> = {
        novo_lead: 0,
        ligacao_1: 0,
        ligacao_2: 0,
        mensagem: 0,
        recontato: 0,
        desfecho: 0
      }
      
      allLeads?.forEach(lead => {
        const stage = lead.pipeline_stage || 'novo_lead'
        if (leadsPorEstagio[stage] !== undefined) {
          leadsPorEstagio[stage]++
        }
      })

      // Leads por status
      const leadsPorStatus: Record<string, number> = {
        novo: 0,
        contato: 0,
        qualificado: 0,
        desqualificado: 0,
        perdido: 0,
        ganho: 0
      }

      allLeads?.forEach(lead => {
        const status = lead.status || 'novo'
        if (leadsPorStatus[status] !== undefined) {
          leadsPorStatus[status]++
        }
      })

      // Calcular tempo médio no pipeline (em horas)
      let tempoMedioTotal = 0
      let countComTempo = 0

      allLeads?.forEach(lead => {
        if (lead.created_at) {
          const createdAt = new Date(lead.created_at)
          const now = new Date()
          const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
          tempoMedioTotal += diffHours
          countComTempo++
        }
      })

      tempoMedioTotal = countComTempo > 0 ? tempoMedioTotal / countComTempo : 0

      // Calcular taxa de conversão
      const novos = leadsPorStatus.novo || 0
      const qualificados = leadsPorStatus.qualificado || 0
      const ganhos = leadsPorStatus.ganho || 0
      
      const taxaConversao = {
        novoParaContato: novos > 0 ? (leadsPorStatus.contato || 0) / novos : 0,
        contatoParaQualificado: (leadsPorStatus.contato || 0) > 0 
          ? qualificados / (leadsPorStatus.contato || 1) 
          : 0,
        qualificadoParaGanho: qualificados > 0 ? ganhos / qualificados : 0,
        geral: totalLeads > 0 ? ganhos / totalLeads : 0
      }

      // Leads por responsável
      const leadsPorResponsavel: Record<string, any> = {}
      
      allLeads?.forEach(lead => {
        const responsavel = lead.assigned_to || 'Não Atribuído'
        if (!leadsPorResponsavel[responsavel]) {
          leadsPorResponsavel[responsavel] = {
            total: 0,
            qualificados: 0,
            perdidos: 0,
            tempoMedio: 0,
            totalTempo: 0
          }
        }
        
        leadsPorResponsavel[responsavel].total++
        
        if (lead.qualification_status === 'qualificado') {
          leadsPorResponsavel[responsavel].qualificados++
        }
        if (lead.status === 'perdido') {
          leadsPorResponsavel[responsavel].perdidos++
        }
        
        if (lead.created_at) {
          const createdAt = new Date(lead.created_at)
          const now = new Date()
          const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
          leadsPorResponsavel[responsavel].totalTempo += diffHours
        }
      })

      // Calcular tempo médio por responsável
      Object.keys(leadsPorResponsavel).forEach(key => {
        const resp = leadsPorResponsavel[key]
        resp.tempoMedio = resp.total > 0 ? Math.round(resp.totalTempo / resp.total) : 0
        delete resp.totalTempo
      })

      // Tarefas vencidas (simulado - precisa de tabela de tarefas)
      const tarefasVencidas = 0

      // Leads sem contato em 24h - calcular a partir dos dados já carregados
      const ontem = new Date()
      ontem.setDate(ontem.getDate() - 1)
      
      let leadsSemContato24h = 0
      let leadsParaRecontato = 0

      // Calcular estatísticas a partir dos dados já carregados para evitar queries adicionais
      allLeads?.forEach(lead => {
        // Leads sem contato em 24h
        if (lead.status === 'novo' && lead.created_at) {
          const createdAt = new Date(lead.created_at)
          if (createdAt <= ontem) {
            leadsSemContato24h++
          }
        }
        
        // Leads para recontato
        if (lead.pipeline_stage === 'recontato') {
          leadsParaRecontato++
        }
      })

      const stats = {
        totalLeads,
        leadsPorEstagio,
        leadsPorStatus,
        tempoMedioPorEstagio: {
          novo_lead: tempoMedioTotal / 6,
          ligacao_1: tempoMedioTotal / 5,
          ligacao_2: tempoMedioTotal / 4,
          mensagem: tempoMedioTotal / 3,
          recontato: tempoMedioTotal / 2,
          desfecho: tempoMedioTotal
        },
        tempoMedioTotal,
        taxaConversao,
        leadsPorResponsavel,
        tarefasVencidas,
        leadsSemContato24h,
        leadsParaRecontato
      }

      // Salvar no cache
      this.setCache(cacheKey, stats, this.CACHE_TTL.PIPELINE_STATS)
      console.log('[LeadsService] Estatísticas salvas no cache')

      return stats
    } catch (error) {
      console.error('Erro ao buscar estatísticas do pipeline:', error)
      
      // Tentar retornar dados do cache mesmo expirado como fallback
      const expiredCache = this.cache.get(cacheKey)
      if (expiredCache) {
        console.log('[LeadsService] Retornando dados expirados do cache como fallback')
        return expiredCache.data
      }

      // Fallback com dados padrão mais robustos
      const fallbackStats = {
        totalLeads: 0,
        leadsPorEstagio: {
          novo_lead: 0,
          ligacao_1: 0,
          ligacao_2: 0,
          mensagem: 0,
          recontato: 0,
          desfecho: 0
        },
        leadsPorStatus: {
          novo: 0,
          em_contato: 0,
          qualificado: 0,
          nao_qualificado: 0
        },
        tempoMedioPorEstagio: {
          novo_lead: 0,
          ligacao_1: 0,
          ligacao_2: 0,
          mensagem: 0,
          recontato: 0,
          desfecho: 0
        },
        tempoMedioTotal: 0,
        taxaConversao: {
          novoParaContato: 0,
          contatoParaQualificado: 0,
          qualificadoParaGanho: 0,
          geral: 0
        },
        leadsPorResponsavel: {},
        tarefasVencidas: 0,
        leadsSemContato24h: 0,
        leadsParaRecontato: 0
      }

      console.log('[LeadsService] Retornando dados padrão como fallback')
      return fallbackStats
    }
  }
}

const leadsService = new LeadsService()
export default leadsService