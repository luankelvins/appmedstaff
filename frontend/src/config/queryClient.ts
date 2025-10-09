import { QueryClient, DefaultOptions } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

// Configurações padrão para queries
const queryConfig: DefaultOptions = {
  queries: {
    // Tempo de cache padrão: 5 minutos
    staleTime: 1000 * 60 * 5,
    // Tempo para garbage collection: 10 minutos
    gcTime: 1000 * 60 * 10,
    // Retry automático em caso de erro
    retry: (failureCount, error: any) => {
      // Não retry para erros 4xx (exceto 408, 429)
      if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
        return false
      }
      // Máximo 3 tentativas
      return failureCount < 3
    },
    // Delay entre retries (exponential backoff)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch quando a janela ganha foco
    refetchOnWindowFocus: false,
    // Refetch quando reconecta à internet
    refetchOnReconnect: true,
    // Configuração de network mode
    networkMode: 'online',
  },
  mutations: {
    // Retry para mutations apenas em casos específicos
    retry: (failureCount, error: any) => {
      // Retry apenas para erros de rede ou 5xx
      if (error?.status >= 500 || !error?.status) {
        return failureCount < 2
      }
      return false
    },
    // Network mode para mutations
    networkMode: 'online',
    // Handler global para erros de mutation
    onError: (error: any) => {
      console.error('Mutation error:', error)
      
      // Mostrar toast de erro baseado no tipo
      if (error?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
      } else if (error?.status === 403) {
        toast.error('Você não tem permissão para esta ação.')
      } else if (error?.status === 422) {
        toast.error('Dados inválidos. Verifique os campos.')
      } else if (error?.status >= 500) {
        toast.error('Erro interno do servidor. Tente novamente.')
      } else {
        toast.error(error?.message || 'Erro inesperado. Tente novamente.')
      }
    },
    // Handler global para sucesso de mutation
    onSuccess: () => {
      // Pode ser sobrescrito por mutations específicas
    }
  }
}

// Criar instância do QueryClient
export const queryClient = new QueryClient({
  defaultOptions: queryConfig
})

// Query keys centralizadas para melhor organização
export const queryKeys = {
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    quickStats: () => [...queryKeys.dashboard.all, 'quick-stats'] as const,
    tasksMetrics: () => [...queryKeys.dashboard.all, 'tasks-metrics'] as const,
    leadsMetrics: () => [...queryKeys.dashboard.all, 'leads-metrics'] as const,
    financialMetrics: () => [...queryKeys.dashboard.all, 'financial-metrics'] as const,
    systemMetrics: () => [...queryKeys.dashboard.all, 'system-metrics'] as const,
    notifications: () => [...queryKeys.dashboard.all, 'notifications'] as const,
  },
  
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.tasks.lists(), { filters }] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },
  
  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.projects.lists(), { filters }] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  
  // CRM
  crm: {
    all: ['crm'] as const,
    leads: () => [...queryKeys.crm.all, 'leads'] as const,
    lead: (id: string) => [...queryKeys.crm.leads(), id] as const,
    contacts: () => [...queryKeys.crm.all, 'contacts'] as const,
    contact: (id: string) => [...queryKeys.crm.contacts(), id] as const,
  },
  
  // Financial
  financial: {
    all: ['financial'] as const,
    transactions: () => [...queryKeys.financial.all, 'transactions'] as const,
    transaction: (id: string) => [...queryKeys.financial.transactions(), id] as const,
    reports: () => [...queryKeys.financial.all, 'reports'] as const,
    report: (type: string, period: string) => [...queryKeys.financial.reports(), type, period] as const,
  },
  
  // Files
  files: {
    all: ['files'] as const,
    lists: () => [...queryKeys.files.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.files.lists(), { filters }] as const,
    details: () => [...queryKeys.files.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.files.details(), id] as const,
    searches: () => [...queryKeys.files.all, 'search'] as const,
    search: (query: string, filters: Record<string, any>) => [...queryKeys.files.searches(), { query, filters }] as const,
    stats: () => [...queryKeys.files.all, 'stats'] as const,
    tags: () => [...queryKeys.files.all, 'tags'] as const,
  }
} as const

// Utilitários para invalidação de cache
export const invalidateQueries = {
  dashboard: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
  auth: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.all }),
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  tasks: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  projects: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
  crm: () => queryClient.invalidateQueries({ queryKey: queryKeys.crm.all }),
  financial: () => queryClient.invalidateQueries({ queryKey: queryKeys.financial.all }),
  files: () => queryClient.invalidateQueries({ queryKey: queryKeys.files.all }),
  all: () => queryClient.invalidateQueries()
}

// Utilitários para prefetch
export const prefetchQueries = {
  dashboard: {
    quickStats: () => queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.quickStats(),
      queryFn: () => import('../services/apiService').then(({ apiService }) => apiService.getQuickStats()),
      staleTime: 1000 * 60 * 2 // 2 minutos para dashboard
    })
  }
}