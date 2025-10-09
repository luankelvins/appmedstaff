// ==================== INTERFACES ====================

export interface PerformanceMetric {
  operationId: string
  name: string
  duration: number
  timestamp: string
  success: boolean
  error?: string
}

export interface MemoryMetrics {
  used: number
  total: number
  limit: number
  percentage: number
}

export interface NetworkMetrics {
  effectiveType: string
  downlink: number
  rtt: number
}

export interface CPUMetrics {
  cores: number
  usage: number
}

export interface SystemReport {
  timestamp: string
  memory: MemoryMetrics
  network: NetworkMetrics
  cpu: CPUMetrics
}

export interface OperationsReport {
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  averageDuration: number
  operations: PerformanceMetric[]
}

export interface FullReport {
  timestamp: string
  operations: OperationsReport
  system: SystemReport
}

export interface AlertConfig {
  threshold: number
  handler: (alert: PerformanceAlert) => void
}

export interface PerformanceAlert {
  type: string
  value: number
  threshold: number
  timestamp: string
}

interface ActiveOperation {
  id: string
  name: string
  startTime: number
  startMark?: string
}

// ==================== MONITOR DE PERFORMANCE ====================

export class PerformanceMonitor {
  private activeOperations: Map<string, ActiveOperation> = new Map()
  private completedOperations: PerformanceMetric[] = []
  private alerts: Map<string, AlertConfig> = new Map()
  private autoMonitoringInterval?: NodeJS.Timeout
  private isAutoMonitoring = false
  private config: any

  constructor() {
    // Importação dinâmica para evitar problemas de dependência circular
    this.loadConfig()
    this.setupPerformanceObserver()
    this.initializeFromConfig()
  }

  private async loadConfig() {
    try {
      const { getPerformanceConfig, isPerformanceEnabled } = await import('../config/performanceConfig')
      this.config = getPerformanceConfig()
      
      if (!isPerformanceEnabled()) {
        return // Sistema desabilitado
      }
    } catch (error) {
      // Fallback para configuração padrão se o arquivo não existir
      this.config = {
        enabled: true,
        autoMonitoring: { enabled: false, intervalMs: 30000 },
        alerts: { enabled: true, slowOperationThreshold: 1000, highMemoryThreshold: 80, highLatencyThreshold: 500 },
        dataRetention: { maxOperations: 1000, maxAgeMs: 24 * 60 * 60 * 1000 },
        logging: { enabled: true, level: 'info' }
      }
    }
  }

  private initializeFromConfig() {
    if (!this.config?.enabled) return

    // Configurar alertas padrão baseados na configuração
    if (this.config.alerts?.enabled) {
      this.setAlert('slow-operation', {
        threshold: this.config.alerts.slowOperationThreshold,
        handler: (alert) => this.handleSlowOperationAlert(alert)
      })

      this.setAlert('high-memory', {
        threshold: this.config.alerts.highMemoryThreshold,
        handler: (alert) => this.handleHighMemoryAlert(alert)
      })

      this.setAlert('high-latency', {
        threshold: this.config.alerts.highLatencyThreshold,
        handler: (alert) => this.handleHighLatencyAlert(alert)
      })
    }

    // Iniciar monitoramento automático se configurado
    if (this.config.autoMonitoring?.enabled) {
      this.startAutoMonitoring(this.config.autoMonitoring.intervalMs)
    }

    // Configurar limpeza automática de dados
    if (this.config.dataRetention) {
      setInterval(() => {
        this.cleanupOldOperations(this.config.dataRetention.maxAgeMs)
        
        // Limitar número máximo de operações
        if (this.completedOperations.length > this.config.dataRetention.maxOperations) {
          this.completedOperations = this.completedOperations.slice(-this.config.dataRetention.maxOperations)
        }
      }, 60000) // Verificar a cada minuto
    }
  }

  private handleSlowOperationAlert(alert: PerformanceAlert) {
    this.logPerformance('warn', `Operação lenta detectada: ${alert.value}ms (limite: ${alert.threshold}ms)`)
  }

  private handleHighMemoryAlert(alert: PerformanceAlert) {
    this.logPerformance('warn', `Alto uso de memória detectado: ${alert.value}% (limite: ${alert.threshold}%)`)
  }

  private handleHighLatencyAlert(alert: PerformanceAlert) {
    this.logPerformance('warn', `Alta latência detectada: ${alert.value}ms (limite: ${alert.threshold}ms)`)
  }

