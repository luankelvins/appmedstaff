import { performanceLog } from '../config/performanceConfig';

export interface PollingConfig {
  interval: number; // em milissegundos
  maxRetries: number;
  backoffMultiplier: number;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PollingTask {
  id: string;
  name: string;
  fetcher: () => Promise<any>;
  config: PollingConfig;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  lastRun?: Date;
  nextRun?: Date;
  retryCount: number;
  isRunning: boolean;
}

class PollingService {
  private static instance: PollingService;
  private tasks: Map<string, PollingTask> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isActive = false;
  private visibilityChangeHandler: (() => void) | null = null;

  private constructor() {
    this.setupVisibilityHandling();
  }

  public static getInstance(): PollingService {
    if (!PollingService.instance) {
      PollingService.instance = new PollingService();
    }
    return PollingService.instance;
  }

  private setupVisibilityHandling(): void {
    // Pausa polling quando a página não está visível para economizar recursos
    this.visibilityChangeHandler = () => {
      if (document.hidden) {
        this.pauseAll();
        performanceLog('info', 'Polling pausado - página não visível');
      } else {
        this.resumeAll();
        performanceLog('info', 'Polling retomado - página visível');
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    }
  }

  public addTask(task: Omit<PollingTask, 'retryCount' | 'isRunning'>): void {
    const fullTask: PollingTask = {
      ...task,
      retryCount: 0,
      isRunning: false,
    };

    this.tasks.set(task.id, fullTask);
    
    if (this.isActive && task.config.enabled) {
      this.scheduleTask(task.id);
    }

    performanceLog('info', `Tarefa de polling adicionada: ${task.name}`, {
      id: task.id,
      interval: task.config.interval,
      priority: task.config.priority
    });
  }

  public removeTask(taskId: string): void {
    const timer = this.timers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(taskId);
    }
    
    this.tasks.delete(taskId);
    performanceLog('info', `Tarefa de polling removida: ${taskId}`);
  }

  public updateTaskConfig(taskId: string, config: Partial<PollingConfig>): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.config = { ...task.config, ...config };
    
    // Reagenda a tarefa se necessário
    if (this.isActive) {
      this.removeTask(taskId);
      this.addTask(task);
    }
  }

  public start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Inicia todas as tarefas habilitadas
    for (const [taskId, task] of this.tasks) {
      if (task.config.enabled) {
        this.scheduleTask(taskId);
      }
    }

    performanceLog('info', 'Serviço de polling iniciado', {
      tasksCount: this.tasks.size
    });
  }

  public stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    // Para todas as tarefas
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();

    performanceLog('info', 'Serviço de polling parado');
  }

  public pauseAll(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  public resumeAll(): void {
    if (!this.isActive) return;
    
    for (const [taskId, task] of this.tasks) {
      if (task.config.enabled && !task.isRunning) {
        this.scheduleTask(taskId);
      }
    }
  }

  public pauseTask(taskId: string): void {
    const timer = this.timers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(taskId);
    }
  }

  public resumeTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.config.enabled && this.isActive) {
      this.scheduleTask(taskId);
    }
  }

  public runTaskNow(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return Promise.reject(new Error(`Tarefa não encontrada: ${taskId}`));
    }

    return this.executeTask(taskId);
  }

  public getTaskStatus(taskId: string): PollingTask | null {
    return this.tasks.get(taskId) || null;
  }

  public getAllTasks(): PollingTask[] {
    return Array.from(this.tasks.values());
  }

  private scheduleTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task || !task.config.enabled) return;

    // Calcula o próximo tempo de execução
    const delay = this.calculateDelay(task);
    task.nextRun = new Date(Date.now() + delay);

    const timer = setTimeout(() => {
      this.executeTask(taskId);
    }, delay);

    this.timers.set(taskId, timer);
  }

  private calculateDelay(task: PollingTask): number {
    let delay = task.config.interval;

    // Aplica backoff se houver tentativas de retry
    if (task.retryCount > 0) {
      delay = Math.min(
        delay * Math.pow(task.config.backoffMultiplier, task.retryCount),
        300000 // Máximo de 5 minutos
      );
    }

    // Ajusta baseado na prioridade
    switch (task.config.priority) {
      case 'critical':
        delay *= 0.5; // Executa mais frequentemente
        break;
      case 'high':
        delay *= 0.75;
        break;
      case 'low':
        delay *= 1.5; // Executa menos frequentemente
        break;
      default: // medium
        break;
    }

    return delay;
  }

  private async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task || task.isRunning) return;

    task.isRunning = true;
    task.lastRun = new Date();

    try {
      performanceLog('debug', `Executando tarefa de polling: ${task.name}`);
      
      const startTime = performance.now();
      const result = await task.fetcher();
      const duration = performance.now() - startTime;

      // Reset retry count em caso de sucesso
      task.retryCount = 0;
      
      if (task.onSuccess) {
        task.onSuccess(result);
      }

      performanceLog('debug', `Tarefa de polling concluída: ${task.name}`, {
        duration: `${duration.toFixed(2)}ms`,
        taskId
      });

    } catch (error) {
      task.retryCount++;
      
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      performanceLog('warn', `Erro na tarefa de polling: ${task.name}`, {
        error: errorObj.message,
        retryCount: task.retryCount,
        maxRetries: task.config.maxRetries
      });

      if (task.onError) {
        task.onError(errorObj);
      }

      // Se excedeu o número máximo de tentativas, desabilita a tarefa
      if (task.retryCount >= task.config.maxRetries) {
        task.config.enabled = false;
        performanceLog('error', `Tarefa de polling desabilitada após ${task.config.maxRetries} tentativas: ${task.name}`);
        return;
      }
    } finally {
      task.isRunning = false;
      
      // Reagenda a próxima execução se a tarefa ainda estiver habilitada
      if (task.config.enabled && this.isActive) {
        this.scheduleTask(taskId);
      }
    }
  }

  public destroy(): void {
    this.stop();
    
    if (this.visibilityChangeHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    }
    
    this.tasks.clear();
    this.timers.clear();
  }
}

export const pollingService = PollingService.getInstance();
export default PollingService;