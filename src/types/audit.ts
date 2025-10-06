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
  | 'hr.collaborators.view_salary'
  | 'hr.collaborators.view_personal_data'
  
  // Administrativo
  | 'admin.docs.upload'
  | 'admin.docs.delete'
  | 'admin.docs.download'
  | 'admin.docs.view'
  
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
  
  // Autenticação
  | 'auth.login'
  | 'auth.logout'
  | 'auth.failed_login'
  | 'auth.password_change'
  | 'auth.mfa_enabled'
  | 'auth.mfa_disabled'
  
  // Acesso a dados
  | 'data.expense.view'
  | 'data.expense.export'
  | 'data.expense.print'
  | 'data.expense.share'
  | 'data.launch.view'
  | 'data.launch.export'
  | 'data.launch.print'
  | 'data.launch.share'
  | 'data.collaborator.view'
  | 'data.collaborator.export'
  | 'data.collaborator.print'
  | 'data.collaborator.share'
  | 'data.document.view'
  | 'data.document.export'
  | 'data.document.print'
  | 'data.document.share'
  | 'data.contact.view'
  | 'data.contact.export'
  | 'data.contact.print'
  | 'data.contact.share'
  
  // Conformidade
  | 'compliance.lgpd.audit'
  | 'compliance.lgpd.report'
  | 'compliance.lgpd.violation'
  | 'compliance.lgpd.remediation'
  | 'compliance.sox.audit'
  | 'compliance.sox.report'
  | 'compliance.sox.violation'
  | 'compliance.sox.remediation'
  | 'compliance.iso27001.audit'
  | 'compliance.iso27001.report'
  | 'compliance.iso27001.violation'
  | 'compliance.iso27001.remediation'
  | 'compliance.gdpr.audit'
  | 'compliance.gdpr.report'
  | 'compliance.gdpr.violation'
  | 'compliance.gdpr.remediation'
  
  // Sistema
  | 'system.backup'
  | 'system.restore'
  | 'system.maintenance'
  | 'system.update'
  | 'system.configuration_change'

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
  | 'compliance'
  | 'system'