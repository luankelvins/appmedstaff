import { LeadPipelineCard, ContactAttempt, LeadPipelineStage, LeadStatus } from '../types/crm';

export interface DashboardMetrics {
  overview: {
    totalLeads: number;
    leadsAtivos: number;
    leadsConvertidos: number;
    leadsPerdidos: number;
    taxaConversao: number;
    tempoMedioConversao: number; // em dias
  };
  
  timeMetrics: {
    tempoMedioPorEstagio: Record<LeadPipelineStage, number>;
    tempoMedioTotal: number;
    slaCompliance: {
      contatoInicial24h: number; // % de leads contatados em 24h
      qualificacao7dias: number; // % de leads qualificados em 7 dias
      proposta15dias: number; // % de propostas enviadas em 15 dias
    };
    leadsSemContato24h: number;
    leadsVencidos: number;
  };

  performance: {
    leadsPorResponsavel: Record<string, {
      total: number;
      ativos: number;
      convertidos: number;
      perdidos: number;
      taxaConversao: number;
      tempoMedioConversao: number;
    }>;
    melhorPerformance: {
      responsavel: string;
      taxaConversao: number;
      tempoMedioConversao: number;
    };
    piorPerformance: {
      responsavel: string;
      taxaConversao: number;
      tempoMedioConversao: number;
    };
  };

  trends: {
    ultimosSete: {
      novosLeads: number[];
      conversoes: number[];
      perdas: number[];
      tempoMedioConversao: number[];
    };
    comparacaoMesAnterior: {
      novosLeads: { atual: number; anterior: number; variacao: number };
      conversoes: { atual: number; anterior: number; variacao: number };
      taxaConversao: { atual: number; anterior: number; variacao: number };
      tempoMedioConversao: { atual: number; anterior: number; variacao: number };
    };
  };

  alerts: {
    leadsSemContato: LeadPipelineCard[];
    leadsVencidos: LeadPipelineCard[];
    leadsBaixaPerformance: LeadPipelineCard[];
    responsaveisComProblemas: string[];
  };
}

export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    period: string;
  };
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  format: 'number' | 'percentage' | 'currency' | 'time' | 'text';
}

class DashboardMetricsService {
  /**
   * Calcula todas as métricas do dashboard
   */
  async calculateMetrics(leadCards: LeadPipelineCard[]): Promise<DashboardMetrics> {
    const overview = this.calculateOverviewMetrics(leadCards);
    const timeMetrics = this.calculateTimeMetrics(leadCards);
    const performance = this.calculatePerformanceMetrics(leadCards);
    const trends = this.calculateTrendMetrics(leadCards);
    const alerts = this.calculateAlerts(leadCards);

    return {
      overview,
      timeMetrics,
      performance,
      trends,
      alerts
    };
  }

