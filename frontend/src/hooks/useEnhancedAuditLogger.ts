import { useCallback } from 'react'
import { enhancedAuditService } from '../utils/enhancedAuditService'
import { AuditAction, AuditEntity } from '../types/audit'
import { useAuth } from '../contexts/AuthContext'

export const useEnhancedAuditLogger = () => {
  const { user } = useAuth()

  const logActionWithRiskAnalysis = useCallback(async (
    action: AuditAction,
    entity: AuditEntity,
    entityId: string,
    meta?: Record<string, any>,
    success: boolean = true,
    errorMessage?: string
  ) => {
    try {
      await enhancedAuditService.logActionWithRiskAnalysis({
        actorId: user?.id || 'unknown',
        action,
        entity,
        entityId,
        meta,
        success,
        errorMessage
      })
    } catch (error) {
      console.error('Erro ao registrar log de auditoria aprimorado:', error)
    }
  }, [user?.id])

  // Métodos específicos com análise de risco automática
  const logCriticalFinancialAction = useCallback(async (
    action: 'create' | 'update' | 'delete',
    entityType: 'expense' | 'launch',
    entityId: string,
    amount?: number,
    meta?: Record<string, any>
  ) => {
    const auditAction = `finance.${entityType}s.${action}` as AuditAction
    const enhancedMeta = {
      ...meta,
      amount,
      financial_impact: amount ? (amount > 10000 ? 'high' : amount > 1000 ? 'medium' : 'low') : 'unknown',
      requires_approval: amount && amount > 5000,
      compliance_required: true
    }
    
    await logActionWithRiskAnalysis(auditAction, entityType, entityId, enhancedMeta)
  }, [logActionWithRiskAnalysis])

  const logSensitiveHRAction = useCallback(async (
    action: 'create' | 'update' | 'delete' | 'view_salary' | 'view_personal_data',
    entityType: 'collaborator' | 'attendance',
    entityId: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = action === 'update' && entityType === 'attendance' 
      ? 'hr.attendance.update' 
      : `hr.collaborators.${action}` as AuditAction
    
    const enhancedMeta = {
      ...meta,
      data_sensitivity: action.includes('salary') ? 'restricted' : action.includes('personal') ? 'confidential' : 'internal',
      lgpd_applicable: true,
      retention_required: true
    }
    
    await logActionWithRiskAnalysis(auditAction, entityType, entityId, enhancedMeta)
  }, [logActionWithRiskAnalysis])

  const logSecurityAction = useCallback(async (
    action: 'create' | 'update' | 'delete' | 'assign' | 'revoke',
    entityType: 'role' | 'user' | 'permission',
    entityId: string,
    targetUserId?: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = entityType === 'permission' 
      ? `rbac.permission.${action}` 
      : `rbac.${entityType}.${action}` as AuditAction
    
    const enhancedMeta = {
      ...meta,
      target_user_id: targetUserId,
      security_impact: 'high',
      requires_review: true,
      iso27001_applicable: true
    }
    
    await logActionWithRiskAnalysis(auditAction, entityType, entityId, enhancedMeta)
  }, [logActionWithRiskAnalysis])

  const logDocumentAction = useCallback(async (
    action: 'upload' | 'delete' | 'download' | 'view',
    entityId: string,
    documentType?: string,
    fileSize?: number,
    meta?: Record<string, any>
  ) => {
    const auditAction = `admin.docs.${action}` as AuditAction
    
    const enhancedMeta = {
      ...meta,
      document_type: documentType,
      file_size: fileSize,
      data_classification: documentType?.includes('contract') ? 'confidential' : 'internal',
      retention_category: documentType?.includes('legal') ? 'permanent' : 'extended'
    }
    
    await logActionWithRiskAnalysis(auditAction, 'document', entityId, enhancedMeta)
  }, [logActionWithRiskAnalysis])

  const logAuthenticationAction = useCallback(async (
    action: 'login' | 'logout' | 'failed_login' | 'password_change' | 'mfa_enabled' | 'mfa_disabled',
    entityId: string,
    ipAddress?: string,
    deviceInfo?: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = `auth.${action}` as AuditAction
    
    const enhancedMeta = {
      ...meta,
      ip_address: ipAddress,
      device_info: deviceInfo,
      security_event: true,
      requires_monitoring: action.includes('failed') || action.includes('mfa'),
      risk_indicator: action === 'failed_login' ? 'medium' : 'low'
    }
    
    await logActionWithRiskAnalysis(auditAction, 'session', entityId, enhancedMeta)
  }, [logActionWithRiskAnalysis])

  const logDataAccessAction = useCallback(async (
    entity: AuditEntity,
    entityId: string,
    accessType: 'view' | 'export' | 'print' | 'share',
    dataVolume?: number,
    meta?: Record<string, any>
  ) => {
    const auditAction = `data.${entity}.${accessType}` as AuditAction
    
    const enhancedMeta = {
      ...meta,
      access_type: accessType,
      data_volume: dataVolume,
      privacy_impact: dataVolume && dataVolume > 100 ? 'high' : 'medium',
      lgpd_tracking: true,
      access_justification: meta?.justification || 'routine_access'
    }
    
    await logActionWithRiskAnalysis(auditAction, entity, entityId, enhancedMeta)
  }, [logActionWithRiskAnalysis])

  const logComplianceAction = useCallback(async (
    complianceType: 'lgpd' | 'sox' | 'iso27001' | 'gdpr',
    action: 'audit' | 'report' | 'violation' | 'remediation',
    entityId: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = `compliance.${complianceType}.${action}` as AuditAction
    
    const enhancedMeta = {
      ...meta,
      compliance_framework: complianceType.toUpperCase(),
      regulatory_requirement: true,
      audit_trail_required: true,
      retention_permanent: action === 'violation'
    }
    
    await logActionWithRiskAnalysis(auditAction, 'compliance', entityId, enhancedMeta)
  }, [logActionWithRiskAnalysis])

  const logSystemAction = useCallback(async (
    action: 'backup' | 'restore' | 'maintenance' | 'update' | 'configuration_change',
    entityId: string,
    systemComponent?: string,
    meta?: Record<string, any>
  ) => {
    const auditAction = `system.${action}` as AuditAction
    
    const enhancedMeta = {
      ...meta,
      system_component: systemComponent,
      operational_impact: action === 'maintenance' ? 'medium' : 'low',
      requires_notification: ['backup', 'restore', 'maintenance'].includes(action),
      change_management: action === 'configuration_change'
    }
    
    await logActionWithRiskAnalysis(auditAction, 'system', entityId, enhancedMeta)
  }, [logActionWithRiskAnalysis])

  // Método para gerar relatório de conformidade
  const generateComplianceReport = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      return await enhancedAuditService.generateComplianceReport(startDate, endDate)
    } catch (error) {
      console.error('Erro ao gerar relatório de conformidade:', error)
      throw error
    }
  }, [])

  // Método para verificar atividade suspeita
  const checkSuspiciousActivity = useCallback(async (userId?: string) => {
    // Implementar verificação de atividade suspeita
    // Pode incluir: múltiplos logins falhados, acesso fora do horário, etc.
    console.log('Verificando atividade suspeita para usuário:', userId || user?.id)
  }, [user?.id])

  return {
    // Método principal
    logActionWithRiskAnalysis,
    
    // Métodos específicos por categoria
    logCriticalFinancialAction,
    logSensitiveHRAction,
    logSecurityAction,
    logDocumentAction,
    logAuthenticationAction,
    logDataAccessAction,
    logComplianceAction,
    logSystemAction,
    
    // Utilitários
    generateComplianceReport,
    checkSuspiciousActivity
  }
}