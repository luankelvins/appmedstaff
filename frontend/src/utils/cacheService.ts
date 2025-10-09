/**
 * Serviço de Cache Eficiente
 * 
 * Implementa um sistema de cache em memória com:
 * - TTL (Time To Live) configurável
 * - Invalidação automática e manual
 * - Estratégias de cache (LRU, FIFO)
 * - Compressão de dados
 * - Métricas de performance
 */

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  compressed?: boolean
}

export interface CacheMetrics {
  hits: number
  misses: number
  totalRequests: number
  hitRate: number
  memoryUsage: number
  entriesCount: number
}

export interface CacheConfig {
  defaultTTL: number // em milissegundos
  maxEntries: number
  compressionThreshold: number // tamanho em bytes para ativar compressão
  strategy: 'LRU' | 'FIFO' | 'LFU'
  enableMetrics: boolean
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    memoryUsage: 0,
    entriesCount: 0
  }
  
  private config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5 minutos
    maxEntries: 1000,
    compressionThreshold: 10000, // 10KB
    strategy: 'LRU',
    enableMetrics: true
  }

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    
    // Limpeza automática a cada 5 minutos
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  /**
   * Obtém um item do cache
   */
  get<T>(key: string): T | null {
    this.updateMetrics('request')
    
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.updateMetrics('miss')
      return null
    }

    // Verifica se o item expirou
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.updateMetrics('miss')
      return null
    }

    // Atualiza estatísticas de acesso
    entry.accessCount++
    entry.lastAccessed = Date.now()
    
    this.updateMetrics('hit')
    
    // Descomprime se necessário
    return entry.compressed ? this.decompress(entry.data) as T : entry.data as T
  }

  /**
   * Armazena um item no cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const entryTTL = ttl || this.config.defaultTTL
    
    // Verifica se precisa comprimir
    const dataSize = this.getDataSize(data)
    const shouldCompress = dataSize > this.config.compressionThreshold
    const processedData = shouldCompress ? this.compress(data) : data

    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: now,
      ttl: entryTTL,
      accessCount: 0,
      lastAccessed: now,
      compressed: shouldCompress
    }

    // Remove entradas antigas se necessário
    this.enforceMaxEntries()
    
    this.cache.set(key, entry)
    this.updateCacheMetrics()
  }

  /**
   * Remove um item específico do cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.updateCacheMetrics()
    }
    return deleted
  }

  /**
   * Remove todos os itens do cache
   */
  clear(): void {
    this.cache.clear()
    this.resetMetrics()
  }

  /**
   * Remove itens com base em um padrão
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern)
    let deletedCount = 0
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deletedCount++
      }
    }
    
    if (deletedCount > 0) {
      this.updateCacheMetrics()
    }
    
    return deletedCount
  }

  /**
   * Obtém ou define um valor no cache
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    
    if (cached !== null) {
      return cached
    }

    const data = await factory()
    this.set(key, data, ttl)
    return data
  }

  /**
   * Verifica se uma chave existe no cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry !== undefined && !this.isExpired(entry)
  }

  /**
   * Obtém as métricas do cache
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  /**
   * Obtém informações sobre o cache
   */
  getInfo(): {
    size: number
    memoryUsage: string
    oldestEntry: string | null
    newestEntry: string | null
  } {
    let oldestTimestamp = Infinity
    let newestTimestamp = 0
    let oldestKey: string | null = null
    let newestKey: string | null = null

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
      if (entry.timestamp > newestTimestamp) {
        newestTimestamp = entry.timestamp
        newestKey = key
      }
    }

    return {
      size: this.cache.size,
      memoryUsage: this.formatBytes(this.metrics.memoryUsage),
      oldestEntry: oldestKey,
      newestEntry: newestKey
    }
  }

  /**
   * Limpa entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
    
    if (keysToDelete.length > 0) {
      this.updateCacheMetrics()
      console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`)
    }
  }

  /**
   * Verifica se uma entrada expirou
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  /**
   * Aplica a estratégia de remoção quando o cache atinge o limite
   */
  private enforceMaxEntries(): void {
    if (this.cache.size < this.config.maxEntries) {
      return
    }

    const entriesToRemove = Math.floor(this.config.maxEntries * 0.1) // Remove 10%
    const entries = Array.from(this.cache.entries())

    let sortedEntries: [string, CacheEntry<any>][]

    switch (this.config.strategy) {
      case 'LRU':
        sortedEntries = entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
        break
      case 'LFU':
        sortedEntries = entries.sort((a, b) => a[1].accessCount - b[1].accessCount)
        break
      case 'FIFO':
      default:
        sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
        break
    }

    for (let i = 0; i < entriesToRemove; i++) {
      this.cache.delete(sortedEntries[i][0])
    }
  }

  /**
   * Atualiza métricas do cache
   */
  private updateMetrics(type: 'hit' | 'miss' | 'request'): void {
    if (!this.config.enableMetrics) return

    switch (type) {
      case 'hit':
        this.metrics.hits++
        break
      case 'miss':
        this.metrics.misses++
        break
      case 'request':
        this.metrics.totalRequests++
        break
    }

    this.metrics.hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.hits / this.metrics.totalRequests) * 100 
      : 0
  }

  /**
   * Atualiza métricas de memória e contagem
   */
  private updateCacheMetrics(): void {
    if (!this.config.enableMetrics) return

    this.metrics.entriesCount = this.cache.size
    
    // Estima uso de memória (aproximado)
    let memoryUsage = 0
    for (const [key, entry] of this.cache.entries()) {
      memoryUsage += key.length * 2 // string UTF-16
      memoryUsage += this.getDataSize(entry.data)
      memoryUsage += 64 // overhead do objeto entry
    }
    
    this.metrics.memoryUsage = memoryUsage
  }

  /**
   * Reseta as métricas
   */
  private resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      memoryUsage: 0,
      entriesCount: 0
    }
  }

  /**
   * Estima o tamanho dos dados em bytes
   */
  private getDataSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size
    } catch {
      return JSON.stringify(data).length * 2 // fallback
    }
  }

  /**
   * Comprime dados (simulação - em produção usar biblioteca como pako)
   */
  private compress(data: any): string {
    // Em produção, usar uma biblioteca de compressão real
    return JSON.stringify(data)
  }

  /**
   * Descomprime dados
   */
  private decompress(data: string): any {
    // Em produção, usar uma biblioteca de compressão real
    return JSON.parse(data)
  }

  /**
   * Formata bytes em formato legível
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Instância singleton do cache
export const cacheService = new CacheService({
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  maxEntries: 500,
  strategy: 'LRU',
  enableMetrics: true
})

// Cache específico para widgets com TTL menor
export const widgetCacheService = new CacheService({
  defaultTTL: 2 * 60 * 1000, // 2 minutos
  maxEntries: 200,
  strategy: 'LRU',
  enableMetrics: true
})