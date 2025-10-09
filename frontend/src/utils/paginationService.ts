import db from '../config/database'

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
    additionalFilters?: (whereClause: string, values: any[]) => { whereClause: string, values: any[] }
  ): Promise<PaginatedResponse<T>> {
    const startTime = Date.now()
    
    try {
      // Validar e normalizar parâmetros
      const normalizedParams = this.normalizeParams(params)
      
      // Construir query SQL
      let whereClause = ''
      let values: any[] = []
      let valueIndex = 1

      // Aplicar filtros dinâmicos
      if (this.config.enableFilters && normalizedParams.filters) {
        const filterConditions: string[] = []
        for (const [key, value] of Object.entries(normalizedParams.filters)) {
          if (value !== undefined && value !== null) {
            filterConditions.push(`${key} = $${valueIndex}`)
            values.push(value)
            valueIndex++
          }
        }
        if (filterConditions.length > 0) {
          whereClause = filterConditions.join(' AND ')
        }
      }

      // Aplicar busca textual
      if (this.config.enableSearch && normalizedParams.search && normalizedParams.searchFields) {
        const searchConditions = normalizedParams.searchFields.map(field => 
          `${field}::text ILIKE $${valueIndex}`
        )
        values.push(`%${normalizedParams.search}%`)
        valueIndex++
        
        const searchClause = `(${searchConditions.join(' OR ')})`
        whereClause = whereClause ? `${whereClause} AND ${searchClause}` : searchClause
      }

      // Aplicar filtros adicionais se fornecidos
      if (additionalFilters) {
        const result = additionalFilters(whereClause, values)
        whereClause = result.whereClause
        values = result.values
      }

      // Construir ORDER BY
      let orderBy = ''
      if (normalizedParams.sortBy) {
        orderBy = `ORDER BY ${normalizedParams.sortBy} ${normalizedParams.sortOrder?.toUpperCase() || 'ASC'}`
      }

      // Aplicar paginação
      const offset = (normalizedParams.page - 1) * normalizedParams.limit
      const limitClause = `LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`
      values.push(normalizedParams.limit, offset)

      // Query para dados
      const dataQuery = `
        SELECT ${selectFields} 
        FROM ${tableName} 
        ${whereClause ? `WHERE ${whereClause}` : ''} 
        ${orderBy} 
        ${limitClause}
      `

      // Query para contagem total
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM ${tableName} 
        ${whereClause ? `WHERE ${whereClause}` : ''}
      `

      // Executar queries
      const [dataResult, countResult] = await Promise.all([
        db.query(dataQuery, values),
        db.query(countQuery, values.slice(0, -2)) // Remove LIMIT e OFFSET da contagem
      ])

      const data = dataResult.rows as T[]
      const totalItems = parseInt(countResult.rows[0]?.total || '0')
      const totalPages = Math.ceil(totalItems / normalizedParams.limit)
      const executionTime = Date.now() - startTime

      return {
        data,
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
    additionalFilters?: (whereClause: string, values: any[]) => { whereClause: string, values: any[] }
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

      // Construir query SQL
      let whereClause = ''
      let values: any[] = []
      let valueIndex = 1

      // Aplicar filtros dinâmicos
      if (filters) {
        const filterConditions: string[] = []
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            filterConditions.push(`${key} = $${valueIndex}`)
            values.push(value)
            valueIndex++
          }
        }
        if (filterConditions.length > 0) {
          whereClause = filterConditions.join(' AND ')
        }
      }

      // Aplicar cursor se fornecido
      if (cursor) {
        const operator = sortOrder === 'asc' ? '>' : '<'
        const cursorCondition = `${cursorField} ${operator} $${valueIndex}`
        values.push(cursor)
        valueIndex++
        
        whereClause = whereClause ? `${whereClause} AND ${cursorCondition}` : cursorCondition
      }

      // Aplicar filtros adicionais se fornecidos
      if (additionalFilters) {
        const result = additionalFilters(whereClause, values)
        whereClause = result.whereClause
        values = result.values
      }

      // Construir ORDER BY
      const orderBy = `ORDER BY ${cursorField} ${sortOrder?.toUpperCase() || 'DESC'}`

      // Query para dados (+1 para verificar se há mais dados)
      const dataQuery = `
        SELECT ${selectFields} 
        FROM ${tableName} 
        ${whereClause ? `WHERE ${whereClause}` : ''} 
        ${orderBy} 
        LIMIT $${valueIndex}
      `
      values.push(normalizedLimit + 1)

      // Executar query
      const result = await db.query(dataQuery, values)
      const data = result.rows

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