import { AuditLog, AuditLogCreate, AuditLogFilter, AuditAction, AuditEntity } from '../types/audit'

// Tipos para auditoria aprimorada
export interface EnhancedAuditLog extends AuditLog {
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  compliance_tags: string[]
  data_classification: 'public' | 'internal' | 'confidential' | 'restricted'
  retention_category: 'standard' | 'extended' | 'permanent'
}

export interface AuditAlert {
  id: string
  trigger_type: 'suspicious_activity' | 'compliance_violation' | 'security_breach' | 'data_access'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  related_logs: string[]
  created_at: Date
  resolved_at?: Date
  resolved_by?: string
}

export interface ComplianceReport {
  period: { start: Date; end: Date }
  total_actions: number
  high_risk_actions: number
  compliance_violations: number
  data_access_summary: Record<string, number>
  user_activity_summary: Record<string, number>
  recommendations: string[]
}

class EnhancedAuditService {
  private readonly SENSITIVE_ACTIONS = [
    'rbac.user.delete',
    'rbac.role.create',
    'rbac.permission.assign',
    'finance.expenses.delete',
    'hr.collaborators.delete',
    'admin.docs.delete'
  ]

  private readonly HIGH_RISK_ENTITIES = [
    'user',
    'role',
    'permission',
    'expense',
    'collaborator'
  ]

  // Mock storage
  private mockLogs: EnhancedAuditLog[] = []
  private mockAlerts: AuditAlert[] = []

  async logActionWithRiskAnalysis(logData: AuditLogCreate): Promise<void> {
    try {
      const riskLevel = this.calculateRiskLevel(logData, null)
      const complianceTags = this.generateComplianceTags(logData)
      const dataClassification = this.classifyData(logData)
      const retentionCategory = this.determineRetentionCategory(logData)

      const enhancedLog: EnhancedAuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        actorId: logData.actorId,
        actorName: 'Sistema',
        actorRole: 'Sistema',
        action: logData.action,
        entity: logData.entity,
        entityId: logData.entityId,
        timestamp: new Date(),
        ip: '127.0.0.1',
        userAgent: 'Sistema',
        meta: logData.meta || {},
        success: logData.success,
        errorMessage: logData.errorMessage,
        risk_level: riskLevel,
        compliance_tags: complianceTags,
        data_classification: dataClassification,
        retention_category: retentionCategory
      }

      this.mockLogs.push(enhancedLog)

      // Verificar alertas de segurança
      await this.checkForSecurityAlerts(logData, riskLevel, logData.actorId)

      console.log('Enhanced audit log created:', enhancedLog.id)
    } catch (error) {
      console.error('Failed to create enhanced audit log for user:', logData.actorId, error)
      console.log('Fallback audit log created for user:', logData.actorId)
      await this.fallbackAuditLog(logData)
    }
  }

  private calculateRiskLevel(logData: AuditLogCreate, employee: any): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0

    // Ação sensível
    if (this.SENSITIVE_ACTIONS.includes(logData.action)) {
      riskScore += 3
    }

    // Entidade de alto risco
    if (this.HIGH_RISK_ENTITIES.includes(logData.entity)) {
      riskScore += 2
    }

    // Horário fora do expediente
    const hour = new Date().getHours()
    if (hour < 8 || hour > 18) {
      riskScore += 1
    }

    if (riskScore >= 5) return 'critical'
    if (riskScore >= 3) return 'high'
    if (riskScore >= 1) return 'medium'
    return 'low'
  }

  private generateComplianceTags(logData: AuditLogCreate): string[] {
    const tags: string[] = []

    if (logData.action.includes('delete')) {
      tags.push('data_deletion')
    }

    if (logData.entity === 'user') {
      tags.push('user_management', 'gdpr_relevant')
    }

    if (logData.action.includes('permission') || logData.action.includes('role')) {
      tags.push('access_control', 'security_relevant')
    }

    return tags
  }

  private classifyData(logData: AuditLogCreate): 'public' | 'internal' | 'confidential' | 'restricted' {
    if (this.SENSITIVE_ACTIONS.includes(logData.action)) {
      return 'restricted'
    }

    if (this.HIGH_RISK_ENTITIES.includes(logData.entity)) {
      return 'confidential'
    }

    if (logData.entity === 'user' || logData.entity === 'collaborator') {
      return 'confidential'
    }

    return 'internal'
  }

  private determineRetentionCategory(logData: AuditLogCreate): 'standard' | 'extended' | 'permanent' {
    if (this.SENSITIVE_ACTIONS.includes(logData.action)) {
      return 'permanent'
    }

    if (logData.action.includes('delete') || logData.action.includes('permission')) {
      return 'extended'
    }

    return 'standard'
  }

  private async checkForSecurityAlerts(logData: AuditLogCreate, riskLevel: string, userId: string): Promise<void> {
    if (riskLevel === 'critical' || riskLevel === 'high') {
      await this.createSecurityAlert({
        trigger_type: 'suspicious_activity',
        severity: riskLevel as 'high' | 'critical',
        description: `High-risk action detected: ${logData.action} on ${logData.entity}`,
        related_logs: [`audit_${Date.now()}`]
      })
    }
  }

  private async createSecurityAlert(alert: Omit<AuditAlert, 'id' | 'created_at'>): Promise<void> {
    const newAlert: AuditAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date(),
      ...alert
    }

    this.mockAlerts.push(newAlert)
    console.log('Security alert created:', newAlert.id)
  }

  private async fallbackAuditLog(logData: AuditLogCreate): Promise<void> {
    console.log('Fallback audit log:', logData)
  }

  async generateComplianceReport(startDate: Date, endDate: Date): Promise<ComplianceReport> {
    const filteredLogs = this.mockLogs.filter((log: EnhancedAuditLog) => 
      log.timestamp >= startDate && log.timestamp <= endDate
    )

    const highRiskActions = filteredLogs.filter((log: EnhancedAuditLog) => 
      log.risk_level === 'high' || log.risk_level === 'critical'
    ).length

    const complianceViolations = filteredLogs.filter((log: EnhancedAuditLog) =>
      log.compliance_tags.includes('security_relevant')
    ).length

    const dataAccessSummary = filteredLogs.reduce((acc: Record<string, number>, log: EnhancedAuditLog) => {
      acc[log.entity] = (acc[log.entity] || 0) + 1
      return acc
    }, {})

    const userActivitySummary = filteredLogs.reduce((acc: Record<string, number>, log: EnhancedAuditLog) => {
      acc[log.actorId] = (acc[log.actorId] || 0) + 1
      return acc
    }, {})

    return {
      period: { start: startDate, end: endDate },
      total_actions: filteredLogs.length,
      high_risk_actions: highRiskActions,
      compliance_violations: complianceViolations,
      data_access_summary: dataAccessSummary,
      user_activity_summary: userActivitySummary,
      recommendations: this.generateRecommendations(filteredLogs)
    }
  }

  private generateRecommendations(logs: any[]): string[] {
    const recommendations: string[] = []

    const highRiskCount = logs.filter(log => log.risk_level === 'high' || log.risk_level === 'critical').length
    if (highRiskCount > 10) {
      recommendations.push('Considere implementar controles de acesso mais rigorosos')
    }

    const afterHoursCount = logs.filter(log => {
      const hour = new Date(log.created_at).getHours()
      return hour < 8 || hour > 18
    }).length

    if (afterHoursCount > 5) {
      recommendations.push('Monitore atividades fora do horário comercial')
    }

    return recommendations
  }
}

export const enhancedAuditService = new EnhancedAuditService()