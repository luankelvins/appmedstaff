import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { PaginationService } from '../paginationService'
import { supabase } from '../../config/supabase'

// Mock do Supabase
vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      then: vi.fn()
    }))
  }
}))

describe('PaginationService', () => {
  let paginationService: PaginationService
  let mockSupabaseFrom: Mock
  let mockSupabaseQuery: any

  const mockData = [
    { id: '1', name: 'Item 1', created_at: '2024-01-01T10:00:00Z' },
    { id: '2', name: 'Item 2', created_at: '2024-01-02T10:00:00Z' },
    { id: '3', name: 'Item 3', created_at: '2024-01-03T10:00:00Z' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockSupabaseQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      then: vi.fn()
    }
    
    mockSupabaseFrom = vi.mocked(supabase.from)
    mockSupabaseFrom.mockReturnValue(mockSupabaseQuery)
    
    paginationService = new PaginationService({
      defaultLimit: 10,
      maxLimit: 50,
      enableCache: false, // Desabilitar cache para testes
      enableSearch: true,
      enableFilters: true
    })
  })

  describe('Paginação Offset-based', () => {
    it('deve paginar dados corretamente', async () => {
      // Mock das respostas do Supabase
      mockSupabaseQuery.then
        .mockResolvedValueOnce({ data: mockData, error: null, count: null })
        .mockResolvedValueOnce({ data: null, error: null, count: 10 })

      const params = {
        page: 1,
        limit: 3,
        sortBy: 'created_at',
        sortOrder: 'desc' as const
      }

      const result = await paginationService.paginate('test_table', params)

      expect(result.data).toEqual(mockData)
      expect(result.pagination.currentPage).toBe(1)
      expect(result.pagination.itemsPerPage).toBe(3)
      expect(result.pagination.totalItems).toBe(10)
      expect(result.pagination.totalPages).toBe(4)
      expect(result.pagination.hasNextPage).toBe(true)
      expect(result.pagination.hasPreviousPage).toBe(false)
    })

    it('deve aplicar filtros corretamente', async () => {
      mockSupabaseQuery.then
        .mockResolvedValueOnce({ data: mockData, error: null, count: null })
        .mockResolvedValueOnce({ data: null, error: null, count: 3 })

      const params = {
        page: 1,
        limit: 10,
        filters: {
          status: 'active',
          user_id: '123'
        }
      }

      await paginationService.paginate('test_table', params)

      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('status', 'active')
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('user_id', '123')
    })

    it('deve aplicar busca em múltiplos campos', async () => {
      mockSupabaseQuery.then
        .mockResolvedValueOnce({ data: mockData, error: null, count: null })
        .mockResolvedValueOnce({ data: null, error: null, count: 3 })

      const params = {
        page: 1,
        limit: 10,
        search: 'João',
        searchFields: ['name', 'email']
      }

      await paginationService.paginate('test_table', params)

      expect(mockSupabaseQuery.or).toHaveBeenCalledWith('name.ilike.%João%,email.ilike.%João%')
    })

    it('deve usar valores padrão quando parâmetros não fornecidos', async () => {
      mockSupabaseQuery.then
        .mockResolvedValueOnce({ data: mockData, error: null, count: null })
        .mockResolvedValueOnce({ data: null, error: null, count: 3 })

      const params = { page: 1, limit: 10 }

      await paginationService.paginate('test_table', params)

      expect(mockSupabaseQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(mockSupabaseQuery.range).toHaveBeenCalledWith(0, 9)
    })

    it('deve calcular índices corretamente para páginas diferentes', async () => {
      mockSupabaseQuery.then
        .mockResolvedValueOnce({ data: mockData, error: null, count: null })
        .mockResolvedValueOnce({ data: null, error: null, count: 25 })

      const params = { page: 3, limit: 5 }

      const result = await paginationService.paginate('test_table', params)

      expect(result.pagination.startIndex).toBe(10) // (3-1) * 5
      expect(result.pagination.endIndex).toBe(14)   // 10 + 5 - 1
      expect(mockSupabaseQuery.range).toHaveBeenCalledWith(10, 14)
    })
  })

  describe('Paginação Cursor-based', () => {
    it('deve paginar por cursor corretamente', async () => {
      mockSupabaseQuery.then.mockResolvedValue({ data: mockData, error: null })

      const params = {
        limit: 2,
        cursorField: 'created_at',
        sortOrder: 'desc' as const
      }

      const result = await paginationService.paginateByCursor('test_table', params)

      expect(result.data).toEqual(mockData)
      expect(result.hasMore).toBe(true) // 3 itens retornados, limite 2 + 1
      expect(result.nextCursor).toBe('2024-01-02T10:00:00Z') // created_at do segundo item
    })

    it('deve aplicar cursor para navegação', async () => {
      mockSupabaseQuery.then.mockResolvedValue({ data: mockData.slice(1), error: null })

      const params = {
        limit: 2,
        cursor: '2024-01-01T10:00:00Z',
        cursorField: 'created_at',
        sortOrder: 'desc' as const
      }

      await paginationService.paginateByCursor('test_table', params)

      expect(mockSupabaseQuery.lt).toHaveBeenCalledWith('created_at', '2024-01-01T10:00:00Z')
    })

    it('deve aplicar filtros em paginação por cursor', async () => {
      mockSupabaseQuery.then.mockResolvedValue({ data: mockData, error: null })

      const params = {
        limit: 2,
        cursorField: 'created_at',
        filters: { status: 'active' }
      }

      await paginationService.paginateByCursor('test_table', params)

      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('status', 'active')
    })

    it('deve indicar hasMore=false quando não há mais dados', async () => {
      const limitedData = mockData.slice(0, 2)
      mockSupabaseQuery.then.mockResolvedValue({ data: limitedData, error: null })

      const params = {
        limit: 2,
        cursorField: 'created_at'
      }

      const result = await paginationService.paginateByCursor('test_table', params)

      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
    })
  })

  describe('Geração de Cache Key', () => {
    it('deve gerar chave de cache única para parâmetros diferentes', () => {
      const params1 = { page: 1, limit: 10, sortBy: 'name' }
      const params2 = { page: 2, limit: 10, sortBy: 'name' }
      const params3 = { page: 1, limit: 20, sortBy: 'name' }

      const key1 = paginationService.generateCacheKey('users', params1)
      const key2 = paginationService.generateCacheKey('users', params2)
      const key3 = paginationService.generateCacheKey('users', params3)

      expect(key1).not.toBe(key2)
      expect(key1).not.toBe(key3)
      expect(key2).not.toBe(key3)
    })

    it('deve incluir filtros e busca na chave de cache', () => {
      const params1 = { page: 1, limit: 10 }
      const params2 = { page: 1, limit: 10, filters: { status: 'active' } }
      const params3 = { page: 1, limit: 10, search: 'João' }

      const key1 = paginationService.generateCacheKey('users', params1)
      const key2 = paginationService.generateCacheKey('users', params2)
      const key3 = paginationService.generateCacheKey('users', params3)

      expect(key1).not.toBe(key2)
      expect(key1).not.toBe(key3)
      expect(key2).not.toBe(key3)
    })
  })

  describe('Configuração', () => {
    it('deve atualizar configuração', () => {
      const newConfig = {
        defaultLimit: 25,
        maxLimit: 200
      }

      paginationService.updateConfig(newConfig)
      const config = paginationService.getConfig()

      expect(config.defaultLimit).toBe(25)
      expect(config.maxLimit).toBe(200)
    })

    it('deve retornar configuração atual', () => {
      const config = paginationService.getConfig()

      expect(config).toHaveProperty('defaultLimit')
      expect(config).toHaveProperty('maxLimit')
      expect(config).toHaveProperty('enableCache')
      expect(config).toHaveProperty('enableSearch')
      expect(config).toHaveProperty('enableFilters')
    })
  })

  describe('Validação de Parâmetros', () => {
    it('deve limitar o limite máximo', async () => {
      mockSupabaseQuery.then
        .mockResolvedValueOnce({ data: mockData, error: null, count: null })
        .mockResolvedValueOnce({ data: null, error: null, count: 3 })

      const params = { page: 1, limit: 1000 } // Excede maxLimit

      await paginationService.paginate('test_table', params)

      // Deve usar maxLimit (50) em vez de 1000
      expect(mockSupabaseQuery.range).toHaveBeenCalledWith(0, 49)
    })

    it('deve usar limite padrão quando não especificado', async () => {
      mockSupabaseQuery.then
        .mockResolvedValueOnce({ data: mockData, error: null, count: null })
        .mockResolvedValueOnce({ data: null, error: null, count: 3 })

      const params = { page: 1, limit: 0 } // Limite inválido

      await paginationService.paginate('test_table', params)

      // Deve usar defaultLimit (10)
      expect(mockSupabaseQuery.range).toHaveBeenCalledWith(0, 9)
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve propagar erros do Supabase', async () => {
      const error = { message: 'Database error', code: '500' }
      mockSupabaseQuery.then.mockResolvedValue({ data: null, error })

      const params = { page: 1, limit: 10 }

      await expect(paginationService.paginate('test_table', params))
        .rejects.toThrow('Database error')
    })

    it('deve lidar com dados nulos', async () => {
      mockSupabaseQuery.then
        .mockResolvedValueOnce({ data: null, error: null, count: null })
        .mockResolvedValueOnce({ data: null, error: null, count: 0 })

      const params = { page: 1, limit: 10 }

      const result = await paginationService.paginate('test_table', params)

      expect(result.data).toEqual([])
      expect(result.pagination.totalItems).toBe(0)
    })
  })

  describe('Métricas de Performance', () => {
    it('deve incluir tempo de execução nos metadados', async () => {
      mockSupabaseQuery.then
        .mockResolvedValueOnce({ data: mockData, error: null, count: null })
        .mockResolvedValueOnce({ data: null, error: null, count: 3 })

      const params = { page: 1, limit: 10 }

      const result = await paginationService.paginate('test_table', params)

      expect(result.meta).toHaveProperty('executionTime')
      expect(typeof result.meta?.executionTime).toBe('number')
      expect(result.meta?.executionTime).toBeGreaterThan(0)
    })

    it('deve calcular complexidade da query', async () => {
      mockSupabaseQuery.then
        .mockResolvedValueOnce({ data: mockData, error: null, count: null })
        .mockResolvedValueOnce({ data: null, error: null, count: 3 })

      // Query complexa com filtros, busca e ordenação
      const params = {
        page: 1,
        limit: 10,
        sortBy: 'name',
        filters: { status: 'active', type: 'premium' },
        search: 'João',
        searchFields: ['name', 'email', 'description']
      }

      const result = await paginationService.paginate('test_table', params)

      expect(result.meta).toHaveProperty('queryComplexity')
      expect(['low', 'medium', 'high']).toContain(result.meta?.queryComplexity)
    })
  })
})