  private logPerformance(level: 'error' | 'warn' | 'info' | 'debug', message: string, ...args: any[]) {
    if (this.config?.logging?.enabled) {
      const levels = ['error', 'warn', 'info', 'debug']
      const configLevelIndex = levels.indexOf(this.config.logging.level)
      const messageLevelIndex = levels.indexOf(level)
      
      if (messageLevelIndex <= configLevelIndex) {
        console[level](`[Performance] ${message}`, ...args)
      }
    }
  }

  // ==================== MEDIÇÃO DE OPERAÇÕES ====================

  startOperation(name: string): string {
    if (!this.config?.enabled) {
      return 'disabled' // Retorna ID fictício se desabilitado
    }

    try {
      const operationId = this.generateOperationId()
      const startTime = this.getCurrentTime()
      
      let startMark: string | undefined
      if (this.isPerformanceAPIAvailable()) {
        startMark = `start-${operationId}`
        performance.mark(startMark)
      }

      this.activeOperations.set(operationId, {
        id: operationId,
        name,
        startTime,
        startMark
      })

      this.logPerformance('debug', `Iniciada operação: ${name} (ID: ${operationId})`)
      return operationId
    } catch (error) {
      this.logPerformance('error', 'Error in performance monitoring:', error)
      return this.generateOperationId()
    }
  }

  endOperation(operationId: string, success = true, error?: string): PerformanceMetric | null {
    if (!this.config?.enabled || operationId === 'disabled') {
      return null // Sistema desabilitado
    }

    try {
      const operation = this.activeOperations.get(operationId)
      if (!operation) {
        this.logPerformance('warn', `Tentativa de finalizar operação inexistente: ${operationId}`)
        return null
      }

      const endTime = this.getCurrentTime()
      const duration = endTime - operation.startTime

      if (this.isPerformanceAPIAvailable() && operation.startMark) {
        const endMark = `end-${operationId}`
        performance.mark(endMark)
        
        try {
          performance.measure(`operation-${operationId}`, operation.startMark, endMark)
        } catch (e) {
          this.logPerformance('debug', 'Erro ao criar medição de performance:', e)
        }
      }

      const metric: PerformanceMetric = {
        operationId,
        name: operation.name,
        duration,
        timestamp: new Date().toISOString(),
        success,
        error
      }

      this.completedOperations.push(metric)
      this.activeOperations.delete(operationId)

      // Log da operação finalizada
      const status = success ? 'sucesso' : 'erro'
      this.logPerformance('debug', `Finalizada operação: ${operation.name} (${duration}ms, ${status})`)

      // Verificar alertas
      this.checkAlert('slow-operation', duration)

      // Log de operação lenta
      if (duration > (this.config?.alerts?.slowOperationThreshold || 1000)) {
        this.logPerformance('warn', `Operação lenta: ${operation.name} levou ${duration}ms`)
      }

      return metric
    } catch (err) {
      this.logPerformance('error', 'Error ending operation:', err)
      return null
    }
  }

  // ==================== MÉTRICAS DE SISTEMA ====================

  getMemoryMetrics(): MemoryMetrics {
    try {
      if (this.isMemoryAPIAvailable()) {
        const memory = (performance as any).memory || (window as any).performance?.memory
        if (memory) {
          const used = memory.usedJSHeapSize
          const total = memory.totalJSHeapSize
          const limit = memory.jsHeapSizeLimit
          const percentage = total > 0 ? Math.round((used / total) * 100) : 0

          // Verificar alertas
          this.checkAlert('memory', percentage)

          return { used, total, limit, percentage }
        }
      }

      return { used: 0, total: 0, limit: 0, percentage: 0 }
    } catch (error) {
      console.error('Error getting memory metrics:', error)
      return { used: 0, total: 0, limit: 0, percentage: 0 }
    }
  }

  getNetworkMetrics(): NetworkMetrics {
    try {
      if (this.isNetworkAPIAvailable()) {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
        if (connection) {
          return {
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0
          }
        }
      }

      return { effectiveType: 'unknown', downlink: 0, rtt: 0 }
    } catch (error) {
      console.error('Error getting network metrics:', error)
      return { effectiveType: 'unknown', downlink: 0, rtt: 0 }
    }
  }

  getCPUMetrics(): CPUMetrics {
    try {
      const cores = navigator.hardwareConcurrency || 1
      
      // Estimativa simples de uso de CPU baseada em operações ativas
      const activeOpsCount = this.activeOperations.size
      const usage = Math.min(activeOpsCount * 10, 100)

      return { cores, usage }
    } catch (error) {
      console.error('Error getting CPU metrics:', error)
      return { cores: 1, usage: 0 }
    }
  }

