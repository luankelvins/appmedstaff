import { supabase } from '../config/supabase'
import { widgetCacheService } from './cacheService'
import { paginationService, PaginationParams, PaginatedResponse } from './paginationService'
import { realtimeService, RealtimeEvent, EventHandler } from './realtimeService'
import { performanceMonitor } from './performanceMonitor'

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface ProductivityMetrics {
  id: string
  user_id: string
  efficiency_score: number
  tasks_completed: number
  satisfaction_score: number
  date: string
  created_at: string
  updated_at: string
}

export interface TeamPerformance {
  id: string
  team_name: string
  efficiency_avg: number
  tasks_completed: number
  satisfaction_avg: number
  date: string
  created_at: string
  updated_at: string
}

export interface SystemMetrics {
  id: string
  cpu_usage: number
  memory_usage: number
  storage_usage: number
  network_usage: number
  active_users: number
  timestamp: string
  created_at: string
  updated_at: string
}

export interface ServiceStatus {
  id: string
  service_name: string
  status: 'online' | 'offline' | 'maintenance'
  uptime_percentage: number
  last_check: string
  created_at: string
  updated_at: string
}

export interface SalesMetrics {
  id: string
  revenue: number
  leads_generated: number
  conversion_rate: number
  avg_deal_size: number
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface SalesFunnel {
  id: string
  stage: string
  count: number
  value: number
  conversion_rate: number
  created_at: string
  updated_at: string
}

export interface TopProduct {
  id: string
  product_name: string
  sales_count: number
  revenue: number
  growth_rate: number
  created_at: string
  updated_at: string
}

export interface HRMetrics {
  id: string
  total_employees: number
  new_hires: number
  turnover_rate: number
  satisfaction_avg: number
  training_hours: number
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface TeamAttendance {
  id: string
  user_id: string
  date: string
  status: 'present' | 'absent' | 'late' | 'remote'
  hours_worked: number
  overtime_hours: number
  created_at: string
  updated_at: string
}

export interface TeamWellbeing {
  id: string
  user_id: string
  stress_level: number
  satisfaction_score: number
  work_life_balance: number
  feedback?: string
  date: string
  created_at: string
  updated_at: string
}

export interface FinancialMetrics {
  id: string
  revenue: number
  expenses: number
  profit: number
  cash_flow: number
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface FinancialProjection {
  id: string
  period_start: string
  period_end: string
  projected_revenue: number
  projected_expenses: number
  projected_profit: number
  confidence_level: number
  created_at: string
  updated_at: string
}

export interface ExpenseCategory {
  id: string
  category_name: string
  amount: number
  percentage: number
  budget_limit: number
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success' | 'task' | 'system'
  priority: 'low' | 'medium' | 'high'
  is_read: boolean
  action_url?: string
  created_at: string
  updated_at: string
}

// =====================================================
// SERVIÇO PRINCIPAL
// =====================================================

export class WidgetDataService {
  
  // ==================== PRODUTIVIDADE ====================
  
  /**
   * Obtém métricas de produtividade por período
   */
  async getProductivityMetrics(startDate?: string, endDate?: string): Promise<{
    efficiency_avg: number
    tasks_completed_total: number
    satisfaction_avg: number
    top_performers: Array<{
      id: string
      name: string
      efficiency: number
      tasks_completed: number
    }>
  }> {
    return this.withPerformanceMonitoring('getProductivityMetrics', async () => {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const end = endDate || new Date().toISOString().split('T')[0]
      const cacheKey = `productivity_metrics:${start}:${end}`

      return widgetCacheService.getOrSet(cacheKey, async () => {
        try {
          // Buscar métricas agregadas
          const { data: metrics, error: metricsError } = await supabase
            .from('productivity_metrics')
            .select('efficiency_score, tasks_completed, satisfaction_score')
            .gte('date', start)
            .lte('date', end)

          if (metricsError) throw metricsError

          // Buscar top performers com dados do perfil
          const { data: topPerformers, error: performersError } = await supabase
            .from('productivity_metrics')
            .select(`
              user_id,
              efficiency_score,
              tasks_completed,
              profiles!inner(id, full_name)
            `)
            .gte('date', start)
            .lte('date', end)
            .order('efficiency_score', { ascending: false })
            .limit(5)

          if (performersError) throw performersError

          // Calcular agregações
          const efficiency_avg = metrics.reduce((sum, m) => sum + m.efficiency_score, 0) / metrics.length || 0
          const tasks_completed_total = metrics.reduce((sum, m) => sum + m.tasks_completed, 0)
          const satisfaction_avg = metrics.reduce((sum, m) => sum + m.satisfaction_score, 0) / metrics.length || 0

          // Formatar top performers
          const top_performers = topPerformers.map(p => ({
            id: p.user_id,
            name: (p.profiles as any)?.full_name || 'Usuário',
            efficiency: p.efficiency_score,
            tasks_completed: p.tasks_completed
          }))

          return {
            efficiency_avg: Math.round(efficiency_avg * 100) / 100,
            tasks_completed_total,
            satisfaction_avg: Math.round(satisfaction_avg * 100) / 100,
            top_performers
          }
        } catch (error) {
          console.error('Erro ao buscar métricas de produtividade:', error)
          throw error
        }
      }, 2 * 60 * 1000) // Cache por 2 minutos
    })
  }

