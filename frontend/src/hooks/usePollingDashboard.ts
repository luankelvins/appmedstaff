import { useEffect, useRef, useState } from 'react';
import { pollingService, PollingConfig } from '../services/pollingService';
import { dashboardService } from '../services/dashboardService';
import { performanceLog } from '../config/performanceConfig';

export interface PollingDashboardConfig {
  quickStats: Partial<PollingConfig>;
  taskMetrics: Partial<PollingConfig>;
  leadMetrics: Partial<PollingConfig>;
  financialMetrics: Partial<PollingConfig>;
  systemMetrics: Partial<PollingConfig>;
  notifications: Partial<PollingConfig>;
  enabled: boolean;
}

export interface PollingStatus {
  isActive: boolean;
  lastUpdate: Date | null;
  errorCount: number;
  tasksStatus: Record<string, {
    isRunning: boolean;
    lastRun: Date | null;
    nextRun: Date | null;
    retryCount: number;
  }>;
}

const DEFAULT_CONFIG: PollingDashboardConfig = {
  quickStats: {
    interval: 30000, // 30 segundos
    priority: 'high',
    enabled: true,
    maxRetries: 3,
    backoffMultiplier: 2
  },
  taskMetrics: {
    interval: 60000, // 1 minuto
    priority: 'medium',
    enabled: true,
    maxRetries: 3,
    backoffMultiplier: 2
  },
  leadMetrics: {
    interval: 120000, // 2 minutos
    priority: 'medium',
    enabled: true,
    maxRetries: 3,
    backoffMultiplier: 2
  },
  financialMetrics: {
    interval: 300000, // 5 minutos
    priority: 'low',
    enabled: true,
    maxRetries: 3,
    backoffMultiplier: 2
  },
  systemMetrics: {
    interval: 15000, // 15 segundos
    priority: 'critical',
    enabled: true,
    maxRetries: 5,
    backoffMultiplier: 1.5
  },
  notifications: {
    interval: 10000, // 10 segundos
    priority: 'critical',
    enabled: true,
    maxRetries: 5,
    backoffMultiplier: 1.5
  },
  enabled: true
};

export interface UsePollingDashboardProps {
  config?: Partial<PollingDashboardConfig>;
  onDataUpdate?: (type: string, data: any) => void;
  onError?: (type: string, error: Error) => void;
  autoStart?: boolean;
}

