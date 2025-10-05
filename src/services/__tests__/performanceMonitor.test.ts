import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest'
import { PerformanceMonitor } from '../performanceMonitor'

// Mock do console para capturar logs
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn()
}

// Mock do Performance API
const mockPerformance = {
  now: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(),
  getEntriesByName: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn()
}

// Mock do Navigator API
const mockNavigator = {
  connection: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50
  },
  hardwareConcurrency: 8
}

// Mock do Memory API
const mockMemory = {
  usedJSHeapSize: 50000000,
  totalJSHeapSize: 100000000,
  jsHeapSizeLimit: 2000000000
}

// Setup global mocks
Object.defineProperty(global, 'console', { value: mockConsole })
Object.defineProperty(global, 'performance', { value: mockPerformance })
Object.defineProperty(global, 'navigator', { value: mockNavigator })
Object.defineProperty(global, 'memory', { value: mockMemory })

describe('PerformanceMonitor', () => {
  let performanceMonitor: PerformanceMonitor
  let currentTime = 1000

  beforeEach(() => {
    vi.clearAllMocks()
    currentTime = 1000
    mockPerformance.now.mockImplementation(() => currentTime)
    performanceMonitor = new PerformanceMonitor()
  })

  afterEach(() => {
    performanceMonitor.destroy()
  })

  describe('Medição de Performance', () => {
    it('deve iniciar e finalizar medição de operação', () => {
      const operationId = performanceMonitor.startOperation('test-operation')
      
      expect(operationId).toBeDefined()
      expect(typeof operationId).toBe('string')
      expect(mockPerformance.mark).toHaveBeenCalledWith(`start-${operationId}`)

      // Simular passagem de tempo
      currentTime += 100

      const result = performanceMonitor.endOperation(operationId)

      expect(result).toEqual({
        operationId,
        name: 'test-operation',
        duration: 100,
        timestamp: expect.any(String),
        success: true
      })
      expect(mockPerformance.mark).toHaveBeenCalledWith(`end-${operationId}`)
      expect(mockPerformance.measure).toHaveBeenCalledWith(
        `operation-${operationId}`,
        `start-${operationId}`,
        `end-${operationId}`
      )
    })

    it('deve marcar operação como falha', () => {
      const operationId = performanceMonitor.startOperation('failing-operation')
      currentTime += 50

      const result = performanceMonitor.endOperation(operationId, false, 'Operation failed')

      expect(result).toEqual({
        operationId,
        name: 'failing-operation',
        duration: 50,
        timestamp: expect.any(String),
        success: false,
        error: 'Operation failed'
      })
    })

    it('deve lidar com operação inexistente', () => {
      const result = performanceMonitor.endOperation('nonexistent-id')

      expect(result).toBeNull()
    })
  })

  describe('Métricas de Sistema', () => {
    it('deve coletar métricas de memória', () => {
      const metrics = performanceMonitor.getMemoryMetrics()

      expect(metrics).toEqual({
        used: 50000000,
        total: 100000000,
        limit: 2000000000,
        percentage: 50
      })
    })

    it('deve coletar métricas de rede', () => {
      const metrics = performanceMonitor.getNetworkMetrics()

      expect(metrics).toEqual({
        effectiveType: '4g',
        downlink: 10,
        rtt: 50
      })
    })

    it('deve coletar métricas de CPU', () => {
      const metrics = performanceMonitor.getCPUMetrics()

      expect(metrics).toEqual({
        cores: 8,
        usage: expect.any(Number)
      })
    })

    it('deve lidar com APIs não disponíveis', () => {
      // Remover temporariamente as APIs
      const originalMemory = (global as any).memory
      const originalNavigator = (global as any).navigator
      
      delete (global as any).memory
      delete (global as any).navigator

      const memoryMetrics = performanceMonitor.getMemoryMetrics()
      const networkMetrics = performanceMonitor.getNetworkMetrics()

      expect(memoryMetrics).toEqual({
        used: 0,
        total: 0,
        limit: 0,
        percentage: 0
      })
      expect(networkMetrics).toEqual({
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0
      })

      // Restaurar APIs
      Object.defineProperty(global, 'memory', { value: originalMemory })
      Object.defineProperty(global, 'navigator', { value: originalNavigator })
    })
  })

  describe('Relatórios de Performance', () => {
    it('deve gerar relatório de operações', () => {
      // Executar algumas operações
      const op1 = performanceMonitor.startOperation('operation-1')
      currentTime += 100
      performanceMonitor.endOperation(op1)

      const op2 = performanceMonitor.startOperation('operation-2')
      currentTime += 200
      performanceMonitor.endOperation(op2, false, 'Failed')

      const report = performanceMonitor.getOperationsReport()

      expect(report).toEqual({
        totalOperations: 2,
        successfulOperations: 1,
        failedOperations: 1,
        averageDuration: 150,
        operations: expect.arrayContaining([
          expect.objectContaining({
            name: 'operation-1',
            duration: 100,
            success: true
          }),
          expect.objectContaining({
            name: 'operation-2',
            duration: 200,
            success: false,
            error: 'Failed'
          })
        ])
      })
    })

    it('deve gerar relatório de sistema', () => {
      const report = performanceMonitor.getSystemReport()

      expect(report).toEqual({
        timestamp: expect.any(String),
        memory: expect.objectContaining({
          used: expect.any(Number),
          total: expect.any(Number),
          percentage: expect.any(Number)
        }),
        network: expect.objectContaining({
          effectiveType: expect.any(String),
          downlink: expect.any(Number),
          rtt: expect.any(Number)
        }),
        cpu: expect.objectContaining({
          cores: expect.any(Number),
          usage: expect.any(Number)
        })
      })
    })

    it('deve gerar relatório completo', () => {
      // Executar uma operação
      const op = performanceMonitor.startOperation('test-op')
      currentTime += 50
      performanceMonitor.endOperation(op)

      const report = performanceMonitor.getFullReport()

      expect(report).toEqual({
        timestamp: expect.any(String),
        operations: expect.objectContaining({
          totalOperations: 1,
          successfulOperations: 1,
          failedOperations: 0,
          averageDuration: 50
        }),
        system: expect.objectContaining({
          memory: expect.any(Object),
          network: expect.any(Object),
          cpu: expect.any(Object)
        })
      })
    })
  })

  describe('Alertas de Performance', () => {
    it('deve configurar alertas', () => {
      const alertHandler = vi.fn()

      performanceMonitor.setAlert('memory', {
        threshold: 80,
        handler: alertHandler
      })

      // Simular uso alto de memória
      Object.defineProperty(global, 'memory', {
        value: {
          usedJSHeapSize: 85000000,
          totalJSHeapSize: 100000000,
          jsHeapSizeLimit: 2000000000
        }
      })

      const metrics = performanceMonitor.getMemoryMetrics()
      
      // Verificar se o alerta foi disparado
      expect(alertHandler).toHaveBeenCalledWith({
        type: 'memory',
        value: 85,
        threshold: 80,
        timestamp: expect.any(String)
      })
    })

    it('deve remover alertas', () => {
      const alertHandler = vi.fn()

      performanceMonitor.setAlert('memory', {
        threshold: 80,
        handler: alertHandler
      })

      performanceMonitor.removeAlert('memory')

      // Simular uso alto de memória
      Object.defineProperty(global, 'memory', {
        value: {
          usedJSHeapSize: 85000000,
          totalJSHeapSize: 100000000,
          jsHeapSizeLimit: 2000000000
        }
      })

      performanceMonitor.getMemoryMetrics()

      // Verificar que o alerta não foi disparado
      expect(alertHandler).not.toHaveBeenCalled()
    })
  })

  describe('Monitoramento Automático', () => {
    it('deve iniciar monitoramento automático', () => {
      const interval = 1000
      performanceMonitor.startAutoMonitoring(interval)

      expect(performanceMonitor.isAutoMonitoringActive()).toBe(true)
    })

    it('deve parar monitoramento automático', () => {
      performanceMonitor.startAutoMonitoring(1000)
      performanceMonitor.stopAutoMonitoring()

      expect(performanceMonitor.isAutoMonitoringActive()).toBe(false)
    })
  })

  describe('Limpeza de Dados', () => {
    it('deve limpar operações antigas', () => {
      // Criar operações antigas
      const oldOp = performanceMonitor.startOperation('old-operation')
      currentTime += 100
      performanceMonitor.endOperation(oldOp)

      // Avançar tempo significativamente
      currentTime += 24 * 60 * 60 * 1000 // 24 horas

      const newOp = performanceMonitor.startOperation('new-operation')
      currentTime += 100
      performanceMonitor.endOperation(newOp)

      // Limpar operações antigas (mais de 1 hora)
      performanceMonitor.cleanupOldOperations(60 * 60 * 1000)

      const report = performanceMonitor.getOperationsReport()
      
      expect(report.totalOperations).toBe(1)
      expect(report.operations[0].name).toBe('new-operation')
    })

    it('deve limpar todas as operações', () => {
      // Criar algumas operações
      const op1 = performanceMonitor.startOperation('op1')
      performanceMonitor.endOperation(op1)
      
      const op2 = performanceMonitor.startOperation('op2')
      performanceMonitor.endOperation(op2)

      performanceMonitor.clearOperations()

      const report = performanceMonitor.getOperationsReport()
      expect(report.totalOperations).toBe(0)
    })
  })

  describe('Exportação de Dados', () => {
    it('deve exportar dados em JSON', () => {
      // Criar uma operação
      const op = performanceMonitor.startOperation('export-test')
      currentTime += 100
      performanceMonitor.endOperation(op)

      const exportedData = performanceMonitor.exportData('json')

      expect(exportedData).toContain('"name":"export-test"')
      expect(exportedData).toContain('"duration":100')
    })

    it('deve exportar dados em CSV', () => {
      // Criar uma operação
      const op = performanceMonitor.startOperation('csv-test')
      currentTime += 150
      performanceMonitor.endOperation(op)

      const exportedData = performanceMonitor.exportData('csv')

      expect(exportedData).toContain('name,duration,success,timestamp')
      expect(exportedData).toContain('csv-test,150,true')
    })
  })

  describe('Integração com Performance API', () => {
    it('deve usar Performance API quando disponível', () => {
      const op = performanceMonitor.startOperation('perf-api-test')
      performanceMonitor.endOperation(op)

      expect(mockPerformance.mark).toHaveBeenCalledTimes(2)
      expect(mockPerformance.measure).toHaveBeenCalledTimes(1)
    })

    it('deve funcionar sem Performance API', () => {
      // Remover Performance API temporariamente
      const originalPerformance = global.performance
      delete (global as any).performance

      const monitor = new PerformanceMonitor()
      const op = monitor.startOperation('no-perf-api')
      currentTime += 100
      const result = monitor.endOperation(op)

      expect(result).toEqual({
        operationId: op,
        name: 'no-perf-api',
        duration: 100,
        timestamp: expect.any(String),
        success: true
      })

      // Restaurar Performance API
      Object.defineProperty(global, 'performance', { value: originalPerformance })
      monitor.destroy()
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve lidar com erros na coleta de métricas', () => {
      // Mock que falha
      mockPerformance.now.mockImplementation(() => {
        throw new Error('Performance API error')
      })

      expect(() => {
        performanceMonitor.startOperation('error-test')
      }).not.toThrow()

      expect(mockConsole.error).toHaveBeenCalledWith(
        'Error in performance monitoring:',
        expect.any(Error)
      )
    })

    it('deve lidar com alertas que falham', () => {
      const faultyHandler = vi.fn().mockImplementation(() => {
        throw new Error('Alert handler error')
      })

      performanceMonitor.setAlert('memory', {
        threshold: 50,
        handler: faultyHandler
      })

      // Disparar alerta
      performanceMonitor.getMemoryMetrics()

      expect(mockConsole.error).toHaveBeenCalledWith(
        'Error in alert handler:',
        expect.any(Error)
      )
    })
  })
})