import { performanceMonitor } from './performanceMonitor';
import { AlertConfig } from './performanceMonitor';

/**
 * Configuração de alertas automáticos para métricas críticas de performance
 */
export class PerformanceAlerts {
  private static instance: PerformanceAlerts;
  private alertsConfigured = false;

  static getInstance(): PerformanceAlerts {
    if (!PerformanceAlerts.instance) {
      PerformanceAlerts.instance = new PerformanceAlerts();
    }
    return PerformanceAlerts.instance;
  }

  /**
   * Configura todos os alertas automáticos
   */
  setupAutomaticAlerts(): void {
    if (this.alertsConfigured) {
      console.log('Alertas de performance já configurados');
      return;
    }

    this.setupMemoryAlerts();
    this.setupLatencyAlerts();
    this.setupErrorRateAlerts();
    this.setupCPUAlerts();
    this.setupNetworkAlerts();

    this.alertsConfigured = true;
    console.log('Alertas automáticos de performance configurados com sucesso');
  }

  /**
   * Alertas de memória
   */
  private setupMemoryAlerts(): void {
    // Alerta para uso alto de memória heap
    const highMemoryConfig: AlertConfig = {
      threshold: 50 * 1024 * 1024, // 50MB
      handler: (alert) => {
        console.warn(`⚠️ ALERTA: Uso alto de memória heap: ${(alert.value / 1024 / 1024).toFixed(2)}MB`);
        this.notifyHighMemoryUsage(alert.value);
      }
    };

    performanceMonitor.setAlert('memory_high', highMemoryConfig);

    // Alerta crítico para memória muito alta
    const criticalMemoryConfig: AlertConfig = {
      threshold: 100 * 1024 * 1024, // 100MB
      handler: (alert) => {
        console.error(`🚨 ALERTA CRÍTICO: Uso crítico de memória heap: ${(alert.value / 1024 / 1024).toFixed(2)}MB`);
        this.notifyCriticalMemoryUsage(alert.value);
      }
    };

    performanceMonitor.setAlert('memory_critical', criticalMemoryConfig);
  }

  /**
   * Alertas de latência
   */
  private setupLatencyAlerts(): void {
    // Alerta para latência alta
    const highLatencyConfig: AlertConfig = {
      threshold: 2000, // 2 segundos
      handler: (alert) => {
        console.warn(`⚠️ ALERTA: Latência alta detectada: ${alert.value}ms`);
        this.notifyHighLatency(alert.value);
      }
    };

    performanceMonitor.setAlert('latency_high', highLatencyConfig);

    // Alerta crítico para latência muito alta
    const criticalLatencyConfig: AlertConfig = {
      threshold: 5000, // 5 segundos
      handler: (alert) => {
        console.error(`🚨 ALERTA CRÍTICO: Latência crítica detectada: ${alert.value}ms`);
        this.notifyCriticalLatency(alert.value);
      }
    };

    performanceMonitor.setAlert('latency_critical', criticalLatencyConfig);
  }

  /**
   * Alertas de taxa de erro
   */
  private setupErrorRateAlerts(): void {
    // Alerta para taxa de erro alta
    const highErrorRateConfig: AlertConfig = {
      threshold: 0.1, // 10%
      handler: (alert) => {
        console.warn(`⚠️ ALERTA: Taxa de erro alta: ${(alert.value * 100).toFixed(2)}%`);
        this.notifyHighErrorRate(alert.value);
      }
    };

    performanceMonitor.setAlert('error_rate_high', highErrorRateConfig);

    // Alerta crítico para taxa de erro muito alta
    const criticalErrorRateConfig: AlertConfig = {
      threshold: 0.25, // 25%
      handler: (alert) => {
        console.error(`🚨 ALERTA CRÍTICO: Taxa de erro crítica: ${(alert.value * 100).toFixed(2)}%`);
        this.notifyCriticalErrorRate(alert.value);
      }
    };

    performanceMonitor.setAlert('error_rate_critical', criticalErrorRateConfig);
  }

  /**
   * Alertas de CPU
   */
  private setupCPUAlerts(): void {
    // Alerta para uso alto de CPU
    const highCPUConfig: AlertConfig = {
      threshold: 80, // 80%
      handler: (alert) => {
        console.warn(`⚠️ ALERTA: Uso alto de CPU: ${alert.value.toFixed(2)}%`);
        this.notifyHighCPUUsage(alert.value);
      }
    };

    performanceMonitor.setAlert('cpu_high', highCPUConfig);

    // Alerta crítico para CPU muito alta
    const criticalCPUConfig: AlertConfig = {
      threshold: 95, // 95%
      handler: (alert) => {
        console.error(`🚨 ALERTA CRÍTICO: Uso crítico de CPU: ${alert.value.toFixed(2)}%`);
        this.notifyCriticalCPUUsage(alert.value);
      }
    };

    performanceMonitor.setAlert('cpu_critical', criticalCPUConfig);
  }

