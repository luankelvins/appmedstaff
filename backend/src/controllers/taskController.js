import Task from '../models/Task.js';
import { validationResult, body } from 'express-validator';

class TaskController {
  // Validações para criação/atualização
  static getValidationRules() {
    return [
      body('titulo').notEmpty().withMessage('Título é obrigatório').isLength({ min: 3, max: 200 }),
      body('descricao').optional().isLength({ max: 1000 }),
      body('status').optional().isIn(['pendente', 'em_andamento', 'concluida', 'cancelada']),
      body('prioridade').optional().isIn(['baixa', 'media', 'alta', 'urgente']),
      body('data_vencimento').optional().isISO8601().withMessage('Data de vencimento deve ser válida'),
      body('usuario_id').isInt({ min: 1 }).withMessage('ID do usuário deve ser válido'),
      body('responsavel_id').optional().isInt({ min: 1 }).withMessage('ID do responsável deve ser válido'),
      body('categoria').optional().isLength({ max: 50 }),
      body('tags').optional().isArray(),
      body('estimativa_horas').optional().isFloat({ min: 0 }).withMessage('Estimativa deve ser positiva')
    ];
  }

  // GET /api/tasks - Listar todas as tarefas
  static async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        prioridade, 
        categoria,
        usuario_id,
        responsavel_id,
        vencimento,
        search 
      } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (prioridade) filters.prioridade = prioridade;
      if (categoria) filters.categoria = categoria;
      if (usuario_id) filters.usuario_id = parseInt(usuario_id);
      if (responsavel_id) filters.responsavel_id = parseInt(responsavel_id);
      if (vencimento) filters.vencimento = vencimento;
      if (search) filters.search = search;

      const tasks = await Task.findAll(filters, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/tasks/:id - Buscar tarefa por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da tarefa inválido'
        });
      }

      const task = await Task.findById(parseInt(id));
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarefa não encontrada'
        });
      }

      res.json({
        success: true,
        data: task.toJSON()
      });
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/tasks/user/:userId - Buscar tarefas por usuário
  static async getByUser(req, res) {
    try {
      const { userId } = req.params;
      const { status, prioridade } = req.query;
      
      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário inválido'
        });
      }

      const filters = {};
      if (status) filters.status = status;
      if (prioridade) filters.prioridade = prioridade;

      const tasks = await Task.findByUser(parseInt(userId), filters);
      
      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Erro ao buscar tarefas do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/tasks/assigned/:userId - Buscar tarefas atribuídas a um usuário
  static async getAssignedTo(req, res) {
    try {
      const { userId } = req.params;
      const { status, prioridade } = req.query;
      
      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário inválido'
        });
      }

      const filters = {};
      if (status) filters.status = status;
      if (prioridade) filters.prioridade = prioridade;

      const tasks = await Task.findAssignedTo(parseInt(userId), filters);
      
      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Erro ao buscar tarefas atribuídas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // POST /api/tasks - Criar nova tarefa
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

      const taskData = req.body;
      
      // Validar se data de vencimento não é no passado
      if (taskData.data_vencimento) {
        const vencimento = new Date(taskData.data_vencimento);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        if (vencimento < hoje) {
          return res.status(400).json({
            success: false,
            message: 'Data de vencimento não pode ser no passado'
          });
        }
      }

      const task = await Task.create(taskData);
      
      res.status(201).json({
        success: true,
        message: 'Tarefa criada com sucesso',
        data: task.toJSON()
      });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PUT /api/tasks/:id - Atualizar tarefa
  static async update(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da tarefa inválido'
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

      const task = await Task.findById(parseInt(id));
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarefa não encontrada'
        });
      }

      // Validar se data de vencimento não é no passado (apenas se estiver sendo alterada)
      if (req.body.data_vencimento) {
        const vencimento = new Date(req.body.data_vencimento);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        if (vencimento < hoje) {
          return res.status(400).json({
            success: false,
            message: 'Data de vencimento não pode ser no passado'
          });
        }
      }

      await task.update(req.body);
      
      res.json({
        success: true,
        message: 'Tarefa atualizada com sucesso',
        data: task.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // DELETE /api/tasks/:id - Deletar tarefa
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da tarefa inválido'
        });
      }

      const task = await Task.findById(parseInt(id));
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarefa não encontrada'
        });
      }

      await task.delete();
      
      res.json({
        success: true,
        message: 'Tarefa deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PATCH /api/tasks/:id/status - Atualizar apenas o status da tarefa
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da tarefa inválido'
        });
      }

      if (!status || !['pendente', 'em_andamento', 'concluida', 'cancelada'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido'
        });
      }

      const task = await Task.findById(parseInt(id));
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarefa não encontrada'
        });
      }

      await task.update({ status });
      
      res.json({
        success: true,
        message: 'Status da tarefa atualizado com sucesso',
        data: task.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/tasks/stats - Estatísticas das tarefas
  static async getStats(req, res) {
    try {
      const { usuario_id } = req.query;
      
      const stats = await Task.getStats(usuario_id ? parseInt(usuario_id) : null);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default TaskController;