  /**
   * Gera cards de métricas principais
   */
  generateMetricCards(metrics: DashboardMetrics): MetricCard[] {
    const cards: MetricCard[] = [
      {
        id: 'total-leads',
        title: 'Total de Leads',
        value: metrics.overview.totalLeads,
        subtitle: `${metrics.overview.leadsAtivos} ativos`,
        icon: 'Users',
        color: 'blue',
        format: 'number',
        trend: {
          value: metrics.trends.comparacaoMesAnterior.novosLeads.variacao,
          direction: metrics.trends.comparacaoMesAnterior.novosLeads.variacao > 0 ? 'up' : 
                    metrics.trends.comparacaoMesAnterior.novosLeads.variacao < 0 ? 'down' : 'stable',
          period: 'vs mês anterior'
        }
      },
      {
        id: 'conversion-rate',
        title: 'Taxa de Conversão',
        value: metrics.overview.taxaConversao,
        subtitle: `${metrics.overview.leadsConvertidos} convertidos`,
        icon: 'TrendingUp',
        color: 'green',
        format: 'percentage',
        trend: {
          value: metrics.trends.comparacaoMesAnterior.taxaConversao.variacao,
          direction: metrics.trends.comparacaoMesAnterior.taxaConversao.variacao > 0 ? 'up' : 
                    metrics.trends.comparacaoMesAnterior.taxaConversao.variacao < 0 ? 'down' : 'stable',
          period: 'vs mês anterior'
        }
      },
      {
        id: 'avg-conversion-time',
        title: 'Tempo Médio de Conversão',
        value: metrics.overview.tempoMedioConversao,
        subtitle: 'dias',
        icon: 'Clock',
        color: 'purple',
        format: 'time',
        trend: {
          value: metrics.trends.comparacaoMesAnterior.tempoMedioConversao.variacao,
          direction: metrics.trends.comparacaoMesAnterior.tempoMedioConversao.variacao < 0 ? 'up' : 
                    metrics.trends.comparacaoMesAnterior.tempoMedioConversao.variacao > 0 ? 'down' : 'stable',
          period: 'vs mês anterior'
        }
      },
      {
        id: 'sla-compliance',
        title: 'Compliance SLA 24h',
        value: metrics.timeMetrics.slaCompliance.contatoInicial24h,
        subtitle: 'contato inicial',
        icon: 'Target',
        color: metrics.timeMetrics.slaCompliance.contatoInicial24h >= 90 ? 'green' : 
               metrics.timeMetrics.slaCompliance.contatoInicial24h >= 70 ? 'yellow' : 'red',
        format: 'percentage'
      },
      {
        id: 'leads-sem-contato',
        title: 'Leads sem Contato 24h',
        value: metrics.timeMetrics.leadsSemContato24h,
        subtitle: 'requerem atenção',
        icon: 'AlertTriangle',
        color: metrics.timeMetrics.leadsSemContato24h > 10 ? 'red' : 
               metrics.timeMetrics.leadsSemContato24h > 5 ? 'yellow' : 'green',
        format: 'number'
      },
      {
        id: 'leads-vencidos',
        title: 'Leads Vencidos',
        value: metrics.timeMetrics.leadsVencidos,
        subtitle: 'precisam reagendamento',
        icon: 'Calendar',
        color: metrics.timeMetrics.leadsVencidos > 20 ? 'red' : 
               metrics.timeMetrics.leadsVencidos > 10 ? 'yellow' : 'green',
        format: 'number'
      }
    ];

    return cards;
  }

  private calculateOverviewMetrics(leadCards: LeadPipelineCard[]) {
    const totalLeads = leadCards.length;
    const leadsAtivos = leadCards.filter(lead => 
      ['ativo', 'em_contato', 'aguardando_retorno', 'qualificado'].includes(lead.status)
    ).length;
    const leadsConvertidos = leadCards.filter(lead => 
      lead.outcome?.qualificacao === 'qualificado'
    ).length;
    const leadsPerdidos = leadCards.filter(lead => 
      lead.status === 'perdido' || lead.outcome?.qualificacao === 'nao_qualificado'
    ).length;

    const taxaConversao = totalLeads > 0 ? (leadsConvertidos / totalLeads) * 100 : 0;

    // Calcular tempo médio de conversão
    const leadsConvertidosComTempo = leadCards.filter(lead => 
      lead.outcome?.qualificacao === 'qualificado' && lead.outcome.dataDesfecho
    );
    
    const tempoMedioConversao = leadsConvertidosComTempo.length > 0 
      ? leadsConvertidosComTempo.reduce((acc, lead) => {
          const inicio = new Date(lead.dataCriacao);
          const fim = new Date(lead.outcome!.dataDesfecho);
          const dias = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
          return acc + dias;
        }, 0) / leadsConvertidosComTempo.length
      : 0;

    return {
      totalLeads,
      leadsAtivos,
      leadsConvertidos,
      leadsPerdidos,
      taxaConversao,
      tempoMedioConversao
    };
  }

