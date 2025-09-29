import { LeadPipelineCard, ContactAttempt, TaskStatus } from '../types/crm';
import { leadTaskService } from './leadTaskService';
import { leadDistributionService } from './leadDistributionService';

export interface RescheduleRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    daysWithoutContact: number;
    leadStages: string[];
    excludeStatuses: string[];
    minContactAttempts?: number;
    maxContactAttempts?: number;
  };
  actions: {
    redistributeToNewResponsavel: boolean;
    createFollowUpTask: boolean;
    updateLeadPriority: boolean;
    sendNotification: boolean;
    customMessage?: string;
  };
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    enabled: boolean;
  };
}

export interface RescheduleExecution {
  id: string;
  ruleId: string;
  executedAt: Date;
  leadsProcessed: number;
  leadsRescheduled: number;
  errors: Array<{
    leadId: string;
    error: string;
  }>;
  summary: {
    totalEligible: number;
    successfulReschedules: number;
    failedReschedules: number;
    redistributions: number;
    tasksCreated: number;
    notificationsSent: number;
  };
}

export interface RescheduleCandidate {
  leadCard: LeadPipelineCard;
  daysSinceLastContact: number;
  lastContactAttempt?: ContactAttempt;
  totalContactAttempts: number;
  eligibilityReasons: string[];
  recommendedActions: string[];
}

class AutoRescheduleService {
  private defaultRules: RescheduleRule[] = [
    {
      id: 'standard-60-day',
      name: 'Reagendamento Padrão 60 Dias',
      description: 'Reagenda leads sem contato há 60 dias para novo responsável',
      enabled: true,
      conditions: {
        daysWithoutContact: 60,
        leadStages: ['novo', 'contato_inicial', 'qualificacao', 'proposta'],
        excludeStatuses: ['convertido', 'perdido', 'inativo'],
        minContactAttempts: 1,
        maxContactAttempts: 10
      },
      actions: {
        redistributeToNewResponsavel: true,
        createFollowUpTask: true,
        updateLeadPriority: false,
        sendNotification: true,
        customMessage: 'Lead reagendado automaticamente após 60 dias sem contato'
      },
      schedule: {
        frequency: 'daily',
        time: '09:00',
        enabled: true
      }
    },
    {
      id: 'high-value-30-day',
      name: 'Reagendamento Leads Alto Valor 30 Dias',
      description: 'Reagenda leads de alto valor sem contato há 30 dias',
      enabled: true,
      conditions: {
        daysWithoutContact: 30,
        leadStages: ['qualificacao', 'proposta', 'negociacao'],
        excludeStatuses: ['convertido', 'perdido'],
        minContactAttempts: 2
      },
      actions: {
        redistributeToNewResponsavel: true,
        createFollowUpTask: true,
        updateLeadPriority: true,
        sendNotification: true,
        customMessage: 'Lead de alto valor reagendado para evitar perda'
      },
      schedule: {
        frequency: 'daily',
        time: '08:00',
        enabled: true
      }
    },
    {
      id: 'abandoned-leads-90-day',
      name: 'Leads Abandonados 90 Dias',
      description: 'Reativa leads abandonados há mais de 90 dias',
      enabled: false,
      conditions: {
        daysWithoutContact: 90,
        leadStages: ['novo', 'contato_inicial'],
        excludeStatuses: ['convertido', 'perdido'],
        maxContactAttempts: 3
      },
      actions: {
        redistributeToNewResponsavel: true,
        createFollowUpTask: true,
        updateLeadPriority: false,
        sendNotification: true,
        customMessage: 'Lead reativado após período de abandono'
      },
      schedule: {
        frequency: 'weekly',
        time: '10:00',
        enabled: false
      }
    }
  ];

  private executionHistory: RescheduleExecution[] = [];

