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
import db from '../config/database';

class TaskService {
  private recurrenceSeries: RecurrenceSeries[] = [];

  // CRUD Operations
  async getTasks(
    filter?: TaskFilter,
    sort?: TaskSort,
    page: number = 1,
    limit: number = 10
  ): Promise<TaskListResponse> {
    try {
      let query = `
        SELECT id, title, description, status, priority, assigned_to, 
               created_by, due_date, created_at, updated_at, lead_id,
               estimated_hours, category, project, tags
        FROM tasks 
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      // Aplicar filtros
      if (filter) {
        if (filter.status) {
          if (Array.isArray(filter.status)) {
            const placeholders = filter.status.map(() => `$${paramIndex++}`).join(',');
            query += ` AND status IN (${placeholders})`;
            params.push(...filter.status);
          } else {
            query += ` AND status = $${paramIndex}`;
            params.push(filter.status);
            paramIndex++;
          }
        }
        if (filter.priority) {
          if (Array.isArray(filter.priority)) {
            const placeholders = filter.priority.map(() => `$${paramIndex++}`).join(',');
            query += ` AND priority IN (${placeholders})`;
            params.push(...filter.priority);
          } else {
            query += ` AND priority = $${paramIndex}`;
            params.push(filter.priority);
            paramIndex++;
          }
        }
        if (filter.assignedTo) {
          if (Array.isArray(filter.assignedTo)) {
            const placeholders = filter.assignedTo.map(() => `$${paramIndex++}`).join(',');
            query += ` AND assigned_to IN (${placeholders})`;
            params.push(...filter.assignedTo);
          } else {
            query += ` AND assigned_to = $${paramIndex}`;
            params.push(filter.assignedTo);
            paramIndex++;
          }
        }
        if (filter.createdBy) {
          if (Array.isArray(filter.createdBy)) {
            const placeholders = filter.createdBy.map(() => `$${paramIndex++}`).join(',');
            query += ` AND created_by IN (${placeholders})`;
            params.push(...filter.createdBy);
          } else {
            query += ` AND created_by = $${paramIndex}`;
            params.push(filter.createdBy);
            paramIndex++;
          }
        }
        if (filter.search) {
          query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
          params.push(`%${filter.search}%`);
          paramIndex++;
        }
        if (filter.dueDateFrom) {
          query += ` AND due_date >= $${paramIndex}`;
          params.push(filter.dueDateFrom.toISOString());
          paramIndex++;
        }
        if (filter.dueDateTo) {
          query += ` AND due_date <= $${paramIndex}`;
          params.push(filter.dueDateTo.toISOString());
          paramIndex++;
        }
        if (filter.tags && filter.tags.length > 0) {
          query += ` AND tags::jsonb ?| array[$${paramIndex}]`;
          params.push(filter.tags);
          paramIndex++;
        }
        if (filter.category && filter.category.length > 0) {
          const placeholders = filter.category.map(() => `$${paramIndex++}`).join(',');
          query += ` AND category IN (${placeholders})`;
          params.push(...filter.category);
        }
        if (filter.project && filter.project.length > 0) {
          const placeholders = filter.project.map(() => `$${paramIndex++}`).join(',');
          query += ` AND project IN (${placeholders})`;
          params.push(...filter.project);
        }
      }

      // Aplicar ordenação
      if (sort) {
        const direction = sort.direction === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sort.field} ${direction}`;
      } else {
        query += ` ORDER BY created_at DESC`;
      }

      // Aplicar paginação
      const offset = (page - 1) * limit;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      // Contar total de registros
      let countQuery = `SELECT COUNT(*) as total FROM tasks WHERE 1=1`;
      const countParams: any[] = [];
      let countParamIndex = 1;

      if (filter) {
        if (filter.status) {
          if (Array.isArray(filter.status)) {
            const placeholders = filter.status.map(() => `$${countParamIndex++}`).join(',');
            countQuery += ` AND status IN (${placeholders})`;
            countParams.push(...filter.status);
          } else {
            countQuery += ` AND status = $${countParamIndex}`;
            countParams.push(filter.status);
            countParamIndex++;
          }
        }
        if (filter.priority) {
          if (Array.isArray(filter.priority)) {
            const placeholders = filter.priority.map(() => `$${countParamIndex++}`).join(',');
            countQuery += ` AND priority IN (${placeholders})`;
            countParams.push(...filter.priority);
          } else {
            countQuery += ` AND priority = $${countParamIndex}`;
            countParams.push(filter.priority);
            countParamIndex++;
          }
        }
        if (filter.assignedTo) {
          if (Array.isArray(filter.assignedTo)) {
            const placeholders = filter.assignedTo.map(() => `$${countParamIndex++}`).join(',');
            countQuery += ` AND assigned_to IN (${placeholders})`;
            countParams.push(...filter.assignedTo);
          } else {
            countQuery += ` AND assigned_to = $${countParamIndex}`;
            countParams.push(filter.assignedTo);
            countParamIndex++;
          }
        }
        if (filter.createdBy) {
          if (Array.isArray(filter.createdBy)) {
            const placeholders = filter.createdBy.map(() => `$${countParamIndex++}`).join(',');
            countQuery += ` AND created_by IN (${placeholders})`;
            countParams.push(...filter.createdBy);
          } else {
            countQuery += ` AND created_by = $${countParamIndex}`;
            countParams.push(filter.createdBy);
            countParamIndex++;
          }
        }
        if (filter.search) {
          countQuery += ` AND (title ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
          countParams.push(`%${filter.search}%`);
          countParamIndex++;
        }
        if (filter.dueDateFrom) {
          countQuery += ` AND due_date >= $${countParamIndex}`;
          countParams.push(filter.dueDateFrom.toISOString());
          countParamIndex++;
        }
        if (filter.dueDateTo) {
          countQuery += ` AND due_date <= $${countParamIndex}`;
          countParams.push(filter.dueDateTo.toISOString());
          countParamIndex++;
        }
        if (filter.tags && filter.tags.length > 0) {
          countQuery += ` AND tags::jsonb ?| array[$${countParamIndex}]`;
          countParams.push(filter.tags);
          countParamIndex++;
        }
        if (filter.category && filter.category.length > 0) {
          const placeholders = filter.category.map(() => `$${countParamIndex++}`).join(',');
          countQuery += ` AND category IN (${placeholders})`;
          countParams.push(...filter.category);
        }
        if (filter.project && filter.project.length > 0) {
          const placeholders = filter.project.map(() => `$${countParamIndex++}`).join(',');
          countQuery += ` AND project IN (${placeholders})`;
          countParams.push(...filter.project);
        }
      }

      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0]?.total || '0');

      const tasks: Task[] = result.rows.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        status: item.status as TaskStatus,
        priority: item.priority as TaskPriority,
        assignedTo: item.assigned_to,
        assignedBy: item.created_by,
        createdBy: item.created_by,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        dueDate: item.due_date ? new Date(item.due_date) : undefined,
        tags: item.tags ? JSON.parse(item.tags) : [],
        attachments: [],
        comments: [],
        estimatedHours: item.estimated_hours,
        category: item.category,
        project: item.project
      }));

      return {
        tasks,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      throw error;
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    try {
      const query = `
        SELECT id, title, description, status, priority, assigned_to, 
               created_by, due_date, created_at, updated_at, lead_id,
               estimated_hours, category, project, tags
        FROM tasks 
        WHERE id = $1
      `;
      
      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const data = result.rows[0];

      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
        assignedTo: data.assigned_to,
        assignedBy: data.created_by,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        tags: data.tags ? JSON.parse(data.tags) : [],
        attachments: [],
        comments: [],
        estimatedHours: data.estimated_hours,
        category: data.category,
        project: data.project
      };
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error);
      return null;
    }
  }

  async createTask(request: CreateTaskRequest, createdBy: string): Promise<Task> {
    try {
      // Criar tarefa no banco de dados PostgreSQL
      const query = `
        INSERT INTO tasks (
          title, description, status, priority, assigned_to, created_by, 
          due_date, lead_id, estimated_hours, category, project, tags,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING id, title, description, status, priority, assigned_to, 
                  created_by, due_date, created_at, updated_at, lead_id,
                  estimated_hours, category, project, tags
      `;

      const values = [
        request.title,
        request.description,
        request.status || 'pending',
        request.priority || 'medium',
        request.assignedTo,
        createdBy,
        request.dueDate?.toISOString(),
        request.leadId,
        request.estimatedHours,
        request.category,
        request.project,
        request.tags ? JSON.stringify(request.tags) : null
      ];

      const result = await db.query(query, values);
      const data = result.rows[0];

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
        tags: data.tags ? JSON.parse(data.tags) : [],
        attachments: [],
        comments: [],
        estimatedHours: data.estimated_hours,
        category: data.category,
        project: data.project
      };

      // Task criada com sucesso no banco

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
      priority,
      dueDate,
      leadId
    };

    return this.createTask(request, createdBy);
  }

  async updateTask(id: string, request: UpdateTaskRequest): Promise<Task | null> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [id];
      let paramIndex = 2;

      if (request.title !== undefined) {
        updateFields.push(`title = $${paramIndex}`);
        params.push(request.title);
        paramIndex++;
      }
      if (request.description !== undefined) {
        updateFields.push(`description = $${paramIndex}`);
        params.push(request.description);
        paramIndex++;
      }
      if (request.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        params.push(request.status);
        paramIndex++;
      }
      if (request.priority !== undefined) {
        updateFields.push(`priority = $${paramIndex}`);
        params.push(request.priority);
        paramIndex++;
      }
      if (request.assignedTo !== undefined) {
        updateFields.push(`assigned_to = $${paramIndex}`);
        params.push(request.assignedTo);
        paramIndex++;
      }
      if (request.dueDate !== undefined) {
        updateFields.push(`due_date = $${paramIndex}`);
        params.push(request.dueDate?.toISOString());
        paramIndex++;
      }
      if (request.estimatedHours !== undefined) {
        updateFields.push(`estimated_hours = $${paramIndex}`);
        params.push(request.estimatedHours);
        paramIndex++;
      }
      if (request.category !== undefined) {
        updateFields.push(`category = $${paramIndex}`);
        params.push(request.category);
        paramIndex++;
      }
      if (request.project !== undefined) {
        updateFields.push(`project = $${paramIndex}`);
        params.push(request.project);
        paramIndex++;
      }
      if (request.tags !== undefined) {
        updateFields.push(`tags = $${paramIndex}`);
        params.push(JSON.stringify(request.tags));
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return this.getTaskById(id);
      }

      updateFields.push(`updated_at = NOW()`);

      const query = `
        UPDATE tasks 
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING id, title, description, status, priority, assigned_to, 
                  created_by, due_date, created_at, updated_at, lead_id,
                  estimated_hours, category, project, tags
      `;

      const result = await db.query(query, params);

      if (result.rows.length === 0) {
        return null;
      }

      const data = result.rows[0];

      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
        assignedTo: data.assigned_to,
        assignedBy: data.created_by,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        tags: data.tags ? JSON.parse(data.tags) : [],
        attachments: [],
        comments: [],
        estimatedHours: data.estimated_hours,
        category: data.category,
        project: data.project
      };
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return null;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      const query = `DELETE FROM tasks WHERE id = $1`;
      const result = await db.query(query, [id]);

      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      return false;
    }
  }

  // Métodos de comentários (simplificados para agora)
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
      content,
      userId,
      userName,
      authorName: userName,
      createdAt: new Date(),
      updatedAt: new Date(),
      emoji,
      attachments: attachments || []
    };

    // TODO: Implementar comentários no banco quando a tabela estiver criada
    return comment;
  }

  async updateComment(taskId: string, commentId: string, content: string): Promise<TaskComment | null> {
    // TODO: Implementar quando a tabela de comentários estiver criada
    return null;
  }

  async deleteComment(taskId: string, commentId: string): Promise<boolean> {
    // TODO: Implementar quando a tabela de comentários estiver criada
    return false;
  }

  // Estatísticas
  async getTaskStats(): Promise<TaskStats> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as high,
          COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium,
          COUNT(CASE WHEN priority = 'low' THEN 1 END) as low,
          COUNT(CASE WHEN due_date < NOW() AND status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue
        FROM tasks
      `;

      const result = await db.query(query);
      const data = result.rows[0];

      const total = parseInt(data.total);
      const pending = parseInt(data.pending);
      const inProgress = parseInt(data.in_progress);
      const completed = parseInt(data.completed);
      const cancelled = parseInt(data.cancelled);
      const high = parseInt(data.high);
      const medium = parseInt(data.medium);
      const low = parseInt(data.low);
      const overdue = parseInt(data.overdue);

      return {
        total,
        byStatus: {
          [TaskStatus.TODO]: pending,
          [TaskStatus.IN_PROGRESS]: inProgress,
          [TaskStatus.IN_REVIEW]: 0,
          [TaskStatus.DONE]: completed,
          [TaskStatus.CANCELLED]: cancelled
        },
        byPriority: {
          [TaskPriority.HIGH]: high,
          [TaskPriority.MEDIUM]: medium,
          [TaskPriority.LOW]: low,
          [TaskPriority.URGENT]: 0
        },
        overdue,
        dueToday: 0,
        dueThisWeek: 0
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    const result = await this.getTasks({ status: [status] });
    return result.tasks;
  }

  async getTasksByAssignee(userId: string): Promise<Task[]> {
    const result = await this.getTasks({ assignedTo: [userId] });
    return result.tasks;
  }

  async getOverdueTasks(): Promise<Task[]> {
    try {
      const query = `
        SELECT id, title, description, status, priority, assigned_to, 
               created_by, due_date, created_at, updated_at, lead_id,
               estimated_hours, category, project, tags
        FROM tasks 
        WHERE due_date < NOW() 
        AND status NOT IN ('completed', 'cancelled')
        ORDER BY due_date ASC
      `;

      const result = await db.query(query);

      return result.rows.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        status: item.status as TaskStatus,
        priority: item.priority as TaskPriority,
        assignedTo: item.assigned_to,
        assignedBy: item.created_by,
        createdBy: item.created_by,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        dueDate: item.due_date ? new Date(item.due_date) : undefined,
        tags: item.tags ? JSON.parse(item.tags) : [],
        attachments: [],
        comments: [],
        estimatedHours: item.estimated_hours,
        category: item.category,
        project: item.project
      }));
    } catch (error) {
      console.error('Erro ao buscar tarefas vencidas:', error);
      return [];
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
    return this.updateTask(id, { status });
  }

  async assignTask(id: string, assignedTo: string): Promise<Task | null> {
    return this.updateTask(id, { assignedTo });
  }

  // Métodos de notificação (simplificados)
  private async sendStatusChangeNotification(task: Task, oldStatus: TaskStatus, newStatus: TaskStatus): Promise<void> {
    // TODO: Implementar notificações
  }

  private async sendAssignmentNotification(task: Task, newAssignee: string): Promise<void> {
    // TODO: Implementar notificações
  }

  private async sendCommentNotification(task: Task, comment: TaskComment, commentAuthorId: string): Promise<void> {
    // TODO: Implementar notificações
  }

  // Métodos de recorrência (mantidos para compatibilidade)
  async createRecurrenceSeries(request: CreateRecurrenceSeriesRequest, createdBy: string): Promise<RecurrenceSeries> {
    // TODO: Implementar quando necessário
    throw new Error('Recorrência não implementada ainda');
  }

  async generateRecurringTasks(seriesId: string, monthsAhead: number = 3): Promise<Task[]> {
    // TODO: Implementar quando necessário
    return [];
  }

  private getNextOccurrence(currentDate: Date, rule: RecurrenceRule): Date | null {
    // TODO: Implementar quando necessário
    return null;
  }

  private shouldStopGeneration(date: Date, rule: RecurrenceRule, seriesStartDate: Date): boolean {
    // TODO: Implementar quando necessário
    return true;
  }

  async updateRecurrenceSeries(seriesId: string, request: UpdateRecurrenceSeriesRequest): Promise<RecurrenceSeries | null> {
    // TODO: Implementar quando necessário
    return null;
  }

  async updateRecurringTask(taskId: string, request: UpdateTaskRequest): Promise<Task | null> {
    // TODO: Implementar quando necessário
    return null;
  }

  async getRecurrenceSeries(): Promise<RecurrenceSeries[]> {
    return this.recurrenceSeries;
  }

  async getRecurrenceSeriesById(seriesId: string): Promise<RecurrenceSeries | null> {
    return this.recurrenceSeries.find(s => s.id === seriesId) || null;
  }

  async deleteRecurrenceSeries(seriesId: string): Promise<boolean> {
    // TODO: Implementar quando necessário
    return false;
  }
}

export const taskService = new TaskService();
export default taskService;