/**
 * Serviço de Autenticação
 * 
 * Gerencia todas as operações relacionadas à autenticação de usuários,
 * incluindo login, logout, registro, recuperação de senha e 2FA.
 */

import { httpClient, type ApiResponse } from './httpClient'
import { API_ENDPOINTS } from '../config/api'
import type { 
  AuthResponse, 
  LoginData, 
  RegisterData,
  Employee 
} from '../types/database'

// ==================== INTERFACES ====================

interface LoginRequest {
  email: string
  password: string
  twoFactorCode?: string
}

interface RegisterRequest {
  nome: string
  email: string
  password: string
  confirmPassword: string
  cpf: string
  telefone?: string
}

interface ForgotPasswordRequest {
  email: string
}

interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface TwoFactorSetupResponse {
  secret: string
  qrCode: string
  backupCodes: string[]
}

interface TwoFactorVerifyRequest {
  code: string
}

interface AuthUser {
  id: string
  email: string
  nome: string
  role?: string
  permissions?: string[]
  lastLogin?: string
}

// ==================== CLASSE DO SERVIÇO ====================

class AuthService {
  private tokenKey = 'auth_token'
  private refreshTokenKey = 'refresh_token'
  private userKey = 'auth_user'

  // ==================== AUTENTICAÇÃO BÁSICA ====================

  /**
   * Realiza login do usuário
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await httpClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      )

      if (response.success && response.data) {
        this.setTokens(response.data.token)
        if (response.data.user) {
          this.setUser(response.data.user)
        }
      }

      return response
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<ApiResponse> {
    try {
      const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT)
      
      // Limpar dados locais independente da resposta do servidor
      this.clearAuthData()
      
      return response
    } catch (error) {
      // Mesmo com erro, limpar dados locais
      this.clearAuthData()
      console.error('Erro no logout:', error)
      throw error
    }
  }

  /**
   * Registra novo usuário
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await httpClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      )

      if (response.success && response.data) {
        this.setTokens(response.data.token)
        if (response.data.user) {
          this.setUser(response.data.user)
        }
      }

      return response
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    }
  }

  /**
   * Obtém dados do usuário atual
   */
  async getCurrentUser(): Promise<ApiResponse<AuthUser>> {
    try {
      const response = await httpClient.get<AuthUser>(API_ENDPOINTS.AUTH.ME)
      
      if (response.success && response.data) {
        this.setUser(response.data)
      }
      
      return response
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error)
      throw error
    }
  }

  /**
   * Atualiza token de acesso
   */
  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado')
      }

      const response = await httpClient.post<{ token: string; refreshToken: string }>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      )

      if (response.success && response.data) {
        this.setTokens(response.data.token, response.data.refreshToken)
      }

      return response
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      this.clearAuthData()
      throw error
    }
  }

  // ==================== RECUPERAÇÃO DE SENHA ====================

  /**
   * Solicita recuperação de senha
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    try {
      return await httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data)
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error)
      throw error
    }
  }

  /**
   * Redefine senha com token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    try {
      return await httpClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data)
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      throw error
    }
  }

  /**
   * Altera senha do usuário logado
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    try {
      return await httpClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data)
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      throw error
    }
  }

  // ==================== AUTENTICAÇÃO DE DOIS FATORES ====================

  /**
   * Gera secret para configuração do 2FA
   */
  async generateTwoFactorSecret(): Promise<ApiResponse<TwoFactorSetupResponse>> {
    try {
      return await httpClient.post<TwoFactorSetupResponse>(
        API_ENDPOINTS.TWO_FACTOR.GENERATE_SECRET
      )
    } catch (error) {
      console.error('Erro ao gerar secret 2FA:', error)
      throw error
    }
  }

  /**
   * Verifica código 2FA
   */
  async verifyTwoFactor(data: TwoFactorVerifyRequest): Promise<ApiResponse> {
    try {
      return await httpClient.post(API_ENDPOINTS.TWO_FACTOR.VERIFY, data)
    } catch (error) {
      console.error('Erro ao verificar 2FA:', error)
      throw error
    }
  }

  /**
   * Desabilita 2FA
   */
  async disableTwoFactor(): Promise<ApiResponse> {
    try {
      return await httpClient.post(API_ENDPOINTS.TWO_FACTOR.DISABLE)
    } catch (error) {
      console.error('Erro ao desabilitar 2FA:', error)
      throw error
    }
  }

  /**
   * Obtém status do 2FA
   */
  async getTwoFactorStatus(): Promise<ApiResponse<{ enabled: boolean }>> {
    try {
      return await httpClient.get<{ enabled: boolean }>(
        API_ENDPOINTS.TWO_FACTOR.STATUS
      )
    } catch (error) {
      console.error('Erro ao obter status 2FA:', error)
      throw error
    }
  }

  // ==================== GERENCIAMENTO DE TOKENS ====================

  /**
   * Obtém token de acesso armazenado
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  /**
   * Obtém refresh token armazenado
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey)
  }

  /**
   * Define tokens no localStorage
   */
  private setTokens(token: string, refreshToken?: string): void {
    localStorage.setItem(this.tokenKey, token)
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken)
    }
  }

  /**
   * Remove tokens do localStorage
   */
  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
  }

  // ==================== GERENCIAMENTO DE USUÁRIO ====================

  /**
   * Obtém dados do usuário armazenados
   */
  getUser(): AuthUser | null {
    const userData = localStorage.getItem(this.userKey)
    return userData ? JSON.parse(userData) : null
  }

  /**
   * Define dados do usuário no localStorage
   */
  private setUser(user: AuthUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user))
  }

  /**
   * Remove dados do usuário do localStorage
   */
  private clearUser(): void {
    localStorage.removeItem(this.userKey)
  }

  /**
   * Limpa todos os dados de autenticação
   */
  private clearAuthData(): void {
    this.clearTokens()
    this.clearUser()
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token && !this.isTokenExpired(token)
  }

  /**
   * Verifica se o token está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch {
      return true
    }
  }

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  hasPermission(permission: string): boolean {
    const user = this.getUser()
    return user?.permissions?.includes(permission) || false
  }

  /**
   * Verifica se o usuário tem um dos papéis especificados
   */
  hasRole(roles: string | string[]): boolean {
    const user = this.getUser()
    if (!user?.role) return false

    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  /**
   * Verifica se o usuário é administrador
   */
  isAdmin(): boolean {
    return this.hasRole(['admin', 'super_admin'])
  }

  /**
   * Obtém informações básicas do usuário para exibição
   */
  getUserDisplayInfo(): { nome: string; email: string; role: string } | null {
    const user = this.getUser()
    if (!user) return null

    return {
      nome: user.nome,
      email: user.email,
      role: user.role || 'user'
    }
  }
}

// ==================== EXPORTAÇÃO ====================

export const authService = new AuthService()
export default authService