  /**
   * Identifica leads candidatos ao reagendamento baseado nas regras
   */
  async identifyRescheduleCandidates(
    leadCards: LeadPipelineCard[], 
    rule: RescheduleRule
  ): Promise<RescheduleCandidate[]> {
    const candidates: RescheduleCandidate[] = [];
    const now = new Date();

    for (const leadCard of leadCards) {
      // Verificar se o lead está em um estágio elegível
      if (!rule.conditions.leadStages.includes(leadCard.currentStage)) {
        continue;
      }

      // Verificar se o status não está excluído
      if (rule.conditions.excludeStatuses.includes(leadCard.status)) {
        continue;
      }

      // Calcular dias desde o último contato
      const lastContactAttempt = this.getLastContactAttempt(leadCard);
      const daysSinceLastContact = lastContactAttempt 
        ? this.calculateDaysDifference(new Date(lastContactAttempt.dataContato), now)
        : this.calculateDaysDifference(new Date(leadCard.dataCriacao), now);

      // Verificar se atende ao critério de dias sem contato
      if (daysSinceLastContact < rule.conditions.daysWithoutContact) {
        continue;
      }

      // Verificar número de tentativas de contato
      const totalContactAttempts = leadCard.contactAttempts.length;
      
      if (rule.conditions.minContactAttempts && totalContactAttempts < rule.conditions.minContactAttempts) {
        continue;
      }

      if (rule.conditions.maxContactAttempts && totalContactAttempts > rule.conditions.maxContactAttempts) {
        continue;
      }

      // Determinar razões de elegibilidade
      const eligibilityReasons = [
        `${daysSinceLastContact} dias sem contato (limite: ${rule.conditions.daysWithoutContact})`,
        `Estágio: ${leadCard.currentStage}`,
        `${totalContactAttempts} tentativas de contato`
      ];

      // Determinar ações recomendadas
      const recommendedActions = [];
      if (rule.actions.redistributeToNewResponsavel) {
        recommendedActions.push('Redistribuir para novo responsável');
      }
      if (rule.actions.createFollowUpTask) {
        recommendedActions.push('Criar tarefa de follow-up');
      }
      if (rule.actions.updateLeadPriority) {
        recommendedActions.push('Atualizar prioridade do lead');
      }

      candidates.push({
        leadCard,
        daysSinceLastContact,
        lastContactAttempt,
        totalContactAttempts,
        eligibilityReasons,
        recommendedActions
      });
    }

    return candidates;
  }

  /**
   * Executa o reagendamento automático baseado em uma regra
   */
  async executeReschedule(
    leadCards: LeadPipelineCard[], 
    rule: RescheduleRule
  ): Promise<RescheduleExecution> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const execution: RescheduleExecution = {
      id: executionId,
      ruleId: rule.id,
      executedAt: new Date(),
      leadsProcessed: 0,
      leadsRescheduled: 0,
      errors: [],
      summary: {
        totalEligible: 0,
        successfulReschedules: 0,
        failedReschedules: 0,
        redistributions: 0,
        tasksCreated: 0,
        notificationsSent: 0
      }
    };

