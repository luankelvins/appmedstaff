import { LeadPipelineCard, CommercialTeamMember } from '../types/crm'
import { leadDistributionService } from './leadDistributionService'
import { leadTaskService } from './leadTaskService'
import { leadMonitoringService } from './leadMonitoringService'

export interface DirectorAlert {
  id: string
  type: 'escalation' | 'capacity_critical' | 'performance_issue' | 'timeout_pattern' | 'team_overload'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: Date
  leadId?: string
  responsavelId?: string
  actionRequired: boolean
  autoResolve: boolean
  resolved: boolean
  resolvedAt?: Date
  metadata?: Record<string, any>
}

export interface DirectorDashboardData {
  alerts: DirectorAlert[]
  teamPerformance: {
    memberId: string
    nome: string
    leadsAtivos: number
    capacidadeLeads: number
    utilizacao: number
    tarefasVencidas: number
    tempoMedioResposta: number
    taxaConversao: number
  }[]
  pipelineHealth: {
    totalLeads: number
    leadsEscalados: number
    leadsTimeout: number
    tempoMedioNoEstagio: number
    gargalos: string[]
  }
  recommendations: {
    id: string
    type: 'hire' | 'redistribute' | 'training' | 'process_improvement'
    priority: 'low' | 'medium' | 'high'
    title: string
    description: string
    impact: string
  }[]
}

class DirectorNotificationService {
  private alerts: DirectorAlert[] = []
  private alertHistory: DirectorAlert[] = []
  private thresholds = {
    capacidadeCritica: 90, // % de capacidade para alerta crítico
    capacidadeAlta: 75, // % de capacidade para alerta médio
    tarefasVencidasCritico: 10, // número de tarefas vencidas para alerta crítico
    tarefasVencidasAlto: 5, // número de tarefas vencidas para alerta alto
    tempoRespostaCritico: 48, // horas para resposta crítica
    taxaConversaoMinima: 15, // % mínima de conversão
    escalacoesDiarias: 3 // número máximo de escalações por dia
  }

  /**
   * Analisa a situação atual e gera alertas para o diretor
   */
  async analisarSituacao(): Promise<DirectorAlert[]> {
    const novosAlertas: DirectorAlert[] = []

    try {
      // Analisar capacidade da equipe
      const capacidadeEquipe = await leadDistributionService.verificarCapacidadeEquipe()
      novosAlertas.push(...this.analisarCapacidadeEquipe(capacidadeEquipe))

      // Analisar performance das tarefas
      const statsTask = await leadTaskService.getEstatisticasTarefas()
      novosAlertas.push(...this.analisarPerformanceTarefas(statsTask))

      // Analisar padrões de escalação
      const statsMonitoramento = leadMonitoringService.obterEstatisticas()
      novosAlertas.push(...this.analisarPadroesEscalacao(statsMonitoramento))

      // Analisar performance individual da equipe
      novosAlertas.push(...await this.analisarPerformanceIndividual())

      // Adicionar novos alertas
      this.adicionarAlertas(novosAlertas)

      // Resolver alertas automaticamente quando aplicável
      this.resolverAlertasAutomaticos()

      return this.alerts.filter(a => !a.resolved)

    } catch (error) {
      console.error('Erro ao analisar situação para diretor:', error)
      return []
    }
  }

  /**
   * Analisa capacidade da equipe
   */
  private analisarCapacidadeEquipe(capacidade: any): DirectorAlert[] {
    const alertas: DirectorAlert[] = []

    if (capacidade.percentualUso >= this.thresholds.capacidadeCritica) {
      alertas.push({
        id: `capacity_critical_${Date.now()}`,
        type: 'capacity_critical',
        severity: 'critical',
        title: 'Capacidade da Equipe Crítica',
        description: `A equipe está operando em ${capacidade.percentualUso.toFixed(1)}% da capacidade máxima. Risco de sobrecarga e queda na qualidade do atendimento.`,
        timestamp: new Date(),
        actionRequired: true,
        autoResolve: true,
        resolved: false,
        metadata: {
          percentualUso: capacidade.percentualUso,
          membrosLotados: capacidade.membrosLotados.length,
          capacidadeTotal: capacidade.capacidadeTotal,
          capacidadeUsada: capacidade.capacidadeUsada
        }
      })
    } else if (capacidade.percentualUso >= this.thresholds.capacidadeAlta) {
      alertas.push({
        id: `capacity_high_${Date.now()}`,
        type: 'team_overload',
        severity: 'medium',
        title: 'Capacidade da Equipe Alta',
        description: `A equipe está operando em ${capacidade.percentualUso.toFixed(1)}% da capacidade. Considere redistribuir leads ou contratar mais pessoas.`,
        timestamp: new Date(),
        actionRequired: false,
        autoResolve: true,
        resolved: false,
        metadata: {
          percentualUso: capacidade.percentualUso,
          membrosDisponiveis: capacidade.membrosDisponiveis.length
        }
      })
    }

    return alertas
  }

