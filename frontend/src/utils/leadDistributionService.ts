import { 
  LeadForm, 
  LeadPipelineCard, 
  LeadTask, 
  CommercialTeamMember, 
  LeadDistribution,
  LeadPipelineConfig 
} from '../types/crm'

// Dados da equipe comercial baseados no organograma
const COMMERCIAL_TEAM: CommercialTeamMember[] = [
  {
    id: '11',
    nome: 'Mariana Souza',
    email: 'mariana.souza@medstaff.com',
    cargo: 'Gerente Comercial',
    departamento: 'Comercial',
    ativo: true,
    capacidadeLeads: 15,
    leadsAtivos: 0,
    prioridade: 1,
    especialidades: ['pj', 'consultoria', 'assistencia']
  },
  {
    id: '12',
    nome: 'Diego Martins',
    email: 'diego.martins@medstaff.com',
    cargo: 'Analista Comercial',
    departamento: 'Comercial',
    ativo: true,
    capacidadeLeads: 10,
    leadsAtivos: 0,
    prioridade: 2,
    especialidades: ['pf', 'pj']
  },
  {
    id: '37',
    nome: 'Fernando Santos',
    email: 'fernando.santos@medstaff.com',
    cargo: 'Diretor Comercial',
    departamento: 'Diretoria Comercial e Marketing',
    ativo: true,
    capacidadeLeads: 5, // Diretor tem menos capacidade operacional
    leadsAtivos: 0,
    prioridade: 3,
    especialidades: ['consultoria', 'assistencia']
  }
]

// Configuração do pipeline
const PIPELINE_CONFIG: LeadPipelineConfig = {
  tempoLimiteContato: 24, // 24 horas
  tempoRecontato: 60, // 60 dias
  maxTentativasRedistribuicao: 3,
  notificarDiretorComercial: true,
  emailDiretorComercial: 'fernando.santos@medstaff.com',
  distribuicaoAutomatica: true,
  horarioComercial: {
    inicio: '08:00',
    fim: '18:00',
    diasSemana: [1, 2, 3, 4, 5] // Segunda a sexta
  }
}

class LeadDistributionService {
  private commercialTeam: CommercialTeamMember[] = [...COMMERCIAL_TEAM]
  private config: LeadPipelineConfig = PIPELINE_CONFIG

  /**
   * Distribui automaticamente um lead para o próximo responsável disponível
   */
  distribuirLead(lead: LeadForm): LeadDistribution {
    const responsavel = this.getProximoResponsavel(lead.produtosInteresse)
    
    if (!responsavel) {
      throw new Error('Nenhum responsável disponível para distribuição')
    }

    // Atualiza a capacidade do responsável
    this.atualizarCapacidadeResponsavel(responsavel.id, 1)

    const distribuicao: LeadDistribution = {
      id: this.generateId(),
      leadId: lead.id || this.generateId(),
      responsavelAtual: responsavel.id,
      motivo: 'distribuicao_inicial',
      dataDistribuicao: new Date(),
      observacoes: `Lead distribuído automaticamente para ${responsavel.nome} baseado na especialidade e capacidade`
    }

    return distribuicao
  }

  /**
   * Redistribui um lead quando há timeout ou falha
   */
  redistribuirLead(leadPipelineId: string, motivoRedistribuicao: string): LeadDistribution | null {
    const leadPipeline = this.getLeadPipeline(leadPipelineId)
    if (!leadPipeline) return null

    const responsavelAtual = this.commercialTeam.find(m => m.id === leadPipeline.responsavelAtual)
    if (!responsavelAtual) return null

    // Libera capacidade do responsável atual
    this.atualizarCapacidadeResponsavel(responsavelAtual.id, -1)

    // Busca próximo responsável (excluindo o atual)
    const novoResponsavel = this.getProximoResponsavel(
      leadPipeline.leadData.produtosInteresse,
      [responsavelAtual.id]
    )

    if (!novoResponsavel) {
      // Se não há mais responsáveis, retorna para o diretor comercial
      const diretor = this.commercialTeam.find(m => m.cargo.includes('Diretor'))
      if (diretor) {
        this.atualizarCapacidadeResponsavel(diretor.id, 1)
        
        return {
          id: this.generateId(),
          leadId: leadPipeline.leadId,
          responsavelAtual: diretor.id,
          responsavelAnterior: responsavelAtual.id,
          motivo: 'redistribuicao_timeout',
          dataDistribuicao: new Date(),
          observacoes: `Lead redistribuído para diretor após esgotamento da fila. Motivo: ${motivoRedistribuicao}`
        }
      }
      return null
    }

    // Atualiza capacidade do novo responsável
    this.atualizarCapacidadeResponsavel(novoResponsavel.id, 1)

    return {
      id: this.generateId(),
      leadId: leadPipeline.leadId,
      responsavelAtual: novoResponsavel.id,
      responsavelAnterior: responsavelAtual.id,
      motivo: 'redistribuicao_timeout',
      dataDistribuicao: new Date(),
      observacoes: `Lead redistribuído automaticamente. Motivo: ${motivoRedistribuicao}`
    }
  }