  /**
   * Obtém performance da equipe
   */
  async getTeamPerformance(): Promise<TeamPerformance[]> {
    try {
      const { data, error } = await supabase
        .from('team_performance')
        .select('*')
        .order('date', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar performance da equipe:', error)
      throw error
    }
  }

  // ==================== SISTEMA ====================

  /**
   * Obtém estatísticas do sistema
   */
  async getSystemStats(): Promise<{
    cpu_avg: number
    memory_avg: number
    storage_avg: number
    network_avg: number
    active_users_current: number
    services_status: Array<{
      name: string
      status: string
      uptime: number
    }>
  }> {
    try {
      // Métricas do sistema da última hora
      const { data: metrics, error: metricsError } = await supabase
        .from('system_metrics')
        .select('cpu_usage, memory_usage, storage_usage, network_usage, active_users')
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })

      if (metricsError) throw metricsError

      // Status dos serviços
      const { data: services, error: servicesError } = await supabase
        .from('service_status')
        .select('service_name, status, uptime_percentage')
        .order('service_name')

      if (servicesError) throw servicesError

      // Calcular médias
      const cpu_avg = metrics.reduce((sum, m) => sum + m.cpu_usage, 0) / metrics.length || 0
      const memory_avg = metrics.reduce((sum, m) => sum + m.memory_usage, 0) / metrics.length || 0
      const storage_avg = metrics.reduce((sum, m) => sum + m.storage_usage, 0) / metrics.length || 0
      const network_avg = metrics.reduce((sum, m) => sum + m.network_usage, 0) / metrics.length || 0
      const active_users_current = metrics[0]?.active_users || 0

      // Formatar status dos serviços
      const services_status = services.map(s => ({
        name: s.service_name,
        status: s.status,
        uptime: s.uptime_percentage
      }))

      return {
        cpu_avg: Math.round(cpu_avg * 100) / 100,
        memory_avg: Math.round(memory_avg * 100) / 100,
        storage_avg: Math.round(storage_avg * 100) / 100,
        network_avg: Math.round(network_avg * 100) / 100,
        active_users_current,
        services_status
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do sistema:', error)
      throw error
    }
  }

  // ==================== VENDAS ====================

  /**
   * Obtém métricas de vendas
   */
  async getSalesMetrics(months: number = 12): Promise<SalesMetrics[]> {
    return this.withPerformanceMonitoring('getSalesMetrics', async () => {
      try {
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - months)

        const { data, error } = await supabase
          .from('sales_metrics')
          .select('*')
          .gte('period_start', startDate.toISOString())
          .order('period_start', { ascending: false })

        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Erro ao buscar métricas de vendas:', error)
        throw error
      }
    })
  }

  /**
   * Obtém funil de vendas
   */
  async getSalesFunnel(): Promise<SalesFunnel[]> {
    try {
      const { data, error } = await supabase
        .from('sales_funnel')
        .select('*')
        .order('conversion_rate', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar funil de vendas:', error)
      throw error
    }
  }

  /**
   * Obtém produtos mais vendidos
   */
  async getTopProducts(): Promise<TopProduct[]> {
    try {
      const { data, error } = await supabase
        .from('top_products')
        .select('*')
        .order('revenue', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar produtos mais vendidos:', error)
      throw error
    }
  }

  // ==================== EQUIPE/RH ====================

  /**
   * Obtém métricas de RH
   */
  async getHRMetrics(): Promise<HRMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('hr_metrics')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao buscar métricas de RH:', error)
      return null
    }
  }

