import { 
  ContactAttempt, 
  ContactAttemptType, 
  ContactAttemptResult,
  LeadPipelineCard 
} from '../types/crm';

export interface ContactAnalytics {
  // Métricas gerais
  totalAttempts: number;
  successRate: number;
  averageAttemptsToSuccess: number;
  averageResponseTime: number; // em horas
  
  // Métricas por tipo de contato
  byType: Record<ContactAttemptType, {
    total: number;
    successCount: number;
    successRate: number;
    averageDuration?: number; // para ligações
  }>;
  
  // Métricas por resultado
  byResult: Record<ContactAttemptResult, {
    count: number;
    percentage: number;
  }>;
  
  // Tendências temporais
  trends: {
    daily: Array<{
      date: string;
      attempts: number;
      successes: number;
      successRate: number;
    }>;
    hourly: Array<{
      hour: number;
      attempts: number;
      successRate: number;
    }>;
    weekday: Array<{
      day: string;
      attempts: number;
      successRate: number;
    }>;
  };
  
  // Métricas de performance
  performance: {
    bestPerformingType: ContactAttemptType;
    bestPerformingHour: number;
    bestPerformingDay: string;
    averageTimeBetweenAttempts: number; // em horas
    conversionFunnel: {
      firstAttempt: number;
      secondAttempt: number;
      thirdAttempt: number;
      fourthPlusAttempt: number;
    };
  };
  
  // Recomendações
  recommendations: Array<{
    type: 'timing' | 'channel' | 'frequency' | 'strategy';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
  }>;
}

export interface TeamContactAnalytics {
  teamOverview: ContactAnalytics;
  byResponsavel: Record<string, ContactAnalytics & {
    responsavelName: string;
    totalLeads: number;
    activeLeads: number;
  }>;
  comparisons: {
    topPerformer: string;
    averagePerformer: string;
    needsImprovement: string[];
  };
  teamRecommendations: Array<{
    type: 'training' | 'process' | 'tools' | 'strategy';
    title: string;
    description: string;
    targetResponsaveis: string[];
    priority: 'high' | 'medium' | 'low';
  }>;
}

class ContactAnalyticsService {
  /**
   * Analisa tentativas de contato para um lead específico
   */
  analyzeLeadContacts(leadCard: LeadPipelineCard): ContactAnalytics {
    const attempts = leadCard.contactAttempts;
    
    if (attempts.length === 0) {
      return this.getEmptyAnalytics();
    }

    const totalAttempts = attempts.length;
    const successfulAttempts = attempts.filter(a => a.resultado === 'sucesso');
    const successRate = (successfulAttempts.length / totalAttempts) * 100;

    // Calcular tentativas até o primeiro sucesso
    const firstSuccessIndex = attempts.findIndex(a => a.resultado === 'sucesso');
    const averageAttemptsToSuccess = firstSuccessIndex >= 0 ? firstSuccessIndex + 1 : totalAttempts;

    // Calcular tempo médio de resposta
    const averageResponseTime = this.calculateAverageResponseTime(attempts);

    // Análise por tipo
    const byType = this.analyzeByType(attempts);

    // Análise por resultado
    const byResult = this.analyzeByResult(attempts);

    // Tendências temporais
    const trends = this.analyzeTrends(attempts);

    // Métricas de performance
    const performance = this.analyzePerformance(attempts, byType, trends);

    // Gerar recomendações
    const recommendations = this.generateRecommendations(
      { totalAttempts, successRate, byType, trends, performance }
    );

    return {
      totalAttempts,
      successRate,
      averageAttemptsToSuccess,
      averageResponseTime,
      byType,
      byResult,
      trends,
      performance,
      recommendations
    };
  }

