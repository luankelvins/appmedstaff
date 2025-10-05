import { LoginCredentials, AuthResponse, User } from '../types/auth'
import { supabase } from '../config/supabase'
import { SupabaseService } from './supabaseService'

const supabaseService = new SupabaseService()

// Mapeamento de permissões baseado no cargo/posição
const getPermissionsByPosition = (position: string): any[] => {
  const allPermissions = [
    { id: '1', name: 'Visualizar Dashboard', slug: 'dashboard.view', module: 'dashboard', action: 'view' as const, description: 'Permite visualizar o dashboard' },
    { id: '2', name: 'Visualizar Feed', slug: 'feed.view', module: 'feed', action: 'view' as const, description: 'Permite visualizar o feed' },
    { id: '3', name: 'Visualizar Notificações', slug: 'notifications.view', module: 'notifications', action: 'view' as const, description: 'Permite visualizar notificações' },
    { id: '4', name: 'Visualizar Tarefas', slug: 'tasks.view', module: 'tasks', action: 'view' as const, description: 'Permite visualizar tarefas' },
    { id: '5', name: 'Criar Tarefas', slug: 'tasks.create', module: 'tasks', action: 'create' as const, description: 'Permite criar tarefas' },
    { id: '6', name: 'Atualizar Tarefas', slug: 'tasks.update', module: 'tasks', action: 'update' as const, description: 'Permite atualizar tarefas' },
    { id: '7', name: 'Deletar Tarefas', slug: 'tasks.delete', module: 'tasks', action: 'delete' as const, description: 'Permite deletar tarefas' },
    { id: '8', name: 'Ler Contatos', slug: 'contacts.read', module: 'contacts', action: 'read' as const, description: 'Permite ler contatos' },
    { id: '9', name: 'Criar Contatos', slug: 'contacts.create', module: 'contacts', action: 'create' as const, description: 'Permite criar contatos' },
    { id: '10', name: 'Atualizar Contatos', slug: 'contacts.update', module: 'contacts', action: 'update' as const, description: 'Permite atualizar contatos' },
    { id: '11', name: 'Deletar Contatos', slug: 'contacts.delete', module: 'contacts', action: 'delete' as const, description: 'Permite deletar contatos' },
    { id: '12', name: 'Visualizar Time Interno', slug: 'contacts.internal.view', module: 'contacts', action: 'view' as const, description: 'Permite visualizar time interno' },
    { id: '13', name: 'Acessar Formulários CRM', slug: 'crm.forms.access', module: 'crm', action: 'access' as const, description: 'Permite acessar formulários CRM' },
    { id: '14', name: 'Visualizar Organograma', slug: 'org.chart.view', module: 'org', action: 'view' as const, description: 'Permite visualizar organograma' },
    { id: '15', name: 'Visualizar DRE', slug: 'finance.dre.view', module: 'finance', action: 'view' as const, description: 'Permite visualizar DRE' },
    { id: '16', name: 'Criar Despesas', slug: 'finance.expenses.create', module: 'finance', action: 'create' as const, description: 'Permite criar despesas' },
    { id: '17', name: 'Atualizar Despesas', slug: 'finance.expenses.update', module: 'finance', action: 'update' as const, description: 'Permite atualizar despesas' },
    { id: '18', name: 'Deletar Despesas', slug: 'finance.expenses.delete', module: 'finance', action: 'delete' as const, description: 'Permite deletar despesas' },
    { id: '19', name: 'Criar Lançamentos', slug: 'finance.launches.create', module: 'finance', action: 'create' as const, description: 'Permite criar lançamentos' },
    { id: '20', name: 'Atualizar Lançamentos', slug: 'finance.launches.update', module: 'finance', action: 'update' as const, description: 'Permite atualizar lançamentos' },
    { id: '21', name: 'Deletar Lançamentos', slug: 'finance.launches.delete', module: 'finance', action: 'delete' as const, description: 'Permite deletar lançamentos' },
    { id: '22', name: 'Ler Ponto', slug: 'hr.attendance.read', module: 'hr', action: 'read' as const, description: 'Permite ler ponto' },
    { id: '23', name: 'Atualizar Ponto', slug: 'hr.attendance.update', module: 'hr', action: 'update' as const, description: 'Permite atualizar ponto' },
    { id: '24', name: 'Ler Colaboradores', slug: 'relationship.collaborators.read', module: 'relationship', action: 'read' as const, description: 'Permite ler colaboradores' },
    { id: '25', name: 'Atualizar Colaboradores', slug: 'relationship.collaborators.update', module: 'relationship', action: 'update' as const, description: 'Permite atualizar colaboradores' },
    { id: '26', name: 'Ler Clientes', slug: 'relationship.clients.read', module: 'relationship', action: 'read' as const, description: 'Permite ler clientes' },
    { id: '27', name: 'Atualizar Clientes', slug: 'relationship.clients.update', module: 'relationship', action: 'update' as const, description: 'Permite atualizar clientes' },
    { id: '28', name: 'Ler SAC', slug: 'relationship.sac.read', module: 'relationship', action: 'read' as const, description: 'Permite ler SAC' },
    { id: '29', name: 'Responder SAC', slug: 'relationship.sac.respond', module: 'relationship', action: 'respond' as const, description: 'Permite responder SAC' },
    { id: '30', name: 'Gerenciar Papéis', slug: 'rbac.role.manage', module: 'rbac', action: 'manage' as const, description: 'Permite gerenciar papéis' },
    { id: '31', name: 'Gerenciar Usuários', slug: 'rbac.user.manage', module: 'rbac', action: 'manage' as const, description: 'Permite gerenciar usuários' },
    { id: '32', name: 'Ler Auditoria', slug: 'audit.read', module: 'audit', action: 'read' as const, description: 'Permite ler logs de auditoria' }
  ]

  const basicPermissions = allPermissions.filter(p => 
    ['dashboard.view', 'feed.view', 'notifications.view', 'tasks.view'].includes(p.slug)
  )

  const operationalPermissions = [
    ...basicPermissions,
    ...allPermissions.filter(p => 
      ['tasks.create', 'contacts.read', 'contacts.create', 'crm.forms.access', 'relationship.clients.read'].includes(p.slug)
    )
  ]

  const tacticalPermissions = [
    ...operationalPermissions,
    ...allPermissions.filter(p => 
      ['tasks.update', 'contacts.update', 'relationship.clients.update'].includes(p.slug)
    )
  ]

  const managerialPermissions = [
    ...tacticalPermissions,
    ...allPermissions.filter(p => 
      ['tasks.delete', 'contacts.delete', 'contacts.internal.view', 'org.chart.view', 'finance.dre.view', 'hr.attendance.read'].includes(p.slug)
    )
  ]

  const strategicPermissions = allPermissions

  const pos = position?.toLowerCase() || ''
  
  if (pos.includes('admin') || pos.includes('diretor') || pos.includes('ceo')) {
    return strategicPermissions
  } else if (pos.includes('gerente') || pos.includes('coordenador')) {
    return managerialPermissions
  } else if (pos.includes('analista') || pos.includes('especialista')) {
    return tacticalPermissions
  } else if (pos.includes('assistente') || pos.includes('auxiliar')) {
    return operationalPermissions
  } else {
    return basicPermissions
  }
}