  /**
   * Redistribui um lead baseado no card do pipeline
   */
  async redistribuirLeadPorCard(
    lead: LeadPipelineCard,
    motivo: 'timeout' | 'falha_contato' | 'manual',
    observacoes?: string
  ): Promise<CommercialTeamMember | null> {
    const responsavelAtual = this.commercialTeam.find(m => m.id === lead.responsavelAtual)
    
    if (responsavelAtual) {
      // Liberar capacidade do responsável atual
      responsavelAtual.leadsAtivos = Math.max(0, responsavelAtual.leadsAtivos - 1)
    }

    // Se for timeout, escalar para diretor se necessário
    if (motivo === 'timeout') {
      const tentativasRedistribuicao = lead.stageHistory?.filter(
        h => h.observacoes?.includes('redistribuição')
      ).length || 0

      if (tentativasRedistribuicao >= 2) {
        // Escalar para diretor comercial
        const diretor = this.commercialTeam.find(m => m.cargo === 'Diretor Comercial')
        if (diretor && diretor.leadsAtivos < diretor.capacidadeLeads) {
          diretor.leadsAtivos += 1
          
          // Atualizar lead
          lead.responsavelAnterior = lead.responsavelAtual
          lead.responsavelAtual = diretor.id
          lead.dataDistribuicao = new Date()
          lead.dataUltimaAtualizacao = new Date()
          
          return diretor
        }
      }
    }

    // Redistribuição normal
    const novoResponsavel = this.getProximoResponsavel(
      this.getCategoriasFromProdutos(lead.leadData.produtosInteresse)
    )

    if (novoResponsavel) {
      this.atualizarCapacidadeResponsavel(novoResponsavel.id, 1)
      
      // Atualizar lead
      lead.responsavelAnterior = lead.responsavelAtual
      lead.responsavelAtual = novoResponsavel.id
      lead.dataDistribuicao = new Date()
      lead.dataUltimaAtualizacao = new Date()
      
      return novoResponsavel
    }

    return null
  }

  /**
   * Processa redistribuições automáticas por timeout
   */
  async processarRedistribuicoesAutomaticas(leads: LeadPipelineCard[]): Promise<{
    redistribuidos: LeadPipelineCard[]
    escalados: LeadPipelineCard[]
    falhas: LeadPipelineCard[]
  }> {
    const agora = new Date()
    const tempoLimite = this.config.tempoLimiteContato * 60 * 60 * 1000 // converter para ms
    
    const redistribuidos: LeadPipelineCard[] = []
    const escalados: LeadPipelineCard[] = []
    const falhas: LeadPipelineCard[] = []

    for (const lead of leads) {
      // Verificar se o lead está no estágio inicial e passou do tempo limite
      if (lead.currentStage === 'novo_lead' && lead.status === 'ativo') {
        const tempoNoEstagio = agora.getTime() - lead.dataDistribuicao.getTime()
        
        if (tempoNoEstagio > tempoLimite) {
          try {
            const novoResponsavel = await this.redistribuirLeadPorCard(lead, 'timeout', 'Timeout automático')
            
            if (novoResponsavel) {
              if (novoResponsavel.cargo === 'Diretor Comercial') {
                escalados.push(lead)
              } else {
                redistribuidos.push(lead)
              }
            } else {
              falhas.push(lead)
            }
          } catch (error) {
            console.error(`Erro ao redistribuir lead ${lead.id}:`, error)
            falhas.push(lead)
          }
        }
      }
    }

    return {
      redistribuidos,
      escalados,
      falhas
    }
  }