  /**
   * Obtém dados de presença da equipe
   */
  async getTeamAttendance(days: number = 7): Promise<TeamAttendance[]> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('team_attendance')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar dados de presença:', error)
      throw error
    }
  }

  /**
   * Obtém dados de bem-estar da equipe
   */
  async getTeamWellbeing(): Promise<TeamWellbeing[]> {
    try {
      const { data, error } = await supabase
        .from('team_wellbeing')
        .select('*')
        .order('date', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar dados de bem-estar:', error)
      throw error
    }
  }

  // ==================== FINANCEIRO ====================

  /**
   * Obtém métricas financeiras
   */
  async getFinancialMetrics(months: number = 12): Promise<FinancialMetrics[]> {
    return this.withPerformanceMonitoring('getFinancialMetrics', async () => {
      try {
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - months)

        const { data, error } = await supabase
          .from('financial_metrics')
          .select('*')
          .gte('period_start', startDate.toISOString())
          .order('period_start', { ascending: false })

        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Erro ao buscar métricas financeiras:', error)
        throw error
      }
    })
  }

  /**
   * Obtém projeções financeiras
   */
  async getFinancialProjections(): Promise<FinancialProjection[]> {
    try {
      const { data, error } = await supabase
        .from('financial_projections')
        .select('*')
        .order('period_start', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar projeções financeiras:', error)
      throw error
    }
  }

  /**
   * Obtém categorias de despesas
   */
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('amount', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar categorias de despesas:', error)
      throw error
    }
  }

  // ==================== NOTIFICAÇÕES ====================