  /**
   * Alertas de rede
   */
  private setupNetworkAlerts(): void {
    // Alerta para latência de rede alta
    const highNetworkLatencyConfig: AlertConfig = {
      threshold: 1000, // 1 segundo
      handler: (alert) => {
        console.warn(`⚠️ ALERTA: Latência de rede alta: ${alert.value}ms`);
        this.notifyHighNetworkLatency(alert.value);
      }
    };

    performanceMonitor.setAlert('network_latency_high', highNetworkLatencyConfig);

    // Alerta para muitas requisições falhando
    const networkFailureConfig: AlertConfig = {
      threshold: 5, // 5 falhas consecutivas
      handler: (alert) => {
        console.error(`🚨 ALERTA: Múltiplas falhas de rede detectadas: ${alert.value} falhas`);
        this.notifyNetworkFailures(alert.value);
      }
    };

    performanceMonitor.setAlert('network_failures', networkFailureConfig);
  }

  /**
   * Métodos de notificação para diferentes tipos de alerta
   */
  private notifyHighMemoryUsage(value: number): void {
    // Implementar notificação específica para uso alto de memória
    this.sendNotification('Uso Alto de Memória', `Aplicação usando ${(value / 1024 / 1024).toFixed(2)}MB de memória`);
  }

  private notifyCriticalMemoryUsage(value: number): void {
    // Implementar notificação crítica para memória
    this.sendCriticalNotification('Memória Crítica', `Uso crítico de memória: ${(value / 1024 / 1024).toFixed(2)}MB`);
  }

  private notifyHighLatency(value: number): void {
    // Implementar notificação para latência alta
    this.sendNotification('Latência Alta', `Operação demorou ${value}ms para completar`);
  }

  private notifyCriticalLatency(value: number): void {
    // Implementar notificação crítica para latência
    this.sendCriticalNotification('Latência Crítica', `Operação demorou ${value}ms - performance crítica`);
  }

  private notifyHighErrorRate(value: number): void {
    // Implementar notificação para taxa de erro alta
    this.sendNotification('Taxa de Erro Alta', `${(value * 100).toFixed(2)}% das operações falharam`);
  }

  private notifyCriticalErrorRate(value: number): void {
    // Implementar notificação crítica para taxa de erro
    this.sendCriticalNotification('Taxa de Erro Crítica', `${(value * 100).toFixed(2)}% das operações falharam`);
  }

  private notifyHighCPUUsage(value: number): void {
    // Implementar notificação para uso alto de CPU
    this.sendNotification('CPU Alta', `Uso de CPU em ${value.toFixed(2)}%`);
  }

  private notifyCriticalCPUUsage(value: number): void {
    // Implementar notificação crítica para CPU
    this.sendCriticalNotification('CPU Crítica', `Uso crítico de CPU: ${value.toFixed(2)}%`);
  }

  private notifyHighNetworkLatency(value: number): void {
    // Implementar notificação para latência de rede alta
    this.sendNotification('Latência de Rede Alta', `Requisições de rede demoram ${value}ms`);
  }

  private notifyNetworkFailures(value: number): void {
    // Implementar notificação para falhas de rede
    this.sendCriticalNotification('Falhas de Rede', `${value} falhas consecutivas de rede detectadas`);
  }

  /**
   * Envia notificação padrão
   */
  private sendNotification(title: string, message: string): void {
    // Implementar sistema de notificação (toast, email, etc.)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
    }
    
    // Log para desenvolvimento
    console.log(`📢 ${title}: ${message}`);
  }

  /**
   * Envia notificação crítica
   */
  private sendCriticalNotification(title: string, message: string): void {
    // Implementar sistema de notificação crítica
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🚨 ${title}`, {
        body: message,
        icon: '/favicon.ico',
        requireInteraction: true
      });
    }
    
    // Log crítico
    console.error(`🚨 ${title}: ${message}`);
    
    // Aqui poderia enviar para serviços externos como Sentry, LogRocket, etc.
  }

  /**
   * Solicita permissão para notificações
   */
  static async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }
}

// Exportar instância singleton
export const performanceAlerts = PerformanceAlerts.getInstance();