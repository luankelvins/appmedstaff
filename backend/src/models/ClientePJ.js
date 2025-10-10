import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class ClientePJ {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.razao_social = data.razao_social;
    this.nome_fantasia = data.nome_fantasia;
    this.cnpj = data.cnpj;
    this.inscricao_estadual = data.inscricao_estadual;
    this.inscricao_municipal = data.inscricao_municipal;
    this.endereco = data.endereco || {};
    this.contato = data.contato || {};
    this.representante_legal = data.representante_legal || {};
    this.informacoes_societarias = data.informacoes_societarias || {};
    this.certificado_digital = data.certificado_digital || {};
    this.contratos = data.contratos || [];
    this.documentos = data.documentos || [];
    this.vinculos = data.vinculos || {};
    this.status = data.status || 'ativo';
    this.observacoes = data.observacoes;
    this.responsavel = data.responsavel;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validações
  static validate(data) {
    const errors = [];

    if (!data.razao_social || data.razao_social.trim().length === 0) {
      errors.push('Razão social é obrigatória');
    }

    if (!data.cnpj || data.cnpj.trim().length === 0) {
      errors.push('CNPJ é obrigatório');
    } else if (!this.isValidCNPJ(data.cnpj)) {
      errors.push('CNPJ deve ter um formato válido');
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

    if (!data.representante_legal || typeof data.representante_legal !== 'object') {
      errors.push('Dados do representante legal são obrigatórios');
    } else {
      if (!data.representante_legal.nome) {
        errors.push('Nome do representante legal é obrigatório');
      }
      if (!data.representante_legal.cpf) {
        errors.push('CPF do representante legal é obrigatório');
      }
    }

    if (!data.informacoes_societarias || typeof data.informacoes_societarias !== 'object') {
      errors.push('Informações societárias são obrigatórias');
    }

    const validStatuses = ['ativo', 'inativo', 'cancelado'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Status deve ser um dos valores válidos: ' + validStatuses.join(', '));
    }

    return errors;
  }

  // Validação de CNPJ
  static isValidCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Elimina CNPJs inválidos conhecidos
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    
    return true;
  }

  // Criar cliente PJ
  static async create(data) {
    const errors = this.validate(data);
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    const cliente = new ClientePJ(data);
    
    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        INSERT INTO clientes_pj (id, razao_social, nome_fantasia, cnpj, endereco, contato, status, responsavel)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        cliente.id,
        cliente.razao_social,
        cliente.nome_fantasia,
        cliente.cnpj,
        JSON.stringify(cliente.endereco),
        JSON.stringify(cliente.contato),
        cliente.status,
        cliente.responsavel
      ]);

      client.release();

      return new ClientePJ(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar cliente PJ:', error);
      throw error;
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const client = await pool.connect();
      
      const result = await client.query('SELECT * FROM clientes_pj WHERE id = $1', [id]);
      
      client.release();

      if (result.rows.length === 0) {
        return null;
      }

      return new ClientePJ(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar cliente PJ:', error);
      throw error;
    }
  }

  // Buscar por CNPJ
  static async findByCNPJ(cnpj) {
    try {
      const client = await pool.connect();
      
      const result = await client.query('SELECT * FROM clientes_pj WHERE cnpj = $1', [cnpj]);
      
      client.release();

      if (result.rows.length === 0) {
        return null;
      }

      return new ClientePJ(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar cliente PJ por CNPJ:', error);
      throw error;
    }
  }

  // Listar todos com filtros
  static async findAll(filters = {}) {
    try {
      const client = await pool.connect();
      
      let queryText = 'SELECT * FROM clientes_pj WHERE 1=1';
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
        queryText += ` AND (razao_social ILIKE $${paramIndex} OR nome_fantasia ILIKE $${paramIndex} OR cnpj ILIKE $${paramIndex} OR contato->>'email' ILIKE $${paramIndex})`;
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

      return result.rows.map(item => new ClientePJ(item));
    } catch (error) {
      console.error('Erro ao listar clientes PJ:', error);
      throw error;
    }
  }

  // Atualizar cliente
  async update(data) {
    const errors = ClientePJ.validate({ ...this, ...data });
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        UPDATE clientes_pj 
        SET razao_social = $1, nome_fantasia = $2, cnpj = $3, endereco = $4, 
            contato = $5, status = $6, responsavel = $7, updated_at = NOW()
        WHERE id = $8
        RETURNING *
      `, [
        data.razao_social || this.razao_social,
        data.nome_fantasia || this.nome_fantasia,
        data.cnpj || this.cnpj,
        JSON.stringify(data.endereco || this.endereco),
        JSON.stringify(data.contato || this.contato),
        data.status || this.status,
        data.responsavel || this.responsavel,
        this.id
      ]);

      client.release();

      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      console.error('Erro ao atualizar cliente PJ:', error);
      throw error;
    }
  }

  // Deletar cliente
  async delete() {
    try {
      const client = await pool.connect();
      
      await client.query('DELETE FROM clientes_pj WHERE id = $1', [this.id]);
      
      client.release();

      return true;
    } catch (error) {
      console.error('Erro ao deletar cliente PJ:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  isAtivo() {
    return this.status === 'ativo';
  }

  getNomeExibicao() {
    return this.nome_fantasia || this.razao_social;
  }

  getCNPJFormatado() {
    if (!this.cnpj) return '';
    return this.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
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

  getRepresentanteLegal() {
    return this.representante_legal?.nome || 'Não informado';
  }

  hasCertificadoDigital() {
    return this.certificado_digital && Object.keys(this.certificado_digital).length > 0;
  }

  getContratosAtivos() {
    return this.contratos.filter(contrato => contrato.status === 'ativo');
  }

  toJSON() {
    return {
      id: this.id,
      razao_social: this.razao_social,
      nome_fantasia: this.nome_fantasia,
      cnpj: this.cnpj,
      inscricao_estadual: this.inscricao_estadual,
      inscricao_municipal: this.inscricao_municipal,
      endereco: this.endereco,
      contato: this.contato,
      representante_legal: this.representante_legal,
      informacoes_societarias: this.informacoes_societarias,
      certificado_digital: this.certificado_digital,
      contratos: this.contratos,
      documentos: this.documentos,
      vinculos: this.vinculos,
      status: this.status,
      observacoes: this.observacoes,
      responsavel: this.responsavel,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Estatísticas dos clientes PJ
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
        FROM clientes_pj
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
      console.error('Erro ao buscar estatísticas dos clientes PJ:', error);
      throw error;
    }
  }
}

export default ClientePJ;