import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Expense {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.descricao = data.descricao;
    this.valor = data.valor;
    this.data_vencimento = data.data_vencimento;
    this.data_pagamento = data.data_pagamento;
    this.categoria_id = data.categoria_id;
    this.conta_id = data.conta_id;
    this.metodo_pagamento_id = data.metodo_pagamento_id;
    this.status = data.status || 'pendente';
    this.recorrente = data.recorrente || false;
    this.configuracao_recorrencia = data.configuracao_recorrencia || {};
    this.anexos = data.anexos || [];
    this.observacoes = data.observacoes;
    this.criado_por = data.criado_por;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validações
  static validate(data) {
    const errors = [];

    if (!data.descricao || data.descricao.trim().length === 0) {
      errors.push('Descrição é obrigatória');
    }

    if (!data.valor || isNaN(parseFloat(data.valor)) || parseFloat(data.valor) <= 0) {
      errors.push('Valor deve ser um número positivo');
    }

    if (!data.data_vencimento || isNaN(Date.parse(data.data_vencimento))) {
      errors.push('Data de vencimento é obrigatória e deve ser válida');
    }

    if (data.data_pagamento && isNaN(Date.parse(data.data_pagamento))) {
      errors.push('Data de pagamento deve ser uma data válida');
    }

    const validStatuses = ['pendente', 'pago', 'vencido', 'cancelado'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Status deve ser um dos valores válidos: ' + validStatuses.join(', '));
    }

    if (data.recorrente && (!data.configuracao_recorrencia || typeof data.configuracao_recorrencia !== 'object')) {
      errors.push('Configuração de recorrência é obrigatória para despesas recorrentes');
    }

    return errors;
  }

  // Criar despesa
  static async create(data) {
    const errors = this.validate(data);
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    const expense = new Expense(data);
    
    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        INSERT INTO expenses (id, descricao, valor, data_vencimento, data_pagamento, categoria_id, 
                             conta_id, metodo_pagamento_id, status, recorrente, configuracao_recorrencia, 
                             anexos, observacoes, criado_por)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [
        expense.id,
        expense.descricao,
        expense.valor,
        expense.data_vencimento,
        expense.data_pagamento,
        expense.categoria_id,
        expense.conta_id,
        expense.metodo_pagamento_id,
        expense.status,
        expense.recorrente,
        JSON.stringify(expense.configuracao_recorrencia),
        JSON.stringify(expense.anexos),
        expense.observacoes,
        expense.criado_por
      ]);

      client.release();

      return new Expense(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      throw error;
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const client = await pool.connect();
      
      const result = await client.query('SELECT * FROM expenses WHERE id = $1', [id]);
      
      client.release();

      if (result.rows.length === 0) {
        return null;
      }

      return new Expense(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar despesa:', error);
      throw error;
    }
  }

  // Listar todas com filtros
  static async findAll(filters = {}) {
    try {
      const client = await pool.connect();
      
      let queryText = 'SELECT * FROM expenses WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.status) {
        queryText += ` AND status = $${paramIndex}`;
        queryParams.push(filters.status);
        paramIndex++;
      }

      if (filters.categoria_id) {
        queryText += ` AND categoria_id = $${paramIndex}`;
        queryParams.push(filters.categoria_id);
        paramIndex++;
      }

      if (filters.conta_id) {
        queryText += ` AND conta_id = $${paramIndex}`;
        queryParams.push(filters.conta_id);
        paramIndex++;
      }

      if (filters.criado_por) {
        queryText += ` AND criado_por = $${paramIndex}`;
        queryParams.push(filters.criado_por);
        paramIndex++;
      }

      if (filters.data_inicio && filters.data_fim) {
        queryText += ` AND data_vencimento BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        queryParams.push(filters.data_inicio, filters.data_fim);
        paramIndex += 2;
      }

      if (filters.search) {
        queryText += ` AND descricao ILIKE $${paramIndex}`;
        queryParams.push(`%${filters.search}%`);
        paramIndex++;
      }

      queryText += ' ORDER BY data_vencimento DESC';

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

      return result.rows.map(item => new Expense(item));
    } catch (error) {
      console.error('Erro ao listar despesas:', error);
      throw error;
    }
  }

  // Buscar despesas vencidas
  static async findOverdue(filters = {}) {
    const today = new Date().toISOString().split('T')[0];
    return this.findAll({ 
      ...filters, 
      status: 'pendente',
      data_vencimento_to: today 
    });
  }

  // Buscar despesas a vencer
  static async findDueSoon(days = 7, filters = {}) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.findAll({ 
      ...filters, 
      status: 'pendente',
      data_vencimento_from: today.toISOString().split('T')[0],
      data_vencimento_to: futureDate.toISOString().split('T')[0]
    });
  }

  // Atualizar despesa
  async update(data) {
    const errors = Expense.validate({ ...this, ...data });
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        UPDATE expenses 
        SET descricao = $1, valor = $2, data_vencimento = $3, data_pagamento = $4, 
            categoria_id = $5, conta_id = $6, metodo_pagamento_id = $7, status = $8, 
            recorrente = $9, configuracao_recorrencia = $10, anexos = $11, 
            observacoes = $12, updated_at = NOW()
        WHERE id = $13
        RETURNING *
      `, [
        data.descricao || this.descricao,
        data.valor || this.valor,
        data.data_vencimento || this.data_vencimento,
        data.data_pagamento || this.data_pagamento,
        data.categoria_id || this.categoria_id,
        data.conta_id || this.conta_id,
        data.metodo_pagamento_id || this.metodo_pagamento_id,
        data.status || this.status,
        data.recorrente !== undefined ? data.recorrente : this.recorrente,
        JSON.stringify(data.configuracao_recorrencia || this.configuracao_recorrencia),
        JSON.stringify(data.anexos || this.anexos),
        data.observacoes || this.observacoes,
        this.id
      ]);

      client.release();

      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      throw error;
    }
  }

  // Marcar como paga
  async markAsPaid(dataPagamento = null, metodoPagamentoId = null, contaId = null) {
    const updateData = {
      status: 'pago',
      data_pagamento: dataPagamento || new Date().toISOString().split('T')[0]
    };

    if (metodoPagamentoId) {
      updateData.metodo_pagamento_id = metodoPagamentoId;
    }

    if (contaId) {
      updateData.conta_id = contaId;
    }

    return this.update(updateData);
  }

  // Cancelar despesa
  async cancel() {
    return this.update({ status: 'cancelado' });
  }

  // Deletar despesa
  async delete() {
    try {
      const client = await pool.connect();
      
      await client.query('DELETE FROM expenses WHERE id = $1', [this.id]);
      
      client.release();

      return true;
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      throw error;
    }
  }

  // Adicionar anexo
  async addAnexo(anexo) {
    if (!anexo.nome || !anexo.url) {
      throw new Error('Nome e URL do anexo são obrigatórios');
    }

    const novoAnexo = {
      id: uuidv4(),
      nome: anexo.nome,
      url: anexo.url,
      tipo: anexo.tipo,
      tamanho: anexo.tamanho,
      data_upload: new Date().toISOString(),
      ...anexo
    };

    this.anexos.push(novoAnexo);
    await this.update({ anexos: this.anexos });
    
    return novoAnexo;
  }

  // Remover anexo
  async removeAnexo(anexoId) {
    this.anexos = this.anexos.filter(anexo => anexo.id !== anexoId);
    await this.update({ anexos: this.anexos });
    return true;
  }

  // Calcular total por período
  static async getTotalByPeriod(startDate, endDate, filters = {}) {
    try {
      const client = await pool.connect();
      
      let queryText = `
        SELECT COALESCE(SUM(valor), 0) as total 
        FROM expenses 
        WHERE data_vencimento >= $1 AND data_vencimento <= $2
      `;
      const queryParams = [startDate, endDate];
      let paramIndex = 3;

      if (filters.status) {
        queryText += ` AND status = $${paramIndex}`;
        queryParams.push(filters.status);
        paramIndex++;
      }

      if (filters.categoria_id) {
        queryText += ` AND categoria_id = $${paramIndex}`;
        queryParams.push(filters.categoria_id);
        paramIndex++;
      }

      const result = await client.query(queryText, queryParams);
      
      client.release();

      return parseFloat(result.rows[0].total) || 0;
    } catch (error) {
      console.error('Erro ao calcular total de despesas:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  isPendente() {
    return this.status === 'pendente';
  }

  isPago() {
    return this.status === 'pago';
  }

  isVencido() {
    return this.status === 'vencido' || (this.isPendente() && new Date(this.data_vencimento) < new Date());
  }

  isCancelado() {
    return this.status === 'cancelado';
  }

  isRecorrente() {
    return this.recorrente;
  }

  getDaysUntilDue() {
    if (!this.data_vencimento) return null;
    const today = new Date();
    const dueDate = new Date(this.data_vencimento);
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getValorFormatado() {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.valor);
  }

  toJSON() {
    return {
      id: this.id,
      descricao: this.descricao,
      valor: this.valor,
      data_vencimento: this.data_vencimento,
      data_pagamento: this.data_pagamento,
      categoria_id: this.categoria_id,
      conta_id: this.conta_id,
      metodo_pagamento_id: this.metodo_pagamento_id,
      status: this.status,
      recorrente: this.recorrente,
      configuracao_recorrencia: this.configuracao_recorrencia,
      anexos: this.anexos,
      observacoes: this.observacoes,
      criado_por: this.criado_por,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default Expense;