import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskComment,
  TaskAttachment,
  TaskFilter,
  TaskSort,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskListResponse,
  TaskStats,
  RecurrenceRule,
  RecurrenceFrequency,
  RecurrenceEndType,
  WeekDay,
  RecurrenceSeries,
  CreateRecurrenceSeriesRequest,
  UpdateRecurrenceSeriesRequest,
  RecurrenceEditMode
} from '../types/task';
import { notificationService } from './notificationService';
import { supabase } from '../config/supabase';

// Mock data para desenvolvimento
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implementar autenticação',
    description: 'Desenvolver sistema de login e registro de usuários',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    assignedTo: 'user1',
    assignedBy: 'admin',
    createdBy: 'admin',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    dueDate: new Date('2024-01-25'),
    tags: ['frontend', 'backend', 'security'],
    attachments: [],
    comments: [],
    estimatedHours: 16,
    actualHours: 8,
    category: 'Desenvolvimento',
    project: 'MedStaff Platform'
  },
  {
    id: '2',
    title: 'Configurar CI/CD',
    description: 'Implementar pipeline de integração e deploy contínuo',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assignedTo: 'user2',
    createdBy: 'admin',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    dueDate: new Date('2024-01-30'),
    tags: ['devops', 'automation'],
    attachments: [],
    comments: [],
    estimatedHours: 12,
    category: 'DevOps',
    project: 'MedStaff Platform'
  },
  {
    id: '3',
    title: 'Revisar documentação',
    description: 'Atualizar documentação da API e componentes',
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    assignedTo: 'user3',
    createdBy: 'admin',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-14'),
    dueDate: new Date('2024-01-20'),
    completedAt: new Date('2024-01-14'),
    tags: ['documentation'],
    attachments: [],
    comments: [],
    estimatedHours: 4,
    actualHours: 3,
    category: 'Documentação',
    project: 'MedStaff Platform'
  }
];

const mockComments: TaskComment[] = [
  {
    id: 'c1',
    taskId: '1',
    userId: 'user1',
    userName: 'João Silva',
    authorName: 'João Silva',
    content: 'Iniciando implementação do sistema de autenticação',
    createdAt: new Date('2024-01-16T10:00:00'),
    emoji: '🚀'
  },
  {
    id: 'c2',
    taskId: '1',
    userId: 'admin',
    userName: 'Admin',
    authorName: 'Admin',
    content: 'Lembre-se de implementar validação de senha forte',
    createdAt: new Date('2024-01-16T14:30:00'),
    emoji: '⚠️',
    attachments: ['security-guidelines.pdf']
  }
];

class TaskService {
  private tasks: Task[] = [...mockTasks];
  private comments: TaskComment[] = [...mockComments];
  private recurrenceSeries: RecurrenceSeries[] = [];

