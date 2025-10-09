import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { apiService } from '../services/apiService'
import { queryKeys, invalidateQueries } from '../config/queryClient'
import { toast } from 'react-hot-toast'

// Types para Files
export interface FileItem {
  id: string
  name: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  uploadedBy: string
  uploadedAt: string
  category: 'document' | 'image' | 'video' | 'audio' | 'other'
  tags: string[]
  isPublic: boolean
  downloadCount: number
  metadata?: Record<string, any>
}

export interface FileUploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

export interface FileFilters {
  category?: string
  mimeType?: string
  tags?: string[]
  uploadedBy?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  isPublic?: boolean
}

export interface PaginatedFiles {
  files: FileItem[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface UploadFileData {
  file: File
  category?: string
  tags?: string[]
  isPublic?: boolean
  metadata?: Record<string, any>
}

// Hook para listar arquivos com paginação
export const useFiles = (filters: FileFilters = {}, limit: number = 20) => {
  return useInfiniteQuery<PaginatedFiles, Error>({
    queryKey: queryKeys.files.list(filters),
    queryFn: ({ pageParam = 1 }) => 
      apiService.get<PaginatedFiles>(`/files?page=${pageParam}&limit=${limit}&${new URLSearchParams(filters as any).toString()}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedFiles) => 
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutos
    meta: {
      errorMessage: 'Erro ao carregar arquivos'
    }
  })
}

// Hook para obter detalhes de um arquivo
export const useFile = (fileId: string) => {
  return useQuery({
    queryKey: queryKeys.files.detail(fileId),
    queryFn: () => apiService.get<FileItem>(`/files/${fileId}`),
    enabled: !!fileId,
    staleTime: 1000 * 60 * 10, // 10 minutos
    meta: {
      errorMessage: 'Erro ao carregar detalhes do arquivo'
    }
  })
}

// Hook para upload de arquivo
export const useUploadFile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: UploadFileData) => {
      const formData = new FormData()
      formData.append('file', data.file)
      
      if (data.category) formData.append('category', data.category)
      if (data.isPublic !== undefined) formData.append('isPublic', String(data.isPublic))
      if (data.tags) formData.append('tags', JSON.stringify(data.tags))
      if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata))
      
      // Upload com progress tracking
      return new Promise<FileItem>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            // Aqui você pode emitir eventos de progresso se necessário
            console.log(`Upload progress: ${progress}%`)
          }
        })
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } catch (error) {
              reject(new Error('Erro ao processar resposta do servidor'))
            }
          } else {
            reject(new Error(`Erro no upload: ${xhr.status} ${xhr.statusText}`))
          }
        })
        
        xhr.addEventListener('error', () => {
          reject(new Error('Erro de rede durante o upload'))
        })
        
        xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/files/upload`)
        
        // Adicionar token de autenticação
        const token = localStorage.getItem('auth_token')
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }
        
        xhr.send(formData)
      })
    },
    onSuccess: (uploadedFile) => {
      // Invalidar queries de arquivos
      invalidateQueries.files()
      
      toast.success(`Arquivo "${uploadedFile.originalName}" enviado com sucesso`)
    },
    onError: (error: any) => {
      console.error('Upload error:', error)
      toast.error(error.message || 'Erro ao enviar arquivo')
    }
  })
}

// Hook para upload múltiplo
export const useUploadMultipleFiles = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (files: UploadFileData[]) => {
      const uploadPromises = files.map(async (fileData) => {
        const formData = new FormData()
        formData.append('file', fileData.file)
        
        if (fileData.category) formData.append('category', fileData.category)
        if (fileData.isPublic !== undefined) formData.append('isPublic', String(fileData.isPublic))
        if (fileData.tags) formData.append('tags', JSON.stringify(fileData.tags))
        if (fileData.metadata) formData.append('metadata', JSON.stringify(fileData.metadata))
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/files/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: formData
        })
        
        if (!response.ok) {
          throw new Error(`Erro no upload de ${fileData.file.name}`)
        }
        
        return response.json()
      })
      
      return Promise.all(uploadPromises)
    },
    onSuccess: (uploadedFiles) => {
      invalidateQueries.files()
      toast.success(`${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao enviar arquivos')
    }
  })
}

// Hook para deletar arquivo
export const useDeleteFile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (fileId: string) => apiService.delete(`/files/${fileId}`),
    onSuccess: (_, fileId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: queryKeys.files.detail(fileId) })
      
      // Invalidar listas
      invalidateQueries.files()
      
      toast.success('Arquivo deletado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao deletar arquivo')
    }
  })
}

// Hook para atualizar metadados do arquivo
export const useUpdateFile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ fileId, data }: { fileId: string; data: Partial<FileItem> }) =>
      apiService.put<FileItem>(`/files/${fileId}`, data),
    onSuccess: (updatedFile) => {
      // Atualizar cache
      queryClient.setQueryData(queryKeys.files.detail(updatedFile.id), updatedFile)
      
      // Invalidar listas
      invalidateQueries.files()
      
      toast.success('Arquivo atualizado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao atualizar arquivo')
    }
  })
}

// Hook para download de arquivo
export const useDownloadFile = () => {
  return useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao baixar arquivo')
      }
      
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'download'
      
      // Criar link de download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return { filename, size: blob.size }
    },
    onSuccess: (data) => {
      toast.success(`Download de "${data.filename}" iniciado`)
    },
    onError: () => {
      toast.error('Erro ao baixar arquivo')
    }
  })
}

// Hook para obter estatísticas de arquivos
export const useFileStats = () => {
  return useQuery({
    queryKey: queryKeys.files.stats(),
    queryFn: () => apiService.get<{
      totalFiles: number
      totalSize: number
      byCategory: Record<string, number>
      byMimeType: Record<string, number>
      recentUploads: number
    }>('/files/stats'),
    staleTime: 1000 * 60 * 5, // 5 minutos
    meta: {
      errorMessage: 'Erro ao carregar estatísticas de arquivos'
    }
  })
}

// Hook para buscar arquivos
export const useSearchFiles = (query: string, filters: FileFilters = {}) => {
  return useQuery<PaginatedFiles, Error>({
    queryKey: queryKeys.files.search(query, filters),
    queryFn: () => 
      apiService.get<PaginatedFiles>(`/files/search?q=${encodeURIComponent(query)}&${new URLSearchParams(filters as any).toString()}`),
    enabled: !!query.trim(),
    staleTime: 1000 * 60 * 2, // 2 minutos
    meta: {
      errorMessage: 'Erro ao buscar arquivos'
    }
  })
}

// Hook para obter tags disponíveis
export const useFileTags = () => {
  return useQuery({
    queryKey: queryKeys.files.tags(),
    queryFn: () => apiService.get<string[]>('/files/tags'),
    staleTime: 1000 * 60 * 10, // 10 minutos
    meta: {
      errorMessage: 'Erro ao carregar tags'
    }
  })
}

// Hook para compartilhar arquivo
export const useShareFile = () => {
  return useMutation({
    mutationFn: ({ fileId, expiresIn, password }: { 
      fileId: string
      expiresIn?: number
      password?: string 
    }) => apiService.post<{ shareUrl: string; expiresAt: string }>(`/files/${fileId}/share`, {
      expiresIn,
      password
    }),
    onSuccess: (data) => {
      // Copiar URL para clipboard
      navigator.clipboard.writeText(data.shareUrl)
      toast.success('Link de compartilhamento copiado para a área de transferência')
    },
    onError: () => {
      toast.error('Erro ao gerar link de compartilhamento')
    }
  })
}