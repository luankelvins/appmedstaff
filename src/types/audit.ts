export interface AuditLog {
  id: string
  actorId: string
  actorName: string
  actorRole: string
  action: string
  entity: string
  entityId: string
  timestamp: Date
  ip: string
  userAgent: string
  meta?: Record<string, any>
  success: boolean
  errorMessage?: string
}

export interface AuditLogFilter {
  actorId?: string
  action?: string
  entity?: string
  dateFrom?: Date
  dateTo?: Date
  success?: boolean
}

export interface AuditLogCreate {
  actorId: string
  action: string
  entity: string
  entityId: string
  meta?: Record<string, any>
  success: boolean
  errorMessage?: string
}

export type AuditAction = 
  // Financeiro
  | 'finance.expenses.create'
  | 'finance.expenses.update'
  | 'finance.expenses.delete'
  | 'finance.launches.create'
  | 'finance.launches.update'
  | 'finance.launches.delete'
  | 'finance.dre.view'
  
  // RH
  | 'hr.attendance.update'
  | 'hr.collaborators.create'
  | 'hr.collaborators.update'
  | 'hr.collaborators.delete'
  
  // Documentos
  | 'admin.docs.upload'
  | 'admin.docs.delete'
  | 'admin.docs.download'
  
  // SAC
  | 'relationship.sac.respond'
  | 'relationship.sac.view'
  
  // RBAC
  | 'rbac.role.create'
  | 'rbac.role.update'
  | 'rbac.role.delete'
  | 'rbac.user.create'
  | 'rbac.user.update'
  | 'rbac.user.delete'
  | 'rbac.permission.assign'
  | 'rbac.permission.revoke'
  
  // Contatos
  | 'contacts.create'
  | 'contacts.update'
  | 'contacts.delete'
  | 'contacts.internal.view'
  
  // Atividades Comerciais
  | 'activities.commercial.create'
  | 'activities.commercial.update'
  | 'activities.commercial.delete'
  
  // Atividades Operacionais
  | 'activities.operational.create'
  | 'activities.operational.update'
  | 'activities.operational.delete'
  
  // Login/Logout
  | 'auth.login'
  | 'auth.logout'
  | 'auth.failed_login'

export type AuditEntity = 
  | 'expense'
  | 'launch'
  | 'dre'
  | 'attendance'
  | 'collaborator'
  | 'document'
  | 'sac_ticket'
  | 'role'
  | 'user'
  | 'permission'
  | 'contact'
  | 'lead'
  | 'client'
  | 'partner'
  | 'activity'
  | 'session'