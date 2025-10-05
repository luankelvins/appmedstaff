import { LoginCredentials, AuthResponse, User } from '../types/auth'

// Mock data para desenvolvimento
const mockUsers = [
  {
    id: '1',
    name: 'Luan Kelvin',
    email: 'luankelvin@soumedstaff.com',
    password: 'Luan@1303',
    avatar: 'https://ui-avatars.com/api/?name=Luan+Kelvin&background=3b82f6&color=fff',
    role: {
      id: '1',
      name: 'Super Admin',
      slug: 'super_admin',
      description: 'Acesso total ao sistema',
      level: 'strategic' as const,
      permissions: []
    },
    permissions: [
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
    ],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Super Administrador',
    email: 'admin@medstaff.com.br',
    password: '123456',
    avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=3b82f6&color=fff',
    role: {
      id: '1',
      name: 'Super Admin',
      slug: 'super_admin',
      description: 'Acesso total ao sistema',
      level: 'strategic' as const,
      permissions: []
    },
    permissions: [
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
    ],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Gerente Comercial',
    email: 'gerente@medstaff.com.br',
    password: '123456',
    avatar: 'https://ui-avatars.com/api/?name=Gerente+Comercial&background=10b981&color=fff',
    role: {
      id: '2',
      name: 'Gerente Comercial',
      slug: 'gerente_comercial',
      description: 'Gestão da área comercial',
      level: 'managerial' as const,
      permissions: []
    },
    permissions: [
      { id: '1', name: 'Visualizar Dashboard', slug: 'dashboard.view', module: 'dashboard', action: 'view' as const, description: 'Permite visualizar o dashboard' },
      { id: '2', name: 'Visualizar Feed', slug: 'feed.view', module: 'feed', action: 'view' as const, description: 'Permite visualizar o feed' },
      { id: '3', name: 'Visualizar Notificações', slug: 'notifications.view', module: 'notifications', action: 'view' as const, description: 'Permite visualizar notificações' },
      { id: '4', name: 'Visualizar Tarefas', slug: 'tasks.view', module: 'tasks', action: 'view' as const, description: 'Permite visualizar tarefas' },
      { id: '5', name: 'Criar Tarefas', slug: 'tasks.create', module: 'tasks', action: 'create' as const, description: 'Permite criar tarefas' },
      { id: '6', name: 'Atualizar Tarefas', slug: 'tasks.update', module: 'tasks', action: 'update' as const, description: 'Permite atualizar tarefas' },
      { id: '8', name: 'Ler Contatos', slug: 'contacts.read', module: 'contacts', action: 'read' as const, description: 'Permite ler contatos' },
      { id: '9', name: 'Criar Contatos', slug: 'contacts.create', module: 'contacts', action: 'create' as const, description: 'Permite criar contatos' },
      { id: '10', name: 'Atualizar Contatos', slug: 'contacts.update', module: 'contacts', action: 'update' as const, description: 'Permite atualizar contatos' },
      { id: '13', name: 'Acessar Formulários CRM', slug: 'crm.forms.access', module: 'crm', action: 'access' as const, description: 'Permite acessar formulários CRM' },
      { id: '26', name: 'Ler Clientes', slug: 'relationship.clients.read', module: 'relationship', action: 'read' as const, description: 'Permite ler clientes' },
      { id: '27', name: 'Atualizar Clientes', slug: 'relationship.clients.update', module: 'relationship', action: 'update' as const, description: 'Permite atualizar clientes' }
    ],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Analista Comercial',
    email: 'analista@medstaff.com.br',
    password: '123456',
    avatar: 'https://ui-avatars.com/api/?name=Analista+Comercial&background=f59e0b&color=fff',
    role: {
      id: '3',
      name: 'Analista Comercial',
      slug: 'analista_comercial',
      description: 'Execução de atividades comerciais',
      level: 'tactical' as const,
      permissions: []
    },
    permissions: [
      { id: '1', name: 'Visualizar Dashboard', slug: 'dashboard.view', module: 'dashboard', action: 'view' as const, description: 'Permite visualizar o dashboard' },
      { id: '2', name: 'Visualizar Feed', slug: 'feed.view', module: 'feed', action: 'view' as const, description: 'Permite visualizar o feed' },
      { id: '3', name: 'Visualizar Notificações', slug: 'notifications.view', module: 'notifications', action: 'view' as const, description: 'Permite visualizar notificações' },
      { id: '4', name: 'Visualizar Tarefas', slug: 'tasks.view', module: 'tasks', action: 'view' as const, description: 'Permite visualizar tarefas' },
      { id: '5', name: 'Criar Tarefas', slug: 'tasks.create', module: 'tasks', action: 'create' as const, description: 'Permite criar tarefas' },
      { id: '8', name: 'Ler Contatos', slug: 'contacts.read', module: 'contacts', action: 'read' as const, description: 'Permite ler contatos' },
      { id: '9', name: 'Criar Contatos', slug: 'contacts.create', module: 'contacts', action: 'create' as const, description: 'Permite criar contatos' },
      { id: '13', name: 'Acessar Formulários CRM', slug: 'crm.forms.access', module: 'crm', action: 'access' as const, description: 'Permite acessar formulários CRM' },
      { id: '26', name: 'Ler Clientes', slug: 'relationship.clients.read', module: 'relationship', action: 'read' as const, description: 'Permite ler clientes' }
    ],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Colaborador',
    email: 'colaborador@medstaff.com.br',
    password: '123456',
    avatar: 'https://ui-avatars.com/api/?name=Colaborador&background=8b5cf6&color=fff',
    role: {
      id: '4',
      name: 'Colaborador',
      slug: 'colaborador',
      description: 'Acesso básico ao sistema',
      level: 'operational' as const,
      permissions: []
    },
    permissions: [
      { id: '1', name: 'Visualizar Dashboard', slug: 'dashboard.view', module: 'dashboard', action: 'view' as const, description: 'Permite visualizar o dashboard' },
      { id: '2', name: 'Visualizar Feed', slug: 'feed.view', module: 'feed', action: 'view' as const, description: 'Permite visualizar o feed' },
      { id: '3', name: 'Visualizar Notificações', slug: 'notifications.view', module: 'notifications', action: 'view' as const, description: 'Permite visualizar notificações' },
      { id: '4', name: 'Visualizar Tarefas', slug: 'tasks.view', module: 'tasks', action: 'view' as const, description: 'Permite visualizar tarefas' }
    ],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Simula delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800) // Simula delay de rede
    
    const user = mockUsers.find(
      u => u.email === credentials.email && u.password === credentials.password
    )
    
    if (!user) {
      throw new Error('Email ou senha inválidos')
    }
    
    if (!user.isActive) {
      throw new Error('Usuário inativo')
    }
    
    // Remove password do objeto retornado
    const { password, ...userWithoutPassword } = user
    
    const token = `mock-token-${user.id}-${Date.now()}`
    const refreshToken = `mock-refresh-${user.id}-${Date.now()}`
    
    return {
      user: userWithoutPassword,
      token,
      refreshToken
    }
  },

  async logout(): Promise<void> {
    await delay(300)
    localStorage.removeItem('medstaff-auth')
  },

  async refreshToken(): Promise<AuthResponse> {
    await delay(500)
    
    const token = localStorage.getItem('medstaff-auth')
    if (!token) {
      throw new Error('Token não encontrado')
    }
    
    try {
      const authData = JSON.parse(token)
      const userId = authData.state?.user?.id
      
      if (!userId) {
        throw new Error('Usuário não encontrado no token')
      }
      
      const user = mockUsers.find(u => u.id === userId)
      if (!user) {
        throw new Error('Usuário não encontrado')
      }
      
      const { password, ...userWithoutPassword } = user
      const newToken = `mock-token-${user.id}-${Date.now()}`
      const newRefreshToken = `mock-refresh-${user.id}-${Date.now()}`
      
      return {
        user: userWithoutPassword,
        token: newToken,
        refreshToken: newRefreshToken
      }
    } catch (error) {
      throw new Error('Erro ao renovar token')
    }
  },

  async getCurrentUser(): Promise<User> {
    await delay(300)
    
    const token = localStorage.getItem('medstaff-auth')
    if (!token) {
      throw new Error('Token não encontrado')
    }
    
    try {
      const authData = JSON.parse(token)
      const userId = authData.state?.user?.id
      
      if (!userId) {
        throw new Error('Usuário não encontrado no token')
      }
      
      const user = mockUsers.find(u => u.id === userId)
      if (!user) {
        throw new Error('Usuário não encontrado')
      }
      
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error) {
      throw new Error('Erro ao buscar usuário')
    }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    await delay(600)
    
    const token = localStorage.getItem('medstaff-auth')
    if (!token) {
      throw new Error('Token não encontrado')
    }
    
    try {
      const authData = JSON.parse(token)
      const userId = authData.state?.user?.id
      
      if (!userId) {
        throw new Error('Usuário não encontrado no token')
      }
      
      const userIndex = mockUsers.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        throw new Error('Usuário não encontrado')
      }
      
      // Atualiza os dados do usuário (em memória)
      const updatedUser = {
        ...mockUsers[userIndex],
        ...data,
        updatedAt: new Date().toISOString()
      }
      mockUsers[userIndex] = updatedUser as typeof mockUsers[0]
      
      const { password, ...userWithoutPassword } = mockUsers[userIndex]
      return userWithoutPassword
    } catch (error) {
      throw new Error('Erro ao atualizar perfil')
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await delay(600)
    
    const token = localStorage.getItem('medstaff-auth')
    if (!token) {
      throw new Error('Token não encontrado')
    }
    
    try {
      const authData = JSON.parse(token)
      const userId = authData.state?.user?.id
      
      if (!userId) {
        throw new Error('Usuário não encontrado no token')
      }
      
      const userIndex = mockUsers.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        throw new Error('Usuário não encontrado')
      }
      
      if (mockUsers[userIndex].password !== currentPassword) {
        throw new Error('Senha atual incorreta')
      }
      
      // Atualiza a senha (em memória)
      mockUsers[userIndex].password = newPassword
      mockUsers[userIndex].updatedAt = new Date().toISOString()
    } catch (error) {
      throw new Error('Erro ao alterar senha')
    }
  },
}