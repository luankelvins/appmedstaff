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

export const AuthContext = createContext<AuthContextType | undefined>(undefined)



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
      console.log('[AuthContext] Verificando sessão...')
      try {
        const session = await supabaseService.getCurrentSession()
        console.log('[AuthContext] Sessão obtida:', session ? 'Autenticado' : 'Não autenticado')
        
        if (session?.user) {
          // Buscar perfil do usuário com retry
          console.log('[AuthContext] Buscando perfil do usuário:', session.user.id)
          
          let profile = null
          let attempts = 0
          const maxAttempts = 2
          
          while (!profile && attempts < maxAttempts) {
            attempts++
            console.log(`[AuthContext] checkSession - Tentativa ${attempts} de buscar perfil...`)
            
            try {
              profile = await supabaseService.getProfile(session.user.id)
              
              if (profile) {
                console.log('[AuthContext] checkSession - Perfil encontrado:', profile)
                break
              }
              
              if (attempts < maxAttempts) {
                console.log('[AuthContext] checkSession - Perfil não encontrado, aguardando antes da próxima tentativa...')
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            } catch (error) {
              console.error(`[AuthContext] checkSession - Erro na tentativa ${attempts}:`, error)
              
              if (error instanceof Error && error.message.includes('timeout')) {
                console.error('[AuthContext] checkSession - Erro de timeout detectado, abortando tentativas adicionais')
                break
              }
              
              if (attempts < maxAttempts) {
                console.log('[AuthContext] checkSession - Aguardando antes da próxima tentativa...')
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            }
          }
          
          if (profile) {
            const mappedUser = mapProfileToUser(profile)
            console.log('[AuthContext] checkSession - Usuário mapeado com role:', mappedUser.role)
            setUser(mappedUser)
          } else {
            console.error('[AuthContext] checkSession - Perfil não encontrado após', maxAttempts, 'tentativas')
            const basicUser: User = {
              id: session.user.id,
              name: session.user.email?.split('@')[0] || 'Usuário',
              email: session.user.email || '',
              role: 'user',
              permissions: []
            }
            console.log('[AuthContext] checkSession - Criando usuário básico temporário:', basicUser)
            setUser(basicUser)
          }
        }
      } catch (error) {
        console.error('[AuthContext] Erro ao verificar sessão:', error)
      } finally {
        console.log('[AuthContext] Finalizando verificação, setLoading(false)')
        setLoading(false)
      }
    }

    // Timeout de segurança - força loading = false após 10 segundos (mais tempo para retry)
    const timeoutId = setTimeout(() => {
      console.log('[AuthContext] Timeout de segurança atingido, forçando loading = false')
      setLoading(false)
    }, 10000)

    checkSession().finally(() => {
      clearTimeout(timeoutId)
    })

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('[AuthContext] onAuthStateChange evento:', event, 'session:', session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('[AuthContext] Usuário autenticado, buscando perfil...')
          
          // Tentar buscar perfil com retentativas
          let profile = null
          let attempts = 0
          const maxAttempts = 2
          
          while (!profile && attempts < maxAttempts) {
            attempts++
            console.log(`[AuthContext] Tentativa ${attempts} de buscar perfil...`)
            
            try {
              profile = await supabaseService.getProfile(session.user.id)
              
              if (profile) {
                console.log('[AuthContext] Perfil encontrado:', profile)
                break
              }
              
              // Aguardar 1 segundo antes de tentar novamente
              if (attempts < maxAttempts) {
                console.log('[AuthContext] Perfil não encontrado, aguardando antes da próxima tentativa...')
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            } catch (error) {
              console.error(`[AuthContext] Erro na tentativa ${attempts}:`, error)
              
              // Se for erro de timeout, não tentar novamente imediatamente
              if (error instanceof Error && error.message.includes('timeout')) {
                console.error('[AuthContext] Erro de timeout detectado, abortando tentativas adicionais')
                break
              }
              
              if (attempts < maxAttempts) {
                console.log('[AuthContext] Aguardando antes da próxima tentativa...')
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            }
          }
          
          if (profile) {
            const mappedUser = mapProfileToUser(profile)
            console.log('[AuthContext] Setando usuário com perfil completo:', mappedUser)
            setUser(mappedUser)
            console.log('[AuthContext] Usuário setado com sucesso! Role:', mappedUser.role)
          } else {
            console.error('[AuthContext] ERRO: Não foi possível buscar perfil após', maxAttempts, 'tentativas')
            // Criar usuário básico temporário para evitar loop de login
            const basicUser: User = {
              id: session.user.id,
              name: session.user.email?.split('@')[0] || 'Usuário',
              email: session.user.email || '',
              role: 'user',
              permissions: []
            }
            console.log('[AuthContext] Criando usuário básico temporário:', basicUser)
            setUser(basicUser)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[AuthContext] Usuário deslogado')
          setUser(null)
        }
        
        console.log('[AuthContext] onAuthStateChange processado')
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    console.log('[AuthContext] Tentando fazer login...')
    try {
      await supabaseService.signIn(email, password)
      console.log('[AuthContext] Login bem-sucedido')
      // O usuário será definido automaticamente pelo listener onAuthStateChange
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer login:', error)
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
    console.log('[AuthContext] Tentando fazer signup...')
    try {
      await supabaseService.signUp(email, password, userData)
      console.log('[AuthContext] Signup bem-sucedido')
      // O usuário será definido automaticamente pelo listener onAuthStateChange
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer signup:', error)
      throw error
    }
  }

  const hasPermission = (permission: string): boolean => {
    // Super admin tem acesso a tudo
    if (user?.role === 'super_admin' || user?.permissions?.includes('*')) {
      return true
    }
    return user?.permissions?.includes(permission) || false
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    // Super admin tem acesso a tudo
    if (user?.role === 'super_admin' || user?.permissions?.includes('*')) {
      return true
    }
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