// Função para mapear cargo para role
const getRoleByPosition = (position: string) => {
  const pos = position?.toLowerCase() || ''
  
  if (pos.includes('admin') || pos.includes('diretor') || pos.includes('ceo')) {
    return {
      id: '1',
      name: 'Super Admin',
      slug: 'super_admin',
      description: 'Acesso total ao sistema',
      level: 'strategic' as const,
      permissions: []
    }
  } else if (pos.includes('gerente') || pos.includes('coordenador')) {
    return {
      id: '2',
      name: 'Gerente',
      slug: 'gerente',
      description: 'Gestão de equipe e processos',
      level: 'managerial' as const,
      permissions: []
    }
  } else if (pos.includes('analista') || pos.includes('especialista')) {
    return {
      id: '3',
      name: 'Analista',
      slug: 'analista',
      description: 'Execução de atividades especializadas',
      level: 'tactical' as const,
      permissions: []
    }
  } else if (pos.includes('assistente') || pos.includes('auxiliar')) {
    return {
      id: '4',
      name: 'Assistente',
      slug: 'assistente',
      description: 'Suporte operacional',
      level: 'operational' as const,
      permissions: []
    }
  } else {
    return {
      id: '5',
      name: 'Colaborador',
      slug: 'colaborador',
      description: 'Acesso básico ao sistema',
      level: 'operational' as const,
      permissions: []
    }
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Fazer login com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Usuário não encontrado')
    }

    // Buscar perfil do usuário na tabela profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      // Se não encontrar perfil, criar um básico
      const newProfile = {
        id: authData.user.id,
        email: authData.user.email!,
        name: authData.user.user_metadata?.name || authData.user.email!.split('@')[0],
        position: 'Colaborador',
        department: 'Geral'
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      if (createError) {
        throw new Error('Erro ao criar perfil do usuário')
      }

      const role = getRoleByPosition(newProfile.position)
      const permissions = getPermissionsByPosition(newProfile.position)

      const user: User = {
        id: authData.user.id,
        name: newProfile.name,
        email: newProfile.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newProfile.name)}&background=3b82f6&color=fff`,
        role,
        permissions,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return {
        user,
        token: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || ''
      }
    }

    // Mapear dados do perfil para o formato User
    const role = getRoleByPosition(profile.position)
    const permissions = getPermissionsByPosition(profile.position)

    const user: User = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3b82f6&color=fff`,
      role,
      permissions,
      isActive: true,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    }

    return {
      user,
      token: authData.session?.access_token || '',
      refreshToken: authData.session?.refresh_token || ''
    }
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      throw new Error(error.message)
    }

    if (!data.user || !data.session) {
      throw new Error('Sessão inválida')
    }

    // Buscar perfil atualizado
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      throw new Error('Erro ao buscar perfil do usuário')
    }

    const role = getRoleByPosition(profile.position)
    const permissions = getPermissionsByPosition(profile.position)

    const user: User = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3b82f6&color=fff`,
      role,
      permissions,
      isActive: true,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    }

    return {
      user,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        throw new Error(error.message)
      }

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        throw new Error('Perfil do usuário não encontrado')
      }

      const role = getRoleByPosition(profile.position)
      const permissions = getPermissionsByPosition(profile.position)

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3b82f6&color=fff`,
        role,
        permissions,
        isActive: true,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      }

    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error)
      throw error
    }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado')
      }

      // Atualizar perfil na tabela profiles
      const updateData: any = {}
      if (data.name) updateData.name = data.name
      if (data.avatar) updateData.avatar_url = data.avatar

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        throw new Error('Erro ao atualizar perfil')
      }

      const role = getRoleByPosition(updatedProfile.position)
      const permissions = getPermissionsByPosition(updatedProfile.position)

      return {
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        avatar: updatedProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedProfile.name)}&background=3b82f6&color=fff`,
        role,
        permissions,
        isActive: true,
        createdAt: updatedProfile.created_at,
        updatedAt: updatedProfile.updated_at
      }

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw new Error(error.message)
      }

    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      throw error
    }
  }
}