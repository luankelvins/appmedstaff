import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginCredentials, PermissionSlug } from '../types/auth'
import { AuthResponse } from '../types/database'
import { authServiceFrontend } from '../utils/authServiceFrontend'
import { UserProfile } from '../types/profile'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setError: (error: string | null) => void
  hasPermission: (permission: PermissionSlug) => boolean
  hasAnyPermission: (permissions: PermissionSlug[]) => boolean
  hasRole: (roleSlug: string) => boolean
  clearError: () => void
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>
}

// Função para converter UserProfile para User (compatibilidade)
const mapProfileToUser = (profile: UserProfile): User => {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    role: {
      id: '1',
      name: profile.role || 'user',
      slug: profile.role || 'user',
      description: 'Usuário padrão',
      level: 'operational' as const,
      permissions: []
    },
    permissions: (profile.permissions || []).map(perm => ({
      id: perm,
      name: perm,
      slug: perm as PermissionSlug,
      module: 'general',
      action: 'view' as const,
      description: perm
    })),
    isActive: true,
    createdAt: profile.createdAt || new Date().toISOString(),
    updatedAt: profile.updatedAt || new Date().toISOString()
  }
}

// Função para converter resposta do authService para User
const mapAuthResponseToUser = (authUser: AuthResponse['user']): User => {
  // Converter permissões do backend para o formato esperado pelo frontend
  const permissions = (authUser.permissions || []).map(perm => ({
    id: perm,
    name: perm,
    slug: perm as PermissionSlug,
    module: 'general',
    action: 'view' as const,
    description: perm
  }))

  return {
    id: authUser.id,
    name: authUser.nome,
    email: authUser.email,
    avatar: undefined,
    role: {
      id: '1',
      name: authUser.role || 'user',
      slug: authUser.role || 'user',
      description: 'Usuário padrão',
      level: 'operational' as const,
      permissions: []
    },
    permissions: permissions,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Ações
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null })
          
          const response: AuthResponse = await authServiceFrontend.login(credentials)
          
          set({
            user: mapAuthResponseToUser(response.user),
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Erro ao fazer login',
          })
          throw error
        }
      },

      logout: () => {
        authServiceFrontend.logout()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      // Verificação de permissões
      hasPermission: (permission: PermissionSlug): boolean => {
        const { user } = get()
        if (!user) return false
        
        // SuperAdmin tem todas as permissões
        if (user.role.slug === 'super_admin') return true
        
        // Verifica se o usuário tem a permissão específica
        return user.permissions.some(p => p.slug === permission)
      },

      hasAnyPermission: (permissions: PermissionSlug[]): boolean => {
        const { hasPermission } = get()
        return permissions.some(permission => hasPermission(permission))
      },

      hasRole: (roleSlug: string): boolean => {
        const { user } = get()
        if (!user) return false
        return user.role.slug === roleSlug
      },

      signUp: async (email: string, password: string, userData: Partial<UserProfile>) => {
        try {
          set({ isLoading: true, error: null })
          
          // Mock implementation - replace with actual signup service
          console.log('SignUp mock:', { email, userData })
          
          set({
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Erro ao criar conta',
          })
          throw error
        }
      },
    }),
    {
      name: 'medstaff-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)