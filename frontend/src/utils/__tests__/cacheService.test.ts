import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CacheService } from '../cacheService'

describe('CacheService', () => {
  let cacheService: CacheService

  beforeEach(() => {
    cacheService = new CacheService({
      defaultTTL: 1000, // 1 segundo para testes rápidos
      maxEntries: 5,
      strategy: 'LRU',
      enableMetrics: true
    })
  })

  afterEach(() => {
    cacheService.clear()
  })

  describe('Operações Básicas', () => {
    it('deve armazenar e recuperar dados', () => {
      const testData = { name: 'João', age: 30 }
      
      cacheService.set('user:1', testData)
      const result = cacheService.get('user:1')
      
      expect(result).toEqual(testData)
    })

    it('deve retornar null para chave inexistente', () => {
      const result = cacheService.get('nonexistent')
      expect(result).toBeNull()
    })

    it('deve verificar se chave existe', () => {
      cacheService.set('test', 'value')
      
      expect(cacheService.has('test')).toBe(true)
      expect(cacheService.has('nonexistent')).toBe(false)
    })

    it('deve deletar entrada específica', () => {
      cacheService.set('test', 'value')
      expect(cacheService.has('test')).toBe(true)
      
      const deleted = cacheService.delete('test')
      expect(deleted).toBe(true)
      expect(cacheService.has('test')).toBe(false)
    })

    it('deve limpar todo o cache', () => {
      cacheService.set('key1', 'value1')
      cacheService.set('key2', 'value2')
      
      cacheService.clear()
      
      expect(cacheService.has('key1')).toBe(false)
      expect(cacheService.has('key2')).toBe(false)
    })
  })

  describe('TTL (Time To Live)', () => {
    it('deve expirar dados após TTL', async () => {
      cacheService.set('temp', 'value', 100) // 100ms
      
      expect(cacheService.get('temp')).toBe('value')
      
      // Aguardar expiração
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(cacheService.get('temp')).toBeNull()
    })

    it('deve usar TTL padrão quando não especificado', async () => {
      cacheService.set('default-ttl', 'value')
      
      expect(cacheService.get('default-ttl')).toBe('value')
      
      // Aguardar expiração (TTL padrão é 1000ms nos testes)
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(cacheService.get('default-ttl')).toBeNull()
    })
  })

  describe('Invalidação por Padrão', () => {
    it('deve invalidar entradas que correspondem ao padrão', () => {
      cacheService.set('user:1', 'João')
      cacheService.set('user:2', 'Maria')
      cacheService.set('product:1', 'Produto A')
      
      const invalidated = cacheService.invalidatePattern('user:')
      
      expect(invalidated).toBe(2)
      expect(cacheService.has('user:1')).toBe(false)
      expect(cacheService.has('user:2')).toBe(false)
      expect(cacheService.has('product:1')).toBe(true)
    })

    it('deve retornar 0 quando nenhuma entrada corresponde', () => {
      cacheService.set('test', 'value')
      
      const invalidated = cacheService.invalidatePattern('nonexistent:')
      
      expect(invalidated).toBe(0)
      expect(cacheService.has('test')).toBe(true)
    })
  })

  describe('getOrSet', () => {
    it('deve retornar valor existente do cache', async () => {
      const existingValue = 'cached-value'
      cacheService.set('test', existingValue)
      
      const factory = vi.fn().mockResolvedValue('new-value')
      
      const result = await cacheService.getOrSet('test', factory)
      
      expect(result).toBe(existingValue)
      expect(factory).not.toHaveBeenCalled()
    })

    it('deve executar factory e cachear resultado quando não existe', async () => {
      const newValue = 'factory-value'
      const factory = vi.fn().mockResolvedValue(newValue)
      
      const result = await cacheService.getOrSet('new-key', factory)
      
      expect(result).toBe(newValue)
      expect(factory).toHaveBeenCalledOnce()
      expect(cacheService.get('new-key')).toBe(newValue)
    })

    it('deve usar TTL personalizado', async () => {
      const factory = vi.fn().mockResolvedValue('value')
      
      await cacheService.getOrSet('ttl-test', factory, 100)
      
      expect(cacheService.get('ttl-test')).toBe('value')
      
      // Aguardar expiração
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(cacheService.get('ttl-test')).toBeNull()
    })
  })

  describe('Métricas', () => {
    it('deve rastrear hits e misses', () => {
      // Cache miss
      cacheService.get('nonexistent')
      
      // Cache hit
      cacheService.set('test', 'value')
      cacheService.get('test')
      
      const metrics = cacheService.getMetrics()
      
      expect(metrics.hits).toBe(1)
      expect(metrics.misses).toBe(1)
      expect(metrics.totalRequests).toBe(2)
      expect(metrics.hitRate).toBe(0.5)
    })

    it('deve rastrear número de entradas', () => {
      cacheService.set('key1', 'value1')
      cacheService.set('key2', 'value2')
      
      const metrics = cacheService.getMetrics()
      
      expect(metrics.entriesCount).toBe(2)
    })
  })

  describe('Informações do Cache', () => {
    it('deve retornar informações básicas', () => {
      cacheService.set('test1', 'value1')
      cacheService.set('test2', 'value2')
      
      const info = cacheService.getInfo()
      
      expect(info.size).toBe(2)
      expect(info.memoryUsage).toContain('B') // Deve conter unidade de bytes
      expect(info.oldestEntry).toBe('test1')
      expect(info.newestEntry).toBe('test2')
    })

    it('deve retornar null para entradas quando cache vazio', () => {
      const info = cacheService.getInfo()
      
      expect(info.size).toBe(0)
      expect(info.oldestEntry).toBeNull()
      expect(info.newestEntry).toBeNull()
    })
  })

  describe('Estratégia LRU', () => {
    it('deve remover entrada menos recentemente usada quando excede maxEntries', () => {
      // Preencher cache até o limite
      for (let i = 1; i <= 5; i++) {
        cacheService.set(`key${i}`, `value${i}`)
      }
      
      // Acessar key1 para torná-la mais recente
      cacheService.get('key1')
      
      // Adicionar nova entrada (deve remover key2, que é a menos recente)
      cacheService.set('key6', 'value6')
      
      expect(cacheService.has('key1')).toBe(true) // Acessada recentemente
      expect(cacheService.has('key2')).toBe(false) // Menos recentemente usada
      expect(cacheService.has('key6')).toBe(true) // Nova entrada
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve lidar com factory que falha em getOrSet', async () => {
      const factory = vi.fn().mockRejectedValue(new Error('Factory error'))
      
      await expect(cacheService.getOrSet('error-key', factory)).rejects.toThrow('Factory error')
      
      // Não deve cachear resultado de erro
      expect(cacheService.has('error-key')).toBe(false)
    })

    it('deve lidar com dados complexos', () => {
      const complexData = {
        user: { id: 1, name: 'João' },
        permissions: ['read', 'write'],
        metadata: { created: new Date(), active: true }
      }
      
      cacheService.set('complex', complexData)
      const result = cacheService.get('complex')
      
      expect(result).toEqual(complexData)
    })
  })
})