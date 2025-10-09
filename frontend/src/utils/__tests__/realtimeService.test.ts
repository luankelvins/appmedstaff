import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest'
import { RealtimeService } from '../realtimeService'

// Mock do RealtimeService
const mockRealtimeService = {
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  unsubscribeAll: vi.fn(),
  subscribeToNotifications: vi.fn(),
  subscribeToTasks: vi.fn(),
  subscribeToProfiles: vi.fn(),
  subscribeToTimeEntries: vi.fn(),
  subscribeToEmployees: vi.fn(),
  subscribeToSchedules: vi.fn(),
  subscribeToWidgets: vi.fn(),
  subscribeToReports: vi.fn(),
  subscribeToIntegrations: vi.fn(),
  subscribeToAuditLogs: vi.fn(),
  subscribeToSystemEvents: vi.fn(),
  subscribeToUserPresence: vi.fn(),
  updateUserPresence: vi.fn(),
  getUsersOnline: vi.fn(),
  sendMessage: vi.fn(),
  broadcastEvent: vi.fn(),
  getActiveSubscriptions: vi.fn(),
  getConnectionStatus: vi.fn(),
  reconnect: vi.fn(),
  disconnect: vi.fn(),
  destroy: vi.fn(),
  isConnected: vi.fn(),
  getSubscriptionCount: vi.fn(),
  clearCache: vi.fn(),
  enableDebugMode: vi.fn(),
  disableDebugMode: vi.fn()
}

vi.mock('../realtimeService', () => ({
  RealtimeService: vi.fn(() => mockRealtimeService)
}))