  /**
   * Analisa tentativas de contato para toda a equipe
   */
  analyzeTeamContacts(leadCards: LeadPipelineCard[]): TeamContactAnalytics {
    const allAttempts = leadCards.flatMap(card => 
      card.contactAttempts.map(attempt => ({
        ...attempt,
        leadCard: card
      }))
    );

    // Análise geral da equipe
    const teamOverview = this.analyzeAllAttempts(allAttempts);

    // Análise por responsável
    const byResponsavel: Record<string, ContactAnalytics & {
      responsavelName: string;
      totalLeads: number;
      activeLeads: number;
    }> = {};

    const responsaveis = [...new Set(leadCards.map(card => card.responsavelAtual))];
    
    responsaveis.forEach(responsavelId => {
      const responsavelLeads = leadCards.filter(card => card.responsavelAtual === responsavelId);
      const responsavelAttempts = responsavelLeads.flatMap(card => card.contactAttempts);
      
      const analytics = this.analyzeAllAttempts(responsavelAttempts);
      
      byResponsavel[responsavelId] = {
        ...analytics,
        responsavelName: `Responsável ${responsavelId}`, // Aqui você pode buscar o nome real
        totalLeads: responsavelLeads.length,
        activeLeads: responsavelLeads.filter(card => card.status === 'ativo').length
      };
    });

    // Comparações e rankings
    const comparisons = this.generateComparisons(byResponsavel);

    // Recomendações para a equipe
    const teamRecommendations = this.generateTeamRecommendations(byResponsavel, teamOverview);

    return {
      teamOverview,
      byResponsavel,
      comparisons,
      teamRecommendations
    };
  }

  private analyzeByType(attempts: ContactAttempt[]): ContactAnalytics['byType'] {
    const types: ContactAttemptType[] = ['ligacao', 'whatsapp', 'email', 'presencial'];
    const result: ContactAnalytics['byType'] = {} as any;

    types.forEach(type => {
      const typeAttempts = attempts.filter(a => a.tipo === type);
      const successCount = typeAttempts.filter(a => a.resultado === 'sucesso').length;
      const successRate = typeAttempts.length > 0 ? (successCount / typeAttempts.length) * 100 : 0;
      
      let averageDuration: number | undefined;
      if (type === 'ligacao') {
        const ligacoesComDuracao = typeAttempts.filter(a => a.duracao !== undefined);
        if (ligacoesComDuracao.length > 0) {
          averageDuration = ligacoesComDuracao.reduce((sum, a) => sum + (a.duracao || 0), 0) / ligacoesComDuracao.length;
        }
      }

      result[type] = {
        total: typeAttempts.length,
        successCount,
        successRate,
        ...(averageDuration !== undefined && { averageDuration })
      };
    });

    return result;
  }

  private analyzeByResult(attempts: ContactAttempt[]): ContactAnalytics['byResult'] {
    const results: ContactAttemptResult[] = ['sucesso', 'sem_resposta', 'ocupado', 'numero_invalido', 'nao_atende', 'reagendar'];
    const result: ContactAnalytics['byResult'] = {} as any;

    results.forEach(resultType => {
      const count = attempts.filter(a => a.resultado === resultType).length;
      const percentage = attempts.length > 0 ? (count / attempts.length) * 100 : 0;
      
      result[resultType] = { count, percentage };
    });

    return result;
  }

  private analyzeTrends(attempts: ContactAttempt[]): ContactAnalytics['trends'] {
    // Análise diária (últimos 30 dias)
    const daily = this.analyzeDailyTrends(attempts);
    
    // Análise por hora do dia
    const hourly = this.analyzeHourlyTrends(attempts);
    
    // Análise por dia da semana
    const weekday = this.analyzeWeekdayTrends(attempts);

    return { daily, hourly, weekday };
  }