    try {
      // Identificar candidatos
      const candidates = await this.identifyRescheduleCandidates(leadCards, rule);
      execution.summary.totalEligible = candidates.length;

      console.log(`Executando regra ${rule.name}: ${candidates.length} leads elegíveis`);

      // Processar cada candidato
      for (const candidate of candidates) {
        execution.leadsProcessed++;

        try {
          await this.processRescheduleCandidate(candidate, rule, execution);
          execution.leadsRescheduled++;
          execution.summary.successfulReschedules++;
        } catch (error) {
          execution.errors.push({
            leadId: candidate.leadCard.id,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
          execution.summary.failedReschedules++;
        }
      }

      console.log(`Reagendamento concluído: ${execution.summary.successfulReschedules} sucessos, ${execution.summary.failedReschedules} falhas`);

    } catch (error) {
      console.error('Erro na execução do reagendamento:', error);
      execution.errors.push({
        leadId: 'SYSTEM',
        error: error instanceof Error ? error.message : 'Erro do sistema'
      });
    }

    // Salvar histórico
    this.executionHistory.push(execution);

    return execution;
  }

  /**
   * Processa um candidato individual ao reagendamento
   */
  private async processRescheduleCandidate(
    candidate: RescheduleCandidate,
    rule: RescheduleRule,
    execution: RescheduleExecution
  ): Promise<void> {
    const { leadCard } = candidate;

    // 1. Redistribuir para novo responsável
    if (rule.actions.redistributeToNewResponsavel) {
      try {
        const novoResponsavel = await leadDistributionService.redistribuirLead(leadCard.id);
        if (novoResponsavel) {
          execution.summary.redistributions++;
          console.log(`Lead ${leadCard.id} redistribuído para ${novoResponsavel}`);
        }
      } catch (error) {
        console.error(`Erro ao redistribuir lead ${leadCard.id}:`, error);
      }
    }

    // 2. Criar tarefa de follow-up
    if (rule.actions.createFollowUpTask) {
      try {
        await leadTaskService.criarTarefaAutomatica({
          leadPipelineId: leadCard.id,
          tipo: 'contato_inicial',
          titulo: 'Follow-up - Reagendamento Automático',
          descricao: rule.actions.customMessage || 'Lead reagendado automaticamente',
          prioridade: rule.actions.updateLeadPriority ? 'alta' : 'media',
          dataVencimento: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
          responsavelId: leadCard.responsavelAtual,
          metadata: {
            ruleId: rule.id,
            originalResponsavel: leadCard.responsavelAtual,
            daysSinceLastContact: candidate.daysSinceLastContact,
            autoGenerated: true
          }
        });
        execution.summary.tasksCreated++;
      } catch (error) {
        console.error(`Erro ao criar tarefa para lead ${leadCard.id}:`, error);
      }
    }

    // 3. Atualizar prioridade do lead (se aplicável)
    if (rule.actions.updateLeadPriority) {
      // Aqui você implementaria a lógica para atualizar a prioridade do lead
      // Por exemplo, através de um serviço de leads
      console.log(`Prioridade do lead ${leadCard.id} deve ser atualizada`);
    }

    // 4. Enviar notificação
    if (rule.actions.sendNotification) {
      try {
        await this.sendRescheduleNotification(leadCard, rule, candidate);
        execution.summary.notificationsSent++;
      } catch (error) {
        console.error(`Erro ao enviar notificação para lead ${leadCard.id}:`, error);
      }
    }
  }

  /**
   * Envia notificação sobre o reagendamento
   */
  private async sendRescheduleNotification(
    leadCard: LeadPipelineCard,
    rule: RescheduleRule,
    candidate: RescheduleCandidate
  ): Promise<void> {
    // Implementar notificação (email, sistema interno, etc.)
    console.log(`Notificação enviada: Lead ${leadCard.nome} reagendado após ${candidate.daysSinceLastContact} dias`);
  }

  /**
   * Executa todas as regras ativas
   */
  async executeAllActiveRules(leadCards: LeadPipelineCard[]): Promise<RescheduleExecution[]> {
    const activeRules = this.defaultRules.filter(rule => rule.enabled);
    const executions: RescheduleExecution[] = [];

    for (const rule of activeRules) {
      if (this.shouldExecuteRule(rule)) {
        const execution = await this.executeReschedule(leadCards, rule);
        executions.push(execution);
      }
    }

    return executions;
  }

  /**
   * Verifica se uma regra deve ser executada baseada no schedule
   */
  private shouldExecuteRule(rule: RescheduleRule): boolean {
    if (!rule.schedule.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Verificar se é o horário correto
    if (currentTime !== rule.schedule.time) return false;

    // Verificar frequência
    switch (rule.schedule.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return now.getDay() === 1; // Segunda-feira
      case 'monthly':
        return now.getDate() === 1; // Primeiro dia do mês
      default:
        return false;
    }
  }

  /**
   * Obtém a última tentativa de contato de um lead
   */
  private getLastContactAttempt(leadCard: LeadPipelineCard): ContactAttempt | undefined {
    if (leadCard.contactAttempts.length === 0) return undefined;
    
    return leadCard.contactAttempts
      .sort((a, b) => new Date(b.dataContato).getTime() - new Date(a.dataContato).getTime())[0];
  }

  /**
   * Calcula a diferença em dias entre duas datas
   */
  private calculateDaysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtém todas as regras de reagendamento
   */
  getRules(): RescheduleRule[] {
    return [...this.defaultRules];
  }

  /**
   * Atualiza uma regra de reagendamento
   */
  updateRule(ruleId: string, updates: Partial<RescheduleRule>): boolean {
    const ruleIndex = this.defaultRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) return false;

    this.defaultRules[ruleIndex] = { ...this.defaultRules[ruleIndex], ...updates };
    return true;
  }

  /**
   * Obtém o histórico de execuções
   */
  getExecutionHistory(limit?: number): RescheduleExecution[] {
    const history = [...this.executionHistory].sort((a, b) => 
      new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
    );
    
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Obtém estatísticas de reagendamento
   */
  getStatistics(): {
    totalExecutions: number;
    totalLeadsRescheduled: number;
    averageSuccessRate: number;
    lastExecution?: Date;
    activeRules: number;
  } {
    const totalExecutions = this.executionHistory.length;
    const totalLeadsRescheduled = this.executionHistory.reduce((sum, exec) => sum + exec.leadsRescheduled, 0);
    const totalProcessed = this.executionHistory.reduce((sum, exec) => sum + exec.leadsProcessed, 0);
    const averageSuccessRate = totalProcessed > 0 ? (totalLeadsRescheduled / totalProcessed) * 100 : 0;
    const lastExecution = this.executionHistory.length > 0 
      ? new Date(Math.max(...this.executionHistory.map(exec => new Date(exec.executedAt).getTime())))
      : undefined;
    const activeRules = this.defaultRules.filter(rule => rule.enabled).length;

    return {
      totalExecutions,
      totalLeadsRescheduled,
      averageSuccessRate,
      lastExecution,
      activeRules
    };
  }

  /**
   * Simula a execução de uma regra sem fazer alterações
   */
  async simulateReschedule(
    leadCards: LeadPipelineCard[], 
    rule: RescheduleRule
  ): Promise<{
    candidates: RescheduleCandidate[];
    estimatedActions: {
      redistributions: number;
      tasksToCreate: number;
      notificationsToSend: number;
    };
  }> {
    const candidates = await this.identifyRescheduleCandidates(leadCards, rule);
    
    const estimatedActions = {
      redistributions: rule.actions.redistributeToNewResponsavel ? candidates.length : 0,
      tasksToCreate: rule.actions.createFollowUpTask ? candidates.length : 0,
      notificationsToSend: rule.actions.sendNotification ? candidates.length : 0
    };

    return { candidates, estimatedActions };
  }
}

export const autoRescheduleService = new AutoRescheduleService();
export default autoRescheduleService;