  private calculateTimeMetrics(leadCards: LeadPipelineCard[]) {
    const now = new Date();
    
    // Tempo médio por estágio
    const tempoMedioPorEstagio: Record<LeadPipelineStage, number> = {
      'novo_lead': 0,
      'ligacao_1': 0,
      'ligacao_2': 0,
      'mensagem': 0,
      'recontato': 0,
      'desfecho': 0
    };

    // Calcular tempo médio por estágio
    Object.keys(tempoMedioPorEstagio).forEach(stage => {
      const leadsNoEstagio = leadCards.filter(lead => 
        lead.stageHistory.some(history => history.stage === stage as LeadPipelineStage)
      );

      if (leadsNoEstagio.length > 0) {
        const tempoTotal = leadsNoEstagio.reduce((acc, lead) => {
          const stageHistory = lead.stageHistory.find(h => h.stage === stage as LeadPipelineStage);
          if (stageHistory && stageHistory.tempoNoEstagio) {
            return acc + stageHistory.tempoNoEstagio;
          }
          return acc;
        }, 0);
        
        tempoMedioPorEstagio[stage as LeadPipelineStage] = tempoTotal / leadsNoEstagio.length / 24; // converter para dias
      }
    });

    // Tempo médio total
    const tempoMedioTotal = leadCards.reduce((acc, lead) => acc + lead.tempoTotalPipeline, 0) / leadCards.length / 24;

    // SLA Compliance
    const leadsCom24h = leadCards.filter(lead => {
      const primeiroContato = lead.contactAttempts[0];
      if (!primeiroContato) return false;
      
      const tempoParaContato = (new Date(primeiroContato.dataContato).getTime() - new Date(lead.dataCriacao).getTime()) / (1000 * 60 * 60);
      return tempoParaContato <= 24;
    }).length;

    const contatoInicial24h = leadCards.length > 0 ? (leadsCom24h / leadCards.length) * 100 : 0;

    // Leads sem contato em 24h
    const leadsSemContato24h = leadCards.filter(lead => {
      const ultimoContato = lead.contactAttempts[lead.contactAttempts.length - 1];
      if (!ultimoContato) {
        const horasSemContato = (now.getTime() - new Date(lead.dataCriacao).getTime()) / (1000 * 60 * 60);
        return horasSemContato > 24;
      }
      return false;
    }).length;

    // Leads vencidos (sem atividade há mais de 7 dias)
    const leadsVencidos = leadCards.filter(lead => {
      const ultimaAtualizacao = new Date(lead.dataUltimaAtualizacao);
      const diasSemAtualizacao = (now.getTime() - ultimaAtualizacao.getTime()) / (1000 * 60 * 60 * 24);
      return diasSemAtualizacao > 7 && ['ativo', 'em_contato', 'aguardando_retorno'].includes(lead.status);
    }).length;

    return {
      tempoMedioPorEstagio,
      tempoMedioTotal,
      slaCompliance: {
        contatoInicial24h,
        qualificacao7dias: 0, // TODO: implementar
        proposta15dias: 0 // TODO: implementar
      },
      leadsSemContato24h,
      leadsVencidos
    };
  }

  private calculatePerformanceMetrics(leadCards: LeadPipelineCard[]) {
    const leadsPorResponsavel: Record<string, any> = {};

    // Agrupar leads por responsável
    leadCards.forEach(lead => {
      const responsavel = lead.responsavelAtual;
      if (!leadsPorResponsavel[responsavel]) {
        leadsPorResponsavel[responsavel] = {
          total: 0,
          ativos: 0,
          convertidos: 0,
          perdidos: 0,
          taxaConversao: 0,
          tempoMedioConversao: 0
        };
      }

      leadsPorResponsavel[responsavel].total++;

      if (['ativo', 'em_contato', 'aguardando_retorno', 'qualificado'].includes(lead.status)) {
        leadsPorResponsavel[responsavel].ativos++;
      }

      if (lead.outcome?.qualificacao === 'qualificado') {
        leadsPorResponsavel[responsavel].convertidos++;
      }

      if (lead.status === 'perdido' || lead.outcome?.qualificacao === 'nao_qualificado') {
        leadsPorResponsavel[responsavel].perdidos++;
      }
    });

    // Calcular taxas de conversão e tempo médio
    Object.keys(leadsPorResponsavel).forEach(responsavel => {
      const data = leadsPorResponsavel[responsavel];
      data.taxaConversao = data.total > 0 ? (data.convertidos / data.total) * 100 : 0;
      
      // Calcular tempo médio de conversão para este responsável
      const leadsConvertidos = leadCards.filter(lead => 
        lead.responsavelAtual === responsavel && 
        lead.outcome?.qualificacao === 'qualificado' && 
        lead.outcome.dataDesfecho
      );
      
      if (leadsConvertidos.length > 0) {
        data.tempoMedioConversao = leadsConvertidos.reduce((acc, lead) => {
          const inicio = new Date(lead.dataCriacao);
          const fim = new Date(lead.outcome!.dataDesfecho);
          const dias = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
          return acc + dias;
        }, 0) / leadsConvertidos.length;
      }
    });

    // Encontrar melhor e pior performance
    const responsaveis = Object.keys(leadsPorResponsavel);
    let melhorPerformance = { responsavel: '', taxaConversao: 0, tempoMedioConversao: 0 };
    let piorPerformance = { responsavel: '', taxaConversao: 100, tempoMedioConversao: 1000 };

    responsaveis.forEach(responsavel => {
      const data = leadsPorResponsavel[responsavel];
      if (data.taxaConversao > melhorPerformance.taxaConversao) {
        melhorPerformance = {
          responsavel,
          taxaConversao: data.taxaConversao,
          tempoMedioConversao: data.tempoMedioConversao
        };
      }
      if (data.taxaConversao < piorPerformance.taxaConversao) {
        piorPerformance = {
          responsavel,
          taxaConversao: data.taxaConversao,
          tempoMedioConversao: data.tempoMedioConversao
        };
      }
    });

    return {
      leadsPorResponsavel,
      melhorPerformance,
      piorPerformance
    };
  }

