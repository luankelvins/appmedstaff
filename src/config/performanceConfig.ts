export interface PerformanceConfig {
  enabled: boolean
  autoMonitoring: {
    enabled: boolean
    intervalMs: number
  }
  alerts: {
    enabled: boolean
    slowOperationThreshold: number
    highMemoryThreshold: number
    highLatencyThreshold: number
  }
  dataRetention: {
    maxOperations: number
    maxAgeMs: number
  }
  export: {
    enabled: boolean
    format: 'json' | 'csv'
    intervalMs: number
  }
  logging: {
    enabled: boolean
    level: 'error' | 'warn' | 'info' | 'debug'
  }
}

const developmentConfig: PerformanceConfig = {
  enabled: true,
  autoMonitoring: {
    enabled: true,
    intervalMs: 5000 // 5 segundos
  },
  alerts: {
    enabled: true,
    slowOperationThreshold: 1000, // 1 segundo
    highMemoryThreshold: 80, // 80%
    highLatencyThreshold: 500 // 500ms
  },
  dataRetention: {
    maxOperations: 1000,
    maxAgeMs: 24 * 60 * 60 * 1000 // 24 horas
  },
  export: {
    enabled: true,
    format: 'json',
    intervalMs: 60 * 60 * 1000 // 1 hora
  },
  logging: {
    enabled: true,
    level: 'debug'
  }
}

const testConfig: PerformanceConfig = {
  enabled: false, // Desabilitado em testes para não interferir
  autoMonitoring: {
    enabled: false,
    intervalMs: 10000
  },
  alerts: {
    enabled: false,
    slowOperationThreshold: 2000,
    highMemoryThreshold: 90,
    highLatencyThreshold: 1000
  },
  dataRetention: {
    maxOperations: 100,
    maxAgeMs: 60 * 60 * 1000 // 1 hora
  },
  export: {
    enabled: false,
    format: 'json',
    intervalMs: 24 * 60 * 60 * 1000 // 24 horas
  },
  logging: {
    enabled: false,
    level: 'error'
  }
}

const productionConfig: PerformanceConfig = {
  enabled: false, // Temporariamente desabilitado para resolver problema de tela em branco
  autoMonitoring: {
    enabled: false,
    intervalMs: 30000 // 30 segundos (menos frequente em produção)
  },
  alerts: {
    enabled: false,
    slowOperationThreshold: 2000, // 2 segundos (mais tolerante)
    highMemoryThreshold: 85, // 85%
    highLatencyThreshold: 1000 // 1 segundo
  },
  dataRetention: {
    maxOperations: 5000, // Mais dados em produção
    maxAgeMs: 7 * 24 * 60 * 60 * 1000 // 7 dias
  },
  export: {
    enabled: false,
    format: 'json',
    intervalMs: 6 * 60 * 60 * 1000 // 6 horas
  },
  logging: {
    enabled: false,
    level: 'warn' // Apenas warnings e erros em produção
  }
}

function getEnvironment(): 'development' | 'test' | 'production' {
  if (typeof process !== 'undefined' && process.env) {
    const nodeEnv = process.env.NODE_ENV
    if (nodeEnv === 'test') return 'test'
    if (nodeEnv === 'production') return 'production'
  }
  
  // Fallback para detecção no browser
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development'
    }
    return 'production'
  }
  
  return 'development'
}

export function getPerformanceConfig(): PerformanceConfig {
  const env = getEnvironment()
  
  switch (env) {
    case 'test':
      return testConfig
    case 'production':
      return productionConfig
    case 'development':
    default:
      return developmentConfig
  }
}

export function isPerformanceEnabled(): boolean {
  return getPerformanceConfig().enabled
}

export function shouldLogPerformance(level: 'error' | 'warn' | 'info' | 'debug'): boolean {
  const config = getPerformanceConfig()
  if (!config.logging.enabled) return false
  
  const levels = ['error', 'warn', 'info', 'debug']
  const configLevelIndex = levels.indexOf(config.logging.level)
  const messageLevelIndex = levels.indexOf(level)
  
  return messageLevelIndex <= configLevelIndex
}

// Utilitário para logging condicional
export function performanceLog(level: 'error' | 'warn' | 'info' | 'debug', message: string, ...args: any[]): void {
  if (shouldLogPerformance(level)) {
    console[level](`[Performance] ${message}`, ...args)
  }
}