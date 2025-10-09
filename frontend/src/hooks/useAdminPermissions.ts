import { usePermissions } from './usePermissions'
import type { RoleSlug } from '../types/auth'

export interface AdminPermissions {
  // Acesso geral ao painel administrativo
  canAccessAdmin: boolean
  canViewAdminDashboard: boolean
  
  // Gestão do time interno
  canViewEmployees: boolean
  canCreateEmployees: boolean
  canEditEmployees: boolean
  canDeleteEmployees: boolean
  
  // Gestão de departamentos
  canViewDepartments: boolean
  canCreateDepartments: boolean
  canEditDepartments: boolean
  canDeleteDepartments: boolean
  
  // Controle de ponto
  canViewTimeTracking: boolean
  canClockInOut: boolean
  canViewTimeReports: boolean
  canEditTimeEntries: boolean
  canApproveTimeEntries: boolean
  
  // Horários de trabalho
  canViewWorkSchedules: boolean
  canCreateWorkSchedules: boolean
  canEditWorkSchedules: boolean
  canDeleteWorkSchedules: boolean
  
  // Relatórios e análises
  canViewReports: boolean
  canExportReports: boolean
  
  // Informações do usuário
  userRole: RoleSlug | null
  isHRManager: boolean
  isHRAnalyst: boolean
  isSuperAdmin: boolean
  isManager: boolean
}

export function useAdminPermissions(): AdminPermissions {
  const { hasPermission, hasAnyPermission, hasRole, user } = usePermissions()
  
  // Verificar role do usuário
  const userRole = user?.role?.slug || null
  const isHRManager = userRole === 'gerente_rh'
  const isHRAnalyst = userRole === 'analista_rh'
  const isSuperAdmin = userRole === 'super_admin'
  const isManager = userRole?.includes('gerente') || false
  
  // Permissões baseadas em roles - implementação simplificada
  const canAccessAdmin = isSuperAdmin || isHRManager || isHRAnalyst
  const canViewAdminDashboard = canAccessAdmin
  
  // Permissões do time interno
  const canViewEmployees = canAccessAdmin
  const canCreateEmployees = isSuperAdmin || isHRManager
  const canEditEmployees = isSuperAdmin || isHRManager
  const canDeleteEmployees = isSuperAdmin
  
  // Permissões de departamentos
  const canViewDepartments = canAccessAdmin || isManager
  const canCreateDepartments = isSuperAdmin || isHRManager
  const canEditDepartments = isSuperAdmin || isHRManager
  const canDeleteDepartments = isSuperAdmin
  
  // Permissões de controle de ponto
  const canViewTimeTracking = true // Todos podem ver seu próprio ponto
  const canClockInOut = true // Todos podem bater ponto
  const canViewTimeReports = canAccessAdmin || isManager
  const canEditTimeEntries = isSuperAdmin || isHRManager
  const canApproveTimeEntries = isSuperAdmin || isHRManager || isManager
  
  // Permissões de horários de trabalho
  const canViewWorkSchedules = canAccessAdmin || isManager
  const canCreateWorkSchedules = isSuperAdmin || isHRManager
  const canEditWorkSchedules = isSuperAdmin || isHRManager
  const canDeleteWorkSchedules = isSuperAdmin
  
  // Permissões de relatórios
  const canViewReports = canAccessAdmin || isManager
  const canExportReports = isSuperAdmin || isHRManager
  
  return {
    // Acesso geral
    canAccessAdmin,
    canViewAdminDashboard,
    
    // Time interno
    canViewEmployees,
    canCreateEmployees,
    canEditEmployees,
    canDeleteEmployees,
    
    // Departamentos
    canViewDepartments,
    canCreateDepartments,
    canEditDepartments,
    canDeleteDepartments,
    
    // Controle de ponto
    canViewTimeTracking,
    canClockInOut,
    canViewTimeReports,
    canEditTimeEntries,
    canApproveTimeEntries,
    
    // Horários de trabalho
    canViewWorkSchedules,
    canCreateWorkSchedules,
    canEditWorkSchedules,
    canDeleteWorkSchedules,
    
    // Relatórios
    canViewReports,
    canExportReports,
    
    // Informações do usuário
    userRole: userRole as RoleSlug | null,
    isHRManager,
    isHRAnalyst,
    isSuperAdmin,
    isManager
  }
}

// Hook para verificar hierarquia (se o usuário pode gerenciar outro usuário)
export function useCanManageUser(targetUserRole: RoleSlug): boolean {
  const { user } = usePermissions()
  const currentUserRole = user?.role?.slug
  
  if (!currentUserRole || !targetUserRole) return false
  
  // Super admin pode gerenciar todos
  if (currentUserRole === 'super_admin') return true
  
  // HR Manager pode gerenciar analistas e membros do time interno
  if (currentUserRole === 'gerente_rh') {
    return ['analista_rh', 'colaborador', 'estagiario'].includes(targetUserRole)
  }
  
  // Gerentes podem gerenciar apenas membros do time interno e estagiários
  if (currentUserRole.includes('gerente')) {
    return ['colaborador', 'estagiario'].includes(targetUserRole)
  }
  
  return false
}

// Hook para verificar se o usuário pode acessar dados de um departamento
export function useCanAccessDepartment(departmentId: string): boolean {
  const { user } = usePermissions()
  const { canViewDepartments, isSuperAdmin, isHRManager } = useAdminPermissions()
  
  // Super admin e HR Manager podem acessar todos os departamentos
  if (isSuperAdmin || isHRManager) return true
  
  // Verificar se o usuário tem permissão geral para ver departamentos
  if (!canViewDepartments) return false
  
  // Managers só podem ver seu próprio departamento
  // TODO: Implementar lógica para verificar se o usuário pertence ao departamento
  return true
}