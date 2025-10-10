import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class ClientePF {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.dados_pessoais = data.dados_pessoais || {};
    this.endereco = data.endereco || {};
    this.contato = data.contato || {};
    this.informacoes_profissionais = data.informacoes_profissionais || {};
    this.documentos = data.documentos || [];
    this.contratos = data.contratos || [];
    this.status = data.status || 'ativo';
    this.observacoes = data.observacoes;
    this.responsavel = data.responsavel;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validações
  static validate(data) {
    const errors = [];

    if (!data.dados_pessoais || typeof data.dados_pessoais !== 'object') {
      errors.push('Dados pessoais são obrigatórios');
    } else {
      if (!data.dados_pessoais.nome || data.dados_pessoais.nome.trim().length === 0) {
        errors.push('Nome é obrigatório nos dados pessoais');
      }
      
      if (!data.dados_pessoais.cpf || data.dados_pessoais.cpf.trim().length === 0) {
        errors.push('CPF é obrigatório nos dados pessoais');
      }
    }

    if (!data.endereco || typeof data.endereco !== 'object') {
      errors.push('Endereço é obrigatório');
    }

    if (!data.contato || typeof data.contato !== 'object') {
      errors.push('Dados de contato são obrigatórios');
    } else {
      if (!data.contato.telefone && !data.contato.email) {
        errors.push('Pelo menos um meio de contato (telefone ou email) é obrigatório');
      }
      
      if (data.contato.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contato.email)) {
        errors.push('Email deve ter um formato válido');
      }
    }

    const validStatuses = ['ativo', 'inativo', 'cancelado'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Status deve ser um dos valores válidos: ' + validStatuses.join(', '));
    }

    return errors;
  }

  // Criar cliente PF
  static async create(data) {
    const errors = this.validate(data);
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    const cliente = new ClientePF(data);
    
    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        INSERT INTO clientes_pf (id, dados_pessoais, endereco, contato, informacoes_profissionais, documentos, contratos, status, observacoes, responsavel)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        cliente.id,
        JSON.stringify(cliente.dados_pessoais),
        JSON.stringify(cliente.endereco),
        JSON.stringify(cliente.contato),
        JSON.stringify(cliente.informacoes_profissionais),
        JSON.stringify(cliente.documentos),
        JSON.stringify(cliente.contratos),
        cliente.status,
        cliente.observacoes,
        cliente.responsavel
      ]);

      client.release();

      return new ClientePF(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar cliente PF:', error);
      throw error;
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const client = await pool.connect();
      
      const result = await client.query('SELECT * FROM clientes_pf WHERE id = $1', [id]);
      
      client.release();

      if (result.rows.length === 0) {
        return null;
      }

      return new ClientePF(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar cliente PF:', error);
      throw error;
    }
  }

  // Buscar por CPF
  static async findByCPF(cpf) {
    try {
      const client = await pool.connect();
      
      const result = await client.query("SELECT * FROM clientes_pf WHERE dados_pessoais->>'cpf' = $1", [cpf]);
      
      client.release();

      if (result.rows.length === 0) {
        return null;
      }

      return new ClientePF(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar cliente PF por CPF:', error);
      throw error;
    }
  }

  // Listar todos com filtros
  static async findAll(filters = {}) {
    try {
      const client = await pool.connect();
      
      let queryText = 'SELECT * FROM clientes_pf WHERE 1=1';
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

      if (filters.search) {
        queryText += ` AND (dados_pessoais->>'nome' ILIKE $${paramIndex} OR dados_pessoais->>'cpf' ILIKE $${paramIndex} OR contato->>'email' ILIKE $${paramIndex})`;
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

      return result.rows.map(item => new ClientePF(item));
    } catch (error) {
      console.error('Erro ao listar clientes PF:', error);
      throw error;
    }
  }

  // Buscar clientes por responsável
  static async findByResponsavel(responsavelId, filters = {}) {
    return this.findAll({ ...filters, responsavel: responsavelId });
  }

  // Atualizar cliente PF
  async update(data) {
    const errors = ClientePF.validate({ ...this, ...data });
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        UPDATE clientes_pf 
        SET dados_pessoais = $1, endereco = $2, contato = $3, informacoes_profissionais = $4, 
            documentos = $5, contratos = $6, status = $7, observacoes = $8, responsavel = $9, updated_at = NOW()
        WHERE id = $10
        RETURNING *
      `, [
        JSON.stringify(data.dados_pessoais || this.dados_pessoais),
        JSON.stringify(data.endereco || this.endereco),
        JSON.stringify(data.contato || this.contato),
        JSON.stringify(data.informacoes_profissionais || this.informacoes_profissionais),
        JSON.stringify(data.documentos || this.documentos),
        JSON.stringify(data.contratos || this.contratos),
        data.status || this.status,
        data.observacoes || this.observacoes,
        data.responsavel || this.responsavel,
        this.id
      ]);

      client.release();

      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      console.error('Erro ao atualizar cliente PF:', error);
      throw error;
    }
  }

  // Deletar cliente
  async delete() {
    try {
      const client = await pool.connect();
      
      await client.query('DELETE FROM clientes_pf WHERE id = $1', [this.id]);
      
      client.release();

      return true;
    } catch (error) {
      console.error('Erro ao deletar cliente PF:', error);
      throw error;
    }
  }

  // Adicionar documento
  async addDocumento(documento) {
    if (!documento.nome || !documento.tipo) {
      throw new Error('Nome e tipo do documento são obrigatórios');
    }

    const novoDocumento = {
      id: uuidv4(),
      nome: documento.nome,
      tipo: documento.tipo,
      url: documento.url,
      data_upload: new Date().toISOString(),
      ...documento
    };

    this.documentos.push(novoDocumento);
    await this.update({ documentos: this.documentos });
    
    return novoDocumento;
  }

  // Remover documento
  async removeDocumento(documentoId) {
    this.documentos = this.documentos.filter(doc => doc.id !== documentoId);
    await this.update({ documentos: this.documentos });
    return true;
  }

  // Adicionar contrato
  async addContrato(contrato) {
    if (!contrato.numero || !contrato.tipo) {
      throw new Error('Número e tipo do contrato são obrigatórios');
    }

    const novoContrato = {
      id: uuidv4(),
      numero: contrato.numero,
      tipo: contrato.tipo,
      data_inicio: contrato.data_inicio,
      data_fim: contrato.data_fim,
      status: contrato.status || 'ativo',
      valor: contrato.valor,
      data_criacao: new Date().toISOString(),
      ...contrato
    };

    this.contratos.push(novoContrato);
    await this.update({ contratos: this.contratos });
    
    return novoContrato;
  }

  // Métodos auxiliares
  isAtivo() {
    return this.status === 'ativo';
  }

  getNome() {
    return this.dados_pessoais?.nome || 'Nome não informado';
  }

  getCPF() {
    return this.dados_pessoais?.cpf || 'CPF não informado';
  }

  getEmail() {
    return this.contato?.email || null;
  }

  getTelefone() {
    return this.contato?.telefone || null;
  }

  getEnderecoCompleto() {
    const endereco = this.endereco;
    if (!endereco) return 'Endereço não informado';
    
    const partes = [
      endereco.logradouro,
      endereco.numero,
      endereco.complemento,
      endereco.bairro,
      endereco.cidade,
      endereco.estado,
      endereco.cep
    ].filter(Boolean);
    
    return partes.join(', ');
  }

  getContratosAtivos() {
    return this.contratos.filter(contrato => contrato.status === 'ativo');
  }

  hasDocumentoTipo(tipo) {
    return this.documentos.some(doc => doc.tipo === tipo);
  }

  toJSON() {
    return {
      id: this.id,
      dados_pessoais: this.dados_pessoais,
      endereco: this.endereco,
      contato: this.contato,
      informacoes_profissionais: this.informacoes_profissionais,
      documentos: this.documentos,
      contratos: this.contratos,
      status: this.status,
      observacoes: this.observacoes,
      responsavel: this.responsavel,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Estatísticas dos clientes PF
  static async getStats() {
    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
          COUNT(CASE WHEN status = 'inativo' THEN 1 END) as inativos,
          COUNT(CASE WHEN status = 'suspenso' THEN 1 END) as suspensos,
          COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelados
        FROM clientes_pf
      `);

      client.release();

      return {
        total: parseInt(result.rows[0].total),
        por_status: {
          ativos: parseInt(result.rows[0].ativos),
          inativos: parseInt(result.rows[0].inativos),
          suspensos: parseInt(result.rows[0].suspensos),
          cancelados: parseInt(result.rows[0].cancelados)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos clientes PF:', error);
      throw error;
    }
  }
}

export default ClientePF;