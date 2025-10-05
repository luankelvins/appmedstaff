import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest'
import { WidgetDataService } from '../widgetDataService'
import { supabase } from '../../config/supabase'
import { widgetCacheService } from '../cacheService'
import { paginationService } from '../paginationService'
import { realtimeService } from '../realtimeService'

// ==================== MOCKS ====================

// Mock do Supabase
vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn().mockResolvedValue({ data: null, error: null })
    }))
  }
}))

// Mock do Cache Service
vi.mock('../cacheService', () => ({
  widgetCacheService: {
    getOrSet: vi.fn(),
    invalidatePattern: vi.fn(),
    clear: vi.fn(),
    getMetrics: vi.fn(),
    getInfo: vi.fn()
  }
}))

// Mock do Pagination Service
vi.mock('../paginationService', () => ({
  paginationService: {
    paginate: vi.fn(),
    paginateByCursor: vi.fn(),
    updateConfig: vi.fn(),
    getConfig: vi.fn()
  }
}))

// Mock do Realtime Service
vi.mock('../realtimeService', () => ({
  realtimeService: {
    subscribeToNotifications: vi.fn(),
    subscribeToTasks: vi.fn(),
    subscribeToSystemMetrics: vi.fn(),
    subscribeToFinancialMetrics: vi.fn(),
    subscribeToProductivityMetrics: vi.fn(),
    subscribeToTeamPerformance: vi.fn(),
    subscribeToHRMetrics: vi.fn(),
    unsubscribe: vi.fn(),
    unsubscribeAll: vi.fn(),
    getConnectionStatus: vi.fn(),
    reconnect: vi.fn(),
    testLatency: vi.fn(),
    onConnectionChange: vi.fn(),
    onError: vi.fn(),
    destroy: vi.fn()
  }
}))

// ==================== DADOS DE TESTE ====================

