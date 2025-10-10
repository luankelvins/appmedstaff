import Expense from '../models/Expense.js';
import { validationResult, body } from 'express-validator';

class ExpenseController {
  // Validações para criação/atualização
  static getValidationRules() {
    return [
      body('descricao').notEmpty().withMessage('Descrição é obrigatória').isLength({ min: 3, max: 200 }),
      body('valor').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
      body('data_vencimento').isISO8601().withMessage('Data de vencimento deve ser válida'),
      body('categoria_id').isInt({ min: 1 }).withMessage('ID da categoria deve ser válido'),
      body('fornecedor').optional().isLength({ max: 100 }),
      body('numero_documento').optional().isLength({ max: 50 }),
      body('observacoes').optional().isLength({ max: 1000 }),
      body('status').optional().isIn(['pendente', 'pago', 'vencido', 'cancelado']),
      body('data_pagamento').optional().isISO8601().withMessage('Data de pagamento deve ser válida'),
      body('valor_pago').optional().isFloat({ min: 0 }).withMessage('Valor pago deve ser positivo'),
      body('forma_pagamento').optional().isLength({ max: 50 }),
      body('conta_bancaria_id').optional().isInt({ min: 1 }).withMessage('ID da conta bancária deve ser válido'),
      body('centro_custo').optional().isLength({ max: 50 }),
      body('recorrente').optional().isBoolean(),
      body('frequencia_recorrencia').optional().isIn(['mensal', 'bimestral', 'trimestral', 'semestral', 'anual']),
      body('responsavel_id').optional().isInt({ min: 1 }).withMessage('ID do responsável deve ser válido'),
      body('anexos').optional().isArray()
    ];
  }

