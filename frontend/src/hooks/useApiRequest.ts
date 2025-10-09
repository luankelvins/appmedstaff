import { useState, useEffect, useCallback, useRef } from 'react'
import { httpClient, ApiResponse, ApiError } from '../services/httpClient'

// ==================== INTERFACES ====================

export interface UseApiRequestOptions {
  immediate?: boolean
  retries?: number
  retryDelay?: number
  timeout?: number
  onSuccess?: (data: any) => void
  onError?: (error: ApiError) => void
  dependencies?: any[]
}

export interface UseApiRequestState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  isSuccess: boolean
  isError: boolean
  retryCount: number
}

export interface UseApiRequestActions {
  execute: (...args: any[]) => Promise<any>
  retry: () => Promise<any>
  reset: () => void
  cancel: () => void
}

export type UseApiRequestReturn<T> = UseApiRequestState<T> & UseApiRequestActions

// ==================== HOOK PRINCIPAL ====================

export function useApiRequest<T = any>(
  requestFn: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiRequestOptions = {}
): UseApiRequestReturn<T> {
  const {
    immediate = false,
    retries = 3,
    retryDelay = 1000,
    timeout = 10000,
    onSuccess,
    onError,
    dependencies = []
  } = options

  // Estado
  const [state, setState] = useState<UseApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
    isError: false,
    retryCount: 0
  })

  // Refs para controle
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastArgsRef = useRef<any[]>([])
  const mountedRef = useRef(true)

  // Função para executar a requisição
  const execute = useCallback(async (...args: any[]) => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Criar novo controller
    abortControllerRef.current = new AbortController()
    lastArgsRef.current = args

    // Atualizar estado para loading
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      isSuccess: false,
      isError: false
    }))

    let currentRetry = 0
    const maxRetries = retries

    while (currentRetry <= maxRetries) {
      try {
        // Verificar se o componente ainda está montado
        if (!mountedRef.current) {
          return
        }

        const response = await requestFn(...args)

        // Verificar se a requisição foi cancelada
        if (abortControllerRef.current?.signal.aborted) {
          return
        }

        // Verificar se o componente ainda está montado
        if (!mountedRef.current) {
          return
        }

        // Sucesso
        setState(prev => ({
          ...prev,
          data: response.data || null,
          loading: false,
          error: null,
          isSuccess: true,
          isError: false,
          retryCount: currentRetry
        }))

        // Callback de sucesso
        if (onSuccess) {
          onSuccess(response.data)
        }

        return response.data

      } catch (error) {
        const apiError = error as ApiError

        // Verificar se a requisição foi cancelada
        if (abortControllerRef.current?.signal.aborted) {
          return
        }

        // Se não é o último retry, aguardar e tentar novamente
        if (currentRetry < maxRetries) {
          currentRetry++
          
          setState(prev => ({
            ...prev,
            retryCount: currentRetry
          }))

          await new Promise(resolve => setTimeout(resolve, retryDelay * currentRetry))
          continue
        }

        // Verificar se o componente ainda está montado
        if (!mountedRef.current) {
          return
        }

        // Falha final
        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError,
          isSuccess: false,
          isError: true,
          retryCount: currentRetry
        }))

        // Callback de erro
        if (onError) {
          onError(apiError)
        }

        throw apiError
      }
    }
  }, [requestFn, retries, retryDelay, onSuccess, onError])

  // Função para retry
  const retry = useCallback(async () => {
    return execute(...lastArgsRef.current)
  }, [execute])

  // Função para reset
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isSuccess: false,
      isError: false,
      retryCount: 0
    })
  }, [])

  // Função para cancelar
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setState(prev => ({
      ...prev,
      loading: false
    }))
  }, [])

  // Executar imediatamente se solicitado
  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, ...dependencies])

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    ...state,
    execute,
    retry,
    reset,
    cancel
  }
}

// ==================== HOOKS ESPECÍFICOS ====================

// Hook para GET requests
export function useApiGet<T = any>(
  endpoint: string,
  options: UseApiRequestOptions = {}
): UseApiRequestReturn<T> {
  const requestFn = useCallback(() => {
    return httpClient.get<T>(endpoint)
  }, [endpoint])

  return useApiRequest<T>(requestFn, options)
}

