import { authServiceHttp } from '../utils/authServiceHttp'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = authServiceHttp.getStoredToken()
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
      if (response.status === 401) {
        authServiceHttp.logout()
        throw new Error('Token inválido ou expirado')
      }
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Dashboard endpoints
  async getQuickStats() {
    return this.makeRequest('/dashboard/quick-stats')
  }

  async getTasksMetrics() {
    return this.makeRequest('/dashboard/tasks-metrics')
  }

  async getLeadsMetrics() {
    return this.makeRequest('/dashboard/leads-metrics')
  }

  async getFinancialMetrics() {
    return this.makeRequest('/dashboard/financial-metrics')
  }

  async getSystemMetrics() {
    return this.makeRequest('/dashboard/system-metrics')
  }

  async getNotifications() {
    return this.makeRequest('/dashboard/notifications')
  }

  // Generic GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' })
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiService = new ApiService()