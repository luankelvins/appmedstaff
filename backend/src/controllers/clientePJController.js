import ClientePJ from '../models/ClientePJ.js';
import { validationResult, body } from 'express-validator';

class ClientePJController {
  // Validações para criação/atualização
  static getValidationRules() {
    return [
      body('razao_social').notEmpty().withMessage('Razão social é obrigatória').isLength({ min: 2, max: 200 }),
      body('nome_fantasia').optional().isLength({ max: 200 }),
      body('cnpj').matches(/^\d{14}$/).withMessage('CNPJ deve ter 14 dígitos'),
      body('inscricao_estadual').optional().isLength({ max: 20 }),
      body('inscricao_municipal').optional().isLength({ max: 20 }),
      body('email').optional().isEmail().withMessage('Email deve ser válido').normalizeEmail(),
      body('telefone').optional().isMobilePhone('pt-BR'),
      body('celular').optional().isMobilePhone('pt-BR'),
      body('endereco').optional().isLength({ max: 200 }),
      body('numero').optional().isLength({ max: 10 }),
      body('complemento').optional().isLength({ max: 50 }),
      body('bairro').optional().isLength({ max: 50 }),
      body('cidade').optional().isLength({ max: 50 }),
      body('estado').optional().isLength({ min: 2, max: 2 }),
      body('cep').optional().matches(/^\d{8}$/).withMessage('CEP deve ter 8 dígitos'),
      body('atividade_principal').optional().isLength({ max: 100 }),
      body('regime_tributario').optional().isIn(['simples_nacional', 'lucro_presumido', 'lucro_real', 'mei']),
      body('porte_empresa').optional().isIn(['mei', 'micro', 'pequena', 'media', 'grande']),
      body('representante_legal').optional().isLength({ max: 100 }),
      body('cpf_representante').optional().matches(/^\d{11}$/).withMessage('CPF do representante deve ter 11 dígitos'),
      body('responsavel_id').optional().isInt({ min: 1 }).withMessage('ID do responsável deve ser válido'),
      body('observacoes').optional().isLength({ max: 1000 }),
      body('status').optional().isIn(['ativo', 'inativo', 'suspenso']),
      body('certificado_digital').optional().isBoolean()
    ];
  }

