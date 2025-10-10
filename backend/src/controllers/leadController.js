import Lead from '../models/Lead.js';
import { validationResult, body } from 'express-validator';

class LeadController {
  // Validações para criação/atualização
  static getValidationRules() {
    return [
      body('nome').notEmpty().withMessage('Nome é obrigatório').isLength({ min: 2, max: 100 }),
      body('email').optional().isEmail().withMessage('Email deve ser válido').normalizeEmail(),
      body('telefone').optional().isMobilePhone('pt-BR'),
      body('empresa').optional().isLength({ max: 100 }),
      body('cargo').optional().isLength({ max: 50 }),
      body('origem').optional().isIn(['website', 'indicacao', 'evento', 'cold_call', 'social_media', 'outro']),
      body('status').optional().isIn(['novo', 'qualificado', 'proposta', 'negociacao', 'ganho', 'perdido']),
      body('valor_estimado').optional().isFloat({ min: 0 }).withMessage('Valor estimado deve ser positivo'),
      body('probabilidade').optional().isInt({ min: 0, max: 100 }).withMessage('Probabilidade deve estar entre 0 e 100'),
      body('data_contato').optional().isISO8601().withMessage('Data de contato deve ser válida'),
      body('proxima_acao').optional().isISO8601().withMessage('Data da próxima ação deve ser válida'),
      body('responsavel_id').optional().isInt({ min: 1 }).withMessage('ID do responsável deve ser válido'),
      body('observacoes').optional().isLength({ max: 1000 })
    ];
  }

  // GET /api/leads - Listar todos os leads
  static async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        origem, 
        responsavel_id,
        valor_min,
        valor_max,
        probabilidade_min,
        data_inicio,
        data_fim,
        search 
      } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (origem) filters.origem = origem;
      if (responsavel_id) filters.responsavel_id = parseInt(responsavel_id);
      if (valor_min) filters.valor_min = parseFloat(valor_min);
      if (valor_max) filters.valor_max = parseFloat(valor_max);
      if (probabilidade_min) filters.probabilidade_min = parseInt(probabilidade_min);
      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (search) filters.search = search;

      const leads = await Lead.findAll(filters, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: leads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/leads/:id - Buscar lead por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do lead inválido'
        });
      }

      const lead = await Lead.findById(parseInt(id));
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead não encontrado'
        });
      }

      res.json({
        success: true,
        data: lead.toJSON()
      });
    } catch (error) {
      console.error('Erro ao buscar lead:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/leads/responsavel/:userId - Buscar leads por responsável
  static async getByResponsavel(req, res) {
    try {
      const { userId } = req.params;
      const { status, origem } = req.query;
      
      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do responsável inválido'
        });
      }

      const filters = {};
      if (status) filters.status = status;
      if (origem) filters.origem = origem;

      const leads = await Lead.findByResponsavel(parseInt(userId), filters);
      
      res.json({
        success: true,
        data: leads
      });
    } catch (error) {
      console.error('Erro ao buscar leads do responsável:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/leads/status/:status - Buscar leads por status
  static async getByStatus(req, res) {
    try {
      const { status } = req.params;
      
      if (!['novo', 'qualificado', 'proposta', 'negociacao', 'ganho', 'perdido'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido'
        });
      }

      const leads = await Lead.findByStatus(status);
      
      res.json({
        success: true,
        data: leads
      });
    } catch (error) {
      console.error('Erro ao buscar leads por status:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // POST /api/leads - Criar novo lead
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

      const leadData = req.body;
      
      // Validar se próxima ação não é no passado
      if (leadData.proxima_acao) {
        const proximaAcao = new Date(leadData.proxima_acao);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        if (proximaAcao < hoje) {
          return res.status(400).json({
            success: false,
            message: 'Data da próxima ação não pode ser no passado'
          });
        }
      }

      // Verificar se email já existe (se fornecido)
      if (leadData.email) {
        const existingLead = await Lead.findByEmail(leadData.email);
        if (existingLead) {
          return res.status(409).json({
            success: false,
            message: 'Já existe um lead com este email'
          });
        }
      }

      const lead = await Lead.create(leadData);
      
      res.status(201).json({
        success: true,
        message: 'Lead criado com sucesso',
        data: lead.toJSON()
      });
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PUT /api/leads/:id - Atualizar lead
  static async update(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do lead inválido'
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

      const lead = await Lead.findById(parseInt(id));
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead não encontrado'
        });
      }

      // Validar se próxima ação não é no passado (apenas se estiver sendo alterada)
      if (req.body.proxima_acao) {
        const proximaAcao = new Date(req.body.proxima_acao);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        if (proximaAcao < hoje) {
          return res.status(400).json({
            success: false,
            message: 'Data da próxima ação não pode ser no passado'
          });
        }
      }

      // Verificar se email já existe (exceto para o próprio lead)
      if (req.body.email && req.body.email !== lead.email) {
        const existingLead = await Lead.findByEmail(req.body.email);
        if (existingLead) {
          return res.status(409).json({
            success: false,
            message: 'Já existe um lead com este email'
          });
        }
      }

      await lead.update(req.body);
      
      res.json({
        success: true,
        message: 'Lead atualizado com sucesso',
        data: lead.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // DELETE /api/leads/:id - Deletar lead
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do lead inválido'
        });
      }

      const lead = await Lead.findById(parseInt(id));
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead não encontrado'
        });
      }

      await lead.delete();
      
      res.json({
        success: true,
        message: 'Lead deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
      
      if (error.code === '23503') { // Violação de foreign key
        return res.status(409).json({
          success: false,
          message: 'Não é possível deletar lead com registros relacionados'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PATCH /api/leads/:id/status - Atualizar apenas o status do lead
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, observacoes } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do lead inválido'
        });
      }

      if (!status || !['novo', 'qualificado', 'proposta', 'negociacao', 'ganho', 'perdido'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido'
        });
      }

      const lead = await Lead.findById(parseInt(id));
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead não encontrado'
        });
      }

      const updateData = { status };
      if (observacoes) updateData.observacoes = observacoes;

      await lead.update(updateData);
      
      res.json({
        success: true,
        message: 'Status do lead atualizado com sucesso',
        data: lead.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar status do lead:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/leads/stats - Estatísticas dos leads
  static async getStats(req, res) {
    try {
      const { responsavel_id, periodo } = req.query;
      
      const stats = await Lead.getStats({
        responsavel_id: responsavel_id ? parseInt(responsavel_id) : null,
        periodo
      });
      
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

  // GET /api/leads/follow-up - Leads que precisam de follow-up
  static async getFollowUp(req, res) {
    try {
      const leads = await Lead.findNeedingFollowUp();
      
      res.json({
        success: true,
        data: leads
      });
    } catch (error) {
      console.error('Erro ao buscar leads para follow-up:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default LeadController;