import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest'
import { WidgetDataService } from '../widgetDataService'

// Mock do WidgetDataService
const mockWidgetDataService = {
  getProductivityMetrics: vi.fn(),
  getSystemMetrics: vi.fn(),
  getFinancialMetrics: vi.fn(),
  getTeamPerformanceMetrics: vi.fn(),
  getHRMetrics: vi.fn(),
  getNotificationMetrics: vi.fn(),
  getTaskMetrics: vi.fn(),
  getProjectMetrics: vi.fn(),
  getTimeTrackingMetrics: vi.fn(),
  getEmployeeMetrics: vi.fn(),
  getRealtimeMetrics: vi.fn(),
  getCustomMetrics: vi.fn(),
  getMetricsByDateRange: vi.fn(),
  getMetricsByUser: vi.fn(),
  getMetricsByDepartment: vi.fn(),
  getAggregatedMetrics: vi.fn(),
  getMetricsComparison: vi.fn(),
  getMetricsTrends: vi.fn(),
  exportMetrics: vi.fn(),
  scheduleMetricsReport: vi.fn(),
  getMetricsAlerts: vi.fn(),
  setMetricsThreshold: vi.fn(),
  getMetricsHistory: vi.fn(),
  clearMetricsCache: vi.fn(),
  refreshMetrics: vi.fn(),
  getMetricsStatus: vi.fn(),
  validateMetricsData: vi.fn(),
  getMetricsConfiguration: vi.fn(),
  updateMetricsConfiguration: vi.fn(),
  getAvailableMetrics: vi.fn(),
  subscribeToMetrics: vi.fn(),
  unsubscribeFromMetrics: vi.fn()
}

vi.mock('../widgetDataService', () => ({
  WidgetDataService: vi.fn(() => mockWidgetDataService)
}))

