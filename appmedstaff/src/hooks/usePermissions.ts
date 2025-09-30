import { useAuthStore } from '../stores/authStore'
import { PermissionSlug } from '../types/auth'

export const usePermissions = () => {
  const { hasPermission, hasAnyPermission, hasRole, user } = useAuthStore()

  return {
    hasPermission,
    hasAnyPermission,
    hasRole,
    user,
    
    // Verificações específicas por módulo
    canViewDashboard: () => {
      console.log('🔍 usePermissions - canViewDashboard chamado, hasPermission result:', hasPermission('dashboard.view'))
      // Temporariamente sempre retorna true para debug
      return true
    },
    canViewFeed: () => hasPermission('feed.view'),
    canViewNotifications: () => hasPermission('notifications.view'),
    
    // Tarefas
    canViewTasks: () => hasPermission('tasks.view'),
    canCreateTasks: () => hasPermission('tasks.create'),
    canUpdateTasks: () => hasPermission('tasks.update'),
    canDeleteTasks: () => hasPermission('tasks.delete'),
    
    // Contatos
    canViewContacts: () => hasPermission('contacts.read'),
    canCreateContacts: () => hasPermission('contacts.create'),
    canUpdateContacts: () => hasPermission('contacts.update'),
    canDeleteContacts: () => hasPermission('contacts.delete'),
    canViewInternalContacts: () => hasPermission('contacts.internal.view'),
    canViewInternalTeam: () => hasPermission('contacts.internal.view'),
    
    // CRM
    canAccessCRMForms: () => hasPermission('crm.forms.access'),
    
    // Atividades
    canViewCommercialActivities: () => hasPermission('activities.commercial.view'),
    canCreateCommercialActivities: () => hasPermission('activities.commercial.create'),
    canUpdateCommercialActivities: () => hasPermission('activities.commercial.update'),
    canDeleteCommercialActivities: () => hasPermission('activities.commercial.delete'),

    canViewOperationalActivities: () => hasPermission('activities.operational.view'),
    canCreateOperationalActivities: () => hasPermission('activities.operational.create'),
    canUpdateOperationalActivities: () => hasPermission('activities.operational.update'),
    canDeleteOperationalActivities: () => hasPermission('activities.operational.delete'),

    canViewBenefitsActivities: () => hasPermission('activities.benefits.view'),
    canCreateBenefitsActivities: () => hasPermission('activities.benefits.create'),
    canUpdateBenefitsActivities: () => hasPermission('activities.benefits.update'),
    canDeleteBenefitsActivities: () => hasPermission('activities.benefits.delete'),

    // Organogram
    canViewOrgChart: () => hasPermission('org.chart.view'),
    canUpdateOrgChart: () => hasRole('gerente_rh') || hasRole('super_admin'),
    canDeleteOrgChart: () => hasRole('gerente_rh') || hasRole('super_admin'),
    
    // Relationship
    canViewCollaborators: () => hasPermission('relationship.collaborators.read'),
    canUpdateCollaborators: () => hasPermission('relationship.collaborators.update'),
    canViewClients: () => hasPermission('relationship.clients.read'),
    canUpdateClients: () => hasPermission('relationship.clients.update'),
    canViewSAC: () => hasPermission('relationship.sac.read'),
    canRespondSAC: () => hasPermission('relationship.sac.respond'),
    
    // Gestão de atividades
    canManageCommercialActivities: () => hasAnyPermission([
      'activities.commercial.create',
      'activities.commercial.update',
      'activities.commercial.delete'
    ]),
    
    canManageOperationalActivities: () => hasAnyPermission([
      'activities.operational.create',
      'activities.operational.update',
      'activities.operational.delete'
    ]),
    
    // Empresa
    canViewFinancialData: () => hasPermission('finance.dre.view'),
    canManageFinances: () => hasAnyPermission([
      'finance.expenses.create',
      'finance.expenses.update',
      'finance.launches.create',
      'finance.launches.update'
    ]),
    
    canManageHR: () => hasAnyPermission([
      'hr.attendance.read',
      'hr.attendance.update',
      'relationship.collaborators.read',
      'relationship.collaborators.update'
    ]),
    
    // RBAC
    canManageRoles: () => hasPermission('rbac.role.manage'),
    canManageUsers: () => hasPermission('rbac.user.manage'),
    
    // Auditoria
    canViewAuditLogs: () => hasPermission('audit.read'),
    
    // Verificações de nível
    isStrategicLevel: () => user?.role.level === 'strategic',
    isManagerialLevel: () => user?.role.level === 'managerial',
    isTacticalLevel: () => user?.role.level === 'tactical',
    isOperationalLevel: () => user?.role.level === 'operational',
    isSupportLevel: () => user?.role.level === 'support'
  }
}