  // CRUD Operations
  async getTasks(
    filter?: TaskFilter,
    sort?: TaskSort,
    page: number = 1,
    limit: number = 10
  ): Promise<TaskListResponse> {
    console.log('📋 TaskService - getTasks executado');
    
    let filteredTasks = [...this.tasks];

    // Aplicar filtros
    if (filter) {
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower))
        );
      }
      
      if (filter.status && !Array.isArray(filter.status)) {
        filteredTasks = filteredTasks.filter(task => task.status === filter.status);
      }
      
      if (filter.priority && !Array.isArray(filter.priority)) {
        filteredTasks = filteredTasks.filter(task => task.priority === filter.priority);
      }
      
      if (filter.assignedTo) {
        filteredTasks = filteredTasks.filter(task => task.assignedTo === filter.assignedTo);
      }
      
      if (filter.category) {
        filteredTasks = filteredTasks.filter(task => task.category === filter.category);
      }
      
      if (filter.project) {
        filteredTasks = filteredTasks.filter(task => task.project === filter.project);
      }
    }

    // Aplicar ordenação
    if (sort) {
      filteredTasks.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sort.field) {
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'createdAt':
            aValue = a.createdAt;
            bValue = b.createdAt;
            break;
          case 'dueDate':
            aValue = a.dueDate || new Date(0);
            bValue = b.dueDate || new Date(0);
            break;
          case 'priority':
            const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
            aValue = priorityOrder[a.priority];
            bValue = priorityOrder[b.priority];
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const total = filteredTasks.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    
    // Aplicar paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    
    return {
      tasks: paginatedTasks,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getTaskById(id: string): Promise<Task | null> {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      // Add comments to task
      task.comments = this.comments.filter(c => c.taskId === id);
    }
    return task || null;
  }

  async createTask(request: CreateTaskRequest, createdBy: string): Promise<Task> {
    try {
      // Criar tarefa no banco de dados Supabase
      const taskData = {
        title: request.title,
        description: request.description,
        status: request.status || 'pending',
        priority: request.priority || 'medium',
        assigned_to: request.assignedTo,
        created_by: createdBy,
        due_date: request.dueDate?.toISOString(),
        tags: request.tags || [],
        metadata: {
          category: request.category,
          project: request.project,
          estimatedHours: request.estimatedHours,
          leadId: request.leadId // Para vincular com leads
        }
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar tarefa no banco:', error);
        throw new Error('Falha ao criar tarefa no banco de dados');
      }

      // Mapear dados do banco para o tipo Task
      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
        assignedTo: data.assigned_to,
        assignedBy: createdBy,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        tags: data.tags || [],
        attachments: [],
        comments: [],
        estimatedHours: data.metadata?.estimatedHours,
        category: data.metadata?.category,
        project: data.metadata?.project
      };

      // Adicionar à lista local para compatibilidade
      this.tasks.push(newTask);

      // Enviar notificação se a tarefa foi atribuída
      if (newTask.assignedTo && newTask.assignedTo !== createdBy) {
        await this.sendAssignmentNotification(newTask, newTask.assignedTo);
      }

      return newTask;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  }

  // Método específico para criar tarefas de leads
  async createLeadTask(
    leadId: string,
    title: string,
    description: string,
    assignedTo: string,
    createdBy: string,
    dueDate?: Date,
    priority: TaskPriority = TaskPriority.MEDIUM
  ): Promise<Task> {
    const request: CreateTaskRequest = {
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      category: 'Lead',
      project: 'Pipeline de Leads',
      leadId
    };

    return this.createTask(request, createdBy);
  }

  async updateTask(id: string, request: UpdateTaskRequest): Promise<Task | null> {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return null;

    const currentTask = this.tasks[taskIndex];
    const updatedTask: Task = {
      ...currentTask,
      ...request,
      updatedAt: new Date(),
      completedAt: request.status === TaskStatus.DONE ? new Date() : currentTask.completedAt
    };

    // Check if status changed and send notification
    if (request.status && request.status !== currentTask.status) {
      await this.sendStatusChangeNotification(updatedTask, currentTask.status, request.status);
    }

    // Check if assignee changed and send notification
    if (request.assignedTo && request.assignedTo !== currentTask.assignedTo) {
      await this.sendAssignmentNotification(updatedTask, request.assignedTo);
    }

    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return false;

    this.tasks.splice(taskIndex, 1);
    // Remove comments related to this task
    this.comments = this.comments.filter(c => c.taskId !== id);
    return true;
  }

  // Comments
  async addComment(
    taskId: string, 
    content: string, 
    userId: string, 
    userName: string,
    emoji?: string,
    attachments?: string[]
  ): Promise<TaskComment> {
    const comment: TaskComment = {
      id: Date.now().toString(),
      taskId,
      userId,
      userName,
      authorName: userName,
      content,
      createdAt: new Date(),
      emoji,
      attachments
    };

    this.comments.push(comment);
    
    // Also add to the task
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.comments.push(comment);
      
      // Send notification to task assignee and creator (if different from comment author)
      await this.sendCommentNotification(task, comment, userId);
    }
    
    return comment;
  }

  async updateComment(taskId: string, commentId: string, content: string): Promise<TaskComment | null> {
    const commentIndex = this.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return null;

    this.comments[commentIndex] = {
      ...this.comments[commentIndex],
      content,
      updatedAt: new Date()
    };

    // Also update the comment in the task
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      const taskCommentIndex = task.comments.findIndex(c => c.id === commentId);
      if (taskCommentIndex !== -1) {
        task.comments[taskCommentIndex] = this.comments[commentIndex];
      }
    }

    return this.comments[commentIndex];
  }

  async deleteComment(taskId: string, commentId: string): Promise<boolean> {
    const commentIndex = this.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return false;

    const comment = this.comments[commentIndex];
    
    // Remove from comments array
    this.comments.splice(commentIndex, 1);
    
    // Also remove from the task
    const task = this.tasks.find(t => t.id === comment.taskId);
    if (task) {
      const taskCommentIndex = task.comments.findIndex(c => c.id === commentId);
      if (taskCommentIndex !== -1) {
        task.comments.splice(taskCommentIndex, 1);
      }
    }
    
    return true;
  }

  // Statistics
  async getTaskStats(): Promise<TaskStats> {
    // Simular delay de rede para desenvolvimento
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('📊 TaskService - getTaskStats executado');
    
    const total = this.tasks.length;
    const byStatus = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.IN_REVIEW]: 0,
      [TaskStatus.DONE]: 0,
      [TaskStatus.CANCELLED]: 0
    };
    const byPriority = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.URGENT]: 0
    };

    let overdue = 0;
    let dueToday = 0;
    let dueThisWeek = 0;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    this.tasks.forEach(task => {
      byStatus[task.status]++;
      byPriority[task.priority]++;

      if (task.dueDate && task.status !== TaskStatus.DONE) {
        const dueDate = new Date(task.dueDate);
        if (dueDate < todayStart) {
          overdue++;
        } else if (dueDate.toDateString() === today.toDateString()) {
          dueToday++;
        } else if (dueDate <= weekEnd) {
          dueThisWeek++;
        }
      }
    });

    return {
      total,
      byStatus,
      byPriority,
      overdue,
      dueToday,
      dueThisWeek
    };
  }

  // Utility methods
  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    return this.tasks.filter(task => task.status === status);
  }

  async getTasksByAssignee(userId: string): Promise<Task[]> {
    return this.tasks.filter(task => task.assignedTo === userId);
  }

  async getOverdueTasks(): Promise<Task[]> {
    const today = new Date();
    return this.tasks.filter(task => 
      task.dueDate && 
      task.dueDate < today && 
      task.status !== TaskStatus.DONE
    );
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
    return this.updateTask(id, { status });
  }

  async assignTask(id: string, assignedTo: string): Promise<Task | null> {
    return this.updateTask(id, { assignedTo });
  }

  // Notification methods
  private async sendStatusChangeNotification(task: Task, oldStatus: TaskStatus, newStatus: TaskStatus): Promise<void> {
    try {
      const statusMessages = {
        [TaskStatus.TODO]: 'A Fazer',
        [TaskStatus.IN_PROGRESS]: 'Em Progresso',
        [TaskStatus.IN_REVIEW]: 'Em Revisão',
        [TaskStatus.DONE]: 'Concluída',
        [TaskStatus.CANCELLED]: 'Cancelada'
      };

      const notificationType = newStatus === TaskStatus.DONE ? 'success' : 
                              newStatus === TaskStatus.CANCELLED ? 'warning' : 'info';
      
      const priority = task.priority === TaskPriority.URGENT ? 'urgent' :
                      task.priority === TaskPriority.HIGH ? 'high' :
                      task.priority === TaskPriority.MEDIUM ? 'medium' : 'low';

      // Notify assignee
      if (task.assignedTo) {
        await notificationService.createNotification({
          title: 'Status da tarefa alterado',
          message: `A tarefa "${task.title}" mudou de ${statusMessages[oldStatus]} para ${statusMessages[newStatus]}`,
          type: notificationType,
          category: 'task',
          priority: priority,
          userId: task.assignedTo,
          actionUrl: `/tasks/${task.id}`,
          actionLabel: 'Ver tarefa',
          metadata: {
            taskId: task.id,
            oldStatus,
            newStatus,
            taskTitle: task.title
          }
        });
      }

      // Notify creator if different from assignee
      if (task.createdBy && task.createdBy !== task.assignedTo) {
        await notificationService.createNotification({
          title: 'Status da tarefa alterado',
          message: `A tarefa "${task.title}" mudou de ${statusMessages[oldStatus]} para ${statusMessages[newStatus]}`,
          type: notificationType,
          category: 'task',
          priority: priority,
          userId: task.createdBy,
          actionUrl: `/tasks/${task.id}`,
          actionLabel: 'Ver tarefa',
          metadata: {
            taskId: task.id,
            oldStatus,
            newStatus,
            taskTitle: task.title
          }
        });
      }
    } catch (error) {
      console.error('Erro ao enviar notificação de mudança de status:', error);
    }
  }

  private async sendAssignmentNotification(task: Task, newAssignee: string): Promise<void> {
    try {
      const priority = task.priority === TaskPriority.URGENT ? 'urgent' :
                      task.priority === TaskPriority.HIGH ? 'high' :
                      task.priority === TaskPriority.MEDIUM ? 'medium' : 'low';

      await notificationService.createNotification({
        title: 'Nova tarefa atribuída',
        message: `Você foi designado para a tarefa "${task.title}"`,
        type: 'info',
        category: 'task',
        priority: priority,
        userId: newAssignee,
        actionUrl: `/tasks/${task.id}`,
        actionLabel: 'Ver tarefa',
        metadata: {
          taskId: task.id,
          taskTitle: task.title,
          dueDate: task.dueDate?.toISOString(),
          priority: task.priority
        }
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de atribuição:', error);
    }
  }

  private async sendCommentNotification(task: Task, comment: TaskComment, commentAuthorId: string): Promise<void> {
    try {
      const priority = task.priority === TaskPriority.URGENT ? 'urgent' :
                      task.priority === TaskPriority.HIGH ? 'high' :
                      task.priority === TaskPriority.MEDIUM ? 'medium' : 'low';

      const usersToNotify = new Set<string>();
      
      // Notify task assignee
      if (task.assignedTo && task.assignedTo !== commentAuthorId) {
        usersToNotify.add(task.assignedTo);
      }
      
      // Notify task creator
      if (task.createdBy && task.createdBy !== commentAuthorId) {
        usersToNotify.add(task.createdBy);
      }

      // Send notifications to all relevant users
      for (const userId of usersToNotify) {
        await notificationService.createNotification({
          title: 'Novo comentário na tarefa',
          message: `${comment.authorName} comentou na tarefa "${task.title}"`,
          type: 'info',
          category: 'task',
          priority: priority,
          userId: userId,
          actionUrl: `/tasks/${task.id}`,
          actionLabel: 'Ver tarefa',
          metadata: {
            taskId: task.id,
            taskTitle: task.title,
            commentId: comment.id,
            commentAuthor: comment.authorName,
            commentContent: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : '')
          }
        });
      }
    } catch (error) {
      console.error('Erro ao enviar notificação de comentário:', error);
    }
  }

  // Recurrence Methods
  async createRecurrenceSeries(request: CreateRecurrenceSeriesRequest, createdBy: string): Promise<RecurrenceSeries> {
    const seriesId = `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const series: RecurrenceSeries = {
      id: seriesId,
      templateTask: request.templateTask,
      recurrenceRule: request.recurrenceRule,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      generatedUntil: new Date(),
      isActive: true
    };

    this.recurrenceSeries.push(series);
    
    // Gerar tarefas iniciais (próximos 3 meses)
    await this.generateRecurringTasks(seriesId, 3);
    
    return series;
  }

  async generateRecurringTasks(seriesId: string, monthsAhead: number = 3): Promise<Task[]> {
    const series = this.recurrenceSeries.find(s => s.id === seriesId);
    if (!series || !series.isActive) {
      throw new Error('Tarefa recorrente não encontrada ou inativa');
    }

    const generatedTasks: Task[] = [];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + monthsAhead);

    let currentDate = new Date(series.generatedUntil);
    currentDate.setDate(currentDate.getDate() + 1); // Começar do próximo dia

    while (currentDate <= endDate) {
      const nextDate = this.getNextOccurrence(currentDate, series.recurrenceRule);
      if (!nextDate || nextDate > endDate) break;

      // Verificar se deve parar baseado na regra de fim
      if (this.shouldStopGeneration(nextDate, series.recurrenceRule, series.createdAt)) {
        break;
      }

      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const task: Task = {
        id: taskId,
        title: series.templateTask.title,
        description: series.templateTask.description,
        status: TaskStatus.TODO,
        priority: series.templateTask.priority,
        assignedTo: series.templateTask.assignedTo,
        createdBy: series.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: nextDate,
        tags: series.templateTask.tags || [],
        attachments: [],
        comments: [],
        estimatedHours: series.templateTask.estimatedHours,
        category: series.templateTask.category,
        project: series.templateTask.project,
        isRecurring: true,
        recurrenceId: seriesId,
        recurrenceRule: series.recurrenceRule
      };

      this.tasks.push(task);
      generatedTasks.push(task);
      currentDate = nextDate;
    }

    // Atualizar data de geração da série
    series.generatedUntil = currentDate;
    series.updatedAt = new Date();

    return generatedTasks;
  }

  private getNextOccurrence(currentDate: Date, rule: RecurrenceRule): Date | null {
    const nextDate = new Date(currentDate);

    switch (rule.frequency) {
      case RecurrenceFrequency.DAILY:
        nextDate.setDate(nextDate.getDate() + rule.interval);
        break;

      case RecurrenceFrequency.WEEKLY:
        if (rule.weekDays && rule.weekDays.length > 0) {
          // Encontrar próximo dia da semana válido
          let daysToAdd = 1;
          while (daysToAdd <= 7) {
            const testDate = new Date(currentDate);
            testDate.setDate(testDate.getDate() + daysToAdd);
            if (rule.weekDays.includes(testDate.getDay() as WeekDay)) {
              nextDate.setDate(currentDate.getDate() + daysToAdd);
              break;
            }
            daysToAdd++;
          }
          if (daysToAdd > 7) {
            // Se não encontrou nesta semana, pular para próxima semana
            nextDate.setDate(nextDate.getDate() + (7 * rule.interval));
          }
        } else {
          nextDate.setDate(nextDate.getDate() + (7 * rule.interval));
        }
        break;

      case RecurrenceFrequency.MONTHLY:
        if (rule.monthDay) {
          nextDate.setMonth(nextDate.getMonth() + rule.interval);
          nextDate.setDate(rule.monthDay);
        } else {
          nextDate.setMonth(nextDate.getMonth() + rule.interval);
        }
        break;

      case RecurrenceFrequency.YEARLY:
        if (rule.yearMonth && rule.monthDay) {
          nextDate.setFullYear(nextDate.getFullYear() + rule.interval);
          nextDate.setMonth(rule.yearMonth - 1); // Month is 0-indexed
          nextDate.setDate(rule.monthDay);
        } else {
          nextDate.setFullYear(nextDate.getFullYear() + rule.interval);
        }
        break;

      default:
        return null;
    }

    return nextDate;
  }

  private shouldStopGeneration(date: Date, rule: RecurrenceRule, seriesStartDate: Date): boolean {
    switch (rule.endType) {
      case RecurrenceEndType.NEVER:
        return false;

      case RecurrenceEndType.ON_DATE:
        return rule.endDate ? date > rule.endDate : false;

      case RecurrenceEndType.AFTER_OCCURRENCES:
        if (!rule.occurrences) return false;
        // Contar quantas tarefas já foram geradas para esta série
        const seriesId = this.recurrenceSeries.find(s => s.recurrenceRule === rule)?.id;
        const generatedCount = this.tasks.filter(t => t.recurrenceId === seriesId).length;
        return generatedCount >= rule.occurrences;

      default:
        return false;
    }
  }

  async updateRecurrenceSeries(seriesId: string, request: UpdateRecurrenceSeriesRequest): Promise<RecurrenceSeries | null> {
    const series = this.recurrenceSeries.find(s => s.id === seriesId);
    if (!series) return null;

    // Atualizar série
    if (request.templateTask) {
      series.templateTask = { ...series.templateTask, ...request.templateTask };
    }
    if (request.recurrenceRule) {
      series.recurrenceRule = request.recurrenceRule;
    }
    series.updatedAt = new Date();

    return series;
  }

  async updateRecurringTask(taskId: string, request: UpdateTaskRequest): Promise<Task | null> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || !task.isRecurring) return null;

    const editMode = request.editMode || RecurrenceEditMode.THIS_TASK;

    switch (editMode) {
      case RecurrenceEditMode.THIS_TASK:
        // Atualizar apenas esta tarefa
        Object.assign(task, request);
        task.updatedAt = new Date();
        // Marcar como modificada individualmente
        task.originalDate = task.dueDate;
        break;

      case RecurrenceEditMode.THIS_AND_FUTURE:
        // Atualizar esta tarefa e todas as futuras da série
        const futureTasks = this.tasks.filter(t => 
          t.recurrenceId === task.recurrenceId && 
          t.dueDate && task.dueDate && 
          t.dueDate >= task.dueDate
        );
        
        futureTasks.forEach(futureTask => {
          Object.assign(futureTask, request);
          futureTask.updatedAt = new Date();
        });
        break;

      case RecurrenceEditMode.ALL_TASKS:
        // Atualizar template da série e todas as tarefas
        if (task.recurrenceId) {
          const series = this.recurrenceSeries.find(s => s.id === task.recurrenceId);
          if (series) {
            Object.assign(series.templateTask, request);
            series.updatedAt = new Date();
          }

          const allTasks = this.tasks.filter(t => t.recurrenceId === task.recurrenceId);
          allTasks.forEach(seriesTask => {
            Object.assign(seriesTask, request);
            seriesTask.updatedAt = new Date();
          });
        }
        break;
    }

    return task;
  }

  async getRecurrenceSeries(): Promise<RecurrenceSeries[]> {
    return [...this.recurrenceSeries];
  }

  async getRecurrenceSeriesById(seriesId: string): Promise<RecurrenceSeries | null> {
    return this.recurrenceSeries.find(s => s.id === seriesId) || null;
  }

  async deleteRecurrenceSeries(seriesId: string): Promise<boolean> {
    const seriesIndex = this.recurrenceSeries.findIndex(s => s.id === seriesId);
    if (seriesIndex === -1) return false;

    // Remover todas as tarefas da série
    this.tasks = this.tasks.filter(t => t.recurrenceId !== seriesId);
    
    // Remover a série
    this.recurrenceSeries.splice(seriesIndex, 1);
    
    return true;
  }
}

export const taskService = new TaskService();
export default taskService;