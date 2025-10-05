import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest'
import { RealtimeService } from '../realtimeService'
import { supabase } from '../../config/supabase'

// Mock do Supabase
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
  unsubscribe: vi.fn(),
  send: vi.fn()
}

const mockRealtime = {
  channel: vi.fn(() => mockChannel),
  removeChannel: vi.fn(),
  getChannels: vi.fn(() => []),
  disconnect: vi.fn(),
  connect: vi.fn()
}

vi.mock('../../config/supabase', () => ({
  supabase: {
    realtime: mockRealtime
  }
}))

describe('RealtimeService', () => {
  let realtimeService: RealtimeService
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
      const subscriptionId = realtimeService.subscribe({
        table: 'notifications',
        event: '*',
        schema: 'public',
        filter: 'user_id=eq.123'
      }, mockHandler)

      expect(subscriptionId).toBeDefined()
      expect(typeof subscriptionId).toBe('string')
      expect(mockRealtime.channel).toHaveBeenCalled()
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes' as any,
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: 'user_id=eq.123'
        }),
        expect.any(Function)
      )
      expect(mockChannel.subscribe).toHaveBeenCalled()
    })

    it('deve remover inscrição específica', () => {
      const subscriptionId = realtimeService.subscribe({
        table: 'test',
        event: '*',
        schema: 'public'
      }, mockHandler)

      realtimeService.unsubscribe(subscriptionId)

      expect(mockChannel.unsubscribe).toHaveBeenCalled()
      expect(mockRealtime.removeChannel).toHaveBeenCalled()
    })

    it('deve remover todas as inscrições', () => {
      // Criar múltiplas inscrições
      realtimeService.subscribe({ table: 'test1', event: '*', schema: 'public' }, mockHandler)
      realtimeService.subscribe({ table: 'test2', event: '*', schema: 'public' }, mockHandler)

      realtimeService.unsubscribeAll()

      expect(mockChannel.unsubscribe).toHaveBeenCalledTimes(2)
      expect(mockRealtime.removeChannel).toHaveBeenCalledTimes(2)
    })
  })

  describe('Inscrições de Conveniência', () => {
    it('deve inscrever-se em notificações', () => {
      const subscriptionId = realtimeService.subscribeToNotifications('user123', mockHandler)

      expect(subscriptionId).toBeDefined()
      expect(mockRealtime.channel).toHaveBeenCalled()
    })

    it('deve inscrever-se em tarefas', () => {
      const subscriptionId = realtimeService.subscribeToTasks(mockHandler)

      expect(subscriptionId).toBeDefined()
      expect(mockRealtime.channel).toHaveBeenCalled()
    })

    it('deve inscrever-se em métricas do sistema', () => {
      const subscriptionId = realtimeService.subscribeToSystemMetrics(mockHandler)

      expect(subscriptionId).toBeDefined()
      expect(mockRealtime.channel).toHaveBeenCalled()
    })

    it('deve inscrever-se em métricas financeiras', () => {
      const subscriptionId = realtimeService.subscribeToFinancialMetrics(mockHandler)

      expect(subscriptionId).toBeDefined()
      expect(mockRealtime.channel).toHaveBeenCalled()
    })

    it('deve inscrever-se em métricas de produtividade', () => {
      const subscriptionId = realtimeService.subscribeToProductivityMetrics(mockHandler)

      expect(subscriptionId).toBeDefined()
      expect(mockRealtime.channel).toHaveBeenCalled()
    })

    it('deve inscrever-se em performance da equipe', () => {
      const subscriptionId = realtimeService.subscribeToTeamPerformance(mockHandler)

      expect(subscriptionId).toBeDefined()
      expect(mockRealtime.channel).toHaveBeenCalled()
    })

    it('deve inscrever-se em métricas de RH', () => {
      const subscriptionId = realtimeService.subscribeToHRMetrics(mockHandler)

      expect(subscriptionId).toBeDefined()
      expect(mockRealtime.channel).toHaveBeenCalled()
    })
  })

  describe('Gerenciamento de Conexão', () => {
    it('deve retornar status de conexão', () => {
      const status = realtimeService.getConnectionStatus()
      
      expect(status).toHaveProperty('isConnected')
      expect(status).toHaveProperty('subscriptions')
      expect(status).toHaveProperty('reconnectAttempts')
      expect(typeof status.isConnected).toBe('boolean')
      expect(Array.isArray(status.subscriptions)).toBe(true)
    })

    it('deve reconectar', () => {
      realtimeService.reconnect()
      
      expect(mockRealtime.disconnect).toHaveBeenCalled()
      expect(mockRealtime.connect).toHaveBeenCalled()
    })

    it('deve configurar handler de mudança de conexão', () => {
      const connectionHandler = vi.fn()
      
      realtimeService.onConnectionChange(connectionHandler)
      
      // Simular mudança de conexão
      const onCall = mockChannel.on.mock.calls.find(call => call[0] === 'system')
      if (onCall) {
        const handler = onCall[1]
        handler({ status: 'SUBSCRIBED' })
        
        expect(connectionHandler).toHaveBeenCalledWith({
          status: 'connected',
          timestamp: expect.any(String)
        })
      }
    })

    it('deve configurar handler de erro', () => {
      const errorHandler = vi.fn()
      
      realtimeService.onError(errorHandler)
      
      // Simular erro
      const onCall = mockChannel.on.mock.calls.find(call => call[0] === 'system')
      if (onCall) {
        const handler = onCall[1]
        handler({ status: 'CHANNEL_ERROR', error: 'Connection failed' })
        
        expect(errorHandler).toHaveBeenCalledWith({
          error: 'Connection failed',
          timestamp: expect.any(String),
          context: 'realtime_connection'
        })
      }
    })
  })

  describe('Teste de Latência', () => {
    it('deve testar latência', async () => {
      // Mock do Date.now para controlar o tempo
      const originalNow = Date.now
      let currentTime = 1000
      Date.now = vi.fn(() => currentTime)

      // Simular resposta após 50ms
      mockChannel.send.mockImplementation(() => {
        setTimeout(() => {
          currentTime += 50
          // Simular recebimento da resposta
          const onCall = mockChannel.on.mock.calls.find(call => call[0] === 'broadcast')
          if (onCall) {
            const handler = onCall[1]
            handler({ type: 'latency_test', timestamp: 1000 })
          }
        }, 0)
        return Promise.resolve()
      })

      const latencyPromise = realtimeService.testLatency()
      
      // Avançar o tempo
      currentTime += 50
      
      const latency = await latencyPromise

      expect(latency).toBe(50)
      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'latency_test',
        payload: { timestamp: 1000 }
      })

      // Restaurar Date.now
      Date.now = originalNow
    })

    it('deve retornar -1 em caso de timeout na latência', async () => {
      // Mock que não responde
      mockChannel.send.mockResolvedValue(undefined)

      const latency = await realtimeService.testLatency()

      expect(latency).toBe(-1)
    })
  })

  describe('Tratamento de Eventos', () => {
    it('deve processar eventos de INSERT', () => {
      const subscriptionId = realtimeService.subscribeToNotifications('user123', mockHandler)

      // Simular evento INSERT
      const onCall = mockChannel.on.mock.calls.find(call => call[0] === 'postgres_changes')
      if (onCall) {
        const handler = onCall[2]
        const mockPayload = {
          eventType: 'INSERT',
          new: { id: '1', title: 'Nova notificação', user_id: 'user123' },
          old: {},
          schema: 'public',
          table: 'notifications'
        }
        
        handler(mockPayload)

        expect(mockHandler).toHaveBeenCalledWith({
          type: 'INSERT',
          table: 'notifications',
          record: mockPayload.new,
          timestamp: expect.any(String),
          eventId: expect.any(String)
        })
      }
    })

    it('deve processar eventos de UPDATE', () => {
      const subscriptionId = realtimeService.subscribeToTasks('user123', mockHandler)

      // Simular evento UPDATE
      const onCall = mockChannel.on.mock.calls.find(call => call[0] === 'postgres_changes')
      if (onCall) {
        const handler = onCall[2]
        const mockPayload = {
          eventType: 'UPDATE',
          new: { id: '1', title: 'Tarefa atualizada', status: 'completed' },
          old: { id: '1', title: 'Tarefa atualizada', status: 'pending' },
          schema: 'public',
          table: 'tasks'
        }
        
        handler(mockPayload)

        expect(mockHandler).toHaveBeenCalledWith({
          type: 'UPDATE',
          table: 'tasks',
          record: mockPayload.new,
          timestamp: expect.any(String),
          eventId: expect.any(String)
        })
      }
    })

    it('deve processar eventos de DELETE', () => {
      const subscriptionId = realtimeService.subscribeToNotifications('user123', mockHandler)

      // Simular evento DELETE
      const onCall = mockChannel.on.mock.calls.find(call => call[0] === 'postgres_changes')
      if (onCall) {
        const handler = onCall[2]
        const mockPayload = {
          eventType: 'DELETE',
          new: {},
          old: { id: '1', title: 'Notificação removida', user_id: 'user123' },
          schema: 'public',
          table: 'notifications'
        }
        
        handler(mockPayload)

        expect(mockHandler).toHaveBeenCalledWith({
          type: 'DELETE',
          table: 'notifications',
          record: mockPayload.old,
          timestamp: expect.any(String),
          eventId: expect.any(String)
        })
      }
    })
  })

  describe('Cleanup', () => {
    it('deve fazer cleanup completo', () => {
      // Criar algumas inscrições
      realtimeService.subscribeToNotifications('user1', mockHandler)
      realtimeService.subscribeToTasks('user2', mockHandler)

      realtimeService.destroy()

      expect(mockChannel.unsubscribe).toHaveBeenCalledTimes(2)
      expect(mockRealtime.removeChannel).toHaveBeenCalledTimes(2)
      expect(mockRealtime.disconnect).toHaveBeenCalled()
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve lidar com erros de inscrição', () => {
      // Mock que falha
      mockChannel.subscribe.mockImplementation(() => {
        throw new Error('Subscription failed')
      })

      expect(() => {
        realtimeService.subscribe('test', {
          event: '*',
          schema: 'public',
          table: 'test'
        }, mockHandler)
      }).toThrow('Subscription failed')
    })

    it('deve lidar com remoção de inscrição inexistente', () => {
      expect(() => {
        realtimeService.unsubscribe('nonexistent-id')
      }).not.toThrow()
    })
  })

  describe('Validação de Parâmetros', () => {
    it('deve validar configuração de inscrição', () => {
      expect(() => {
        realtimeService.subscribe({
          table: '',
          event: '*',
          schema: 'public'
        }, mockHandler)
      }).toThrow()
    })

    it('deve validar handler', () => {
      expect(() => {
        realtimeService.subscribe({
          table: 'test',
          event: '*',
          schema: 'public'
        }, null as any)
      }).toThrow()
    })
  })
})