  private analyzeDailyTrends(attempts: ContactAttempt[]) {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => {
      const dayAttempts = attempts.filter(a => 
        new Date(a.dataContato).toISOString().split('T')[0] === date
      );
      const successes = dayAttempts.filter(a => a.resultado === 'sucesso').length;
      const successRate = dayAttempts.length > 0 ? (successes / dayAttempts.length) * 100 : 0;

      return {
        date,
        attempts: dayAttempts.length,
        successes,
        successRate
      };
    });
  }

  private analyzeHourlyTrends(attempts: ContactAttempt[]) {
    return Array.from({ length: 24 }, (_, hour) => {
      const hourAttempts = attempts.filter(a => 
        new Date(a.dataContato).getHours() === hour
      );
      const successes = hourAttempts.filter(a => a.resultado === 'sucesso').length;
      const successRate = hourAttempts.length > 0 ? (successes / hourAttempts.length) * 100 : 0;

      return {
        hour,
        attempts: hourAttempts.length,
        successRate
      };
    });
  }

  private analyzeWeekdayTrends(attempts: ContactAttempt[]) {
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    return weekdays.map((day, index) => {
      const dayAttempts = attempts.filter(a => 
        new Date(a.dataContato).getDay() === index
      );
      const successes = dayAttempts.filter(a => a.resultado === 'sucesso').length;
      const successRate = dayAttempts.length > 0 ? (successes / dayAttempts.length) * 100 : 0;

      return {
        day,
        attempts: dayAttempts.length,
        successRate
      };
    });
  }

  private analyzePerformance(
    attempts: ContactAttempt[], 
    byType: ContactAnalytics['byType'], 
    trends: ContactAnalytics['trends']
  ): ContactAnalytics['performance'] {
    // Melhor tipo de contato
    const bestPerformingType = Object.entries(byType)
      .filter(([_, data]) => data.total > 0)
      .sort((a, b) => b[1].successRate - a[1].successRate)[0]?.[0] as ContactAttemptType || 'ligacao';

    // Melhor hora
    const bestPerformingHour = trends.hourly
      .filter(h => h.attempts > 0)
      .sort((a, b) => b.successRate - a.successRate)[0]?.hour || 9;

    // Melhor dia
    const bestPerformingDay = trends.weekday
      .filter(d => d.attempts > 0)
      .sort((a, b) => b.successRate - a.successRate)[0]?.day || 'Segunda';

    // Tempo médio entre tentativas
    const averageTimeBetweenAttempts = this.calculateAverageTimeBetweenAttempts(attempts);

    // Funil de conversão
    const conversionFunnel = this.calculateConversionFunnel(attempts);

    return {
      bestPerformingType,
      bestPerformingHour,
      bestPerformingDay,
      averageTimeBetweenAttempts,
      conversionFunnel
    };
  }

  private calculateAverageResponseTime(attempts: ContactAttempt[]): number {
    if (attempts.length < 2) return 0;

    const intervals = [];
    for (let i = 1; i < attempts.length; i++) {
      const current = new Date(attempts[i].dataContato);
      const previous = new Date(attempts[i - 1].dataContato);
      intervals.push((current.getTime() - previous.getTime()) / (1000 * 60 * 60)); // em horas
    }

    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }

  private calculateAverageTimeBetweenAttempts(attempts: ContactAttempt[]): number {
    if (attempts.length < 2) return 0;

    const sortedAttempts = [...attempts].sort((a, b) => 
      new Date(a.dataContato).getTime() - new Date(b.dataContato).getTime()
    );

    let totalTime = 0;
    for (let i = 1; i < sortedAttempts.length; i++) {
      const current = new Date(sortedAttempts[i].dataContato);
      const previous = new Date(sortedAttempts[i - 1].dataContato);
      totalTime += (current.getTime() - previous.getTime()) / (1000 * 60 * 60); // em horas
    }

    return totalTime / (sortedAttempts.length - 1);
  }

  private calculateConversionFunnel(attempts: ContactAttempt[]) {
    // Agrupa tentativas por lead e analisa em que tentativa houve sucesso
    const leadAttempts = new Map<string, ContactAttempt[]>();
    
    attempts.forEach(attempt => {
      if (!leadAttempts.has(attempt.leadPipelineId)) {
        leadAttempts.set(attempt.leadPipelineId, []);
      }
      leadAttempts.get(attempt.leadPipelineId)!.push(attempt);
    });

    const funnel = { firstAttempt: 0, secondAttempt: 0, thirdAttempt: 0, fourthPlusAttempt: 0 };

    leadAttempts.forEach(leadAttemptsList => {
      const sortedAttempts = leadAttemptsList.sort((a, b) => 
        new Date(a.dataContato).getTime() - new Date(b.dataContato).getTime()
      );

      const firstSuccessIndex = sortedAttempts.findIndex(a => a.resultado === 'sucesso');
      
      if (firstSuccessIndex >= 0) {
        if (firstSuccessIndex === 0) funnel.firstAttempt++;
        else if (firstSuccessIndex === 1) funnel.secondAttempt++;
        else if (firstSuccessIndex === 2) funnel.thirdAttempt++;
        else funnel.fourthPlusAttempt++;
      }
    });

    return funnel;
  }

  private generateRecommendations(data: {
    totalAttempts: number;
    successRate: number;
    byType: ContactAnalytics['byType'];
    trends: ContactAnalytics['trends'];
    performance: ContactAnalytics['performance'];
  }): ContactAnalytics['recommendations'] {
    const recommendations: ContactAnalytics['recommendations'] = [];

    // Recomendação de timing
    if (data.performance.bestPerformingHour !== 9) {
      recommendations.push({
        type: 'timing',
        title: 'Otimizar horário de contato',
        description: `Tente fazer contatos às ${data.performance.bestPerformingHour}h, quando a taxa de sucesso é maior.`,
        impact: 'medium',
        actionable: true
      });
    }

    // Recomendação de canal
    const bestType = Object.entries(data.byType)
      .filter(([_, typeData]) => typeData.total > 0)
      .sort((a, b) => b[1].successRate - a[1].successRate)[0];
    
    if (bestType && bestType[1].successRate > data.successRate) {
      recommendations.push({
        type: 'channel',
        title: 'Priorizar canal mais efetivo',
        description: `${bestType[0]} tem taxa de sucesso de ${bestType[1].successRate.toFixed(1)}%, considere usar mais este canal.`,
        impact: 'high',
        actionable: true
      });
    }

    // Recomendação de frequência
    if (data.performance.averageTimeBetweenAttempts > 72) {
      recommendations.push({
        type: 'frequency',
        title: 'Reduzir intervalo entre tentativas',
        description: 'O tempo médio entre tentativas é muito alto. Considere fazer follow-ups mais frequentes.',
        impact: 'medium',
        actionable: true
      });
    }

    // Recomendação estratégica
    if (data.successRate < 30) {
      recommendations.push({
        type: 'strategy',
        title: 'Revisar estratégia de abordagem',
        description: 'Taxa de sucesso baixa indica necessidade de revisar script ou abordagem.',
        impact: 'high',
        actionable: true
      });
    }

    return recommendations;
  }

  private analyzeAllAttempts(attempts: ContactAttempt[]): ContactAnalytics {
    if (attempts.length === 0) {
      return this.getEmptyAnalytics();
    }

    // Implementação similar ao analyzeLeadContacts, mas para múltiplas tentativas
    const totalAttempts = attempts.length;
    const successfulAttempts = attempts.filter(a => a.resultado === 'sucesso');
    const successRate = (successfulAttempts.length / totalAttempts) * 100;

    const averageAttemptsToSuccess = this.calculateAverageAttemptsToSuccessForMultiple(attempts);
    const averageResponseTime = this.calculateAverageResponseTime(attempts);
    const byType = this.analyzeByType(attempts);
    const byResult = this.analyzeByResult(attempts);
    const trends = this.analyzeTrends(attempts);
    const performance = this.analyzePerformance(attempts, byType, trends);
    const recommendations = this.generateRecommendations({
      totalAttempts, successRate, byType, trends, performance
    });

    return {
      totalAttempts,
      successRate,
      averageAttemptsToSuccess,
      averageResponseTime,
      byType,
      byResult,
      trends,
      performance,
      recommendations
    };
  }

  private calculateAverageAttemptsToSuccessForMultiple(attempts: ContactAttempt[]): number {
    const leadGroups = new Map<string, ContactAttempt[]>();
    
    attempts.forEach(attempt => {
      if (!leadGroups.has(attempt.leadPipelineId)) {
        leadGroups.set(attempt.leadPipelineId, []);
      }
      leadGroups.get(attempt.leadPipelineId)!.push(attempt);
    });

    let totalAttemptsToSuccess = 0;
    let successfulLeads = 0;

    leadGroups.forEach(leadAttempts => {
      const sortedAttempts = leadAttempts.sort((a, b) => 
        new Date(a.dataContato).getTime() - new Date(b.dataContato).getTime()
      );
      
      const firstSuccessIndex = sortedAttempts.findIndex(a => a.resultado === 'sucesso');
      if (firstSuccessIndex >= 0) {
        totalAttemptsToSuccess += firstSuccessIndex + 1;
        successfulLeads++;
      }
    });

    return successfulLeads > 0 ? totalAttemptsToSuccess / successfulLeads : 0;
  }

  private generateComparisons(byResponsavel: Record<string, any>) {
    const responsaveis = Object.entries(byResponsavel);
    
    if (responsaveis.length === 0) {
      return {
        topPerformer: '',
        averagePerformer: '',
        needsImprovement: []
      };
    }

    const sortedBySuccessRate = responsaveis.sort((a, b) => b[1].successRate - a[1].successRate);
    const averageSuccessRate = responsaveis.reduce((sum, [_, data]) => sum + data.successRate, 0) / responsaveis.length;

    return {
      topPerformer: sortedBySuccessRate[0]?.[0] || '',
      averagePerformer: responsaveis.find(([_, data]) => 
        Math.abs(data.successRate - averageSuccessRate) < 5
      )?.[0] || '',
      needsImprovement: responsaveis
        .filter(([_, data]) => data.successRate < averageSuccessRate * 0.8)
        .map(([id]) => id)
    };
  }

  private generateTeamRecommendations(byResponsavel: Record<string, any>, teamOverview: ContactAnalytics) {
    const recommendations = [];

    // Verificar se há necessidade de treinamento
    const lowPerformers = Object.entries(byResponsavel)
      .filter(([_, data]) => data.successRate < teamOverview.successRate * 0.7);

    if (lowPerformers.length > 0) {
      recommendations.push({
        type: 'training' as const,
        title: 'Treinamento em técnicas de contato',
        description: 'Alguns membros da equipe estão com performance abaixo da média.',
        targetResponsaveis: lowPerformers.map(([id]) => id),
        priority: 'high' as const
      });
    }

    return recommendations;
  }

  private getEmptyAnalytics(): ContactAnalytics {
    return {
      totalAttempts: 0,
      successRate: 0,
      averageAttemptsToSuccess: 0,
      averageResponseTime: 0,
      byType: {
        ligacao: { total: 0, successCount: 0, successRate: 0 },
        whatsapp: { total: 0, successCount: 0, successRate: 0 },
        email: { total: 0, successCount: 0, successRate: 0 },
        presencial: { total: 0, successCount: 0, successRate: 0 }
      },
      byResult: {
        sucesso: { count: 0, percentage: 0 },
        sem_resposta: { count: 0, percentage: 0 },
        ocupado: { count: 0, percentage: 0 },
        numero_invalido: { count: 0, percentage: 0 },
        nao_atende: { count: 0, percentage: 0 },
        reagendar: { count: 0, percentage: 0 }
      },
      trends: {
        daily: [],
        hourly: [],
        weekday: []
      },
      performance: {
        bestPerformingType: 'ligacao',
        bestPerformingHour: 9,
        bestPerformingDay: 'Segunda',
        averageTimeBetweenAttempts: 0,
        conversionFunnel: {
          firstAttempt: 0,
          secondAttempt: 0,
          thirdAttempt: 0,
          fourthPlusAttempt: 0
        }
      },
      recommendations: []
    };
  }
}

export const contactAnalyticsService = new ContactAnalyticsService();
export default contactAnalyticsService;