  // GET /api/clientes-pj - Listar todos os clientes PJ
  static async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        responsavel_id,
        cidade,
        estado,
        regime_tributario,
        porte_empresa,
        atividade_principal,
        search 
      } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (responsavel_id) filters.responsavel_id = parseInt(responsavel_id);
      if (cidade) filters.cidade = cidade;
      if (estado) filters.estado = estado;
      if (regime_tributario) filters.regime_tributario = regime_tributario;
      if (porte_empresa) filters.porte_empresa = porte_empresa;
      if (atividade_principal) filters.atividade_principal = atividade_principal;
      if (search) filters.search = search;

      const clientes = await ClientePJ.findAll(filters, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: clientes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar clientes PJ:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/clientes-pj/:id - Buscar cliente PJ por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente inválido'
        });
      }

      const cliente = await ClientePJ.findById(parseInt(id));
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      res.json({
        success: true,
        data: cliente.toJSON()
      });
    } catch (error) {
      console.error('Erro ao buscar cliente PJ:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/clientes-pj/cnpj/:cnpj - Buscar cliente PJ por CNPJ
  static async getByCNPJ(req, res) {
    try {
      const { cnpj } = req.params;
      
      if (!cnpj || !/^\d{14}$/.test(cnpj)) {
        return res.status(400).json({
          success: false,
          message: 'CNPJ inválido'
        });
      }

      const cliente = await ClientePJ.findByCNPJ(cnpj);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      res.json({
        success: true,
        data: cliente.toJSON()
      });
    } catch (error) {
      console.error('Erro ao buscar cliente por CNPJ:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // POST /api/clientes-pj - Criar novo cliente PJ
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

      const clienteData = req.body;
      
      // Validar CNPJ único
      const existingCliente = await ClientePJ.findByCNPJ(clienteData.cnpj);
      if (existingCliente) {
        return res.status(409).json({
          success: false,
          message: 'CNPJ já está cadastrado'
        });
      }

      // Validar email único (se fornecido)
      if (clienteData.email) {
        const clienteComEmail = await ClientePJ.findByEmail(clienteData.email);
        if (clienteComEmail) {
          return res.status(409).json({
            success: false,
            message: 'Email já está em uso'
          });
        }
      }

      // Validar CNPJ usando algoritmo
      if (!ClientePJ.isValidCNPJ(clienteData.cnpj)) {
        return res.status(400).json({
          success: false,
          message: 'CNPJ inválido'
        });
      }

      const cliente = await ClientePJ.create(clienteData);
      
      res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: cliente.toJSON()
      });
    } catch (error) {
      console.error('Erro ao criar cliente PJ:', error);
      
      if (error.code === '23505') { // Violação de constraint única
        return res.status(409).json({
          success: false,
          message: 'CNPJ ou email já está em uso'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PUT /api/clientes-pj/:id - Atualizar cliente PJ
  static async update(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente inválido'
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

      const cliente = await ClientePJ.findById(parseInt(id));
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      // Validar CNPJ único (se estiver sendo alterado)
      if (req.body.cnpj && req.body.cnpj !== cliente.cnpj) {
        const existingCliente = await ClientePJ.findByCNPJ(req.body.cnpj);
        if (existingCliente) {
          return res.status(409).json({
            success: false,
            message: 'CNPJ já está cadastrado'
          });
        }

        // Validar CNPJ usando algoritmo
        if (!ClientePJ.isValidCNPJ(req.body.cnpj)) {
          return res.status(400).json({
            success: false,
            message: 'CNPJ inválido'
          });
        }
      }

      // Validar email único (se estiver sendo alterado)
      if (req.body.email && req.body.email !== cliente.email) {
        const clienteComEmail = await ClientePJ.findByEmail(req.body.email);
        if (clienteComEmail) {
          return res.status(409).json({
            success: false,
            message: 'Email já está em uso'
          });
        }
      }

      await cliente.update(req.body);
      
      res.json({
        success: true,
        message: 'Cliente atualizado com sucesso',
        data: cliente.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente PJ:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'CNPJ ou email já está em uso'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // DELETE /api/clientes-pj/:id - Deletar cliente PJ
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente inválido'
        });
      }

      const cliente = await ClientePJ.findById(parseInt(id));
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      await cliente.delete();
      
      res.json({
        success: true,
        message: 'Cliente deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar cliente PJ:', error);
      
      if (error.code === '23503') { // Violação de foreign key
        return res.status(409).json({
          success: false,
          message: 'Não é possível deletar cliente com registros relacionados'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PATCH /api/clientes-pj/:id/status - Atualizar apenas o status do cliente
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente inválido'
        });
      }

      if (!status || !['ativo', 'inativo', 'suspenso'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido'
        });
      }

      const cliente = await ClientePJ.findById(parseInt(id));
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      await cliente.update({ status });
      
      res.json({
        success: true,
        message: 'Status do cliente atualizado com sucesso',
        data: cliente.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar status do cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/clientes-pj/responsavel/:responsavel_id - Buscar clientes PJ por responsável
  static async getByResponsavel(req, res) {
    try {
      const { responsavel_id } = req.params;
      const { page = 1, limit = 10, status, search } = req.query;
      
      if (!responsavel_id || isNaN(responsavel_id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do responsável inválido'
        });
      }

      const filters = {
        responsavel_id: parseInt(responsavel_id),
        status,
        search
      };

      const result = await ClientePJ.findByResponsavel(filters, {
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      res.json({
        success: true,
        data: result.clientes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Erro ao buscar clientes por responsável:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/clientes-pj/search - Busca avançada de clientes PJ
  static async search(req, res) {
    try {
      const { 
        q, 
        cnpj, 
        razao_social, 
        nome_fantasia, 
        email, 
        telefone, 
        responsavel_id, 
        status, 
        certificado_digital,
        cidade,
        estado,
        page = 1, 
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = req.query;

      const searchParams = {
        q, // busca geral
        cnpj,
        razao_social,
        nome_fantasia,
        email,
        telefone,
        responsavel_id: responsavel_id ? parseInt(responsavel_id) : null,
        status,
        certificado_digital: certificado_digital ? certificado_digital === 'true' : null,
        cidade,
        estado
      };

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort_by,
        sort_order
      };

      const result = await ClientePJ.search(searchParams, options);
      
      res.json({
        success: true,
        data: result.clientes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit))
        },
        filters: searchParams
      });
    } catch (error) {
      console.error('Erro na busca de clientes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/clientes-pj/stats - Estatísticas dos clientes PJ
  static async getStats(req, res) {
    try {
      const { responsavel_id, periodo } = req.query;
      
      const stats = await ClientePJ.getStats({
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

  // PATCH /api/clientes-pj/:id/certificado-digital - Atualizar status do certificado digital
  static async updateCertificadoDigital(req, res) {
    try {
      const { id } = req.params;
      const { certificado_digital } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente inválido'
        });
      }

      if (typeof certificado_digital !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Status do certificado digital deve ser verdadeiro ou falso'
        });
      }

      const cliente = await ClientePJ.findById(parseInt(id));
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      await cliente.update({ certificado_digital });
      
      res.json({
        success: true,
        message: 'Status do certificado digital atualizado com sucesso',
        data: cliente.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar certificado digital:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default ClientePJController;