const mockProductivityMetrics = [
  {
    id: '1',
    user_id: 'user1',
    efficiency_score: 85,
    tasks_completed: 12,
    satisfaction_score: 4.5,
    date: '2024-01-15',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    user_id: 'user2',
    efficiency_score: 92,
    tasks_completed: 15,
    satisfaction_score: 4.8,
    date: '2024-01-15',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

const mockProfiles = [
  { id: 'user1', full_name: 'João Silva' },
  { id: 'user2', full_name: 'Maria Santos' }
]

const mockSystemMetrics = [
  {
    id: '1',
    cpu_usage: 45.5,
    memory_usage: 62.3,
    storage_usage: 78.1,
    network_usage: 23.4,
    active_users: 150,
    timestamp: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

const mockServiceStatus = [
  {
    id: '1',
    service_name: 'API Gateway',
    status: 'online' as const,
    uptime_percentage: 99.9,
    last_check: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

const mockNotifications = [
  {
    id: '1',
    user_id: 'user1',
    title: 'Nova tarefa',
    message: 'Você tem uma nova tarefa atribuída',
    type: 'task' as const,
    priority: 'medium' as const,
    is_read: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

// ==================== TESTES ====================

describe('WidgetDataService', () => {
  let service: WidgetDataService
  let mockSupabaseFrom: Mock
  let mockSupabaseQuery: any

  beforeEach(() => {
    // Reset todos os mocks
    vi.clearAllMocks()
    
    // Configurar mock do Supabase
    mockSupabaseQuery = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
      then: vi.fn()
    }
    
    mockSupabaseFrom = vi.mocked(supabase.from)
    mockSupabaseFrom.mockReturnValue(mockSupabaseQuery)
    
    // Criar nova instância do serviço
    service = new WidgetDataService()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ==================== TESTES DE MÉTRICAS DE PRODUTIVIDADE ====================

  describe('getProductivityMetrics', () => {
    it('deve retornar métricas de produtividade com cache', async () => {
      // Configurar mocks
      const expectedResult = {
        efficiency_avg: 88.5,
        tasks_completed_total: 27,
        satisfaction_avg: 4.65,
        top_performers: [
          { id: 'user2', name: 'Maria Santos', efficiency: 92, tasks_completed: 15 },
          { id: 'user1', name: 'João Silva', efficiency: 85, tasks_completed: 12 }
        ]
      }

      vi.mocked(widgetCacheService.getOrSet).mockResolvedValue(expectedResult)

      // Executar teste
      const result = await service.getProductivityMetrics('2024-01-01', '2024-01-31')

      // Verificações
      expect(result).toEqual(expectedResult)
      expect(widgetCacheService.getOrSet).toHaveBeenCalledWith(
        'productivity_metrics:2024-01-01:2024-01-31',
        expect.any(Function),
        120000 // 2 minutos
      )
    })

    it('deve buscar dados do banco quando cache não existe', async () => {
      // Configurar mocks para simular cache miss
      vi.mocked(widgetCacheService.getOrSet).mockImplementation(async (key, fetchFn) => {
        return await fetchFn()
      })

      mockSupabaseQuery.then.mockResolvedValueOnce({ data: mockProductivityMetrics, error: null })
      mockSupabaseQuery.then.mockResolvedValueOnce({ data: mockProfiles, error: null })

      // Executar teste
      const result = await service.getProductivityMetrics()

      // Verificações
      expect(supabase.from).toHaveBeenCalledWith('productivity_metrics')
      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(result).toHaveProperty('efficiency_avg')
      expect(result).toHaveProperty('tasks_completed_total')
      expect(result).toHaveProperty('satisfaction_avg')
      expect(result).toHaveProperty('top_performers')
    })

    it('deve tratar erros adequadamente', async () => {
      // Configurar mock para erro
      vi.mocked(widgetCacheService.getOrSet).mockImplementation(async (key, fetchFn) => {
        return await fetchFn()
      })

      mockSupabaseQuery.then.mockResolvedValue({ data: null, error: { message: 'Database error' } })

      // Executar teste e verificar erro
      await expect(service.getProductivityMetrics()).rejects.toThrow('Database error')
    })
  })

  // ==================== TESTES DE MÉTRICAS DO SISTEMA ====================

  describe('getSystemStats', () => {
    it('deve retornar estatísticas do sistema', async () => {
      // Configurar mocks
      mockSupabaseQuery.then.mockResolvedValueOnce({ data: mockSystemMetrics, error: null })
      mockSupabaseQuery.then.mockResolvedValueOnce({ data: mockServiceStatus, error: null })

      // Executar teste
      const result = await service.getSystemStats()

      // Verificações
      expect(result).toHaveProperty('cpu_avg')
      expect(result).toHaveProperty('memory_avg')
      expect(result).toHaveProperty('storage_avg')
      expect(result).toHaveProperty('network_avg')
      expect(result).toHaveProperty('active_users_current')
      expect(result).toHaveProperty('services_status')
      expect(Array.isArray(result.services_status)).toBe(true)
    })

    it('deve retornar valores padrão quando não há dados', async () => {
      // Configurar mocks para dados vazios
      mockSupabaseQuery.then.mockResolvedValueOnce({ data: [], error: null })
      mockSupabaseQuery.then.mockResolvedValueOnce({ data: [], error: null })

      // Executar teste
      const result = await service.getSystemStats()

      // Verificações
      expect(result.cpu_avg).toBe(0)
      expect(result.memory_avg).toBe(0)
      expect(result.storage_avg).toBe(0)
      expect(result.network_avg).toBe(0)
      expect(result.active_users_current).toBe(0)
      expect(result.services_status).toEqual([])
    })
  })

  // ==================== TESTES DE NOTIFICAÇÕES ====================

  describe('getUserNotifications', () => {
    it('deve retornar notificações do usuário', async () => {
      // Configurar mock
      mockSupabaseQuery.then.mockResolvedValue({ data: mockNotifications, error: null })

      // Executar teste
      const result = await service.getUserNotifications('user1', 10)

      // Verificações
      expect(supabase.from).toHaveBeenCalledWith('notifications')
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('user_id', 'user1')
      expect(mockSupabaseQuery.limit).toHaveBeenCalledWith(10)
      expect(result).toEqual(mockNotifications)
    })
  })

  describe('markNotificationAsRead', () => {
    it('deve marcar notificação como lida', async () => {
      // Configurar mock
      mockSupabaseQuery.then.mockResolvedValue({ data: null, error: null })

      // Executar teste
      await service.markNotificationAsRead('notification1')

      // Verificações
      expect(supabase.from).toHaveBeenCalledWith('notifications')
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith({ is_read: true })
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'notification1')
    })
  })

  describe('createNotification', () => {
    it('deve criar nova notificação', async () => {
      // Dados de teste
      const newNotification = {
        user_id: 'user1',
        title: 'Test Notification',
        message: 'Test message',
        type: 'info' as const,
        priority: 'low' as const,
        is_read: false
      }

      const createdNotification = { id: 'new1', ...newNotification }

      // Configurar mock
      mockSupabaseQuery.single.mockResolvedValue({ data: createdNotification, error: null })

      // Executar teste
      const result = await service.createNotification(newNotification)

      // Verificações
      expect(supabase.from).toHaveBeenCalledWith('notifications')
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith(newNotification)
      expect(result).toEqual(createdNotification)
    })
  })

  // ==================== TESTES DE CACHE ====================

  describe('Cache Management', () => {
    it('deve invalidar cache por padrão', () => {
      // Configurar mock
      vi.mocked(widgetCacheService.invalidatePattern).mockReturnValue(5)

      // Executar teste
      const result = service.invalidateCache('test_pattern')

      // Verificações
      expect(widgetCacheService.invalidatePattern).toHaveBeenCalledWith('test_pattern')
      expect(result).toBe(5)
    })

    it('deve limpar todo o cache', () => {
      // Executar teste
      service.clearAllCache()

      // Verificações
      expect(widgetCacheService.clear).toHaveBeenCalled()
    })

    it('deve retornar métricas do cache', () => {
      // Configurar mock
      const mockMetrics = { 
        hits: 100, 
        misses: 20, 
        totalRequests: 120,
        hitRate: 0.83,
        memoryUsage: 1024,
        entriesCount: 50
      }
      vi.mocked(widgetCacheService.getMetrics).mockReturnValue(mockMetrics)

      // Executar teste
      const result = service.getCacheMetrics()

      // Verificações
      expect(widgetCacheService.getMetrics).toHaveBeenCalled()
      expect(result).toEqual(mockMetrics)
    })
  })

  // ==================== TESTES DE PAGINAÇÃO ====================

  describe('Pagination', () => {
    it('deve retornar notificações paginadas', async () => {
      // Dados de teste
      const mockPaginatedResult = {
        data: mockNotifications,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
          startIndex: 0,
          endIndex: 0
        },
        meta: { executionTime: 50, itemsReturned: 1 }
      }

      // Configurar mock
      vi.mocked(paginationService.paginate).mockResolvedValue(mockPaginatedResult)

      // Executar teste
      const result = await service.getNotificationsPaginated('user1', { page: 1, limit: 10 })

      // Verificações
      expect(paginationService.paginate).toHaveBeenCalledWith(
        'notifications',
        { page: 1, limit: 10, filters: { user_id: 'user1' } },
        '*'
      )
      expect(result).toEqual(mockPaginatedResult)
    })

    it('deve retornar notificações por cursor', async () => {
      // Dados de teste
      const mockCursorResult = {
        data: mockNotifications,
        nextCursor: 'cursor123',
        hasMore: false,
        meta: { executionTime: 30, itemsReturned: 1 }
      }

      // Configurar mock
      vi.mocked(paginationService.paginateByCursor).mockResolvedValue(mockCursorResult)

      // Executar teste
      const result = await service.getNotificationsByCursor('user1', 20, 'cursor123')

      // Verificações
      expect(paginationService.paginateByCursor).toHaveBeenCalledWith(
        'notifications',
        {
          limit: 20,
          cursor: 'cursor123',
          cursorField: 'created_at',
          sortOrder: 'desc',
          filters: { user_id: 'user1' }
        },
        '*'
      )
      expect(result).toEqual(mockCursorResult)
    })
  })

  // ==================== TESTES DE TEMPO REAL ====================

  describe('Realtime Subscriptions', () => {
    it('deve inscrever-se em notificações', () => {
      // Configurar mock
      const mockHandler = vi.fn()
      const mockSubscriptionId = 'sub123'
      vi.mocked(realtimeService.subscribeToNotifications).mockReturnValue(mockSubscriptionId)

      // Executar teste
      const result = service.subscribeToNotifications('user1', mockHandler)

      // Verificações
      expect(realtimeService.subscribeToNotifications).toHaveBeenCalledWith('user1', expect.any(Function))
      expect(result).toBe(mockSubscriptionId)
    })

    it('deve configurar múltiplas inscrições', () => {
      // Configurar mocks
      const handlers = {
        onNotification: vi.fn(),
        onTask: vi.fn(),
        onSystemMetric: vi.fn()
      }

      vi.mocked(realtimeService.subscribeToNotifications).mockReturnValue('sub1')
      vi.mocked(realtimeService.subscribeToTasks).mockReturnValue('sub2')
      vi.mocked(realtimeService.subscribeToSystemMetrics).mockReturnValue('sub3')

      // Executar teste
      const result = service.setupRealtimeSubscriptions('user1', handlers)

      // Verificações
      expect(result).toHaveLength(3)
      expect(result).toEqual(['sub1', 'sub2', 'sub3'])
      expect(realtimeService.subscribeToNotifications).toHaveBeenCalled()
      expect(realtimeService.subscribeToTasks).toHaveBeenCalled()
      expect(realtimeService.subscribeToSystemMetrics).toHaveBeenCalled()
    })

    it('deve remover inscrição específica', () => {
      // Executar teste
      service.unsubscribeFromRealtime('sub123')

      // Verificações
      expect(realtimeService.unsubscribe).toHaveBeenCalledWith('sub123')
    })

    it('deve remover todas as inscrições', () => {
      // Executar teste
      service.unsubscribeFromAllRealtime()

      // Verificações
      expect(realtimeService.unsubscribeAll).toHaveBeenCalled()
    })
  })

  // ==================== TESTES DE HEALTH CHECK ====================

  describe('Health Check', () => {
    it('deve retornar true quando conexão está saudável', async () => {
      // Configurar mock para retornar sucesso
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null })
      }
      ;(supabase.from as Mock).mockReturnValue(mockQuery)

      // Executar teste
      const result = await service.healthCheck()

      // Verificações
      expect(result).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('profiles')
    })

    it('deve retornar false quando há erro na conexão', async () => {
      // Configurar mock para retornar erro
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'Connection error' } })
      }
      ;(supabase.from as Mock).mockReturnValue(mockQuery)

      // Executar teste
      const result = await service.healthCheck()

      // Verificações
      expect(result).toBe(false)
    })

    it('deve retornar false quando há exceção', async () => {
      // Configurar mock para lançar exceção
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error('Network error'))
      }
      ;(supabase.from as Mock).mockReturnValue(mockQuery)

      // Executar teste
      const result = await service.healthCheck()

      // Verificações
      expect(result).toBe(false)
    })
  })

  // ==================== TESTES DE CLEANUP ====================

  describe('Cleanup', () => {
    it('deve fazer cleanup completo do serviço', () => {
      // Executar teste
      service.destroy()

      // Verificações
      expect(realtimeService.unsubscribeAll).toHaveBeenCalled()
      expect(realtimeService.destroy).toHaveBeenCalled()
    })
  })

  // ==================== TESTES DE INTEGRAÇÃO ====================

  describe('Integration Tests', () => {
    it('deve buscar estatísticas do dashboard com cache e invalidação', async () => {
      // Configurar dados de teste
      const mockStats = {
        totalUsers: 100,
        activeUsers: 75,
        totalTasks: 500,
        completedTasks: 350,
        totalRevenue: 50000,
        monthlyGrowth: 15.5
      }

      // Configurar mocks
      vi.mocked(widgetCacheService.getOrSet).mockResolvedValue(mockStats)

      // Executar teste
      const result = await service.getDashboardStats()

      // Verificações
      expect(result).toEqual(mockStats)
      expect(widgetCacheService.getOrSet).toHaveBeenCalledWith(
        'dashboard_stats',
        expect.any(Function),
        180000 // 3 minutos
      )
    })

    it('deve invalidar cache ao receber evento de tempo real', () => {
      // Configurar mocks
      const mockHandler = vi.fn()
      const mockEvent = {
        type: 'INSERT' as const,
        table: 'notifications',
        record: mockNotifications[0],
        timestamp: '2024-01-15T10:00:00Z',
        eventId: 'event123'
      }

      vi.mocked(realtimeService.subscribeToNotifications).mockImplementation((userId, handler) => {
        // Simular chamada do handler
        handler(mockEvent)
        return 'sub123'
      })

      vi.mocked(widgetCacheService.invalidatePattern).mockReturnValue(2)

      // Executar teste
      service.subscribeToNotifications('user1', mockHandler)

      // Verificações
      expect(widgetCacheService.invalidatePattern).toHaveBeenCalledWith('notifications:user1')
      expect(widgetCacheService.invalidatePattern).toHaveBeenCalledWith('dashboard_stats')
      expect(mockHandler).toHaveBeenCalledWith(mockEvent)
    })
  })
})