import { 
  LeadTask, 
  TaskStatus, 
  LeadPipelineCard, 
  ContactAttemptType,
  ContactAttemptResult,
  ContactAttempt 
} from '../types/crm';
import { TaskPriority } from '../types/task';
import { taskService } from './taskService';

export interface TaskNotification {
  id: string;
  taskId: string;
  leadPipelineId: string;
  recipientId: string;
  type: 'task_created' | 'task_overdue' | 'task_reassigned' | 'lead_redistributed';
  message: string;
  sentAt: Date;
  read: boolean;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  deadlineHours: number;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  autoCreate: boolean;
  stage: string;
}

class LeadTaskService {
  private tasks: LeadTask[] = [];
  private notifications: TaskNotification[] = [];
  private taskTemplates: TaskTemplate[] = [
    {
      id: 'initial_contact',
      name: 'Contato Inicial',
      description: 'Realizar primeiro contato com o lead',
      deadlineHours: 24,
      priority: 'alta',
      autoCreate: true,
      stage: 'novo_lead'
    },
    {
      id: 'follow_up_call',
      name: 'Ligação de Follow-up',
      description: 'Realizar ligação de acompanhamento',
      deadlineHours: 48,
      priority: 'media',
      autoCreate: false,
      stage: 'ligacao_1'
    },
    {
      id: 'whatsapp_contact',
      name: 'Contato via WhatsApp',
      description: 'Enviar mensagem via WhatsApp',
      deadlineHours: 12,
      priority: 'media',
      autoCreate: false,
      stage: 'mensagem'
    },
    {
      id: 'final_evaluation',
      name: 'Avaliação Final',
      description: 'Realizar avaliação final do lead',
      deadlineHours: 72,
      priority: 'alta',
      autoCreate: false,
      stage: 'desfecho'
    }
  ];

  // Mapear prioridade do lead para prioridade da tarefa
  private mapPriorityToTaskPriority(priority: 'baixa' | 'media' | 'alta' | 'urgente'): TaskPriority {
    const priorityMap = {
      'baixa': TaskPriority.LOW,
      'media': TaskPriority.MEDIUM,
      'alta': TaskPriority.HIGH,
      'urgente': TaskPriority.URGENT
    };
    return priorityMap[priority];
  }

