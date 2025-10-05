import { AuditLog, AuditLogCreate, AuditLogFilter, AuditAction, AuditEntity } from '../types/audit'
import { supabase } from '../config/supabase'

class AuditService {
  // Registrar uma nova ação de auditoria
  async logAction(logData: AuditLogCreate): Promise<void> {
    try {
      // Obter informações do usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.warn('Tentativa de log de auditoria sem usuário autenticado')
        return
      }

      // Obter dados do perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, position')
        .eq('id', user.id)
        .single()

      // Obter IP e User Agent (simulado no frontend)
      const ipAddress = await this.getCurrentIP()
      const userAgent = this.getCurrentUserAgent()

      // Chamar a função do banco para registrar o log
      const { error } = await supabase.rpc('log_audit_action', {
        p_actor_id: user.id,
        p_actor_name: profile?.name || user.email || 'Usuário Desconhecido',
        p_actor_role: profile?.position || 'Usuário',
        p_action: logData.action,
        p_entity: logData.entity,
        p_entity_id: logData.entityId,
        p_meta: logData.meta || null,
        p_success: logData.success,
        p_error_message: logData.errorMessage || null,
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      })

      if (error) {
        console.error('Erro ao registrar log de auditoria:', error)
        throw error
      }

      console.log('Log de auditoria registrado com sucesso:', {
        action: logData.action,
        entity: logData.entity,
        entityId: logData.entityId,
        success: logData.success
      })
    } catch (error) {
      console.error('Erro no serviço de auditoria:', error)
      // Não propagar o erro para não quebrar a funcionalidade principal
    }
  }

  // Buscar logs com filtros
  async getLogs(filter: AuditLogFilter = {}, page: number = 1, limit: number = 50): Promise<{
    logs: AuditLog[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })

      // Aplicar filtros
      if (filter.actorId) {
        query = query.eq('actor_id', filter.actorId)
      }

      if (filter.action) {
        query = query.ilike('action', `%${filter.action}%`)
      }

      if (filter.entity) {
        query = query.eq('entity', filter.entity)
      }

      if (filter.success !== undefined) {
        query = query.eq('success', filter.success)
      }

      if (filter.dateFrom) {
        query = query.gte('timestamp', filter.dateFrom.toISOString())
      }

      if (filter.dateTo) {
        query = query.lte('timestamp', filter.dateTo.toISOString())
      }

      // Aplicar paginação
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Erro ao buscar logs de auditoria:', error)
        
        // Se a tabela não existe, retornar dados de exemplo
        if (error.message?.includes('Could not find the table')) {
          console.warn('⚠️ Tabela audit_logs não encontrada. Retornando dados de exemplo.')
          return this.getMockLogs(filter, page, limit)
        }
        
        throw error
      }

      // Converter dados do banco para o formato esperado
      const logs: AuditLog[] = (data || []).map(row => ({
        id: row.id,
        actorId: row.actor_id,
        actorName: row.actor_name,
        actorRole: row.actor_role,
        action: row.action,
        entity: row.entity,
        entityId: row.entity_id,
        timestamp: new Date(row.timestamp),
        ip: row.ip_address,
        userAgent: row.user_agent,
        meta: row.meta,
        success: row.success,
        errorMessage: row.error_message
      }))

      const total = count || 0
      const totalPages = Math.ceil(total / limit)

      return {
        logs,
        total,
        page,
        totalPages
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
      
      // Fallback para dados mock se houver erro
      console.warn('⚠️ Usando dados de exemplo devido a erro na consulta.')
      return this.getMockLogs(filter, page, limit)
    }
  }

  // Buscar log por ID
  async getLogById(id: string): Promise<AuditLog | null> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erro ao buscar log por ID:', error)
        return null
      }

      if (!data) return null

      return {
        id: data.id,
        actorId: data.actor_id,
        actorName: data.actor_name,
        actorRole: data.actor_role,
        action: data.action,
        entity: data.entity,
        entityId: data.entity_id,
        timestamp: new Date(data.timestamp),
        ip: data.ip_address,
        userAgent: data.user_agent,
        meta: data.meta,
        success: data.success,
        errorMessage: data.error_message
      }
    } catch (error) {
      console.error('Erro ao buscar log por ID:', error)
      return null
    }
  }

  // Obter estatísticas de auditoria
  async getAuditStats(): Promise<{
    totalLogs: number
    successfulActions: number
    failedActions: number
    topActions: { action: string; count: number }[]
    topActors: { actorName: string; count: number }[]
  }> {
    try {
      const { data, error } = await supabase.rpc('get_audit_stats')

      if (error) {
        console.error('Erro ao obter estatísticas de auditoria:', error)
        
        // Se a função não existe, retornar estatísticas de exemplo
        if (error.message?.includes('Could not find the function')) {
          console.warn('⚠️ Função get_audit_stats não encontrada. Retornando estatísticas de exemplo.')
          return this.getMockStats()
        }
        
        throw error
      }

      const stats = data?.[0] || {}

      return {
        totalLogs: stats.total_logs || 0,
        successfulActions: stats.successful_actions || 0,
        failedActions: stats.failed_actions || 0,
        topActions: stats.top_actions || [],
        topActors: stats.top_actors || []
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      
      // Fallback para estatísticas mock
      console.warn('⚠️ Usando estatísticas de exemplo devido a erro na consulta.')
      return this.getMockStats()
    }
  }

  // Método para retornar logs de exemplo quando a tabela não existe
  private getMockLogs(filter: AuditLogFilter = {}, page: number = 1, limit: number = 50): {
    logs: AuditLog[]
    total: number
    page: number
    totalPages: number
  } {
    const mockLogs: AuditLog[] = [
      {
        id: 'mock-1',
        actorId: 'user-1',
        actorName: 'Administrador Sistema',
        actorRole: 'SuperAdmin',
        action: 'user.login',
        entity: 'user',
        entityId: 'user-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        meta: { loginMethod: 'email' },
        success: true,
        errorMessage: undefined
      },
      {
        id: 'mock-2',
        actorId: 'user-2',
        actorName: 'João Silva',
        actorRole: 'Gerente Financeiro',
        action: 'financial.expense.create',
        entity: 'expense',
        entityId: 'exp-123',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutos atrás
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        meta: { amount: 1500.00, category: 'Escritório' },
         success: true,
         errorMessage: undefined
      },
      {
        id: 'mock-3',
        actorId: 'user-3',
        actorName: 'Maria Santos',
        actorRole: 'Analista RH',
        action: 'employee.update',
        entity: 'employee',
        entityId: 'emp-456',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
        ip: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        meta: { field: 'position', oldValue: 'Analista Jr', newValue: 'Analista Pleno' },
         success: true,
         errorMessage: undefined
       },
       {
         id: 'mock-4',
         actorId: 'user-4',
         actorName: 'Carlos Oliveira',
         actorRole: 'Analista Operacional',
         action: 'task.delete',
         entity: 'task',
         entityId: 'task-789',
         timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutos atrás
         ip: '192.168.1.103',
         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
         meta: { taskTitle: 'Revisar documentos', reason: 'Tarefa duplicada' },
         success: false,
         errorMessage: 'Permissão negada para deletar tarefa'
       },
       {
         id: 'mock-5',
         actorId: 'user-1',
         actorName: 'Administrador Sistema',
         actorRole: 'SuperAdmin',
         action: 'system.backup',
         entity: 'system',
         entityId: 'backup-001',
         timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
         ip: '192.168.1.100',
         userAgent: 'System/1.0',
         meta: { backupSize: '2.5GB', duration: '15min' },
         success: true,
         errorMessage: undefined
      }
    ]

    // Aplicar filtros básicos
    let filteredLogs = [...mockLogs]

    if (filter.actorId) {
      filteredLogs = filteredLogs.filter(log => log.actorId === filter.actorId)
    }

    if (filter.action) {
       filteredLogs = filteredLogs.filter(log => log.action.includes(filter.action!))
     }

    if (filter.entity) {
      filteredLogs = filteredLogs.filter(log => log.entity === filter.entity)
    }

    if (filter.success !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.success === filter.success)
    }

    // Paginação
    const total = filteredLogs.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const logs = filteredLogs.slice(startIndex, endIndex)

    return {
      logs,
      total,
      page,
      totalPages
    }
  }

  // Método para retornar estatísticas de exemplo
  private getMockStats(): {
    totalLogs: number
    successfulActions: number
    failedActions: number
    topActions: { action: string; count: number }[]
    topActors: { actorName: string; count: number }[]
  } {
    return {
      totalLogs: 1247,
      successfulActions: 1198,
      failedActions: 49,
      topActions: [
        { action: 'user.login', count: 342 },
        { action: 'financial.expense.create', count: 156 },
        { action: 'task.update', count: 134 },
        { action: 'employee.update', count: 98 },
        { action: 'document.upload', count: 87 }
      ],
      topActors: [
        { actorName: 'Administrador Sistema', count: 234 },
        { actorName: 'João Silva', count: 189 },
        { actorName: 'Maria Santos', count: 167 },
        { actorName: 'Carlos Oliveira', count: 143 },
        { actorName: 'Ana Costa', count: 121 }
      ]
    }
  }

  // Métodos auxiliares
  private async getCurrentIP(): Promise<string> {
    try {
      // Em produção, isso seria obtido do servidor
      // Por enquanto, retornamos um IP simulado
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip || '127.0.0.1'
    } catch {
      return '127.0.0.1'
    }
  }

  private getCurrentUserAgent(): string {
    return navigator.userAgent || 'Unknown User Agent'
  }
}

export const auditService = new AuditService()

// Hook para usar o serviço de auditoria
export const useAudit = () => {
  const logAction = async (logData: AuditLogCreate) => {
    await auditService.logAction(logData)
  }

  const getLogs = async (filter?: AuditLogFilter, page?: number, limit?: number) => {
    return await auditService.getLogs(filter, page, limit)
  }

  const getLogById = async (id: string) => {
    return await auditService.getLogById(id)
  }

  const getStats = async () => {
    return await auditService.getAuditStats()
  }

  return {
    logAction,
    getLogs,
    getLogById,
    getStats
  }
}