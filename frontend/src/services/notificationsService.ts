/**
 * Serviço de Notificações
 * 
 * Gerencia todas as operações relacionadas às notificações,
 * incluindo CRUD, marcação de leitura, filtros e configurações.
 */

import { httpClient, type ApiResponse } from './httpClient'
import { API_ENDPOINTS, buildQueryString, type PaginationParams, type SearchParams } from '../config/api'

// ==================== INTERFACES ====================

interface Notification {
  id: string
  user_id: string
  titulo: string
  mensagem: string
  tipo: 'info' | 'success' | 'warning' | 'error' | 'task' | 'lead' | 'system'
  categoria: 'geral' | 'tarefa' | 'lead' | 'funcionario' | 'financeiro' | 'sistema' | 'seguranca'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  lida: boolean
  data_leitura?: Date
  link?: string
  dados_extras?: any // JSONB para dados específicos
  created_at: Date
  updated_at: Date
}

interface NotificationFilters {
  tipo?: 'info' | 'success' | 'warning' | 'error' | 'task' | 'lead' | 'system'
  categoria?: 'geral' | 'tarefa' | 'lead' | 'funcionario' | 'financeiro' | 'sistema' | 'seguranca'
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica'
  lida?: boolean
  data_inicio?: string
  data_fim?: string
  user_id?: string
}

interface NotificationSearchParams extends SearchParams {
  filters?: NotificationFilters
}

interface NotificationStats {
  total: number
  nao_lidas: number
  por_tipo: Record<string, number>
  por_categoria: Record<string, number>
  por_prioridade: Record<string, number>
  ultimas_24h: number
  ultima_semana: number
  ultimo_mes: number
}

interface NotificationCreateRequest {
  user_id?: string // Se não fornecido, será para todos os usuários
  titulo: string
  mensagem: string
  tipo: 'info' | 'success' | 'warning' | 'error' | 'task' | 'lead' | 'system'
  categoria: 'geral' | 'tarefa' | 'lead' | 'funcionario' | 'financeiro' | 'sistema' | 'seguranca'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  link?: string
  dados_extras?: any
  usuarios_ids?: string[] // Para notificação em massa
}

interface NotificationUpdateRequest {
  titulo?: string
  mensagem?: string
  tipo?: 'info' | 'success' | 'warning' | 'error' | 'task' | 'lead' | 'system'
  categoria?: 'geral' | 'tarefa' | 'lead' | 'funcionario' | 'financeiro' | 'sistema' | 'seguranca'
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica'
  link?: string
  dados_extras?: any
}

interface NotificationPreferences {
  id: string
  user_id: string
  email_enabled: boolean
  push_enabled: boolean
  sms_enabled: boolean
  categorias_email: string[]
  categorias_push: string[]
  categorias_sms: string[]
  horario_silencioso_inicio?: string
  horario_silencioso_fim?: string
  dias_silenciosos?: number[] // 0-6 (domingo-sábado)
  created_at: Date
  updated_at: Date
}

interface BulkNotificationRequest {
  usuarios_ids: string[]
  titulo: string
  mensagem: string
  tipo: 'info' | 'success' | 'warning' | 'error' | 'task' | 'lead' | 'system'
  categoria: 'geral' | 'tarefa' | 'lead' | 'funcionario' | 'financeiro' | 'sistema' | 'seguranca'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  link?: string
  dados_extras?: any
}

// ==================== CLASSE DO SERVIÇO ====================

class NotificationsService {
  
  // ==================== OPERAÇÕES CRUD ====================

  /**
   * Lista notificações com paginação e filtros
   */
  async getNotifications(params?: NotificationSearchParams): Promise<ApiResponse<Notification[]>> {
    try {
      const queryString = params ? buildQueryString(params) : ''
      const endpoint = `${API_ENDPOINTS.NOTIFICATIONS.LIST}${queryString}`
      
      return await httpClient.get<Notification[]>(endpoint)
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
      throw error
    }
  }