  // Criar tarefa automática para novo lead
  async criarTarefaAutomatica(
    leadPipelineId: string, 
    responsavelId: string, 
    templateId: string = 'initial_contact'
  ): Promise<LeadTask> {
    const template = this.taskTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template de tarefa não encontrado: ${templateId}`);
    }

    const deadline = new Date();
    deadline.setHours(deadline.getHours() + template.deadlineHours);

    try {
      // Criar tarefa no banco de dados usando o taskService
      const taskFromDB = await taskService.createLeadTask(
        leadPipelineId,
        template.name,
        template.description,
        responsavelId,
        responsavelId, // createdBy
        deadline,
        this.mapPriorityToTaskPriority(template.priority)
      );

      // Criar tarefa local para compatibilidade
      const task: LeadTask = {
        id: taskFromDB.id,
        leadPipelineId,
        titulo: template.name,
        descricao: template.description,
        tipo: 'contato_inicial',
        status: 'pendente',
        prioridade: template.priority,
        responsavel: responsavelId,
        dataVencimento: deadline,
        dataCriacao: new Date(),
        observacoes: '',
        tentativasRedistribuicao: 0,
        maxTentativasRedistribuicao: 3,
        taskDatabaseId: taskFromDB.id, // Vincular com a tarefa do banco
        notificacoes: []
      };

      this.tasks.push(task);

      // Criar notificação
      await this.criarNotificacao(
        task.id,
        leadPipelineId,
        responsavelId,
        'task_created',
        `Nova tarefa criada: ${template.name}`
      );

      return task;
    } catch (error) {
      console.error('Erro ao criar tarefa automática:', error);
      throw new Error('Falha ao criar tarefa automática');
    }
  }

  // Método para criar tarefa de contato inicial
  async criarTarefaContatoInicial(
    leadPipelineId: string,
    responsavelId: string
  ): Promise<string> {
    try {
      const tarefa = await this.criarTarefaAutomatica(
        leadPipelineId,
        responsavelId,
        'initial_contact'
      );
      return tarefa.id;
    } catch (error) {
      console.error('Erro ao criar tarefa de contato inicial:', error);
      throw error;
    }
  }

  // Verificar tarefas vencidas
  async verificarTarefasVencidas(): Promise<LeadTask[]> {
    const agora = new Date();
    const tarefasVencidas = this.tasks.filter(
      task => task.status === 'pendente' && task.dataVencimento < agora
    );

    for (const tarefa of tarefasVencidas) {
      await this.processarTarefaVencida(tarefa);
    }

    return tarefasVencidas;
  }

  private async processarTarefaVencida(tarefa: LeadTask): Promise<void> {
    // Fechar tarefa com observação
    tarefa.status = 'vencida';
    tarefa.observacoes = 'Não houve contato com o cliente - Tarefa vencida';
    tarefa.dataConclusao = new Date();

    // Incrementar tentativas de redistribuição
    tarefa.tentativasRedistribuicao += 1;

    // Criar notificação sobre tarefa vencida
    await this.criarNotificacao(
      tarefa.id,
      tarefa.leadPipelineId,
      tarefa.responsavel,
      'task_overdue',
      `Tarefa vencida: ${tarefa.titulo}`
    );
  }

  // Completar tarefa
  async completarTarefa(
    taskId: string, 
    resultado: ContactAttemptResult,
    observacoes?: string
  ): Promise<LeadTask | null> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return null;

    task.status = 'concluida';
    task.dataConclusao = new Date();
    task.observacoes = observacoes || '';

    return task;
  }

  // Registrar tentativa de contato
  async registrarTentativaContato(
    leadPipelineId: string,
    tentativa: {
      tipo: ContactAttemptType;
      resultado: ContactAttemptResult;
      observacoes: string;
      responsavelId: string;
    }
  ): Promise<ContactAttempt> {
    const novaAttempt: ContactAttempt = {
      id: this.generateId(),
      leadPipelineId,
      tipo: tentativa.tipo,
      dataContato: new Date(),
      resultado: tentativa.resultado,
      responsavel: tentativa.responsavelId,
      observacoes: tentativa.observacoes
    };

    return novaAttempt;
  }

  // Agendar recontato automático para 60 dias
  async agendarRecontato(leadPipelineId: string, responsavelId: string): Promise<LeadTask> {
    const dataRecontato = new Date();
    dataRecontato.setDate(dataRecontato.getDate() + 60);

    const tarefaRecontato: LeadTask = {
      id: this.generateId(),
      leadPipelineId,
      titulo: 'Recontato Agendado',
      descricao: 'Realizar novo contato após período de 60 dias',
      tipo: 'reagendamento',
      status: 'pendente',
      prioridade: 'media',
      responsavel: responsavelId,
      dataVencimento: dataRecontato,
      dataCriacao: new Date(),
      observacoes: 'Recontato automático agendado',
      tentativasRedistribuicao: 0,
      maxTentativasRedistribuicao: 3,
      notificacoes: []
    };

    this.tasks.push(tarefaRecontato);
    return tarefaRecontato;
  }

  // Criar notificação
  private async criarNotificacao(
    taskId: string,
    leadPipelineId: string,
    recipientId: string,
    type: TaskNotification['type'],
    message: string
  ): Promise<void> {
    const notification: TaskNotification = {
      id: this.generateId(),
      taskId,
      leadPipelineId,
      recipientId,
      type,
      message,
      sentAt: new Date(),
      read: false
    };

    this.notifications.push(notification);
  }

  // Métodos auxiliares
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Métodos públicos para consulta
  async getTarefasPorLead(leadPipelineId: string): Promise<LeadTask[]> {
    return this.tasks.filter(task => task.leadPipelineId === leadPipelineId);
  }

  async getTarefasPorResponsavel(responsavelId: string): Promise<LeadTask[]> {
    return this.tasks.filter(task => task.responsavel === responsavelId);
  }

  async getTarefasVencidas(): Promise<LeadTask[]> {
    const agora = new Date();
    return this.tasks.filter(
      task => task.status === 'pendente' && task.dataVencimento < agora
    );
  }

  async getTarefasPendentes(): Promise<LeadTask[]> {
    return this.tasks.filter(task => task.status === 'pendente');
  }

  async getNotificacoesPorUsuario(userId: string): Promise<TaskNotification[]> {
    return this.notifications.filter(n => n.recipientId === userId);
  }

  async marcarNotificacaoComoLida(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // Configurar templates de tarefa
  async getTaskTemplates(): Promise<TaskTemplate[]> {
    return [...this.taskTemplates];
  }

  async updateTaskTemplate(templateId: string, updates: Partial<TaskTemplate>): Promise<TaskTemplate | null> {
    const template = this.taskTemplates.find(t => t.id === templateId);
    if (template) {
      Object.assign(template, updates);
      return template;
    }
    return null;
  }

  // Estatísticas
  async getEstatisticasTarefas(): Promise<{
    total: number;
    pendentes: number;
    concluidas: number;
    vencidas: number;
    porResponsavel: Record<string, number>;
  }> {
    const total = this.tasks.length;
    const pendentes = this.tasks.filter(t => t.status === 'pendente').length;
    const concluidas = this.tasks.filter(t => t.status === 'concluida').length;
    const vencidas = this.tasks.filter(t => t.status === 'vencida').length;

    const porResponsavel: Record<string, number> = {};
    this.tasks.forEach(task => {
      porResponsavel[task.responsavel] = (porResponsavel[task.responsavel] || 0) + 1;
    });

    return {
      total,
      pendentes,
      concluidas,
      vencidas,
      porResponsavel
    };
  }

  /**
   * Finaliza uma tarefa automaticamente por timeout
   */
  async finalizarTarefaAutomaticamente(
    tarefaId: string,
    observacao: string
  ): Promise<boolean> {
    const tarefa = this.tasks.find(t => t.id === tarefaId);
    
    if (!tarefa || tarefa.status !== 'pendente') {
      return false;
    }

    tarefa.status = 'concluida';
    tarefa.dataConclusao = new Date();
    tarefa.observacoes = observacao;

    // Adicionar notificação
    await this.criarNotificacao(
      tarefa.id,
      tarefa.leadPipelineId,
      tarefa.responsavel,
      'task_overdue',
      `Tarefa "${tarefa.titulo}" foi finalizada automaticamente por timeout`
    );

    return true;
  }

  /**
   * Reatribui uma tarefa para outro responsável
   */
  async reatribuirTarefa(
    tarefaId: string,
    novoResponsavelId: string,
    motivo?: string
  ): Promise<LeadTask | null> {
    const tarefa = this.tasks.find(t => t.id === tarefaId);
    
    if (!tarefa) {
      return null;
    }

    const responsavelAnterior = tarefa.responsavel;
    
    // Atualizar tarefa com nova atribuição
    const tarefaAtualizada: LeadTask = {
      ...tarefa,
      responsavel: novoResponsavelId,
      observacoes: `${tarefa.observacoes || ''}\n[${new Date().toLocaleString()}] Reatribuída de ${tarefa.responsavel} para ${novoResponsavelId}. Motivo: ${motivo}`.trim()
    }
    
    // Atualizar no array
    const index = this.tasks.findIndex(t => t.id === tarefaId);
    if (index !== -1) {
      this.tasks[index] = tarefaAtualizada;
    }

    // Criar notificação para o novo responsável
    await this.criarNotificacao(
      tarefaAtualizada.id,
      tarefaAtualizada.leadPipelineId,
      novoResponsavelId,
      'task_reassigned',
      `Tarefa "${tarefaAtualizada.titulo}" foi atribuída a você${motivo ? ` - ${motivo}` : ''}`
    );

    // Criar notificação para o responsável anterior
    await this.criarNotificacao(
      tarefaAtualizada.id,
      tarefaAtualizada.leadPipelineId,
      responsavelAnterior,
      'task_reassigned',
      `Tarefa "${tarefaAtualizada.titulo}" foi reatribuída para outro responsável`
    );

    return tarefaAtualizada;
  }

  /**
   * Atribui múltiplas tarefas para um responsável
   */
  async atribuirTarefasEmLote(
    tarefaIds: string[],
    responsavelId: string,
    motivo?: string
  ): Promise<LeadTask[]> {
    const tarefasAtualizadas: LeadTask[] = [];

    for (const tarefaId of tarefaIds) {
      const tarefa = await this.reatribuirTarefa(tarefaId, responsavelId, motivo);
      if (tarefa) {
        tarefasAtualizadas.push(tarefa);
      }
    }

    return tarefasAtualizadas;
  }

  /**
   * Obtém estatísticas de carga de trabalho por responsável
   */
  async getCargaTrabalhoResponsaveis(): Promise<Record<string, {
    total: number;
    pendentes: number;
    vencidas: number;
    concluidas: number;
  }>> {
    const estatisticas: Record<string, {
      total: number;
      pendentes: number;
      vencidas: number;
      concluidas: number;
    }> = {};

    const hoje = new Date();

    this.tasks.forEach(tarefa => {
      if (!estatisticas[tarefa.responsavel]) {
        estatisticas[tarefa.responsavel] = {
          total: 0,
          pendentes: 0,
          vencidas: 0,
          concluidas: 0
        };
      }

      const stats = estatisticas[tarefa.responsavel];
      stats.total++;

      if (tarefa.status === 'concluida') {
        stats.concluidas++;
      } else if (tarefa.status === 'pendente') {
        stats.pendentes++;
        
        // Verificar se está vencida
        if (tarefa.dataVencimento && tarefa.dataVencimento < hoje) {
          stats.vencidas++;
        }
      }
    });

    return estatisticas;
  }

  /**
   * Redistribui tarefas de um responsável para outros
   */
  async redistribuirTarefasResponsavel(
    responsavelOrigemId: string,
    novaDistribuicao: { responsavelId: string; quantidade: number }[],
    motivo?: string
  ): Promise<LeadTask[]> {
    const tarefasPendentes = this.tasks.filter(
      t => t.responsavel === responsavelOrigemId && t.status === 'pendente'
    );

    if (tarefasPendentes.length === 0) {
      return [];
    }

    const tarefasRedistribuidas: LeadTask[] = [];
    let indiceAtual = 0;

    for (const distribuicao of novaDistribuicao) {
      for (let i = 0; i < distribuicao.quantidade && indiceAtual < tarefasPendentes.length; i++) {
        const tarefa = tarefasPendentes[indiceAtual];
        const tarefaAtualizada = await this.reatribuirTarefa(
          tarefa.id,
          distribuicao.responsavelId,
          motivo
        );
        
        if (tarefaAtualizada) {
          tarefasRedistribuidas.push(tarefaAtualizada);
        }
        
        indiceAtual++;
      }
    }

    return tarefasRedistribuidas;
  }

  /**
   * Obtém tarefas próximas do vencimento para um responsável
   */
  async getTarefasProximasVencimento(
    responsavelId: string,
    horasAntecedencia: number = 24
  ): Promise<LeadTask[]> {
    const agora = new Date();
    const limiteVencimento = new Date(agora.getTime() + (horasAntecedencia * 60 * 60 * 1000));

    return this.tasks.filter(tarefa => 
      tarefa.responsavel === responsavelId &&
      tarefa.status === 'pendente' &&
      tarefa.dataVencimento &&
      tarefa.dataVencimento <= limiteVencimento &&
      tarefa.dataVencimento > agora
    );
  }

  /**
   * Obtém histórico de reatribuições de uma tarefa
   */
  async getHistoricoReatribuicoes(tarefaId: string): Promise<TaskNotification[]> {
    return this.notifications.filter(
      n => n.taskId === tarefaId && n.type === 'task_reassigned'
    );
  }

  /**
   * Verifica se um responsável pode receber mais tarefas
   */
  async podeReceberMaisTarefas(
    responsavelId: string,
    limiteTarefas: number = 10
  ): Promise<boolean> {
    const tarefasPendentes = await this.getTarefasPorResponsavel(responsavelId);
    const pendentesAtivas = tarefasPendentes.filter(t => t.status === 'pendente');
    
    return pendentesAtivas.length < limiteTarefas;
  }

}

export const leadTaskService = new LeadTaskService();
export default leadTaskService;