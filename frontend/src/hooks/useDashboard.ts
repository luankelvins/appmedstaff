import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/apiService'
import { queryKeys } from '../config/queryClient'
import { toast } from 'react-hot-toast'

// Types para Dashboard
export interface QuickStats {
  totalUsers: number
  activeProjects: number
  pendingTasks: number
  monthlyRevenue: number
  growthRate: number
}

export interface TasksMetrics {
  completed: number
  pending: number
  overdue: number
  inProgress: number
  completionRate: number
}

export interface LeadsMetrics {
  total: number
  converted: number
  pending: number
  conversionRate: number
  monthlyGrowth: number
}

export interface FinancialMetrics {
  revenue: number
  expenses: number
  profit: number
  profitMargin: number
  monthlyGrowth: number
}

export interface SystemMetrics {
  uptime: number
  responseTime: number
  errorRate: number
  activeUsers: number
  systemHealth: 'healthy' | 'warning' | 'critical'
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  createdAt: string
  actionUrl?: string
}

// Hook para Quick Stats
export const useQuickStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.quickStats(),
    queryFn: () => apiService.getQuickStats() as Promise<QuickStats>,
    staleTime: 1000 * 60 * 2, // 2 minutos - dados críticos
    refetchInterval: 1000 * 60 * 5, // Refetch a cada 5 minutos
    refetchIntervalInBackground: false,
    meta: {
      errorMessage: 'Erro ao carregar estatísticas rápidas'
    }
  })
}

// Hook para Tasks Metrics
export const useTasksMetrics = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.tasksMetrics(),
    queryFn: () => apiService.getTasksMetrics() as Promise<TasksMetrics>,
    staleTime: 1000 * 60 * 3, // 3 minutos
    refetchInterval: 1000 * 60 * 10, // Refetch a cada 10 minutos
    meta: {
      errorMessage: 'Erro ao carregar métricas de tarefas'
    }
  })
}

// Hook para Leads Metrics
export const useLeadsMetrics = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.leadsMetrics(),
    queryFn: () => apiService.getLeadsMetrics() as Promise<LeadsMetrics>,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60 * 15, // Refetch a cada 15 minutos
    meta: {
      errorMessage: 'Erro ao carregar métricas de leads'
    }
  })
}

// Hook para Financial Metrics
export const useFinancialMetrics = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.financialMetrics(),
    queryFn: () => apiService.getFinancialMetrics() as Promise<FinancialMetrics>,
    staleTime: 1000 * 60 * 10, // 10 minutos - dados financeiros menos voláteis
    refetchInterval: 1000 * 60 * 30, // Refetch a cada 30 minutos
    meta: {
      errorMessage: 'Erro ao carregar métricas financeiras'
    }
  })
}

// Hook para System Metrics
export const useSystemMetrics = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.systemMetrics(),
    queryFn: () => apiService.getSystemMetrics() as Promise<SystemMetrics>,
    staleTime: 1000 * 30, // 30 segundos - dados de sistema em tempo real
    refetchInterval: 1000 * 60, // Refetch a cada minuto
    refetchIntervalInBackground: true, // Continua atualizando em background
    meta: {
      errorMessage: 'Erro ao carregar métricas do sistema'
    }
  })
}

// Hook para Notifications
export const useNotifications = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.notifications(),
    queryFn: () => apiService.getNotifications() as Promise<Notification[]>,
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: 1000 * 60 * 2, // Refetch a cada 2 minutos
    refetchIntervalInBackground: true,
    meta: {
      errorMessage: 'Erro ao carregar notificações'
    }
  })
}

// Hook para marcar notificação como lida
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (notificationId: string) => 
      apiService.put(`/notifications/${notificationId}/read`),
    onSuccess: (_, notificationId) => {
      // Atualizar cache local otimisticamente
      queryClient.setQueryData<Notification[]>(
        queryKeys.dashboard.notifications(),
        (oldData) => {
          if (!oldData) return oldData
          return oldData.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        }
      )
      
      toast.success('Notificação marcada como lida')
    },
    onError: () => {
      toast.error('Erro ao marcar notificação como lida')
    }
  })
}

// Hook para marcar todas as notificações como lidas
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => apiService.put('/notifications/mark-all-read'),
    onSuccess: () => {
      // Atualizar cache local
      queryClient.setQueryData<Notification[]>(
        queryKeys.dashboard.notifications(),
        (oldData) => {
          if (!oldData) return oldData
          return oldData.map(notification => ({ ...notification, read: true }))
        }
      )
      
      toast.success('Todas as notificações foram marcadas como lidas')
    },
    onError: () => {
      toast.error('Erro ao marcar todas as notificações como lidas')
    }
  })
}

// Hook para refrescar todos os dados do dashboard
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      // Invalidar todas as queries do dashboard
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.dashboard.all 
      })
      return true
    },
    onSuccess: () => {
      toast.success('Dashboard atualizado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao atualizar dashboard')
    }
  })
}

// Hook combinado para todos os dados do dashboard
export const useDashboardData = () => {
  const quickStats = useQuickStats()
  const tasksMetrics = useTasksMetrics()
  const leadsMetrics = useLeadsMetrics()
  const financialMetrics = useFinancialMetrics()
  const systemMetrics = useSystemMetrics()
  const notifications = useNotifications()
  
  const isLoading = [
    quickStats.isLoading,
    tasksMetrics.isLoading,
    leadsMetrics.isLoading,
    financialMetrics.isLoading,
    systemMetrics.isLoading,
    notifications.isLoading
  ].some(Boolean)
  
  const isError = [
    quickStats.isError,
    tasksMetrics.isError,
    leadsMetrics.isError,
    financialMetrics.isError,
    systemMetrics.isError,
    notifications.isError
  ].some(Boolean)
  
  const refetch = () => {
    quickStats.refetch()
    tasksMetrics.refetch()
    leadsMetrics.refetch()
    financialMetrics.refetch()
    systemMetrics.refetch()
    notifications.refetch()
  }
  
  return {
    data: {
      quickStats: quickStats.data,
      tasksMetrics: tasksMetrics.data,
      leadsMetrics: leadsMetrics.data,
      financialMetrics: financialMetrics.data,
      systemMetrics: systemMetrics.data,
      notifications: notifications.data
    },
    isLoading,
    isError,
    refetch
  }
}