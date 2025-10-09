import { AuditLog, AuditLogCreate, AuditLogFilter, AuditAction, AuditEntity } from '../types/audit'
import db from '../config/database'

class AuditService {
  // Registrar uma nova ação de auditoria
  async logAction(logData: AuditLogCreate): Promise<void> {
    try {
      // Obter IP e User Agent (simulado no frontend)
      const ipAddress = await this.getCurrentIP()
      const userAgent = this.getCurrentUserAgent()

      const query = `
        INSERT INTO audit_logs (
          actor_id, actor_name, actor_role, action, entity, entity_id,
          meta, success, error_message, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      `

      await db.query(query, [
         logData.actorId || 'system',
         'Sistema', // actorName será obtido de outra fonte
         'Sistema', // actorRole será obtido de outra fonte
         logData.action,
         logData.entity,
         logData.entityId,
         JSON.stringify(logData.meta || {}),
         logData.success,
         logData.errorMessage || null,
         ipAddress,
         userAgent
       ])

      console.log('Log de auditoria registrado com sucesso:', {
        action: logData.action,
        entity: logData.entity,
        entityId: logData.entityId,
        success: logData.success
      })
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error)
      // Não relançar o erro para não quebrar o fluxo principal
    }
  }

  // Buscar logs com filtros e paginação
  async getLogs(filter: AuditLogFilter = {}, page: number = 1, limit: number = 50): Promise<{
    logs: AuditLog[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      let query = 'SELECT * FROM audit_logs WHERE 1=1'
      let countQuery = 'SELECT COUNT(*) FROM audit_logs WHERE 1=1'
      const params: any[] = []
      let paramIndex = 1

      // Aplicar filtros
      if (filter.actorId) {
        query += ` AND actor_id = $${paramIndex}`
        countQuery += ` AND actor_id = $${paramIndex}`
        params.push(filter.actorId)
        paramIndex++
      }

      if (filter.action) {
        query += ` AND action = $${paramIndex}`
        countQuery += ` AND action = $${paramIndex}`
        params.push(filter.action)
        paramIndex++
      }

      if (filter.entity) {
        query += ` AND entity = $${paramIndex}`
        countQuery += ` AND entity = $${paramIndex}`
        params.push(filter.entity)
        paramIndex++
      }

      if (filter.success !== undefined) {
         query += ` AND success = $${paramIndex}`
         countQuery += ` AND success = $${paramIndex}`
         params.push(filter.success)
         paramIndex++
       }

       if (filter.dateFrom) {
         query += ` AND created_at >= $${paramIndex}`
         countQuery += ` AND created_at >= $${paramIndex}`
         params.push(filter.dateFrom)
         paramIndex++
       }

       if (filter.dateTo) {
         query += ` AND created_at <= $${paramIndex}`
         countQuery += ` AND created_at <= $${paramIndex}`
         params.push(filter.dateTo)
         paramIndex++
       }

      // Ordenação e paginação
      query += ' ORDER BY created_at DESC'
      const offset = (page - 1) * limit
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
      params.push(limit, offset)

      // Executar consultas
      const [logsResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, params.slice(0, -2)) // Remove limit e offset do count
      ])

      const total = parseInt(countResult.rows[0].count)
      const totalPages = Math.ceil(total / limit)

      return {
        logs: logsResult.rows.map(this.mapAuditLogFromDB),
        total,
        page,
        totalPages
      }
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error)
      throw error
    }
  }

  // Buscar log por ID
  async getLogById(id: string): Promise<AuditLog | null> {
    try {
      const query = 'SELECT * FROM audit_logs WHERE id = $1'
      const result = await db.query(query, [id])

      if (result.rows.length === 0) {
        return null
      }

      return this.mapAuditLogFromDB(result.rows[0])
    } catch (error) {
      console.error('Erro ao buscar log de auditoria por ID:', error)
      throw error
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
      const queries = [
        'SELECT COUNT(*) as total FROM audit_logs',
        'SELECT COUNT(*) as successful FROM audit_logs WHERE success = true',
        'SELECT COUNT(*) as failed FROM audit_logs WHERE success = false',
        `SELECT action, COUNT(*) as count FROM audit_logs 
         GROUP BY action ORDER BY count DESC LIMIT 10`,
        `SELECT actor_name, COUNT(*) as count FROM audit_logs 
         GROUP BY actor_name ORDER BY count DESC LIMIT 10`
      ]

      const [totalResult, successResult, failedResult, actionsResult, actorsResult] = 
        await Promise.all(queries.map(query => db.query(query)))

      return {
        totalLogs: parseInt(totalResult.rows[0].total),
        successfulActions: parseInt(successResult.rows[0].successful),
        failedActions: parseInt(failedResult.rows[0].failed),
        topActions: actionsResult.rows.map(row => ({
          action: row.action,
          count: parseInt(row.count)
        })),
        topActors: actorsResult.rows.map(row => ({
          actorName: row.actor_name,
          count: parseInt(row.count)
        }))
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas de auditoria:', error)
      throw error
    }
  }

  // Mapear dados do banco para o tipo AuditLog
   private mapAuditLogFromDB(row: any): AuditLog {
     return {
       id: row.id,
       actorId: row.actor_id,
       actorName: row.actor_name,
       actorRole: row.actor_role,
       action: row.action,
       entity: row.entity,
       entityId: row.entity_id,
       meta: row.meta ? JSON.parse(row.meta) : {},
       success: row.success,
       errorMessage: row.error_message,
       ip: row.ip_address,
       userAgent: row.user_agent,
       timestamp: row.created_at
     }
   }

  // Obter IP atual (simulado)
  private async getCurrentIP(): Promise<string> {
    try {
      // Em produção, isso seria obtido do servidor
      return '127.0.0.1'
    } catch {
      return '127.0.0.1'
    }
  }

  // Obter User Agent atual
  private getCurrentUserAgent(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
  }
}

export const auditService = new AuditService()

// Hook para facilitar o uso do audit service
export const useAudit = () => {
  const logAction = async (action: AuditAction, entity: AuditEntity, entityId: string, actorId: string = 'system', meta?: any, success: boolean = true, errorMessage?: string) => {
    await auditService.logAction({
      actorId,
      action,
      entity,
      entityId,
      meta,
      success,
      errorMessage
    })
  }

  return {
    logAction,
    getLogs: auditService.getLogs.bind(auditService),
    getLogById: auditService.getLogById.bind(auditService),
    getAuditStats: auditService.getAuditStats.bind(auditService)
  }
}