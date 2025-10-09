import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authServiceHttp } from '../utils/authServiceHttp'
import type { AuthResponse, LoginData, RegisterData } from '../types/database'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  permissions: string[]
  department?: string
  position?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string, userData: Partial<RegisterData>) => Promise<void>
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

// Função para mapear resposta da API para User
const mapAuthResponseToUser = (authResponse: AuthResponse): User => {
  return {
    id: authResponse.user.id,
    name: authResponse.user.nome,
    email: authResponse.user.email,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authResponse.user.nome)}&background=3b82f6&color=fff`,
    role: authResponse.user.role || 'user',
    permissions: authResponse.user.permissions || [], // Usar permissões do backend
    department: undefined,
    position: undefined
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há token salvo no localStorage
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        
        // Garantir que o usuário tenha permissões básicas (migração temporária)
        if (!parsedUser.permissions || parsedUser.permissions.length === 0) {
          const basicPermissions = [
            // Permissões principais
            'dashboard.view',
            'feed.view',
            'notifications.view',
            'tasks.view',
            'tasks.create',
            'tasks.update',
            'profile.view',
            'profile.update',
            
            // Contatos
            'contacts.read',
            'contacts.create',
            'contacts.update',
            'contacts.internal.view',
            
            // CRM
            'crm.forms.access',
            
            // Atividades
            'activities.commercial.view',
            'activities.operational.view',
            'activities.benefits.view',
            'activities.business.view',
            'activities.partners.view',
            
            // Empresa
            'org.chart.view',
            'admin.docs.read',
            'finance.expenses.create',
            'relationship.collaborators.read',
            
            // Comunicação
            'chat.view',
            
            // Auditoria
            'audit.read'
          ]
          parsedUser.permissions = basicPermissions
          
          // Atualizar localStorage com as novas permissões
          localStorage.setItem('user_data', JSON.stringify(parsedUser))
        }
        
        setUser(parsedUser)
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      const loginData: LoginData = { email, password }
      
      const authResponse = await authServiceHttp.login(loginData)
      const mappedUser = mapAuthResponseToUser(authResponse)
      
      setUser(mappedUser)
      
      // Salvar token e dados do usuário no localStorage
      localStorage.setItem('auth_token', authResponse.token)
      localStorage.setItem('user_data', JSON.stringify(mappedUser))
      
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<RegisterData>): Promise<void> => {
    try {
      setLoading(true)
      const registerData: RegisterData = {
        email,
        password,
        nome: userData.nome || '',
        cpf: userData.cpf || '',
        telefone: userData.telefone
      }
      
      const authResponse = await authServiceHttp.register(registerData)
      
      const mappedUser = mapAuthResponseToUser(authResponse)
      setUser(mappedUser)
      
      // Salvar token e dados do usuário no localStorage
      localStorage.setItem('auth_token', authResponse.token)
      localStorage.setItem('user_data', JSON.stringify(mappedUser))
      
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await authServiceHttp.logout()
      setUser(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    } catch (error) {
      console.error('Erro no logout:', error)
      // Mesmo com erro, limpar dados locais
      setUser(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false
    return permissions.some(permission => user.permissions.includes(permission))
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.role === role
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    signUp,
    hasPermission,
    hasAnyPermission,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export { AuthContext }