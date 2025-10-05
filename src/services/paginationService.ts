import { supabase } from '../config/supabase'

// ==================== INTERFACES ====================

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
  search?: string
  searchFields?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    startIndex: number
    endIndex: number
  }
  meta?: {
    executionTime: number
    cacheHit?: boolean
    queryComplexity?: 'low' | 'medium' | 'high'
  }
}

export interface PaginationConfig {
  defaultLimit: number
  maxLimit: number
  enableCache: boolean
  cacheTimeout: number
  enableSearch: boolean
  enableFilters: boolean
}

// ==================== SERVIÇO DE PAGINAÇÃO ====================

export class PaginationService {
  private config: PaginationConfig = {
    defaultLimit: 20,
    maxLimit: 100,
    enableCache: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutos
    enableSearch: true,
    enableFilters: true
  }

  constructor(config?: Partial<PaginationConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  /**
   * Executa consulta paginada no Supabase
   */
  async paginate<T>(
    tableName: string,
    params: PaginationParams,
    selectFields: string = '*',
    additionalFilters?: (query: any) => any
  ): Promise<PaginatedResponse<T>> {
    const startTime = Date.now()
    
    try {
      // Validar e normalizar parâmetros
      const normalizedParams = this.normalizeParams(params)
      
      // Construir query base
      let query = supabase
        .from(tableName)
        .select(selectFields, { count: 'exact' })

      // Aplicar filtros adicionais se fornecidos
      if (additionalFilters) {
        query = additionalFilters(query)
      }

      // Aplicar filtros dinâmicos
      if (this.config.enableFilters && normalizedParams.filters) {
        query = this.applyFilters(query, normalizedParams.filters)
      }

      // Aplicar busca textual
      if (this.config.enableSearch && normalizedParams.search && normalizedParams.searchFields) {
        query = this.applySearch(query, normalizedParams.search, normalizedParams.searchFields)
      }

      // Aplicar ordenação
      if (normalizedParams.sortBy) {
        query = query.order(normalizedParams.sortBy, { 
          ascending: normalizedParams.sortOrder === 'asc' 
        })
      }

      // Aplicar paginação
      const offset = (normalizedParams.page - 1) * normalizedParams.limit
      query = query.range(offset, offset + normalizedParams.limit - 1)

      // Executar query
      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const totalItems = count || 0
      const totalPages = Math.ceil(totalItems / normalizedParams.limit)
      const executionTime = Date.now() - startTime

      return {
        data: data as T[],
        pagination: {
          currentPage: normalizedParams.page,
          totalPages,
          totalItems,
          itemsPerPage: normalizedParams.limit,
          hasNextPage: normalizedParams.page < totalPages,
          hasPreviousPage: normalizedParams.page > 1,
          startIndex: offset + 1,
          endIndex: Math.min(offset + normalizedParams.limit, totalItems)
        },
        meta: {
          executionTime,
          queryComplexity: this.calculateQueryComplexity(normalizedParams)
        }
      }
    } catch (error) {
      console.error(`Erro na paginação da tabela ${tableName}:`, error)
      throw error
    }
  }

  /**
   * Paginação otimizada para cursor (mais eficiente para grandes datasets)
   */
  async paginateByCursor<T>(
    tableName: string,
    params: {
      limit: number
      cursor?: string
      cursorField: string
      sortOrder?: 'asc' | 'desc'
      filters?: Record<string, any>
    },
    selectFields: string = '*',
    additionalFilters?: (query: any) => any
  ): Promise<{
    data: T[]
    nextCursor?: string
    hasMore: boolean
    meta: {
      executionTime: number
      itemsReturned: number
    }
  }> {
    const startTime = Date.now()
    
    try {
      const { limit, cursor, cursorField, sortOrder = 'desc', filters } = params
      const normalizedLimit = Math.min(limit, this.config.maxLimit)

      // Construir query
      let query = supabase
        .from(tableName)
        .select(selectFields)

      // Aplicar filtros adicionais
      if (additionalFilters) {
        query = additionalFilters(query)
      }

      // Aplicar filtros dinâmicos
      if (filters) {
        query = this.applyFilters(query, filters)
      }

      // Aplicar cursor se fornecido
      if (cursor) {
        const operator = sortOrder === 'asc' ? 'gt' : 'lt'
        query = query.filter(cursorField, operator, cursor)
      }

      // Aplicar ordenação e limite
      query = query
        .order(cursorField, { ascending: sortOrder === 'asc' })
        .limit(normalizedLimit + 1) // +1 para verificar se há mais dados

      const { data, error } = await query

      if (error) {
        throw error
      }

      const hasMore = data.length > normalizedLimit
      const items = hasMore ? data.slice(0, normalizedLimit) : data
      const nextCursor = hasMore && items.length > 0 
        ? (items[items.length - 1] as any)[cursorField] 
        : undefined

      return {
        data: items as T[],
        nextCursor,
        hasMore,
        meta: {
          executionTime: Date.now() - startTime,
          itemsReturned: items.length
        }
      }
    } catch (error) {
      console.error(`Erro na paginação por cursor da tabela ${tableName}:`, error)
      throw error
    }
  }

  /**
   * Normaliza e valida parâmetros de paginação
   */
  private normalizeParams(params: PaginationParams): Required<PaginationParams> {
    return {
      page: Math.max(1, params.page || 1),
      limit: Math.min(params.limit || this.config.defaultLimit, this.config.maxLimit),
      sortBy: params.sortBy || 'created_at',
      sortOrder: params.sortOrder || 'desc',
      filters: params.filters || {},
      search: params.search || '',
      searchFields: params.searchFields || []
    }
  }

  /**
   * Aplica filtros dinâmicos à query
   */
  private applyFilters(query: any, filters: Record<string, any>): any {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (typeof value === 'object' && value.operator) {
          // Filtros avançados: { operator: 'gte', value: 100 }
          query = query.filter(key, value.operator, value.value)
        } else {
          query = query.eq(key, value)
        }
      }
    })
    return query
  }

  /**
   * Aplica busca textual em múltiplos campos
   */
  private applySearch(query: any, search: string, searchFields: string[]): any {
    if (searchFields.length === 1) {
      // Busca em um campo único
      return query.ilike(searchFields[0], `%${search}%`)
    } else {
      // Busca em múltiplos campos usando OR
      const searchConditions = searchFields
        .map(field => `${field}.ilike.%${search}%`)
        .join(',')
      return query.or(searchConditions)
    }
  }

  /**
   * Calcula complexidade da query para otimização
   */
  private calculateQueryComplexity(params: Required<PaginationParams>): 'low' | 'medium' | 'high' {
    let complexity = 0
    
    // Fatores que aumentam complexidade
    if (Object.keys(params.filters).length > 0) complexity += 1
    if (params.search && params.searchFields.length > 0) complexity += 1
    if (params.searchFields.length > 3) complexity += 1
    if (params.limit > 50) complexity += 1
    if (params.page > 100) complexity += 1

    if (complexity <= 1) return 'low'
    if (complexity <= 3) return 'medium'
    return 'high'
  }

  /**
   * Gera chave de cache para paginação
   */
  generateCacheKey(tableName: string, params: PaginationParams): string {
    const normalizedParams = this.normalizeParams(params)
    const key = `pagination:${tableName}:${JSON.stringify(normalizedParams)}`
    return key.replace(/\s+/g, '').toLowerCase()
  }

  /**
   * Atualiza configuração do serviço
   */
  updateConfig(newConfig: Partial<PaginationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): PaginationConfig {
    return { ...this.config }
  }
}

// Instância global do serviço de paginação
export const paginationService = new PaginationService()