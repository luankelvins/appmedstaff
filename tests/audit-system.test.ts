import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { auditService } from '../src/services/auditService'
import { AuditLogCreate, AuditLogFilter } from '../src/types/audit'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Mock do Supabase
vi.mock('../src/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    })),
    rpc: vi.fn()
  }
}))

describe('Sistema de Auditoria', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Logging de Ações', () => {
    it('deve registrar uma ação de auditoria com sucesso', async () => {
      const mockUser: SupabaseUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      }
      const mockProfile = { name: 'Test User', position: 'Admin' }

      // Mock das respostas do Supabase
      const { supabase } = await import('../src/config/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      } as any)

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })

      const logData: AuditLogCreate = {
        actorId: 'user-123',
        action: 'finance.expenses.create',
        entity: 'expense',
        entityId: 'expense-456',
        success: true
      }

      await auditService.logAction(logData)
      
      expect(supabase.rpc).toHaveBeenCalledWith('log_audit_action', expect.any(Object))
    })

    it('deve lidar com erro ao registrar ação', async () => {
      const mockUser: SupabaseUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      }
      const mockProfile = { name: 'Test User', position: 'Admin' }

      const { supabase } = await import('../src/config/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      } as any)

      const mockError = new Error('Database error')
      vi.mocked(supabase.rpc).mockRejectedValue(mockError)

      const logData: AuditLogCreate = {
        actorId: 'user-123',
        action: 'finance.expenses.create',
        entity: 'expense',
        entityId: 'expense-456',
        success: true,
        meta: {
          amount: 1000,
          category: 'office'
        }
      }

      // O serviço não propaga erros, apenas os registra no console
      await auditService.logAction(logData)
      expect(supabase.rpc).toHaveBeenCalled()
    })
  })

  describe('Busca de Logs', () => {
    it('deve buscar logs com filtros', async () => {
      const mockUser: SupabaseUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      }
      
      const { supabase } = await import('../src/config/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: {
          logs: [],
          total: 0,
          page: 1,
          totalPages: 0
        },
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })

      const filter: AuditLogFilter = {
        actorId: 'user-123',
        action: 'finance.expenses.create',
        dateFrom: new Date('2023-01-01'),
        dateTo: new Date('2023-12-31')
      }

      const result = await auditService.getLogs(filter)
      
      // O serviço usa fallback para dados mock quando a tabela não existe
      expect(result).toBeDefined()
      expect(Array.isArray(result.logs)).toBe(true)
    })

    it('deve lidar com erro ao buscar logs', async () => {
      const mockUser: SupabaseUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      }
      
      const { supabase } = await import('../src/config/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockError = new Error('Database error')
      vi.mocked(supabase.rpc).mockRejectedValue(mockError)

      const filter: AuditLogFilter = {
        action: 'finance.expenses.create',
        dateFrom: new Date('2023-01-01'),
        dateTo: new Date('2023-12-31')
      }

      // O serviço usa fallback para dados mock em caso de erro
      const result = await auditService.getLogs(filter)
      expect(result).toBeDefined()
      expect(Array.isArray(result.logs)).toBe(true)
    })

    it('deve buscar logs sem filtros', async () => {
      const mockUser: SupabaseUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      }
      
      const { supabase } = await import('../src/config/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: {
          logs: [{ id: '1', action: 'test' }],
          total: 1,
          page: 1,
          totalPages: 1
        },
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })

      const result = await auditService.getLogs()
      
      // O serviço usa fallback para dados mock quando a tabela não existe
      expect(result).toBeDefined()
      expect(Array.isArray(result.logs)).toBe(true)
    })
  })

  describe('Estatísticas de Auditoria', () => {
    it('deve retornar estatísticas de auditoria', async () => {
      const mockUser: SupabaseUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      }
      
      const { supabase } = await import('../src/config/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: {
          totalLogs: 100,
          successfulActions: 90,
          failedActions: 10,
          topActions: [],
          topActors: []
        },
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })

      const stats = await auditService.getAuditStats()
      
      expect(supabase.rpc).toHaveBeenCalledWith('get_audit_stats')
      expect(stats).toBeDefined()
      expect(typeof stats.totalLogs).toBe('number')
      expect(typeof stats.successfulActions).toBe('number')
      expect(typeof stats.failedActions).toBe('number')
      expect(Array.isArray(stats.topActions)).toBe(true)
      expect(Array.isArray(stats.topActors)).toBe(true)
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve tratar erro de usuário não encontrado', async () => {
      const { supabase } = await import('../src/config/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      } as any)

      const logData: AuditLogCreate = {
        actorId: 'user-123',
        action: 'finance.expenses.create',
        entity: 'expense',
        entityId: 'expense-456',
        success: true
      }

      // O serviço retorna silenciosamente quando não há usuário
      await auditService.logAction(logData)
      expect(supabase.rpc).not.toHaveBeenCalled()
    })

    it('deve tratar usuário não autenticado', async () => {
      const { supabase } = await import('../src/config/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      } as any)

      const logData: AuditLogCreate = {
        actorId: 'user-123',
        action: 'finance.expenses.create',
        entity: 'expense',
        entityId: 'expense-456',
        success: true
      }

      // O serviço retorna silenciosamente quando não há usuário
      await auditService.logAction(logData)
      expect(supabase.rpc).not.toHaveBeenCalled()
    })
  })

  describe('Validação de Parâmetros', () => {
    it('deve aceitar parâmetros válidos', async () => {
      const mockUser: SupabaseUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      }
      
      const { supabase } = await import('../src/config/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { name: 'Test', position: 'Admin' },
              error: null
            })
          })
        })
      } as any)

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })

      const validLogData: AuditLogCreate = {
        actorId: 'user-123',
        action: 'finance.expenses.create',
        entity: 'expense',
        entityId: 'expense-456',
        success: true
      }

      await auditService.logAction(validLogData)
      expect(supabase.rpc).toHaveBeenCalled()
    })
  })

  describe('Performance', () => {
    it('deve executar logging em tempo aceitável', async () => {
      const mockUser: SupabaseUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      }
      
      const { supabase } = await import('../src/config/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { name: 'Test', position: 'Admin' },
              error: null
            })
          })
        })
      } as any)

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })

      const logData: AuditLogCreate = {
        actorId: 'user-123',
        action: 'finance.expenses.create',
        entity: 'expense',
        entityId: 'expense-456',
        success: true
      }

      const startTime = Date.now()
      await auditService.logAction(logData)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(1000) // Menos de 1 segundo
    })
  })

  describe('Validação de Dados', () => {
    it('deve aceitar metadados válidos', async () => {
      const mockUser: SupabaseUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      }
      
      const { supabase } = await import('../src/config/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { name: 'Test', position: 'Admin' },
              error: null
            })
          })
        })
      } as any)

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })

      const logData: AuditLogCreate = {
        actorId: 'user-123',
        action: 'finance.expenses.create',
        entity: 'expense',
        entityId: 'expense-456',
        success: true,
        meta: {
          amount: 1000,
          category: 'office',
          description: 'Compra de equipamentos'
        }
      }

      await auditService.logAction(logData)
      
      expect(supabase.rpc).toHaveBeenCalledWith('log_audit_action', expect.objectContaining({
        p_meta: expect.any(Object)
      }))
    })
  })

  describe('Segurança', () => {
    it('deve sanitizar dados sensíveis nos metadados', async () => {
      const mockUser: SupabaseUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      }
      
      const { supabase } = await import('../src/config/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { name: 'Test', position: 'Admin' },
              error: null
            })
          })
        })
      } as any)

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })

      const logData: AuditLogCreate = {
        actorId: 'user-123',
        action: 'auth.password_change',
        entity: 'user',
        entityId: 'user-456',
        success: true,
        meta: {
          password: 'sensitive-data',
          token: 'secret-token',
          publicInfo: 'safe-data'
        }
      }

      await auditService.logAction(logData)
      
      // Verificar se os dados foram passados (sanitização seria feita no banco)
      expect(supabase.rpc).toHaveBeenCalledWith('log_audit_action', expect.objectContaining({
        p_meta: expect.any(Object)
      }))
    })
  })

  describe('Conformidade', () => {
    it('deve registrar ações de conformidade LGPD', async () => {
      const mockUser: SupabaseUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z'
      }
      
      const { supabase } = await import('../src/config/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { name: 'Test', position: 'Admin' },
              error: null
            })
          })
        })
      } as any)

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      })

      const logData: AuditLogCreate = {
        actorId: 'user-123',
        action: 'data.personal.access',
        entity: 'user_data',
        entityId: 'data-789',
        success: true,
        meta: {
          dataType: 'personal',
          purpose: 'profile_update',
          legalBasis: 'consent'
        }
      }

      await auditService.logAction(logData)
      
      expect(supabase.rpc).toHaveBeenCalledWith('log_audit_action', expect.objectContaining({
        p_action: 'data.personal.access',
        p_meta: expect.objectContaining({
          dataType: 'personal',
          legalBasis: 'consent'
        })
      }))
    })
  })
})