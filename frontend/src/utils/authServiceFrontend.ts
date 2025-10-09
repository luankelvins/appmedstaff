import type { AuthResponse, LoginData, RegisterData } from '../types/database';

export class AuthServiceFrontend {
  private static instance: AuthServiceFrontend;
  private baseUrl = '/api'; // Assumindo que teremos endpoints de API

  static getInstance(): AuthServiceFrontend {
    if (!AuthServiceFrontend.instance) {
      AuthServiceFrontend.instance = new AuthServiceFrontend();
    }
    return AuthServiceFrontend.instance;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Por enquanto, vamos simular uma resposta de sucesso
      // Em produção, isso faria uma chamada para o backend
      const mockUser = {
        id: '1',
        email: data.email,
        nome: 'Usuário Teste',
        status: 'ativo' as const
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      // Salvar token no localStorage
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      return {
        user: mockUser,
        token: mockToken,
        expires_in: 86400 // 24 horas em segundos
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw new Error('Erro ao fazer login');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Por enquanto, vamos simular uma resposta de sucesso
      // Em produção, isso faria uma chamada para o backend
      const mockUser = {
        id: '2',
        email: data.email,
        nome: data.nome,
        status: 'ativo' as const
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      // Salvar token no localStorage
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      return {
        user: mockUser,
        token: mockToken,
        expires_in: 86400 // 24 horas em segundos
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      throw new Error('Erro ao registrar usuário');
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      // Por enquanto, vamos simular uma verificação simples
      // Em produção, isso faria uma chamada para o backend
      if (token && token.startsWith('mock-jwt-token-')) {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          return JSON.parse(userData);
        }
      }
      throw new Error('Token inválido');
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      throw new Error('Token inválido');
    }
  }

  async getCurrentUser(userId: string) {
    try {
      // Por enquanto, vamos buscar do localStorage
      // Em produção, isso faria uma chamada para o backend
      const userData = localStorage.getItem('user_data');
      if (userData) {
        return JSON.parse(userData);
      }
      throw new Error('Usuário não encontrado');
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      throw new Error('Erro ao buscar dados do usuário');
    }
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Por enquanto, vamos simular sucesso
      // Em produção, isso faria uma chamada para o backend
      console.log('Senha atualizada com sucesso (simulado)');
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw new Error('Erro ao atualizar senha');
    }
  }

  async logout(): Promise<void> {
    try {
      // Remover dados do localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    } catch (error) {
      console.error('Erro no logout:', error);
      throw new Error('Erro ao fazer logout');
    }
  }

  // Métodos utilitários para o frontend
  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getStoredUser(): any | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }
}

export const authServiceFrontend = AuthServiceFrontend.getInstance();