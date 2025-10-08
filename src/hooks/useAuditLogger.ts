import { useCallback } from 'react'
import { auditService } from '../services/auditService'
import { AuditAction, AuditEntity } from '../types/audit'
import { useAuth } from './useAuth'

export const useAuditLogger = () => {
  const { user } = useAuth()

  const logAction = useCallback(async (
    action: AuditAction,
    entity: AuditEntity,
    entityId: string,
    meta?: Record<string, any>,
    success: boolean = true,
    errorMessage?: string
  ) => {
    try {
      await auditService.logAction({
        actorId: user?.id || 'unknown',
        action,
        entity,
        entityId,
        meta,
        success,
        errorMessage
      })
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error)
    }
  }, [user?.id])

  // Métodos específicos para ações comuns
  const logFinancialAction = useCallback(async (
    action: 'create' | 'update' | 'delete',
    entityType: 'expense' | 'launch',
    entityId: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = `finance.${entityType}s.${action}` as AuditAction
    await logAction(auditAction, entityType, entityId, meta)
  }, [logAction])

  const logHRAction = useCallback(async (
    action: 'create' | 'update' | 'delete',
    entityType: 'collaborator' | 'attendance',
    entityId: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = action === 'update' && entityType === 'attendance' 
      ? 'hr.attendance.update' 
      : `hr.collaborators.${action}` as AuditAction
    await logAction(auditAction, entityType, entityId, meta)
  }, [logAction])

  const logDocumentAction = useCallback(async (
    action: 'upload' | 'delete' | 'download',
    entityId: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = `admin.docs.${action}` as AuditAction
    await logAction(auditAction, 'document', entityId, meta)
  }, [logAction])

  const logSACAction = useCallback(async (
    action: 'respond' | 'view',
    entityId: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = `relationship.sac.${action}` as AuditAction
    await logAction(auditAction, 'sac_ticket', entityId, meta)
  }, [logAction])

  const logRBACAction = useCallback(async (
    action: 'create' | 'update' | 'delete',
    entityType: 'role' | 'user',
    entityId: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = `rbac.${entityType}.${action}` as AuditAction
    await logAction(auditAction, entityType, entityId, meta)
  }, [logAction])

  const logPermissionAction = useCallback(async (
    action: 'assign' | 'revoke',
    entityId: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = `rbac.permission.${action}` as AuditAction
    await logAction(auditAction, 'permission', entityId, meta)
  }, [logAction])

  const logContactAction = useCallback(async (
    action: 'create' | 'update' | 'delete',
    entityType: 'contact' | 'lead' | 'client' | 'partner',
    entityId: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = `contacts.${action}` as AuditAction
    await logAction(auditAction, entityType, entityId, meta)
  }, [logAction])

  const logInternalContactView = useCallback(async (
    entityId: string,
    meta?: Record<string, any>
  ) => {
    await logAction('contacts.internal.view', 'contact', entityId, meta)
  }, [logAction])

  const logActivityAction = useCallback(async (
    module: 'commercial' | 'operational',
    action: 'create' | 'update' | 'delete',
    entityId: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = `activities.${module}.${action}` as AuditAction
    await logAction(auditAction, 'activity', entityId, meta)
  }, [logAction])

  const logAuthAction = useCallback(async (
    action: 'login' | 'logout' | 'failed_login',
    entityId: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = `auth.${action}` as AuditAction
    await logAction(auditAction, 'session', entityId, meta)
  }, [logAction])

  return {
    logAction,
    logFinancialAction,
    logHRAction,
    logDocumentAction,
    logSACAction,
    logRBACAction,
    logPermissionAction,
    logContactAction,
    logInternalContactView,
    logActivityAction,
    logAuthAction
  }
}