import { AuditLog, AuditLogCreate, AuditLogFilter, AuditAction, AuditEntity } from '../types/audit'

class AuditService {
  private logs: AuditLog[] = []

  // Simular dados iniciais para demonstração
  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        actorId: 'user-1',
        actorName: 'João Silva',
        actorRole: 'Gerente Financeiro',
        action: 'finance.expenses.create',
        entity: 'expense',
        entityId: 'exp-001',
        timestamp: new Date('2024-01-15T10:30:00'),
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        meta: {
          amount: 1500.00,
          category: 'Escritório',
          description: 'Material de escritório'
        },
        success: true
      },
      {
        id: '2',
        actorId: 'user-2',
        actorName: 'Maria Santos',
        actorRole: 'Analista RH',
        action: 'hr.collaborators.update',
        entity: 'collaborator',
        entityId: 'col-001',
        timestamp: new Date('2024-01-15T14:20:00'),
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        meta: {
          field: 'salary',
          oldValue: 5000,
          newValue: 5500
        },
        success: true
      },
      {
        id: '3',
        actorId: 'user-3',
        actorName: 'Carlos Oliveira',
        actorRole: 'SuperAdmin',
        action: 'rbac.role.create',
        entity: 'role',
        entityId: 'role-001',
        timestamp: new Date('2024-01-15T16:45:00'),
        ip: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        meta: {
          roleName: 'Analista Comercial Jr',
          permissions: ['contacts.read', 'activities.commercial.view']
        },
        success: true
      },
      {
        id: '4',
        actorId: 'user-4',
        actorName: 'Ana Costa',
        actorRole: 'Analista Operacional',
        action: 'admin.docs.upload',
        entity: 'document',
        entityId: 'doc-001',
        timestamp: new Date('2024-01-15T09:15:00'),
        ip: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        meta: {
          fileName: 'contrato_cliente_001.pdf',
          fileSize: 2048576,
          category: 'Contratos'
        },
        success: true
      },
      {
        id: '5',
        actorId: 'user-1',
        actorName: 'João Silva',
        actorRole: 'Gerente Financeiro',
        action: 'finance.expenses.delete',
        entity: 'expense',
        entityId: 'exp-002',
        timestamp: new Date('2024-01-14T11:30:00'),
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        meta: {
          reason: 'Despesa duplicada',
          amount: 750.00
        },
        success: false,
        errorMessage: 'Permissão insuficiente para deletar despesa aprovada'
      }
    ]

    this.logs = mockLogs
  }

  // Registrar uma nova ação de auditoria
  async logAction(logData: AuditLogCreate): Promise<void> {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...logData,
      actorName: this.getActorName(logData.actorId),
      actorRole: this.getActorRole(logData.actorId),
      timestamp: new Date(),
      ip: this.getCurrentIP(),
      userAgent: this.getCurrentUserAgent()
    }

    this.logs.unshift(newLog) // Adicionar no início para logs mais recentes primeiro
    
    // Em um ambiente real, isso seria persistido no banco de dados
    console.log('Audit log created:', newLog)
  }

  // Buscar logs com filtros
  async getLogs(filter: AuditLogFilter = {}, page: number = 1, limit: number = 50): Promise<{
    logs: AuditLog[]
    total: number
    page: number
    totalPages: number
  }> {
    let filteredLogs = [...this.logs]

    // Aplicar filtros
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

    if (filter.dateFrom) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.dateFrom!)
    }

    if (filter.dateTo) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.dateTo!)
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

  // Buscar log por ID
  async getLogById(id: string): Promise<AuditLog | null> {
    return this.logs.find(log => log.id === id) || null
  }

  // Estatísticas de auditoria
  async getAuditStats(): Promise<{
    totalLogs: number
    successfulActions: number
    failedActions: number
    topActions: { action: string; count: number }[]
    topActors: { actorName: string; count: number }[]
  }> {
    const totalLogs = this.logs.length
    const successfulActions = this.logs.filter(log => log.success).length
    const failedActions = this.logs.filter(log => !log.success).length

    // Top ações
    const actionCounts: { [key: string]: number } = {}
    this.logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
    })
    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Top atores
    const actorCounts: { [key: string]: number } = {}
    this.logs.forEach(log => {
      actorCounts[log.actorName] = (actorCounts[log.actorName] || 0) + 1
    })
    const topActors = Object.entries(actorCounts)
      .map(([actorName, count]) => ({ actorName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalLogs,
      successfulActions,
      failedActions,
      topActions,
      topActors
    }
  }

  // Métodos auxiliares (em um ambiente real, viriam do contexto de autenticação)
  private getActorName(actorId: string): string {
    const actors: { [key: string]: string } = {
      'user-1': 'João Silva',
      'user-2': 'Maria Santos',
      'user-3': 'Carlos Oliveira',
      'user-4': 'Ana Costa'
    }
    return actors[actorId] || 'Usuário Desconhecido'
  }

  private getActorRole(actorId: string): string {
    const roles: { [key: string]: string } = {
      'user-1': 'Gerente Financeiro',
      'user-2': 'Analista RH',
      'user-3': 'SuperAdmin',
      'user-4': 'Analista Operacional'
    }
    return roles[actorId] || 'Colaborador'
  }

  private getCurrentIP(): string {
    // Em um ambiente real, isso viria do request
    return '192.168.1.100'
  }

  private getCurrentUserAgent(): string {
    // Em um ambiente real, isso viria do request
    return navigator.userAgent || 'Unknown'
  }
}

export const auditService = new AuditService()

// Hook para facilitar o uso do serviço de auditoria
export const useAudit = () => {
  const logAction = async (action: AuditAction, entity: AuditEntity, entityId: string, meta?: Record<string, any>) => {
    try {
      await auditService.logAction({
        actorId: 'current-user', // Em um ambiente real, viria do contexto de auth
        action,
        entity,
        entityId,
        meta,
        success: true
      })
    } catch (error) {
      await auditService.logAction({
        actorId: 'current-user',
        action,
        entity,
        entityId,
        meta,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  return { logAction }
}