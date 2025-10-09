import type { AuthResponse, LoginData, RegisterData } from '../types/database';

export class AuthServiceHttp {
  private static instance: AuthServiceHttp;
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  static getInstance(): AuthServiceHttp {
    if (!AuthServiceHttp.instance) {
      AuthServiceHttp.instance = new AuthServiceHttp();
    }
    return AuthServiceHttp.instance;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao fazer login');
      }

      const authResponse: AuthResponse = await response.json();
      return authResponse;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao registrar usuário');
      }

      const authResponse: AuthResponse = await response.json();
      return authResponse;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token inválido');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      throw error;
    }
  }

  async getCurrentUser(userId: string, token: string) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do usuário');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao atualizar senha');
      }
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    // Para JWT, o logout é feito no frontend removendo o token
    return Promise.resolve();
  }

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

export const authServiceHttp = AuthServiceHttp.getInstance();