export interface UsePollingDashboardReturn {
  status: PollingStatus;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  updateConfig: (newConfig: Partial<PollingDashboardConfig>) => void;
  runNow: (type?: string) => Promise<void>;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export function usePollingDashboard({
  config = {},
  onDataUpdate,
  onError,
  autoStart = true
}: UsePollingDashboardProps = {}): UsePollingDashboardReturn {
  const [status, setStatus] = useState<PollingStatus>({
    isActive: false,
    lastUpdate: null,
    errorCount: 0,
    tasksStatus: {}
  });
  
  const [isEnabled, setIsEnabled] = useState(true);
  const configRef = useRef<PollingDashboardConfig>({ ...DEFAULT_CONFIG, ...config });
  const isInitialized = useRef(false);

  // Atualiza o status das tarefas
  const updateTasksStatus = () => {
    const tasks = pollingService.getAllTasks();
    const tasksStatus: Record<string, any> = {};
    
    tasks.forEach(task => {
      tasksStatus[task.id] = {
        isRunning: task.isRunning,
        lastRun: task.lastRun || null,
        nextRun: task.nextRun || null,
        retryCount: task.retryCount
      };
    });

    setStatus(prev => ({
      ...prev,
      tasksStatus
    }));
  };

  // Configura as tarefas de polling
  const setupPollingTasks = () => {
    const currentConfig = configRef.current;

    // Quick Stats
    pollingService.addTask({
      id: 'dashboard-quick-stats',
      name: 'Quick Stats',
      fetcher: () => dashboardService.getQuickStats(),
      config: {
        interval: 30000,
        maxRetries: 3,
        backoffMultiplier: 2,
        enabled: true,
        priority: 'high',
        ...currentConfig.quickStats
      },
      onSuccess: (data) => {
        setStatus(prev => ({ ...prev, lastUpdate: new Date() }));
        onDataUpdate?.('quickStats', data);
      },
      onError: (error) => {
        setStatus(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
        onError?.('quickStats', error);
      }
    });

    // Task Metrics
    pollingService.addTask({
      id: 'dashboard-task-metrics',
      name: 'Task Metrics',
      fetcher: () => dashboardService.getTasksMetrics(),
      config: {
        interval: 60000,
        maxRetries: 3,
        backoffMultiplier: 2,
        enabled: true,
        priority: 'medium',
        ...currentConfig.taskMetrics
      },
      onSuccess: (data) => {
        setStatus(prev => ({ ...prev, lastUpdate: new Date() }));
        onDataUpdate?.('taskMetrics', data);
      },
      onError: (error) => {
        setStatus(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
        onError?.('taskMetrics', error);
      }
    });

    // Lead Metrics
    pollingService.addTask({
      id: 'dashboard-lead-metrics',
      name: 'Lead Metrics',
      fetcher: () => dashboardService.getLeadsMetrics(),
      config: {
        interval: 120000,
        maxRetries: 3,
        backoffMultiplier: 2,
        enabled: true,
        priority: 'medium',
        ...currentConfig.leadMetrics
      },
      onSuccess: (data) => {
        setStatus(prev => ({ ...prev, lastUpdate: new Date() }));
        onDataUpdate?.('leadMetrics', data);
      },
      onError: (error) => {
        setStatus(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
        onError?.('leadMetrics', error);
      }
    });

    // Financial Metrics
    pollingService.addTask({
      id: 'dashboard-financial-metrics',
      name: 'Financial Metrics',
      fetcher: () => dashboardService.getFinancialMetrics(),
      config: {
        interval: 300000,
        maxRetries: 3,
        backoffMultiplier: 2,
        enabled: true,
        priority: 'low',
        ...currentConfig.financialMetrics
      },
      onSuccess: (data) => {
        setStatus(prev => ({ ...prev, lastUpdate: new Date() }));
        onDataUpdate?.('financialMetrics', data);
      },
      onError: (error) => {
        setStatus(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
        onError?.('financialMetrics', error);
      }
    });

    // System Metrics
    pollingService.addTask({
      id: 'dashboard-system-metrics',
      name: 'System Metrics',
      fetcher: () => dashboardService.getSystemMetrics(),
      config: {
        interval: 15000,
        maxRetries: 5,
        backoffMultiplier: 1.5,
        enabled: true,
        priority: 'critical',
        ...currentConfig.systemMetrics
      },
      onSuccess: (data) => {
        setStatus(prev => ({ ...prev, lastUpdate: new Date() }));
        onDataUpdate?.('systemMetrics', data);
      },
      onError: (error) => {
        setStatus(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
        onError?.('systemMetrics', error);
      }
    });

    // Notifications
    pollingService.addTask({
      id: 'dashboard-notifications',
      name: 'Notifications',
      fetcher: () => dashboardService.getNotifications(),
      config: {
        interval: 10000,
        maxRetries: 5,
        backoffMultiplier: 1.5,
        enabled: true,
        priority: 'critical',
        ...currentConfig.notifications
      },
      onSuccess: (data) => {
        setStatus(prev => ({ ...prev, lastUpdate: new Date() }));
        onDataUpdate?.('notifications', data);
      },
      onError: (error) => {
        setStatus(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
        onError?.('notifications', error);
      }
    });

    performanceLog('info', 'Tarefas de polling do dashboard configuradas');
  };

  // Inicia o polling
  const start = () => {
    if (!isEnabled) return;
    
    pollingService.start();
    setStatus(prev => ({ ...prev, isActive: true }));
    performanceLog('info', 'Polling do dashboard iniciado');
  };

  // Para o polling
  const stop = () => {
    pollingService.stop();
    setStatus(prev => ({ ...prev, isActive: false }));
    performanceLog('info', 'Polling do dashboard parado');
  };

  // Pausa o polling
  const pause = () => {
    pollingService.pauseAll();
    setStatus(prev => ({ ...prev, isActive: false }));
    performanceLog('info', 'Polling do dashboard pausado');
  };

  // Retoma o polling
  const resume = () => {
    if (!isEnabled) return;
    
    pollingService.resumeAll();
    setStatus(prev => ({ ...prev, isActive: true }));
    performanceLog('info', 'Polling do dashboard retomado');
  };

  // Atualiza a configuração
  const updateConfig = (newConfig: Partial<PollingDashboardConfig>) => {
    configRef.current = { ...configRef.current, ...newConfig };
    
    // Remove tarefas existentes e recria com nova configuração
    const taskIds = [
      'dashboard-quick-stats',
      'dashboard-task-metrics',
      'dashboard-lead-metrics',
      'dashboard-financial-metrics',
      'dashboard-system-metrics',
      'dashboard-notifications'
    ];
    
    taskIds.forEach(id => pollingService.removeTask(id));
    setupPollingTasks();
    
    if (status.isActive) {
      start();
    }
  };

  // Executa uma tarefa específica imediatamente
  const runNow = async (type?: string) => {
    if (type) {
      const taskId = `dashboard-${type.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      await pollingService.runTaskNow(taskId);
    } else {
      // Executa todas as tarefas
      const taskIds = [
        'dashboard-quick-stats',
        'dashboard-task-metrics',
        'dashboard-lead-metrics',
        'dashboard-financial-metrics',
        'dashboard-system-metrics',
        'dashboard-notifications'
      ];
      
      await Promise.all(
        taskIds.map(id => pollingService.runTaskNow(id).catch(err => 
          performanceLog('warn', `Erro ao executar tarefa ${id}:`, err.message)
        ))
      );
    }
  };

  // Inicialização
  useEffect(() => {
    if (!isInitialized.current) {
      setupPollingTasks();
      
      if (autoStart && isEnabled) {
        start();
      }
      
      isInitialized.current = true;
    }

    // Atualiza status das tarefas periodicamente
    const statusInterval = setInterval(updateTasksStatus, 5000);

    return () => {
      clearInterval(statusInterval);
    };
  }, [autoStart, isEnabled]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (isInitialized.current) {
        stop();
        const taskIds = [
          'dashboard-quick-stats',
          'dashboard-task-metrics',
          'dashboard-lead-metrics',
          'dashboard-financial-metrics',
          'dashboard-system-metrics',
          'dashboard-notifications'
        ];
        taskIds.forEach(id => pollingService.removeTask(id));
      }
    };
  }, []);

  // Controla habilitação/desabilitação
  useEffect(() => {
    if (isEnabled && autoStart && !status.isActive) {
      start();
    } else if (!isEnabled && status.isActive) {
      stop();
    }
  }, [isEnabled]);

  return {
    status,
    start,
    stop,
    pause,
    resume,
    updateConfig,
    runNow,
    isEnabled,
    setEnabled: setIsEnabled
  };
}