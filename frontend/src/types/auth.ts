export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: Role
  permissions: Permission[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  slug: string
  description: string
  level: RoleLevel
  permissions: Permission[]
}

export type RoleLevel = 'strategic' | 'managerial' | 'tactical' | 'operational' | 'support'

export interface Permission {
  id: string
  name: string
  slug: string
  module: string
  action: PermissionAction
  description: string
}

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'manage' | 'read' | 'send' | 'respond' | 'upload' | 'access'

// Roles específicos baseados nas regras
export type RoleSlug = 
  | 'super_admin'
  | 'diretoria'
  | 'gerente_comercial'
  | 'gerente_operacional'
  | 'gerente_financeiro'
  | 'gerente_rh'
  | 'analista_comercial'
  | 'analista_operacional'
  | 'analista_financeiro'
  | 'analista_rh'
  | 'colaborador'
  | 'estagiario'
  | 'suporte_ti'
  | 'auditor_interno'

// Permissões específicas baseadas nas regras
export type PermissionSlug =
  // Gerais
  | 'dashboard.view'
  | 'feed.view'
  | 'tasks.view' | 'tasks.create' | 'tasks.update' | 'tasks.delete'
  | 'notifications.view'
  | 'chat.view' | 'chat.send'
  | 'profile.view' | 'profile.update'
  // Contatos
  | 'contacts.read' | 'contacts.create' | 'contacts.update' | 'contacts.delete'
  | 'contacts.internal.view'
  // CRM & Atividades
  | 'crm.forms.access'
  | 'activities.commercial.view' | 'activities.commercial.create' | 'activities.commercial.update' | 'activities.commercial.delete'
  | 'activities.operational.view' | 'activities.operational.create' | 'activities.operational.update' | 'activities.operational.delete'
  | 'activities.benefits.view' | 'activities.benefits.create' | 'activities.benefits.update' | 'activities.benefits.delete'
  | 'activities.business.view' | 'activities.business.create' | 'activities.business.update' | 'activities.business.delete'
  | 'activities.partners.view' | 'activities.partners.create' | 'activities.partners.update' | 'activities.partners.delete'
  // Empresa
  | 'org.chart.view'
  | 'admin.docs.read' | 'admin.docs.upload' | 'admin.docs.delete'
  | 'hr.attendance.read' | 'hr.attendance.update'
  | 'finance.expenses.create' | 'finance.expenses.update' | 'finance.expenses.delete'
  | 'finance.launches.create' | 'finance.launches.update' | 'finance.launches.delete'
  | 'finance.dre.view'
  | 'relationship.collaborators.read' | 'relationship.collaborators.update'
  | 'relationship.clients.read' | 'relationship.clients.update'
  | 'relationship.sac.read' | 'relationship.sac.respond'
  // RBAC & Auditoria
  | 'rbac.role.manage'
  | 'rbac.user.manage'
  | 'audit.read'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface AuditLog {
  id: string
  actorId: string
  action: PermissionSlug
  entity: string
  entityId: string
  timestamp: string
  ip: string
  userAgent: string
  meta?: Record<string, any>
}