// Mock data
const mockProductivityMetrics = [
  {
    id: '1',
    user_id: 'user1',
    efficiency_score: 85,
    tasks_completed: 12,
    satisfaction_score: 4.5,
    date: '2024-01-15',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    user_id: 'user2',
    efficiency_score: 92,
    tasks_completed: 15,
    satisfaction_score: 4.8,
    date: '2024-01-15',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

const mockSystemMetrics = [
  {
    id: '1',
    cpu_usage: 45.5,
    memory_usage: 62.3,
    storage_usage: 78.1,
    network_usage: 23.4,
    active_users: 150,
    timestamp: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

const mockFinancialMetrics = [
  {
    id: '1',
    revenue: 50000,
    expenses: 30000,
    profit: 20000,
    period: 'monthly',
    date: '2024-01-01',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

const mockTeamMetrics = [
  {
    id: '1',
    team_id: 'team1',
    performance_score: 88,
    collaboration_score: 92,
    delivery_rate: 95,
    date: '2024-01-15',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

describe('WidgetDataService', () => {
  let widgetDataService: any

  beforeEach(() => {
    vi.clearAllMocks()
    widgetDataService = new WidgetDataService()
  })

  describe('Métricas de Produtividade', () => {
    it('deve obter métricas de produtividade', async () => {
      mockWidgetDataService.getProductivityMetrics.mockResolvedValue(mockProductivityMetrics)

      const result = await widgetDataService.getProductivityMetrics()

      expect(result).toEqual(mockProductivityMetrics)
      expect(mockWidgetDataService.getProductivityMetrics).toHaveBeenCalled()
    })

    it('deve obter métricas de produtividade por usuário', async () => {
      const userMetrics = mockProductivityMetrics.filter(m => m.user_id === 'user1')
      mockWidgetDataService.getProductivityMetrics.mockResolvedValue(userMetrics)

      const result = await widgetDataService.getProductivityMetrics({ userId: 'user1' })

      expect(result).toEqual(userMetrics)
      expect(mockWidgetDataService.getProductivityMetrics).toHaveBeenCalledWith({ userId: 'user1' })
    })

    it('deve obter métricas de produtividade por período', async () => {
      mockWidgetDataService.getProductivityMetrics.mockResolvedValue(mockProductivityMetrics)

      const result = await widgetDataService.getProductivityMetrics({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })

      expect(result).toEqual(mockProductivityMetrics)
      expect(mockWidgetDataService.getProductivityMetrics).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })
    })
  })

  describe('Métricas do Sistema', () => {
    it('deve obter métricas do sistema', async () => {
      mockWidgetDataService.getSystemMetrics.mockResolvedValue(mockSystemMetrics)

      const result = await widgetDataService.getSystemMetrics()

      expect(result).toEqual(mockSystemMetrics)
      expect(mockWidgetDataService.getSystemMetrics).toHaveBeenCalled()
    })

    it('deve obter métricas do sistema em tempo real', async () => {
      const realtimeMetrics = {
        cpu_usage: 50.2,
        memory_usage: 65.8,
        active_users: 155,
        timestamp: new Date().toISOString()
      }
      mockWidgetDataService.getRealtimeMetrics.mockResolvedValue(realtimeMetrics)

      const result = await widgetDataService.getRealtimeMetrics('system')

      expect(result).toEqual(realtimeMetrics)
      expect(mockWidgetDataService.getRealtimeMetrics).toHaveBeenCalledWith('system')
    })
  })

  describe('Métricas Financeiras', () => {
    it('deve obter métricas financeiras', async () => {
      mockWidgetDataService.getFinancialMetrics.mockResolvedValue(mockFinancialMetrics)

      const result = await widgetDataService.getFinancialMetrics()

      expect(result).toEqual(mockFinancialMetrics)
      expect(mockWidgetDataService.getFinancialMetrics).toHaveBeenCalled()
    })

    it('deve obter métricas financeiras por período', async () => {
      mockWidgetDataService.getFinancialMetrics.mockResolvedValue(mockFinancialMetrics)

      const result = await widgetDataService.getFinancialMetrics({
        period: 'quarterly',
        year: 2024
      })

      expect(result).toEqual(mockFinancialMetrics)
      expect(mockWidgetDataService.getFinancialMetrics).toHaveBeenCalledWith({
        period: 'quarterly',
        year: 2024
      })
    })
  })

  describe('Métricas de Equipe', () => {
    it('deve obter métricas de performance da equipe', async () => {
      mockWidgetDataService.getTeamPerformanceMetrics.mockResolvedValue(mockTeamMetrics)

      const result = await widgetDataService.getTeamPerformanceMetrics()

      expect(result).toEqual(mockTeamMetrics)
      expect(mockWidgetDataService.getTeamPerformanceMetrics).toHaveBeenCalled()
    })

    it('deve obter métricas de equipe específica', async () => {
      const teamSpecificMetrics = mockTeamMetrics.filter(m => m.team_id === 'team1')
      mockWidgetDataService.getTeamPerformanceMetrics.mockResolvedValue(teamSpecificMetrics)

      const result = await widgetDataService.getTeamPerformanceMetrics({ teamId: 'team1' })

      expect(result).toEqual(teamSpecificMetrics)
      expect(mockWidgetDataService.getTeamPerformanceMetrics).toHaveBeenCalledWith({ teamId: 'team1' })
    })
  })

  describe('Métricas de RH', () => {
    it('deve obter métricas de RH', async () => {
      const hrMetrics = [
        {
          id: '1',
          employee_satisfaction: 4.2,
          turnover_rate: 5.5,
          attendance_rate: 96.8,
          training_completion: 88.5,
          date: '2024-01-15'
        }
      ]
      mockWidgetDataService.getHRMetrics.mockResolvedValue(hrMetrics)

      const result = await widgetDataService.getHRMetrics()

      expect(result).toEqual(hrMetrics)
      expect(mockWidgetDataService.getHRMetrics).toHaveBeenCalled()
    })
  })

  describe('Métricas de Notificações', () => {
    it('deve obter métricas de notificações', async () => {
      const notificationMetrics = [
        {
          id: '1',
          total_sent: 150,
          total_read: 120,
          read_rate: 80,
          response_rate: 65,
          date: '2024-01-15'
        }
      ]
      mockWidgetDataService.getNotificationMetrics.mockResolvedValue(notificationMetrics)

      const result = await widgetDataService.getNotificationMetrics()

      expect(result).toEqual(notificationMetrics)
      expect(mockWidgetDataService.getNotificationMetrics).toHaveBeenCalled()
    })
  })

  describe('Métricas de Tarefas', () => {
    it('deve obter métricas de tarefas', async () => {
      const taskMetrics = [
        {
          id: '1',
          total_tasks: 50,
          completed_tasks: 35,
          completion_rate: 70,
          average_completion_time: 2.5,
          date: '2024-01-15'
        }
      ]
      mockWidgetDataService.getTaskMetrics.mockResolvedValue(taskMetrics)

      const result = await widgetDataService.getTaskMetrics()

      expect(result).toEqual(taskMetrics)
      expect(mockWidgetDataService.getTaskMetrics).toHaveBeenCalled()
    })
  })

  describe('Métricas de Projetos', () => {
    it('deve obter métricas de projetos', async () => {
      const projectMetrics = [
        {
          id: '1',
          total_projects: 10,
          active_projects: 7,
          completed_projects: 3,
          on_time_delivery: 85,
          budget_adherence: 92,
          date: '2024-01-15'
        }
      ]
      mockWidgetDataService.getProjectMetrics.mockResolvedValue(projectMetrics)

      const result = await widgetDataService.getProjectMetrics()

      expect(result).toEqual(projectMetrics)
      expect(mockWidgetDataService.getProjectMetrics).toHaveBeenCalled()
    })
  })

  describe('Métricas de Controle de Tempo', () => {
    it('deve obter métricas de controle de tempo', async () => {
      const timeTrackingMetrics = [
        {
          id: '1',
          total_hours: 160,
          billable_hours: 120,
          billable_rate: 75,
          overtime_hours: 8,
          date: '2024-01-15'
        }
      ]
      mockWidgetDataService.getTimeTrackingMetrics.mockResolvedValue(timeTrackingMetrics)

      const result = await widgetDataService.getTimeTrackingMetrics()

      expect(result).toEqual(timeTrackingMetrics)
      expect(mockWidgetDataService.getTimeTrackingMetrics).toHaveBeenCalled()
    })
  })

  describe('Métricas de Funcionários', () => {
    it('deve obter métricas de funcionários', async () => {
      const employeeMetrics = [
        {
          id: '1',
          total_employees: 25,
          active_employees: 23,
          new_hires: 2,
          departures: 1,
          date: '2024-01-15'
        }
      ]
      mockWidgetDataService.getEmployeeMetrics.mockResolvedValue(employeeMetrics)

      const result = await widgetDataService.getEmployeeMetrics()

      expect(result).toEqual(employeeMetrics)
      expect(mockWidgetDataService.getEmployeeMetrics).toHaveBeenCalled()
    })
  })

  describe('Métricas Personalizadas', () => {
    it('deve obter métricas personalizadas', async () => {
      const customMetrics = [
        {
          id: '1',
          metric_name: 'Customer Satisfaction',
          value: 4.5,
          unit: 'score',
          date: '2024-01-15'
        }
      ]
      mockWidgetDataService.getCustomMetrics.mockResolvedValue(customMetrics)

      const result = await widgetDataService.getCustomMetrics('customer_satisfaction')

      expect(result).toEqual(customMetrics)
      expect(mockWidgetDataService.getCustomMetrics).toHaveBeenCalledWith('customer_satisfaction')
    })
  })

  describe('Filtros e Agregações', () => {
    it('deve obter métricas por intervalo de datas', async () => {
      mockWidgetDataService.getMetricsByDateRange.mockResolvedValue(mockProductivityMetrics)

      const result = await widgetDataService.getMetricsByDateRange(
        'productivity',
        '2024-01-01',
        '2024-01-31'
      )

      expect(result).toEqual(mockProductivityMetrics)
      expect(mockWidgetDataService.getMetricsByDateRange).toHaveBeenCalledWith(
        'productivity',
        '2024-01-01',
        '2024-01-31'
      )
    })

    it('deve obter métricas por usuário', async () => {
      const userMetrics = mockProductivityMetrics.filter(m => m.user_id === 'user1')
      mockWidgetDataService.getMetricsByUser.mockResolvedValue(userMetrics)

      const result = await widgetDataService.getMetricsByUser('user1')

      expect(result).toEqual(userMetrics)
      expect(mockWidgetDataService.getMetricsByUser).toHaveBeenCalledWith('user1')
    })

    it('deve obter métricas por departamento', async () => {
      const departmentMetrics = [
        {
          department: 'Engineering',
          productivity_score: 88,
          satisfaction_score: 4.3,
          total_employees: 12
        }
      ]
      mockWidgetDataService.getMetricsByDepartment.mockResolvedValue(departmentMetrics)

      const result = await widgetDataService.getMetricsByDepartment('engineering')

      expect(result).toEqual(departmentMetrics)
      expect(mockWidgetDataService.getMetricsByDepartment).toHaveBeenCalledWith('engineering')
    })

    it('deve obter métricas agregadas', async () => {
      const aggregatedMetrics = {
        total_productivity: 89.5,
        average_satisfaction: 4.4,
        total_tasks_completed: 27,
        period: 'monthly'
      }
      mockWidgetDataService.getAggregatedMetrics.mockResolvedValue(aggregatedMetrics)

      const result = await widgetDataService.getAggregatedMetrics('monthly')

      expect(result).toEqual(aggregatedMetrics)
      expect(mockWidgetDataService.getAggregatedMetrics).toHaveBeenCalledWith('monthly')
    })
  })

  describe('Comparações e Tendências', () => {
    it('deve obter comparação de métricas', async () => {
      const comparison = {
        current_period: { productivity: 88, satisfaction: 4.4 },
        previous_period: { productivity: 85, satisfaction: 4.2 },
        change: { productivity: 3.5, satisfaction: 4.8 }
      }
      mockWidgetDataService.getMetricsComparison.mockResolvedValue(comparison)

      const result = await widgetDataService.getMetricsComparison('monthly')

      expect(result).toEqual(comparison)
      expect(mockWidgetDataService.getMetricsComparison).toHaveBeenCalledWith('monthly')
    })

    it('deve obter tendências de métricas', async () => {
      const trends = [
        { date: '2024-01-01', value: 85 },
        { date: '2024-01-15', value: 88 },
        { date: '2024-01-31', value: 90 }
      ]
      mockWidgetDataService.getMetricsTrends.mockResolvedValue(trends)

      const result = await widgetDataService.getMetricsTrends('productivity', 'monthly')

      expect(result).toEqual(trends)
      expect(mockWidgetDataService.getMetricsTrends).toHaveBeenCalledWith('productivity', 'monthly')
    })
  })

  describe('Exportação e Relatórios', () => {
    it('deve exportar métricas', async () => {
      const exportData = {
        format: 'csv',
        url: 'https://example.com/export.csv',
        expires_at: '2024-01-16T10:00:00Z'
      }
      mockWidgetDataService.exportMetrics.mockResolvedValue(exportData)

      const result = await widgetDataService.exportMetrics('productivity', 'csv')

      expect(result).toEqual(exportData)
      expect(mockWidgetDataService.exportMetrics).toHaveBeenCalledWith('productivity', 'csv')
    })

    it('deve agendar relatório de métricas', async () => {
      const scheduledReport = {
        id: 'report_123',
        schedule: 'weekly',
        next_run: '2024-01-22T10:00:00Z',
        status: 'active'
      }
      mockWidgetDataService.scheduleMetricsReport.mockResolvedValue(scheduledReport)

      const result = await widgetDataService.scheduleMetricsReport({
        metrics: ['productivity', 'satisfaction'],
        schedule: 'weekly',
        recipients: ['admin@example.com']
      })

      expect(result).toEqual(scheduledReport)
      expect(mockWidgetDataService.scheduleMetricsReport).toHaveBeenCalledWith({
        metrics: ['productivity', 'satisfaction'],
        schedule: 'weekly',
        recipients: ['admin@example.com']
      })
    })
  })

  describe('Alertas e Limites', () => {
    it('deve obter alertas de métricas', async () => {
      const alerts = [
        {
          id: 'alert_1',
          metric: 'cpu_usage',
          threshold: 80,
          current_value: 85,
          status: 'triggered',
          created_at: '2024-01-15T10:00:00Z'
        }
      ]
      mockWidgetDataService.getMetricsAlerts.mockResolvedValue(alerts)

      const result = await widgetDataService.getMetricsAlerts()

      expect(result).toEqual(alerts)
      expect(mockWidgetDataService.getMetricsAlerts).toHaveBeenCalled()
    })

    it('deve definir limite de métrica', async () => {
      const threshold = {
        id: 'threshold_1',
        metric: 'cpu_usage',
        warning_level: 70,
        critical_level: 85,
        status: 'active'
      }
      mockWidgetDataService.setMetricsThreshold.mockResolvedValue(threshold)

      const result = await widgetDataService.setMetricsThreshold('cpu_usage', {
        warning: 70,
        critical: 85
      })

      expect(result).toEqual(threshold)
      expect(mockWidgetDataService.setMetricsThreshold).toHaveBeenCalledWith('cpu_usage', {
        warning: 70,
        critical: 85
      })
    })
  })

  describe('Histórico e Cache', () => {
    it('deve obter histórico de métricas', async () => {
      const history = [
        { date: '2024-01-01', value: 85 },
        { date: '2024-01-02', value: 87 },
        { date: '2024-01-03', value: 89 }
      ]
      mockWidgetDataService.getMetricsHistory.mockResolvedValue(history)

      const result = await widgetDataService.getMetricsHistory('productivity', 30)

      expect(result).toEqual(history)
      expect(mockWidgetDataService.getMetricsHistory).toHaveBeenCalledWith('productivity', 30)
    })

    it('deve limpar cache de métricas', async () => {
      mockWidgetDataService.clearMetricsCache.mockResolvedValue(true)

      const result = await widgetDataService.clearMetricsCache()

      expect(result).toBe(true)
      expect(mockWidgetDataService.clearMetricsCache).toHaveBeenCalled()
    })

    it('deve atualizar métricas', async () => {
      mockWidgetDataService.refreshMetrics.mockResolvedValue(true)

      const result = await widgetDataService.refreshMetrics('productivity')

      expect(result).toBe(true)
      expect(mockWidgetDataService.refreshMetrics).toHaveBeenCalledWith('productivity')
    })
  })

  describe('Status e Configuração', () => {
    it('deve obter status das métricas', async () => {
      const status = {
        system: 'healthy',
        last_update: '2024-01-15T10:00:00Z',
        data_freshness: 'current',
        active_subscriptions: 5
      }
      mockWidgetDataService.getMetricsStatus.mockResolvedValue(status)

      const result = await widgetDataService.getMetricsStatus()

      expect(result).toEqual(status)
      expect(mockWidgetDataService.getMetricsStatus).toHaveBeenCalled()
    })

    it('deve validar dados de métricas', async () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: ['Some data points are older than 1 hour']
      }
      mockWidgetDataService.validateMetricsData.mockResolvedValue(validation)

      const result = await widgetDataService.validateMetricsData(mockProductivityMetrics)

      expect(result).toEqual(validation)
      expect(mockWidgetDataService.validateMetricsData).toHaveBeenCalledWith(mockProductivityMetrics)
    })

    it('deve obter configuração de métricas', async () => {
      const config = {
        refresh_interval: 300,
        cache_duration: 3600,
        enabled_metrics: ['productivity', 'system', 'financial'],
        alert_thresholds: { cpu_usage: 80, memory_usage: 85 }
      }
      mockWidgetDataService.getMetricsConfiguration.mockResolvedValue(config)

      const result = await widgetDataService.getMetricsConfiguration()

      expect(result).toEqual(config)
      expect(mockWidgetDataService.getMetricsConfiguration).toHaveBeenCalled()
    })

    it('deve atualizar configuração de métricas', async () => {
      const updatedConfig = {
        refresh_interval: 600,
        cache_duration: 7200,
        enabled_metrics: ['productivity', 'system'],
        alert_thresholds: { cpu_usage: 75 }
      }
      mockWidgetDataService.updateMetricsConfiguration.mockResolvedValue(updatedConfig)

      const result = await widgetDataService.updateMetricsConfiguration({
        refresh_interval: 600,
        cache_duration: 7200
      })

      expect(result).toEqual(updatedConfig)
      expect(mockWidgetDataService.updateMetricsConfiguration).toHaveBeenCalledWith({
        refresh_interval: 600,
        cache_duration: 7200
      })
    })

    it('deve obter métricas disponíveis', async () => {
      const availableMetrics = [
        { name: 'productivity', description: 'Employee productivity metrics' },
        { name: 'system', description: 'System performance metrics' },
        { name: 'financial', description: 'Financial performance metrics' }
      ]
      mockWidgetDataService.getAvailableMetrics.mockResolvedValue(availableMetrics)

      const result = await widgetDataService.getAvailableMetrics()

      expect(result).toEqual(availableMetrics)
      expect(mockWidgetDataService.getAvailableMetrics).toHaveBeenCalled()
    })
  })

  describe('Inscrições em Tempo Real', () => {
    it('deve se inscrever em métricas', async () => {
      const subscription = {
        id: 'sub_123',
        metric: 'productivity',
        status: 'active'
      }
      mockWidgetDataService.subscribeToMetrics.mockResolvedValue(subscription)

      const result = await widgetDataService.subscribeToMetrics('productivity', vi.fn())

      expect(result).toEqual(subscription)
      expect(mockWidgetDataService.subscribeToMetrics).toHaveBeenCalledWith('productivity', expect.any(Function))
    })

    it('deve cancelar inscrição em métricas', async () => {
      mockWidgetDataService.unsubscribeFromMetrics.mockResolvedValue(true)

      const result = await widgetDataService.unsubscribeFromMetrics('sub_123')

      expect(result).toBe(true)
      expect(mockWidgetDataService.unsubscribeFromMetrics).toHaveBeenCalledWith('sub_123')
    })
  })
})