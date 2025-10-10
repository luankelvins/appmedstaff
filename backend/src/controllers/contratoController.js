import Contrato from '../models/Contrato.js';
import { validationResult, body } from 'express-validator';

class ContratoController {
  // Validações para criação/atualização
  static getValidationRules() {
    return [
      body('numero_contrato').notEmpty().withMessage('Número do contrato é obrigatório').isLength({ min: 3, max: 50 }),
      body('tipo_contrato').isIn(['pf', 'pj']).withMessage('Tipo de contrato deve ser "pf" ou "pj"'),
      body('cliente_id').isUUID().withMessage('ID do cliente deve ser um UUID válido'),
      body('cliente_nome').notEmpty().withMessage('Nome do cliente é obrigatório').isLength({ min: 2, max: 200 }),
      body('data_inicio').isISO8601().withMessage('Data de início deve ser válida'),
      body('data_vencimento').isISO8601().withMessage('Data de vencimento deve ser válida'),
      body('renovacao_automatica').optional().isBoolean().withMessage('Renovação automática deve ser verdadeiro ou falso'),
      body('servicos_contratados').isObject().withMessage('Serviços contratados devem ser um objeto'),
      body('condicoes_comerciais').isObject().withMessage('Condições comerciais devem ser um objeto'),
      body('clausulas_juridicas').optional().isLength({ max: 5000 }),
      body('documentos').optional().isArray(),
      body('status').optional().isIn(['rascunho', 'ativo', 'suspenso', 'encerrado']),
      body('responsavel_comercial').optional().isUUID().withMessage('ID do responsável comercial deve ser um UUID válido'),
      body('responsavel_juridico').optional().isUUID().withMessage('ID do responsável jurídico deve ser um UUID válido'),
      body('observacoes').optional().isLength({ max: 1000 })
    ];
  }

  // GET /api/contratos - Listar todos os contratos
  static async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        tipo_contrato,
        cliente_id,
        responsavel_comercial,
        data_inicio,
        data_fim,
        search,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (tipo_contrato) filters.tipo_contrato = tipo_contrato;
      if (cliente_id) filters.cliente_id = cliente_id;
      if (responsavel_comercial) filters.responsavel_comercial = responsavel_comercial;
      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (search) filters.search = search;

