import ClientePF from '../models/ClientePF.js';
import { validationResult, body } from 'express-validator';

class ClientePFController {
  // Validações para criação/atualização
  static getValidationRules() {
    return [
      body('nome').notEmpty().withMessage('Nome é obrigatório').isLength({ min: 2, max: 100 }),
      body('cpf').matches(/^\d{11}$/).withMessage('CPF deve ter 11 dígitos'),
      body('rg').optional().isLength({ min: 5, max: 20 }),
      body('data_nascimento').optional().isISO8601().withMessage('Data de nascimento deve ser válida'),
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
      body('profissao').optional().isLength({ max: 50 }),
      body('estado_civil').optional().isIn(['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel']),
      body('renda_mensal').optional().isFloat({ min: 0 }).withMessage('Renda mensal deve ser positiva'),
      body('responsavel_id').optional().isInt({ min: 1 }).withMessage('ID do responsável deve ser válido'),
      body('observacoes').optional().isLength({ max: 1000 }),
      body('status').optional().isIn(['ativo', 'inativo', 'suspenso'])
    ];
  }

  // GET /api/clientes-pf - Listar todos os clientes PF
  static async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        responsavel_id,
        cidade,
        estado,
        profissao,
        search 
      } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (responsavel_id) filters.responsavel_id = parseInt(responsavel_id);
      if (cidade) filters.cidade = cidade;
      if (estado) filters.estado = estado;
      if (profissao) filters.profissao = profissao;
      if (search) filters.search = search;

      const clientes = await ClientePF.findAll(filters, {
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
      console.error('Erro ao buscar clientes PF:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/clientes-pf/:id - Buscar cliente PF por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente inválido'
        });
      }

      const cliente = await ClientePF.findById(parseInt(id));
      
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
      console.error('Erro ao buscar cliente PF:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/clientes-pf/cpf/:cpf - Buscar cliente PF por CPF
  static async getByCPF(req, res) {
    try {
      const { cpf } = req.params;
      
      if (!cpf || !/^\d{11}$/.test(cpf)) {
        return res.status(400).json({
          success: false,
          message: 'CPF inválido'
        });
      }

      const cliente = await ClientePF.findByCPF(cpf);
      
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
      console.error('Erro ao buscar cliente por CPF:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/clientes-pf/responsavel/:userId - Buscar clientes PF por responsável
  static async getByResponsavel(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.query;
      
      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do responsável inválido'
        });
      }

      const filters = {};
      if (status) filters.status = status;

      const clientes = await ClientePF.findByResponsavel(parseInt(userId), filters);
      
      res.json({
        success: true,
        data: clientes
      });
    } catch (error) {
      console.error('Erro ao buscar clientes do responsável:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // POST /api/clientes-pf - Criar novo cliente PF
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
      
      // Validar CPF único
      const existingCliente = await ClientePF.findByCPF(clienteData.cpf);
      if (existingCliente) {
        return res.status(409).json({
          success: false,
          message: 'CPF já está cadastrado'
        });
      }

      // Validar email único (se fornecido)
      if (clienteData.email) {
        const clienteComEmail = await ClientePF.findByEmail(clienteData.email);
        if (clienteComEmail) {
          return res.status(409).json({
            success: false,
            message: 'Email já está em uso'
          });
        }
      }

      // Validar data de nascimento
      if (clienteData.data_nascimento) {
        const nascimento = new Date(clienteData.data_nascimento);
        const hoje = new Date();
        const idade = hoje.getFullYear() - nascimento.getFullYear();
        
        if (idade < 0 || idade > 120) {
          return res.status(400).json({
            success: false,
            message: 'Data de nascimento inválida'
          });
        }
      }

      const cliente = await ClientePF.create(clienteData);
      
      res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: cliente.toJSON()
      });
    } catch (error) {
      console.error('Erro ao criar cliente PF:', error);
      
      if (error.code === '23505') { // Violação de constraint única
        return res.status(409).json({
          success: false,
          message: 'CPF ou email já está em uso'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PUT /api/clientes-pf/:id - Atualizar cliente PF
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

      const cliente = await ClientePF.findById(parseInt(id));
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      // Validar CPF único (se estiver sendo alterado)
      if (req.body.cpf && req.body.cpf !== cliente.cpf) {
        const existingCliente = await ClientePF.findByCPF(req.body.cpf);
        if (existingCliente) {
          return res.status(409).json({
            success: false,
            message: 'CPF já está cadastrado'
          });
        }
      }

      // Validar email único (se estiver sendo alterado)
      if (req.body.email && req.body.email !== cliente.email) {
        const clienteComEmail = await ClientePF.findByEmail(req.body.email);
        if (clienteComEmail) {
          return res.status(409).json({
            success: false,
            message: 'Email já está em uso'
          });
        }
      }

      // Validar data de nascimento (se estiver sendo alterada)
      if (req.body.data_nascimento) {
        const nascimento = new Date(req.body.data_nascimento);
        const hoje = new Date();
        const idade = hoje.getFullYear() - nascimento.getFullYear();
        
        if (idade < 0 || idade > 120) {
          return res.status(400).json({
            success: false,
            message: 'Data de nascimento inválida'
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
      console.error('Erro ao atualizar cliente PF:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'CPF ou email já está em uso'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // DELETE /api/clientes-pf/:id - Deletar cliente PF
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente inválido'
        });
      }

      const cliente = await ClientePF.findById(parseInt(id));
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
      console.error('Erro ao deletar cliente PF:', error);
      
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

  // PATCH /api/clientes-pf/:id/status - Atualizar apenas o status do cliente
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

      const cliente = await ClientePF.findById(parseInt(id));
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

  // GET /api/clientes-pf/stats - Estatísticas dos clientes PF
  static async getStats(req, res) {
    try {
      const { responsavel_id, periodo } = req.query;
      
      const stats = await ClientePF.getStats({
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

  // POST /api/clientes-pf/:id/documentos - Adicionar documento ao cliente
  static async addDocumento(req, res) {
    try {
      const { id } = req.params;
      const { tipo, numero, data_emissao, orgao_emissor } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente inválido'
        });
      }

      if (!tipo || !numero) {
        return res.status(400).json({
          success: false,
          message: 'Tipo e número do documento são obrigatórios'
        });
      }

      const cliente = await ClientePF.findById(parseInt(id));
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      await cliente.addDocumento({ tipo, numero, data_emissao, orgao_emissor });
      
      res.json({
        success: true,
        message: 'Documento adicionado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao adicionar documento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default ClientePFController;