  /**
   * Obtém o diretor comercial
   */
  getDiretorComercial(): CommercialTeamMember | null {
    return this.commercialTeam.find(m => m.cargo === 'Diretor Comercial' && m.ativo) || null
  }

  /**
   * Verifica capacidade da equipe
   */
  async verificarCapacidadeEquipe(): Promise<{
    membrosDisponiveis: CommercialTeamMember[]
    membrosLotados: CommercialTeamMember[]
    capacidadeTotal: number
    capacidadeUsada: number
    percentualUso: number
  }> {
    const membrosAtivos = this.commercialTeam.filter(m => m.ativo)
    const membrosDisponiveis = membrosAtivos.filter(m => m.leadsAtivos < m.capacidadeLeads)
    const membrosLotados = membrosAtivos.filter(m => m.leadsAtivos >= m.capacidadeLeads)
    
    const capacidadeTotal = membrosAtivos.reduce((total, m) => total + m.capacidadeLeads, 0)
    const capacidadeUsada = membrosAtivos.reduce((total, m) => total + m.leadsAtivos, 0)
    const percentualUso = capacidadeTotal > 0 ? (capacidadeUsada / capacidadeTotal) * 100 : 0

    return {
      membrosDisponiveis,
      membrosLotados,
      capacidadeTotal,
      capacidadeUsada,
      percentualUso
    }
  }

  /**
   * Cria tarefa automática para contato inicial
   */
  criarTarefaContatoInicial(leadPipelineCard: LeadPipelineCard): LeadTask {
    const dataVencimento = new Date()
    dataVencimento.setHours(dataVencimento.getHours() + this.config.tempoLimiteContato)

    const tarefa: LeadTask = {
      id: this.generateId(),
      leadPipelineId: leadPipelineCard.id,
      titulo: 'Contato inicial com lead',
      descricao: `Realizar primeiro contato com ${leadPipelineCard.leadData.nome} - ${leadPipelineCard.leadData.empresa || 'Pessoa Física'}`,
      tipo: 'contato_inicial',
      status: 'pendente',
      prioridade: 'alta',
      responsavel: leadPipelineCard.responsavelAtual,
      dataVencimento,
      dataCriacao: new Date(),
      tentativasRedistribuicao: 0,
      maxTentativasRedistribuicao: this.config.maxTentativasRedistribuicao,
      notificacoes: [
        {
          tipo: 'criacao',
          destinatario: leadPipelineCard.responsavelAtual,
          dataEnvio: new Date(),
          lida: false
        }
      ]
    }

    // Notifica diretor comercial se configurado
    if (this.config.notificarDiretorComercial) {
      tarefa.notificacoes.push({
        tipo: 'criacao',
        destinatario: this.config.emailDiretorComercial,
        dataEnvio: new Date(),
        lida: false
      })
    }

    return tarefa
  }

  /**
   * Verifica tarefas vencidas e redistribui automaticamente
   */
  verificarTarefasVencidas(): LeadDistribution[] {
    const redistribuicoes: LeadDistribution[] = []
    const agora = new Date()

    // Simular busca de tarefas vencidas (em produção viria do banco de dados)
    const tarefasVencidas = this.getTarefasVencidas()

    for (const tarefa of tarefasVencidas) {
      if (tarefa.tentativasRedistribuicao < tarefa.maxTentativasRedistribuicao) {
        // Marca tarefa como vencida
        tarefa.status = 'vencida'
        tarefa.observacoes = (tarefa.observacoes || '') + '\nTarefa vencida - não houve contato com o cliente'

        // Redistribui o lead
        const redistribuicao = this.redistribuirLead(
          tarefa.leadPipelineId,
          'Timeout - tarefa não concluída no prazo'
        )

        if (redistribuicao) {
          redistribuicoes.push(redistribuicao)
          
          // Cria nova tarefa para o novo responsável
          const leadPipeline = this.getLeadPipeline(tarefa.leadPipelineId)
          if (leadPipeline) {
            leadPipeline.responsavelAtual = redistribuicao.responsavelAtual
            const novaTarefa = this.criarTarefaContatoInicial(leadPipeline)
            novaTarefa.tentativasRedistribuicao = tarefa.tentativasRedistribuicao + 1
          }
        }
      }
    }

    return redistribuicoes
  }

