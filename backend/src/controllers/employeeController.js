import Employee from '../models/Employee.js';
import { validationResult, body } from 'express-validator';

class EmployeeController {
  // Validações para criação/atualização
  static getValidationRules() {
    return [
      body('nome').notEmpty().withMessage('Nome é obrigatório').isLength({ min: 2, max: 100 }),
      body('email').isEmail().withMessage('Email deve ser válido').normalizeEmail(),
      body('cpf').matches(/^\d{11}$/).withMessage('CPF deve ter 11 dígitos'),
      body('telefone').optional().isMobilePhone('pt-BR'),
      body('cargo').notEmpty().withMessage('Cargo é obrigatório'),
      body('departamento').notEmpty().withMessage('Departamento é obrigatório'),
      body('salario').optional().isFloat({ min: 0 }).withMessage('Salário deve ser um valor positivo'),
      body('data_admissao').isISO8601().withMessage('Data de admissão deve ser válida'),
      body('status').optional().isIn(['ativo', 'inativo', 'licenca', 'demitido']),
      body('tipo').optional().isIn(['funcionario', 'admin', 'gerente'])
    ];
  }

  // GET /api/employees - Listar todos os funcionários
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, status, departamento, cargo, search } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (departamento) filters.departamento = departamento;
      if (cargo) filters.cargo = cargo;
      if (search) filters.search = search;

      const employees = await Employee.findAll(filters, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: employees,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/employees/:id - Buscar funcionário por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do funcionário inválido'
        });
      }

      const employee = await Employee.findById(parseInt(id));
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Funcionário não encontrado'
        });
      }

      res.json({
        success: true,
        data: employee.toJSON()
      });
    } catch (error) {
      console.error('Erro ao buscar funcionário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // POST /api/employees - Criar novo funcionário
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

      const employeeData = req.body;
      
      // Verificar se email já existe
      const existingEmployee = await Employee.findByEmail(employeeData.email);
      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message: 'Email já está em uso'
        });
      }

      const employee = await Employee.create(employeeData);
      
      res.status(201).json({
        success: true,
        message: 'Funcionário criado com sucesso',
        data: employee.toJSON()
      });
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      
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

  // PUT /api/employees/:id - Atualizar funcionário
  static async update(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do funcionário inválido'
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

      const employee = await Employee.findById(parseInt(id));
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Funcionário não encontrado'
        });
      }

      // Verificar se email já existe (exceto para o próprio funcionário)
      if (req.body.email && req.body.email !== employee.email) {
        const existingEmployee = await Employee.findByEmail(req.body.email);
        if (existingEmployee) {
          return res.status(409).json({
            success: false,
            message: 'Email já está em uso'
          });
        }
      }

      await employee.update(req.body);
      
      res.json({
        success: true,
        message: 'Funcionário atualizado com sucesso',
        data: employee.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      
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

  // DELETE /api/employees/:id - Deletar funcionário
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do funcionário inválido'
        });
      }

      const employee = await Employee.findById(parseInt(id));
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Funcionário não encontrado'
        });
      }

      await employee.delete();
      
      res.json({
        success: true,
        message: 'Funcionário deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar funcionário:', error);
      
      if (error.code === '23503') { // Violação de foreign key
        return res.status(409).json({
          success: false,
          message: 'Não é possível deletar funcionário com registros relacionados'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PATCH /api/employees/:id/status - Atualizar status do funcionário
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do funcionário inválido'
        });
      }

      if (!status || !['ativo', 'inativo', 'licenca', 'demitido'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido. Use: ativo, inativo, licenca ou demitido'
        });
      }

      const employee = await Employee.findById(parseInt(id));
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Funcionário não encontrado'
        });
      }

      await employee.updateStatus(status);
      
      res.json({
        success: true,
        message: 'Status do funcionário atualizado com sucesso',
        data: { id: parseInt(id), status }
      });
    } catch (error) {
      console.error('Erro ao atualizar status do funcionário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/employees/search - Buscar funcionários
  static async search(req, res) {
    try {
      const { q, status, departamento, cargo } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Termo de busca deve ter pelo menos 2 caracteres'
        });
      }

      const filters = { search: q.trim() };
      if (status) filters.status = status;
      if (departamento) filters.departamento = departamento;
      if (cargo) filters.cargo = cargo;

      const employees = await Employee.search(filters);
      
      res.json({
        success: true,
        data: employees
      });
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/employees/stats - Estatísticas dos funcionários
  static async getStats(req, res) {
    try {
      const stats = await Employee.getStats();
      
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

export default EmployeeController;