  /**
   * Obtém notificação por ID
   */
  async getNotificationById(id: string): Promise<ApiResponse<Notification>> {
    try {
      return await httpClient.get<Notification>(API_ENDPOINTS.NOTIFICATIONS.GET_BY_ID(id))
    } catch (error) {
      console.error(`Erro ao buscar notificação ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria nova notificação
   */
  async createNotification(notificationData: NotificationCreateRequest): Promise<ApiResponse<Notification>> {
    try {
      return await httpClient.post<Notification>(
        API_ENDPOINTS.NOTIFICATIONS.CREATE,
        notificationData
      )
    } catch (error) {
      console.error('Erro ao criar notificação:', error)
      throw error
    }
  }



  /**
   * Remove notificação
   */
  async deleteNotification(id: string): Promise<ApiResponse> {
    try {
      return await httpClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id))
    } catch (error) {
      console.error(`Erro ao remover notificação ${id}:`, error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE LEITURA ====================

  /**
   * Marca notificação como lida
   */
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    try {
      return await httpClient.patch<Notification>(
        API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id),
        { lida: true, data_leitura: new Date() }
      )
    } catch (error) {
      console.error(`Erro ao marcar notificação ${id} como lida:`, error)
      throw error
    }
  }





  // ==================== OPERAÇÕES DE FILTRO ====================

  /**
   * Obtém notificações não lidas
   */
  async getUnreadNotifications(userId?: string, params?: PaginationParams): Promise<ApiResponse<Notification[]>> {
    try {
      const filters: NotificationFilters = { lida: false }
      if (userId) filters.user_id = userId
      
      const searchParams: NotificationSearchParams = { filters, ...params }
      return await this.getNotifications(searchParams)
    } catch (error) {
      console.error('Erro ao buscar notificações não lidas:', error)
      throw error
    }
  }

  /**
   * Filtra notificações por tipo
   */
  async getNotificationsByType(
    tipo: 'info' | 'success' | 'warning' | 'error' | 'task' | 'lead' | 'system',
    params?: PaginationParams
  ): Promise<ApiResponse<Notification[]>> {
    try {
      const filters: NotificationFilters = { tipo }
      const searchParams: NotificationSearchParams = { filters, ...params }
      
      return await this.getNotifications(searchParams)
    } catch (error) {
      console.error(`Erro ao buscar notificações por tipo ${tipo}:`, error)
      throw error
    }
  }

  /**
   * Filtra notificações por categoria
   */
  async getNotificationsByCategory(
    categoria: 'geral' | 'tarefa' | 'lead' | 'funcionario' | 'financeiro' | 'sistema' | 'seguranca',
    params?: PaginationParams
  ): Promise<ApiResponse<Notification[]>> {
    try {
      const filters: NotificationFilters = { categoria }
      const searchParams: NotificationSearchParams = { filters, ...params }
      
      return await this.getNotifications(searchParams)
    } catch (error) {
      console.error(`Erro ao buscar notificações por categoria ${categoria}:`, error)
      throw error
    }
  }

  /**
   * Filtra notificações por prioridade
   */
  async getNotificationsByPriority(
    prioridade: 'baixa' | 'media' | 'alta' | 'critica',
    params?: PaginationParams
  ): Promise<ApiResponse<Notification[]>> {
    try {
      const filters: NotificationFilters = { prioridade }
      const searchParams: NotificationSearchParams = { filters, ...params }
      
      return await this.getNotifications(searchParams)
    } catch (error) {
      console.error(`Erro ao buscar notificações por prioridade ${prioridade}:`, error)
      throw error
    }
  }

  /**
   * Obtém notificações do usuário
   */
  async getUserNotifications(userId: string, params?: PaginationParams): Promise<ApiResponse<Notification[]>> {
    try {
      const queryString = params ? buildQueryString(params) : ''
      const endpoint = `${API_ENDPOINTS.NOTIFICATIONS.BY_USER(userId)}${queryString}`
      
      return await httpClient.get<Notification[]>(endpoint)
    } catch (error) {
      console.error(`Erro ao buscar notificações do usuário ${userId}:`, error)
      throw error
    }
  }

  /**
   * Obtém notificações recentes
   */
  async getRecentNotifications(hours: number = 24, params?: PaginationParams): Promise<ApiResponse<Notification[]>> {
    try {
      const dataInicio = new Date()
      dataInicio.setHours(dataInicio.getHours() - hours)
      
      const filters: NotificationFilters = { 
        data_inicio: dataInicio.toISOString() 
      }
      const searchParams: NotificationSearchParams = { filters, ...params }
      
      return await this.getNotifications(searchParams)
    } catch (error) {
      console.error('Erro ao buscar notificações recentes:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES EM MASSA ====================

  /**
   * Cria notificação em massa
   */
  async createBulkNotification(bulkData: BulkNotificationRequest): Promise<ApiResponse<Notification[]>> {
    try {
      return await httpClient.post<Notification[]>(
        '/notifications/bulk',
        bulkData
      )
    } catch (error) {
      console.error('Erro ao criar notificação em massa:', error)
      throw error
    }
  }

  /**
   * Marca todas as notificações de um usuário como lidas
   */
  async markAllUserNotificationsAsRead(userId: string): Promise<ApiResponse> {
    try {
      return await httpClient.patch(
        `/notifications/user/${userId}/read-all`
      )
    } catch (error) {
      console.error(`Erro ao marcar todas as notificações do usuário ${userId} como lidas:`, error)
      throw error
    }
  }

  /**
   * Marca múltiplas notificações como lidas
   */
  async markMultipleAsRead(ids: string[]): Promise<ApiResponse> {
    try {
      return await httpClient.patch(
        '/notifications/read-multiple',
        { ids }
      )
    } catch (error) {
      console.error('Erro ao marcar múltiplas notificações como lidas:', error)
      throw error
    }
  }

  /**
   * Limpa notificações antigas/lidas
   */
  async cleanupNotifications(): Promise<ApiResponse> {
    try {
      return await httpClient.delete('/notifications/cleanup')
    } catch (error) {
      console.error('Erro ao limpar notificações:', error)
      throw error
    }
  }

  /**
   * Remove múltiplas notificações
   */
  async deleteMultipleNotifications(ids: string[]): Promise<ApiResponse> {
    try {
      const promises = ids.map(id => this.deleteNotification(id))
      await Promise.all(promises)
      
      return { success: true, message: 'Notificações removidas' }
    } catch (error) {
      console.error('Erro ao remover múltiplas notificações:', error)
      throw error
    }
  }

  /**
   * Remove todas as notificações lidas
   */
  async deleteAllReadNotifications(userId?: string): Promise<ApiResponse> {
    try {
      // Busca notificações lidas e remove uma por uma
      const filters: NotificationFilters = { lida: true }
      if (userId) filters.user_id = userId
      
      const notifications = await this.getNotifications({ filters })
      if (notifications.data && notifications.data.length > 0) {
        const promises = notifications.data.map(notification => 
          this.deleteNotification(notification.id)
        )
        await Promise.all(promises)
      }
      
      return { success: true, message: 'Notificações lidas removidas' }
    } catch (error) {
      console.error('Erro ao remover todas as notificações lidas:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE BUSCA ====================

  /**
   * Busca notificações por termo
   */
  async searchNotifications(query: string, params?: PaginationParams): Promise<ApiResponse<Notification[]>> {
    try {
      const searchParams = { q: query, ...params }
      const queryString = buildQueryString(searchParams)
      const endpoint = `${API_ENDPOINTS.NOTIFICATIONS.LIST}${queryString}`
      
      return await httpClient.get<Notification[]>(endpoint)
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE ESTATÍSTICAS ====================

  /**
   * Obtém estatísticas das notificações
   */
  async getNotificationStats(userId?: string): Promise<ApiResponse<NotificationStats>> {
    try {
      // Como não temos endpoint específico, calculamos as estatísticas localmente
      const notifications = await this.getNotifications(userId ? { filters: { user_id: userId } } : undefined)
      
      if (!notifications.data) {
        return { success: true, data: this.getEmptyStats() }
      }
      
      const stats = this.calculateStats(notifications.data)
      return { success: true, data: stats }
    } catch (error) {
      console.error('Erro ao obter estatísticas das notificações:', error)
      throw error
    }
  }

  /**
   * Obtém contagem de notificações não lidas
   */
  async getUnreadCount(userId?: string): Promise<ApiResponse<{ count: number }>> {
    try {
      if (userId) {
        return await httpClient.get<{ count: number }>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT(userId))
      } else {
        // Se não tem userId, busca todas as não lidas e conta
        const unreadNotifications = await this.getUnreadNotifications()
        const count = unreadNotifications.data?.length || 0
        return { success: true, data: { count } }
      }
    } catch (error) {
      console.error('Erro ao obter contagem de notificações não lidas:', error)
      throw error
    }
  }

  // ==================== PREFERÊNCIAS ====================

  /**
   * Obtém preferências de notificação do usuário
   */
  async getUserPreferences(userId: string): Promise<ApiResponse<NotificationPreferences>> {
    try {
      return await httpClient.get<NotificationPreferences>(`/notifications/preferences/${userId}`)
    } catch (error) {
      console.error(`Erro ao obter preferências do usuário ${userId}:`, error)
      throw error
    }
  }

  /**
   * Atualiza preferências de notificação do usuário
   */
  async updateUserPreferences(
    userId: string, 
    preferences: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<ApiResponse<NotificationPreferences>> {
    try {
      return await httpClient.put<NotificationPreferences>(
        `/notifications/preferences/${userId}`,
        preferences
      )
    } catch (error) {
      console.error(`Erro ao atualizar preferências do usuário ${userId}:`, error)
      throw error
    }
  }

  // ==================== NOTIFICAÇÕES PUSH ====================

  /**
   * Registra token de push notification
   */
  async registerPushToken(userId: string, token: string, platform: 'web' | 'ios' | 'android'): Promise<ApiResponse> {
    try {
      return await httpClient.post('/notifications/push/register', {
        user_id: userId,
        token,
        platform
      })
    } catch (error) {
      console.error('Erro ao registrar token de push:', error)
      throw error
    }
  }

  /**
   * Remove token de push notification
   */
  async unregisterPushToken(userId: string, token: string): Promise<ApiResponse> {
    try {
      return await httpClient.post('/notifications/push/unregister', {
        user_id: userId, 
        token
      })
    } catch (error) {
      console.error('Erro ao remover token de push:', error)
      throw error
    }
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Formata notificação para exibição
   */
  formatNotificationForDisplay(notification: Notification): {
    id: string
    titulo: string
    mensagem: string
    tipo: string
    tipoLabel: string
    tipoColor: string
    categoria: string
    categoriaLabel: string
    prioridade: string
    prioridadeLabel: string
    prioridadeColor: string
    lida: boolean
    timeAgo: string
    link?: string
    hasLink: boolean
  } {
    return {
      id: notification.id,
      titulo: notification.titulo,
      mensagem: notification.mensagem,
      tipo: notification.tipo,
      tipoLabel: this.getTypeLabel(notification.tipo),
      tipoColor: this.getTypeColor(notification.tipo),
      categoria: notification.categoria,
      categoriaLabel: this.getCategoryLabel(notification.categoria),
      prioridade: notification.prioridade,
      prioridadeLabel: this.getPriorityLabel(notification.prioridade),
      prioridadeColor: this.getPriorityColor(notification.prioridade),
      lida: notification.lida,
      timeAgo: this.getTimeAgo(notification.created_at),
      link: notification.link,
      hasLink: !!notification.link
    }
  }

  /**
   * Obtém label do tipo
   */
  private getTypeLabel(tipo: string): string {
    const typeLabels = {
      info: 'Informação',
      success: 'Sucesso',
      warning: 'Aviso',
      error: 'Erro',
      task: 'Tarefa',
      lead: 'Lead',
      system: 'Sistema'
    }
    return typeLabels[tipo as keyof typeof typeLabels] || tipo
  }

  /**
   * Obtém cor do tipo
   */
  private getTypeColor(tipo: string): string {
    const typeColors = {
      info: '#3B82F6',      // blue
      success: '#10B981',   // green
      warning: '#F59E0B',   // yellow
      error: '#EF4444',     // red
      task: '#8B5CF6',      // purple
      lead: '#F97316',      // orange
      system: '#6B7280'     // gray
    }
    return typeColors[tipo as keyof typeof typeColors] || '#6B7280'
  }

  /**
   * Obtém label da categoria
   */
  private getCategoryLabel(categoria: string): string {
    const categoryLabels = {
      geral: 'Geral',
      tarefa: 'Tarefa',
      lead: 'Lead',
      funcionario: 'Funcionário',
      financeiro: 'Financeiro',
      sistema: 'Sistema',
      seguranca: 'Segurança'
    }
    return categoryLabels[categoria as keyof typeof categoryLabels] || categoria
  }

  /**
   * Obtém label da prioridade
   */
  private getPriorityLabel(prioridade: string): string {
    const priorityLabels = {
      baixa: 'Baixa',
      media: 'Média',
      alta: 'Alta',
      critica: 'Crítica'
    }
    return priorityLabels[prioridade as keyof typeof priorityLabels] || prioridade
  }

  /**
   * Obtém cor da prioridade
   */
  private getPriorityColor(prioridade: string): string {
    const priorityColors = {
      baixa: '#6B7280',     // gray
      media: '#3B82F6',     // blue
      alta: '#F59E0B',      // yellow
      critica: '#EF4444'    // red
    }
    return priorityColors[prioridade as keyof typeof priorityColors] || '#6B7280'
  }

  /**
   * Calcula tempo decorrido
   */
  private getTimeAgo(date: Date): string {
    const now = new Date()
    const diffInMs = now.getTime() - new Date(date).getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    if (diffInHours < 24) return `${diffInHours}h atrás`
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return new Date(date).toLocaleDateString('pt-BR')
  }

  /**
   * Obtém estatísticas vazias
   */
  private getEmptyStats(): NotificationStats {
    return {
      total: 0,
      nao_lidas: 0,
      por_tipo: {},
      por_categoria: {},
      por_prioridade: {},
      ultimas_24h: 0,
      ultima_semana: 0,
      ultimo_mes: 0
    }
  }

  /**
   * Calcula estatísticas das notificações
   */
  private calculateStats(notifications: Notification[]): NotificationStats {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const stats: NotificationStats = {
      total: notifications.length,
      nao_lidas: notifications.filter(n => !n.lida).length,
      por_tipo: {},
      por_categoria: {},
      por_prioridade: {},
      ultimas_24h: notifications.filter(n => new Date(n.created_at) >= oneDayAgo).length,
      ultima_semana: notifications.filter(n => new Date(n.created_at) >= oneWeekAgo).length,
      ultimo_mes: notifications.filter(n => new Date(n.created_at) >= oneMonthAgo).length
    }

    // Contagem por tipo
    notifications.forEach(notification => {
      stats.por_tipo[notification.tipo] = (stats.por_tipo[notification.tipo] || 0) + 1
      stats.por_categoria[notification.categoria] = (stats.por_categoria[notification.categoria] || 0) + 1
      stats.por_prioridade[notification.prioridade] = (stats.por_prioridade[notification.prioridade] || 0) + 1
    })

    return stats
  }

  /**
   * Valida dados da notificação
   */
  validateNotificationData(notificationData: NotificationCreateRequest | NotificationUpdateRequest): {
    isValid: boolean
    errors: Record<string, string[]>
  } {
    const errors: Record<string, string[]> = {}

    // Validação de título
    if ('titulo' in notificationData && (!notificationData.titulo || notificationData.titulo.trim().length < 3)) {
      errors.titulo = ['Título deve ter pelo menos 3 caracteres']
    }

    // Validação de mensagem
    if ('mensagem' in notificationData && (!notificationData.mensagem || notificationData.mensagem.trim().length < 5)) {
      errors.mensagem = ['Mensagem deve ter pelo menos 5 caracteres']
    }

    // Validação de link
    if ('link' in notificationData && notificationData.link) {
      try {
        new URL(notificationData.link)
      } catch {
        errors.link = ['Link deve ser uma URL válida']
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

// ==================== EXPORTAÇÃO ====================

export const notificationsService = new NotificationsService()
export default notificationsService

// Exportar tipos para uso em outros arquivos
export type {
  Notification,
  NotificationFilters,
  NotificationSearchParams,
  NotificationStats,
  NotificationCreateRequest,
  NotificationUpdateRequest,
  NotificationPreferences,
  BulkNotificationRequest
}