  /**
   * Analisa performance das tarefas
   */
  private analisarPerformanceTarefas(stats: any): DirectorAlert[] {
    const alertas: DirectorAlert[] = []

    if (stats.vencidas >= this.thresholds.tarefasVencidasCritico) {
      alertas.push({
        id: `tasks_overdue_critical_${Date.now()}`,
        type: 'performance_issue',
        severity: 'critical',
        title: 'Muitas Tarefas Vencidas',
        description: `${stats.vencidas} tarefas estão vencidas. Isso pode indicar sobrecarga da equipe ou problemas de processo.`,
        timestamp: new Date(),
        actionRequired: true,
        autoResolve: false,
        resolved: false,
        metadata: {
          tarefasVencidas: stats.vencidas,
          totalTarefas: stats.total,
          percentualVencidas: (stats.vencidas / stats.total) * 100
        }
      })
    } else if (stats.vencidas >= this.thresholds.tarefasVencidasAlto) {
      alertas.push({
        id: `tasks_overdue_high_${Date.now()}`,
        type: 'performance_issue',
        severity: 'high',
        title: 'Tarefas Vencidas Aumentando',
        description: `${stats.vencidas} tarefas estão vencidas. Monitore a situação para evitar acúmulo.`,
        timestamp: new Date(),
        actionRequired: false,
        autoResolve: true,
        resolved: false,
        metadata: {
          tarefasVencidas: stats.vencidas
        }
      })
    }

    return alertas
  }

  /**
   * Analisa padrões de escalação
   */
  private analisarPadroesEscalacao(stats: any): DirectorAlert[] {
    const alertas: DirectorAlert[] = []

    if (stats.totalEscalacoes > this.thresholds.escalacoesDiarias) {
      alertas.push({
        id: `escalation_pattern_${Date.now()}`,
        type: 'escalation',
        severity: 'high',
        title: 'Padrão de Escalações Elevado',
        description: `${stats.totalEscalacoes} leads foram escalados recentemente. Isso pode indicar problemas na distribuição inicial ou capacitação da equipe.`,
        timestamp: new Date(),
        actionRequired: true,
        autoResolve: false,
        resolved: false,
        metadata: {
          totalEscalacoes: stats.totalEscalacoes,
          totalRedistribuicoes: stats.totalRedistribuicoes
        }
      })
    }

    return alertas
  }

  /**
   * Analisa performance individual da equipe
   */
  private async analisarPerformanceIndividual(): Promise<DirectorAlert[]> {
    const alertas: DirectorAlert[] = []
    
    // Em uma implementação real, isso viria do banco de dados
    // Por enquanto, simulamos alguns cenários
    
    return alertas
  }

  /**
   * Adiciona novos alertas evitando duplicatas
   */
  private adicionarAlertas(novosAlertas: DirectorAlert[]): void {
    for (const novoAlerta of novosAlertas) {
      // Verificar se já existe um alerta similar não resolvido
      const alertaExistente = this.alerts.find(a => 
        a.type === novoAlerta.type && 
        !a.resolved &&
        a.timestamp.getTime() > Date.now() - 60 * 60 * 1000 // última hora
      )

      if (!alertaExistente) {
        this.alerts.push(novoAlerta)
      }
    }

    // Manter apenas os 100 alertas mais recentes
    this.alerts = this.alerts.slice(-100)
  }

  /**
   * Resolve alertas automaticamente quando as condições melhoram
   */
  private resolverAlertasAutomaticos(): void {
    const agora = new Date()
    
    this.alerts.forEach(alerta => {
      if (alerta.autoResolve && !alerta.resolved) {
        // Lógica para resolver automaticamente baseada no tipo
        let deveResolver = false

        switch (alerta.type) {
          case 'capacity_critical':
          case 'team_overload':
            // Resolver se a capacidade diminuiu
            if (alerta.metadata?.percentualUso && alerta.metadata.percentualUso < this.thresholds.capacidadeAlta) {
              deveResolver = true
            }
            break
          
          case 'performance_issue':
            // Resolver se as tarefas vencidas diminuíram
            if (alerta.metadata?.tarefasVencidas && alerta.metadata.tarefasVencidas < this.thresholds.tarefasVencidasAlto) {
              deveResolver = true
            }
            break
        }

        if (deveResolver) {
          alerta.resolved = true
          alerta.resolvedAt = agora
          this.alertHistory.push(alerta)
        }
      }
    })
  }

