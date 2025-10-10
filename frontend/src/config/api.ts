/**
 * Configurações centralizadas da API
 * 
 * Este arquivo contém todas as configurações relacionadas à comunicação
 * com o backend da aplicação MedStaff.
 */

// ==================== CONFIGURAÇÕES BASE ====================

export const API_CONFIG = {
  // URL base da API
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  // Timeout padrão para requisições (em ms)
  TIMEOUT: 10000,
  
  // Versão da API
  VERSION: 'v1',
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Configurações de retry
  RETRY: {
    attempts: 3,
    delay: 1000, // ms
    backoff: 2, // multiplicador para delay exponencial
  },
  
  // Configurações de cache
  CACHE: {
    defaultTTL: 5 * 60 * 1000, // 5 minutos em ms
    maxSize: 100, // máximo de entradas no cache
  }
} as const

// ==================== ENDPOINTS ====================

export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // 2FA
  TWO_FACTOR: {
    GENERATE_SECRET: '/2fa/generate-secret',
    VERIFY: '/2fa/verify',
    DISABLE: '/2fa/disable',
    STATUS: '/2fa/status',
  },
  
  // Dashboard
  DASHBOARD: {
    QUICK_STATS: '/dashboard/quick-stats',
    TASKS_METRICS: '/dashboard/tasks-metrics',
    LEADS_METRICS: '/dashboard/leads-metrics',
    FINANCIAL_METRICS: '/dashboard/financial-metrics',
    SYSTEM_METRICS: '/dashboard/system-metrics',
  },
  
  // Funcionários
  EMPLOYEES: {
    LIST: '/employees',
    CREATE: '/employees',
    GET_BY_ID: (id: string) => `/employees/${id}`,
    UPDATE: (id: string) => `/employees/${id}`,
    DELETE: (id: string) => `/employees/${id}`,
    UPDATE_STATUS: (id: string) => `/employees/${id}/status`,
    SEARCH: '/employees/search',
    STATS: '/employees/stats',
  },
  
  // Tarefas
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    GET_BY_ID: (id: string) => `/tasks/${id}`,
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    UPDATE_STATUS: (id: string) => `/tasks/${id}/status`,
    BY_USER: (userId: string) => `/tasks/user/${userId}`,
    BY_ASSIGNED: (userId: string) => `/tasks/assigned/${userId}`,
    STATS: '/tasks/stats',
  },
  
  // Leads
  LEADS: {
    LIST: '/leads',
    CREATE: '/leads',
    GET_BY_ID: (id: string) => `/leads/${id}`,
    UPDATE: (id: string) => `/leads/${id}`,
    DELETE: (id: string) => `/leads/${id}`,
    UPDATE_STATUS: (id: string) => `/leads/${id}/status`,
    BY_RESPONSIBLE: (responsibleId: string) => `/leads/responsible/${responsibleId}`,
    BY_STATUS: (status: string) => `/leads/status/${status}`,
    FOLLOW_UP: '/leads/follow-up',
    STATS: '/leads/stats',
  },
  
  // Clientes PF
  CLIENTS_PF: {
    LIST: '/clientes-pf',
    CREATE: '/clientes-pf',
    GET_BY_ID: (id: string) => `/clientes-pf/${id}`,
    UPDATE: (id: string) => `/clientes-pf/${id}`,
    DELETE: (id: string) => `/clientes-pf/${id}`,
    SEARCH: '/clientes-pf/search',
  },
  
  // Clientes PJ
  CLIENTS_PJ: {
    LIST: '/clientes-pj',
    CREATE: '/clientes-pj',
    GET_BY_ID: (id: string) => `/clientes-pj/${id}`,
    UPDATE: (id: string) => `/clientes-pj/${id}`,
    DELETE: (id: string) => `/clientes-pj/${id}`,
    SEARCH: '/clientes-pj/search',
  },
  
  // Notificações
  NOTIFICATIONS: {
    LIST: '/notifications',
    CREATE: '/notifications',
    GET_BY_ID: (id: string) => `/notifications/${id}`,
    UPDATE: (id: string) => `/notifications/${id}`,
    DELETE: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_UNREAD: (id: string) => `/notifications/${id}/unread`,
    BY_USER: (userId: string) => `/notifications/user/${userId}`,
    UNREAD_BY_USER: (userId: string) => `/notifications/user/${userId}/unread`,
    UNREAD_COUNT: (userId: string) => `/notifications/user/${userId}/unread/count`,
  },
  
  // Despesas/Financeiro
  EXPENSES: {
    LIST: '/expenses',
    CREATE: '/expenses',
    GET_BY_ID: (id: string) => `/expenses/${id}`,
    UPDATE: (id: string) => `/expenses/${id}`,
    DELETE: (id: string) => `/expenses/${id}`,
    APPROVE: (id: string) => `/expenses/${id}/approve`,
    REJECT: (id: string) => `/expenses/${id}/reject`,
    OVERDUE: '/expenses/overdue',
    DUE_SOON: '/expenses/due-soon',
    TOTAL_BY_PERIOD: (period: string) => `/expenses/total/${period}`,
  },
  
  // Dashboard de Segurança
  SECURITY: {
    OVERVIEW: '/security-dashboard/overview',
    ALERTS: '/security-dashboard/alerts',
    METRICS: '/security-dashboard/metrics',
  },
  
  // Upload de arquivos
  UPLOAD: {
    AVATAR: '/upload/avatar',
    DOCUMENT: '/upload/document',
    EXPENSE_RECEIPT: '/upload/expense-receipt',
  },
} as const

// ==================== TIPOS DE RESPOSTA ====================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface SearchParams extends PaginationParams {
  q?: string
  filters?: Record<string, any>
}

// ==================== CÓDIGOS DE STATUS ====================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

// ==================== MENSAGENS DE ERRO ====================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  TIMEOUT_ERROR: 'Tempo limite excedido. Tente novamente.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
  UNKNOWN_ERROR: 'Erro desconhecido. Entre em contato com o suporte.',
} as const

// ==================== UTILITÁRIOS ====================

/**
 * Constrói URL completa para um endpoint
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '')
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${cleanEndpoint}`
}

/**
 * Constrói query string a partir de parâmetros
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(value))
      }
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Verifica se um status code indica sucesso
 */
export const isSuccessStatus = (status: number): boolean => {
  return status >= 200 && status < 300
}

/**
 * Verifica se um erro é de autenticação
 */
export const isAuthError = (status: number): boolean => {
  return status === HTTP_STATUS.UNAUTHORIZED
}

/**
 * Verifica se um erro é de validação
 */
export const isValidationError = (status: number): boolean => {
  return status === HTTP_STATUS.BAD_REQUEST || status === HTTP_STATUS.UNPROCESSABLE_ENTITY
}