  // ==================== RELATÓRIOS ====================

  getOperationsReport(): OperationsReport {
    const totalOperations = this.completedOperations.length
    const successfulOperations = this.completedOperations.filter(op => op.success).length
    const failedOperations = totalOperations - successfulOperations
    
    const averageDuration = totalOperations > 0 
      ? Math.round(this.completedOperations.reduce((sum, op) => sum + op.duration, 0) / totalOperations)
      : 0

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      averageDuration,
      operations: [...this.completedOperations]
    }
  }

  getSystemReport(): SystemReport {
    return {
      timestamp: new Date().toISOString(),
      memory: this.getMemoryMetrics(),
      network: this.getNetworkMetrics(),
      cpu: this.getCPUMetrics()
    }
  }

  getFullReport(): FullReport {
    return {
      timestamp: new Date().toISOString(),
      operations: this.getOperationsReport(),
      system: this.getSystemReport()
    }
  }

  // ==================== ALERTAS ====================

  setAlert(type: string, config: AlertConfig): void {
    this.alerts.set(type, config)
  }

  removeAlert(type: string): void {
    this.alerts.delete(type)
  }

  private checkAlert(type: string, value: number): void {
    try {
      const alertConfig = this.alerts.get(type)
      if (alertConfig && value >= alertConfig.threshold) {
        alertConfig.handler({
          type,
          value,
          threshold: alertConfig.threshold,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error in alert handler:', error)
    }
  }

  // ==================== MONITORAMENTO AUTOMÁTICO ====================

  startAutoMonitoring(intervalMs = 5000): void {
    if (this.isAutoMonitoring) {
      this.stopAutoMonitoring()
    }

    this.autoMonitoringInterval = setInterval(() => {
      this.collectSystemMetrics()
    }, intervalMs)

    this.isAutoMonitoring = true
  }

  stopAutoMonitoring(): void {
    if (this.autoMonitoringInterval) {
      clearInterval(this.autoMonitoringInterval)
      this.autoMonitoringInterval = undefined
    }
    this.isAutoMonitoring = false
  }

  isAutoMonitoringActive(): boolean {
    return this.isAutoMonitoring
  }

  private collectSystemMetrics(): void {
    try {
      this.getMemoryMetrics()
      this.getNetworkMetrics()
      this.getCPUMetrics()
    } catch (error) {
      console.error('Error collecting system metrics:', error)
    }
  }

  // ==================== LIMPEZA DE DADOS ====================

  cleanupOldOperations(maxAgeMs: number): void {
    const cutoffTime = Date.now() - maxAgeMs
    this.completedOperations = this.completedOperations.filter(
      op => new Date(op.timestamp).getTime() > cutoffTime
    )
  }

  clearOperations(): void {
    this.completedOperations = []
    this.activeOperations.clear()
  }

  // ==================== EXPORTAÇÃO ====================

  exportData(format: 'json' | 'csv'): string {
    const report = this.getFullReport()

    if (format === 'json') {
      return JSON.stringify(report, null, 2)
    }

    if (format === 'csv') {
      const headers = 'name,duration,success,timestamp,error'
      const rows = report.operations.operations.map(op => 
        `${op.name},${op.duration},${op.success},${op.timestamp},${op.error || ''}`
      )
      return [headers, ...rows].join('\n')
    }

    throw new Error(`Unsupported export format: ${format}`)
  }

  // ==================== UTILITÁRIOS PRIVADOS ====================

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getCurrentTime(): number {
    return this.isPerformanceAPIAvailable() ? performance.now() : Date.now()
  }

  private isPerformanceAPIAvailable(): boolean {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
  }

  private isMemoryAPIAvailable(): boolean {
    return typeof performance !== 'undefined' && 
           ((performance as any).memory || (typeof window !== 'undefined' && (window as any).performance?.memory))
  }

  private isNetworkAPIAvailable(): boolean {
    return typeof navigator !== 'undefined' && 
           ((navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection)
  }

  private setupPerformanceObserver(): void {
    try {
      if (typeof PerformanceObserver !== 'undefined') {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          // Processar entradas de performance se necessário
        })
        
        observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] })
      }
    } catch (error) {
      // PerformanceObserver não disponível ou não suportado
    }
  }

  // ==================== CLEANUP ====================

  destroy(): void {
    this.stopAutoMonitoring()
    this.clearOperations()
    this.alerts.clear()
  }
}

// ==================== INSTÂNCIA SINGLETON ====================

export const performanceMonitor = new PerformanceMonitor()