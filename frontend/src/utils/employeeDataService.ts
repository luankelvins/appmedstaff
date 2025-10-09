import db from '../config/database'

// Interfaces para os dados do organograma
export interface EmployeeHierarchy {
  id: string
  nome: string
  cargo: string
  departamento: string
  email: string
  nivel_hierarquico: number
  ordem_organograma: number
  gestor_id: string | null
  gestor_nome?: string
  gestor_cargo?: string
  subordinados?: EmployeeHierarchy[]
  
  // Dados adicionais para organograma
  dados_pessoais?: {
    nome?: string
    telefone?: string
    foto?: string
  }
  dados_profissionais?: {
    cargo?: string
    departamento?: string
    data_admissao?: string
  }
  status?: string
  created_at?: string
}

// Interface para dados administrativos completos
export interface EmployeeAdministrative {
  id: string
  nome: string
  email: string
  cargo: string
  departamento: string
  role: string
  nivel_acesso: string
  status: string
  created_at: string
  updated_at: string
  
  // Campos diretos da tabela (para compatibilidade)
  cpf?: string
  rg?: string
  data_nascimento?: string
  telefone?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  data_admissao?: string
  salario?: number
  banco?: string
  agencia?: string
  conta?: string
  pix?: string
  
  // Dados pessoais (JSONB)
  dados_pessoais: {
    nome?: string
    cpf?: string
    rg?: string
    data_nascimento?: string
    telefone?: string
    endereco?: string
    cidade?: string
    estado?: string
    cep?: string
    estado_civil?: string
    nacionalidade?: string
    foto?: string
  }
  
  // Dados profissionais (JSONB)
  dados_profissionais: {
    role?: string
    cargo?: string
    departamento?: string
    data_admissao?: string
    tipo_contrato?: string
    carga_horaria?: string
    supervisor?: string
    nivel_experiencia?: string
    nivel_acesso?: string
  }
  
  // Dados financeiros (JSONB)
  dados_financeiros: {
    salario?: number
    beneficios?: string[]
    conta_bancaria?: string
    banco?: string
    agencia?: string
    conta?: string
    pix?: string
    vale_transporte?: boolean
    vale_refeicao?: boolean
  }
  
  // Dados de hierarquia
  nivel_hierarquico: number
  ordem_organograma: number
  gestor_id: string | null
  gestor_nome?: string
}

// Interface para dados do organograma
export interface OrganogramData {
  ceo: EmployeeHierarchy
  totalEmployees: number
  departmentCounts: Record<string, number>
  hierarchyLevels: Record<number, EmployeeHierarchy[]>
}

class EmployeeDataService {
  /**
   * Busca dados hierárquicos para o organograma
   */
  async getOrganogramData(): Promise<OrganogramData> {
    try {
      const result = await db.query(`
        SELECT 
          id,
          nome,
          cargo,
          departamento,
          email,
          nivel_hierarquico,
          ordem_organograma,
          gestor_id,
          dados_pessoais,
          dados_profissionais,
          dados_financeiros,
          status,
          created_at,
          updated_at
        FROM employees 
        WHERE status = 'ativo'
        ORDER BY nivel_hierarquico, departamento, ordem_organograma
      `)

      const employees = result.rows

      // Construir hierarquia
      const hierarchy = this.buildHierarchy(employees || [])
      const ceo = hierarchy.find(emp => emp.nivel_hierarquico === 1)
      
      if (!ceo) {
        throw new Error('CEO não encontrado na estrutura organizacional')
      }

      // Calcular estatísticas
      const totalEmployees = employees?.length || 0
      const departmentCounts = this.calculateDepartmentCounts(employees || [])
      const hierarchyLevels = this.groupByHierarchyLevel(employees || [])

      return {
        ceo,
        totalEmployees,
        departmentCounts,
        hierarchyLevels
      }
    } catch (error) {
      console.error('Erro ao buscar dados do organograma:', error)
      throw error
    }
  }

