/**
 * Serviço de Tarefas
 * 
 * Gerencia todas as operações relacionadas às tarefas,
 * incluindo CRUD completo, atribuições, status e estatísticas.
 */

import { httpClient, type ApiResponse } from './httpClient'
import { API_ENDPOINTS, buildQueryString, type PaginationParams, type SearchParams } from '../config/api'
import type { 
  Task, 
  TaskInsert, 
  TaskUpdate 
} from '../types/database'

// ==================== INTERFACES ====================

interface TaskFilters {
  status?: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'
  prioridade?: 'baixa' | 'media' | 'alta' | 'urgente'
  responsavel_id?: string
  criado_por?: string
  data_vencimento_inicio?: string
  data_vencimento_fim?: string
  tags?: string[]
  vencidas?: boolean
  vencendo_hoje?: boolean
  vencendo_semana?: boolean
}

interface TaskSearchParams extends SearchParams {
  filters?: TaskFilters
}

interface TaskStats {
  total: number
  pendentes: number
  em_andamento: number
  concluidas: number
  canceladas: number
  vencidas: number
  vencendo_hoje: number
  vencendo_semana: number
  por_prioridade: Record<string, number>
  por_responsavel: Record<string, number>
  taxa_conclusao: number
  tempo_medio_conclusao: number
}

interface TaskCreateRequest extends Omit<TaskInsert, 'id'> {
  // Campos específicos para criação
}

interface TaskUpdateRequest extends TaskUpdate {
  // Campos específicos para atualização
}

interface TaskStatusUpdate {
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'
  observacoes?: string
  data_conclusao?: Date
}

interface TaskAssignment {
  responsavel_id: string
  observacoes?: string
}

interface TaskComment {
  id: string
  task_id: string
  usuario_id: string
  comentario: string
  created_at: Date
}

// ==================== CLASSE DO SERVIÇO ====================

class TasksService {
  
  // ==================== OPERAÇÕES CRUD ====================

  /**
   * Lista tarefas com paginação e filtros
   */
  async getTasks(params?: TaskSearchParams): Promise<ApiResponse<Task[]>> {
    try {
      const queryString = params ? buildQueryString(params) : ''
      const endpoint = `${API_ENDPOINTS.TASKS.LIST}${queryString}`
      
      return await httpClient.get<Task[]>(endpoint)
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
      throw error
    }
  }

