import { supabase } from '../config/supabase'
import { AuditLog, AuditAction } from '../types/audit'

export interface SecurityAlert {
  id: string
  type: 'suspicious_activity' | 'data_breach' | 'unauthorized_access' | 'compliance_violation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  userId?: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, any>
  timestamp: Date
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
}

export interface ComplianceRule {
  id: string
  name: string
  description: string
  regulation: 'LGPD' | 'GDPR' | 'SOX' | 'ISO27001'
  category: 'data_protection' | 'access_control' | 'audit_trail' | 'retention'
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  conditions: Record<string, any>
}

export interface SecurityMetrics {
  totalAlerts: number
  criticalAlerts: number
  resolvedAlerts: number
  averageResolutionTime: number
  complianceScore: number
  riskScore: number
  topThreats: Array<{ type: string; count: number }>
  complianceViolations: Array<{ regulation: string; count: number }>
}

class SecurityValidationService {
  private readonly SUSPICIOUS_PATTERNS = {
    MULTIPLE_FAILED_LOGINS: 5,
    RAPID_ACTIONS: 10, // ações por minuto
    UNUSUAL_HOURS: { start: 22, end: 6 }, // 22h às 6h
    BULK_DATA_ACCESS: 100, // registros acessados
    PRIVILEGE_ESCALATION: ['rbac.role.create', 'rbac.permission.assign'],
    SENSITIVE_DATA_ACCESS: ['hr.collaborators.view_salary', 'data.collaborator.export']
  }

  private readonly COMPLIANCE_RULES: ComplianceRule[] = [
    {
      id: 'lgpd-data-retention',
      name: 'Retenção de Dados LGPD',
      description: 'Dados pessoais devem ser mantidos apenas pelo tempo necessário',
      regulation: 'LGPD',
      category: 'retention',
      severity: 'high',
      enabled: true,
      conditions: { maxRetentionDays: 2555 } // 7 anos
    },
    {
      id: 'lgpd-consent-tracking',
      name: 'Rastreamento de Consentimento LGPD',
      description: 'Todas as ações com dados pessoais devem ter consentimento registrado',
      regulation: 'LGPD',
      category: 'data_protection',
      severity: 'critical',
      enabled: true,
      conditions: { requireConsent: true }
    },
    {
      id: 'sox-financial-audit',
      name: 'Auditoria Financeira SOX',
      description: 'Todas as transações financeiras devem ser auditadas',
      regulation: 'SOX',
      category: 'audit_trail',
      severity: 'critical',
      enabled: true,
      conditions: { auditFinancialActions: true }
    },
    {
      id: 'iso27001-access-control',
      name: 'Controle de Acesso ISO 27001',
      description: 'Acesso a sistemas deve ser controlado e monitorado',
      regulation: 'ISO27001',
      category: 'access_control',
      severity: 'high',
      enabled: true,
      conditions: { requireMFA: true, sessionTimeout: 3600 }
    }
  ]

  // Análise de segurança em tempo real
  async analyzeSecurityEvent(auditLog: AuditLog): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = []

