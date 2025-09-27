import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock user para desenvolvimento
  const mockUser: User = {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@medstaff.com.br',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'SuperAdmin',
    permissions: ['*'], // SuperAdmin tem todas as permissões
    department: 'Tecnologia',
    position: 'Desenvolvedor Senior'
  }

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setUser(mockUser)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock login - em produção, validar credenciais
      if (email && password) {
        setUser(mockUser)
      } else {
        throw new Error('Credenciais inválidas')
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    // Limpar localStorage, cookies, etc.
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}