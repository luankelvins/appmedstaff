// Utilitário para verificação de permissões baseado no RBAC
export const hasPermission = (permission: string): boolean => {
  // Mock implementation - em produção, isso viria do contexto de autenticação
  // e verificaria as permissões do usuário atual
  
  // Para desenvolvimento, permitir todas as permissões
  console.log('Checking permission:', permission)
  return true
  
  // Implementação real seria algo como:
  // const user = getCurrentUser()
  // return user?.permissions?.includes(permission) || user?.role === 'SuperAdmin'
}

export const hasAnyPermission = (permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(permission))
}

export const hasAllPermissions = (permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(permission))
}

// Permissões disponíveis no sistema
export const PERMISSIONS = {
  // Gerais
  DASHBOARD_VIEW: 'dashboard.view',
  FEED_VIEW: 'feed.view',
  TASKS_VIEW: 'tasks.view',
  TASKS_CREATE: 'tasks.create',
  TASKS_UPDATE: 'tasks.update',
  TASKS_DELETE: 'tasks.delete',
  NOTIFICATIONS_VIEW: 'notifications.view',
  CHAT_VIEW: 'chat.view',
  CHAT_SEND: 'chat.send',
  PROFILE_VIEW: 'profile.view',
  PROFILE_UPDATE: 'profile.update',

  // Contatos
  CONTACTS_READ: 'contacts.read',
  CONTACTS_CREATE: 'contacts.create',
  CONTACTS_UPDATE: 'contacts.update',
  CONTACTS_DELETE: 'contacts.delete',
  CONTACTS_INTERNAL_VIEW: 'contacts.internal.view',

  // CRM & Atividades
  CRM_FORMS_ACCESS: 'crm.forms.access',
  ACTIVITIES_COMMERCIAL: 'activities.commercial.*',
  ACTIVITIES_OPERATIONAL: 'activities.operational.*',
  ACTIVITIES_BENEFITS: 'activities.benefits.*',
  ACTIVITIES_BUSINESS: 'activities.business.*',
  ACTIVITIES_PARTNERS: 'activities.partners.*',

  // Empresa
  ORG_CHART_VIEW: 'org.chart.view',
  ADMIN_DOCS_READ: 'admin.docs.read',
  ADMIN_DOCS_UPLOAD: 'admin.docs.upload',
  ADMIN_DOCS_DELETE: 'admin.docs.delete',
  HR_ATTENDANCE_READ: 'hr.attendance.read',
  HR_ATTENDANCE_UPDATE: 'hr.attendance.update',
  FINANCE_EXPENSES_CREATE: 'finance.expenses.create',
  FINANCE_EXPENSES_UPDATE: 'finance.expenses.update',
  FINANCE_EXPENSES_DELETE: 'finance.expenses.delete',
  FINANCE_LAUNCHES_CREATE: 'finance.launches.create',
  FINANCE_LAUNCHES_UPDATE: 'finance.launches.update',
  FINANCE_LAUNCHES_DELETE: 'finance.launches.delete',
  FINANCE_DRE_VIEW: 'finance.dre.view',
  RELATIONSHIP_COLLABORATORS_READ: 'relationship.collaborators.read',
  RELATIONSHIP_COLLABORATORS_UPDATE: 'relationship.collaborators.update',
  RELATIONSHIP_CLIENTS_READ: 'relationship.clients.read',
  RELATIONSHIP_CLIENTS_UPDATE: 'relationship.clients.update',
  RELATIONSHIP_SAC_READ: 'relationship.sac.read',
  RELATIONSHIP_SAC_RESPOND: 'relationship.sac.respond',

  // Auditoria & RBAC
  RBAC_ROLE_MANAGE: 'rbac.role.manage',
  RBAC_USER_MANAGE: 'rbac.user.manage',
  AUDIT_READ: 'audit.read',

  // Administração e RH
  ADMIN_ACCESS: 'admin.access',
  ADMIN_DASHBOARD_VIEW: 'admin.dashboard.view',
  ADMIN_EMPLOYEES_VIEW: 'admin.employees.view',
  ADMIN_EMPLOYEES_CREATE: 'admin.employees.create',
  ADMIN_EMPLOYEES_UPDATE: 'admin.employees.update',
  ADMIN_EMPLOYEES_DELETE: 'admin.employees.delete',
  ADMIN_DEPARTMENTS_VIEW: 'admin.departments.view',
  ADMIN_DEPARTMENTS_CREATE: 'admin.departments.create',
  ADMIN_DEPARTMENTS_UPDATE: 'admin.departments.update',
  ADMIN_DEPARTMENTS_DELETE: 'admin.departments.delete',
  
  // Controle de Ponto
  TIMETRACKING_VIEW: 'timetracking.view',
  TIMETRACKING_CLOCK_IN: 'timetracking.clock.in',
  TIMETRACKING_CLOCK_OUT: 'timetracking.clock.out',
  TIMETRACKING_REPORTS_VIEW: 'timetracking.reports.view',
  TIMETRACKING_REPORTS_EXPORT: 'timetracking.reports.export',
  TIMETRACKING_ADMIN: 'timetracking.admin',
  TIMETRACKING_SCHEDULES_MANAGE: 'timetracking.schedules.manage',
  
  // Horários de Trabalho
  WORK_SCHEDULES_VIEW: 'work.schedules.view',
  WORK_SCHEDULES_CREATE: 'work.schedules.create',
  WORK_SCHEDULES_UPDATE: 'work.schedules.update',
  WORK_SCHEDULES_DELETE: 'work.schedules.delete'
} as const