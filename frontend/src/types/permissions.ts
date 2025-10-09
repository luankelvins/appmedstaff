// Tipos para sistema de permissões granulares

export interface Permission {
  id: string
  name: string
  description: string
  category: PermissionCategory
  resource: string
  action: PermissionAction
  conditions?: PermissionCondition[]
  created_at: Date
  updated_at: Date
}

export interface Role {
  id: string
  name: string
  description: string
  level: RoleLevel
  permissions: Permission[]
  is_system_role: boolean
  created_at: Date
  updated_at: Date
}

export interface UserPermissions {
  user_id: string
  role: Role
  additional_permissions: Permission[]
  restricted_permissions: Permission[]
  effective_permissions: Permission[]
  last_updated: Date
}

export type PermissionCategory = 
  | 'financial'
  | 'hr'
  | 'administrative'
  | 'security'
  | 'compliance'
  | 'system'
  | 'reports'
  | 'contacts'
  | 'activities'

export type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'export'
  | 'import'
  | 'manage'
  | 'view_sensitive'
  | 'bulk_operations'

export type RoleLevel = 
  | 'user'
  | 'supervisor'
  | 'manager'
  | 'admin'
  | 'superadmin'

export interface PermissionCondition {
  type: 'time_based' | 'ip_based' | 'amount_limit' | 'approval_required' | 'mfa_required'
  value: any
  description: string
}

export interface PermissionTemplate {
  id: string
  name: string
  description: string
  role_level: RoleLevel
  permissions: string[] // Permission IDs
  is_default: boolean
}

export interface PermissionAuditLog {
  id: string
  user_id: string
  action: 'grant' | 'revoke' | 'modify'
  permission_id: string
  previous_value?: any
  new_value?: any
  reason: string
  approved_by?: string
  timestamp: Date
}

// Permissões predefinidas do sistema
export const SYSTEM_PERMISSIONS = {
  // Financeiro
  FINANCIAL_VIEW: 'financial.view',
  FINANCIAL_CREATE: 'financial.create',
  FINANCIAL_UPDATE: 'financial.update',
  FINANCIAL_DELETE: 'financial.delete',
  FINANCIAL_APPROVE: 'financial.approve',
  FINANCIAL_EXPORT: 'financial.export',
  FINANCIAL_VIEW_SENSITIVE: 'financial.view_sensitive',
  
  // RH
  HR_VIEW: 'hr.view',
  HR_CREATE: 'hr.create',
  HR_UPDATE: 'hr.update',
  HR_DELETE: 'hr.delete',
  HR_VIEW_SALARY: 'hr.view_salary',
  HR_VIEW_PERSONAL: 'hr.view_personal',
  HR_MANAGE_ATTENDANCE: 'hr.manage_attendance',
  
  // Administrativo
  ADMIN_VIEW: 'admin.view',
  ADMIN_MANAGE_DOCS: 'admin.manage_docs',
  ADMIN_SYSTEM_CONFIG: 'admin.system_config',
  ADMIN_USER_MANAGEMENT: 'admin.user_management',
  
  // Segurança
  SECURITY_VIEW_LOGS: 'security.view_logs',
  SECURITY_MANAGE_ROLES: 'security.manage_roles',
  SECURITY_MANAGE_PERMISSIONS: 'security.manage_permissions',
  SECURITY_VIEW_AUDIT: 'security.view_audit',
  
  // Relatórios
  REPORTS_VIEW: 'reports.view',
  REPORTS_CREATE: 'reports.create',
  REPORTS_EXPORT: 'reports.export',
  REPORTS_SCHEDULE: 'reports.schedule',
  
  // Sistema
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_MAINTENANCE: 'system.maintenance',
  SYSTEM_MONITORING: 'system.monitoring'
} as const