  /**
   * Obtém notificações do usuário
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
      throw error
    }
  }

  /**
   * Marca notificação como lida
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      throw error
    }
  }

  /**
   * Cria nova notificação
   */
  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao criar notificação:', error)
      throw error
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Obtém estatísticas gerais do dashboard
   */
  async getDashboardStats(): Promise<{
    totalUsers: number
    activeUsers: number
    totalTasks: number
    completedTasks: number
    totalRevenue: number
    monthlyGrowth: number
  }> {
    return this.withPerformanceMonitoring('getDashboardStats', async () => {
      const cacheKey = 'dashboard_stats'

      return widgetCacheService.getOrSet(cacheKey, async () => {
        try {
          // Buscar dados de diferentes tabelas
          const [usersResult, tasksResult, revenueResult] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact' }),
            supabase.from('tasks').select('id, status', { count: 'exact' }),
            supabase.from('financial_metrics').select('revenue').order('period_start', { ascending: false }).limit(2)
          ])

          const totalUsers = usersResult.count || 0
          const totalTasks = tasksResult.count || 0
          const completedTasks = tasksResult.data?.filter(t => t.status === 'completed').length || 0
          
          const currentRevenue = revenueResult.data?.[0]?.revenue || 0
          const previousRevenue = revenueResult.data?.[1]?.revenue || 0
          const monthlyGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

          // Usuários ativos (última métrica do sistema)
          const { data: systemData } = await supabase
            .from('system_metrics')
            .select('active_users')
            .order('timestamp', { ascending: false })
            .limit(1)
            .single()

          const activeUsers = systemData?.active_users || 0

          return {
            totalUsers,
            activeUsers,
            totalTasks,
            completedTasks,
            totalRevenue: currentRevenue,
            monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
          }
        } catch (error) {
          console.error('Erro ao buscar estatísticas do dashboard:', error)
          throw error
        }
      }, 3 * 60 * 1000) // Cache por 3 minutos
    })
  }

  // ==================== MÉTODOS DE CACHE ====================

  /**
   * Invalida cache específico por padrão
   */
  invalidateCache(pattern: string): number {
    return widgetCacheService.invalidatePattern(pattern)
  }

  /**
   * Invalida todo o cache de widgets
   */
  clearAllCache(): void {
    widgetCacheService.clear()
  }

  /**
   * Obtém métricas do cache
   */
  getCacheMetrics() {
    return widgetCacheService.getMetrics()
  }

  /**
   * Obtém informações do cache
   */
  getCacheInfo() {
    return widgetCacheService.getInfo()
  }

  // ==================== MÉTODOS DE PAGINAÇÃO ====================

  /**
   * Obtém notificações paginadas para um usuário
   */
  async getNotificationsPaginated(
    userId: string, 
    params: PaginationParams
  ): Promise<PaginatedResponse<Notification>> {
    return paginationService.paginate<Notification>(
      'notifications',
      params,
      '*',
      (query) => query.eq('user_id', userId)
    )
  }

  /**
   * Obtém tarefas paginadas
   */
  async getTasksPaginated(params: PaginationParams): Promise<PaginatedResponse<any>> {
    return this.withPerformanceMonitoring('getTasksPaginated', async () => {
      return paginationService.paginate(
        'tasks',
        params,
        'id, title, description, status, priority, due_date, assigned_to, created_at, updated_at',
        (query) => {
          // Adicionar filtros específicos de tarefas se necessário
          return query
        }
      )
    })
  }

  /**
   * Obtém métricas de produtividade paginadas
   */
  async getProductivityMetricsPaginated(
    params: PaginationParams
  ): Promise<PaginatedResponse<ProductivityMetrics>> {
    return paginationService.paginate<ProductivityMetrics>(
      'productivity_metrics',
      params,
      '*'
    )
  }

  /**
   * Obtém métricas do sistema paginadas
   */
  async getSystemMetricsPaginated(
    params: PaginationParams
  ): Promise<PaginatedResponse<SystemMetrics>> {
    return paginationService.paginate<SystemMetrics>(
      'system_metrics',
      params,
      '*'
    )
  }

  /**
   * Obtém métricas financeiras paginadas
   */
  async getFinancialMetricsPaginated(
    params: PaginationParams
  ): Promise<PaginatedResponse<FinancialMetrics>> {
    return paginationService.paginate<FinancialMetrics>(
      'financial_metrics',
      params,
      '*'
    )
  }

  /**
   * Obtém usuários paginados (para administração)
   */
  async getUsersPaginated(params: PaginationParams): Promise<PaginatedResponse<any>> {
    return paginationService.paginate(
      'profiles',
      params,
      'id, email, full_name, avatar_url, role, created_at, updated_at'
    )
  }

  /**
   * Busca avançada com paginação por cursor (mais eficiente para grandes datasets)
   */
  async getNotificationsByCursor(
    userId: string,
    limit: number = 20,
    cursor?: string
  ): Promise<{
    data: Notification[]
    nextCursor?: string
    hasMore: boolean
    meta: { executionTime: number; itemsReturned: number }
  }> {
    return paginationService.paginateByCursor<Notification>(
      'notifications',
      {
        limit,
        cursor,
        cursorField: 'created_at',
        sortOrder: 'desc',
        filters: { user_id: userId }
      },
      '*'
    )
  }

  /**
   * Obtém logs do sistema paginados por cursor
   */
  async getSystemLogsByCursor(
    limit: number = 50,
    cursor?: string,
    logLevel?: 'info' | 'warning' | 'error'
  ): Promise<{
    data: any[]
    nextCursor?: string
    hasMore: boolean
    meta: { executionTime: number; itemsReturned: number }
  }> {
    const filters = logLevel ? { level: logLevel } : {}
    
    return paginationService.paginateByCursor(
      'system_logs',
      {
        limit,
        cursor,
        cursorField: 'timestamp',
        sortOrder: 'desc',
        filters
      },
      'id, level, message, metadata, timestamp, created_at'
    )
  }

  /**
   * Configuração do serviço de paginação
   */
  updatePaginationConfig(config: {
    defaultLimit?: number
    maxLimit?: number
    enableCache?: boolean
    cacheTimeout?: number
  }): void {
    paginationService.updateConfig(config)
  }

  /**
   * Obtém configuração atual da paginação
   */
  getPaginationConfig() {
    return paginationService.getConfig()
  }

  /**
   * Verifica saúde da conexão com o banco
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1)
      return !error
    } catch (error) {
      console.error('Erro no health check:', error)
      return false
    }
  }

  // ==================== MÉTODOS DE TEMPO REAL ====================

  /**
   * Inscreve-se em atualizações de notificações para um usuário
   */
  subscribeToNotifications(userId: string, handler: EventHandler): string {
    return realtimeService.subscribeToNotifications(userId, (event) => {
      // Invalidar cache relacionado
      this.invalidateCache(`notifications:${userId}`)
      this.invalidateCache('dashboard_stats')
      
      // Chamar handler personalizado
      handler(event)
    })
  }

  /**
   * Inscreve-se em atualizações de tarefas
   */
  subscribeToTasks(handler: EventHandler): string {
    return realtimeService.subscribeToTasks((event) => {
      // Invalidar cache relacionado
      this.invalidateCache('tasks:*')
      this.invalidateCache('dashboard_stats')
      
      handler(event)
    })
  }

  /**
   * Inscreve-se em atualizações de métricas do sistema
   */
  subscribeToSystemMetrics(handler: EventHandler): string {
    return realtimeService.subscribeToSystemMetrics((event) => {
      // Invalidar cache relacionado
      this.invalidateCache('system_metrics:*')
      this.invalidateCache('system_stats')
      
      handler(event)
    })
  }

  /**
   * Inscreve-se em atualizações de métricas financeiras
   */
  subscribeToFinancialMetrics(handler: EventHandler): string {
    return realtimeService.subscribeToFinancialMetrics((event) => {
      // Invalidar cache relacionado
      this.invalidateCache('financial_metrics:*')
      this.invalidateCache('dashboard_stats')
      
      handler(event)
    })
  }

  /**
   * Inscreve-se em atualizações de métricas de produtividade
   */
  subscribeToProductivityMetrics(handler: EventHandler): string {
    return realtimeService.subscribeToProductivityMetrics((event) => {
      // Invalidar cache relacionado
      this.invalidateCache('productivity_metrics:*')
      
      handler(event)
    })
  }

  /**
   * Inscreve-se em atualizações de performance da equipe
   */
  subscribeToTeamPerformance(handler: EventHandler): string {
    return realtimeService.subscribeToTeamPerformance((event) => {
      // Invalidar cache relacionado
      this.invalidateCache('team_performance:*')
      
      handler(event)
    })
  }

  /**
   * Inscreve-se em atualizações de métricas de RH
   */
  subscribeToHRMetrics(handler: EventHandler): string {
    return realtimeService.subscribeToHRMetrics((event) => {
      // Invalidar cache relacionado
      this.invalidateCache('hr_metrics:*')
      
      handler(event)
    })
  }

  /**
   * Remove inscrição específica
   */
  unsubscribeFromRealtime(subscriptionId: string): void {
    realtimeService.unsubscribe(subscriptionId)
  }

  /**
   * Remove todas as inscrições de tempo real
   */
  unsubscribeFromAllRealtime(): void {
    realtimeService.unsubscribeAll()
  }

  /**
   * Obtém status da conexão de tempo real
   */
  getRealtimeConnectionStatus() {
    return realtimeService.getConnectionStatus()
  }

  /**
   * Força reconexão do serviço de tempo real
   */
  async reconnectRealtime(): Promise<void> {
    return realtimeService.reconnect()
  }

  /**
   * Testa latência da conexão de tempo real
   */
  async testRealtimeLatency(): Promise<number> {
    return realtimeService.testLatency()
  }

  /**
   * Adiciona handler para mudanças de status de conexão
   */
  onRealtimeConnectionChange(handler: (status: any) => void): () => void {
    return realtimeService.onConnectionChange(handler)
  }

  /**
   * Adiciona handler para erros de tempo real
   */
  onRealtimeError(handler: (error: Error) => void): () => void {
    return realtimeService.onError(handler)
  }

  /**
   * Método de conveniência para configurar todas as inscrições de tempo real
   */
  setupRealtimeSubscriptions(userId: string, handlers: {
    onNotification?: EventHandler
    onTask?: EventHandler
    onSystemMetric?: EventHandler
    onFinancialMetric?: EventHandler
    onProductivityMetric?: EventHandler
    onTeamPerformance?: EventHandler
    onHRMetric?: EventHandler
  }): string[] {
    const subscriptions: string[] = []

    if (handlers.onNotification) {
      subscriptions.push(this.subscribeToNotifications(userId, handlers.onNotification))
    }

    if (handlers.onTask) {
      subscriptions.push(this.subscribeToTasks(handlers.onTask))
    }

    if (handlers.onSystemMetric) {
      subscriptions.push(this.subscribeToSystemMetrics(handlers.onSystemMetric))
    }

    if (handlers.onFinancialMetric) {
      subscriptions.push(this.subscribeToFinancialMetrics(handlers.onFinancialMetric))
    }

    if (handlers.onProductivityMetric) {
      subscriptions.push(this.subscribeToProductivityMetrics(handlers.onProductivityMetric))
    }

    if (handlers.onTeamPerformance) {
      subscriptions.push(this.subscribeToTeamPerformance(handlers.onTeamPerformance))
    }

    if (handlers.onHRMetric) {
      subscriptions.push(this.subscribeToHRMetrics(handlers.onHRMetric))
    }

    console.log(`✅ Configuradas ${subscriptions.length} inscrições de tempo real`)
    return subscriptions
  }

  // =====================================================
  // MÉTODOS DE MONITORAMENTO DE PERFORMANCE
  // =====================================================

  /**
   * Inicia o monitoramento automático de performance
   */
  startPerformanceMonitoring(): void {
    performanceMonitor.startAutoMonitoring()
    console.log('🚀 Monitoramento de performance iniciado')
  }

  /**
   * Para o monitoramento automático de performance
   */
  stopPerformanceMonitoring(): void {
    performanceMonitor.stopAutoMonitoring()
    console.log('⏹️ Monitoramento de performance parado')
  }

  /**
   * Obtém relatório completo de performance
   */
  getPerformanceReport() {
    return performanceMonitor.getFullReport()
  }

  /**
   * Obtém métricas do sistema
   */
  getSystemMetricsReport() {
    return performanceMonitor.getSystemReport()
  }

  /**
   * Obtém relatório de operações
   */
  getOperationsReport() {
    return performanceMonitor.getOperationsReport()
  }

  /**
   * Configura alertas de performance
   */
  setupPerformanceAlerts(): void {
    // Alerta para operações lentas (baseado em duração)
    performanceMonitor.setAlert('slow-operations', {
      threshold: 5000, // 5 segundos
      handler: (alert) => {
        console.warn(`⚠️ Operação lenta detectada: ${alert.value}ms`)
        this.createNotification({
          user_id: 'system',
          title: 'Performance Alert',
          message: `Operação demorou ${alert.value}ms (limite: ${alert.threshold}ms)`,
          type: 'warning',
          priority: 'medium',
          is_read: false
        }).catch(console.error)
      }
    })

    // Alerta para alto uso de memória
    performanceMonitor.setAlert('high-memory', {
      threshold: 100 * 1024 * 1024, // 100MB
      handler: (alert) => {
        console.warn('⚠️ Alto uso de memória detectado')
        this.createNotification({
          user_id: 'system',
          title: 'Memory Alert',
          message: `Alto uso de memória: ${Math.round(alert.value / 1024 / 1024)}MB`,
          type: 'warning',
          priority: 'high',
          is_read: false
        }).catch(console.error)
      }
    })

    console.log('🔔 Alertas de performance configurados')
  }

  /**
   * Limpa dados antigos de performance
   */
  cleanupPerformanceData(olderThanHours: number = 24): void {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000)
    performanceMonitor.cleanupOldOperations(cutoffTime)
    console.log(`🧹 Dados de performance anteriores a ${olderThanHours}h foram limpos`)
  }

  /**
   * Exporta dados de performance
   */
  exportPerformanceData(format: 'json' | 'csv' = 'json'): string {
    return performanceMonitor.exportData(format)
  }

  /**
   * Testa a latência do sistema
   */
  async testSystemLatency(): Promise<number> {
    const operationId = performanceMonitor.startOperation('system-latency-test')
    
    try {
      // Simula uma operação de teste
      await new Promise(resolve => setTimeout(resolve, 1))
      const latency = performanceMonitor.endOperation(operationId, true)
      return latency?.duration || 0
    } catch (error) {
      performanceMonitor.endOperation(operationId, false)
      throw error
    }
  }

  /**
   * Wrapper para monitorar operações automaticamente
   */
  private async withPerformanceMonitoring<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const operationId = performanceMonitor.startOperation(operationName)
    
    try {
      const result = await operation()
      performanceMonitor.endOperation(operationId, true)
      return result
    } catch (error) {
      performanceMonitor.endOperation(operationId, false)
      throw error
    }
  }

  /**
   * Cleanup completo do serviço
   */
  destroy(): void {
    this.stopPerformanceMonitoring()
    this.unsubscribeFromAllRealtime()
    realtimeService.destroy()
    performanceMonitor.clearOperations()
  }
}

// Instância singleton do serviço
export const widgetDataService = new WidgetDataService()