import Notification from '../models/Notification.js';
import { validationResult, body } from 'express-validator';

class NotificationController {
  // Validações para criação/atualização
  static getValidationRules() {
    return [
      body('usuario_id').isInt({ min: 1 }).withMessage('ID do usuário deve ser válido'),
      body('titulo').notEmpty().withMessage('Título é obrigatório').isLength({ min: 3, max: 200 }),
      body('mensagem').notEmpty().withMessage('Mensagem é obrigatória').isLength({ min: 5, max: 1000 }),
      body('tipo').optional().isIn(['info', 'success', 'warning', 'error']),
      body('categoria').optional().isLength({ max: 50 }),
      body('link').optional().isURL().withMessage('Link deve ser uma URL válida'),
      body('data_expiracao').optional().isISO8601().withMessage('Data de expiração deve ser válida'),
      body('prioridade').optional().isIn(['baixa', 'media', 'alta', 'urgente']),
      body('metadata').optional().isObject()
    ];
  }

  // GET /api/notifications - Listar todas as notificações
  static async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        tipo, 
        categoria,
        prioridade,
        lida,
        usuario_id,
        data_inicio,
        data_fim,
        search 
      } = req.query;
      
      const filters = {};
      if (tipo) filters.tipo = tipo;
      if (categoria) filters.categoria = categoria;
      if (prioridade) filters.prioridade = prioridade;
      if (lida !== undefined) filters.lida = lida === 'true';
      if (usuario_id) filters.usuario_id = parseInt(usuario_id);
      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (search) filters.search = search;

      const notifications = await Notification.findAll(filters, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/notifications/:id - Buscar notificação por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da notificação inválido'
        });
      }

      const notification = await Notification.findById(parseInt(id));
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificação não encontrada'
        });
      }

      res.json({
        success: true,
        data: notification.toJSON()
      });
    } catch (error) {
      console.error('Erro ao buscar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/notifications/user/:userId - Buscar notificações por usuário
  static async getByUser(req, res) {
    try {
      const { userId } = req.params;
      const { tipo, categoria, lida, limit = 20 } = req.query;
      
      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário inválido'
        });
      }

      const filters = {};
      if (tipo) filters.tipo = tipo;
      if (categoria) filters.categoria = categoria;
      if (lida !== undefined) filters.lida = lida === 'true';

      const notifications = await Notification.findByUser(parseInt(userId), filters, parseInt(limit));
      
      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Erro ao buscar notificações do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/notifications/user/:userId/unread - Buscar notificações não lidas por usuário
  static async getUnreadByUser(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 10 } = req.query;
      
      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário inválido'
        });
      }

      const notifications = await Notification.findUnreadByUser(parseInt(userId), parseInt(limit));
      
      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Erro ao buscar notificações não lidas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/notifications/user/:userId/unread/count - Contar notificações não lidas
  static async getUnreadCount(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário inválido'
        });
      }

      const count = await Notification.countUnreadByUser(parseInt(userId));
      
      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // POST /api/notifications - Criar nova notificação
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const notificationData = req.body;
      
      // Validar se data de expiração não é no passado
      if (notificationData.data_expiracao) {
        const expiracao = new Date(notificationData.data_expiracao);
        const agora = new Date();
        
        if (expiracao <= agora) {
          return res.status(400).json({
            success: false,
            message: 'Data de expiração deve ser no futuro'
          });
        }
      }

      const notification = await Notification.create(notificationData);
      
      res.status(201).json({
        success: true,
        message: 'Notificação criada com sucesso',
        data: notification.toJSON()
      });
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // POST /api/notifications/bulk - Criar múltiplas notificações
  static async createBulk(req, res) {
    try {
      const { notifications } = req.body;
      
      if (!Array.isArray(notifications) || notifications.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Lista de notificações é obrigatória'
        });
      }

      if (notifications.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Máximo de 100 notificações por vez'
        });
      }

      // Validar cada notificação
      for (const notification of notifications) {
        if (!notification.usuario_id || !notification.titulo || !notification.mensagem) {
          return res.status(400).json({
            success: false,
            message: 'Cada notificação deve ter usuario_id, titulo e mensagem'
          });
        }
      }

      const createdNotifications = await Notification.createBulk(notifications);
      
      res.status(201).json({
        success: true,
        message: `${createdNotifications.length} notificações criadas com sucesso`,
        data: createdNotifications
      });
    } catch (error) {
      console.error('Erro ao criar notificações em lote:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PUT /api/notifications/:id - Atualizar notificação
  static async update(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da notificação inválido'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const notification = await Notification.findById(parseInt(id));
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificação não encontrada'
        });
      }

      // Validar se data de expiração não é no passado (apenas se estiver sendo alterada)
      if (req.body.data_expiracao) {
        const expiracao = new Date(req.body.data_expiracao);
        const agora = new Date();
        
        if (expiracao <= agora) {
          return res.status(400).json({
            success: false,
            message: 'Data de expiração deve ser no futuro'
          });
        }
      }

      await notification.update(req.body);
      
      res.json({
        success: true,
        message: 'Notificação atualizada com sucesso',
        data: notification.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // DELETE /api/notifications/:id - Deletar notificação
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da notificação inválido'
        });
      }

      const notification = await Notification.findById(parseInt(id));
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificação não encontrada'
        });
      }

      await notification.delete();
      
      res.json({
        success: true,
        message: 'Notificação deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PATCH /api/notifications/:id/read - Marcar notificação como lida
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da notificação inválido'
        });
      }

      const notification = await Notification.findById(parseInt(id));
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificação não encontrada'
        });
      }

      await notification.markAsRead();
      
      res.json({
        success: true,
        message: 'Notificação marcada como lida',
        data: notification.toJSON()
      });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PATCH /api/notifications/user/:userId/read-all - Marcar todas as notificações como lidas
  static async markAllAsRead(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário inválido'
        });
      }

      const count = await Notification.markAllAsReadByUser(parseInt(userId));
      
      res.json({
        success: true,
        message: `${count} notificações marcadas como lidas`
      });
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PATCH /api/notifications/read-multiple - Marcar múltiplas notificações como lidas
  static async markMultipleAsRead(req, res) {
    try {
      const { notification_ids } = req.body;
      
      if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Lista de IDs de notificações é obrigatória'
        });
      }

      // Validar se todos os IDs são números
      const invalidIds = notification_ids.filter(id => isNaN(id));
      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Todos os IDs devem ser números válidos'
        });
      }

      const count = await Notification.markMultipleAsRead(notification_ids.map(id => parseInt(id)));
      
      res.json({
        success: true,
        message: `${count} notificações marcadas como lidas`
      });
    } catch (error) {
      console.error('Erro ao marcar múltiplas notificações como lidas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // DELETE /api/notifications/cleanup - Limpar notificações antigas
  static async cleanup(req, res) {
    try {
      const { days = 30 } = req.query;
      
      if (isNaN(days) || days < 1) {
        return res.status(400).json({
          success: false,
          message: 'Número de dias deve ser um valor positivo'
        });
      }

      const count = await Notification.deleteOldNotifications(parseInt(days));
      
      res.json({
        success: true,
        message: `${count} notificações antigas removidas`
      });
    } catch (error) {
      console.error('Erro ao limpar notificações antigas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default NotificationController;