  /**
   * Gera dados do dashboard para o diretor
   */
  async gerarDashboardData(): Promise<DirectorDashboardData> {
    const alertasAtivos = this.alerts.filter(a => !a.resolved)
    
    // Simular dados da equipe (em produção viria do banco)
    const teamPerformance = [
      {
        memberId: '1',
        nome: 'João Silva',
        leadsAtivos: 8,
        capacidadeLeads: 10,
        utilizacao: 80,
        tarefasVencidas: 2,
        tempoMedioResposta: 4.5,
        taxaConversao: 22
      },
      {
        memberId: '2',
        nome: 'Maria Santos',
        leadsAtivos: 9,
        capacidadeLeads: 10,
        utilizacao: 90,
        tarefasVencidas: 1,
        tempoMedioResposta: 3.2,
        taxaConversao: 28
      }
    ]

    const pipelineHealth = {
      totalLeads: 45,
      leadsEscalados: 3,
      leadsTimeout: 7,
      tempoMedioNoEstagio: 18.5,
      gargalos: ['Contato inicial', 'Follow-up']
    }

    const recommendations = this.gerarRecomendacoes(alertasAtivos, teamPerformance, pipelineHealth)

    return {
      alerts: alertasAtivos,
      teamPerformance,
      pipelineHealth,
      recommendations
    }
  }

  /**
   * Gera recomendações baseadas na análise
   */
  private gerarRecomendacoes(
    alertas: DirectorAlert[], 
    teamPerformance: any[], 
    pipelineHealth: any
  ): any[] {
    const recommendations = []

    // Recomendação de contratação
    const capacidadeCritica = alertas.some(a => a.type === 'capacity_critical')
    if (capacidadeCritica) {
      recommendations.push({
        id: 'hire_recommendation',
        type: 'hire',
        priority: 'high',
        title: 'Contratar Novo Vendedor',
        description: 'A equipe está operando em capacidade crítica. Recomenda-se contratar mais um vendedor.',
        impact: 'Reduzirá a carga de trabalho em 20% e melhorará o tempo de resposta'
      })
    }

    // Recomendação de redistribuição
    const sobrecarga = teamPerformance.some(m => m.utilizacao > 85)
    if (sobrecarga) {
      recommendations.push({
        id: 'redistribute_recommendation',
        type: 'redistribute',
        priority: 'medium',
        title: 'Redistribuir Leads',
        description: 'Alguns vendedores estão sobrecarregados. Considere redistribuir leads.',
        impact: 'Equilibrará a carga de trabalho e melhorará a performance geral'
      })
    }

    // Recomendação de treinamento
    const performanceBaixa = teamPerformance.some(m => m.taxaConversao < this.thresholds.taxaConversaoMinima)
    if (performanceBaixa) {
      recommendations.push({
        id: 'training_recommendation',
        type: 'training',
        priority: 'medium',
        title: 'Treinamento da Equipe',
        description: 'Alguns vendedores têm taxa de conversão abaixo do esperado.',
        impact: 'Melhorará a taxa de conversão em 15-25%'
      })
    }

    return recommendations
  }

  /**
   * Marca alerta como resolvido
   */
  resolverAlerta(alertaId: string): boolean {
    const alerta = this.alerts.find(a => a.id === alertaId)
    if (alerta && !alerta.resolved) {
      alerta.resolved = true
      alerta.resolvedAt = new Date()
      this.alertHistory.push(alerta)
      return true
    }
    return false
  }

  /**
   * Obtém alertas ativos
   */
  getAlertasAtivos(): DirectorAlert[] {
    return this.alerts.filter(a => !a.resolved)
  }

  /**
   * Obtém histórico de alertas
   */
  getHistoricoAlertas(limite?: number): DirectorAlert[] {
    const historico = [...this.alertHistory, ...this.alerts.filter(a => a.resolved)]
    return limite ? historico.slice(-limite) : historico
  }

  /**
   * Atualiza thresholds
   */
  atualizarThresholds(novosThresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...novosThresholds }
  }
}

export const directorNotificationService = new DirectorNotificationService()