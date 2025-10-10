import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { 
  QuickStats, 
  TaskMetrics, 
  LeadMetrics, 
  FinancialMetrics, 
  SystemMetrics, 
  DashboardNotification 
} from '../services/dashboardService';

interface DashboardData {
  quickStats: QuickStats | null;
  taskMetrics: TaskMetrics | null;
  leadMetrics: LeadMetrics | null;
  financialMetrics: FinancialMetrics | null;
  systemMetrics: SystemMetrics | null;
  notifications: DashboardNotification[] | null;
}

interface UseDashboardDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // em segundos
  enablePolling?: boolean;
  pollingInterval?: number; // em segundos
}

interface UseDashboardDataReturn {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  refreshSpecific: (metric: keyof DashboardData) => Promise<void>;
  clearCache: () => void;
}

export const useDashboardData = (
  options: UseDashboardDataOptions = {}
): UseDashboardDataReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 300, // 5 minutos
    enablePolling = false,
    pollingInterval = 30 // 30 segundos para polling
  } = options;

  const [data, setData] = useState<DashboardData>({
    quickStats: null,
    taskMetrics: null,
    leadMetrics: null,
    financialMetrics: null,
    systemMetrics: null,
    notifications: null
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Função para atualizar dados específicos
  const refreshSpecific = useCallback(async (metric: keyof DashboardData) => {
    if (!mountedRef.current) return;

    try {
      let newData: any = null;

      switch (metric) {
        case 'quickStats':
          newData = await dashboardService.getQuickStats();
          break;
        case 'taskMetrics':
          newData = await dashboardService.getTasksMetrics();
          break;
        case 'leadMetrics':
          newData = await dashboardService.getLeadsMetrics();
          break;
        case 'financialMetrics':
          newData = await dashboardService.getFinancialMetrics();
          break;
        case 'systemMetrics':
          newData = await dashboardService.getSystemMetrics();
          break;
        case 'notifications':
          newData = await dashboardService.getNotifications();
          break;
      }

      if (mountedRef.current && newData) {
        setData(prev => ({
          ...prev,
          [metric]: newData
        }));
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
        setError(errorMessage);
        console.error(`Erro ao carregar ${metric}:`, err);
      }
    }
  }, []);

  // Função para atualizar todos os dados
  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar todos os dados em paralelo
      const [
        quickStats,
        taskMetrics,
        leadMetrics,
        financialMetrics,
        systemMetrics,
        notifications
      ] = await Promise.allSettled([
        dashboardService.getQuickStats(),
        dashboardService.getTasksMetrics(),
        dashboardService.getLeadsMetrics(),
        dashboardService.getFinancialMetrics(),
        dashboardService.getSystemMetrics(),
        dashboardService.getNotifications()
      ]);

      if (mountedRef.current) {
        setData({
          quickStats: quickStats.status === 'fulfilled' ? quickStats.value : null,
          taskMetrics: taskMetrics.status === 'fulfilled' ? taskMetrics.value : null,
          leadMetrics: leadMetrics.status === 'fulfilled' ? leadMetrics.value : null,
          financialMetrics: financialMetrics.status === 'fulfilled' ? financialMetrics.value : null,
          systemMetrics: systemMetrics.status === 'fulfilled' ? systemMetrics.value : null,
          notifications: notifications.status === 'fulfilled' ? notifications.value : null
        });

        setLastUpdated(new Date());

        // Verificar se houve algum erro
        const errors = [quickStats, taskMetrics, leadMetrics, financialMetrics, systemMetrics, notifications]
          .filter(result => result.status === 'rejected')
          .map(result => (result as PromiseRejectedResult).reason);

        if (errors.length > 0) {
          console.warn('Alguns dados falharam ao carregar:', errors);
          setError(`${errors.length} métricas falharam ao carregar`);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard';
        setError(errorMessage);
        console.error('Erro ao carregar dados do dashboard:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Função para limpar cache
  const clearCache = useCallback(() => {
    dashboardService.clearCache();
  }, []);

  // Configurar auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(refresh, refreshInterval * 1000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refresh]);

  // Configurar polling para dados críticos
  useEffect(() => {
    if (enablePolling && pollingInterval > 0) {
      pollingIntervalRef.current = setInterval(() => {
        // Atualizar apenas dados críticos em polling
        refreshSpecific('quickStats');
        refreshSpecific('notifications');
      }, pollingInterval * 1000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [enablePolling, pollingInterval, refreshSpecific]);

  // Carregar dados iniciais
  useEffect(() => {
    refresh();

    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    refreshSpecific,
    clearCache
  };
};

export default useDashboardData;