  /**
   * Obtém tarefa por ID
   */
  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    try {
      return await httpClient.get<Task>(API_ENDPOINTS.TASKS.GET_BY_ID(id))
    } catch (error) {
      console.error(`Erro ao buscar tarefa ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria nova tarefa
   */
  async createTask(taskData: TaskCreateRequest): Promise<ApiResponse<Task>> {
    try {
      return await httpClient.post<Task>(
        API_ENDPOINTS.TASKS.CREATE,
        taskData
      )
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      throw error
    }
  }

  /**
   * Atualiza tarefa existente
   */
  async updateTask(id: string, taskData: TaskUpdateRequest): Promise<ApiResponse<Task>> {
    try {
      return await httpClient.put<Task>(
        API_ENDPOINTS.TASKS.UPDATE(id),
        taskData
      )
    } catch (error) {
      console.error(`Erro ao atualizar tarefa ${id}:`, error)
      throw error
    }
  }

  /**
   * Remove tarefa
   */
  async deleteTask(id: string): Promise<ApiResponse> {
    try {
      return await httpClient.delete(API_ENDPOINTS.TASKS.DELETE(id))
    } catch (error) {
      console.error(`Erro ao remover tarefa ${id}:`, error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE STATUS ====================

  /**
   * Atualiza status da tarefa
   */
  async updateTaskStatus(id: string, statusData: TaskStatusUpdate): Promise<ApiResponse<Task>> {
    try {
      return await httpClient.patch<Task>(
        API_ENDPOINTS.TASKS.UPDATE_STATUS(id),
        statusData
      )
    } catch (error) {
      console.error(`Erro ao atualizar status da tarefa ${id}:`, error)
      throw error
    }
  }

  /**
   * Marca tarefa como pendente
   */
  async markAsPending(id: string, observacoes?: string): Promise<ApiResponse<Task>> {
    try {
      return await this.updateTaskStatus(id, { 
        status: 'pendente', 
        observacoes 
      })
    } catch (error) {
      console.error(`Erro ao marcar tarefa ${id} como pendente:`, error)
      throw error
    }
  }

  /**
   * Marca tarefa como em andamento
   */
  async markAsInProgress(id: string, observacoes?: string): Promise<ApiResponse<Task>> {
    try {
      return await this.updateTaskStatus(id, { 
        status: 'em_andamento', 
        observacoes 
      })
    } catch (error) {
      console.error(`Erro ao marcar tarefa ${id} como em andamento:`, error)
      throw error
    }
  }

  /**
   * Marca tarefa como concluída
   */
  async markAsCompleted(id: string, observacoes?: string): Promise<ApiResponse<Task>> {
    try {
      return await this.updateTaskStatus(id, { 
        status: 'concluida', 
        observacoes,
        data_conclusao: new Date()
      })
    } catch (error) {
      console.error(`Erro ao marcar tarefa ${id} como concluída:`, error)
      throw error
    }
  }

  /**
   * Marca tarefa como cancelada
   */
  async markAsCancelled(id: string, observacoes?: string): Promise<ApiResponse<Task>> {
    try {
      return await this.updateTaskStatus(id, { 
        status: 'cancelada', 
        observacoes 
      })
    } catch (error) {
      console.error(`Erro ao marcar tarefa ${id} como cancelada:`, error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE ATRIBUIÇÃO ====================

  /**
   * Atribui tarefa a um responsável
   */
  async assignTask(id: string, assignment: TaskAssignment): Promise<ApiResponse<Task>> {
    try {
      return await this.updateTask(id, { 
        responsavel_id: assignment.responsavel_id 
      })
    } catch (error) {
      console.error(`Erro ao atribuir tarefa ${id}:`, error)
      throw error
    }
  }

  /**
   * Remove atribuição da tarefa
   */
  async unassignTask(id: string): Promise<ApiResponse<Task>> {
    try {
      return await this.updateTask(id, { 
        responsavel_id: undefined 
      })
    } catch (error) {
      console.error(`Erro ao remover atribuição da tarefa ${id}:`, error)
      throw error
    }
  }

  /**
   * Obtém tarefas por usuário
   */
  async getTasksByUser(userId: string, params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    try {
      const queryString = params ? buildQueryString(params) : ''
      const endpoint = `${API_ENDPOINTS.TASKS.BY_USER(userId)}${queryString}`
      
      return await httpClient.get<Task[]>(endpoint)
    } catch (error) {
      console.error(`Erro ao buscar tarefas do usuário ${userId}:`, error)
      throw error
    }
  }

  /**
   * Obtém tarefas atribuídas a um usuário
   */
  async getTasksByAssigned(userId: string, params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    try {
      const queryString = params ? buildQueryString(params) : ''
      const endpoint = `${API_ENDPOINTS.TASKS.BY_ASSIGNED(userId)}${queryString}`
      
      return await httpClient.get<Task[]>(endpoint)
    } catch (error) {
      console.error(`Erro ao buscar tarefas atribuídas ao usuário ${userId}:`, error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE FILTRO ====================

  /**
   * Filtra tarefas por status
   */
  async getTasksByStatus(
    status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada', 
    params?: PaginationParams
  ): Promise<ApiResponse<Task[]>> {
    try {
      const filters: TaskFilters = { status }
      const searchParams: TaskSearchParams = { filters, ...params }
      
      return await this.getTasks(searchParams)
    } catch (error) {
      console.error(`Erro ao buscar tarefas por status ${status}:`, error)
      throw error
    }
  }

  /**
   * Filtra tarefas por prioridade
   */
  async getTasksByPriority(
    prioridade: 'baixa' | 'media' | 'alta' | 'urgente', 
    params?: PaginationParams
  ): Promise<ApiResponse<Task[]>> {
    try {
      const filters: TaskFilters = { prioridade }
      const searchParams: TaskSearchParams = { filters, ...params }
      
      return await this.getTasks(searchParams)
    } catch (error) {
      console.error(`Erro ao buscar tarefas por prioridade ${prioridade}:`, error)
      throw error
    }
  }

  /**
   * Obtém tarefas vencidas
   */
  async getOverdueTasks(params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    try {
      const filters: TaskFilters = { vencidas: true }
      const searchParams: TaskSearchParams = { filters, ...params }
      
      return await this.getTasks(searchParams)
    } catch (error) {
      console.error('Erro ao buscar tarefas vencidas:', error)
      throw error
    }
  }

  /**
   * Obtém tarefas que vencem hoje
   */
  async getTasksDueToday(params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    try {
      const filters: TaskFilters = { vencendo_hoje: true }
      const searchParams: TaskSearchParams = { filters, ...params }
      
      return await this.getTasks(searchParams)
    } catch (error) {
      console.error('Erro ao buscar tarefas que vencem hoje:', error)
      throw error
    }
  }

  /**
   * Obtém tarefas que vencem esta semana
   */
  async getTasksDueThisWeek(params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    try {
      const filters: TaskFilters = { vencendo_semana: true }
      const searchParams: TaskSearchParams = { filters, ...params }
      
      return await this.getTasks(searchParams)
    } catch (error) {
      console.error('Erro ao buscar tarefas que vencem esta semana:', error)
      throw error
    }
  }

  /**
   * Filtra tarefas por tags
   */
  async getTasksByTags(tags: string[], params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    try {
      const filters: TaskFilters = { tags }
      const searchParams: TaskSearchParams = { filters, ...params }
      
      return await this.getTasks(searchParams)
    } catch (error) {
      console.error('Erro ao buscar tarefas por tags:', error)
      throw error
    }
  }

  /**
   * Filtra tarefas por período de vencimento
   */
  async getTasksByDuePeriod(
    dataInicio: string, 
    dataFim: string, 
    params?: PaginationParams
  ): Promise<ApiResponse<Task[]>> {
    try {
      const filters: TaskFilters = { 
        data_vencimento_inicio: dataInicio, 
        data_vencimento_fim: dataFim 
      }
      const searchParams: TaskSearchParams = { filters, ...params }
      
      return await this.getTasks(searchParams)
    } catch (error) {
      console.error('Erro ao buscar tarefas por período de vencimento:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE BUSCA ====================

  /**
   * Busca tarefas por termo
   */
  async searchTasks(query: string, params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    try {
      const searchParams = { q: query, ...params }
      const queryString = buildQueryString(searchParams)
      const endpoint = `${API_ENDPOINTS.TASKS.LIST}${queryString}`
      
      return await httpClient.get<Task[]>(endpoint)
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE ESTATÍSTICAS ====================

  /**
   * Obtém estatísticas das tarefas
   */
  async getTaskStats(): Promise<ApiResponse<TaskStats>> {
    try {
      return await httpClient.get<TaskStats>(API_ENDPOINTS.TASKS.STATS)
    } catch (error) {
      console.error('Erro ao obter estatísticas das tarefas:', error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE ANEXOS ====================

  /**
   * Adiciona anexo à tarefa
   */
  async addAttachment(id: string, file: File, description?: string): Promise<ApiResponse<Task>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (description) {
        formData.append('description', description)
      }

      return await httpClient.uploadFile<Task>(
        `/tasks/${id}/attachments`,
        file,
        { description }
      )
    } catch (error) {
      console.error(`Erro ao adicionar anexo à tarefa ${id}:`, error)
      throw error
    }
  }

  /**
   * Remove anexo da tarefa
   */
  async removeAttachment(id: string, attachmentId: string): Promise<ApiResponse<Task>> {
    try {
      return await httpClient.delete<Task>(`/tasks/${id}/attachments/${attachmentId}`)
    } catch (error) {
      console.error(`Erro ao remover anexo da tarefa ${id}:`, error)
      throw error
    }
  }

  // ==================== OPERAÇÕES DE COMENTÁRIOS ====================

  /**
   * Adiciona comentário à tarefa
   */
  async addComment(id: string, comentario: string): Promise<ApiResponse<TaskComment>> {
    try {
      return await httpClient.post<TaskComment>(
        `/tasks/${id}/comments`,
        { comentario }
      )
    } catch (error) {
      console.error(`Erro ao adicionar comentário à tarefa ${id}:`, error)
      throw error
    }
  }

  /**
   * Obtém comentários da tarefa
   */
  async getComments(id: string): Promise<ApiResponse<TaskComment[]>> {
    try {
      return await httpClient.get<TaskComment[]>(`/tasks/${id}/comments`)
    } catch (error) {
      console.error(`Erro ao obter comentários da tarefa ${id}:`, error)
      throw error
    }
  }

  /**
   * Remove comentário da tarefa
   */
  async removeComment(id: string, commentId: string): Promise<ApiResponse> {
    try {
      return await httpClient.delete(`/tasks/${id}/comments/${commentId}`)
    } catch (error) {
      console.error(`Erro ao remover comentário da tarefa ${id}:`, error)
      throw error
    }
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Formata tarefa para exibição
   */
  formatTaskForDisplay(task: Task): {
    id: string
    titulo: string
    descricao?: string
    status: string
    statusLabel: string
    prioridade: string
    prioridadeLabel: string
    prioridadeColor: string
    responsavel_id?: string
    data_vencimento?: Date
    isOverdue: boolean
    isDueToday: boolean
    isDueThisWeek: boolean
    tags?: string[]
  } {
    return {
      id: task.id,
      titulo: task.titulo,
      descricao: task.descricao,
      status: task.status,
      statusLabel: this.getStatusLabel(task.status),
      prioridade: task.prioridade,
      prioridadeLabel: this.getPriorityLabel(task.prioridade),
      prioridadeColor: this.getPriorityColor(task.prioridade),
      responsavel_id: task.responsavel_id,
      data_vencimento: task.data_vencimento,
      isOverdue: this.isOverdue(task),
      isDueToday: this.isDueToday(task),
      isDueThisWeek: this.isDueThisWeek(task),
      tags: task.tags
    }
  }

  /**
   * Obtém label do status
   */
  private getStatusLabel(status: string): string {
    const statusLabels = {
      pendente: 'Pendente',
      em_andamento: 'Em Andamento',
      concluida: 'Concluída',
      cancelada: 'Cancelada'
    }
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  /**
   * Obtém label da prioridade
   */
  private getPriorityLabel(prioridade: string): string {
    const priorityLabels = {
      baixa: 'Baixa',
      media: 'Média',
      alta: 'Alta',
      urgente: 'Urgente'
    }
    return priorityLabels[prioridade as keyof typeof priorityLabels] || prioridade
  }

  /**
   * Obtém cor da prioridade
   */
  private getPriorityColor(prioridade: string): string {
    const priorityColors = {
      baixa: '#10B981',    // green
      media: '#F59E0B',    // yellow
      alta: '#F97316',     // orange
      urgente: '#EF4444'   // red
    }
    return priorityColors[prioridade as keyof typeof priorityColors] || '#6B7280'
  }

  /**
   * Verifica se a tarefa está vencida
   */
  private isOverdue(task: Task): boolean {
    if (!task.data_vencimento || task.status === 'concluida' || task.status === 'cancelada') {
      return false
    }
    return new Date(task.data_vencimento) < new Date()
  }

  /**
   * Verifica se a tarefa vence hoje
   */
  private isDueToday(task: Task): boolean {
    if (!task.data_vencimento || task.status === 'concluida' || task.status === 'cancelada') {
      return false
    }
    const today = new Date()
    const dueDate = new Date(task.data_vencimento)
    return today.toDateString() === dueDate.toDateString()
  }

  /**
   * Verifica se a tarefa vence esta semana
   */
  private isDueThisWeek(task: Task): boolean {
    if (!task.data_vencimento || task.status === 'concluida' || task.status === 'cancelada') {
      return false
    }
    const today = new Date()
    const dueDate = new Date(task.data_vencimento)
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return dueDate >= today && dueDate <= weekFromNow
  }

  /**
   * Valida dados da tarefa
   */
  validateTaskData(taskData: TaskCreateRequest | TaskUpdateRequest): {
    isValid: boolean
    errors: Record<string, string[]>
  } {
    const errors: Record<string, string[]> = {}

    // Validação de título
    if ('titulo' in taskData && (!taskData.titulo || taskData.titulo.trim().length < 3)) {
      errors.titulo = ['Título deve ter pelo menos 3 caracteres']
    }

    // Validação de data de vencimento
    if ('data_vencimento' in taskData && taskData.data_vencimento) {
      const dueDate = new Date(taskData.data_vencimento)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (dueDate < today) {
        errors.data_vencimento = ['Data de vencimento não pode ser no passado']
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

// ==================== EXPORTAÇÃO ====================

export const tasksService = new TasksService()
export default tasksService

// Exportar tipos para uso em outros arquivos
export type {
  TaskFilters,
  TaskSearchParams,
  TaskStats,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskStatusUpdate,
  TaskAssignment,
  TaskComment
}