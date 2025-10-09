// Mock implementation - Supabase removed
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
    }
  ]

  private mockAlerts: SecurityAlert[] = [
    {
      id: '1',
      type: 'suspicious_activity',
      severity: 'medium',
      title: 'Múltiplas tentativas de login',
      description: 'Usuário tentou fazer login 6 vezes em 5 minutos',
      userId: 'user1',
      timestamp: new Date(),
      resolved: false
    }
  ]

  async analyzeSecurityEvent(auditLog: AuditLog): Promise<SecurityAlert[]> {
    console.log('Analyzing security event:', auditLog)
    
    const alerts: SecurityAlert[] = []
    
    // Detectar atividade suspeita
    const suspiciousAlerts = await this.detectSuspiciousActivity(auditLog)
    alerts.push(...suspiciousAlerts)
    
    // Verificar violações de compliance
    const complianceAlerts = await this.checkComplianceViolations(auditLog)
    alerts.push(...complianceAlerts)
    
    // Detectar acesso não autorizado
    const unauthorizedAlerts = await this.detectUnauthorizedAccess(auditLog)
    alerts.push(...unauthorizedAlerts)
    
    if (alerts.length > 0) {
      await this.saveSecurityAlerts(alerts)
    }
    
    return alerts
  }

  private async detectSuspiciousActivity(auditLog: AuditLog): Promise<SecurityAlert[]> {
    console.log('Detecting suspicious activity for:', auditLog.action)
    
    const alerts: SecurityAlert[] = []
    
    // Mock: Simular detecção de atividade suspeita
    if (auditLog.action === 'auth.login.failed') {
      alerts.push({
        id: `alert_${Date.now()}`,
        type: 'suspicious_activity',
        severity: 'medium',
        title: 'Tentativa de login falhada',
        description: 'Tentativa de login com credenciais inválidas',
        userId: auditLog.actorId,
        timestamp: new Date(),
        resolved: false
      })
    }
    
    return alerts
  }

  private async checkComplianceViolations(auditLog: AuditLog): Promise<SecurityAlert[]> {
    console.log('Checking compliance violations for:', auditLog.action)
    
    const alerts: SecurityAlert[] = []
    
    // Mock: Verificar regras de compliance
    for (const rule of this.COMPLIANCE_RULES) {
      if (!rule.enabled) continue
      
      const violation = await this.evaluateComplianceRule(rule, auditLog)
      if (violation) {
        alerts.push({
          id: `compliance_${Date.now()}`,
          type: 'compliance_violation',
          severity: rule.severity,
          title: `Violação: ${rule.name}`,
          description: violation.description,
          metadata: { rule: rule.id, details: violation.details },
          timestamp: new Date(),
          resolved: false
        })
      }
    }
    
    return alerts
  }

  private async detectUnauthorizedAccess(auditLog: AuditLog): Promise<SecurityAlert[]> {
    console.log('Detecting unauthorized access for:', auditLog.action)
    
    const alerts: SecurityAlert[] = []
    
    // Mock: Detectar acesso não autorizado
    if (this.SUSPICIOUS_PATTERNS.SENSITIVE_DATA_ACCESS.includes(auditLog.action)) {
      const hasPermission = await this.checkUserPermission(auditLog.actorId, auditLog.action)
      if (!hasPermission) {
        alerts.push({
          id: `unauthorized_${Date.now()}`,
          type: 'unauthorized_access',
          severity: 'high',
          title: 'Acesso não autorizado',
          description: `Usuário tentou acessar dados sensíveis sem permissão: ${auditLog.action}`,
          userId: auditLog.actorId,
          timestamp: new Date(),
          resolved: false
        })
      }
    }
    
    return alerts
  }

  private async evaluateComplianceRule(rule: ComplianceRule, auditLog: AuditLog): Promise<{ description: string; details: any } | null> {
    console.log('Evaluating compliance rule:', rule.id)
    
    // Mock: Avaliar regra de compliance
    if (rule.id === 'lgpd-consent-tracking' && auditLog.entity === 'collaborator') {
      return {
        description: 'Ação com dados pessoais sem rastreamento de consentimento',
        details: { action: auditLog.action, entity: auditLog.entity }
      }
    }
    
    return null
  }

  private async checkUserPermission(userId: string, action: string): Promise<boolean> {
    console.log('Checking user permission:', userId, action)
    // Mock: Sempre retorna true para simplificar
    return true
  }

  private async saveSecurityAlerts(alerts: SecurityAlert[]): Promise<void> {
    console.log('Saving security alerts:', alerts.length)
    this.mockAlerts.push(...alerts)
  }

  async getSecurityAlerts(filters: {
    type?: SecurityAlert['type']
    severity?: SecurityAlert['severity']
    resolved?: boolean
    userId?: string
    limit?: number
  } = {}): Promise<SecurityAlert[]> {
    console.log('Getting security alerts with filters:', filters)
    
    let filteredAlerts = [...this.mockAlerts]
    
    if (filters.type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === filters.type)
    }
    
    if (filters.severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === filters.severity)
    }
    
    if (filters.resolved !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => alert.resolved === filters.resolved)
    }
    
    if (filters.userId) {
      filteredAlerts = filteredAlerts.filter(alert => alert.userId === filters.userId)
    }
    
    if (filters.limit) {
      filteredAlerts = filteredAlerts.slice(0, filters.limit)
    }
    
    return filteredAlerts
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    console.log('Getting security metrics')
    
    const alerts = this.mockAlerts
    const resolvedAlerts = alerts.filter(a => a.resolved)
    const criticalAlerts = alerts.filter(a => a.severity === 'critical')
    
    return {
      totalAlerts: alerts.length,
      criticalAlerts: criticalAlerts.length,
      resolvedAlerts: resolvedAlerts.length,
      averageResolutionTime: 24, // horas
      complianceScore: 85, // porcentagem
      riskScore: 25, // porcentagem
      topThreats: [
        { type: 'suspicious_activity', count: 5 },
        { type: 'unauthorized_access', count: 3 }
      ],
      complianceViolations: [
        { regulation: 'LGPD', count: 2 },
        { regulation: 'ISO27001', count: 1 }
      ]
    }
  }

  async resolveAlert(alertId: string, resolvedBy: string): Promise<boolean> {
    console.log('Resolving alert:', alertId, 'by:', resolvedBy)
    
    const alertIndex = this.mockAlerts.findIndex(alert => alert.id === alertId)
    if (alertIndex === -1) {
      return false
    }
    
    this.mockAlerts[alertIndex].resolved = true
    this.mockAlerts[alertIndex].resolvedBy = resolvedBy
    this.mockAlerts[alertIndex].resolvedAt = new Date()
    
    return true
  }
}

export const securityValidationService = new SecurityValidationService()