  private calculateTrendMetrics(leadCards: LeadPipelineCard[]) {
    // Implementação simplificada - em produção, seria necessário dados históricos
    return {
      ultimosSete: {
        novosLeads: [5, 8, 12, 6, 9, 15, 11],
        conversoes: [1, 2, 3, 1, 2, 4, 2],
        perdas: [2, 1, 2, 3, 1, 2, 1],
        tempoMedioConversao: [15, 14, 16, 13, 15, 12, 14]
      },
      comparacaoMesAnterior: {
        novosLeads: { atual: 66, anterior: 58, variacao: 13.8 },
        conversoes: { atual: 15, anterior: 12, variacao: 25.0 },
        taxaConversao: { atual: 22.7, anterior: 20.7, variacao: 9.7 },
        tempoMedioConversao: { atual: 14.2, anterior: 16.1, variacao: -11.8 }
      }
    };
  }

  private calculateAlerts(leadCards: LeadPipelineCard[]) {
    const now = new Date();

    const leadsSemContato = leadCards.filter(lead => {
      const ultimoContato = lead.contactAttempts[lead.contactAttempts.length - 1];
      if (!ultimoContato) {
        const horasSemContato = (now.getTime() - new Date(lead.dataCriacao).getTime()) / (1000 * 60 * 60);
        return horasSemContato > 24;
      }
      return false;
    });

    const leadsVencidos = leadCards.filter(lead => {
      const ultimaAtualizacao = new Date(lead.dataUltimaAtualizacao);
      const diasSemAtualizacao = (now.getTime() - ultimaAtualizacao.getTime()) / (1000 * 60 * 60 * 24);
      return diasSemAtualizacao > 7 && ['ativo', 'em_contato', 'aguardando_retorno'].includes(lead.status);
    });

    const leadsBaixaPerformance = leadCards.filter(lead => {
      const tentativas = lead.contactAttempts.length;
      const tempoNoPipeline = lead.tempoTotalPipeline / 24; // em dias
      return tentativas > 5 && tempoNoPipeline > 30 && ['ativo', 'em_contato'].includes(lead.status);
    });

    // Responsáveis com problemas (muitos leads vencidos)
    const leadsPorResponsavel: Record<string, number> = {};
    leadsVencidos.forEach(lead => {
      leadsPorResponsavel[lead.responsavelAtual] = (leadsPorResponsavel[lead.responsavelAtual] || 0) + 1;
    });

    const responsaveisComProblemas = Object.keys(leadsPorResponsavel).filter(
      responsavel => leadsPorResponsavel[responsavel] > 5
    );

    return {
      leadsSemContato,
      leadsVencidos,
      leadsBaixaPerformance,
      responsaveisComProblemas
    };
  }
}

export const dashboardMetricsService = new DashboardMetricsService();
export default dashboardMetricsService;