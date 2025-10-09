import { TimeInternoForm } from '../types/crm'
import { UserProfile } from '../types/profile'
import { employeeService } from './employeeService'

// Dados de exemplo para inicialização do banco (apenas para desenvolvimento)
const sampleEmployeesData: TimeInternoForm[] = [
  {
    id: '1',
    numeroRegistro: 'EMP001',
    dadosPessoais: {
      nome: 'João Silva',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      dataNascimento: '1985-03-15',
      estadoCivil: 'Casado',
      endereco: {
        cep: '01234-567',
        logradouro: 'Rua das Flores',
        numero: '123',
        complemento: 'Apto 45',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      },
      telefone: '+55 11 99999-9999',
      emailPessoal: 'joao.silva@medstaff.com.br',
      alergias: 'Nenhuma alergia conhecida',
      contatoEmergencia: {
        nome: 'Maria Silva',
        telefone: '+55 11 88888-8888',
        parentesco: 'Esposa',
        email: 'maria.silva@email.com'
      }
    },
    dadosProfissionais: {
      cargo: 'Gerente Comercial',
      departamento: 'Comercial',
      gestorResponsavel: 'Maria Santos',
      dataAdmissao: '2020-01-15',
      salario: 8500.00,
      regime: 'clt'
    },
    jornadaTrabalho: {
      escala: 'Segunda a Sexta',
      cargaHoraria: 40,
      horarioEntrada: '08:00',
      horarioSaida: '17:00',
      intervalos: '12:00-13:00'
    },
    aso: {
      admissional: {
        data: '2020-01-10',
        medico: 'Dr. Carlos Medeiros'
      },
      periodico: {
        data: '2024-01-10',
        medico: 'Dr. Carlos Medeiros',
        proximaData: '2025-01-10'
      }
    },
    dependentes: [
      {
        nome: 'Pedro Silva',
        dataNascimento: '2010-05-20',
        grauParentesco: 'Filho',
        cpf: '987.654.321-00'
      }
    ],
    dadosFinanceiros: {
      salarioBase: 8500.00,
      beneficios: [
        { tipo: 'Vale Refeição', valor: 600.00 },
        { tipo: 'Vale Transporte', valor: 200.00 },
        { tipo: 'Plano de Saúde', valor: 350.00 }
      ],
      dadosBancarios: {
        banco: '001 - Banco do Brasil',
        agencia: '1234-5',
        conta: '12345-6',
        tipoConta: 'corrente',
        pix: 'joao.silva@medstaff.com.br'
      }
    },
    documentosObrigatorios: [],
    documentos: [],
    anexosNotificacoes: [],
    anexos: [],
    status: 'ativo',
    responsavelRH: 'Ana Costa',
    perfilEditavel: true,
    observacoes: 'Membro do time interno exemplar com excelente desempenho comercial.'
  },
  {
    id: '2',
    numeroRegistro: 'EMP002',
    dadosPessoais: {
      nome: 'Maria Santos',
      cpf: '987.654.321-00',
      rg: '98.765.432-1',
      dataNascimento: '1980-07-22',
      estadoCivil: 'Solteira',
      endereco: {
        cep: '04567-890',
        logradouro: 'Av. Paulista',
        numero: '1000',
        complemento: 'Sala 1001',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP'
      },
      telefone: '+55 11 88888-8888',
      emailPessoal: 'maria.santos@medstaff.com.br',
      alergias: 'Alergia a frutos do mar',
      contatoEmergencia: {
        nome: 'José Santos',
        telefone: '+55 11 77777-7777',
        parentesco: 'Pai',
        email: 'jose.santos@email.com'
      }
    },
    dadosProfissionais: {
      cargo: 'Gerente de Estratégia e Planejamento',
      departamento: 'Diretoria Executiva',
      gestorResponsavel: 'Carlos Silva',
      dataAdmissao: '2019-03-01',
      salario: 12000.00,
      regime: 'clt'
    },
    jornadaTrabalho: {
      escala: 'Segunda a Sexta',
      cargaHoraria: 40,
      horarioEntrada: '08:30',
      horarioSaida: '17:30',
      intervalos: '12:00-13:00'
    },
    aso: {
      admissional: {
        data: '2019-02-25',
        medico: 'Dra. Ana Oliveira'
      },
      periodico: {
        data: '2024-02-25',
        medico: 'Dra. Ana Oliveira',
        proximaData: '2025-02-25'
      }
    },
    dependentes: [],
    dadosFinanceiros: {
      salarioBase: 12000.00,
      beneficios: [
        { tipo: 'Vale Refeição', valor: 800.00 },
        { tipo: 'Vale Transporte', valor: 250.00 },
        { tipo: 'Plano de Saúde', valor: 450.00 },
        { tipo: 'Seguro de Vida', valor: 100.00 }
      ],
      dadosBancarios: {
        banco: '341 - Itaú',
        agencia: '5678-9',
        conta: '98765-4',
        tipoConta: 'corrente',
        pix: 'maria.santos@medstaff.com.br'
      }
    },
    documentosObrigatorios: [],
    documentos: [],
    anexosNotificacoes: [],
    anexos: [],
    status: 'ativo',
    responsavelRH: 'Ana Costa',
    perfilEditavel: true,
    observacoes: 'Liderança estratégica excepcional, responsável por importantes projetos da empresa.'
  },
  {
    id: '3',
    numeroRegistro: 'EMP003',
    dadosPessoais: {
      nome: 'Pedro Costa',
      cpf: '456.789.123-00',
      rg: '45.678.912-3',
      dataNascimento: '1992-11-08',
      estadoCivil: 'Solteiro',
      endereco: {
        cep: '02345-678',
        logradouro: 'Rua Augusta',
        numero: '500',
        complemento: '',
        bairro: 'Consolação',
        cidade: 'São Paulo',
        estado: 'SP'
      },
      telefone: '+55 11 77777-7777',
      emailPessoal: 'pedro.costa@medstaff.com.br',
      alergias: 'Rinite alérgica',
      contatoEmergencia: {
        nome: 'Ana Costa',
        telefone: '+55 11 66666-6666',
        parentesco: 'Mãe',
        email: 'ana.costa@email.com'
      }
    },
    dadosProfissionais: {
      cargo: 'Analista Comercial',
      departamento: 'Comercial',
      gestorResponsavel: 'João Silva',
      dataAdmissao: '2021-06-01',
      salario: 5500.00,
      regime: 'clt'
    },
    jornadaTrabalho: {
      escala: 'Segunda a Sexta',
      cargaHoraria: 40,
      horarioEntrada: '08:00',
      horarioSaida: '17:00',
      intervalos: '12:00-13:00'
    },
    aso: {
      admissional: {
        data: '2021-05-25',
        medico: 'Dr. Roberto Lima'
      },
      periodico: {
        data: '2024-05-25',
        medico: 'Dr. Roberto Lima',
        proximaData: '2025-05-25'
      }
    },
    dependentes: [],
    dadosFinanceiros: {
      salarioBase: 5500.00,
      beneficios: [
        { tipo: 'Vale Refeição', valor: 500.00 },
        { tipo: 'Vale Transporte', valor: 180.00 },
        { tipo: 'Plano de Saúde', valor: 280.00 }
      ],
      dadosBancarios: {
        banco: '237 - Bradesco',
        agencia: '9876-5',
        conta: '54321-0',
        tipoConta: 'corrente',
        pix: 'pedro.costa@medstaff.com.br'
      }
    },
    documentosObrigatorios: [],
    documentos: [],
    anexosNotificacoes: [],
    anexos: [],
    status: 'ativo',
    responsavelRH: 'Ana Costa',
    perfilEditavel: true,
    observacoes: 'Analista dedicado com grande potencial de crescimento.'
  }
]

