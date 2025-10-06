import { AuditLog, AuditLogCreate, AuditLogFilter, AuditAction, AuditEntity } from '../types/audit'
import { supabase } from '../config/supabase'

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

  // Registrar ação com análise de risco automática
  async logActionWithRiskAnalysis(logData: AuditLogCreate): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.warn('Tentativa de log de auditoria sem usuário autenticado')
        return
      }

      // Obter dados do perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, position, role, permissions')
        .eq('id', user.id)
        .single()

      // Análise de risco
      const riskLevel = this.calculateRiskLevel(logData, profile)
      const complianceTags = this.generateComplianceTags(logData)
      const dataClassification = this.classifyData(logData)
      const retentionCategory = this.determineRetentionCategory(logData)

      // Obter informações de contexto
      const ipAddress = await this.getCurrentIP()
      const userAgent = this.getCurrentUserAgent()
      const sessionInfo = await this.getSessionInfo(user.id)

      // Metadados aprimorados
      const enhancedMeta = {
        ...logData.meta,
        risk_level: riskLevel,
        compliance_tags: complianceTags,
        data_classification: dataClassification,
        retention_category: retentionCategory,
        session_info: sessionInfo,
        user_permissions: profile?.permissions || [],
        timestamp_utc: new Date().toISOString(),
        browser_fingerprint: this.generateBrowserFingerprint()
      }

      // Registrar log principal
      const { error } = await supabase.rpc('log_audit_action', {
        p_actor_id: user.id,
        p_actor_name: profile?.name || user.email || 'Usuário Desconhecido',
        p_actor_role: profile?.role || profile?.position || 'Usuário',
        p_action: logData.action,
        p_entity: logData.entity,
        p_entity_id: logData.entityId,
        p_meta: enhancedMeta,
        p_success: logData.success,
        p_error_message: logData.errorMessage || null,
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      })

      if (error) {
        console.error('Erro ao registrar log de auditoria:', error)
        throw error
      }

      // Verificar se precisa gerar alertas
      await this.checkForSecurityAlerts(logData, riskLevel, user.id)

      // Log para ações críticas
      if (riskLevel === 'critical' || this.SENSITIVE_ACTIONS.includes(logData.action)) {
        await this.logCriticalAction(logData, user.id, enhancedMeta)
      }

      console.log('Log de auditoria aprimorado registrado:', {
        action: logData.action,
        entity: logData.entity,
        riskLevel,
        complianceTags
      })

    } catch (error) {
      console.error('Erro no serviço de auditoria aprimorado:', error)
      // Fallback para auditoria básica
      await this.fallbackAuditLog(logData)
    }
  }

  // Calcular nível de risco da ação
  private calculateRiskLevel(logData: AuditLogCreate, profile: any): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0

    // Ações sensíveis
    if (this.SENSITIVE_ACTIONS.includes(logData.action)) {
      riskScore += 3
    }

    // Entidades de alto risco
    if (this.HIGH_RISK_ENTITIES.includes(logData.entity)) {
      riskScore += 2
    }

    // Ações de exclusão
    if (logData.action.includes('delete')) {
      riskScore += 2
    }

    // Falhas de operação
    if (!logData.success) {
      riskScore += 1
    }

    // Horário fora do expediente (assumindo 8h-18h)
    const hour = new Date().getHours()
    if (hour < 8 || hour > 18) {
      riskScore += 1
    }

    // Usuário sem permissões adequadas
    if (!profile?.permissions || profile.permissions.length === 0) {
      riskScore += 2
    }

    // Determinar nível baseado no score
    if (riskScore >= 6) return 'critical'
    if (riskScore >= 4) return 'high'
    if (riskScore >= 2) return 'medium'
    return 'low'
  }

  // Gerar tags de conformidade
  private generateComplianceTags(logData: AuditLogCreate): string[] {
    const tags: string[] = []

    // LGPD/GDPR
    if (logData.entity === 'collaborator' || logData.action.includes('personal_data')) {
      tags.push('LGPD', 'GDPR')
    }

    // SOX (dados financeiros)
    if (logData.entity === 'expense' || logData.entity === 'launch') {
      tags.push('SOX', 'FINANCIAL_AUDIT')
    }

    // ISO 27001 (segurança da informação)
    if (logData.entity === 'user' || logData.entity === 'role' || logData.entity === 'permission') {
      tags.push('ISO27001', 'SECURITY_AUDIT')
    }

    // Retenção de documentos
    if (logData.entity === 'document') {
      tags.push('DOCUMENT_RETENTION', 'COMPLIANCE_DOC')
    }

    return tags
  }

  // Classificar dados
  private classifyData(logData: AuditLogCreate): 'public' | 'internal' | 'confidential' | 'restricted' {
    // Dados restritos
    if (logData.entity === 'collaborator' && logData.action.includes('salary')) {
      return 'restricted'
    }

    // Dados confidenciais
    if (['collaborator', 'expense', 'user'].includes(logData.entity)) {
      return 'confidential'
    }

    // Dados internos
    if (['role', 'permission', 'document'].includes(logData.entity)) {
      return 'internal'
    }

    return 'public'
  }

  // Determinar categoria de retenção
  private determineRetentionCategory(logData: AuditLogCreate): 'standard' | 'extended' | 'permanent' {
    // Retenção permanente para dados críticos
    if (logData.entity === 'user' && logData.action.includes('delete')) {
      return 'permanent'
    }

    // Retenção estendida para dados financeiros e RH
    if (['expense', 'launch', 'collaborator'].includes(logData.entity)) {
      return 'extended'
    }

    return 'standard'
  }

  // Verificar alertas de segurança
  private async checkForSecurityAlerts(logData: AuditLogCreate, riskLevel: string, userId: string): Promise<void> {
    try {
      // Múltiplas tentativas de login falhadas
      if (logData.action === 'auth.failed_login') {
        const recentFailures = await this.getRecentFailedLogins(userId, 15) // últimos 15 minutos
        if (recentFailures >= 3) {
          await this.createSecurityAlert({
            trigger_type: 'suspicious_activity',
            severity: 'high',
            description: `Múltiplas tentativas de login falhadas para usuário ${userId}`,
            related_logs: [logData.entityId]
          })
        }
      }

      // Ações críticas fora do horário
      if (riskLevel === 'critical') {
        const hour = new Date().getHours()
        if (hour < 8 || hour > 18) {
          await this.createSecurityAlert({
            trigger_type: 'suspicious_activity',
            severity: 'medium',
            description: `Ação crítica realizada fora do horário comercial: ${logData.action}`,
            related_logs: [logData.entityId]
          })
        }
      }

      // Acesso a dados sensíveis
      if (logData.entity === 'collaborator' && logData.action.includes('view')) {
        const recentAccess = await this.getRecentDataAccess(userId, 'collaborator', 60) // última hora
        if (recentAccess >= 10) {
          await this.createSecurityAlert({
            trigger_type: 'data_access',
            severity: 'medium',
            description: `Acesso excessivo a dados de colaboradores por ${userId}`,
            related_logs: [logData.entityId]
          })
        }
      }

    } catch (error) {
      console.error('Erro ao verificar alertas de segurança:', error)
    }
  }

  // Criar alerta de segurança
  private async createSecurityAlert(alert: Omit<AuditAlert, 'id' | 'created_at'>): Promise<void> {
    // Implementar criação de alerta (pode ser uma tabela separada ou notificação)
    console.warn('ALERTA DE SEGURANÇA:', alert)
    
    // Aqui você pode implementar:
    // - Salvar em tabela de alertas
    // - Enviar notificação para admins
    // - Integrar com sistema de monitoramento
  }

  // Obter informações da sessão
  private async getSessionInfo(userId: string): Promise<any> {
    try {
      const { data } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: false })
        .limit(1)
        .single()

      return data || {}
    } catch {
      return {}
    }
  }

  // Gerar fingerprint do browser
  private generateBrowserFingerprint(): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx?.fillText('fingerprint', 10, 10)
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL()
    }

    return btoa(JSON.stringify(fingerprint)).slice(0, 32)
  }

  // Obter IP atual
  private async getCurrentIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  // Obter User Agent
  private getCurrentUserAgent(): string {
    return navigator.userAgent || 'unknown'
  }

  // Fallback para auditoria básica
  private async fallbackAuditLog(logData: AuditLogCreate): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.rpc('log_audit_action', {
        p_actor_id: user.id,
        p_actor_name: user.email || 'Usuário Desconhecido',
        p_actor_role: 'Usuário',
        p_action: logData.action,
        p_entity: logData.entity,
        p_entity_id: logData.entityId,
        p_meta: logData.meta || {},
        p_success: logData.success,
        p_error_message: logData.errorMessage || null
      })
    } catch (error) {
      console.error('Erro no fallback de auditoria:', error)
    }
  }

  // Métodos auxiliares para alertas
  private async getRecentFailedLogins(userId: string, minutes: number): Promise<number> {
    try {
      const { count } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('actor_id', userId)
        .eq('action', 'auth.failed_login')
        .gte('timestamp', new Date(Date.now() - minutes * 60 * 1000).toISOString())

      return count || 0
    } catch {
      return 0
    }
  }

  private async getRecentDataAccess(userId: string, entity: string, minutes: number): Promise<number> {
    try {
      const { count } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('actor_id', userId)
        .eq('entity', entity)
        .ilike('action', '%view%')
        .gte('timestamp', new Date(Date.now() - minutes * 60 * 1000).toISOString())

      return count || 0
    } catch {
      return 0
    }
  }

  // Log para ações críticas
  private async logCriticalAction(logData: AuditLogCreate, userId: string, meta: any): Promise<void> {
    console.warn('AÇÃO CRÍTICA DETECTADA:', {
      action: logData.action,
      entity: logData.entity,
      user: userId,
      timestamp: new Date().toISOString(),
      meta
    })

    // Aqui você pode implementar:
    // - Notificação imediata para administradores
    // - Log em sistema externo de monitoramento
    // - Backup adicional dos dados
  }

  // Gerar relatório de conformidade
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<ComplianceReport> {
    try {
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())

      if (!logs) throw new Error('Não foi possível obter logs')

      const totalActions = logs.length
      const highRiskActions = logs.filter(log => 
        log.meta?.risk_level === 'high' || log.meta?.risk_level === 'critical'
      ).length

      const complianceViolations = logs.filter(log => 
        !log.success && this.SENSITIVE_ACTIONS.includes(log.action)
      ).length

      const dataAccessSummary = logs.reduce((acc, log) => {
        if (log.action.includes('view') || log.action.includes('access')) {
          acc[log.entity] = (acc[log.entity] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      const userActivitySummary = logs.reduce((acc, log) => {
        acc[log.actor_name] = (acc[log.actor_name] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const recommendations = this.generateRecommendations(logs)

      return {
        period: { start: startDate, end: endDate },
        total_actions: totalActions,
        high_risk_actions: highRiskActions,
        compliance_violations: complianceViolations,
        data_access_summary: dataAccessSummary,
        user_activity_summary: userActivitySummary,
        recommendations
      }

    } catch (error) {
      console.error('Erro ao gerar relatório de conformidade:', error)
      throw error
    }
  }

  // Gerar recomendações baseadas nos logs
  private generateRecommendations(logs: any[]): string[] {
    const recommendations: string[] = []

    // Verificar ações fora do horário
    const afterHoursActions = logs.filter(log => {
      const hour = new Date(log.timestamp).getHours()
      return hour < 8 || hour > 18
    })

    if (afterHoursActions.length > 10) {
      recommendations.push('Considere implementar restrições de horário para ações sensíveis')
    }

    // Verificar falhas frequentes
    const failedActions = logs.filter(log => !log.success)
    if (failedActions.length > logs.length * 0.1) {
      recommendations.push('Taxa de falhas elevada - revisar permissões e treinamento de usuários')
    }

    // Verificar acesso excessivo a dados
    const dataAccessActions = logs.filter(log => log.action.includes('view'))
    if (dataAccessActions.length > logs.length * 0.5) {
      recommendations.push('Alto volume de acesso a dados - considere implementar controles adicionais')
    }

    return recommendations
  }
}

export const enhancedAuditService = new EnhancedAuditService()