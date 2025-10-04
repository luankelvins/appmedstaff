import { supabaseService } from './supabaseService'

export interface InternalTeamMember {
  id: string
  name: string
  email: string
  position: string
  department: string
  role: string
  avatar?: string
  phone?: string
  startDate: string
  status: 'active' | 'inactive' | 'on_leave'
  manager?: string
  directReports?: string[]
  permissions: string[]
  workSchedule?: {
    id: string
    name: string
    startTime: string
    endTime: string
    workDays: number[]
  }
  location?: {
    office: string
    address: string
    isRemote: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: string
  name: string
  description: string
  manager: string
  parentDepartment?: string
  budget?: number
  employeeCount: number
  location?: string
  createdAt: string
  updatedAt: string
}

export interface OrganizationHierarchy {
  departments: Department[]
  employees: InternalTeamMember[]
  hierarchy: {
    [departmentId: string]: {
      manager: InternalTeamMember
      employees: InternalTeamMember[]
      subDepartments: Department[]
    }
  }
}

class InternalTeamService {
  // Buscar todos os membros do time interno
  async getInternalTeamMembers(): Promise<InternalTeamMember[]> {
    try {
      // Simulação - em produção, buscaria do Supabase
      const mockMembers: InternalTeamMember[] = [
        {
          id: '1',
          name: 'Ana Silva',
          email: 'ana.silva@medstaff.com.br',
          position: 'Gerente de RH',
          department: 'Recursos Humanos',
          role: 'hr_manager',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          phone: '(11) 99999-0001',
          startDate: '2022-01-15',
          status: 'active',
          permissions: ['admin.access', 'admin.dashboard.view', 'timetracking.admin'],
          workSchedule: {
            id: 'schedule_1',
            name: 'Horário Comercial',
            startTime: '08:00',
            endTime: '18:00',
            workDays: [1, 2, 3, 4, 5]
          },
          location: {
            office: 'Sede São Paulo',
            address: 'Av. Paulista, 1000',
            isRemote: false
          },
          createdAt: '2022-01-15T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        },
        {
          id: '2',
          name: 'Carlos Santos',
          email: 'carlos.santos@medstaff.com.br',
          position: 'Analista de RH',
          department: 'Recursos Humanos',
          role: 'hr_analyst',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          phone: '(11) 99999-0002',
          startDate: '2022-03-01',
          status: 'active',
          manager: '1',
          permissions: ['admin.access', 'admin.dashboard.view', 'timetracking.view'],
          workSchedule: {
            id: 'schedule_1',
            name: 'Horário Comercial',
            startTime: '08:00',
            endTime: '18:00',
            workDays: [1, 2, 3, 4, 5]
          },
          location: {
            office: 'Sede São Paulo',
            address: 'Av. Paulista, 1000',
            isRemote: false
          },
          createdAt: '2022-03-01T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        },
        {
          id: '3',
          name: 'Maria Oliveira',
          email: 'maria.oliveira@medstaff.com.br',
          position: 'Gerente Comercial',
          department: 'Comercial',
          role: 'manager',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          phone: '(11) 99999-0003',
          startDate: '2021-08-15',
          status: 'active',
          permissions: ['dashboard.view', 'activities.commercial.view', 'timetracking.view'],
          workSchedule: {
            id: 'schedule_2',
            name: 'Horário Flexível',
            startTime: '09:00',
            endTime: '19:00',
            workDays: [1, 2, 3, 4, 5]
          },
          location: {
            office: 'Sede São Paulo',
            address: 'Av. Paulista, 1000',
            isRemote: true
          },
          createdAt: '2021-08-15T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        },
        {
          id: '4',
          name: 'João Pereira',
          email: 'joao.pereira@medstaff.com.br',
          position: 'Desenvolvedor Sênior',
          department: 'Tecnologia',
          role: 'employee',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          phone: '(11) 99999-0004',
          startDate: '2023-02-01',
          status: 'active',
          manager: '5',
          permissions: ['dashboard.view', 'tasks.view', 'timetracking.view'],
          workSchedule: {
            id: 'schedule_3',
            name: 'Horário Tech',
            startTime: '10:00',
            endTime: '19:00',
            workDays: [1, 2, 3, 4, 5]
          },
          location: {
            office: 'Sede São Paulo',
            address: 'Av. Paulista, 1000',
            isRemote: true
          },
          createdAt: '2023-02-01T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        },
        {
          id: '5',
          name: 'Roberto Lima',
          email: 'roberto.lima@medstaff.com.br',
          position: 'CTO',
          department: 'Tecnologia',
          role: 'manager',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
          phone: '(11) 99999-0005',
          startDate: '2020-01-01',
          status: 'active',
          directReports: ['4'],
          permissions: ['dashboard.view', 'admin.access', 'timetracking.admin'],
          workSchedule: {
            id: 'schedule_2',
            name: 'Horário Flexível',
            startTime: '09:00',
            endTime: '19:00',
            workDays: [1, 2, 3, 4, 5]
          },
          location: {
            office: 'Sede São Paulo',
            address: 'Av. Paulista, 1000',
            isRemote: true
          },
          createdAt: '2020-01-01T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        }
      ]

      return mockMembers
    } catch (error) {
      console.error('Erro ao buscar membros do time interno:', error)
      throw error
    }
  }

  // Buscar membro específico por ID
  async getTeamMemberById(id: string): Promise<InternalTeamMember | null> {
    try {
      const members = await this.getInternalTeamMembers()
      return members.find(member => member.id === id) || null
    } catch (error) {
      console.error('Erro ao buscar membro por ID:', error)
      throw error
    }
  }

  // Buscar departamentos
  async getDepartments(): Promise<Department[]> {
    try {
      const mockDepartments: Department[] = [
        {
          id: 'dept_1',
          name: 'Recursos Humanos',
          description: 'Gestão de pessoas e desenvolvimento organizacional',
          manager: '1',
          employeeCount: 2,
          location: 'Sede São Paulo',
          createdAt: '2020-01-01T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'dept_2',
          name: 'Comercial',
          description: 'Vendas e relacionamento com clientes',
          manager: '3',
          employeeCount: 1,
          location: 'Sede São Paulo',
          createdAt: '2020-01-01T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'dept_3',
          name: 'Tecnologia',
          description: 'Desenvolvimento e infraestrutura',
          manager: '5',
          employeeCount: 2,
          location: 'Sede São Paulo',
          createdAt: '2020-01-01T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        }
      ]

      return mockDepartments
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error)
      throw error
    }
  }

  // Buscar hierarquia organizacional completa
  async getOrganizationHierarchy(): Promise<OrganizationHierarchy> {
    try {
      const [departments, employees] = await Promise.all([
        this.getDepartments(),
        this.getInternalTeamMembers()
      ])

      const hierarchy: OrganizationHierarchy['hierarchy'] = {}

      departments.forEach(dept => {
        const manager = employees.find(emp => emp.id === dept.manager)
        const deptEmployees = employees.filter(emp => emp.department === dept.name && emp.id !== dept.manager)
        const subDepartments = departments.filter(subDept => subDept.parentDepartment === dept.id)

        if (manager) {
          hierarchy[dept.id] = {
            manager,
            employees: deptEmployees,
            subDepartments
          }
        }
      })

      return {
        departments,
        employees,
        hierarchy
      }
    } catch (error) {
      console.error('Erro ao buscar hierarquia organizacional:', error)
      throw error
    }
  }

  // Atualizar membro do time
  async updateTeamMember(id: string, updates: Partial<InternalTeamMember>): Promise<InternalTeamMember> {
    try {
      // Simulação - em produção, atualizaria no Supabase
      const member = await this.getTeamMemberById(id)
      if (!member) {
        throw new Error('Membro não encontrado')
      }

      const updatedMember = {
        ...member,
        ...updates,
        updatedAt: new Date().toISOString()
      }

      console.log('Membro atualizado:', updatedMember)
      return updatedMember
    } catch (error) {
      console.error('Erro ao atualizar membro:', error)
      throw error
    }
  }

  // Criar novo membro do time
  async createTeamMember(memberData: Omit<InternalTeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<InternalTeamMember> {
    try {
      const newMember: InternalTeamMember = {
        ...memberData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('Novo membro criado:', newMember)
      return newMember
    } catch (error) {
      console.error('Erro ao criar membro:', error)
      throw error
    }
  }

  // Buscar membros por departamento
  async getTeamMembersByDepartment(departmentName: string): Promise<InternalTeamMember[]> {
    try {
      const members = await this.getInternalTeamMembers()
      return members.filter(member => member.department === departmentName)
    } catch (error) {
      console.error('Erro ao buscar membros por departamento:', error)
      throw error
    }
  }

  // Buscar subordinados diretos de um gerente
  async getDirectReports(managerId: string): Promise<InternalTeamMember[]> {
    try {
      const members = await this.getInternalTeamMembers()
      return members.filter(member => member.manager === managerId)
    } catch (error) {
      console.error('Erro ao buscar subordinados diretos:', error)
      throw error
    }
  }
}

export const internalTeamService = new InternalTeamService()