import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Lead {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.nome = data.nome;
    this.telefone = data.telefone;
    this.email = data.email;
    this.empresa = data.empresa;
    this.cargo = data.cargo;
    this.cidade = data.cidade;
    this.estado = data.estado;
    this.produtos_interesse = data.produtos_interesse || [];
    this.origem = data.origem;
    this.origem_detalhes = data.origem_detalhes;
    this.observacoes = data.observacoes;
    this.status = data.status || 'novo';
    this.responsavel = data.responsavel;
    this.data_contato = data.data_contato;
    this.proxima_acao = data.proxima_acao;
    this.data_proxima_acao = data.data_proxima_acao;
    this.criado_por = data.criado_por;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validações
  static validate(data) {
    const errors = [];

    if (!data.nome || data.nome.trim().length === 0) {
      errors.push('Nome é obrigatório');
    }

    if (!data.telefone || data.telefone.trim().length === 0) {
      errors.push('Telefone é obrigatório');
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email deve ter um formato válido');
    }

    const validOrigens = ['site', 'indicacao', 'evento', 'redes_sociais', 'google', 'time_interno', 'outros'];
    if (!data.origem || !validOrigens.includes(data.origem)) {
      errors.push('Origem deve ser um dos valores válidos: ' + validOrigens.join(', '));
    }

    const validStatuses = ['novo', 'contatado', 'qualificado', 'proposta', 'negociacao', 'ganho', 'perdido'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Status deve ser um dos valores válidos: ' + validStatuses.join(', '));
    }

    if (data.data_contato && isNaN(Date.parse(data.data_contato))) {
      errors.push('Data de contato deve ser uma data válida');
    }

    if (data.data_proxima_acao && isNaN(Date.parse(data.data_proxima_acao))) {
      errors.push('Data da próxima ação deve ser uma data válida');
    }

    return errors;
  }

  // Criar lead
  static async create(data) {
    const errors = this.validate(data);
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    const lead = new Lead(data);
    
    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        INSERT INTO leads (id, nome, telefone, email, status, origem, responsavel, observacoes, data_proxima_acao)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        lead.id,
        lead.nome,
        lead.telefone,
        lead.email,
        lead.status,
        lead.origem,
        lead.responsavel,
        lead.observacoes,
        lead.data_proxima_acao
      ]);

      client.release();

      return new Lead(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      throw error;
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const client = await pool.connect();
      
      const result = await client.query('SELECT * FROM leads WHERE id = $1', [id]);
      
      client.release();

      if (result.rows.length === 0) {
        return null;
      }

      return new Lead(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar lead:', error);
      throw error;
    }
  }

  // Buscar por email
  static async findByEmail(email) {
    try {
      const client = await pool.connect();
      
      const result = await client.query('SELECT * FROM leads WHERE email = $1', [email]);
      
      client.release();

      if (result.rows.length === 0) {
        return null;
      }

      return new Lead(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar lead por email:', error);
      throw error;
    }
  }

  // Listar todos com filtros
  static async findAll(filters = {}) {
    try {
      const client = await pool.connect();
      
      let queryText = 'SELECT * FROM leads WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.status) {
        queryText += ` AND status = $${paramIndex}`;
        queryParams.push(filters.status);
        paramIndex++;
      }

      if (filters.responsavel) {
        queryText += ` AND responsavel = $${paramIndex}`;
        queryParams.push(filters.responsavel);
        paramIndex++;
      }

      if (filters.origem) {
        queryText += ` AND origem = $${paramIndex}`;
        queryParams.push(filters.origem);
        paramIndex++;
      }

      if (filters.search) {
        queryText += ` AND (nome ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR telefone ILIKE $${paramIndex})`;
        queryParams.push(`%${filters.search}%`);
        paramIndex++;
      }

      queryText += ' ORDER BY created_at DESC';

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

      return result.rows.map(item => new Lead(item));
    } catch (error) {
      console.error('Erro ao listar leads:', error);
      throw error;
    }
  }

  // Buscar leads por responsável
  static async findByResponsavel(responsavelId, filters = {}) {
    return this.findAll({ ...filters, responsavel: responsavelId });
  }

  // Buscar leads por status
  static async findByStatus(status, filters = {}) {
    return this.findAll({ ...filters, status });
  }

  // Atualizar lead
  async update(data) {
    const errors = Lead.validate({ ...this, ...data });
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        UPDATE leads 
        SET nome = $1, telefone = $2, email = $3, status = $4, origem = $5, 
            responsavel = $6, observacoes = $7, data_proxima_acao = $8, updated_at = NOW()
        WHERE id = $9
        RETURNING *
      `, [
        data.nome || this.nome,
        data.telefone || this.telefone,
        data.email || this.email,
        data.status || this.status,
        data.origem || this.origem,
        data.responsavel || this.responsavel,
        data.observacoes || this.observacoes,
        data.data_proxima_acao || this.data_proxima_acao,
        this.id
      ]);

      client.release();

      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      throw error;
    }
  }

  // Deletar lead
  async delete() {
    try {
      const client = await pool.connect();
      
      await client.query('DELETE FROM leads WHERE id = $1', [this.id]);
      
      client.release();

      return true;
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  isNovo() {
    return this.status === 'novo';
  }

  isQualificado() {
    return ['qualificado', 'proposta', 'negociacao'].includes(this.status);
  }

  isGanho() {
    return this.status === 'ganho';
  }

  isPerdido() {
    return this.status === 'perdido';
  }

  needsFollowUp() {
    if (!this.data_proxima_acao) return false;
    return new Date(this.data_proxima_acao) <= new Date();
  }

  getDaysUntilNextAction() {
    if (!this.data_proxima_acao) return null;
    const today = new Date();
    const nextAction = new Date(this.data_proxima_acao);
    const diffTime = nextAction - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getContactInfo() {
    const info = [];
    if (this.telefone) info.push(`Tel: ${this.telefone}`);
    if (this.email) info.push(`Email: ${this.email}`);
    return info.join(' | ');
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      telefone: this.telefone,
      email: this.email,
      empresa: this.empresa,
      cargo: this.cargo,
      cidade: this.cidade,
      estado: this.estado,
      produtos_interesse: this.produtos_interesse,
      origem: this.origem,
      origem_detalhes: this.origem_detalhes,
      observacoes: this.observacoes,
      status: this.status,
      responsavel: this.responsavel,
      data_contato: this.data_contato,
      proxima_acao: this.proxima_acao,
      data_proxima_acao: this.data_proxima_acao,
      criado_por: this.criado_por,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Estatísticas dos leads
  static async getStats(filters = {}) {
    try {
      const client = await pool.connect();
      
      let whereClause = '';
      const params = [];
      
      if (filters.responsavel_id) {
        whereClause += ' WHERE responsavel_id = $1';
        params.push(filters.responsavel_id);
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
          COUNT(CASE WHEN status = 'novo' THEN 1 END) as novos,
          COUNT(CASE WHEN status = 'contatado' THEN 1 END) as contatados,
          COUNT(CASE WHEN status = 'qualificado' THEN 1 END) as qualificados,
          COUNT(CASE WHEN status = 'proposta' THEN 1 END) as proposta,
          COUNT(CASE WHEN status = 'negociacao' THEN 1 END) as negociacao,
          COUNT(CASE WHEN status = 'ganho' THEN 1 END) as ganhos,
          COUNT(CASE WHEN status = 'perdido' THEN 1 END) as perdidos,
          COUNT(CASE WHEN data_proxima_acao < NOW() AND status NOT IN ('ganho', 'perdido') THEN 1 END) as atrasados
        FROM leads${whereClause}
      `, params);

      client.release();

      return {
        total: parseInt(result.rows[0].total),
        por_status: {
          novos: parseInt(result.rows[0].novos),
          contatados: parseInt(result.rows[0].contatados),
          qualificados: parseInt(result.rows[0].qualificados),
          proposta: parseInt(result.rows[0].proposta),
          negociacao: parseInt(result.rows[0].negociacao),
          ganhos: parseInt(result.rows[0].ganhos),
          perdidos: parseInt(result.rows[0].perdidos)
        },
        atrasados: parseInt(result.rows[0].atrasados)
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos leads:', error);
      throw error;
    }
  }

  // Buscar leads que precisam de follow-up
  static async findNeedingFollowUp() {
    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        SELECT * FROM leads 
        WHERE data_proxima_acao <= NOW() 
        AND status NOT IN ('ganho', 'perdido')
        ORDER BY data_proxima_acao ASC
      `);

      client.release();

      return result.rows.map(row => new Lead(row));
    } catch (error) {
      console.error('Erro ao buscar leads que precisam de follow-up:', error);
      throw error;
    }
  }
}

export default Lead;