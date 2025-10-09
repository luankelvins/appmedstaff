interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryCondition?: (error: any) => boolean
}

interface RetryResult<T> {
  data: T | null
  error: any
  attempts: number
  success: boolean
}

/**
 * Executa uma função com retry logic robusto
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    baseDelay = 500,
    maxDelay = 5000,
    backoffFactor = 2,
    retryCondition = (error) => {
      // Retry em casos de timeout, network error ou server error
      return (
        error?.code === 'PGRST301' || // timeout
        error?.message?.includes('timeout') ||
        error?.message?.includes('network') ||
        error?.message?.includes('fetch') ||
        error?.status >= 500 ||
        error?.name === 'AbortError'
      )
    }
  } = options

  let lastError: any
  let attempts = 0

  for (let i = 0; i <= maxRetries; i++) {
    attempts = i + 1
    
    try {
      const result = await operation()
      return {
        data: result,
        error: null,
        attempts,
        success: true
      }
    } catch (error) {
      lastError = error
      
      // Se não deve fazer retry ou é a última tentativa
      if (!retryCondition(error) || i === maxRetries) {
        break
      }
      
      // Calcular delay com backoff exponencial
      const delay = Math.min(baseDelay * Math.pow(backoffFactor, i), maxDelay)
      
      console.warn(`[Retry ${i + 1}/${maxRetries}] Operação falhou, tentando novamente em ${delay}ms:`, error)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return {
    data: null,
    error: lastError,
    attempts,
    success: false
  }
}

/**
 * Retry específico para queries do Supabase
 */
export async function withSupabaseRetry<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  options: RetryOptions = {}
): Promise<{ data: T | null; error: any; attempts: number }> {
  const result = await withRetry(operation, {
    ...options,
    retryCondition: (error) => {
      // Condições específicas para Supabase
      return (
        error?.code === 'PGRST301' || // timeout
        error?.message?.includes('timeout') ||
        error?.message?.includes('network') ||
        error?.message?.includes('fetch') ||
        error?.message?.includes('aborted') ||
        error?.status >= 500 ||
        error?.name === 'AbortError' ||
        // Erros de conexão específicos do Supabase
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('NetworkError')
      )
    }
  })

  if (result.success && result.data) {
    return {
      data: result.data.data,
      error: result.data.error,
      attempts: result.attempts
    }
  }

  return {
    data: null,
    error: result.error,
    attempts: result.attempts
  }
}

/**
 * Retry para operações críticas de autenticação
 */
export async function withAuthRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  return withRetry(operation, {
    maxRetries: 2, // Menos tentativas para auth
    baseDelay: 1000,
    maxDelay: 3000,
    ...options,
    retryCondition: (error) => {
      // Não fazer retry em erros de credenciais
      if (
        error?.message?.includes('Invalid login credentials') ||
        error?.message?.includes('Email not confirmed') ||
        error?.message?.includes('User not found') ||
        error?.status === 401 ||
        error?.status === 403
      ) {
        return false
      }
      
      // Retry apenas em erros de rede/timeout
      return (
        error?.message?.includes('timeout') ||
        error?.message?.includes('network') ||
        error?.message?.includes('fetch') ||
        error?.status >= 500 ||
        error?.name === 'AbortError'
      )
    }
  })
}

/**
 * Retry para queries de dashboard (menos críticas)
 */
export async function withDashboardRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  return withRetry(operation, {
    maxRetries: 2,
    baseDelay: 300,
    maxDelay: 2000,
    ...options
  })
}