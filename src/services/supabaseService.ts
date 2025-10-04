import { supabase, supabaseAdmin, Tables, Inserts, Updates } from '../config/supabase'
import { UserProfile } from '../types/profile'
import { TimeInternoForm } from '../types/crm'

export class SupabaseService {
  // ==================== AUTENTICAÇÃO ====================
  
  /**
   * Faz login do usuário
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  /**
   * Faz logout do usuário
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  /**
   * Registra um novo usuário
   */
  async signUp(email: string, password: string, userData: Partial<UserProfile>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (error) throw error
    return data
  }

  /**
   * Obtém o usuário atual
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  /**
   * Obtém a sessão atual
   */
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }

  // ==================== PERFIS ====================

  /**
   * Busca perfil do usuário por ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Não encontrado
      throw error
    }

    return this.mapProfileFromDB(data)
  }

  /**
   * Busca perfil do usuário por email
   */
  async getProfileByEmail(email: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Não encontrado
      throw error
    }

    return this.mapProfileFromDB(data)
  }

  /**
   * Cria ou atualiza perfil do usuário
   */
  async upsertProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const profileInsert: Inserts<'profiles'> = {
      id: userId,
      email: profileData.email!,
      name: profileData.name!,
      position: profileData.position,
      department: profileData.department,
      employee_id: profileData.employeeId,
      phone: profileData.phone,
      hire_date: profileData.hireDate,
      avatar_url: profileData.avatarUrl,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileInsert)
      .select()
      .single()

    if (error) throw error
    return this.mapProfileFromDB(data)
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const profileUpdate: Updates<'profiles'> = {
      name: updates.name,
      position: updates.position,
      department: updates.department,
      employee_id: updates.employeeId,
      phone: updates.phone,
      hire_date: updates.hireDate,
      avatar_url: updates.avatar,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return this.mapProfileFromDB(data)
  }

  // ==================== TIME INTERNO ====================

  /**
   * Busca dados do membro do time interno por email
   */
  async getEmployeeByEmail(email: string): Promise<TimeInternoForm | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Não encontrado
      throw error
    }

    return this.mapEmployeeFromDB(data)
  }

  /**
   * Cria ou atualiza dados do membro do time interno
   */
  async upsertEmployee(employeeData: TimeInternoForm): Promise<TimeInternoForm> {
    const employeeInsert: Inserts<'employees'> = {
      email: employeeData.dadosPessoais.emailPessoal || '',
      dados_pessoais: employeeData.dadosPessoais,
      dados_profissionais: employeeData.dadosProfissionais,
      dados_financeiros: employeeData.dadosFinanceiros,
      status: employeeData.status,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('employees')
      .upsert(employeeInsert)
      .select()
      .single()

    if (error) throw error
    return this.mapEmployeeFromDB(data)
  }

  /**
   * Lista todos os membros do time interno
   */
  async getAllEmployees(): Promise<TimeInternoForm[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(emp => this.mapEmployeeFromDB(emp))
  }

  // ==================== TAREFAS ====================

  /**
   * Busca tarefas do usuário
   */
  async getUserTasks(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  /**
   * Cria nova tarefa
   */
  async createTask(taskData: Inserts<'tasks'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Atualiza tarefa
   */
  async updateTask(taskId: string, updates: Updates<'tasks'>) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ==================== LEADS ====================

  /**
   * Busca todos os leads
   */
  async getAllLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  /**
   * Cria novo lead
   */
  async createLead(leadData: Inserts<'leads'>) {
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Atualiza lead
   */
  async updateLead(leadId: string, updates: Updates<'leads'>) {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ==================== REAL-TIME ====================

  /**
   * Subscreve a mudanças em uma tabela
   */
  subscribeToTable(table: string, callback: (payload: any) => void) {
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table }, 
        callback
      )
      .subscribe()
  }

  /**
   * Remove subscrição
   */
  unsubscribe(subscription: any) {
    return supabase.removeChannel(subscription)
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Mapeia dados do perfil do banco para o tipo UserProfile
   */
  private mapProfileFromDB(data: Tables<'profiles'>): UserProfile {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar_url || undefined,
      phone: data.phone || undefined,
      document: undefined,
      birthDate: undefined,
      address: undefined,
      role: 'user',
      department: data.department || '',
      position: data.position || '',
      hireDate: data.hire_date || new Date().toISOString(),
      manager: undefined,
      permissions: [],
      preferences: {
        theme: 'system',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        notifications: {
          email: {
            enabled: true,
            frequency: 'daily',
            types: {
              tasks: true,
              mentions: true,
              updates: true,
              security: true,
              marketing: false
            }
          },
          push: {
            enabled: true,
            types: {
              tasks: true,
              mentions: true,
              chat: true,
              updates: true
            }
          },
          inApp: {
            enabled: true,
            sound: true,
            desktop: true,
            types: {
              tasks: true,
              mentions: true,
              chat: true,
              updates: true,
              system: true
            }
          }
        },
        dashboard: {
          layout: 'grid',
          widgets: [],
          defaultView: 'dashboard',
          autoRefresh: true,
          refreshInterval: 300
        },
        privacy: {
          profileVisibility: 'team',
          showEmail: false,
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
        allowedIPs: undefined,
        loginNotifications: true,
        deviceTrust: {
          enabled: false,
          trustedDevices: []
        }
      },
      employeeId: data.employee_id || undefined,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString()
    }
  }

  /**
   * Mapeia dados do membro do time interno do banco para o tipo TimeInternoForm
   */
  private mapEmployeeFromDB(data: Tables<'employees'>): TimeInternoForm {
    return {
      id: data.id,
      dadosPessoais: data.dados_pessoais,
      dadosProfissionais: data.dados_profissionais,
      dadosFinanceiros: data.dados_financeiros,
      status: (data.status as 'ativo' | 'inativo' | 'afastado' | 'desligado') || 'ativo',
      responsavelRH: '',
      // Campos obrigatórios com valores padrão
      jornadaTrabalho: {
        escala: '',
        cargaHoraria: 0,
        horarioEntrada: '',
        horarioSaida: '',
        intervalos: ''
      },
      aso: {
        admissional: {
          data: '',
          medico: ''
        }
      },
      dependentes: [],
      documentosObrigatorios: [],
      documentos: [],
      anexosNotificacoes: [],
      anexos: []
    }
  }

  /**
   * Verifica se o Supabase está configurado corretamente
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      return !error
    } catch {
      return false
    }
  }
}

// Instância singleton do serviço
export const supabaseService = new SupabaseService()