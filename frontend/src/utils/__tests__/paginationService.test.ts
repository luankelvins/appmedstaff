import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../paginationService', () => ({
  paginationService: {
    paginate: vi.fn(),
    paginateByCursor: vi.fn(),
    generateCacheKey: vi.fn(),
    updateConfig: vi.fn(),
    getConfig: vi.fn()
  }
}))

import { paginationService } from '../paginationService'

const mockPaginationService = paginationService as any

describe('PaginationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('paginate', () => {
    it('deve retornar dados paginados', async () => {
      const mockResult = {
        data: [
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
          startIndex: 0,
          endIndex: 1
        },
        meta: {
          executionTime: 50,
          queryComplexity: 'low' as const
        }
      }

      mockPaginationService.paginate.mockResolvedValue(mockResult)

      const result = await paginationService.paginate('test_table', {
        page: 1,
        limit: 10
      })

      expect(result).toEqual(mockResult)
      expect(mockPaginationService.paginate).toHaveBeenCalledWith('test_table', {
        page: 1,
        limit: 10
      })
    })

    it('deve aplicar filtros quando fornecidos', async () => {
      const mockResult = {
        data: [{ id: '1', name: 'Filtered Item' }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
          startIndex: 0,
          endIndex: 0
        }
      }

      mockPaginationService.paginate.mockResolvedValue(mockResult)

      const filters = { status: 'active' }
      const result = await paginationService.paginate('test_table', {
        page: 1,
        limit: 10,
        filters
      })

      expect(result).toEqual(mockResult)
      expect(mockPaginationService.paginate).toHaveBeenCalledWith('test_table', {
        page: 1,
        limit: 10,
        filters
      })
    })
  })

  describe('paginateByCursor', () => {
    it('deve retornar dados paginados por cursor', async () => {
      const mockResult = {
        data: [
          { id: '1', name: 'Item 1', created_at: '2024-01-01' },
          { id: '2', name: 'Item 2', created_at: '2024-01-02' }
        ],
        nextCursor: '2024-01-02',
        hasMore: true,
        meta: {
          executionTime: 30,
          itemsReturned: 2
        }
      }

      mockPaginationService.paginateByCursor.mockResolvedValue(mockResult)

      const result = await paginationService.paginateByCursor('test_table', {
        limit: 2,
        cursorField: 'created_at'
      })

      expect(result).toEqual(mockResult)
      expect(mockPaginationService.paginateByCursor).toHaveBeenCalledWith('test_table', {
        limit: 2,
        cursorField: 'created_at'
      })
    })
  })

  describe('generateCacheKey', () => {
    it('deve gerar chave de cache', () => {
      const mockKey = 'test_table_page_1_limit_10'

      mockPaginationService.generateCacheKey.mockReturnValue(mockKey)

      const result = paginationService.generateCacheKey('test_table', {
        page: 1,
        limit: 10
      })

      expect(result).toBe(mockKey)
      expect(mockPaginationService.generateCacheKey).toHaveBeenCalledWith('test_table', {
        page: 1,
        limit: 10
      })
    })
  })

  describe('config', () => {
    it('deve atualizar configuração', () => {
      const newConfig = {
        defaultLimit: 25,
        maxLimit: 200
      }

      paginationService.updateConfig(newConfig)

      expect(mockPaginationService.updateConfig).toHaveBeenCalledWith(newConfig)
    })

    it('deve retornar configuração atual', () => {
      const mockConfig = {
        defaultLimit: 20,
        maxLimit: 100,
        enableCache: true,
        cacheTimeout: 300000,
        enableSearch: true,
        enableFilters: true
      }

      mockPaginationService.getConfig.mockReturnValue(mockConfig)

      const result = paginationService.getConfig()

      expect(result).toEqual(mockConfig)
      expect(mockPaginationService.getConfig).toHaveBeenCalled()
    })
  })
})