export interface EmployeeProfileIntegration {
  employeeData: TimeInternoForm | null
  isEmployee: boolean
  integrationStatus: 'success' | 'not_found' | 'error'
}

export const employeeIntegrationService = {
  /**
   * Inicializa dados de exemplo no PostgreSQL (apenas para desenvolvimento)
   */
  async initializeSampleData(): Promise<void> {
    try {
      const hasExistingEmployees = await employeeService.hasEmployees()
      
      // Se já existem membros do time interno, não inicializa novamente
      if (hasExistingEmployees) {
        console.log('Dados de membros do time interno já existem no banco')
        return
      }

      console.log('Inicializando dados de exemplo...')
      
      // Insere dados de exemplo
      for (const employee of sampleEmployeesData) {
        await employeeService.upsertEmployeeAsTimeInterno(employee)
      }
      
      console.log('Dados de exemplo inicializados com sucesso')
    } catch (error) {
      console.error('Erro ao inicializar dados de exemplo:', error)
    }
  },
  /**
   * Busca dados do membro do time interno baseado no email
   */
  async getEmployeeDataByEmail(email: string): Promise<EmployeeProfileIntegration> {
    try {
      // Busca membro do time interno pelo email pessoal no PostgreSQL
      const employeeData = await employeeService.getEmployeeByEmailAsTimeInterno(email)

      if (employeeData) {
        return {
          employeeData,
          isEmployee: true,
          integrationStatus: 'success'
        }
      }

      return {
        employeeData: null,
        isEmployee: false,
        integrationStatus: 'not_found'
      }
    } catch (error) {
      console.error('Erro ao buscar dados do membro do time interno:', error)
      return {
        employeeData: null,
        isEmployee: false,
        integrationStatus: 'error'
      }
    }
  },

  /**
   * Integra dados do membro do time interno com o perfil do usuário
   */
  integrateEmployeeDataToProfile(
    currentProfile: UserProfile, 
    employeeData: TimeInternoForm
  ): UserProfile {
    return {
      ...currentProfile,
      // Dados pessoais do membro do time interno
      name: employeeData.dadosPessoais.nome,
      phone: employeeData.dadosPessoais.telefone,
      document: employeeData.dadosPessoais.cpf,
      birthDate: employeeData.dadosPessoais.dataNascimento,
      address: {
        street: employeeData.dadosPessoais.endereco.logradouro,
        number: employeeData.dadosPessoais.endereco.numero,
        complement: employeeData.dadosPessoais.endereco.complemento || '',
        neighborhood: employeeData.dadosPessoais.endereco.bairro,
        city: employeeData.dadosPessoais.endereco.cidade,
        state: employeeData.dadosPessoais.endereco.estado,
        zipCode: employeeData.dadosPessoais.endereco.cep,
        country: 'Brasil'
      },
      
      // Dados profissionais
      role: employeeData.dadosProfissionais.cargo,
      department: employeeData.dadosProfissionais.departamento,
      position: employeeData.dadosProfissionais.cargo,
      hireDate: employeeData.dadosProfissionais.dataAdmissao,
      manager: employeeData.dadosProfissionais.gestorResponsavel,
      
      // Metadados de integração
      employeeId: employeeData.id,
      
      // Manter dados existentes do perfil que não estão no TimeInternoForm
      email: currentProfile.email,
      avatar: currentProfile.avatar,
      permissions: currentProfile.permissions,
      preferences: currentProfile.preferences,
      security: currentProfile.security,
      createdAt: currentProfile.createdAt,
      updatedAt: new Date().toISOString()
    }
  },

  /**
   * Busca todos os membros do time interno (para uso no organograma)
   */
  async getAllEmployees(): Promise<TimeInternoForm[]> {
    try {
      return await employeeService.getAllEmployeesAsTimeInterno()
    } catch (error) {
      console.error('Erro ao buscar todos os membros do time interno:', error)
      return []
    }
  },

  /**
   * Busca membro do time interno por ID
   */
  async getEmployeeById(id: string): Promise<TimeInternoForm | null> {
    try {
      return await employeeService.getEmployeeByIdAsTimeInterno(id)
    } catch (error) {
      console.error('Erro ao buscar membro do time interno por ID:', error)
      return null
    }
  },

  /**
   * Atualiza dados do membro do time interno
   */
  async updateEmployeeData(id: string, data: Partial<TimeInternoForm>): Promise<TimeInternoForm | null> {
    try {
      return await employeeService.upsertEmployeeAsTimeInterno({ id, ...data } as TimeInternoForm)
    } catch (error) {
      console.error('Erro ao atualizar dados do membro do time interno:', error)
      return null
    }
  },

  /**
   * Verifica se um email pertence a um membro do time interno
   */
  async isEmployeeEmail(email: string): Promise<boolean> {
    try {
      const result = await this.getEmployeeDataByEmail(email)
      return result.isEmployee
    } catch (error) {
      console.error('Erro ao verificar email do membro do time interno:', error)
      return false
    }
  },

  /**
   * Obtém um perfil de usuário integrado com dados do membro do time interno
   */
  async getIntegratedProfile(email: string, baseProfile?: UserProfile): Promise<UserProfile> {
    const employeeIntegration = await this.getEmployeeDataByEmail(email)
    
    // Se não encontrou dados do membro do time interno, retorna perfil base ou mock
    if (!employeeIntegration.employeeData) {
      return baseProfile || {
        id: 'user_' + Date.now(),
        name: 'Usuário',
        email: email,
        role: 'Usuário',
        department: 'Geral',
        position: 'Colaborador',
        hireDate: new Date().toISOString().split('T')[0],
        permissions: ['dashboard.view'],
        preferences: {
          theme: 'light',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          notifications: {
            email: { enabled: true, frequency: 'daily', types: { tasks: true, mentions: true, updates: true, security: true, marketing: false } },
            push: { enabled: true, types: { tasks: true, mentions: true, chat: true, updates: false } },
            inApp: { enabled: true, sound: true, desktop: true, types: { tasks: true, mentions: true, chat: true, updates: true, system: true } }
          },
          dashboard: {
            layout: 'grid',
            widgets: [
              { id: 'tasks', enabled: true, position: 1, size: 'medium' },
              { id: 'notifications', enabled: true, position: 2, size: 'small' }
            ],
            defaultView: 'dashboard',
            autoRefresh: true,
            refreshInterval: 300
          },
          privacy: {
            profileVisibility: 'team',
            showEmail: true,
            showPhone: false,
            showBirthDate: false,
            showAddress: false,
            allowDirectMessages: true,
            allowMentions: true,
            shareActivityStatus: true
          }
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: new Date().toISOString(),
          sessionTimeout: 480,
          loginNotifications: true,
          deviceTrust: { enabled: true, trustedDevices: [] }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }

    // Integrar dados do membro do time interno com perfil base
    const defaultProfile: UserProfile = baseProfile || {
      id: 'user_' + employeeIntegration.employeeData.id,
      name: employeeIntegration.employeeData.dadosPessoais.nome,
      email: email,
      role: 'Usuário',
      department: 'Geral',
      position: 'Colaborador',
      hireDate: new Date().toISOString().split('T')[0],
      permissions: ['dashboard.view'],
      preferences: {
        theme: 'light',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        notifications: {
          email: { enabled: true, frequency: 'daily', types: { tasks: true, mentions: true, updates: true, security: true, marketing: false } },
          push: { enabled: true, types: { tasks: true, mentions: true, chat: true, updates: false } },
          inApp: { enabled: true, sound: true, desktop: true, types: { tasks: true, mentions: true, chat: true, updates: true, system: true } }
        },
        dashboard: {
          layout: 'grid',
          widgets: [
            { id: 'tasks', enabled: true, position: 1, size: 'medium' },
            { id: 'notifications', enabled: true, position: 2, size: 'small' }
          ],
          defaultView: 'dashboard',
          autoRefresh: true,
          refreshInterval: 300
        },
        privacy: {
          profileVisibility: 'team',
          showEmail: true,
          showPhone: false,
          showBirthDate: false,
          showAddress: false,
          allowDirectMessages: true,
          allowMentions: true,
          shareActivityStatus: true
        }
      },
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: new Date().toISOString(),
        sessionTimeout: 480,
        loginNotifications: true,
        deviceTrust: { enabled: true, trustedDevices: [] }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return this.integrateEmployeeDataToProfile(defaultProfile, employeeIntegration.employeeData)
  }
}

// Hook para usar a integração de membros do time interno
export const useEmployeeIntegration = () => {
  return employeeIntegrationService
}