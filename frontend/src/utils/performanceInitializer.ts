import { performanceMonitor } from './performanceMonitor';
import { performanceAlerts, PerformanceAlerts } from './performanceAlerts';
import { getPerformanceConfig, isPerformanceEnabled, performanceLog } from '../config/performanceConfig'

/**
 * Inicializador do sistema de monitoramento de performance
 */
class PerformanceInitializer {
  private static instance: PerformanceInitializer;
  private initialized = false
  private config = getPerformanceConfig()

  static getInstance(): PerformanceInitializer {
    if (!PerformanceInitializer.instance) {
      PerformanceInitializer.instance = new PerformanceInitializer();
    }
    return PerformanceInitializer.instance;
  }

  /**
   * Inicializa o sistema de monitoramento de performance
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      performanceLog('debug', 'Sistema de performance já foi inicializado')
      return
    }

    if (!isPerformanceEnabled()) {
      performanceLog('info', 'Sistema de monitoramento de performance está desabilitado')
      return
    }

    try {
      performanceLog('info', '🚀 Inicializando sistema de monitoramento de performance...')

      // Configurar alertas automáticos
      this.setupAutomaticAlerts();

      // Configurar exportação automática de dados
      this.setupAutomaticExport();

      // Configurar monitoramento do browser
      this.setupBrowserPerformanceMonitoring();

      // Configurar monitoramento de erros
      this.setupErrorMonitoring();

      this.initialized = true
      performanceLog('info', '✅ Sistema de monitoramento de performance inicializado com sucesso')

    } catch (error) {
      performanceLog('error', '❌ Erro ao inicializar sistema de performance:', error)
    }
  }

  private async waitForMonitorReady(): Promise<void> {
    // Aguardar até que o monitor esteja configurado
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      try {
        // Testar se o monitor está funcionando
        const testId = performanceMonitor.startOperation('initialization-test')
        performanceMonitor.endOperation(testId, true)
        break
      } catch (error) {
        attempts++
        if (attempts >= maxAttempts) {
          throw new Error('Monitor de performance não está respondendo')
        }
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }

  /**
   * Configura alertas automáticos para métricas críticas
   */
  private setupAutomaticAlerts(): void {
    if (!this.config.alerts.enabled) {
      performanceLog('info', 'Alertas automáticos desabilitados na configuração');
      return;
    }

    performanceLog('info', 'Configurando alertas automáticos...');

    // Solicitar permissão para notificações
    PerformanceAlerts.requestNotificationPermission();

    // Configurar todos os alertas automáticos
    performanceAlerts.setupAutomaticAlerts();

    performanceLog('info', 'Alertas automáticos configurados com sucesso');
  }

  private setupAutomaticExport(): void {
    performanceLog('debug', 'Configurando exportação automática de dados')

    setInterval(() => {
      try {
        const data = performanceMonitor.exportData(this.config.export.format)
        
        // Em produção, enviar para um serviço de armazenamento
        if (this.isProduction()) {
          this.sendDataToStorage(data)
        } else {
          // Em desenvolvimento, apenas log
          performanceLog('debug', `Dados de performance exportados (${data.length} caracteres)`)
        }
      } catch (error) {
        performanceLog('error', 'Erro ao exportar dados de performance:', error)
      }
    }, this.config.export.intervalMs)
  }

  private setupBrowserPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return

    performanceLog('debug', 'Configurando monitoramento de performance do navegador')

    // Monitorar carregamento da página
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart
          performanceLog('info', `Tempo de carregamento da página: ${loadTime}ms`)
          
          // Verificar se o carregamento foi lento
          if (loadTime > this.config.alerts.slowOperationThreshold) {
            performanceLog('warn', `Carregamento lento da página: ${loadTime}ms`)
          }
        }
      }, 0)
    })

    // Monitorar mudanças de visibilidade da página
    document.addEventListener('visibilitychange', () => {
      const operationId = performanceMonitor.startOperation('page-visibility-change')
      performanceMonitor.endOperation(operationId, true)
    })

    // Monitorar cliques do usuário (para medir responsividade)
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const operationId = performanceMonitor.startOperation(`user-click-${target.tagName.toLowerCase()}`)
      
      // Finalizar após um pequeno delay para capturar o tempo de resposta
      setTimeout(() => {
        performanceMonitor.endOperation(operationId, true)
      }, 0)
    })
  }

  private setupErrorMonitoring(): void {
    if (typeof window === 'undefined') return

    performanceLog('debug', 'Configurando monitoramento de erros')

    // Monitorar erros JavaScript não capturados
    window.addEventListener('error', (event) => {
      const operationId = performanceMonitor.startOperation('javascript-error')
      performanceMonitor.endOperation(operationId, false, event.error?.message || 'Erro JavaScript não capturado')
      
      performanceLog('error', 'Erro JavaScript não capturado:', event.error)
    })

    // Monitorar promises rejeitadas não capturadas
    window.addEventListener('unhandledrejection', (event) => {
      const operationId = performanceMonitor.startOperation('unhandled-promise-rejection')
      performanceMonitor.endOperation(operationId, false, event.reason?.toString() || 'Promise rejeitada não capturada')
      
      performanceLog('error', 'Promise rejeitada não capturada:', event.reason)
    })
  }

  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production' || 
           (typeof window !== 'undefined' && 
            window.location.hostname !== 'localhost' && 
            window.location.hostname !== '127.0.0.1')
  }

  private sendAlertToMonitoringService(type: string, alert: any): void {
    // Implementar integração com serviço de monitoramento (ex: Sentry, DataDog, etc.)
    performanceLog('debug', `Enviando alerta para serviço de monitoramento: ${type}`, alert)
    
    // Exemplo de implementação:
    // fetch('/api/monitoring/alerts', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type, alert, timestamp: new Date().toISOString() })
    // }).catch(error => {
    //   performanceLog('error', 'Erro ao enviar alerta:', error)
    // })
  }

  private sendDataToStorage(data: string): void {
    // Implementar envio para armazenamento (ex: S3, banco de dados, etc.)
    performanceLog('debug', 'Enviando dados para armazenamento')
    
    // Exemplo de implementação:
    // fetch('/api/performance/data', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: data
    // }).catch(error => {
    //   performanceLog('error', 'Erro ao enviar dados:', error)
    // })
  }

  getStatus(): { initialized: boolean; enabled: boolean; config: any } {
    return {
      initialized: this.initialized,
      enabled: isPerformanceEnabled(),
      config: this.config
    }
  }
}

export const performanceInitializer = new PerformanceInitializer()

// Auto-inicializar quando o módulo for carregado
if (typeof window !== 'undefined') {
  // No browser, aguardar o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceInitializer.initialize()
    })
  } else {
    performanceInitializer.initialize()
  }
} else {
  // No servidor, inicializar imediatamente
  performanceInitializer.initialize()
}