  /**
   * Busca dados administrativos completos
   */
  async getAdministrativeData(filters?: {
    departamento?: string
    cargo?: string
    status?: string
    search?: string
  }): Promise<EmployeeAdministrative[]> {
    try {
      let whereConditions: string[] = []
      let queryParams: any[] = []
      let paramIndex = 1

      // Aplicar filtros
      if (filters?.departamento) {
        whereConditions.push(`departamento = $${paramIndex}`)
        queryParams.push(filters.departamento)
        paramIndex++
      }
      if (filters?.cargo) {
        whereConditions.push(`cargo = $${paramIndex}`)
        queryParams.push(filters.cargo)
        paramIndex++
      }
      if (filters?.status) {
        whereConditions.push(`status = $${paramIndex}`)
        queryParams.push(filters.status)
        paramIndex++
      }
      if (filters?.search) {
        whereConditions.push(`(nome ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`)
        queryParams.push(`%${filters.search}%`)
        paramIndex++
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

      const result = await db.query(`
        SELECT 
          id,
          nome,
          email,
          cargo,
          departamento,
          role,
          nivel_acesso,
          status,
          created_at,
          updated_at,
          dados_pessoais,
          dados_profissionais,
          dados_financeiros,
          nivel_hierarquico,
          ordem_organograma,
          gestor_id,
          cpf,
          rg,
          data_nascimento,
          telefone,
          endereco,
          cidade,
          estado,
          cep,
          data_admissao,
          salario,
          banco,
          agencia,
          conta,
          pix
        FROM employees 
        ${whereClause}
        ORDER BY departamento, cargo, nome
      `, queryParams)

      const employees = result.rows

      // Buscar nomes dos gestores
      const employeesWithManagers = await this.enrichWithManagerData(employees || [])

      return employeesWithManagers
    } catch (error) {
      console.error('Erro ao buscar dados administrativos:', error)
      throw error
    }
  }

  /**
   * Busca funcionário por ID
   */
  async getEmployeeById(id: string): Promise<EmployeeAdministrative | null> {
    try {
      const result = await db.query(`
        SELECT 
          id,
          nome,
          email,
          cargo,
          departamento,
          role,
          nivel_acesso,
          status,
          created_at,
          updated_at,
          dados_pessoais,
          dados_profissionais,
          dados_financeiros,
          nivel_hierarquico,
          ordem_organograma,
          gestor_id
        FROM employees 
        WHERE id = $1
      `, [id])

      if (result.rows.length === 0) return null
      const employee = result.rows[0]

      // Buscar nome do gestor se existir
      const enriched = await this.enrichWithManagerData([employee])
      return enriched[0] || null
    } catch (error) {
      console.error('Erro ao buscar funcionário por ID:', error)
      throw error
    }
  }

  /**
   * Busca funcionários por departamento
   */
  async getEmployeesByDepartment(departamento: string): Promise<EmployeeAdministrative[]> {
    return this.getAdministrativeData({ departamento })
  }

  /**
   * Busca estatísticas dos funcionários
   */
  async getEmployeeStats(): Promise<{
    total: number
    byDepartment: Record<string, number>
    byRole: Record<string, number>
    byStatus: Record<string, number>
    byHierarchyLevel: Record<number, number>
  }> {
    try {
      const result = await db.query(`
        SELECT departamento, role, status, nivel_hierarquico
        FROM employees
      `)

      const employees = result.rows

      const stats = {
        total: employees?.length || 0,
        byDepartment: this.calculateDepartmentCounts(employees || []),
        byRole: this.groupByField(employees || [], 'role'),
        byStatus: this.groupByField(employees || [], 'status'),
        byHierarchyLevel: this.groupByField(employees || [], 'nivel_hierarquico')
      }

      return stats
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  }

  // Métodos auxiliares privados

  private buildHierarchy(employees: any[]): EmployeeHierarchy[] {
    const employeeMap = new Map<string, EmployeeHierarchy>()
    
    // Criar mapa de funcionários com dados completos
    employees.forEach((emp: any) => {
      employeeMap.set(emp.id, {
        id: emp.id,
        nome: emp.nome || emp.dados_pessoais?.nome || 'Nome não informado',
        cargo: emp.cargo || emp.dados_profissionais?.cargo || 'Cargo não informado',
        departamento: emp.departamento || emp.dados_profissionais?.departamento || 'Departamento não informado',
        email: emp.email,
        nivel_hierarquico: emp.nivel_hierarquico || 0,
        ordem_organograma: emp.ordem_organograma || 0,
        gestor_id: emp.gestor_id,
        subordinados: [],
        
        // Dados adicionais
        dados_pessoais: emp.dados_pessoais,
        dados_profissionais: emp.dados_profissionais,
        status: emp.status,
        created_at: emp.created_at
      })
    })

    // Construir hierarquia
    const rootEmployees: EmployeeHierarchy[] = []
    
    employees.forEach((emp: any) => {
      const employee = employeeMap.get(emp.id)!
      
      if (emp.gestor_id && employeeMap.has(emp.gestor_id)) {
        const manager = employeeMap.get(emp.gestor_id)!
        manager.subordinados = manager.subordinados || []
        manager.subordinados.push(employee)
        
        // Adicionar dados do gestor
        employee.gestor_nome = manager.nome
        employee.gestor_cargo = manager.cargo
      } else {
        rootEmployees.push(employee)
      }
    })

    return rootEmployees
  }

  private async enrichWithManagerData(employees: any[]): Promise<EmployeeAdministrative[]> {
    const managerIds = employees
      .map((emp: any) => emp.gestor_id)
      .filter((id: any) => id !== null)
      .filter((id: any, index: number, arr: any[]) => arr.indexOf(id) === index) // unique

    let managers: any[] = []
    if (managerIds.length > 0) {
      try {
        const placeholders = managerIds.map((_, index) => `$${index + 1}`).join(', ')
        const result = await db.query(`
          SELECT id, nome, cargo, dados_pessoais, dados_profissionais
          FROM employees
          WHERE id IN (${placeholders})
        `, managerIds)
        
        managers = result.rows
      } catch (error) {
        console.error('Erro ao buscar gestores:', error)
      }
    }

    const managerMap = new Map(managers.map((m: any) => [m.id, m]))

    return employees.map((emp: any) => {
      const manager = emp.gestor_id ? managerMap.get(emp.gestor_id) : null
      
      return {
        id: emp.id,
        nome: emp.nome || emp.dados_pessoais?.nome || 'Nome não informado',
        email: emp.email,
        cargo: emp.cargo || emp.dados_profissionais?.cargo || 'Cargo não informado',
        departamento: emp.departamento || emp.dados_profissionais?.departamento || 'Departamento não informado',
        role: emp.role || emp.dados_profissionais?.role || 'Role não informado',
        nivel_acesso: emp.nivel_acesso || emp.dados_profissionais?.nivel_acesso || 'Não definido',
        status: emp.status,
        created_at: emp.created_at,
        updated_at: emp.updated_at,
        
        // Campos diretos (compatibilidade)
        cpf: emp.cpf || emp.dados_pessoais?.cpf,
        rg: emp.rg || emp.dados_pessoais?.rg,
        data_nascimento: emp.data_nascimento || emp.dados_pessoais?.data_nascimento,
        telefone: emp.telefone || emp.dados_pessoais?.telefone,
        endereco: emp.endereco || emp.dados_pessoais?.endereco,
        cidade: emp.cidade || emp.dados_pessoais?.cidade,
        estado: emp.estado || emp.dados_pessoais?.estado,
        cep: emp.cep || emp.dados_pessoais?.cep,
        data_admissao: emp.data_admissao || emp.dados_profissionais?.data_admissao,
        salario: emp.salario || emp.dados_financeiros?.salario,
        banco: emp.banco || emp.dados_financeiros?.banco,
        agencia: emp.agencia || emp.dados_financeiros?.agencia,
        conta: emp.conta || emp.dados_financeiros?.conta,
        pix: emp.pix || emp.dados_financeiros?.pix,
        
        // Dados JSONB completos
        dados_pessoais: emp.dados_pessoais || {},
        dados_profissionais: emp.dados_profissionais || {},
        dados_financeiros: emp.dados_financeiros || {},
        
        // Dados hierárquicos
        nivel_hierarquico: emp.nivel_hierarquico || 0,
        ordem_organograma: emp.ordem_organograma || 0,
        gestor_id: emp.gestor_id,
        gestor_nome: manager ? (manager.nome || manager.dados_pessoais?.nome) : undefined
      }
    })
  }

  private calculateDepartmentCounts(employees: any[]): Record<string, number> {
    return employees.reduce((acc: Record<string, number>, emp: any) => {
      const dept = emp.departamento || 'Não definido'
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {})
  }

  private groupByHierarchyLevel(employees: any[]): Record<number, EmployeeHierarchy[]> {
    return employees.reduce((acc: Record<number, EmployeeHierarchy[]>, emp: any) => {
      const level = emp.nivel_hierarquico || 0
      acc[level] = acc[level] || []
      acc[level].push(emp)
      return acc
    }, {})
  }

  private groupByField(employees: any[], field: string): Record<string, number> {
    return employees.reduce((acc: Record<string, number>, emp: any) => {
      const value = emp[field] || 'Não definido'
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {})
  }
}

export const employeeDataService = new EmployeeDataService()