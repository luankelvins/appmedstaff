import { supabase } from '../config/supabase';
import { performanceMonitor, FullReport, PerformanceMetric, SystemReport } from './performanceMonitor';

/**
 * Interface para dados de performance persistidos
 */
export interface PerformanceData {
  id?: string;
  timestamp: string;
  user_id?: string;
  session_id: string;
  operation_name: string;
  duration: number;
  success: boolean;
  error_message?: string;
  memory_usage?: number;
  cpu_usage?: number;
  network_latency?: number;
  page_url: string;
  user_agent: string;
  environment: 'development' | 'test' | 'production';
}

/**
 * Interface para relatórios de sistema persistidos
 */
export interface SystemReportData {
  id?: string;
  timestamp: string;
  user_id?: string;
  session_id: string;
  memory_used: number;
  memory_total: number;
  memory_percentage: number;
  cpu_cores: number;
  cpu_usage: number;
  network_type: string;
  network_downlink: number;
  network_rtt: number;
  environment: 'development' | 'test' | 'production';
}

/**
 * Serviço de persistência de dados de performance
 */
export class PerformancePersistence {
  private static instance: PerformancePersistence;
  private sessionId: string;
  private userId?: string;
  private batchSize = 10;
  private batchTimeout = 30000; // 30 segundos
  private pendingMetrics: PerformanceData[] = [];
  private pendingReports: SystemReportData[] = [];
  private batchTimer?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupAutoFlush();
  }

  static getInstance(): PerformancePersistence {
    if (!PerformancePersistence.instance) {
      PerformancePersistence.instance = new PerformancePersistence();
    }
    return PerformancePersistence.instance;
  }

  /**
   * Define o ID do usuário atual
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Persiste uma métrica de performance individual
   */
  async savePerformanceMetric(metric: PerformanceMetric): Promise<void> {
    const data: PerformanceData = {
      timestamp: metric.timestamp,
      user_id: this.userId,
      session_id: this.sessionId,
      operation_name: metric.name,
      duration: metric.duration,
      success: metric.success,
      error_message: metric.error,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      environment: this.getEnvironment()
    };

    // Adicionar à fila de batch
    this.pendingMetrics.push(data);

    // Flush se atingiu o tamanho do batch
    if (this.pendingMetrics.length >= this.batchSize) {
      await this.flushMetrics();
    }
  }

  /**
   * Persiste um relatório de sistema
   */
  async saveSystemReport(report: SystemReport): Promise<void> {
    const data: SystemReportData = {
      timestamp: report.timestamp,
      user_id: this.userId,
      session_id: this.sessionId,
      memory_used: report.memory.used,
      memory_total: report.memory.total,
      memory_percentage: report.memory.percentage,
      cpu_cores: report.cpu.cores,
      cpu_usage: report.cpu.usage,
      network_type: report.network.effectiveType,
      network_downlink: report.network.downlink,
      network_rtt: report.network.rtt,
      environment: this.getEnvironment()
    };

    // Adicionar à fila de batch
    this.pendingReports.push(data);

    // Flush se atingiu o tamanho do batch
    if (this.pendingReports.length >= this.batchSize) {
      await this.flushReports();
    }
  }

  /**
   * Persiste um relatório completo
   */
  async saveFullReport(report: FullReport): Promise<void> {
    try {
      // Salvar relatório do sistema
      await this.saveSystemReport(report.system);

      // Salvar métricas de operações
      for (const metric of report.operations.operations) {
        await this.savePerformanceMetric(metric);
      }

      console.log('Relatório completo de performance salvo com sucesso');
    } catch (error) {
      console.error('Erro ao salvar relatório completo:', error);
    }
  }

  /**
   * Flush manual das métricas pendentes
   */
  async flushMetrics(): Promise<void> {
    if (this.pendingMetrics.length === 0) return;

    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert(this.pendingMetrics);

      if (error) {
        console.error('Erro ao salvar métricas de performance:', error);
        return;
      }

      console.log(`${this.pendingMetrics.length} métricas de performance salvas`);
      this.pendingMetrics = [];
    } catch (error) {
      console.error('Erro ao fazer flush das métricas:', error);
    }
  }

  /**
   * Flush manual dos relatórios pendentes
   */
  async flushReports(): Promise<void> {
    if (this.pendingReports.length === 0) return;

    try {
      const { error } = await supabase
        .from('system_reports')
        .insert(this.pendingReports);

      if (error) {
        console.error('Erro ao salvar relatórios de sistema:', error);
        return;
      }

      console.log(`${this.pendingReports.length} relatórios de sistema salvos`);
      this.pendingReports = [];
    } catch (error) {
      console.error('Erro ao fazer flush dos relatórios:', error);
    }
  }

  /**
   * Flush de todos os dados pendentes
   */
  async flushAll(): Promise<void> {
    await Promise.all([
      this.flushMetrics(),
      this.flushReports()
    ]);
  }

  /**
   * Busca métricas de performance por período
   */
  async getPerformanceMetrics(
    startDate: string,
    endDate: string,
    userId?: string
  ): Promise<PerformanceData[]> {
    try {
      let query = supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar métricas de performance:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      return [];
    }
  }

  /**
   * Busca relatórios de sistema por período
   */
  async getSystemReports(
    startDate: string,
    endDate: string,
    userId?: string
  ): Promise<SystemReportData[]> {
    try {
      let query = supabase
        .from('system_reports')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar relatórios de sistema:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas agregadas de performance
   */
  async getPerformanceStats(
    startDate: string,
    endDate: string,
    userId?: string
  ): Promise<{
    totalOperations: number;
    averageDuration: number;
    successRate: number;
    slowestOperations: PerformanceData[];
    mostFrequentErrors: { error: string; count: number }[];
  }> {
    try {
      const metrics = await this.getPerformanceMetrics(startDate, endDate, userId);

      const totalOperations = metrics.length;
      const successfulOperations = metrics.filter(m => m.success).length;
      const averageDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations || 0;
      const successRate = totalOperations > 0 ? successfulOperations / totalOperations : 0;

      // Operações mais lentas
      const slowestOperations = metrics
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10);

      // Erros mais frequentes
      const errorCounts = new Map<string, number>();
      metrics
        .filter(m => !m.success && m.error_message)
        .forEach(m => {
          const error = m.error_message!;
          errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
        });

      const mostFrequentErrors = Array.from(errorCounts.entries())
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalOperations,
        averageDuration,
        successRate,
        slowestOperations,
        mostFrequentErrors
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        totalOperations: 0,
        averageDuration: 0,
        successRate: 0,
        slowestOperations: [],
        mostFrequentErrors: []
      };
    }
  }

  /**
   * Remove dados antigos de performance
   */
  async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffIso = cutoffDate.toISOString();

      // Limpar métricas antigas
      const { error: metricsError } = await supabase
        .from('performance_metrics')
        .delete()
        .lt('timestamp', cutoffIso);

      if (metricsError) {
        console.error('Erro ao limpar métricas antigas:', metricsError);
      }

      // Limpar relatórios antigos
      const { error: reportsError } = await supabase
        .from('system_reports')
        .delete()
        .lt('timestamp', cutoffIso);

      if (reportsError) {
        console.error('Erro ao limpar relatórios antigos:', reportsError);
      }

      console.log(`Dados de performance anteriores a ${daysToKeep} dias foram removidos`);
    } catch (error) {
      console.error('Erro ao limpar dados antigos:', error);
    }
  }

  /**
   * Configura flush automático
   */
  private setupAutoFlush(): void {
    this.batchTimer = setInterval(async () => {
      await this.flushAll();
    }, this.batchTimeout);

    // Flush ao sair da página
    window.addEventListener('beforeunload', () => {
      this.flushAll();
    });

    // Flush quando a página fica oculta
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushAll();
      }
    });
  }

  /**
   * Gera um ID único para a sessão
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Determina o ambiente atual
   */
  private getEnvironment(): 'development' | 'test' | 'production' {
    if (process.env.NODE_ENV === 'production') return 'production';
    if (process.env.NODE_ENV === 'test') return 'test';
    return 'development';
  }

  /**
   * Limpa recursos e para timers
   */
  destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    this.flushAll();
  }
}

// Exportar instância singleton
export const performancePersistence = PerformancePersistence.getInstance();