import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/apiService'
import { authServiceHttp } from '../utils/authServiceHttp'
import { queryKeys, invalidateQueries } from '../config/queryClient'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

// Types para Auth
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'manager'
  avatar?: string
  department?: string
  position?: string
  phone?: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role?: string
  department?: string
  position?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

export interface UpdateProfileData {
  name?: string
  email?: string
  phone?: string
  department?: string
  position?: string
  avatar?: string
}

// Hook para obter usuário atual
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => apiService.get<User>('/auth/me'),
    enabled: !!authServiceHttp.getStoredToken(), // Só executa se tiver token
    staleTime: 1000 * 60 * 10, // 10 minutos
    retry: (failureCount, error: any) => {
      // Não retry para 401 (token inválido)
      if (error?.status === 401) {
        authServiceHttp.logout()
        return false
      }
      return failureCount < 2
    },
    meta: {
      errorMessage: 'Erro ao carregar dados do usuário'
    }
  })
}

// Hook para login
export const useLogin = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => 
      apiService.post<{ user: User; token: string; refreshToken: string }>('/auth/login', credentials),
    onSuccess: (data) => {
      // Armazenar token e usuário
      authServiceHttp.setToken(data.token)
      authServiceHttp.setUser(data.user)
      
      // Armazenar refresh token se fornecido
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }
      
      // Atualizar cache do usuário
      queryClient.setQueryData(queryKeys.auth.user(), data.user)
      
      // Prefetch dados importantes
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.quickStats(),
        queryFn: () => apiService.getQuickStats()
      })
      
      toast.success(`Bem-vindo(a), ${data.user.name}!`)
      navigate('/dashboard')
    },
    onError: (error: any) => {
      if (error?.status === 401) {
        toast.error('Email ou senha incorretos')
      } else if (error?.status === 423) {
        toast.error('Conta bloqueada. Entre em contato com o administrador.')
      } else {
        toast.error('Erro ao fazer login. Tente novamente.')
      }
    }
  })
}

// Hook para registro
export const useRegister = () => {
  const navigate = useNavigate()
  
  return useMutation({
    mutationFn: (data: RegisterData) => 
      apiService.post<{ user: User; message: string }>('/auth/register', data),
    onSuccess: (data) => {
      toast.success('Conta criada com sucesso! Verifique seu email.')
      navigate('/auth/login')
    },
    onError: (error: any) => {
      if (error?.status === 409) {
        toast.error('Email já está em uso')
      } else if (error?.status === 422) {
        toast.error('Dados inválidos. Verifique os campos.')
      } else {
        toast.error('Erro ao criar conta. Tente novamente.')
      }
    }
  })
}

// Hook para logout
export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  return useMutation({
    mutationFn: () => apiService.post('/auth/logout'),
    onSuccess: () => {
      // Limpar tokens e dados
      authServiceHttp.clearStorage()
      
      // Limpar cache
      queryClient.clear()
      
      toast.success('Logout realizado com sucesso')
      navigate('/auth/login')
    },
    onError: () => {
      // Mesmo com erro, fazer logout local
      authServiceHttp.clearStorage()
      queryClient.clear()
      navigate('/auth/login')
    }
  })
}

// Hook para alterar senha
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => 
      apiService.put('/auth/change-password', data),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso')
    },
    onError: (error: any) => {
      if (error?.status === 400) {
        toast.error('Senha atual incorreta')
      } else if (error?.status === 422) {
        toast.error('Nova senha não atende aos critérios de segurança')
      } else {
        toast.error('Erro ao alterar senha. Tente novamente.')
      }
    }
  })
}

// Hook para esqueci minha senha
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => 
      apiService.post('/auth/forgot-password', data),
    onSuccess: () => {
      toast.success('Email de recuperação enviado. Verifique sua caixa de entrada.')
    },
    onError: (error: any) => {
      if (error?.status === 404) {
        toast.error('Email não encontrado')
      } else if (error?.status === 429) {
        toast.error('Muitas tentativas. Tente novamente em alguns minutos.')
      } else {
        toast.error('Erro ao enviar email de recuperação. Tente novamente.')
      }
    }
  })
}

// Hook para resetar senha
export const useResetPassword = () => {
  const navigate = useNavigate()
  
  return useMutation({
    mutationFn: (data: ResetPasswordData) => 
      apiService.post('/auth/reset-password', data),
    onSuccess: () => {
      toast.success('Senha redefinida com sucesso!')
      navigate('/auth/login')
    },
    onError: (error: any) => {
      if (error?.status === 400) {
        toast.error('Token inválido ou expirado')
      } else if (error?.status === 422) {
        toast.error('Nova senha não atende aos critérios de segurança')
      } else {
        toast.error('Erro ao redefinir senha. Tente novamente.')
      }
    }
  })
}

// Hook para atualizar perfil
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateProfileData) => 
      apiService.put<User>('/auth/profile', data),
    onSuccess: (updatedUser) => {
      // Atualizar cache do usuário
      queryClient.setQueryData(queryKeys.auth.user(), updatedUser)
      
      // Invalidar queries relacionadas
      invalidateQueries.auth()
      
      toast.success('Perfil atualizado com sucesso')
    },
    onError: (error: any) => {
      if (error?.status === 409) {
        toast.error('Email já está em uso por outro usuário')
      } else if (error?.status === 422) {
        toast.error('Dados inválidos. Verifique os campos.')
      } else {
        toast.error('Erro ao atualizar perfil. Tente novamente.')
      }
    }
  })
}

// Hook para refresh token
export const useRefreshToken = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) throw new Error('No refresh token')
      
      return apiService.post<{ token: string; refreshToken: string }>('/auth/refresh-token', {
        refreshToken
      })
    },
    onSuccess: (data) => {
      // Atualizar tokens
      authServiceHttp.setToken(data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      
      // Invalidar queries para refetch com novo token
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
    },
    onError: () => {
      // Se refresh falhar, fazer logout
      authServiceHttp.clearStorage()
      queryClient.clear()
      window.location.href = '/auth/login'
    }
  })
}

// Hook para verificar se usuário está autenticado
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useCurrentUser()
  const token = authServiceHttp.getStoredToken()
  
  return {
    isAuthenticated: !!token && !!user,
    user,
    isLoading,
    hasRole: (role: string) => user?.role === role,
    hasAnyRole: (roles: string[]) => roles.includes(user?.role || ''),
    isAdmin: () => user?.role === 'admin',
    isManager: () => user?.role === 'manager' || user?.role === 'admin'
  }
}

// Hook para verificação de email
export const useVerifyEmail = () => {
  const navigate = useNavigate()
  
  return useMutation({
    mutationFn: (token: string) => 
      apiService.post('/auth/verify-email', { token }),
    onSuccess: () => {
      toast.success('Email verificado com sucesso!')
      navigate('/auth/login')
    },
    onError: (error: any) => {
      if (error?.status === 400) {
        toast.error('Token de verificação inválido ou expirado')
      } else {
        toast.error('Erro ao verificar email. Tente novamente.')
      }
      navigate('/auth/login')
    }
  })
}