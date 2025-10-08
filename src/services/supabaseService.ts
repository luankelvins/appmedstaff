import { supabase, supabaseAdmin, Tables, Inserts, Updates } from '../config/supabase'
import { UserProfile } from '../types/profile'
import { TimeInternoForm } from '../types/crm'

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  timeoutMs: number
}

export class SupabaseService {
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    timeoutMs: 10000
  }

  // Cache para perfis de usuário
  private profileCache = new Map<string, { profile: UserProfile | null, timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutos

  // Limpar cache expirado
  private cleanExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.profileCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.profileCache.delete(key)
      }
    }
  }

  // Verificar se o cache é válido
  private getCachedProfile(userId: string): UserProfile | null | undefined {
    this.cleanExpiredCache()
    const cached = this.profileCache.get(userId)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('[SupabaseService] Usando perfil do cache para userId:', userId)
      return cached.profile
    }
    return undefined
  }

  // Armazenar no cache
  private setCachedProfile(userId: string, profile: UserProfile | null) {
    this.profileCache.set(userId, { profile, timestamp: Date.now() })
  }

  // Invalidar cache de perfil
  public invalidateProfileCache(userId?: string) {
    if (userId) {
      this.profileCache.delete(userId)
      console.log('[SupabaseService] Cache invalidado para userId:', userId)
    } else {
      this.profileCache.clear()
      console.log('[SupabaseService] Cache de perfis limpo completamente')
    }
  }

  // Método auxiliar para buscar perfil com fallback
  private async fetchProfileWithFallback(userId: string): Promise<UserProfile | null> {
    const client = supabaseAdmin || supabase
    const usingAdmin = !!supabaseAdmin
    
    console.log('[SupabaseService] Usando cliente:', usingAdmin ? 'Admin (bypass RLS)' : 'Normal')
    
    try {
      // Tentar buscar na tabela employees primeiro
      const { data: employeeData, error: employeeError } = await client
        .from('employees')
        .select('*')
        .eq('id', userId)
        .single()

      if (employeeData && !employeeError) {
        console.log('[SupabaseService] Perfil encontrado na tabela employees')
        return this.mapEmployeeToProfile(employeeData)
      }

      // Se não encontrar na employees, tentar na profiles
      console.log('[SupabaseService] Tentando buscar na tabela profiles como fallback')
      const { data: profileData, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileData && !profileError) {
        console.log('[SupabaseService] Perfil encontrado na tabela profiles')
        return this.mapProfileFromDB(profileData)
      }

      // Se não encontrar em nenhuma tabela
      if (employeeError?.code === 'PGRST116' && profileError?.code === 'PGRST116') {
        console.log('[SupabaseService] Perfil não encontrado em nenhuma tabela')
        return null
      }

      // Se houver erro diferente de "não encontrado", lançar o erro
      throw employeeError || profileError
    } catch (error) {
      console.error('[SupabaseService] Erro ao buscar perfil com fallback:', error)
      throw error
    }
  }

  /**
   * Executa uma query com retry logic e timeout
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    timeoutMs: number = 15000 // Aumentado de 5000ms para 15000ms
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Criar uma Promise com timeout mais longo
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Query timeout após ${timeoutMs}ms`)), timeoutMs)
        })
        
        const result = await Promise.race([operation(), timeoutPromise])
        return result
      } catch (error) {
        lastError = error as Error
        console.log(`[SupabaseService] Tentativa ${attempt} falhou, tentando novamente em ${attempt * 1000}ms:`, error)
        
        if (attempt < maxRetries) {
          // Delay exponencial: 1s, 2s, 3s
          await new Promise(resolve => setTimeout(resolve, attempt * 1000))
        }
      }
    }
    
    throw lastError || new Error('Operação falhou após múltiplas tentativas')
  }
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
    if (error) {
      throw error
    }
    return session
  }

  // ==================== PERFIS ====================

  /**
   * Busca perfil do usuário por ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('[SupabaseService] Buscando perfil para userId:', userId)

      // Verificar cache primeiro
      const cachedProfile = this.getCachedProfile(userId)
      if (cachedProfile !== undefined) {
        return cachedProfile
      }

      // Buscar perfil com fallback e retry
      const profile = await this.executeWithRetry(async () => {
        return await this.fetchProfileWithFallback(userId)
      }, 3, 15000) // 3 tentativas, timeout de 15 segundos

      console.log('[SupabaseService] Perfil obtido:', profile ? 'Encontrado' : 'Não encontrado')
      
      // Armazenar no cache
      this.setCachedProfile(userId, profile)
      
      return profile
    } catch (error) {
      console.error('[SupabaseService] Exceção ao buscar perfil:', error)
      throw error
    }
  }

  /**
   * Busca perfil do usuário por email
   */
  async getProfileByEmail(email: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Não encontrado
      throw error
    }

    return this.mapEmployeeToProfile(data)
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
      avatar_url: profileData.avatar,
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
    try {
      console.log('[SupabaseService] Atualizando perfil para userId:', userId, 'com dados:', updates)

      // Invalidar cache antes da atualização
      this.invalidateProfileCache(userId)

      const { data, error } = await supabase
        .from('employees')
        .update({
          dados_pessoais: updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('[SupabaseService] Erro ao atualizar perfil:', error)
        throw error
      }

      const updatedProfile = this.mapEmployeeToProfile(data)
      
      // Atualizar cache com novo perfil
      this.setCachedProfile(userId, updatedProfile)
      
      return updatedProfile
    } catch (error) {
      console.error('[SupabaseService] Exceção ao atualizar perfil:', error)
      throw error
    }
  }

  // ==================== TIME INTERNO ====================

  /**
   * Busca dados do membro do time interno por email
   */
  async getEmployeeByEmail(email: string): Promise<TimeInternoForm | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .maybeSingle() // Usar maybeSingle ao invés de single para evitar erro 406

      if (error) {
        console.error('Erro ao buscar employee por email:', error)
        return null
      }

      if (!data) {
        return null
      }

      return this.mapEmployeeFromDB(data)
    } catch (error) {
      console.error('Exceção ao buscar employee por email:', error)
      return null
    }
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
   * Mapeia dados do employee do banco para o tipo UserProfile
   */
  private mapEmployeeToProfile(data: any): UserProfile {
    console.log('[SupabaseService] mapEmployeeToProfile - dados recebidos:', data)
    
    // Extrair dados pessoais e profissionais
    const dadosPessoais = data.dados_pessoais || {}
    const dadosProfissionais = data.dados_profissionais || {}
    
    // Determinar role baseado no nivel_acesso
    let role = 'user'
    if (dadosProfissionais.nivel_acesso === 'superadmin') {
      role = 'super_admin'
    } else if (dadosProfissionais.nivel_acesso === 'admin') {
      role = 'admin'
    } else if (dadosProfissionais.nivel_acesso === 'manager') {
      role = 'manager'
    }
    
    // Se for super_admin, garantir permissão total
    let permissions = dadosProfissionais.permissions || []
    if (role === 'super_admin' && !permissions.includes('*')) {
      console.log('[SupabaseService] Super admin detectado, adicionando permissão total (*)')
      permissions = ['*']
    }
    
    return {
      id: data.id,
      name: dadosPessoais.nome_completo || dadosPessoais.name || data.email.split('@')[0],
      email: data.email,
      avatar: dadosPessoais.avatar || dadosPessoais.avatar_url || undefined,
      phone: dadosPessoais.contato?.telefone || dadosPessoais.phone || undefined,
      document: dadosPessoais.cpf || dadosPessoais.document || undefined,
      birthDate: dadosPessoais.data_nascimento || dadosPessoais.birth_date || undefined,
      address: dadosPessoais.endereco ? {
        street: dadosPessoais.endereco.logradouro || '',
        number: dadosPessoais.endereco.numero || '',
        complement: dadosPessoais.endereco.complemento || '',
        neighborhood: dadosPessoais.endereco.bairro || '',
        city: dadosPessoais.endereco.cidade || '',
        state: dadosPessoais.endereco.estado || '',
        zipCode: dadosPessoais.endereco.cep || '',
        country: dadosPessoais.endereco.pais || 'Brasil'
      } : undefined,
      role: role as 'super_admin' | 'admin' | 'manager' | 'user',
      department: dadosProfissionais.departamento || dadosProfissionais.department || '',
      position: dadosProfissionais.cargo || dadosProfissionais.position || '',
      hireDate: dadosProfissionais.data_admissao || dadosProfissionais.hire_date || data.created_at,
      manager: dadosProfissionais.gerente || dadosProfissionais.manager || undefined,
      permissions,
      preferences: {
        theme: 'system' as const,
        language: 'pt-BR' as const,
        timezone: 'America/Sao_Paulo',
        dateFormat: 'DD/MM/YYYY' as const,
        timeFormat: '24h' as const,
        notifications: {
          email: {
            enabled: true,
            frequency: 'immediate' as const,
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
          layout: 'grid' as const,
          widgets: [],
          defaultView: 'dashboard' as const,
          autoRefresh: true,
          refreshInterval: 30
        },
        privacy: {
          profileVisibility: 'team' as const,
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
        lastPasswordChange: data.created_at,
        sessionTimeout: 480,
        loginNotifications: true,
        deviceTrust: {
          enabled: false,
          trustedDevices: []
        }
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  /**
   * Mapeia dados do perfil do banco para o tipo UserProfile
   */
  private mapProfileFromDB(data: Tables<'profiles'>): UserProfile {
    console.log('[SupabaseService] mapProfileFromDB - data.role:', data.role)
    console.log('[SupabaseService] mapProfileFromDB - data.permissions:', data.permissions)
    
    const role = (data.role || 'user') as 'super_admin' | 'admin' | 'manager' | 'user'
    
    // Se for super_admin, garantir permissão total
    let permissions = data.permissions || []
    if (role === 'super_admin' && !permissions.includes('*')) {
      console.log('[SupabaseService] Super admin detectado, adicionando permissão total (*)')
      permissions = ['*']
    }
    
    return {
      id: data.id,
      name: data.full_name || data.name,
      email: data.email,
      avatar: data.avatar_url || undefined,
      phone: data.phone || undefined,
      document: undefined,
      birthDate: undefined,
      address: undefined,
      role,
      department: data.department || '',
      position: data.position || '',
      hireDate: data.hire_date || new Date().toISOString(),
      manager: undefined,
      permissions,
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