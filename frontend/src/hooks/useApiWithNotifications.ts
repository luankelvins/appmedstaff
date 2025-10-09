import { useCallback } from 'react'
import { httpClient, ApiResponse, ApiError } from '../services/httpClient'
import { useApiNotifications } from '../components/Notifications/NotificationSystem'

interface UseApiWithNotificationsOptions {
  showSuccessNotifications?: boolean
  showErrorNotifications?: boolean
  successMessage?: string
  errorMessage?: string
}

export const useApiWithNotifications = (options: UseApiWithNotificationsOptions = {}) => {
  const {
    showSuccessNotifications = true,
    showErrorNotifications = true,
    successMessage = 'Operação realizada com sucesso',
    errorMessage = 'Erro ao realizar operação'
  } = options

  const { notifySuccess, notifyError, notifyValidationError } = useApiNotifications()

  const handleApiResponse = useCallback(<T>(
    response: ApiResponse<T>,
    customSuccessMessage?: string
  ): ApiResponse<T> => {
    if (response.success && showSuccessNotifications) {
      notifySuccess(
        customSuccessMessage || response.message || successMessage
      )
    }
    return response
  }, [notifySuccess, showSuccessNotifications, successMessage])

  const handleApiError = useCallback((error: any, customErrorMessage?: string) => {
    if (!showErrorNotifications) {
      throw error
    }

    if (error instanceof ApiError) {
      // Erro de validação
      if (error.status === 422 && error.details?.errors) {
        notifyValidationError(error.details.errors)
      } else {
        notifyError(
          customErrorMessage || error.message || errorMessage,
          error.details?.message
        )
      }
    } else {
      notifyError(
        customErrorMessage || errorMessage,
        error.message || 'Erro desconhecido'
      )
    }

    throw error
  }, [notifyError, notifyValidationError, showErrorNotifications, errorMessage])

  // Métodos HTTP com notificações
  const get = useCallback(async <T = any>(
    endpoint: string,
    params?: Record<string, any>,
    customMessages?: { success?: string; error?: string }
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await httpClient.get<T>(endpoint, params)
      return handleApiResponse(response, customMessages?.success)
    } catch (error) {
      return handleApiError(error, customMessages?.error)
    }
  }, [handleApiResponse, handleApiError])

  const post = useCallback(async <T = any>(
    endpoint: string,
    data?: any,
    customMessages?: { success?: string; error?: string }
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await httpClient.post<T>(endpoint, data)
      return handleApiResponse(response, customMessages?.success)
    } catch (error) {
      return handleApiError(error, customMessages?.error)
    }
  }, [handleApiResponse, handleApiError])

  const put = useCallback(async <T = any>(
    endpoint: string,
    data?: any,
    customMessages?: { success?: string; error?: string }
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await httpClient.put<T>(endpoint, data)
      return handleApiResponse(response, customMessages?.success)
    } catch (error) {
      return handleApiError(error, customMessages?.error)
    }
  }, [handleApiResponse, handleApiError])

  const patch = useCallback(async <T = any>(
    endpoint: string,
    data?: any,
    customMessages?: { success?: string; error?: string }
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await httpClient.patch<T>(endpoint, data)
      return handleApiResponse(response, customMessages?.success)
    } catch (error) {
      return handleApiError(error, customMessages?.error)
    }
  }, [handleApiResponse, handleApiError])

  const del = useCallback(async <T = any>(
    endpoint: string,
    customMessages?: { success?: string; error?: string }
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await httpClient.delete<T>(endpoint)
      return handleApiResponse(response, customMessages?.success)
    } catch (error) {
      return handleApiError(error, customMessages?.error)
    }
  }, [handleApiResponse, handleApiError])

  const upload = useCallback(async <T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    customMessages?: { success?: string; error?: string }
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await httpClient.uploadFile<T>(endpoint, file, additionalData)
      return handleApiResponse(response, customMessages?.success)
    } catch (error) {
      return handleApiError(error, customMessages?.error)
    }
  }, [handleApiResponse, handleApiError])

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    // Métodos diretos sem notificações automáticas
    silent: {
      get: httpClient.get.bind(httpClient),
      post: httpClient.post.bind(httpClient),
      put: httpClient.put.bind(httpClient),
      patch: httpClient.patch.bind(httpClient),
      delete: httpClient.delete.bind(httpClient),
      upload: httpClient.uploadFile.bind(httpClient)
    }
  }
}

// Hook específico para operações CRUD
export const useCrudApi = (resource: string, options?: UseApiWithNotificationsOptions) => {
  const api = useApiWithNotifications({
    successMessage: `${resource} atualizado com sucesso`,
    errorMessage: `Erro ao atualizar ${resource}`,
    ...options
  })

  return {
    list: (params?: Record<string, any>) => 
      api.get(`/${resource}`, params),
    
    get: (id: string | number) => 
      api.get(`/${resource}/${id}`),
    
    create: (data: any) => 
      api.post(`/${resource}`, data, {
        success: `${resource} criado com sucesso`,
        error: `Erro ao criar ${resource}`
      }),
    
    update: (id: string | number, data: any) => 
      api.put(`/${resource}/${id}`, data, {
        success: `${resource} atualizado com sucesso`,
        error: `Erro ao atualizar ${resource}`
      }),
    
    delete: (id: string | number) => 
      api.delete(`/${resource}/${id}`, {
        success: `${resource} removido com sucesso`,
        error: `Erro ao remover ${resource}`
      }),
    
    // Métodos silenciosos
    silent: api.silent
  }
}