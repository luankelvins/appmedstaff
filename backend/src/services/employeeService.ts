import db from '../config/database'
import type { Employee as DBEmployee } from '../types/database'
import { TimeInternoForm } from '../types/crm'

export interface Employee {
  id: string
  email: string
  nome_completo: string
  cargo?: string
  departamento?: string
  telefone?: string
  status: 'ativo' | 'inativo' | 'afastado' | 'desligado'
}

export interface EmployeeOption {
  value: string
  label: string
  email: string
  cargo?: string
  departamento?: string
}

class EmployeeService {
  /**
   * Busca todos os employees ativos
   */
  async getActiveEmployees(): Promise<Employee[]> {
    try {
      const query = `
        SELECT id, email, dados_pessoais, dados_profissionais, status
        FROM employees 
        WHERE status = $1 
        ORDER BY dados_pessoais->>'nome_completo' ASC
      `
      
      const result = await db.query(query, ['ativo'])
      
      return result.rows.map((emp: any) => this.mapEmployeeFromDB(emp))
    } catch (error) {
      console.error('Erro ao buscar employees:', error)
      throw new Error('Falha ao buscar funcionários')
    }
  }

  /**
   * Busca employee por ID
   */
  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const query = `
        SELECT id, email, dados_pessoais, dados_profissionais, status
        FROM employees 
        WHERE id = $1
      `
      
      const result = await db.query(query, [id])
      
      if (result.rows.length === 0) {
        return null // Employee não encontrado
      }