    try {
      // Verificar padrões suspeitos
      const suspiciousAlerts = await this.detectSuspiciousActivity(auditLog)
      alerts.push(...suspiciousAlerts)

      // Verificar violações de conformidade
      const complianceAlerts = await this.checkComplianceViolations(auditLog)
      alerts.push(...complianceAlerts)

      // Verificar acesso não autorizado
      const accessAlerts = await this.detectUnauthorizedAccess(auditLog)
      alerts.push(...accessAlerts)

      // Salvar alertas no banco
      if (alerts.length > 0) {
        await this.saveSecurityAlerts(alerts)
      }

      return alerts
    } catch (error) {
      console.error('Erro na análise de segurança:', error)
      return []
    }
  }

  // Detectar atividades suspeitas
  private async detectSuspiciousActivity(auditLog: AuditLog): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = []

    // Múltiplas tentativas de login falhadas
    if (auditLog.action === 'auth.failed_login') {
      const recentFailures = await this.getRecentFailedLogins(auditLog.actorId)
      if (recentFailures >= this.SUSPICIOUS_PATTERNS.MULTIPLE_FAILED_LOGINS) {
        alerts.push({
          id: `suspicious-${Date.now()}-${Math.random()}`,
          type: 'suspicious_activity',
          severity: 'high',
          title: 'Múltiplas tentativas de login falhadas',
          description: `Usuário ${auditLog.actorName} teve ${recentFailures} tentativas de login falhadas`,
          userId: auditLog.actorId,
          timestamp: new Date(),
          resolved: false,
          metadata: { failureCount: recentFailures }
        })
      }
    }

    // Ações em horários incomuns
    const hour = new Date(auditLog.timestamp).getHours()
    if (hour >= this.SUSPICIOUS_PATTERNS.UNUSUAL_HOURS.start || 
        hour <= this.SUSPICIOUS_PATTERNS.UNUSUAL_HOURS.end) {
      alerts.push({
        id: `unusual-hours-${Date.now()}-${Math.random()}`,
        type: 'suspicious_activity',
        severity: 'medium',
        title: 'Atividade em horário incomum',
        description: `Ação ${auditLog.action} realizada às ${hour}h`,
        userId: auditLog.actorId,
        timestamp: new Date(),
        resolved: false,
        metadata: { hour, action: auditLog.action }
      })
    }

    // Escalação de privilégios
    if (this.SUSPICIOUS_PATTERNS.PRIVILEGE_ESCALATION.includes(auditLog.action as AuditAction)) {
      alerts.push({
        id: `privilege-escalation-${Date.now()}-${Math.random()}`,
        type: 'suspicious_activity',
        severity: 'critical',
        title: 'Tentativa de escalação de privilégios',
        description: `Usuário ${auditLog.actorName} tentou executar ação privilegiada: ${auditLog.action}`,
        userId: auditLog.actorId,
        timestamp: new Date(),
        resolved: false,
        metadata: { action: auditLog.action }
      })
    }

    // Acesso a dados sensíveis
    if (this.SUSPICIOUS_PATTERNS.SENSITIVE_DATA_ACCESS.includes(auditLog.action as AuditAction)) {
      alerts.push({
        id: `sensitive-access-${Date.now()}-${Math.random()}`,
        type: 'suspicious_activity',
        severity: 'high',
        title: 'Acesso a dados sensíveis',
        description: `Acesso a dados sensíveis: ${auditLog.action}`,
        userId: auditLog.actorId,
        entityType: auditLog.entity,
        entityId: auditLog.entityId,
        timestamp: new Date(),
        resolved: false,
        metadata: { action: auditLog.action }
      })
    }

    return alerts
  }

  // Verificar violações de conformidade
  private async checkComplianceViolations(auditLog: AuditLog): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = []

    for (const rule of this.COMPLIANCE_RULES) {
      if (!rule.enabled) continue

      try {
        const violation = await this.evaluateComplianceRule(rule, auditLog)
        if (violation) {
          alerts.push({
            id: `compliance-${Date.now()}-${Math.random()}`,
            type: 'compliance_violation',
            severity: rule.severity,
            title: `Violação ${rule.regulation}: ${rule.name}`,
            description: violation.description,
            userId: auditLog.actorId,
            entityType: auditLog.entity,
            entityId: auditLog.entityId,
            timestamp: new Date(),
            resolved: false,
            metadata: { 
              rule: rule.id, 
              regulation: rule.regulation,
              violation: violation.details
            }
          })
        }
      } catch (error) {
        console.error(`Erro ao avaliar regra ${rule.id}:`, error)
      }
    }

    return alerts
  }

  // Detectar acesso não autorizado
  private async detectUnauthorizedAccess(auditLog: AuditLog): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = []

    // Verificar se o usuário tem permissão para a ação
    const hasPermission = await this.checkUserPermission(auditLog.actorId, auditLog.action)
    if (!hasPermission) {
      alerts.push({
        id: `unauthorized-${Date.now()}-${Math.random()}`,
        type: 'unauthorized_access',
        severity: 'critical',
        title: 'Acesso não autorizado',
        description: `Usuário ${auditLog.actorName} tentou executar ação sem permissão: ${auditLog.action}`,
        userId: auditLog.actorId,
        timestamp: new Date(),
        resolved: false,
        metadata: { action: auditLog.action }
      })
    }

    return alerts
  }

  // Avaliar regra de conformidade específica
  private async evaluateComplianceRule(rule: ComplianceRule, auditLog: AuditLog): Promise<{ description: string; details: any } | null> {
    switch (rule.id) {
      case 'lgpd-data-retention':
        return await this.checkDataRetention(auditLog, rule.conditions.maxRetentionDays)
      
      case 'lgpd-consent-tracking':
        return await this.checkConsentTracking(auditLog)
      
      case 'sox-financial-audit':
        return await this.checkFinancialAudit(auditLog)
      
      case 'iso27001-access-control':
        return await this.checkAccessControl(auditLog, rule.conditions)
      
      default:
        return null
    }
  }

  // Verificações específicas de conformidade
  private async checkDataRetention(auditLog: AuditLog, maxDays: number): Promise<{ description: string; details: any } | null> {
    if (auditLog.action.includes('delete') && auditLog.entity === 'collaborator') {
      // Verificar se os dados estão sendo mantidos além do período permitido
      const { data: oldRecords } = await supabase
        .from('audit_logs')
        .select('timestamp')
        .eq('entity', 'collaborator')
        .eq('entity_id', auditLog.entityId)
        .order('timestamp', { ascending: true })
        .limit(1)

      if (oldRecords && oldRecords.length > 0) {
        const daysDiff = Math.floor((Date.now() - new Date(oldRecords[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff > maxDays) {
          return {
            description: `Dados mantidos por ${daysDiff} dias, excedendo o limite de ${maxDays} dias`,
            details: { daysDiff, maxDays, entityId: auditLog.entityId }
          }
        }
      }
    }
    return null
  }

  private async checkConsentTracking(auditLog: AuditLog): Promise<{ description: string; details: any } | null> {
    const personalDataActions = ['hr.collaborators.view_personal_data', 'data.collaborator.export']
    
    if (personalDataActions.includes(auditLog.action)) {
      // Verificar se há consentimento registrado
      const hasConsent = auditLog.meta?.consent || false
      if (!hasConsent) {
        return {
          description: 'Acesso a dados pessoais sem consentimento registrado',
          details: { action: auditLog.action, entityId: auditLog.entityId }
        }
      }
    }
    return null
  }

  private async checkFinancialAudit(auditLog: AuditLog): Promise<{ description: string; details: any } | null> {
    const financialActions = ['finance.expenses.create', 'finance.expenses.update', 'finance.launches.create']
    
    if (financialActions.includes(auditLog.action) && !auditLog.success) {
      return {
        description: 'Transação financeira falhada não auditada adequadamente',
        details: { action: auditLog.action, error: auditLog.errorMessage }
      }
    }
    return null
  }

  private async checkAccessControl(auditLog: AuditLog, conditions: any): Promise<{ description: string; details: any } | null> {
    // Verificar se ações sensíveis requerem MFA
    const sensitiveActions = ['rbac.role.create', 'rbac.permission.assign', 'admin.settings.update']
    
    if (sensitiveActions.includes(auditLog.action)) {
      const hasMFA = auditLog.meta?.mfaVerified || false
      if (conditions.requireMFA && !hasMFA) {
        return {
          description: 'Ação sensível executada sem verificação MFA',
          details: { action: auditLog.action, requireMFA: conditions.requireMFA }
        }
      }
    }
    return null
  }

  // Métodos auxiliares
  private async getRecentFailedLogins(userId: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id')
      .eq('actor_id', userId)
      .eq('action', 'auth.failed_login')
      .gte('timestamp', oneHourAgo.toISOString())

    if (error) {
      console.error('Erro ao buscar logins falhados:', error)
      return 0
    }

    return data?.length || 0
  }

  private async checkUserPermission(userId: string, action: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_user_permission', {
        user_id: userId,
        permission_name: action
      })

      if (error) {
        console.error('Erro ao verificar permissão:', error)
        return false
      }

      return data || false
    } catch (error) {
      console.error('Erro ao verificar permissão:', error)
      return false
    }
  }

  private async saveSecurityAlerts(alerts: SecurityAlert[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .insert(alerts.map(alert => ({
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          user_id: alert.userId,
          entity_type: alert.entityType,
          entity_id: alert.entityId,
          metadata: alert.metadata,
          timestamp: alert.timestamp.toISOString(),
          resolved: alert.resolved,
          resolved_by: alert.resolvedBy,
          resolved_at: alert.resolvedAt?.toISOString()
        })))

      if (error) {
        console.error('Erro ao salvar alertas de segurança:', error)
      }
    } catch (error) {
      console.error('Erro ao salvar alertas de segurança:', error)
    }
  }

  // Métodos públicos para consulta
  async getSecurityAlerts(filters: {
    type?: SecurityAlert['type']
    severity?: SecurityAlert['severity']
    resolved?: boolean
    userId?: string
    limit?: number
  } = {}): Promise<SecurityAlert[]> {
    try {
      let query = supabase
        .from('security_alerts')
        .select('*')
        .order('timestamp', { ascending: false })

      if (filters.type) query = query.eq('type', filters.type)
      if (filters.severity) query = query.eq('severity', filters.severity)
      if (filters.resolved !== undefined) query = query.eq('resolved', filters.resolved)
      if (filters.userId) query = query.eq('user_id', filters.userId)
      if (filters.limit) query = query.limit(filters.limit)

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar alertas de segurança:', error)
        return []
      }

      return data?.map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        userId: alert.user_id,
        entityType: alert.entity_type,
        entityId: alert.entity_id,
        metadata: alert.metadata,
        timestamp: new Date(alert.timestamp),
        resolved: alert.resolved,
        resolvedBy: alert.resolved_by,
        resolvedAt: alert.resolved_at ? new Date(alert.resolved_at) : undefined
      })) || []
    } catch (error) {
      console.error('Erro ao buscar alertas de segurança:', error)
      return []
    }
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const { data: alerts } = await supabase
        .from('security_alerts')
        .select('type, severity, resolved, timestamp, resolved_at')

      const totalAlerts = alerts?.length || 0
      const criticalAlerts = alerts?.filter(a => a.severity === 'critical').length || 0
      const resolvedAlerts = alerts?.filter(a => a.resolved).length || 0

      // Calcular tempo médio de resolução
      const resolvedWithTime = alerts?.filter(a => a.resolved && a.resolved_at) || []
      const avgResolutionTime = resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((sum, alert) => {
            const resolutionTime = new Date(alert.resolved_at).getTime() - new Date(alert.timestamp).getTime()
            return sum + resolutionTime
          }, 0) / resolvedWithTime.length / (1000 * 60 * 60) // em horas
        : 0

      // Top ameaças
      const threatCounts = alerts?.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const topThreats = Object.entries(threatCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Score de conformidade (simplificado)
      const complianceScore = totalAlerts > 0 ? Math.max(0, 100 - (criticalAlerts * 10)) : 100

      // Score de risco (baseado em alertas não resolvidos)
      const unresolvedAlerts = totalAlerts - resolvedAlerts
      const riskScore = Math.min(100, unresolvedAlerts * 5)

      return {
        totalAlerts,
        criticalAlerts,
        resolvedAlerts,
        averageResolutionTime: Math.round(avgResolutionTime * 100) / 100,
        complianceScore,
        riskScore,
        topThreats,
        complianceViolations: [] // Implementar se necessário
      }
    } catch (error) {
      console.error('Erro ao calcular métricas de segurança:', error)
      return {
        totalAlerts: 0,
        criticalAlerts: 0,
        resolvedAlerts: 0,
        averageResolutionTime: 0,
        complianceScore: 100,
        riskScore: 0,
        topThreats: [],
        complianceViolations: []
      }
    }
  }

  async resolveAlert(alertId: string, resolvedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({
          resolved: true,
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) {
        console.error('Erro ao resolver alerta:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao resolver alerta:', error)
      return false
    }
  }
}

export const securityValidationService = new SecurityValidationService()