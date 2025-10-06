import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabaseService } from '../services/supabaseService'
import { supabase } from '../config/supabase'
import { UserProfile } from '../types/profile'
import type { User as SupabaseUser, AuthChangeEvent, Session } from '@supabase/supabase-js'

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
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// Função para converter UserProfile para User (compatibilidade)
const mapProfileToUser = (profile: UserProfile): User => {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    role: profile.role || 'user',
    permissions: profile.permissions || [],
    department: profile.department,
    position: profile.position
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há uma sessão ativa
    const checkSession = async () => {
      try {
        const session = await supabaseService.getCurrentSession()
        
        if (session?.user) {
          // Buscar perfil do usuário
          const profile = await supabaseService.getProfile(session.user.id)
          
          if (profile) {
            const mappedUser = mapProfileToUser(profile)
            setUser(mappedUser)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const profile = await supabaseService.getProfile(session.user.id)
            if (profile) {
              const mappedUser = mapProfileToUser(profile)
              setUser(mappedUser)
            }
          } catch (error) {
            console.error('Erro ao buscar perfil:', error)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      await supabaseService.signIn(email, password)
      // O usuário será definido automaticamente pelo listener onAuthStateChange
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const logout = async () => {
    try {
      await supabaseService.signOut()
      setUser(null)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    setLoading(true)
    try {
      await supabaseService.signUp(email, password, userData)
      // O usuário será definido automaticamente pelo listener onAuthStateChange
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasRole = (role: string): boolean => {
    return user?.role === role
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    signUp,
    loading,
    isAuthenticated: !!user,
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