  // GET /api/expenses - Listar todas as despesas
  static async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        categoria_id,
        fornecedor,
        responsavel_id,
        conta_bancaria_id,
        centro_custo,
        valor_min,
        valor_max,
        data_inicio,
        data_fim,
        vencimento_inicio,
        vencimento_fim,
        recorrente,
        search 
      } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (categoria_id) filters.categoria_id = parseInt(categoria_id);
      if (fornecedor) filters.fornecedor = fornecedor;
      if (responsavel_id) filters.responsavel_id = parseInt(responsavel_id);
      if (conta_bancaria_id) filters.conta_bancaria_id = parseInt(conta_bancaria_id);
      if (centro_custo) filters.centro_custo = centro_custo;
      if (valor_min) filters.valor_min = parseFloat(valor_min);
      if (valor_max) filters.valor_max = parseFloat(valor_max);
      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (vencimento_inicio) filters.vencimento_inicio = vencimento_inicio;
      if (vencimento_fim) filters.vencimento_fim = vencimento_fim;
      if (recorrente !== undefined) filters.recorrente = recorrente === 'true';
      if (search) filters.search = search;

      const expenses = await Expense.findAll(filters, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: expenses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/expenses/:id - Buscar despesa por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da despesa inválido'
        });
      }

      const expense = await Expense.findById(parseInt(id));
      
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Despesa não encontrada'
        });
      }

      res.json({
        success: true,
        data: expense.toJSON()
      });
    } catch (error) {
      console.error('Erro ao buscar despesa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/expenses/overdue - Buscar despesas vencidas
  static async getOverdue(req, res) {
    try {
      const expenses = await Expense.findOverdue();
      
      res.json({
        success: true,
        data: expenses
      });
    } catch (error) {
      console.error('Erro ao buscar despesas vencidas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/expenses/due-soon - Buscar despesas que vencem em breve
  static async getDueSoon(req, res) {
    try {
      const { days = 7 } = req.query;
      
      if (isNaN(days) || days < 1) {
        return res.status(400).json({
          success: false,
          message: 'Número de dias deve ser um valor positivo'
        });
      }

      const expenses = await Expense.findDueSoon(parseInt(days));
      
      res.json({
        success: true,
        data: expenses
      });
    } catch (error) {
      console.error('Erro ao buscar despesas que vencem em breve:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/expenses/total - Obter total de despesas por período
  static async getTotalByPeriod(req, res) {
    try {
      const { data_inicio, data_fim, categoria_id, status } = req.query;
      
      if (!data_inicio || !data_fim) {
        return res.status(400).json({
          success: false,
          message: 'Data de início e fim são obrigatórias'
        });
      }

      const filters = { data_inicio, data_fim };
      if (categoria_id) filters.categoria_id = parseInt(categoria_id);
      if (status) filters.status = status;

      const total = await Expense.getTotalByPeriod(filters);
      
      res.json({
        success: true,
        data: { total }
      });
    } catch (error) {
      console.error('Erro ao calcular total de despesas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // POST /api/expenses - Criar nova despesa
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

      const expenseData = req.body;
      
      // Validar se data de vencimento não é muito no passado (mais de 1 ano)
      const vencimento = new Date(expenseData.data_vencimento);
      const umAnoAtras = new Date();
      umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
      
      if (vencimento < umAnoAtras) {
        return res.status(400).json({
          success: false,
          message: 'Data de vencimento não pode ser muito antiga'
        });
      }

      // Validar data de pagamento (se fornecida)
      if (expenseData.data_pagamento) {
        const pagamento = new Date(expenseData.data_pagamento);
        const hoje = new Date();
        
        if (pagamento > hoje) {
          return res.status(400).json({
            success: false,
            message: 'Data de pagamento não pode ser no futuro'
          });
        }
      }

      // Validar valor pago (se fornecido)
      if (expenseData.valor_pago && expenseData.valor_pago > expenseData.valor) {
        return res.status(400).json({
          success: false,
          message: 'Valor pago não pode ser maior que o valor da despesa'
        });
      }

      const expense = await Expense.create(expenseData);
      
      res.status(201).json({
        success: true,
        message: 'Despesa criada com sucesso',
        data: expense.toJSON()
      });
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PUT /api/expenses/:id - Atualizar despesa
  static async update(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da despesa inválido'
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

      const expense = await Expense.findById(parseInt(id));
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Despesa não encontrada'
        });
      }

      // Validar se data de vencimento não é muito no passado (apenas se estiver sendo alterada)
      if (req.body.data_vencimento) {
        const vencimento = new Date(req.body.data_vencimento);
        const umAnoAtras = new Date();
        umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
        
        if (vencimento < umAnoAtras) {
          return res.status(400).json({
            success: false,
            message: 'Data de vencimento não pode ser muito antiga'
          });
        }
      }

      // Validar data de pagamento (se estiver sendo alterada)
      if (req.body.data_pagamento) {
        const pagamento = new Date(req.body.data_pagamento);
        const hoje = new Date();
        
        if (pagamento > hoje) {
          return res.status(400).json({
            success: false,
            message: 'Data de pagamento não pode ser no futuro'
          });
        }
      }

      // Validar valor pago (se estiver sendo alterado)
      const valor = req.body.valor || expense.valor;
      if (req.body.valor_pago && req.body.valor_pago > valor) {
        return res.status(400).json({
          success: false,
          message: 'Valor pago não pode ser maior que o valor da despesa'
        });
      }

      await expense.update(req.body);
      
      res.json({
        success: true,
        message: 'Despesa atualizada com sucesso',
        data: expense.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // DELETE /api/expenses/:id - Deletar despesa
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da despesa inválido'
        });
      }

      const expense = await Expense.findById(parseInt(id));
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Despesa não encontrada'
        });
      }

      // Verificar se a despesa já foi paga
      if (expense.isPago()) {
        return res.status(409).json({
          success: false,
          message: 'Não é possível deletar despesa já paga'
        });
      }

      await expense.delete();
      
      res.json({
        success: true,
        message: 'Despesa deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PATCH /api/expenses/:id/pay - Marcar despesa como paga
  static async markAsPaid(req, res) {
    try {
      const { id } = req.params;
      const { data_pagamento, valor_pago, forma_pagamento, conta_bancaria_id } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da despesa inválido'
        });
      }

      if (!data_pagamento) {
        return res.status(400).json({
          success: false,
          message: 'Data de pagamento é obrigatória'
        });
      }

      const expense = await Expense.findById(parseInt(id));
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Despesa não encontrada'
        });
      }

      if (expense.isPago()) {
        return res.status(409).json({
          success: false,
          message: 'Despesa já está paga'
        });
      }

      if (expense.isCancelado()) {
        return res.status(409).json({
          success: false,
          message: 'Não é possível pagar despesa cancelada'
        });
      }

      // Validar data de pagamento
      const pagamento = new Date(data_pagamento);
      const hoje = new Date();
      
      if (pagamento > hoje) {
        return res.status(400).json({
          success: false,
          message: 'Data de pagamento não pode ser no futuro'
        });
      }

      // Validar valor pago
      const valorPago = valor_pago || expense.valor;
      if (valorPago > expense.valor) {
        return res.status(400).json({
          success: false,
          message: 'Valor pago não pode ser maior que o valor da despesa'
        });
      }

      await expense.markAsPaid({
        data_pagamento,
        valor_pago: valorPago,
        forma_pagamento,
        conta_bancaria_id
      });
      
      res.json({
        success: true,
        message: 'Despesa marcada como paga',
        data: expense.toJSON()
      });
    } catch (error) {
      console.error('Erro ao marcar despesa como paga:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PATCH /api/expenses/:id/cancel - Cancelar despesa
  static async cancel(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da despesa inválido'
        });
      }

      const expense = await Expense.findById(parseInt(id));
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Despesa não encontrada'
        });
      }

      if (expense.isPago()) {
        return res.status(409).json({
          success: false,
          message: 'Não é possível cancelar despesa já paga'
        });
      }

      if (expense.isCancelado()) {
        return res.status(409).json({
          success: false,
          message: 'Despesa já está cancelada'
        });
      }

      await expense.cancel(motivo);
      
      res.json({
        success: true,
        message: 'Despesa cancelada com sucesso',
        data: expense.toJSON()
      });
    } catch (error) {
      console.error('Erro ao cancelar despesa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // POST /api/expenses/:id/anexos - Adicionar anexo à despesa
  static async addAnexo(req, res) {
    try {
      const { id } = req.params;
      const { nome, tipo, url, tamanho } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID da despesa inválido'
        });
      }

      if (!nome || !url) {
        return res.status(400).json({
          success: false,
          message: 'Nome e URL do anexo são obrigatórios'
        });
      }

      const expense = await Expense.findById(parseInt(id));
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Despesa não encontrada'
        });
      }

      await expense.addAnexo({ nome, tipo, url, tamanho });
      
      res.json({
        success: true,
        message: 'Anexo adicionado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao adicionar anexo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // DELETE /api/expenses/:id/anexos/:anexoId - Remover anexo da despesa
  static async removeAnexo(req, res) {
    try {
      const { id, anexoId } = req.params;
      
      if (!id || isNaN(id) || !anexoId || isNaN(anexoId)) {
        return res.status(400).json({
          success: false,
          message: 'IDs inválidos'
        });
      }

      const expense = await Expense.findById(parseInt(id));
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Despesa não encontrada'
        });
      }

      await expense.removeAnexo(parseInt(anexoId));
      
      res.json({
        success: true,
        message: 'Anexo removido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover anexo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default ExpenseController;