import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Task {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.user_id = data.user_id;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status || 'pending';
    this.priority = data.priority || 'medium';
    this.due_date = data.due_date;
    this.assigned_to = data.assigned_to;
    this.created_by = data.created_by;
    this.tags = data.tags || [];
    this.metadata = data.metadata || {};
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validações
  static validate(data) {
    const errors = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Título é obrigatório');
    }

    if (data.title && data.title.length > 255) {
      errors.push('Título deve ter no máximo 255 caracteres');
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Status deve ser um dos valores válidos: ' + validStatuses.join(', '));
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (data.priority && !validPriorities.includes(data.priority)) {
      errors.push('Prioridade deve ser um dos valores válidos: ' + validPriorities.join(', '));
    }

    if (data.due_date && isNaN(Date.parse(data.due_date))) {
      errors.push('Data de vencimento deve ser uma data válida');
    }

    return errors;
  }

  // Criar tarefa
  static async create(data) {
    const errors = this.validate(data);
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    const task = new Task(data);
    
    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        INSERT INTO tasks (id, user_id, title, description, status, priority, due_date, assigned_to, created_by, tags, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        task.id,
        task.user_id,
        task.title,
        task.description,
        task.status,
        task.priority,
        task.due_date,
        task.assigned_to,
        task.created_by,
        JSON.stringify(task.tags),
        JSON.stringify(task.metadata)
      ]);

      client.release();

      return new Task(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const client = await pool.connect();
      
      const result = await client.query('SELECT * FROM tasks WHERE id = $1', [id]);
      
      client.release();

      if (result.rows.length === 0) {
        return null;
      }

      return new Task(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error);
      throw error;
    }
  }

  // Listar todas com filtros
  static async findAll(filters = {}) {
    try {
      const client = await pool.connect();
      
      let queryText = 'SELECT * FROM tasks WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.status) {
        queryText += ` AND status = $${paramIndex}`;
        queryParams.push(filters.status);
        paramIndex++;
      }

      if (filters.priority) {
        queryText += ` AND priority = $${paramIndex}`;
        queryParams.push(filters.priority);
        paramIndex++;
      }

      if (filters.assigned_to) {
        queryText += ` AND assigned_to = $${paramIndex}`;
        queryParams.push(filters.assigned_to);
        paramIndex++;
      }

      if (filters.created_by) {
        queryText += ` AND created_by = $${paramIndex}`;
        queryParams.push(filters.created_by);
        paramIndex++;
      }

      if (filters.search) {
        queryText += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        queryParams.push(`%${filters.search}%`);
        paramIndex++;
      }

      queryText += ' ORDER BY created_at DESC';

      if (filters.limit) {
        queryText += ` LIMIT $${paramIndex}`;
        queryParams.push(filters.limit);
        paramIndex++;
      }

      if (filters.offset) {
        queryText += ` OFFSET $${paramIndex}`;
        queryParams.push(filters.offset);
      }

      const result = await client.query(queryText, queryParams);
      
      client.release();

      return result.rows.map(item => new Task(item));
    } catch (error) {
      console.error('Erro ao listar tarefas:', error);
      throw error;
    }
  }

  // Buscar tarefas por usuário
  static async findByUser(userId, filters = {}) {
    return this.findAll({ ...filters, user_id: userId });
  }

  // Buscar tarefas atribuídas a um usuário
  static async findAssignedTo(userId, filters = {}) {
    return this.findAll({ ...filters, assigned_to: userId });
  }

  // Atualizar tarefa
  async update(data) {
    const errors = Task.validate({ ...this, ...data });
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        UPDATE tasks 
        SET title = $1, description = $2, status = $3, priority = $4, 
            due_date = $5, assigned_to = $6, tags = $7, metadata = $8, updated_at = NOW()
        WHERE id = $9
        RETURNING *
      `, [
        data.title || this.title,
        data.description || this.description,
        data.status || this.status,
        data.priority || this.priority,
        data.due_date || this.due_date,
        data.assigned_to || this.assigned_to,
        JSON.stringify(data.tags || this.tags),
        JSON.stringify(data.metadata || this.metadata),
        this.id
      ]);

      client.release();

      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  }

  // Deletar tarefa
  async delete() {
    try {
      const client = await pool.connect();
      
      await client.query('DELETE FROM tasks WHERE id = $1', [this.id]);
      
      client.release();

      return true;
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  isOverdue() {
    if (!this.due_date) return false;
    return new Date(this.due_date) < new Date() && this.status !== 'completed';
  }

  isPending() {
    return this.status === 'pending';
  }

  isInProgress() {
    return this.status === 'in_progress';
  }

  isCompleted() {
    return this.status === 'completed';
  }

  isCancelled() {
    return this.status === 'cancelled';
  }

  isHighPriority() {
    return ['high', 'urgent'].includes(this.priority);
  }

  getDaysUntilDue() {
    if (!this.due_date) return null;
    const today = new Date();
    const dueDate = new Date(this.due_date);
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      due_date: this.due_date,
      assigned_to: this.assigned_to,
      created_by: this.created_by,
      tags: this.tags,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Estatísticas das tarefas
  static async getStats() {
    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendentes,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as em_andamento,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as concluidas,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as canceladas,
          COUNT(CASE WHEN priority = 'low' THEN 1 END) as baixa_prioridade,
          COUNT(CASE WHEN priority = 'medium' THEN 1 END) as media_prioridade,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as alta_prioridade,
          COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgente,
          COUNT(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 END) as atrasadas
        FROM tasks
      `);

      client.release();

      return {
        total: parseInt(result.rows[0].total),
        por_status: {
          pendentes: parseInt(result.rows[0].pendentes),
          em_andamento: parseInt(result.rows[0].em_andamento),
          concluidas: parseInt(result.rows[0].concluidas),
          canceladas: parseInt(result.rows[0].canceladas)
        },
        por_prioridade: {
          baixa: parseInt(result.rows[0].baixa_prioridade),
          media: parseInt(result.rows[0].media_prioridade),
          alta: parseInt(result.rows[0].alta_prioridade),
          urgente: parseInt(result.rows[0].urgente)
        },
        atrasadas: parseInt(result.rows[0].atrasadas)
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas das tarefas:', error);
      throw error;
    }
  }
}

export default Task;