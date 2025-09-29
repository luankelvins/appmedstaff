import { LeadPipelineCard } from '../types/crm'
import { leadDistributionService } from './leadDistributionService'
import { leadTaskService } from './leadTaskService'

interface MonitoringConfig {
  intervalMinutos: number
  ativo: boolean
  logAtividades: boolean
}

interface MonitoringResult {
  timestamp: Date
  leadsVerificados: number
  redistribuidos: number
  escalados: number
  falhas: number
  tarefasCriadas: number
  tarefasFinalizadas: number
}

class LeadMonitoringService {
  private config: MonitoringConfig = {
    intervalMinutos: 30, // Verificar a cada 30 minutos
    ativo: true,
    logAtividades: true
  }

  private intervalId: NodeJS.Timeout | null = null
  private historico: MonitoringResult[] = []

  /**
   * Inicia o monitoramento automático
   */
  iniciarMonitoramento(): void {
    if (this.intervalId) {
      this.pararMonitoramento()
    }

    if (!this.config.ativo) {
      console.log('Monitoramento de leads está desativado')
      return
    }

    this.intervalId = setInterval(
      () => this.executarVerificacao(),
      this.config.intervalMinutos * 60 * 1000
    )

    if (this.config.logAtividades) {
      console.log(`Monitoramento de leads iniciado - verificação a cada ${this.config.intervalMinutos} minutos`)
    }
  }

  /**
   * Para o monitoramento automático
   */
  pararMonitoramento(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      
      if (this.config.logAtividades) {
        console.log('Monitoramento de leads parado')
      }
    }
  }

  /**
   * Executa uma verificação completa
   */
  async executarVerificacao(leads?: LeadPipelineCard[]): Promise<MonitoringResult> {
    const timestamp = new Date()
    
    try {
      // Se não foram fornecidos leads, buscar todos os ativos
      const leadsParaVerificar = leads || await this.obterLeadsAtivos()
      
      // Processar redistribuições automáticas
      const resultadoRedistribuicao = await leadDistributionService.processarRedistribuicoesAutomaticas(leadsParaVerificar)
      
      // Processar tarefas vencidas
      const resultadoTarefas = await this.processarTarefasVencidas(leadsParaVerificar)
      
      // Criar novas tarefas para leads redistribuídos
      await this.criarTarefasParaRedistribuidos(resultadoRedistribuicao.redistribuidos)
      await this.criarTarefasParaRedistribuidos(resultadoRedistribuicao.escalados)

      const resultado: MonitoringResult = {
        timestamp,
        leadsVerificados: leadsParaVerificar.length,
        redistribuidos: resultadoRedistribuicao.redistribuidos.length,
        escalados: resultadoRedistribuicao.escalados.length,
        falhas: resultadoRedistribuicao.falhas.length,
        tarefasCriadas: resultadoRedistribuicao.redistribuidos.length + resultadoRedistribuicao.escalados.length,
        tarefasFinalizadas: resultadoTarefas.finalizadas
      }

      this.historico.push(resultado)
      
      // Manter apenas os últimos 100 registros
      if (this.historico.length > 100) {
        this.historico = this.historico.slice(-100)
      }

      if (this.config.logAtividades && (resultado.redistribuidos > 0 || resultado.escalados > 0)) {
        console.log('Verificação de leads concluída:', {
          redistribuidos: resultado.redistribuidos,
          escalados: resultado.escalados,
          falhas: resultado.falhas
        })
      }

      return resultado
    } catch (error) {
      console.error('Erro durante verificação de leads:', error)
      
      const resultado: MonitoringResult = {
        timestamp,
        leadsVerificados: 0,
        redistribuidos: 0,
        escalados: 0,
        falhas: 1,
        tarefasCriadas: 0,
        tarefasFinalizadas: 0
      }

      this.historico.push(resultado)
      return resultado
    }
  }

  /**
   * Processa tarefas vencidas
   */
  private async processarTarefasVencidas(leads: LeadPipelineCard[]): Promise<{ finalizadas: number }> {
    let finalizadas = 0
    const agora = new Date()

    for (const lead of leads) {
      if (lead.tasks) {
        for (const task of lead.tasks) {
          // Verificar se a tarefa está vencida e não foi concluída
          if (
            task.status === 'pendente' &&
            task.dataVencimento &&
            new Date(task.dataVencimento) < agora
          ) {
            // Finalizar tarefa automaticamente
            await leadTaskService.finalizarTarefaAutomaticamente(
              task.id,
              'Não houve contato com o cliente - timeout automático'
            )
            finalizadas++
          }
        }
      }
    }

    return { finalizadas }
  }

  /**
   * Cria tarefas para leads redistribuídos
   */
  private async criarTarefasParaRedistribuidos(leads: LeadPipelineCard[]): Promise<void> {
    for (const lead of leads) {
      await leadTaskService.criarTarefaContatoInicial(lead.id, lead.responsavelAtual)
    }
  }

  /**
   * Obtém leads ativos (mock - em produção viria do banco de dados)
   */
  private async obterLeadsAtivos(): Promise<LeadPipelineCard[]> {
    // Em produção, isso viria de uma consulta ao banco de dados
    // Por enquanto, retornamos um array vazio
    return []
  }

  /**
   * Obtém estatísticas do monitoramento
   */
  obterEstatisticas(): {
    ultimaVerificacao: Date | null
    totalVerificacoes: number
    totalRedistribuicoes: number
    totalEscalacoes: number
    totalFalhas: number
    mediaLeadsPorVerificacao: number
  } {
    if (this.historico.length === 0) {
      return {
        ultimaVerificacao: null,
        totalVerificacoes: 0,
        totalRedistribuicoes: 0,
        totalEscalacoes: 0,
        totalFalhas: 0,
        mediaLeadsPorVerificacao: 0
      }
    }

    const ultimaVerificacao = this.historico[this.historico.length - 1].timestamp
    const totalVerificacoes = this.historico.length
    const totalRedistribuicoes = this.historico.reduce((sum, r) => sum + r.redistribuidos, 0)
    const totalEscalacoes = this.historico.reduce((sum, r) => sum + r.escalados, 0)
    const totalFalhas = this.historico.reduce((sum, r) => sum + r.falhas, 0)
    const totalLeads = this.historico.reduce((sum, r) => sum + r.leadsVerificados, 0)
    const mediaLeadsPorVerificacao = totalLeads / totalVerificacoes

    return {
      ultimaVerificacao,
      totalVerificacoes,
      totalRedistribuicoes,
      totalEscalacoes,
      totalFalhas,
      mediaLeadsPorVerificacao
    }
  }

  /**
   * Obtém histórico de monitoramento
   */
  obterHistorico(limite?: number): MonitoringResult[] {
    if (limite) {
      return this.historico.slice(-limite)
    }
    return [...this.historico]
  }

  /**
   * Atualiza configuração do monitoramento
   */
  atualizarConfiguracao(novaConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...novaConfig }
    
    // Reiniciar monitoramento se o intervalo mudou
    if (novaConfig.intervalMinutos && this.intervalId) {
      this.pararMonitoramento()
      this.iniciarMonitoramento()
    }
  }

  /**
   * Obtém configuração atual
   */
  obterConfiguracao(): MonitoringConfig {
    return { ...this.config }
  }
}

export const leadMonitoringService = new LeadMonitoringService()