      const result = await Contrato.findAll(filters, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort_by,
        sort_order
      });
      
      res.json({
        success: true,
        data: result.contratos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/contratos/:id - Buscar contrato por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do contrato é obrigatório'
        });
      }

      const contrato = await Contrato.findById(id);
      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado'
        });
      }
      
      res.json({
        success: true,
        data: contrato.toJSON()
      });
    } catch (error) {
      console.error('Erro ao buscar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/contratos/numero/:numero - Buscar contrato por número
  static async getByNumero(req, res) {
    try {
      const { numero } = req.params;
      
      if (!numero) {
        return res.status(400).json({
          success: false,
          message: 'Número do contrato é obrigatório'
        });
      }

      const contrato = await Contrato.findByNumero(numero);
      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado'
        });
      }
      
      res.json({
        success: true,
        data: contrato.toJSON()
      });
    } catch (error) {
      console.error('Erro ao buscar contrato por número:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/contratos/cliente/:cliente_id - Buscar contratos por cliente
  static async getByCliente(req, res) {
    try {
      const { cliente_id } = req.params;
      const { page = 1, limit = 10, status, search } = req.query;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório'
        });
      }

      const filters = { status, search };
      const result = await Contrato.findByCliente(cliente_id, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao buscar contratos por cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/contratos/responsavel/:responsavel_id - Buscar contratos por responsável
  static async getByResponsavel(req, res) {
    try {
      const { responsavel_id } = req.params;
      const { page = 1, limit = 10, status, search } = req.query;
      
      if (!responsavel_id) {
        return res.status(400).json({
          success: false,
          message: 'ID do responsável é obrigatório'
        });
      }

      const filters = { status, search };
      const result = await Contrato.findByResponsavel(responsavel_id, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao buscar contratos por responsável:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/contratos/vencendo - Buscar contratos vencendo
  static async getVencendo(req, res) {
    try {
      const { dias = 30 } = req.query;
      
      const contratos = await Contrato.findVencendo(parseInt(dias));
      
      res.json({
        success: true,
        data: contratos.map(contrato => contrato.toJSON())
      });
    } catch (error) {
      console.error('Erro ao buscar contratos vencendo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // POST /api/contratos - Criar novo contrato
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

      const contratoData = req.body;
      
      // Validar número único
      const existingContrato = await Contrato.findByNumero(contratoData.numero_contrato);
      if (existingContrato) {
        return res.status(409).json({
          success: false,
          message: 'Número de contrato já está em uso'
        });
      }

      // Validar datas
      if (new Date(contratoData.data_inicio) >= new Date(contratoData.data_vencimento)) {
        return res.status(400).json({
          success: false,
          message: 'Data de vencimento deve ser posterior à data de início'
        });
      }

      const contrato = await Contrato.create(contratoData);
      
      res.status(201).json({
        success: true,
        message: 'Contrato criado com sucesso',
        data: contrato.toJSON()
      });
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      
      if (error.code === '23505') { // Violação de constraint única
        return res.status(409).json({
          success: false,
          message: 'Número de contrato já está em uso'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PUT /api/contratos/:id - Atualizar contrato
  static async update(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do contrato é obrigatório'
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

      const contrato = await Contrato.findById(id);
      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado'
        });
      }

      // Validar número único (se estiver sendo alterado)
      if (req.body.numero_contrato && req.body.numero_contrato !== contrato.numero_contrato) {
        const existingContrato = await Contrato.findByNumero(req.body.numero_contrato);
        if (existingContrato) {
          return res.status(409).json({
            success: false,
            message: 'Número de contrato já está em uso'
          });
        }
      }

      // Validar datas (se estiverem sendo alteradas)
      const dataInicio = req.body.data_inicio || contrato.data_inicio;
      const dataVencimento = req.body.data_vencimento || contrato.data_vencimento;
      
      if (new Date(dataInicio) >= new Date(dataVencimento)) {
        return res.status(400).json({
          success: false,
          message: 'Data de vencimento deve ser posterior à data de início'
        });
      }

      await contrato.update(req.body);
      
      res.json({
        success: true,
        message: 'Contrato atualizado com sucesso',
        data: contrato.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Número de contrato já está em uso'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // DELETE /api/contratos/:id - Deletar contrato
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do contrato é obrigatório'
        });
      }

      const contrato = await Contrato.findById(id);
      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado'
        });
      }

      await contrato.delete();
      
      res.json({
        success: true,
        message: 'Contrato deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar contrato:', error);
      
      if (error.code === '23503') { // Violação de foreign key
        return res.status(409).json({
          success: false,
          message: 'Não é possível deletar contrato com registros relacionados'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PATCH /api/contratos/:id/status - Atualizar apenas o status do contrato
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do contrato é obrigatório'
        });
      }

      if (!status || !['rascunho', 'ativo', 'suspenso', 'encerrado'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido'
        });
      }

      const contrato = await Contrato.findById(id);
      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado'
        });
      }

      await contrato.update({ status });
      
      res.json({
        success: true,
        message: 'Status do contrato atualizado com sucesso',
        data: contrato.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar status do contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/contratos/stats - Estatísticas dos contratos
  static async getStats(req, res) {
    try {
      const { responsavel_comercial, periodo } = req.query;
      
      const stats = await Contrato.getStats({
        responsavel_comercial,
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

  // GET /api/contratos/search - Busca avançada de contratos
  static async search(req, res) {
    try {
      const { 
        q, 
        numero_contrato,
        cliente_nome,
        tipo_contrato,
        status,
        responsavel_comercial,
        data_inicio_de,
        data_inicio_ate,
        data_vencimento_de,
        data_vencimento_ate,
        page = 1, 
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = req.query;

      const searchParams = {
        q, // busca geral
        numero_contrato,
        cliente_nome,
        tipo_contrato,
        status,
        responsavel_comercial,
        data_inicio_de,
        data_inicio_ate,
        data_vencimento_de,
        data_vencimento_ate
      };

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort_by,
        sort_order
      };

      // Construir filtros para o método findAll
      const filters = {};
      if (searchParams.q) filters.search = searchParams.q;
      if (searchParams.tipo_contrato) filters.tipo_contrato = searchParams.tipo_contrato;
      if (searchParams.status) filters.status = searchParams.status;
      if (searchParams.responsavel_comercial) filters.responsavel_comercial = searchParams.responsavel_comercial;
      if (searchParams.data_inicio_de) filters.data_inicio = searchParams.data_inicio_de;
      if (searchParams.data_vencimento_ate) filters.data_fim = searchParams.data_vencimento_ate;

      const result = await Contrato.findAll(filters, options);
      
      res.json({
        success: true,
        data: result.contratos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit))
        },
        filters: searchParams
      });
    } catch (error) {
      console.error('Erro na busca de contratos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default ContratoController;