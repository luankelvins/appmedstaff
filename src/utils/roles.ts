import { PERMISSIONS } from './permissions'

export interface Role {
  id: string
  name: string
  slug: string
  description: string
  level: 'executive' | 'management' | 'operational' | 'basic'
  permissions: string[]
  color: string
}

// Definição dos roles do sistema
export const ROLES: Record<string, Role> = {
  SUPER_ADMIN: {
    id: 'super_admin',
    name: 'Super Administrador',
    slug: 'super_admin',
    description: 'Acesso total ao sistema',
    level: 'executive',
    permissions: Object.values(PERMISSIONS),
    color: '#dc2626'
  },
  
  HR_MANAGER: {
    id: 'hr_manager',
    name: 'Gerente de RH',
    slug: 'hr_manager',
    description: 'Gerenciamento completo de RH e controle de ponto',
    level: 'management',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.ADMIN_ACCESS,
      PERMISSIONS.ADMIN_DASHBOARD_VIEW,
      PERMISSIONS.ADMIN_EMPLOYEES_VIEW,
      PERMISSIONS.ADMIN_EMPLOYEES_CREATE,
      PERMISSIONS.ADMIN_EMPLOYEES_UPDATE,
      PERMISSIONS.ADMIN_EMPLOYEES_DELETE,
      PERMISSIONS.ADMIN_DEPARTMENTS_VIEW,
      PERMISSIONS.ADMIN_DEPARTMENTS_CREATE,
      PERMISSIONS.ADMIN_DEPARTMENTS_UPDATE,
      PERMISSIONS.ADMIN_DEPARTMENTS_DELETE,
      PERMISSIONS.TIMETRACKING_VIEW,
      PERMISSIONS.TIMETRACKING_REPORTS_VIEW,
      PERMISSIONS.TIMETRACKING_REPORTS_EXPORT,
      PERMISSIONS.TIMETRACKING_ADMIN,
      PERMISSIONS.TIMETRACKING_SCHEDULES_MANAGE,
      PERMISSIONS.WORK_SCHEDULES_VIEW,
      PERMISSIONS.WORK_SCHEDULES_CREATE,
      PERMISSIONS.WORK_SCHEDULES_UPDATE,
      PERMISSIONS.WORK_SCHEDULES_DELETE,
      PERMISSIONS.CONTACTS_INTERNAL_VIEW,
      PERMISSIONS.ORG_CHART_VIEW,
      PERMISSIONS.AUDIT_READ
    ],
    color: '#059669'
  },
  
  HR_ANALYST: {
    id: 'hr_analyst',
    name: 'Analista de RH',
    slug: 'hr_analyst',
    description: 'Operações de RH e relatórios',
    level: 'operational',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.ADMIN_ACCESS,
      PERMISSIONS.ADMIN_DASHBOARD_VIEW,
      PERMISSIONS.ADMIN_EMPLOYEES_VIEW,
      PERMISSIONS.ADMIN_EMPLOYEES_UPDATE,
      PERMISSIONS.ADMIN_DEPARTMENTS_VIEW,
      PERMISSIONS.TIMETRACKING_VIEW,
      PERMISSIONS.TIMETRACKING_REPORTS_VIEW,
      PERMISSIONS.TIMETRACKING_REPORTS_EXPORT,
      PERMISSIONS.WORK_SCHEDULES_VIEW,
      PERMISSIONS.CONTACTS_INTERNAL_VIEW,
      PERMISSIONS.ORG_CHART_VIEW
    ],
    color: '#0891b2'
  },
  
  MANAGER: {
    id: 'manager',
    name: 'Gerente',
    slug: 'manager',
    description: 'Gerenciamento de equipe e relatórios',
    level: 'management',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.TASKS_VIEW,
      PERMISSIONS.TASKS_CREATE,
      PERMISSIONS.TASKS_UPDATE,
      PERMISSIONS.TASKS_DELETE,
      PERMISSIONS.TIMETRACKING_VIEW,
      PERMISSIONS.TIMETRACKING_REPORTS_VIEW,
      PERMISSIONS.CONTACTS_READ,
      PERMISSIONS.CONTACTS_INTERNAL_VIEW,
      PERMISSIONS.ORG_CHART_VIEW,
      PERMISSIONS.ACTIVITIES_COMMERCIAL,
      PERMISSIONS.ACTIVITIES_OPERATIONAL
    ],
    color: '#7c3aed'
  },
  
  EMPLOYEE: {
    id: 'employee',
    name: 'Membro do Time Interno',
    slug: 'employee',
    description: 'Acesso básico do membro do time interno',
    level: 'basic',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.FEED_VIEW,
      PERMISSIONS.TASKS_VIEW,
      PERMISSIONS.TASKS_CREATE,
      PERMISSIONS.TASKS_UPDATE,
      PERMISSIONS.TIMETRACKING_VIEW,
      PERMISSIONS.TIMETRACKING_CLOCK_IN,
      PERMISSIONS.TIMETRACKING_CLOCK_OUT,
      PERMISSIONS.NOTIFICATIONS_VIEW,
      PERMISSIONS.CHAT_VIEW,
      PERMISSIONS.CHAT_SEND,
      PERMISSIONS.PROFILE_VIEW,
      PERMISSIONS.PROFILE_UPDATE
    ],
    color: '#6b7280'
  },
  
  INTERN: {
    id: 'intern',
    name: 'Estagiário',
    slug: 'intern',
    description: 'Acesso limitado para estagiários',
    level: 'basic',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.FEED_VIEW,
      PERMISSIONS.TASKS_VIEW,
      PERMISSIONS.TIMETRACKING_VIEW,
      PERMISSIONS.TIMETRACKING_CLOCK_IN,
      PERMISSIONS.TIMETRACKING_CLOCK_OUT,
      PERMISSIONS.NOTIFICATIONS_VIEW,
      PERMISSIONS.CHAT_VIEW,
      PERMISSIONS.PROFILE_VIEW
    ],
    color: '#f59e0b'
  }
}

// Função para verificar se um role tem uma permissão específica
export const roleHasPermission = (roleSlug: string, permission: string): boolean => {
  const role = Object.values(ROLES).find(r => r.slug === roleSlug)
  return role?.permissions.includes(permission) || false
}

// Função para obter todas as permissões de um usuário baseado em seus roles
export const getUserPermissions = (userRoles: string[]): string[] => {
  const permissions = new Set<string>()
  
  userRoles.forEach(roleSlug => {
    const role = Object.values(ROLES).find(r => r.slug === roleSlug)
    if (role) {
      role.permissions.forEach(permission => permissions.add(permission))
    }
  })
  
  return Array.from(permissions)
}

// Função para verificar se um usuário pode acessar o módulo administrativo
export const canAccessAdmin = (userRoles: string[]): boolean => {
  return userRoles.some(roleSlug => 
    roleHasPermission(roleSlug, PERMISSIONS.ADMIN_ACCESS)
  )
}

// Função para verificar nível hierárquico
export const hasHigherOrEqualLevel = (userLevel: string, requiredLevel: string): boolean => {
  const levels = ['basic', 'operational', 'management', 'executive']
  const userLevelIndex = levels.indexOf(userLevel)
  const requiredLevelIndex = levels.indexOf(requiredLevel)
  
  return userLevelIndex >= requiredLevelIndex
}