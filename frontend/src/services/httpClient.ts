import { authServiceHttp } from '../utils/authServiceHttp'
import { 
  API_CONFIG, 
  HTTP_STATUS, 
  ERROR_MESSAGES, 
  buildApiUrl, 
  buildQueryString,
  isSuccessStatus,
  isAuthError,
  isValidationError,
  type ApiResponse 
} from '../config/api'

// ==================== CLASSES DE ERRO ====================

export class ApiError extends Error {
  status?: number
  code?: string
  details?: any
  timestamp: string

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

// Re-exportar tipos da configuração
export type { ApiResponse }

// ==================== CLIENTE HTTP ====================

class HttpClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private requestQueue: Map<string, Promise<any>> = new Map()
  private retryAttempts: Map<string, number> = new Map()
  private rateLimitMap: Map<string, number[]> = new Map()

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private getAuthHeaders(): Record<string, string> {
    const token = authServiceHttp.getStoredToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private generateRequestKey(endpoint: string, options: RequestInit): string {
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : ''
    return `${method}:${endpoint}:${body}`
  }

  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now()
    const windowMs = 60000 // 1 minuto
    const maxRequests = 100 // máximo 100 requests por minuto por endpoint

    if (!this.rateLimitMap.has(endpoint)) {
      this.rateLimitMap.set(endpoint, [])
    }

    const requests = this.rateLimitMap.get(endpoint)!
    const validRequests = requests.filter(time => now - time < windowMs)
    
    if (validRequests.length >= maxRequests) {
      console.warn(`[Security] Rate limit exceeded for endpoint: ${endpoint}`)
      return false
    }

    validRequests.push(now)
    this.rateLimitMap.set(endpoint, validRequests)
    return true
  }

  private async retryRequest<T>(
    endpoint: string,
    options: RequestInit,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const maxRetries = 3
    const retryDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Exponential backoff

    try {
      return await this.makeRequestInternal<T>(endpoint, options)
    } catch (error) {
      if (attempt < maxRetries && error instanceof ApiError) {
        // Retry em casos específicos
        if (error.status === 429 || error.status === 503 || error.status === 502) {
          console.log(`[Security] Retrying request ${attempt}/${maxRetries} for ${endpoint}`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          return this.retryRequest<T>(endpoint, options, attempt + 1)
        }
      }
      throw error
    }
  }

  private logSecurityEvent(event: string, details: any) {
    const timestamp = new Date().toISOString()
    console.log(`[Security] ${timestamp} - ${event}:`, details)
    
    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Implementar envio para serviço de logs/monitoramento
    }
  }

  private async makeRequestInternal<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
        ...options.headers
      }
    }

    // Timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)
    config.signal = controller.signal

    try {
      const response = await fetch(url, config)
      clearTimeout(timeoutId)

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type')
      const isJson = contentType?.includes('application/json')

      let data: any
      if (isJson) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      // Tratar erros de autenticação
      if (response.status === 401) {
        authServiceHttp.clearStorage()
        window.location.href = '/login'
        throw new ApiError('Token inválido ou expirado', 401, 'UNAUTHORIZED')
      }

      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `Erro ${response.status}`
        throw new ApiError(errorMessage, response.status, data?.code, data)
      }

      // Retornar resposta formatada
      return {
        success: true,
        data: data?.data || data,
        message: data?.message,
        pagination: data?.pagination
      }

    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Timeout na requisição', 408, 'TIMEOUT')
        }
        throw new ApiError(error.message, undefined, 'NETWORK_ERROR', error)
      }

      throw new ApiError('Erro desconhecido', 500, 'UNKNOWN_ERROR')
    }
  }

  // Método público com interceptadores de segurança
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Verificar rate limiting
    if (!this.checkRateLimit(endpoint)) {
      throw new ApiError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED')
    }

    // Gerar chave única para a requisição
    const requestKey = this.generateRequestKey(endpoint, options)

    // Deduplicação de requisições (para GET requests)
    if (options.method === 'GET' || !options.method) {
      if (this.requestQueue.has(requestKey)) {
        this.logSecurityEvent('REQUEST_DEDUPLICATED', { endpoint, method: options.method })
        return this.requestQueue.get(requestKey)!
      }
    }

    // Executar requisição com retry
    const requestPromise = this.retryRequest<T>(endpoint, options)

    // Adicionar à fila de requisições
    if (options.method === 'GET' || !options.method) {
      this.requestQueue.set(requestKey, requestPromise)
      
      // Remover da fila após completar
      requestPromise.finally(() => {
        this.requestQueue.delete(requestKey)
      })
    }

    // Log de segurança
    this.logSecurityEvent('REQUEST_INITIATED', {
      endpoint,
      method: options.method || 'GET',
      hasAuth: !!this.getAuthHeaders().Authorization
    })

    return requestPromise
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    return this.makeRequest<T>(url, { method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' })
  }

  // ==================== MÉTODOS DE UPLOAD ====================

  async uploadFile<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Não definir Content-Type para FormData (o browser define automaticamente)
        ...this.getAuthHeaders()
      }
    })
  }

  // ==================== MÉTODOS DE VALIDAÇÃO ====================

  validateRequest(data: any, rules: Record<string, any>): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {}

    Object.entries(rules).forEach(([field, rule]) => {
      const value = data[field]
      const fieldErrors: string[] = []

      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push('Este campo é obrigatório')
      }

      if (value && rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        fieldErrors.push('Email inválido')
      }

      if (value && rule.minLength && String(value).length < rule.minLength) {
        fieldErrors.push(`Deve ter pelo menos ${rule.minLength} caracteres`)
      }

      if (value && rule.maxLength && String(value).length > rule.maxLength) {
        fieldErrors.push(`Deve ter no máximo ${rule.maxLength} caracteres`)
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

// ==================== INSTÂNCIA SINGLETON ====================

export const httpClient = new HttpClient()

// ==================== MÉTODOS DE CONVENIÊNCIA ====================

export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, any>) => 
    httpClient.get<T>(endpoint, params),
  
  post: <T = any>(endpoint: string, data?: any) => 
    httpClient.post<T>(endpoint, data),
  
  put: <T = any>(endpoint: string, data?: any) => 
    httpClient.put<T>(endpoint, data),
  
  patch: <T = any>(endpoint: string, data?: any) => 
    httpClient.patch<T>(endpoint, data),
  
  delete: <T = any>(endpoint: string) => 
    httpClient.delete<T>(endpoint),
  
  upload: <T = any>(endpoint: string, file: File, additionalData?: Record<string, any>) => 
    httpClient.uploadFile<T>(endpoint, file, additionalData)
}

export default httpClient