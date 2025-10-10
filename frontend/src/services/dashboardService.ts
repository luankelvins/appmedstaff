import { httpClient, type ApiResponse } from './httpClient';

// Interfaces para os dados do Dashboard
export interface QuickStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalContracts: number;
  activeContracts: number;
}

export interface TaskMetrics {
  byStatus: Array<{ status: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  recent: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    due_date: string;
    created_at: string;
  }>;
  overdueCount: number;
}

export interface LeadMetrics {
  byStatus: Array<{ status: string; count: number }>;
  bySource: Array<{ source: string; count: number }>;
  recent: Array<{
    id: string;
    name: string;
    status: string;
    source: string;
    value: number;
    created_at: string;
  }>;
  conversionTrend: Array<{ date: string; conversions: number }>;
}

export interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalExpenses: number;
  monthlyExpenses: number;
  profit: number;
  profitMargin: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
}

export interface SystemMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  memoryUsage: number;
  cpuUsage: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
}

class DashboardService {
  private static instance: DashboardService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  private constructor() {
    // Construtor privado para singleton
  }

  /**
   * Verifica se os dados em cache ainda são válidos
   */
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this.CACHE_DURATION;
  }

  /**
   * Obtém dados do cache ou faz nova requisição
   */
  private async getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)!.data as T;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Limpa o cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obtém estatísticas rápidas do dashboard
   */
  public async getQuickStats(): Promise<QuickStats> {
    return this.getCachedData('quick-stats', async () => {
      const response = await httpClient.get<QuickStats>('/dashboard/quick-stats');
      if (!response.data) {
        throw new Error('Dados de estatísticas não encontrados');
      }
      return response.data;
    });
  }

  /**
   * Obtém métricas de tarefas
   */
  public async getTasksMetrics(): Promise<TaskMetrics> {
    return this.getCachedData('tasks-metrics', async () => {
      const response = await httpClient.get<TaskMetrics>('/dashboard/tasks-metrics');
      if (!response.data) {
        throw new Error('Dados de métricas de tarefas não encontrados');
      }
      return response.data;
    });
  }

  /**
   * Obtém métricas de leads
   */
  public async getLeadsMetrics(): Promise<LeadMetrics> {
    return this.getCachedData('leads-metrics', async () => {
      const response = await httpClient.get<LeadMetrics>('/dashboard/leads-metrics');
      if (!response.data) {
        throw new Error('Dados de métricas de leads não encontrados');
      }
      return response.data;
    });
  }

  /**
   * Obtém métricas financeiras
   */
  public async getFinancialMetrics(): Promise<FinancialMetrics> {
    return this.getCachedData('financial-metrics', async () => {
      const response = await httpClient.get<FinancialMetrics>('/dashboard/financial-metrics');
      if (!response.data) {
        throw new Error('Dados de métricas financeiras não encontrados');
      }
      return response.data;
    });
  }

  /**
   * Obtém métricas do sistema
   */
  public async getSystemMetrics(): Promise<SystemMetrics> {
    return this.getCachedData('system-metrics', async () => {
      const response = await httpClient.get<SystemMetrics>('/dashboard/system-metrics');
      if (!response.data) {
        throw new Error('Dados de métricas do sistema não encontrados');
      }
      return response.data;
    });
  }

  /**
   * Obtém notificações do dashboard
   */
  public async getNotifications(): Promise<DashboardNotification[]> {
    return this.getCachedData('notifications', async () => {
      const response = await httpClient.get<DashboardNotification[]>('/dashboard/notifications');
      if (!response.data) {
        throw new Error('Dados de notificações não encontrados');
      }
      return response.data;
    });
  }

  /**
   * Obtém todas as métricas do dashboard de uma vez
   */
  public async getAllMetrics(): Promise<{
    quickStats: QuickStats;
    tasksMetrics: TaskMetrics;
    leadsMetrics: LeadMetrics;
    financialMetrics: FinancialMetrics;
    systemMetrics: SystemMetrics;
    notifications: DashboardNotification[];
  }> {
    try {
      const [
        quickStats,
        tasksMetrics,
        leadsMetrics,
        financialMetrics,
        systemMetrics,
        notifications
      ] = await Promise.all([
        this.getQuickStats(),
        this.getTasksMetrics(),
        this.getLeadsMetrics(),
        this.getFinancialMetrics(),
        this.getSystemMetrics(),
        this.getNotifications()
      ]);

      return {
        quickStats,
        tasksMetrics,
        leadsMetrics,
        financialMetrics,
        systemMetrics,
        notifications
      };
    } catch (error) {
      console.error('Erro ao buscar todas as métricas:', error);
      throw error;
    }
  }

  /**
   * Força atualização de uma métrica específica
   */
  public async refreshMetric(metric: string): Promise<any> {
    this.cache.delete(metric);
    
    switch (metric) {
      case 'quick-stats':
        return this.getQuickStats();
      case 'tasks-metrics':
        return this.getTasksMetrics();
      case 'leads-metrics':
        return this.getLeadsMetrics();
      case 'financial-metrics':
        return this.getFinancialMetrics();
      case 'system-metrics':
        return this.getSystemMetrics();
      case 'notifications':
        return this.getNotifications();
      default:
        throw new Error(`Métrica desconhecida: ${metric}`);
    }
  }

  /**
   * Força atualização de todas as métricas
   */
  public async refreshAllMetrics(): Promise<any> {
    this.clearCache();
    return this.getAllMetrics();
  }
}

// Exportar a instância singleton
export const dashboardService = DashboardService.getInstance();

export default DashboardService;