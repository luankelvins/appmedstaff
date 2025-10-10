import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Contrato {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.numero_contrato = data.numero_contrato;
    this.tipo_contrato = data.tipo_contrato;
    this.cliente_id = data.cliente_id;
    this.cliente_nome = data.cliente_nome;
    this.data_inicio = data.data_inicio;
    this.data_vencimento = data.data_vencimento;
    this.renovacao_automatica = data.renovacao_automatica || false;
    this.servicos_contratados = data.servicos_contratados || {};
    this.condicoes_comerciais = data.condicoes_comerciais || {};
    this.clausulas_juridicas = data.clausulas_juridicas;
    this.documentos = data.documentos || [];
    this.status = data.status || 'rascunho';
    this.versao = data.versao || 1;
    this.responsavel_comercial = data.responsavel_comercial;
    this.responsavel_juridico = data.responsavel_juridico;
    this.observacoes = data.observacoes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validações
  static validate(data) {
    const errors = [];

    if (!data.numero_contrato || data.numero_contrato.trim().length === 0) {
      errors.push('Número do contrato é obrigatório');
    }

    if (!data.tipo_contrato || !['pf', 'pj'].includes(data.tipo_contrato)) {
      errors.push('Tipo de contrato deve ser "pf" ou "pj"');
    }

    if (!data.cliente_id) {
      errors.push('ID do cliente é obrigatório');
    }

    if (!data.cliente_nome || data.cliente_nome.trim().length === 0) {
      errors.push('Nome do cliente é obrigatório');
    }

    if (!data.data_inicio || isNaN(Date.parse(data.data_inicio))) {
      errors.push('Data de início é obrigatória e deve ser válida');
    }

    if (!data.data_vencimento || isNaN(Date.parse(data.data_vencimento))) {
      errors.push('Data de vencimento é obrigatória e deve ser válida');
    }

    if (data.data_inicio && data.data_vencimento && new Date(data.data_inicio) >= new Date(data.data_vencimento)) {
      errors.push('Data de vencimento deve ser posterior à data de início');
    }

    if (!data.servicos_contratados || typeof data.servicos_contratados !== 'object') {
      errors.push('Serviços contratados são obrigatórios');
    }

    if (!data.condicoes_comerciais || typeof data.condicoes_comerciais !== 'object') {
      errors.push('Condições comerciais são obrigatórias');
    }

    const validStatuses = ['rascunho', 'ativo', 'suspenso', 'encerrado'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Status deve ser um dos valores válidos: ' + validStatuses.join(', '));
    }

    return errors;
  }

  // Criar novo contrato
  static async create(data) {
    const errors = this.validate(data);
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    try {
      const client = await pool.connect();
      
      const contrato = new Contrato(data);
      
      const result = await client.query(`
        INSERT INTO contratos (
          id, numero_contrato, tipo_contrato, cliente_id, cliente_nome, 
          data_inicio, data_vencimento, renovacao_automatica, servicos_contratados, 
          condicoes_comerciais, clausulas_juridicas, documentos, status, versao,
          responsavel_comercial, responsavel_juridico, observacoes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `, [
        contrato.id,
        contrato.numero_contrato,
        contrato.tipo_contrato,
        contrato.cliente_id,
        contrato.cliente_nome,
        contrato.data_inicio,
        contrato.data_vencimento,
        contrato.renovacao_automatica,
        JSON.stringify(contrato.servicos_contratados),
        JSON.stringify(contrato.condicoes_comerciais),
        contrato.clausulas_juridicas,
        JSON.stringify(contrato.documentos),
        contrato.status,
        contrato.versao,
        contrato.responsavel_comercial,
        contrato.responsavel_juridico,
        contrato.observacoes
      ]);

      client.release();
      
      return new Contrato(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      throw error;
    }
  }

  // Buscar todos os contratos
  static async findAll(filters = {}, options = {}) {
    try {
      const client = await pool.connect();
      
      let query = 'SELECT * FROM contratos';
      let whereClause = '';
      const params = [];
      let paramCount = 0;

      // Aplicar filtros
      if (filters.status) {
        whereClause += ` ${whereClause ? 'AND' : 'WHERE'} status = $${++paramCount}`;
        params.push(filters.status);
      }

      if (filters.tipo_contrato) {
        whereClause += ` ${whereClause ? 'AND' : 'WHERE'} tipo_contrato = $${++paramCount}`;
        params.push(filters.tipo_contrato);
      }

      if (filters.cliente_id) {
        whereClause += ` ${whereClause ? 'AND' : 'WHERE'} cliente_id = $${++paramCount}`;
        params.push(filters.cliente_id);
      }

      if (filters.responsavel_comercial) {
        whereClause += ` ${whereClause ? 'AND' : 'WHERE'} responsavel_comercial = $${++paramCount}`;
        params.push(filters.responsavel_comercial);
      }

      if (filters.data_inicio) {
        whereClause += ` ${whereClause ? 'AND' : 'WHERE'} data_inicio >= $${++paramCount}`;
        params.push(filters.data_inicio);
      }

      if (filters.data_fim) {
        whereClause += ` ${whereClause ? 'AND' : 'WHERE'} data_vencimento <= $${++paramCount}`;
        params.push(filters.data_fim);
      }

      if (filters.search) {
        whereClause += ` ${whereClause ? 'AND' : 'WHERE'} (
          numero_contrato ILIKE $${++paramCount} OR 
          cliente_nome ILIKE $${paramCount} OR
          observacoes ILIKE $${paramCount}
        )`;
        params.push(`%${filters.search}%`);
      }

      query += whereClause;

      // Ordenação
      const sortBy = options.sort_by || 'created_at';
      const sortOrder = options.sort_order || 'desc';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      // Paginação
      if (options.page && options.limit) {
        const offset = (options.page - 1) * options.limit;
        query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
        params.push(options.limit, offset);
      }

      const result = await client.query(query, params);
      
      // Contar total para paginação
      let total = 0;
      if (options.page && options.limit) {
        const countQuery = `SELECT COUNT(*) as total FROM contratos ${whereClause}`;
        const countResult = await client.query(countQuery, params.slice(0, paramCount - 2));
        total = parseInt(countResult.rows[0].total);
      }

      client.release();
      
      const contratos = result.rows.map(row => new Contrato(row));
      
      return options.page && options.limit ? { contratos, total } : contratos;
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      throw error;
    }
  }

  // Buscar contrato por ID
  static async findById(id) {
    try {
      const client = await pool.connect();
      
      const result = await client.query('SELECT * FROM contratos WHERE id = $1', [id]);
      
      client.release();
      
      return result.rows.length > 0 ? new Contrato(result.rows[0]) : null;
    } catch (error) {
      console.error('Erro ao buscar contrato por ID:', error);
      throw error;
    }
  }

  // Buscar contrato por número
  static async findByNumero(numero) {
    try {
      const client = await pool.connect();
      
      const result = await client.query('SELECT * FROM contratos WHERE numero_contrato = $1', [numero]);
      
      client.release();
      
      return result.rows.length > 0 ? new Contrato(result.rows[0]) : null;
    } catch (error) {
      console.error('Erro ao buscar contrato por número:', error);
      throw error;
    }
  }

  // Buscar contratos por cliente
  static async findByCliente(clienteId, filters = {}) {
    return this.findAll({ ...filters, cliente_id: clienteId });
  }

  // Buscar contratos por responsável comercial
  static async findByResponsavel(responsavelId, filters = {}) {
    return this.findAll({ ...filters, responsavel_comercial: responsavelId });
  }

  // Buscar contratos vencendo
  static async findVencendo(dias = 30) {
    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        SELECT * FROM contratos 
        WHERE status = 'ativo' 
        AND data_vencimento <= CURRENT_DATE + INTERVAL '${dias} days'
        AND data_vencimento >= CURRENT_DATE
        ORDER BY data_vencimento ASC
      `);
      
      client.release();
      
      return result.rows.map(row => new Contrato(row));
    } catch (error) {
      console.error('Erro ao buscar contratos vencendo:', error);
      throw error;
    }
  }

  // Atualizar contrato
  async update(data) {
    const errors = Contrato.validate({ ...this, ...data });
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        UPDATE contratos 
        SET numero_contrato = $1, tipo_contrato = $2, cliente_id = $3, cliente_nome = $4,
            data_inicio = $5, data_vencimento = $6, renovacao_automatica = $7, 
            servicos_contratados = $8, condicoes_comerciais = $9, clausulas_juridicas = $10,
            documentos = $11, status = $12, responsavel_comercial = $13, 
            responsavel_juridico = $14, observacoes = $15, updated_at = NOW()
        WHERE id = $16
        RETURNING *
      `, [
        data.numero_contrato || this.numero_contrato,
        data.tipo_contrato || this.tipo_contrato,
        data.cliente_id || this.cliente_id,
        data.cliente_nome || this.cliente_nome,
        data.data_inicio || this.data_inicio,
        data.data_vencimento || this.data_vencimento,
        data.renovacao_automatica !== undefined ? data.renovacao_automatica : this.renovacao_automatica,
        JSON.stringify(data.servicos_contratados || this.servicos_contratados),
        JSON.stringify(data.condicoes_comerciais || this.condicoes_comerciais),
        data.clausulas_juridicas || this.clausulas_juridicas,
        JSON.stringify(data.documentos || this.documentos),
        data.status || this.status,
        data.responsavel_comercial || this.responsavel_comercial,
        data.responsavel_juridico || this.responsavel_juridico,
        data.observacoes || this.observacoes,
        this.id
      ]);

      client.release();

      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      throw error;
    }
  }

  // Deletar contrato
  async delete() {
    try {
      const client = await pool.connect();
      
      await client.query('DELETE FROM contratos WHERE id = $1', [this.id]);
      
      client.release();
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar contrato:', error);
      throw error;
    }
  }

  // Estatísticas dos contratos
  static async getStats(filters = {}) {
    try {
      const client = await pool.connect();
      
      let whereClause = '';
      const params = [];
      
      if (filters.responsavel_comercial) {
        whereClause += ' WHERE responsavel_comercial = $1';
        params.push(filters.responsavel_comercial);
      }
      
      if (filters.periodo) {
        const wherePrefix = whereClause ? ' AND' : ' WHERE';
        switch (filters.periodo) {
          case '7d':
            whereClause += `${wherePrefix} created_at >= NOW() - INTERVAL '7 days'`;
            break;
          case '30d':
            whereClause += `${wherePrefix} created_at >= NOW() - INTERVAL '30 days'`;
            break;
          case '90d':
            whereClause += `${wherePrefix} created_at >= NOW() - INTERVAL '90 days'`;
            break;
        }
      }
      
      const result = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'rascunho' THEN 1 END) as rascunhos,
          COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
          COUNT(CASE WHEN status = 'suspenso' THEN 1 END) as suspensos,
          COUNT(CASE WHEN status = 'encerrado' THEN 1 END) as encerrados,
          COUNT(CASE WHEN tipo_contrato = 'pf' THEN 1 END) as pessoa_fisica,
          COUNT(CASE WHEN tipo_contrato = 'pj' THEN 1 END) as pessoa_juridica,
          COUNT(CASE WHEN data_vencimento <= CURRENT_DATE + INTERVAL '30 days' AND status = 'ativo' THEN 1 END) as vencendo_30_dias
        FROM contratos${whereClause}
      `, params);

      client.release();
      
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  isAtivo() {
    return this.status === 'ativo';
  }

  isVencido() {
    return this.isAtivo() && new Date(this.data_vencimento) < new Date();
  }

  isVencendo(dias = 30) {
    if (!this.isAtivo()) return false;
    const vencimento = new Date(this.data_vencimento);
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);
    return vencimento <= limite && vencimento >= new Date();
  }

  getDiasParaVencimento() {
    if (!this.data_vencimento) return null;
    const hoje = new Date();
    const vencimento = new Date(this.data_vencimento);
    const diffTime = vencimento - hoje;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getValorMensal() {
    return this.condicoes_comerciais?.valor_mensal || 0;
  }

  getValorTotal() {
    return this.condicoes_comerciais?.valor_total || 0;
  }

  toJSON() {
    return {
      id: this.id,
      numero_contrato: this.numero_contrato,
      tipo_contrato: this.tipo_contrato,
      cliente_id: this.cliente_id,
      cliente_nome: this.cliente_nome,
      data_inicio: this.data_inicio,
      data_vencimento: this.data_vencimento,
      renovacao_automatica: this.renovacao_automatica,
      servicos_contratados: this.servicos_contratados,
      condicoes_comerciais: this.condicoes_comerciais,
      clausulas_juridicas: this.clausulas_juridicas,
      documentos: this.documentos,
      status: this.status,
      versao: this.versao,
      responsavel_comercial: this.responsavel_comercial,
      responsavel_juridico: this.responsavel_juridico,
      observacoes: this.observacoes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default Contrato;