// Hook para POST requests
export function useApiPost<T = any>(
  endpoint: string,
  options: UseApiRequestOptions = {}
): UseApiRequestReturn<T> & { post: (data?: any) => Promise<T> } {
  const requestFn = useCallback((data?: any) => {
    return httpClient.post<T>(endpoint, data)
  }, [endpoint])

  const result = useApiRequest<T>(requestFn, options)

  const post = useCallback(async (data?: any) => {
    return result.execute(data)
  }, [result.execute])

  return {
    ...result,
    post
  }
}

// Hook para PUT requests
export function useApiPut<T = any>(
  endpoint: string,
  options: UseApiRequestOptions = {}
): UseApiRequestReturn<T> & { put: (data?: any) => Promise<T> } {
  const requestFn = useCallback((data?: any) => {
    return httpClient.put<T>(endpoint, data)
  }, [endpoint])

  const result = useApiRequest<T>(requestFn, options)

  const put = useCallback(async (data?: any) => {
    return result.execute(data)
  }, [result.execute])

  return {
    ...result,
    put
  }
}

// Hook para DELETE requests
export function useApiDelete<T = any>(
  endpoint: string,
  options: UseApiRequestOptions = {}
): UseApiRequestReturn<T> & { remove: () => Promise<T> } {
  const requestFn = useCallback(() => {
    return httpClient.delete<T>(endpoint)
  }, [endpoint])

  const result = useApiRequest<T>(requestFn, options)

  const remove = useCallback(async () => {
    return result.execute()
  }, [result.execute])

  return {
    ...result,
    remove
  }
}

// ==================== HOOK PARA MÚLTIPLAS REQUISIÇÕES ====================

export function useApiMultiple<T = any>(
  requests: Array<() => Promise<ApiResponse<any>>>,
  options: UseApiRequestOptions = {}
): UseApiRequestReturn<T[]> {
  const requestFn = useCallback(async () => {
    const results = await Promise.allSettled(requests.map(req => req()))
    
    const data = results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value.data
      }
      return null
    })

    const errors = results
      .filter(result => result.status === 'rejected')
      .map(result => (result as PromiseRejectedResult).reason)

    if (errors.length > 0) {
      throw errors[0] // Lançar o primeiro erro
    }

    return { data, success: true }
  }, [requests])

  return useApiRequest<T[]>(requestFn, options)
}

// ==================== HOOK PARA PAGINAÇÃO ====================

export interface UsePaginatedApiOptions extends UseApiRequestOptions {
  initialPage?: number
  initialLimit?: number
}

export interface UsePaginatedApiReturn<T> extends UseApiRequestState<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  loadPage: (page: number) => Promise<void>
  loadMore: () => Promise<void>
  setLimit: (limit: number) => void
  refresh: () => Promise<void>
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export function usePaginatedApi<T = any>(
  endpoint: string,
  options: UsePaginatedApiOptions = {}
): UsePaginatedApiReturn<T> {
  const { initialPage = 1, initialLimit = 10, ...requestOptions } = options
  
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0
  })

  const requestFn = useCallback((page: number, limit: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    return httpClient.get<T[]>(`${endpoint}?${params}`)
  }, [endpoint])

  const result = useApiRequest<T[]>(requestFn, {
    ...requestOptions,
    onSuccess: (response) => {
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination
        }))
      }
      requestOptions.onSuccess?.(response)
    }
  })

  const loadPage = useCallback(async (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    return result.execute(page, pagination.limit)
  }, [result.execute, pagination.limit])

  const loadMore = useCallback(async () => {
    if (pagination.page < pagination.pages) {
      return loadPage(pagination.page + 1)
    }
  }, [loadPage, pagination.page, pagination.pages])

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
    result.execute(1, limit)
  }, [result.execute])

  const refresh = useCallback(async () => {
    return result.execute(pagination.page, pagination.limit)
  }, [result.execute, pagination.page, pagination.limit])

  // Executar na primeira vez
  useEffect(() => {
    if (requestOptions.immediate !== false) {
      result.execute(pagination.page, pagination.limit)
    }
  }, [])

  return {
    ...result,
    pagination,
    loadPage,
    loadMore,
    setLimit,
    refresh,
    hasNextPage: pagination.page < pagination.pages,
    hasPreviousPage: pagination.page > 1
  }
}