export const ROLE_TEMPLATES = {
  USER: {
    name: 'Usuário',
    permissions: [
      SYSTEM_PERMISSIONS.FINANCIAL_VIEW,
      SYSTEM_PERMISSIONS.HR_VIEW,
      SYSTEM_PERMISSIONS.ADMIN_VIEW,
      SYSTEM_PERMISSIONS.REPORTS_VIEW
    ]
  },
  SUPERVISOR: {
    name: 'Supervisor',
    permissions: [
      SYSTEM_PERMISSIONS.FINANCIAL_VIEW,
      SYSTEM_PERMISSIONS.FINANCIAL_CREATE,
      SYSTEM_PERMISSIONS.FINANCIAL_UPDATE,
      SYSTEM_PERMISSIONS.HR_VIEW,
      SYSTEM_PERMISSIONS.HR_CREATE,
      SYSTEM_PERMISSIONS.HR_UPDATE,
      SYSTEM_PERMISSIONS.HR_MANAGE_ATTENDANCE,
      SYSTEM_PERMISSIONS.ADMIN_VIEW,
      SYSTEM_PERMISSIONS.REPORTS_VIEW,
      SYSTEM_PERMISSIONS.REPORTS_CREATE
    ]
  },
  MANAGER: {
    name: 'Gerente',
    permissions: [
      SYSTEM_PERMISSIONS.FINANCIAL_VIEW,
      SYSTEM_PERMISSIONS.FINANCIAL_CREATE,
      SYSTEM_PERMISSIONS.FINANCIAL_UPDATE,
      SYSTEM_PERMISSIONS.FINANCIAL_APPROVE,
      SYSTEM_PERMISSIONS.FINANCIAL_EXPORT,
      SYSTEM_PERMISSIONS.HR_VIEW,
      SYSTEM_PERMISSIONS.HR_CREATE,
      SYSTEM_PERMISSIONS.HR_UPDATE,
      SYSTEM_PERMISSIONS.HR_VIEW_SALARY,
      SYSTEM_PERMISSIONS.HR_MANAGE_ATTENDANCE,
      SYSTEM_PERMISSIONS.ADMIN_VIEW,
      SYSTEM_PERMISSIONS.ADMIN_MANAGE_DOCS,
      SYSTEM_PERMISSIONS.REPORTS_VIEW,
      SYSTEM_PERMISSIONS.REPORTS_CREATE,
      SYSTEM_PERMISSIONS.REPORTS_EXPORT,
      SYSTEM_PERMISSIONS.SECURITY_VIEW_LOGS
    ]
  },
  ADMIN: {
    name: 'Administrador',
    permissions: [
      SYSTEM_PERMISSIONS.FINANCIAL_VIEW,
      SYSTEM_PERMISSIONS.FINANCIAL_CREATE,
      SYSTEM_PERMISSIONS.FINANCIAL_UPDATE,
      SYSTEM_PERMISSIONS.FINANCIAL_DELETE,
      SYSTEM_PERMISSIONS.FINANCIAL_APPROVE,
      SYSTEM_PERMISSIONS.FINANCIAL_EXPORT,
      SYSTEM_PERMISSIONS.FINANCIAL_VIEW_SENSITIVE,
      SYSTEM_PERMISSIONS.HR_VIEW,
      SYSTEM_PERMISSIONS.HR_CREATE,
      SYSTEM_PERMISSIONS.HR_UPDATE,
      SYSTEM_PERMISSIONS.HR_DELETE,
      SYSTEM_PERMISSIONS.HR_VIEW_SALARY,
      SYSTEM_PERMISSIONS.HR_VIEW_PERSONAL,
      SYSTEM_PERMISSIONS.HR_MANAGE_ATTENDANCE,
      SYSTEM_PERMISSIONS.ADMIN_VIEW,
      SYSTEM_PERMISSIONS.ADMIN_MANAGE_DOCS,
      SYSTEM_PERMISSIONS.ADMIN_SYSTEM_CONFIG,
      SYSTEM_PERMISSIONS.ADMIN_USER_MANAGEMENT,
      SYSTEM_PERMISSIONS.SECURITY_VIEW_LOGS,
      SYSTEM_PERMISSIONS.SECURITY_MANAGE_ROLES,
      SYSTEM_PERMISSIONS.SECURITY_VIEW_AUDIT,
      SYSTEM_PERMISSIONS.REPORTS_VIEW,
      SYSTEM_PERMISSIONS.REPORTS_CREATE,
      SYSTEM_PERMISSIONS.REPORTS_EXPORT,
      SYSTEM_PERMISSIONS.REPORTS_SCHEDULE
    ]
  },
  SUPERADMIN: {
    name: 'Super Administrador',
    permissions: Object.values(SYSTEM_PERMISSIONS)
  }
} as const