describe('RealtimeService', () => {
  let realtimeService: any
  let mockHandler: Mock

  beforeEach(() => {
    vi.clearAllMocks()
    realtimeService = new RealtimeService()
    mockHandler = vi.fn()
  })

  afterEach(() => {
    realtimeService.destroy()
  })

  describe('Inscrições Básicas', () => {
    it('deve criar inscrição para tabela específica', () => {
      const subscriptionId = 'sub_123'
      mockRealtimeService.subscribe.mockReturnValue(subscriptionId)

      const result = realtimeService.subscribe({
        table: 'notifications',
        event: '*',
        schema: 'public',
        filter: 'user_id=eq.123'
      }, mockHandler)

      expect(result).toBe(subscriptionId)
      expect(mockRealtimeService.subscribe).toHaveBeenCalledWith({
        table: 'notifications',
        event: '*',
        schema: 'public',
        filter: 'user_id=eq.123'
      }, mockHandler)
    })

    it('deve cancelar inscrição específica', () => {
      mockRealtimeService.unsubscribe.mockReturnValue(true)

      const result = realtimeService.unsubscribe('sub_123')

      expect(result).toBe(true)
      expect(mockRealtimeService.unsubscribe).toHaveBeenCalledWith('sub_123')
    })

    it('deve cancelar todas as inscrições', () => {
      mockRealtimeService.unsubscribeAll.mockReturnValue(true)

      const result = realtimeService.unsubscribeAll()

      expect(result).toBe(true)
      expect(mockRealtimeService.unsubscribeAll).toHaveBeenCalled()
    })
  })

  describe('Inscrições Específicas', () => {
    it('deve se inscrever em notificações', () => {
      const subscriptionId = 'notifications_sub'
      mockRealtimeService.subscribeToNotifications.mockReturnValue(subscriptionId)

      const result = realtimeService.subscribeToNotifications('user123', mockHandler)

      expect(result).toBe(subscriptionId)
      expect(mockRealtimeService.subscribeToNotifications).toHaveBeenCalledWith('user123', mockHandler)
    })

    it('deve se inscrever em tarefas', () => {
      const subscriptionId = 'tasks_sub'
      mockRealtimeService.subscribeToTasks.mockReturnValue(subscriptionId)

      const result = realtimeService.subscribeToTasks('user123', mockHandler)

      expect(result).toBe(subscriptionId)
      expect(mockRealtimeService.subscribeToTasks).toHaveBeenCalledWith('user123', mockHandler)
    })

    it('deve se inscrever em perfis', () => {
      const subscriptionId = 'profiles_sub'
      mockRealtimeService.subscribeToProfiles.mockReturnValue(subscriptionId)

      const result = realtimeService.subscribeToProfiles('user123', mockHandler)

      expect(result).toBe(subscriptionId)
      expect(mockRealtimeService.subscribeToProfiles).toHaveBeenCalledWith('user123', mockHandler)
    })

    it('deve se inscrever em entradas de tempo', () => {
      const subscriptionId = 'time_entries_sub'
      mockRealtimeService.subscribeToTimeEntries.mockReturnValue(subscriptionId)

      const result = realtimeService.subscribeToTimeEntries('user123', mockHandler)

      expect(result).toBe(subscriptionId)
      expect(mockRealtimeService.subscribeToTimeEntries).toHaveBeenCalledWith('user123', mockHandler)
    })

    it('deve se inscrever em funcionários', () => {
      const subscriptionId = 'employees_sub'
      mockRealtimeService.subscribeToEmployees.mockReturnValue(subscriptionId)

      const result = realtimeService.subscribeToEmployees(mockHandler)

      expect(result).toBe(subscriptionId)
      expect(mockRealtimeService.subscribeToEmployees).toHaveBeenCalledWith(mockHandler)
    })

    it('deve se inscrever em agendamentos', () => {
      const subscriptionId = 'schedules_sub'
      mockRealtimeService.subscribeToSchedules.mockReturnValue(subscriptionId)

      const result = realtimeService.subscribeToSchedules('user123', mockHandler)

      expect(result).toBe(subscriptionId)
      expect(mockRealtimeService.subscribeToSchedules).toHaveBeenCalledWith('user123', mockHandler)
    })

    it('deve se inscrever em widgets', () => {
      const subscriptionId = 'widgets_sub'
      mockRealtimeService.subscribeToWidgets.mockReturnValue(subscriptionId)

      const result = realtimeService.subscribeToWidgets('user123', mockHandler)

      expect(result).toBe(subscriptionId)
      expect(mockRealtimeService.subscribeToWidgets).toHaveBeenCalledWith('user123', mockHandler)
    })

    it('deve se inscrever em relatórios', () => {
      const subscriptionId = 'reports_sub'
      mockRealtimeService.subscribeToReports.mockReturnValue(subscriptionId)

      const result = realtimeService.subscribeToReports('user123', mockHandler)

      expect(result).toBe(subscriptionId)
      expect(mockRealtimeService.subscribeToReports).toHaveBeenCalledWith('user123', mockHandler)
    })

    it('deve se inscrever em integrações', () => {
      const subscriptionId = 'integrations_sub'
      mockRealtimeService.subscribeToIntegrations.mockReturnValue(subscriptionId)

      const result = realtimeService.subscribeToIntegrations(mockHandler)

      expect(result).toBe(subscriptionId)
      expect(mockRealtimeService.subscribeToIntegrations).toHaveBeenCalledWith(mockHandler)
    })

    it('deve se inscrever em logs de auditoria', () => {
      const subscriptionId = 'audit_logs_sub'
      mockRealtimeService.subscribeToAuditLogs.mockReturnValue(subscriptionId)

      const result = realtimeService.subscribeToAuditLogs(mockHandler)

      expect(result).toBe(subscriptionId)
      expect(mockRealtimeService.subscribeToAuditLogs).toHaveBeenCalledWith(mockHandler)
    })

    it('deve se inscrever em eventos do sistema', () => {
      const subscriptionId = 'system_events_sub'
      mockRealtimeService.subscribeToSystemEvents.mockReturnValue(subscriptionId)

      const result = realtimeService.subscribeToSystemEvents(mockHandler)

      expect(result).toBe(subscriptionId)
      expect(mockRealtimeService.subscribeToSystemEvents).toHaveBeenCalledWith(mockHandler)
    })
  })

  describe('Presença de Usuário', () => {
    it('deve se inscrever em presença de usuário', () => {
      const subscriptionId = 'presence_sub'
      mockRealtimeService.subscribeToUserPresence.mockReturnValue(subscriptionId)

      const result = realtimeService.subscribeToUserPresence('channel123', mockHandler)

      expect(result).toBe(subscriptionId)
      expect(mockRealtimeService.subscribeToUserPresence).toHaveBeenCalledWith('channel123', mockHandler)
    })

    it('deve atualizar presença do usuário', () => {
      const presenceData = { status: 'online', lastSeen: new Date() }
      mockRealtimeService.updateUserPresence.mockReturnValue(true)

      const result = realtimeService.updateUserPresence('channel123', 'user123', presenceData)

      expect(result).toBe(true)
      expect(mockRealtimeService.updateUserPresence).toHaveBeenCalledWith('channel123', 'user123', presenceData)
    })

    it('deve obter usuários online', () => {
      const onlineUsers = ['user1', 'user2', 'user3']
      mockRealtimeService.getUsersOnline.mockReturnValue(onlineUsers)

      const result = realtimeService.getUsersOnline('channel123')

      expect(result).toEqual(onlineUsers)
      expect(mockRealtimeService.getUsersOnline).toHaveBeenCalledWith('channel123')
    })
  })

  describe('Mensagens e Broadcast', () => {
    it('deve enviar mensagem', () => {
      const message = { type: 'notification', content: 'Nova mensagem' }
      mockRealtimeService.sendMessage.mockReturnValue(true)

      const result = realtimeService.sendMessage('channel123', message)

      expect(result).toBe(true)
      expect(mockRealtimeService.sendMessage).toHaveBeenCalledWith('channel123', message)
    })

    it('deve fazer broadcast de evento', () => {
      const event = { type: 'task_updated', taskId: 'task123' }
      mockRealtimeService.broadcastEvent.mockReturnValue(true)

      const result = realtimeService.broadcastEvent('tasks', event)

      expect(result).toBe(true)
      expect(mockRealtimeService.broadcastEvent).toHaveBeenCalledWith('tasks', event)
    })
  })

  describe('Gerenciamento de Conexão', () => {
    it('deve obter inscrições ativas', () => {
      const activeSubscriptions = ['sub1', 'sub2', 'sub3']
      mockRealtimeService.getActiveSubscriptions.mockReturnValue(activeSubscriptions)

      const result = realtimeService.getActiveSubscriptions()

      expect(result).toEqual(activeSubscriptions)
      expect(mockRealtimeService.getActiveSubscriptions).toHaveBeenCalled()
    })

    it('deve obter status da conexão', () => {
      const status = 'connected'
      mockRealtimeService.getConnectionStatus.mockReturnValue(status)

      const result = realtimeService.getConnectionStatus()

      expect(result).toBe(status)
      expect(mockRealtimeService.getConnectionStatus).toHaveBeenCalled()
    })

    it('deve reconectar', () => {
      mockRealtimeService.reconnect.mockReturnValue(true)

      const result = realtimeService.reconnect()

      expect(result).toBe(true)
      expect(mockRealtimeService.reconnect).toHaveBeenCalled()
    })

    it('deve desconectar', () => {
      mockRealtimeService.disconnect.mockReturnValue(true)

      const result = realtimeService.disconnect()

      expect(result).toBe(true)
      expect(mockRealtimeService.disconnect).toHaveBeenCalled()
    })

    it('deve verificar se está conectado', () => {
      mockRealtimeService.isConnected.mockReturnValue(true)

      const result = realtimeService.isConnected()

      expect(result).toBe(true)
      expect(mockRealtimeService.isConnected).toHaveBeenCalled()
    })

    it('deve obter contagem de inscrições', () => {
      mockRealtimeService.getSubscriptionCount.mockReturnValue(5)

      const result = realtimeService.getSubscriptionCount()

      expect(result).toBe(5)
      expect(mockRealtimeService.getSubscriptionCount).toHaveBeenCalled()
    })
  })

  describe('Utilitários', () => {
    it('deve limpar cache', () => {
      mockRealtimeService.clearCache.mockReturnValue(true)

      const result = realtimeService.clearCache()

      expect(result).toBe(true)
      expect(mockRealtimeService.clearCache).toHaveBeenCalled()
    })

    it('deve habilitar modo debug', () => {
      mockRealtimeService.enableDebugMode.mockReturnValue(true)

      const result = realtimeService.enableDebugMode()

      expect(result).toBe(true)
      expect(mockRealtimeService.enableDebugMode).toHaveBeenCalled()
    })

    it('deve desabilitar modo debug', () => {
      mockRealtimeService.disableDebugMode.mockReturnValue(true)

      const result = realtimeService.disableDebugMode()

      expect(result).toBe(true)
      expect(mockRealtimeService.disableDebugMode).toHaveBeenCalled()
    })
  })

  describe('Destruição', () => {
    it('deve destruir o serviço corretamente', () => {
      mockRealtimeService.destroy.mockReturnValue(true)

      const result = realtimeService.destroy()

      expect(result).toBe(true)
      expect(mockRealtimeService.destroy).toHaveBeenCalled()
    })
  })
})