  /**
   * Obtém o próximo responsável disponível baseado na especialidade e capacidade
   */
  private getProximoResponsavel(
    produtosInteresse: string[], 
    excluirIds: string[] = []
  ): CommercialTeamMember | null {
    // Filtra responsáveis ativos e disponíveis
    const responsaveisDisponiveis = this.commercialTeam.filter(membro => 
      membro.ativo && 
      membro.leadsAtivos < membro.capacidadeLeads &&
      !excluirIds.includes(membro.id)
    )

    if (responsaveisDisponiveis.length === 0) return null

    // Busca por especialidade primeiro
    const especialistas = responsaveisDisponiveis.filter(membro => {
      const categoriasProdutos = this.getCategoriasFromProdutos(produtosInteresse)
      return categoriasProdutos.some(categoria => membro.especialidades.includes(categoria))
    })

    const candidatos = especialistas.length > 0 ? especialistas : responsaveisDisponiveis

    // Ordena por prioridade e depois por menor carga de trabalho
    candidatos.sort((a, b) => {
      if (a.prioridade !== b.prioridade) {
        return a.prioridade - b.prioridade
      }
      return a.leadsAtivos - b.leadsAtivos
    })

    return candidatos[0]
  }

  /**
   * Atualiza a capacidade de leads de um responsável
   */
  private atualizarCapacidadeResponsavel(responsavelId: string, incremento: number): void {
    const responsavel = this.commercialTeam.find(m => m.id === responsavelId)
    if (responsavel) {
      responsavel.leadsAtivos = Math.max(0, responsavel.leadsAtivos + incremento)
    }
  }

  /**
   * Obtém categorias dos produtos de interesse
   */
  private getCategoriasFromProdutos(produtosIds: string[]): string[] {
    // Mapeamento simplificado - em produção viria do banco de dados
    const mapeamento: Record<string, string> = {
      'abertura-gestao-pj': 'pj',
      'alteracao-gestao-pj': 'pj',
      'dirpf': 'pf',
      'pj-medstaff-15': 'pj',
      'consultoria-clinicas': 'consultoria',
      'planejamento-financeiro-pf': 'pf',
      'auxilio-moradia': 'assistencia',
      'equiparacao-hospitalar': 'consultoria',
      'recuperacao-tributaria-pj': 'pj',
      'restituicao-previdenciaria-pf': 'pf',
      'medassist': 'assistencia'
    }

    // Validar se produtosIds existe e é um array
    if (!produtosIds || !Array.isArray(produtosIds)) {
      return []
    }
    
    return [...new Set(produtosIds.map(id => mapeamento[id]).filter(Boolean))]
  }

  /**
   * Gera ID único
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * Simula busca de lead pipeline (em produção viria do banco de dados)
   */
  private getLeadPipeline(id: string): LeadPipelineCard | null {
    // Implementação simulada - em produção buscaria do banco de dados
    return null
  }

  /**
   * Simula busca de tarefas vencidas (em produção viria do banco de dados)
   */
  private getTarefasVencidas(): LeadTask[] {
    // Implementação simulada - em produção buscaria do banco de dados
    return []
  }

  /**
   * Obtém estatísticas da equipe comercial
   */
  getEstatisticasEquipe() {
    return {
      totalMembros: this.commercialTeam.length,
      membrosAtivos: this.commercialTeam.filter(m => m.ativo).length,
      capacidadeTotal: this.commercialTeam.reduce((acc, m) => acc + m.capacidadeLeads, 0),
      leadsAtivos: this.commercialTeam.reduce((acc, m) => acc + m.leadsAtivos, 0),
      utilizacao: this.commercialTeam.reduce((acc, m) => acc + (m.leadsAtivos / m.capacidadeLeads), 0) / this.commercialTeam.length
    }
  }

  /**
   * Obtém configuração do pipeline
   */
  getConfig(): LeadPipelineConfig {
    return { ...this.config }
  }

  /**
   * Atualiza configuração do pipeline
   */
  updateConfig(novaConfig: Partial<LeadPipelineConfig>): void {
    this.config = { ...this.config, ...novaConfig }
  }
}

export const leadDistributionService = new LeadDistributionService()
export default leadDistributionService