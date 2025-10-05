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

class LeadsService {
  private subscribers: Array<(leads: LeadPipelineCard[]) => void> = []

  constructor() {
    // Não precisamos mais inicializar dados mockados
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
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select(`
          *,
          tasks:tasks(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar leads:', error)
        return []
      }

      return leads.map(lead => this.mapDatabaseLeadToPipelineCard(lead))
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
      return []
    }
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
        produtosInteresse: dbLead.products_interest || [],
        origem: dbLead.source || 'site',
        status: dbLead.status || 'novo',
        dataCriacao: dbLead.created_at,
        criadoPor: dbLead.created_by || 'sistema'
      },
      currentStage: (dbLead.pipeline_stage || 'novo_lead') as LeadPipelineStage,
      status: dbLead.qualification_status || 'nao_definido',
      responsavelAtual: dbLead.assigned_to,
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
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar leads para contatos:', error)
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

  // Criar novo lead
  async createLead(leadData: LeadForm): Promise<LeadPipelineCard> {
    try {
      const newLead = {
        name: leadData.nome,
        email: leadData.email,
        phone: leadData.telefone,
        company: leadData.empresa,
        position: leadData.cargo,
        city: leadData.cidade,
        state: leadData.estado,
        products_interest: leadData.produtosInteresse,
        source: leadData.origem || 'site',
        status: 'novo',
        pipeline_stage: 'novo_lead',
        qualification_status: 'nao_definido',
        created_by: 'sistema',
        stage_changed_at: new Date().toISOString(),
        stage_history: JSON.stringify([{
          stage: 'novo_lead',
          responsavel: null,
          dataInicio: new Date(),
          observacoes: 'Lead criado automaticamente'
        }]),
        contact_attempts: JSON.stringify([])
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
       const distribuicao = leadDistributionService.distribuirLead(createdLead)
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
      // Buscar lead atual para obter histórico
      const { data: currentLead, error: fetchError } = await supabase
        .from('leads')
        .select('stage_history, assigned_to')
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

      const { error } = await supabase
        .from('leads')
        .update({
          pipeline_stage: newStage,
          stage_changed_at: new Date().toISOString(),
          stage_history: JSON.stringify(updatedHistory),
          updated_at: new Date().toISOString()
        })
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
          disqualification_reason: disqualificationReason,
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
      const { data: leads, error } = await supabase
        .from('leads')
        .select('disqualification_reason')
        .eq('qualification_status', 'desqualificado')
        .not('disqualification_reason', 'is', null)

      if (error) {
        console.error('Erro ao buscar estatísticas de desqualificação:', error)
        return {}
      }

      const stats: Record<string, number> = {}
      leads.forEach(lead => {
        const reason = lead.disqualification_reason
        if (reason) {
          stats[reason] = (stats[reason] || 0) + 1
        }
      })

      return stats
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
      const { data: leads, error } = await supabase
        .from('leads')
        .select('disqualification_reason')
        .eq('qualification_status', 'desqualificado')
        .gte('disqualified_at', startDate.toISOString())
        .lte('disqualified_at', endDate.toISOString())
        .not('disqualification_reason', 'is', null)

      if (error) {
        console.error('Erro ao buscar estatísticas de desqualificação por período:', error)
        return {}
      }

      const stats: Record<string, number> = {}
      leads.forEach(lead => {
        const reason = lead.disqualification_reason
        if (reason) {
          stats[reason] = (stats[reason] || 0) + 1
        }
      })

      return stats
    } catch (error) {
      console.error('Erro ao buscar estatísticas de desqualificação por período:', error)
      return {}
    }
  }
}

const leadsService = new LeadsService()
export default leadsService