      return this.mapEmployeeFromDB(result.rows[0])
    } catch (error) {
      console.error('Erro ao buscar employee:', error)
      throw new Error('Falha ao buscar funcionário')
    }
  }

  /**
   * Converte employees para opções de seleção
   */
  async getEmployeeOptions(): Promise<EmployeeOption[]> {
    try {
      const employees = await this.getActiveEmployees()
      
      return employees.map(emp => ({
        value: emp.id,
        label: emp.nome_completo,
        email: emp.email,
        cargo: emp.cargo,
        departamento: emp.departamento
      }))
    } catch (error) {
      console.error('Erro ao buscar opções de employees:', error)
      return []
    }
  }

  /**
   * Busca employees por departamento
   */
  async getEmployeesByDepartment(departamento: string): Promise<Employee[]> {
    try {
      const query = `
        SELECT id, email, dados_pessoais, dados_profissionais, status
        FROM employees 
        WHERE status = $1 
        AND dados_profissionais->>'departamento' = $2
        ORDER BY dados_pessoais->>'nome_completo' ASC
      `
      
      const result = await db.query(query, ['ativo', departamento])
      
      return result.rows.map((emp: any) => this.mapEmployeeFromDB(emp))
    } catch (error) {
      console.error('Erro ao buscar employees por departamento:', error)
      throw new Error('Falha ao buscar funcionários do departamento')
    }
  }

  /**
   * Cria um novo employee
   */
  async createEmployee(employeeData: {
    email: string
    dados_pessoais?: any
    dados_profissionais?: any
    dados_contratuais?: any
    dados_bancarios?: any
    documentos?: any
    status?: string
  }): Promise<Employee> {
    try {
      const query = `
        INSERT INTO employees (
          email, dados_pessoais, dados_profissionais, dados_contratuais, 
          dados_bancarios, documentos, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id, email, dados_pessoais, dados_profissionais, status
      `
      
      const values = [
        employeeData.email,
        employeeData.dados_pessoais || {},
        employeeData.dados_profissionais || {},
        employeeData.dados_contratuais || {},
        employeeData.dados_bancarios || {},
        employeeData.documentos || {},
        employeeData.status || 'ativo'
      ]
      
      const result = await db.query(query, values)
      
      return this.mapEmployeeFromDB(result.rows[0])
    } catch (error) {
      console.error('Erro ao criar employee:', error)
      throw new Error('Falha ao criar funcionário')
    }
  }

  /**
   * Atualiza um employee
   */
  async updateEmployee(id: string, employeeData: {
    email?: string
    dados_pessoais?: any
    dados_profissionais?: any
    dados_contratuais?: any
    dados_bancarios?: any
    documentos?: any
    status?: string
  }): Promise<Employee> {
    try {
      const query = `
        UPDATE employees 
        SET 
          email = COALESCE($2, email),
          dados_pessoais = COALESCE($3, dados_pessoais),
          dados_profissionais = COALESCE($4, dados_profissionais),
          dados_contratuais = COALESCE($5, dados_contratuais),
          dados_bancarios = COALESCE($6, dados_bancarios),
          documentos = COALESCE($7, documentos),
          status = COALESCE($8, status),
          updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, dados_pessoais, dados_profissionais, status
      `
      
      const values = [
        id,
        employeeData.email || null,
        employeeData.dados_pessoais || null,
        employeeData.dados_profissionais || null,
        employeeData.dados_contratuais || null,
        employeeData.dados_bancarios || null,
        employeeData.documentos || null,
        employeeData.status || null
      ]
      
      const result = await db.query(query, values)
      
      if (result.rows.length === 0) {
        throw new Error('Funcionário não encontrado')
      }
      
      return this.mapEmployeeFromDB(result.rows[0])
    } catch (error) {
      console.error('Erro ao atualizar employee:', error)
      throw new Error('Falha ao atualizar funcionário')
    }
  }

  /**
   * Remove um employee (soft delete)
   */
  async deleteEmployee(id: string): Promise<void> {
    try {
      const query = `
        UPDATE employees 
        SET status = 'desligado', updated_at = NOW()
        WHERE id = $1
      `
      
      const result = await db.query(query, [id])
      
      if (result.rowCount === 0) {
        throw new Error('Funcionário não encontrado')
      }
    } catch (error) {
      console.error('Erro ao remover employee:', error)
      throw new Error('Falha ao remover funcionário')
    }
  }

  /**
   * Busca todos os funcionários no formato TimeInternoForm
   */
  async getAllEmployeesAsTimeInterno(): Promise<TimeInternoForm[]> {
    try {
      const query = `
        SELECT * FROM employees 
        ORDER BY created_at DESC
      `
      
      const result = await db.query(query)
      return result.rows.map((emp: any) => this.mapTimeInternoFromDB(emp))
    } catch (error) {
      console.error('Erro ao buscar funcionários TimeInterno:', error)
      return []
    }
  }

  /**
   * Busca funcionário por email no formato TimeInternoForm
   */
  async getEmployeeByEmailAsTimeInterno(email: string): Promise<TimeInternoForm | null> {
    try {
      const query = `
        SELECT * FROM employees 
        WHERE dados_pessoais->>'emailPessoal' = $1
        LIMIT 1
      `
      
      const result = await db.query(query, [email])
      
      if (result.rows.length === 0) {
        return null
      }
      
      return this.mapTimeInternoFromDB(result.rows[0])
    } catch (error) {
      console.error('Erro ao buscar funcionário por email TimeInterno:', error)
      return null
    }
  }

  /**
   * Busca funcionário por ID no formato TimeInternoForm
   */
  async getEmployeeByIdAsTimeInterno(id: string): Promise<TimeInternoForm | null> {
    try {
      const query = `
        SELECT * FROM employees 
        WHERE id = $1
        LIMIT 1
      `
      
      const result = await db.query(query, [id])
      
      if (result.rows.length === 0) {
        return null
      }
      
      return this.mapTimeInternoFromDB(result.rows[0])
    } catch (error) {
      console.error('Erro ao buscar funcionário por ID TimeInterno:', error)
      return null
    }
  }

  /**
   * Insere ou atualiza funcionário no formato TimeInternoForm
   */
  async upsertEmployeeAsTimeInterno(employee: TimeInternoForm): Promise<TimeInternoForm | null> {
    try {
      const query = `
        INSERT INTO employees (
          id, numero_registro, dados_pessoais, dados_profissionais,
          jornada_trabalho, aso, dependentes, dados_financeiros,
          documentos_obrigatorios, documentos, anexos_notificacoes,
          anexos, status, responsavel_rh, perfil_editavel, observacoes,
          email
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
        ON CONFLICT (id) DO UPDATE SET
          numero_registro = EXCLUDED.numero_registro,
          dados_pessoais = EXCLUDED.dados_pessoais,
          dados_profissionais = EXCLUDED.dados_profissionais,
          jornada_trabalho = EXCLUDED.jornada_trabalho,
          aso = EXCLUDED.aso,
          dependentes = EXCLUDED.dependentes,
          dados_financeiros = EXCLUDED.dados_financeiros,
          documentos_obrigatorios = EXCLUDED.documentos_obrigatorios,
          documentos = EXCLUDED.documentos,
          anexos_notificacoes = EXCLUDED.anexos_notificacoes,
          anexos = EXCLUDED.anexos,
          status = EXCLUDED.status,
          responsavel_rh = EXCLUDED.responsavel_rh,
          perfil_editavel = EXCLUDED.perfil_editavel,
          observacoes = EXCLUDED.observacoes,
          email = EXCLUDED.email,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `
      
      const result = await db.query(query, [
        employee.id,
        employee.numeroRegistro,
        JSON.stringify(employee.dadosPessoais),
        JSON.stringify(employee.dadosProfissionais),
        JSON.stringify(employee.jornadaTrabalho),
        JSON.stringify(employee.aso),
        JSON.stringify(employee.dependentes),
        JSON.stringify(employee.dadosFinanceiros),
        JSON.stringify(employee.documentosObrigatorios),
        JSON.stringify(employee.documentos),
        JSON.stringify(employee.anexosNotificacoes),
        JSON.stringify(employee.anexos),
        employee.status,
        employee.responsavelRH,
        employee.perfilEditavel,
        employee.observacoes,
        employee.dadosPessoais.emailPessoal
      ])
      
      if (result.rows.length === 0) {
        return null
      }
      
      return this.mapTimeInternoFromDB(result.rows[0])
    } catch (error) {
      console.error('Erro ao inserir/atualizar funcionário TimeInterno:', error)
      return null
    }
  }

  /**
   * Verifica se existem funcionários na base
   */
  async hasEmployees(): Promise<boolean> {
    try {
      const query = `SELECT COUNT(*) as count FROM employees`
      const result = await db.query(query)
      return parseInt(result.rows[0].count) > 0
    } catch (error) {
      console.error('Erro ao verificar funcionários:', error)
      return false
    }
  }

  /**
   * Mapeia dados do employee do banco para o tipo Employee
   */
  private mapEmployeeFromDB(data: any): Employee {
    const dadosPessoais = data.dados_pessoais || {}
    const dadosProfissionais = data.dados_profissionais || {}
    
    return {
      id: data.id,
      email: data.email,
      nome_completo: dadosPessoais.nome_completo || 'Nome não informado',
      cargo: dadosProfissionais.cargo,
      departamento: dadosProfissionais.departamento,
      telefone: dadosPessoais.telefone || dadosPessoais.contato?.telefone,
      status: data.status || 'ativo'
    }
  }

  /**
   * Mapeia dados do banco para o tipo TimeInternoForm
   */
  private mapTimeInternoFromDB(data: any): TimeInternoForm {
    return {
      id: data.id,
      numeroRegistro: data.numero_registro,
      dadosPessoais: data.dados_pessoais,
      dadosProfissionais: data.dados_profissionais,
      jornadaTrabalho: data.jornada_trabalho,
      aso: data.aso,
      dependentes: data.dependentes || [],
      dadosFinanceiros: data.dados_financeiros,
      documentosObrigatorios: data.documentos_obrigatorios || [],
      documentos: data.documentos || [],
      anexosNotificacoes: data.anexos_notificacoes || [],
      anexos: data.anexos || [],
      status: data.status,
      responsavelRH: data.responsavel_rh,
      perfilEditavel: data.perfil_editavel,
      observacoes: data.observacoes
    }
  }
}

export const employeeService = new EmployeeService()