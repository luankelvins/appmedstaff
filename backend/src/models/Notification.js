import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Notification {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.user_id = data.user_id;
    this.title = data.title;
    this.message = data.message;
    this.type = data.type || 'info';
    this.read = data.read || false;
    this.data = data.data || {};
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validações
  static validate(data) {
    const errors = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Título é obrigatório');
    }

    if (!data.message || data.message.trim().length === 0) {
      errors.push('Mensagem é obrigatória');
    }

    const validTypes = ['info', 'success', 'warning', 'error'];
    if (data.type && !validTypes.includes(data.type)) {
      errors.push('Tipo deve ser um dos valores válidos: ' + validTypes.join(', '));
    }

    return errors;
  }

  // Criar notificação
  static async create(data) {
    const errors = this.validate(data);
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    const notification = new Notification(data);
    
    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        INSERT INTO notifications (id, user_id, title, message, type, read, data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        notification.id,
        notification.user_id,
        notification.title,
        notification.message,
        notification.type,
        notification.read,
        JSON.stringify(notification.data)
      ]);

      client.release();

      return new Notification(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const client = await pool.connect();
      
      const result = await client.query('SELECT * FROM notifications WHERE id = $1', [id]);
      
      client.release();

      if (result.rows.length === 0) {
        return null;
      }

      return new Notification(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar notificação:', error);
      throw error;
    }
  }

  // Listar todas com filtros
  static async findAll(filters = {}) {
    try {
      const client = await pool.connect();
      
      let queryText = 'SELECT * FROM notifications WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.user_id) {
        queryText += ` AND user_id = $${paramIndex}`;
        queryParams.push(filters.user_id);
        paramIndex++;
      }

      if (filters.type) {
        queryText += ` AND type = $${paramIndex}`;
        queryParams.push(filters.type);
        paramIndex++;
      }

      if (filters.read !== undefined) {
        queryText += ` AND read = $${paramIndex}`;
        queryParams.push(filters.read);
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

      return result.rows.map(item => new Notification(item));
    } catch (error) {
      console.error('Erro ao listar notificações:', error);
      throw error;
    }
  }

  // Buscar notificações por usuário
  static async findByUser(userId, filters = {}) {
    return this.findAll({ ...filters, user_id: userId });
  }

  // Buscar notificações não lidas por usuário
  static async findUnreadByUser(userId, filters = {}) {
    return this.findAll({ ...filters, user_id: userId, read: false });
  }

  // Contar notificações não lidas por usuário
  static async countUnreadByUser(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw new Error('Erro ao contar notificações não lidas: ' + error.message);
    }

    return count;
  }

  // Atualizar notificação
  async update(data) {
    const errors = Notification.validate({ ...this, ...data });
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        UPDATE notifications 
        SET title = $1, message = $2, type = $3, read = $4, data = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `, [
        data.title || this.title,
        data.message || this.message,
        data.type || this.type,
        data.read !== undefined ? data.read : this.read,
        JSON.stringify(data.data || this.data),
        this.id
      ]);

      client.release();

      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
      throw error;
    }
  }

  // Marcar como lida
  async markAsRead() {
    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        UPDATE notifications SET read = true, updated_at = NOW() WHERE id = $1 RETURNING *
      `, [this.id]);

      client.release();

      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  // Deletar notificação
  async delete() {
    try {
      const client = await pool.connect();
      
      await client.query('DELETE FROM notifications WHERE id = $1', [this.id]);
      
      client.release();

      return true;
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      throw error;
    }
  }

  // Marcar como não lida
  async markAsUnread() {
    return this.update({ read: false });
  }

  // Marcar múltiplas notificações como lidas
  static async markMultipleAsRead(notificationIds) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .in('id', notificationIds);

    if (error) {
      throw new Error('Erro ao marcar notificações como lidas: ' + error.message);
    }

    return true;
  }

  // Marcar todas as notificações de um usuário como lidas
  static async markAllAsReadByUser(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw new Error('Erro ao marcar todas as notificações como lidas: ' + error.message);
    }

    return true;
  }

  // Deletar notificação
  async delete() {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', this.id);

    if (error) {
      throw new Error('Erro ao deletar notificação: ' + error.message);
    }

    return true;
  }

  // Deletar notificações antigas
  static async deleteOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      throw new Error('Erro ao deletar notificações antigas: ' + error.message);
    }

    return true;
  }

  // Criar notificação em lote
  static async createBulk(notifications) {
    const validatedNotifications = notifications.map(notif => {
      const errors = this.validate(notif);
      if (errors.length > 0) {
        throw new Error('Dados inválidos: ' + errors.join(', '));
      }
      
      return {
        id: notif.id || uuidv4(),
        user_id: notif.user_id,
        title: notif.title,
        message: notif.message,
        type: notif.type || 'info',
        read: notif.read || false,
        data: notif.data || {}
      };
    });

    const { data, error } = await supabase
      .from('notifications')
      .insert(validatedNotifications)
      .select();

    if (error) {
      throw new Error('Erro ao criar notificações em lote: ' + error.message);
    }

    return data.map(item => new Notification(item));
  }

  // Métodos auxiliares
  isRead() {
    return this.read;
  }

  isUnread() {
    return !this.read;
  }

  isInfo() {
    return this.type === 'info';
  }

  isSuccess() {
    return this.type === 'success';
  }

  isWarning() {
    return this.type === 'warning';
  }

  isError() {
    return this.type === 'error';
  }

  getTimeAgo() {
    if (!this.created_at) return '';
    
    const now = new Date();
    const created = new Date(this.created_at);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return created.toLocaleDateString('pt-BR');
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      title: this.title,
      message: this.message,
      type: this.type,
      read: this.read,
      data: this.data,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default Notification;