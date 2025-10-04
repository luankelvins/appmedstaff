import { LeadForm, LeadPipelineCard, LeadPipelineStage, ContactAttempt } from '../types/crm'
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
  private leads: LeadPipelineCard[] = []
  private subscribers: Array<(leads: LeadPipelineCard[]) => void> = []

  constructor() {
    this.initializeMockData()
  }

  // Inicializa com dados mock unificados
  private initializeMockData() {
    this.leads = [
      {
        id: '1',
        leadId: 'lead-1',
        leadData: {
          id: 'lead-1',
          nome: 'Dr. João Silva',
          telefone: '(11) 99999-9999',
          email: 'joao.silva@clinica.com',
          empresa: 'Clínica São João',
          cargo: 'Diretor Médico',
          cidade: 'São Paulo',
          estado: 'SP',
          produtosInteresse: ['consultoria-clinicas', 'pj-medstaff-15'],
          origem: 'site',
          status: 'novo',
          dataCriacao: new Date().toISOString(),
          criadoPor: 'sistema'
        },
        currentStage: 'novo_lead',
        status: 'nao_definido',
        responsavelAtual: '11',
        dataDistribuicao: new Date(),
        dataUltimaAtualizacao: new Date(),
        tempoNoEstagio: 2,
        tempoTotalPipeline: 2,
        stageHistory: [
          {
            stage: 'novo_lead',
            responsavel: '11',
            dataInicio: new Date(),
            observacoes: 'Lead criado automaticamente'
          }
        ],
        contactAttempts: [],
        tasks: [
          {
            id: 'task-1',
            leadPipelineId: '1',
            titulo: 'Contato inicial com lead',
            descricao: 'Realizar primeiro contato com Dr. João Silva - Clínica São João',
            tipo: 'contato_inicial',
            status: 'pendente',
            prioridade: 'alta',
            responsavel: '11',
            dataVencimento: new Date(Date.now() + 24 * 60 * 60 * 1000),
            dataCriacao: new Date(),
            tentativasRedistribuicao: 0,
            maxTentativasRedistribuicao: 3,
            notificacoes: []
          }
        ],
        observacoes: 'Lead interessado em consultoria para abertura de clínica',
        criadoPor: 'sistema',
        dataCriacao: new Date()
      },
      {
        id: '2',
        leadId: 'lead-2',
        leadData: {
          id: 'lead-2',
          nome: 'Dra. Maria Santos',
          telefone: '(11) 88888-8888',
          email: 'maria.santos@hospital.com',
          empresa: 'Hospital Central',
          cargo: 'Diretora Médica',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          produtosInteresse: ['dirpf', 'planejamento-financeiro-pf'],
          origem: 'indicacao',
          status: 'contatado',
          dataCriacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          criadoPor: 'sistema'
        },
        currentStage: 'ligacao_1',
        status: 'qualificado',
        responsavelAtual: '12',
        dataDistribuicao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        dataUltimaAtualizacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tempoNoEstagio: 24,
        tempoTotalPipeline: 72,
        stageHistory: [
          {
            stage: 'novo_lead',
            responsavel: '12',
            dataInicio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            dataFim: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            tempoNoEstagio: 24,
            observacoes: 'Lead distribuído automaticamente'
          },
          {
            stage: 'ligacao_1',
            responsavel: '12',
            dataInicio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            observacoes: 'Primeira tentativa de contato realizada'
          }
        ],
        contactAttempts: [
          {
            id: 'contact-1',
            leadPipelineId: '2',
            tipo: 'ligacao',
            resultado: 'sem_resposta',
            dataContato: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            responsavel: '12',
            duracao: 0,
            observacoes: 'Ligação não atendida, deixado recado'
          }
        ],
        tasks: [],
        observacoes: 'Lead interessado em planejamento financeiro',
        criadoPor: 'sistema',
        dataCriacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        leadId: 'lead-3',
        leadData: {
          id: 'lead-3',
          nome: 'Dr. Carlos Oliveira',
          telefone: '(11) 77777-7777',
          email: 'carlos.oliveira@email.com',
          empresa: 'Consultório Médico',
          cargo: 'Médico',
          cidade: 'São Paulo',
          estado: 'SP',
          produtosInteresse: ['consultoria-clinicas'],
          origem: 'indicacao',
          status: 'novo',
          dataCriacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          criadoPor: 'sistema'
        },
        currentStage: 'novo_lead',
        status: 'nao_qualificado',
        responsavelAtual: '11',
        dataDistribuicao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        dataUltimaAtualizacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tempoNoEstagio: 24,
        tempoTotalPipeline: 24,
        stageHistory: [
          {
            stage: 'novo_lead',
            responsavel: '11',
            dataInicio: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            observacoes: 'Lead criado por indicação'
          }
        ],
        contactAttempts: [],
        tasks: [],
        observacoes: 'Lead indicado por cliente existente',
        criadoPor: 'sistema',
        dataCriacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]
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
    this.subscribers.forEach(callback => callback([...this.leads]))
  }

  // Obter todos os leads
  getAllLeads(): LeadPipelineCard[] {
    return [...this.leads]
  }

  // Obter leads formatados para a aba Contatos
  getContactLeads(): ContactLead[] {
    return this.leads.map(lead => {
      const lastContactDate = lead.contactAttempts.length > 0 
        ? new Date(Math.max(...lead.contactAttempts.map(c => new Date(c.dataContato).getTime())))
        : undefined;
      
      return {
        id: lead.id,
        name: lead.leadData.nome,
        email: lead.leadData.email || '',
        phone: lead.leadData.telefone,
        type: 'lead' as const,
        company: lead.leadData.empresa,
        position: lead.leadData.cargo,
        city: lead.leadData.cidade,
        state: lead.leadData.estado,
        status: this.mapPipelineStatusToContactStatus(lead.status),
        createdAt: lead.dataCriacao,
        lastContact: lastContactDate,
        dataUltimoContato: lastContactDate,
        notes: lead.observacoes,
        pipelineStage: lead.currentStage,
        motivoDesqualificacao: lead.status === 'nao_qualificado'
          ? lead.outcome?.motivo || 'Não informado'
          : undefined
      }
    })
  }

  // Mapear status do pipeline para status de contato
  private mapPipelineStatusToContactStatus(pipelineStatus: string): 'qualificado' | 'nao_qualificado' | 'nao_definido' {
    switch (pipelineStatus) {
      case 'qualificado':
        return 'qualificado'
      case 'nao_qualificado':
      case 'perdido':
        return 'nao_qualificado'
      default:
        return 'nao_definido'
    }
  }

  // Criar novo lead
  async createLead(leadData: LeadForm): Promise<LeadPipelineCard> {
    try {
      // Distribui o lead automaticamente
      const distribuicao = leadDistributionService.distribuirLead(leadData)
      
      // Cria o card do pipeline
      const newLeadCard: LeadPipelineCard = {
        id: Date.now().toString(),
        leadId: leadData.id || Date.now().toString(),
        leadData,
        currentStage: 'novo_lead',
        status: 'nao_definido',
        responsavelAtual: distribuicao.responsavelAtual,
        dataDistribuicao: distribuicao.dataDistribuicao,
        dataUltimaAtualizacao: new Date(),
        tempoNoEstagio: 0,
        tempoTotalPipeline: 0,
        stageHistory: [
          {
            stage: 'novo_lead',
            responsavel: distribuicao.responsavelAtual,
            dataInicio: new Date(),
            observacoes: 'Lead criado e distribuído automaticamente'
          }
        ],
        contactAttempts: [],
        tasks: [],
        observacoes: leadData.observacoes,
        criadoPor: 'usuario_atual',
        dataCriacao: new Date()
      }

      // Cria tarefa automática no banco de dados
      const tarefa = await leadTaskService.criarTarefaAutomatica(
        newLeadCard.id,
        newLeadCard.responsavelAtual,
        'initial_contact'
      )
      newLeadCard.tasks = [tarefa]

      this.leads.unshift(newLeadCard)
      this.notifySubscribers()
      
      return newLeadCard
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      throw error
    }
  }

  // Atualizar estágio do lead
  updateLeadStage(leadId: string, newStage: LeadPipelineStage): void {
    const leadIndex = this.leads.findIndex(lead => lead.id === leadId)
    if (leadIndex === -1) return

    const lead = this.leads[leadIndex]
    const now = new Date()
    const currentStageHistory = lead.stageHistory.find(h => h.stage === lead.currentStage && !h.dataFim)
    
    if (currentStageHistory) {
      currentStageHistory.dataFim = now
      currentStageHistory.tempoNoEstagio = (now.getTime() - currentStageHistory.dataInicio.getTime()) / (1000 * 60 * 60)
    }

    this.leads[leadIndex] = {
      ...lead,
      currentStage: newStage,
      dataUltimaAtualizacao: now,
      tempoNoEstagio: 0,
      stageHistory: [
        ...lead.stageHistory,
        {
          stage: newStage,
          responsavel: lead.responsavelAtual,
          dataInicio: now,
          observacoes: `Movido para ${newStage}`
        }
      ]
    }

    this.notifySubscribers()
  }

  // Adicionar tentativa de contato
  addContactAttempt(leadId: string, attempt: Omit<ContactAttempt, 'id' | 'leadPipelineId'>): void {
    const leadIndex = this.leads.findIndex(lead => lead.id === leadId)
    if (leadIndex === -1) return

    const newAttempt: ContactAttempt = {
      ...attempt,
      id: Date.now().toString(),
      leadPipelineId: leadId
    }

    this.leads[leadIndex] = {
      ...this.leads[leadIndex],
      contactAttempts: [...this.leads[leadIndex].contactAttempts, newAttempt],
      dataUltimaAtualizacao: new Date()
    }

    this.notifySubscribers()
  }

  // Completar tarefa
  completeTask(taskId: string): void {
    this.leads = this.leads.map(lead => ({
      ...lead,
      tasks: lead.tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'concluida' as const, dataConclusao: new Date() }
          : task
      )
    }))
    
    this.notifySubscribers()
  }

  // Qualificar lead - criar cards para pipelines selecionados
  qualifyLead(leadId: string, selectedPipelines: string[]): void {
    const lead = this.getLeadById(leadId)
    if (!lead) {
      throw new Error('Lead não encontrado')
    }

    // Atualizar status do lead original para qualificado
    this.leads = this.leads.map(l => 
      l.id === leadId 
        ? {
            ...l,
            status: 'qualificado' as const,
            currentStage: 'desfecho',
            dataUltimaAtualizacao: new Date(),
            observacoes: `${l.observacoes || ''}\n\nLead qualificado em ${new Date().toLocaleDateString()} para os pipelines: ${selectedPipelines.join(', ')}`,
            outcome: {
              qualificacao: 'qualificado' as const,
              motivo: `Qualificado para pipelines: ${selectedPipelines.join(', ')}`,
              dataDesfecho: new Date(),
              responsavelDesfecho: l.responsavelAtual
            }
          }
        : l
    )

    // Criar novos cards para cada pipeline selecionado
    selectedPipelines.forEach(pipelineId => {
      const newLeadCard: LeadPipelineCard = {
        id: `${leadId}-${pipelineId}-${Date.now()}`,
        leadId: `${lead.leadId}-${pipelineId}`,
        leadData: {
          ...lead.leadData,
          id: `${lead.leadData.id}-${pipelineId}`,
          status: 'qualificado'
        },
        currentStage: 'novo_lead',
        status: 'nao_definido',
        responsavelAtual: lead.responsavelAtual,
        dataDistribuicao: new Date(),
        dataUltimaAtualizacao: new Date(),
        tempoNoEstagio: 0,
        tempoTotalPipeline: 0,
        stageHistory: [
          {
            stage: 'novo_lead',
            responsavel: lead.responsavelAtual,
            dataInicio: new Date(),
            observacoes: `Lead qualificado do pipeline original (${leadId}) para ${pipelineId}`
          }
        ],
        contactAttempts: [],
        tasks: [
          {
            id: `task-${Date.now()}-${pipelineId}`,
            leadPipelineId: `${leadId}-${pipelineId}-${Date.now()}`,
            titulo: `Contato inicial - Pipeline ${pipelineId.toUpperCase()}`,
            descricao: `Realizar primeiro contato para ${pipelineId} com ${lead.leadData.nome}`,
            tipo: 'contato_inicial',
            status: 'pendente',
            prioridade: 'alta',
            responsavel: lead.responsavelAtual,
            dataVencimento: new Date(Date.now() + 24 * 60 * 60 * 1000),
            dataCriacao: new Date(),
            tentativasRedistribuicao: 0,
            maxTentativasRedistribuicao: 3,
            notificacoes: []
          }
        ],
        observacoes: `Lead qualificado do pipeline original para ${pipelineId}`,
        criadoPor: 'sistema-qualificacao',
        dataCriacao: new Date()
      }

      this.leads.push(newLeadCard)
    })

    this.notifySubscribers()
  }

  // Desqualificar lead
  disqualifyLead(leadId: string, reason: string, customReason?: string): void {
    const lead = this.getLeadById(leadId)
    if (!lead) {
      throw new Error('Lead não encontrado')
    }

    const finalReason = customReason || reason
    const now = new Date()

    this.leads = this.leads.map(l => 
      l.id === leadId 
        ? {
            ...l,
            status: 'nao_qualificado' as const,
            currentStage: 'desfecho',
            dataUltimaAtualizacao: now,
            observacoes: `${l.observacoes || ''}\n\nLead desqualificado em ${now.toLocaleDateString()}\nMotivo: ${finalReason}`,
            stageHistory: [
              ...l.stageHistory,
              {
                stage: 'desfecho',
                responsavel: l.responsavelAtual,
                dataInicio: now,
                observacoes: `Desqualificado - ${finalReason}`
              }
            ]
          }
        : l
    )

    this.notifySubscribers()
  }

  // Obter lead por ID
  getLeadById(leadId: string): LeadPipelineCard | undefined {
    return this.leads.find(lead => lead.id === leadId)
  }

  // Buscar leads por pipeline (usando observações para identificar pipeline)
  getLeadsByPipeline(pipeline: string): LeadPipelineCard[] {
    return this.leads.filter(lead => 
      lead.observacoes?.includes(`pipeline original para ${pipeline}`) || 
      lead.observacoes?.includes(`Pipeline ${pipeline.toUpperCase()}`)
    )
  }

  // Buscar leads qualificados
  getQualifiedLeads(): LeadPipelineCard[] {
    return this.leads.filter(lead => lead.status === 'qualificado')
  }

  // Buscar leads desqualificados
  getDisqualifiedLeads(): LeadPipelineCard[] {
    return this.leads.filter(lead => lead.status === 'nao_qualificado')
  }

  // Obter estatísticas de motivos de desqualificação
  getDisqualificationStats(): Record<string, number> {
    const disqualifiedLeads = this.getDisqualifiedLeads()
    const stats: Record<string, number> = {}
    
    disqualifiedLeads.forEach(lead => {
      const motivo = lead.outcome?.motivo || 'Não informado'
      stats[motivo] = (stats[motivo] || 0) + 1
    })
    
    return stats
  }

  // Obter leads desqualificados por período
  getDisqualifiedLeadsByPeriod(startDate: Date, endDate: Date): LeadPipelineCard[] {
    return this.getDisqualifiedLeads().filter(lead => {
      if (!lead.outcome?.dataDesfecho) return false
      const desfechoDate = new Date(lead.outcome.dataDesfecho)
      return desfechoDate >= startDate && desfechoDate <= endDate
    })
  }

  // Obter estatísticas de motivos por período
  getDisqualificationStatsByPeriod(startDate: Date, endDate: Date): Record<string, number> {
    const disqualifiedLeads = this.getDisqualifiedLeadsByPeriod(startDate, endDate)
    const stats: Record<string, number> = {}
    
    disqualifiedLeads.forEach(lead => {
      const motivo = lead.outcome?.motivo || 'Não informado'
      stats[motivo] = (stats[motivo] || 0) + 1
    })
    
    return stats
  }
}

// Instância singleton
const leadsService = new LeadsService()
export default leadsService