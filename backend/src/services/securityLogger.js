import fs from 'fs/promises';
import path from 'path';
import { config, isDevelopment } from '../config/environment.js';
import { metrics } from '../config/monitoring.js';
import emailService from './emailService.js';

class SecurityLogger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.securityLogFile = path.join(this.logDir, 'security.log');
    this.suspiciousAttempts = new Map(); // Cache para detectar padrões suspeitos
    this.initializeLogDirectory();
  }

  /**
   * Inicializa o diretório de logs
   */
  async initializeLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Erro ao criar diretório de logs:', error);
    }
  }

  /**
   * Escreve log de segurança no arquivo
   * @param {Object} logEntry - Entrada de log
   */
  async writeSecurityLog(logEntry) {
    try {
      const timestamp = new Date().toISOString();
      const logLine = JSON.stringify({
        timestamp,
        ...logEntry
      }) + '\n';

      await fs.appendFile(this.securityLogFile, logLine);
      
      // Em desenvolvimento, também exibe no console
      if (isDevelopment()) {
        console.log('🔒 [SECURITY LOG]:', logEntry);
      }
    } catch (error) {
      console.error('Erro ao escrever log de segurança:', error);
    }
  }

  /**
   * Registra tentativa de login
   * @param {Object} loginAttempt - Dados da tentativa de login
   */
  async logLoginAttempt(loginAttempt) {
    const {
      email,
      success,
      ip,
      userAgent,
      timestamp = new Date(),
      reason = null,
      userId = null
    } = loginAttempt;

    const logEntry = {
      event: 'login_attempt',
      email,
      success,
      ip,
      userAgent,
      reason,
      userId,
      severity: success ? 'info' : 'warning'
    };

    await this.writeSecurityLog(logEntry);

    // Se falhou, verificar se é suspeito
    if (!success) {
      await this.checkSuspiciousActivity(email, ip, userAgent);
    }
  }

  /**
   * Registra tentativa de registro
   * @param {Object} registerAttempt - Dados da tentativa de registro
   */
  async logRegisterAttempt(registerAttempt) {
    const {
      email,
      success,
      ip,
      userAgent,
      reason = null,
      userId = null
    } = registerAttempt;

    const logEntry = {
      event: 'register_attempt',
      email,
      success,
      ip,
      userAgent,
      reason,
      userId,
      severity: success ? 'info' : 'warning'
    };

    await this.writeSecurityLog(logEntry);
  }

  /**
   * Registra tentativa de reset de senha
   * @param {Object} resetAttempt - Dados da tentativa de reset
   */
  async logPasswordResetAttempt(resetAttempt) {
    const {
      email,
      success,
      ip,
      userAgent,
      reason = null
    } = resetAttempt;

    const logEntry = {
      event: 'password_reset_attempt',
      email,
      success,
      ip,
      userAgent,
      reason,
      severity: success ? 'info' : 'warning'
    };

    await this.writeSecurityLog(logEntry);
  }

  /**
   * Registra uso de token suspeito
   * @param {Object} tokenAttempt - Dados da tentativa de token
   */
  async logSuspiciousTokenUse(tokenAttempt) {
    const {
      token,
      ip,
      userAgent,
      reason,
      userId = null
    } = tokenAttempt;

    const logEntry = {
      event: 'suspicious_token_use',
      token: token ? `${token.substring(0, 10)}...` : 'invalid', // Não logar token completo
      ip,
      userAgent,
      reason,
      userId,
      severity: 'high'
    };

    await this.writeSecurityLog(logEntry);
  }

  /**
   * Registra bloqueio por rate limiting
   * @param {Object} rateLimitEvent - Dados do bloqueio
   */
  async logRateLimitBlock(rateLimitEvent) {
    const {
      endpoint,
      ip,
      userAgent,
      limit,
      windowMs,
      email = null,
      userId = null
    } = rateLimitEvent;

    const logEntry = {
      event: 'rate_limit_block',
      endpoint,
      ip,
      userAgent,
      email,
      userId,
      limit,
      windowMs,
      severity: 'warning'
    };

    await this.writeSecurityLog(logEntry);

    // Registrar métricas do Prometheus
    try {
      // Determinar tipo de limitador baseado no endpoint
      let limiterType = 'general';
      if (endpoint.includes('login')) limiterType = 'login';
      else if (endpoint.includes('register')) limiterType = 'register';
      else if (endpoint.includes('password-reset')) limiterType = 'password_reset';
      else if (endpoint.includes('2fa')) limiterType = 'two_factor';

      // Incrementar contador de bloqueios
      metrics.rateLimitBlocks.inc({
        limiter_type: limiterType,
        endpoint: endpoint,
        user_id: userId || 'anonymous'
      });

      // Registrar tempo até reset (em segundos)
      const resetTimeSeconds = windowMs / 1000;
      metrics.rateLimitResetTime.observe({
        limiter_type: limiterType,
        endpoint: endpoint
      }, resetTimeSeconds);

    } catch (error) {
      console.error('Erro ao registrar métricas de rate limiting:', error);
    }

    // Verificar se é um padrão de ataque
    await this.checkRateLimitPattern(ip, endpoint);
  }

  /**
   * Verifica atividade suspeita baseada em tentativas de login
   * @param {string} email - Email da tentativa
   * @param {string} ip - IP da tentativa
   * @param {string} userAgent - User agent da tentativa
   */
  async checkSuspiciousActivity(email, ip, userAgent) {
    const key = `${email}:${ip}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutos
    const maxAttempts = 5;

    // Obter tentativas recentes
    if (!this.suspiciousAttempts.has(key)) {
      this.suspiciousAttempts.set(key, []);
    }

    const attempts = this.suspiciousAttempts.get(key);
    
    // Remover tentativas antigas
    const recentAttempts = attempts.filter(attempt => now - attempt < windowMs);
    recentAttempts.push(now);
    
    this.suspiciousAttempts.set(key, recentAttempts);

    // Se excedeu o limite, marcar como suspeito
    if (recentAttempts.length >= maxAttempts) {
      await this.logSuspiciousActivity({
        email,
        ip,
        userAgent,
        attemptCount: recentAttempts.length,
        timeWindow: windowMs,
        pattern: 'repeated_failed_logins'
      });

      // Enviar notificação se o usuário existir
      await this.notifySuspiciousActivity(email, {
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
        pattern: 'Múltiplas tentativas de login falharam',
        location: await this.getLocationFromIP(ip)
      });

      // Limpar cache para evitar spam
      this.suspiciousAttempts.delete(key);
    }
  }

  /**
   * Verifica padrões de rate limiting suspeitos
   * @param {string} ip - IP que foi bloqueado
   * @param {string} endpoint - Endpoint que foi bloqueado
   */
  async checkRateLimitPattern(ip, endpoint) {
    const key = `rate_limit:${ip}`;
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hora
    const maxBlocks = 10;

    if (!this.suspiciousAttempts.has(key)) {
      this.suspiciousAttempts.set(key, []);
    }

    const blocks = this.suspiciousAttempts.get(key);
    const recentBlocks = blocks.filter(block => now - block < windowMs);
    recentBlocks.push(now);
    
    this.suspiciousAttempts.set(key, recentBlocks);

    if (recentBlocks.length >= maxBlocks) {
      await this.logSuspiciousActivity({
        ip,
        endpoint,
        blockCount: recentBlocks.length,
        timeWindow: windowMs,
        pattern: 'excessive_rate_limiting',
        severity: 'high'
      });

      // Limpar cache
      this.suspiciousAttempts.delete(key);
    }
  }

  /**
   * Registra atividade suspeita detectada
   * @param {Object} suspiciousActivity - Dados da atividade suspeita
   */
  async logSuspiciousActivity(suspiciousActivity) {
    const logEntry = {
      event: 'suspicious_activity_detected',
      ...suspiciousActivity,
      severity: suspiciousActivity.severity || 'high',
      timestamp: new Date().toISOString()
    };

    await this.writeSecurityLog(logEntry);

    // Em produção, pode enviar alertas para administradores
    if (isProduction()) {
      console.warn('🚨 ATIVIDADE SUSPEITA DETECTADA:', suspiciousActivity);
    }
  }

  /**
   * Notifica usuário sobre atividade suspeita
   * @param {string} email - Email do usuário
   * @param {Object} activityInfo - Informações da atividade
   */
  async notifySuspiciousActivity(email, activityInfo) {
    try {
      // Verificar se o usuário existe antes de enviar notificação
      const userExists = await this.checkUserExists(email);
      
      if (userExists) {
        await emailService.sendSuspiciousLoginNotification(
          email,
          userExists.nome || 'Usuário',
          activityInfo
        );
        
        await this.writeSecurityLog({
          event: 'suspicious_activity_notification_sent',
          email,
          activityInfo,
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Erro ao notificar atividade suspeita:', error);
      await this.writeSecurityLog({
        event: 'notification_error',
        email,
        error: error.message,
        severity: 'error'
      });
    }
  }

  /**
   * Verifica se usuário existe no banco
   * @param {string} email - Email do usuário
   * @returns {Object|null} - Dados do usuário ou null
   */
  async checkUserExists(email) {
    try {
      // Importação dinâmica para evitar dependência circular
      const { default: pool } = await import('../config/database.js');
      
      const result = await pool.query(
        'SELECT id, nome, email FROM users WHERE email = $1',
        [email]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      return null;
    }
  }

  /**
   * Obtém localização aproximada do IP (placeholder)
   * @param {string} ip - Endereço IP
   * @returns {string} - Localização aproximada
   */
  async getLocationFromIP(ip) {
    // Em produção, pode integrar com serviços como MaxMind ou IPGeolocation
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
      return 'Rede Local';
    }
    
    return 'Localização não disponível';
  }

  /**
   * Obtém estatísticas de segurança
   * @param {number} hours - Horas para análise (padrão: 24)
   * @returns {Object} - Estatísticas de segurança
   */
  async getSecurityStats(hours = 24) {
    try {
      const logContent = await fs.readFile(this.securityLogFile, 'utf8');
      const lines = logContent.trim().split('\n').filter(line => line);
      
      const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
      const recentLogs = lines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(log => log && new Date(log.timestamp) > cutoffTime);

      const stats = {
        totalEvents: recentLogs.length,
        loginAttempts: recentLogs.filter(log => log.event === 'login_attempt').length,
        failedLogins: recentLogs.filter(log => log.event === 'login_attempt' && !log.success).length,
        suspiciousActivities: recentLogs.filter(log => log.event === 'suspicious_activity_detected').length,
        rateLimitBlocks: recentLogs.filter(log => log.event === 'rate_limit_block').length,
        topIPs: this.getTopIPs(recentLogs),
        timeRange: `${hours} horas`
      };

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas de segurança:', error);
      return {
        error: 'Não foi possível obter estatísticas',
        totalEvents: 0
      };
    }
  }

  /**
   * Obtém os IPs com mais atividade
   * @param {Array} logs - Array de logs
   * @returns {Array} - Top IPs com contagem
   */
  getTopIPs(logs) {
    const ipCounts = {};
    
    logs.forEach(log => {
      if (log.ip) {
        ipCounts[log.ip] = (ipCounts[log.ip] || 0) + 1;
      }
    });

    return Object.entries(ipCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));
  }

  /**
   * Log quando usuário inicia configuração de 2FA
   */
  async logTwoFactorSetupInitiated(userId, requestInfo) {
    await this.writeSecurityLog({
      event: 'two_factor_setup_initiated',
      userId,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      severity: 'info'
    });
  }

  /**
   * Log quando 2FA é habilitado com sucesso
   */
  async logTwoFactorEnabled(userId, requestInfo) {
    await this.writeSecurityLog({
      event: 'two_factor_enabled',
      userId,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      severity: 'info'
    });
  }

  /**
   * Log quando falha ao habilitar 2FA
   */
  async logTwoFactorSetupFailed(userId, requestInfo) {
    await this.writeSecurityLog({
      event: 'two_factor_setup_failed',
      userId,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      error: requestInfo.error,
      severity: 'warning'
    });
  }

  /**
   * Log quando 2FA é desabilitado
   */
  async logTwoFactorDisabled(userId, requestInfo) {
    await this.writeSecurityLog({
      event: 'two_factor_disabled',
      userId,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      severity: 'warning'
    });
  }

  /**
   * Log quando falha ao desabilitar 2FA
   */
  async logTwoFactorDisableFailed(userId, requestInfo) {
    await this.writeSecurityLog({
      event: 'two_factor_disable_failed',
      userId,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      error: requestInfo.error,
      severity: 'warning'
    });
  }

  /**
   * Log quando login com 2FA falha
   */
  async logTwoFactorLoginFailed(userId, requestInfo) {
    await this.writeSecurityLog({
      event: 'two_factor_login_failed',
      userId,
      email: requestInfo.email,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      severity: 'warning'
    });
  }

  /**
   * Log quando códigos de backup são regenerados
   */
  async logTwoFactorBackupCodesRegenerated(userId, requestInfo) {
    await this.writeSecurityLog({
      event: 'two_factor_backup_codes_regenerated',
      userId,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      severity: 'info'
    });
  }

  /**
   * Log quando falha ao regenerar códigos de backup
   */
  async logTwoFactorBackupCodesFailed(userId, requestInfo) {
    await this.writeSecurityLog({
      event: 'two_factor_backup_codes_failed',
      userId,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      error: requestInfo.error,
      severity: 'warning'
    });
  }

  /**
   * Limpa logs antigos
   * @param {number} days - Dias para manter (padrão: 30)
   */
  async cleanOldLogs(days = 30) {
    try {
      const logContent = await fs.readFile(this.securityLogFile, 'utf8');
      const lines = logContent.trim().split('\n').filter(line => line);
      
      const cutoffTime = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
      const recentLines = lines.filter(line => {
        try {
          const log = JSON.parse(line);
          return new Date(log.timestamp) > cutoffTime;
        } catch {
          return false;
        }
      });

      await fs.writeFile(this.securityLogFile, recentLines.join('\n') + '\n');
      
      console.log(`🧹 Logs de segurança limpos. Mantidos ${recentLines.length} de ${lines.length} registros.`);
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error);
    }
  }
}

// Instância singleton
const securityLogger = new SecurityLogger();

export default securityLogger;