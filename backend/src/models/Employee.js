import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Employee {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.email = data.email;
    this.dados_pessoais = data.dados_pessoais || {};
    this.dados_profissionais = data.dados_profissionais || {};
    this.dados_financeiros = data.dados_financeiros || {};
    this.role = data.role || 'employee';
    this.status = data.status || 'ativo';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validações
  static validate(data) {
    const errors = [];

    if (!data.email) {
      errors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email deve ter um formato válido');
    }

    if (!data.dados_pessoais || typeof data.dados_pessoais !== 'object') {
      errors.push('Dados pessoais são obrigatórios');
    }

    if (!data.dados_profissionais || typeof data.dados_profissionais !== 'object') {
      errors.push('Dados profissionais são obrigatórios');
    }

    const validRoles = ['employee', 'admin', 'superadmin', 'manager', 'supervisor'];
    if (data.role && !validRoles.includes(data.role)) {
      errors.push('Role deve ser um dos valores válidos: ' + validRoles.join(', '));
    }

    const validStatuses = ['ativo', 'inativo', 'afastado', 'desligado'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Status deve ser um dos valores válidos: ' + validStatuses.join(', '));
    }

    return errors;
  }

  // Criar funcionário
  static async create(data) {
    const errors = this.validate(data);
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    const employee = new Employee(data);
    
    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        INSERT INTO employees (id, email, dados_pessoais, dados_profissionais, dados_financeiros, role, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        employee.id,
        employee.email,
        JSON.stringify(employee.dados_pessoais),
        JSON.stringify(employee.dados_profissionais),
        JSON.stringify(employee.dados_financeiros),
        employee.role,
        employee.status
      ]);

      client.release();

      return new Employee(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      throw error;
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const client = await pool.connect();
      
      const result = await client.query('SELECT * FROM employees WHERE id = $1', [id]);
      
      client.release();

      if (result.rows.length === 0) {
        return null;
      }

      return new Employee(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar funcionário:', error);
      throw error;
    }
  }

  // Buscar por email
  static async findByEmail(email) {
    try {
      const client = await pool.connect();
      
      const result = await client.query('SELECT * FROM employees WHERE email = $1', [email]);
      
      client.release();

      if (result.rows.length === 0) {
        return null;
      }

      return new Employee(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar funcionário por email:', error);
      throw error;
    }
  }

  // Listar todos com filtros
  static async findAll(filters = {}) {
    try {
      const client = await pool.connect();
      
      let queryText = 'SELECT * FROM employees WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.role) {
        queryText += ` AND role = $${paramIndex}`;
        queryParams.push(filters.role);
        paramIndex++;
      }

      if (filters.status) {
        queryText += ` AND status = $${paramIndex}`;
        queryParams.push(filters.status);
        paramIndex++;
      }

      if (filters.search) {
        queryText += ` AND (email ILIKE $${paramIndex} OR dados_pessoais->>'nome' ILIKE $${paramIndex})`;
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

      return result.rows.map(item => new Employee(item));
    } catch (error) {
      console.error('Erro ao listar funcionários:', error);
      throw error;
    }
  }

  // Atualizar funcionário
  async update(data) {
    const errors = Employee.validate({ ...this, ...data });
    if (errors.length > 0) {
      throw new Error('Dados inválidos: ' + errors.join(', '));
    }

    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        UPDATE employees 
        SET email = $1, dados_pessoais = $2, dados_profissionais = $3, 
            dados_financeiros = $4, role = $5, status = $6, updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `, [
        data.email || this.email,
        JSON.stringify(data.dados_pessoais || this.dados_pessoais),
        JSON.stringify(data.dados_profissionais || this.dados_profissionais),
        JSON.stringify(data.dados_financeiros || this.dados_financeiros),
        data.role || this.role,
        data.status || this.status,
        this.id
      ]);

      client.release();

      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      throw error;
    }
  }

  // Deletar funcionário
  async delete() {
    try {
      const client = await pool.connect();
      
      await client.query('DELETE FROM employees WHERE id = $1', [this.id]);
      
      client.release();

      return true;
    } catch (error) {
      console.error('Erro ao deletar funcionário:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  isActive() {
    return this.status === 'ativo';
  }

  isAdmin() {
    return ['admin', 'superadmin'].includes(this.role);
  }

  getFullName() {
    return this.dados_pessoais?.nome || this.email;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      dados_pessoais: this.dados_pessoais,
      dados_profissionais: this.dados_profissionais,
      dados_financeiros: this.dados_financeiros,
      role: this.role,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Estatísticas dos funcionários
  static async getStats() {
    try {
      const client = await pool.connect();
      
      const result = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
          COUNT(CASE WHEN status = 'inativo' THEN 1 END) as inativos,
          COUNT(CASE WHEN status = 'afastado' THEN 1 END) as afastados,
          COUNT(CASE WHEN status = 'desligado' THEN 1 END) as desligados,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
          COUNT(CASE WHEN role = 'manager' THEN 1 END) as managers,
          COUNT(CASE WHEN role = 'employee' THEN 1 END) as employees
        FROM employees
      `);

      client.release();

      return {
        total: parseInt(result.rows[0].total),
        por_status: {
          ativos: parseInt(result.rows[0].ativos),
          inativos: parseInt(result.rows[0].inativos),
          afastados: parseInt(result.rows[0].afastados),
          desligados: parseInt(result.rows[0].desligados)
        },
        por_role: {
          admins: parseInt(result.rows[0].admins),
          managers: parseInt(result.rows[0].managers),
          employees: parseInt(result.rows[0].employees)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos funcionários:', error);
      throw error;
    }
  }
}

export default Employee;