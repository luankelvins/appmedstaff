import { logger } from '../config/logger.js';
import { captureMessage, captureException } from '../config/monitoring.js';
import emailService from './emailService.js';
import { isDevelopment } from '../config/environment.js';

// Configurações de alertas
const ALERT_CONFIG = {
  // Rate limiting alerts
  rateLimiting: {
    // Alerta quando rate limiting é acionado mais de X vezes em Y minutos
    excessiveBlocks: {
      threshold: 10, // 10 bloqueios
      timeWindow: 5 * 60 * 1000, // 5 minutos
      severity: 'high',
      cooldown: 15 * 60 * 1000 // 15 minutos entre alertas
    },
    // Alerta quando um IP específico é bloqueado repetidamente
    suspiciousIP: {
      threshold: 5, // 5 bloqueios do mesmo IP
      timeWindow: 10 * 60 * 1000, // 10 minutos
      severity: 'critical',
      cooldown: 30 * 60 * 1000 // 30 minutos entre alertas
    },
    // Alerta quando muitos usuários diferentes são bloqueados
    massiveAttack: {
      threshold: 20, // 20 IPs diferentes bloqueados
      timeWindow: 5 * 60 * 1000, // 5 minutos
      severity: 'critical',
      cooldown: 60 * 60 * 1000 // 1 hora entre alertas
    }
  },
  
  // Performance alerts
  performance: {
    // Alerta quando endpoint crítico está lento
    slowCriticalEndpoint: {
      threshold: 3000, // 3 segundos
      consecutiveCount: 3, // 3 requisições consecutivas lentas
      severity: 'high',
      cooldown: 10 * 60 * 1000 // 10 minutos entre alertas
    },
    // Alerta quando há muitos erros 5xx
    highErrorRate: {
      threshold: 10, // 10 erros
      timeWindow: 5 * 60 * 1000, // 5 minutos
      severity: 'high',
      cooldown: 15 * 60 * 1000 // 15 minutos entre alertas
    }
  },
  
  // Security alerts
  security: {
    // Alerta para tentativas de login suspeitas
    suspiciousLogin: {
      threshold: 20, // 20 tentativas falhadas
      timeWindow: 10 * 60 * 1000, // 10 minutos
      severity: 'medium',
      cooldown: 30 * 60 * 1000 // 30 minutos entre alertas
    }
  }
};

// Armazenamento em memória para tracking de eventos (em produção, usar Redis)
const alertState = {
  rateLimitBlocks: [],
  performanceIssues: [],
  securityEvents: [],
  lastAlerts: new Map() // Para cooldown
};

class AlertService {
  constructor() {
    this.adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@medstaff.com'];
    this.slackWebhook = process.env.SLACK_WEBHOOK_URL;
    this.discordWebhook = process.env.DISCORD_WEBHOOK_URL;
  }

  // Registrar evento de rate limiting
  recordRateLimitBlock(data) {
    const event = {
      timestamp: Date.now(),
      ip: data.ip,
      endpoint: data.endpoint,
      userId: data.userId,
      userAgent: data.userAgent
    };

    alertState.rateLimitBlocks.push(event);
    
    // Limpar eventos antigos (manter apenas últimas 24h)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    alertState.rateLimitBlocks = alertState.rateLimitBlocks.filter(
      e => e.timestamp > oneDayAgo
    );

    // Verificar se deve disparar alertas
    this.checkRateLimitingAlerts(event);
  }

  // Registrar evento de performance
  recordPerformanceIssue(data) {
    const event = {
      timestamp: Date.now(),
      endpoint: data.endpoint,
      duration: data.duration,
      statusCode: data.statusCode,
      critical: data.critical
    };

    alertState.performanceIssues.push(event);
    
    // Limpar eventos antigos
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    alertState.performanceIssues = alertState.performanceIssues.filter(
      e => e.timestamp > oneHourAgo
    );

    // Verificar se deve disparar alertas
    this.checkPerformanceAlerts(event);
  }

  // Verificar alertas de rate limiting
  checkRateLimitingAlerts(currentEvent) {
    const now = Date.now();
    const config = ALERT_CONFIG.rateLimiting;

    // 1. Verificar bloqueios excessivos
    const recentBlocks = alertState.rateLimitBlocks.filter(
      e => now - e.timestamp <= config.excessiveBlocks.timeWindow
    );

    if (recentBlocks.length >= config.excessiveBlocks.threshold) {
      this.triggerAlert('excessive_rate_limiting', {
        type: 'excessive_blocks',
        count: recentBlocks.length,
        timeWindow: config.excessiveBlocks.timeWindow / 60000, // em minutos
        severity: config.excessiveBlocks.severity,
        details: {
          uniqueIPs: [...new Set(recentBlocks.map(e => e.ip))].length,
          endpoints: [...new Set(recentBlocks.map(e => e.endpoint))],
          recentEvents: recentBlocks.slice(-5) // últimos 5 eventos
        }
      }, config.excessiveBlocks.cooldown);
    }

    // 2. Verificar IP suspeito
    const sameIPBlocks = alertState.rateLimitBlocks.filter(
      e => e.ip === currentEvent.ip && 
           now - e.timestamp <= config.suspiciousIP.timeWindow
    );

    if (sameIPBlocks.length >= config.suspiciousIP.threshold) {
      this.triggerAlert('suspicious_ip', {
        type: 'suspicious_ip',
        ip: currentEvent.ip,
        count: sameIPBlocks.length,
        timeWindow: config.suspiciousIP.timeWindow / 60000,
        severity: config.suspiciousIP.severity,
        details: {
          endpoints: [...new Set(sameIPBlocks.map(e => e.endpoint))],
          userAgents: [...new Set(sameIPBlocks.map(e => e.userAgent))],
          recentEvents: sameIPBlocks.slice(-3)
        }
      }, config.suspiciousIP.cooldown);
    }

    // 3. Verificar ataque massivo
    const uniqueIPs = [...new Set(recentBlocks.map(e => e.ip))];
    if (uniqueIPs.length >= config.massiveAttack.threshold) {
      this.triggerAlert('massive_attack', {
        type: 'massive_attack',
        uniqueIPCount: uniqueIPs.length,
        totalBlocks: recentBlocks.length,
        timeWindow: config.massiveAttack.timeWindow / 60000,
        severity: config.massiveAttack.severity,
        details: {
          topIPs: this.getTopIPs(recentBlocks, 10),
          endpoints: [...new Set(recentBlocks.map(e => e.endpoint))]
        }
      }, config.massiveAttack.cooldown);
    }
  }

  // Verificar alertas de performance
  checkPerformanceAlerts(currentEvent) {
    const now = Date.now();
    const config = ALERT_CONFIG.performance;

    // 1. Verificar endpoint crítico lento
    if (currentEvent.critical && currentEvent.duration > config.slowCriticalEndpoint.threshold) {
      const recentSlowRequests = alertState.performanceIssues.filter(
        e => e.endpoint === currentEvent.endpoint &&
             e.critical &&
             e.duration > config.slowCriticalEndpoint.threshold &&
             now - e.timestamp <= 5 * 60 * 1000 // últimos 5 minutos
      );

      if (recentSlowRequests.length >= config.slowCriticalEndpoint.consecutiveCount) {
        this.triggerAlert('slow_critical_endpoint', {
          type: 'slow_critical_endpoint',
          endpoint: currentEvent.endpoint,
          averageDuration: Math.round(
            recentSlowRequests.reduce((sum, e) => sum + e.duration, 0) / recentSlowRequests.length
          ),
          threshold: config.slowCriticalEndpoint.threshold,
          count: recentSlowRequests.length,
          severity: config.slowCriticalEndpoint.severity
        }, config.slowCriticalEndpoint.cooldown);
      }
    }

    // 2. Verificar alta taxa de erro
    const recentErrors = alertState.performanceIssues.filter(
      e => e.statusCode >= 500 &&
           now - e.timestamp <= config.highErrorRate.timeWindow
    );

    if (recentErrors.length >= config.highErrorRate.threshold) {
      this.triggerAlert('high_error_rate', {
        type: 'high_error_rate',
        errorCount: recentErrors.length,
        timeWindow: config.highErrorRate.timeWindow / 60000,
        severity: config.highErrorRate.severity,
        details: {
          endpoints: [...new Set(recentErrors.map(e => e.endpoint))],
          statusCodes: this.getStatusCodeDistribution(recentErrors)
        }
      }, config.highErrorRate.cooldown);
    }
  }

  // Disparar alerta
  async triggerAlert(alertKey, alertData, cooldownMs) {
    const now = Date.now();
    const lastAlert = alertState.lastAlerts.get(alertKey);

    // Verificar cooldown
    if (lastAlert && now - lastAlert < cooldownMs) {
      logger.debug('Alert suppressed due to cooldown', { alertKey, cooldownMs });
      return;
    }

    // Atualizar timestamp do último alerta
    alertState.lastAlerts.set(alertKey, now);

    // Log do alerta
    logger.error('SECURITY ALERT TRIGGERED', {
      alertKey,
      alertData,
      timestamp: new Date().toISOString()
    });

    // Capturar no Sentry
    captureMessage(`Security Alert: ${alertData.type}`, 'error', {
      alertKey,
      alertData,
      tags: {
        alert_type: alertData.type,
        severity: alertData.severity
      }
    });

    // Enviar notificações
    await this.sendAlertNotifications(alertKey, alertData);
  }

  // Enviar notificações do alerta
  async sendAlertNotifications(alertKey, alertData) {
    const message = this.formatAlertMessage(alertKey, alertData);

    try {
      // Email para administradores
      if (!isDevelopment()) {
        await this.sendEmailAlert(message, alertData);
      }

      // Slack (se configurado)
      if (this.slackWebhook) {
        await this.sendSlackAlert(message, alertData);
      }

      // Discord (se configurado)
      if (this.discordWebhook) {
        await this.sendDiscordAlert(message, alertData);
      }

      logger.info('Alert notifications sent successfully', { alertKey });
    } catch (error) {
      logger.error('Failed to send alert notifications', {
        alertKey,
        error: error.message
      });
      captureException(error);
    }
  }

  // Formatar mensagem do alerta
  formatAlertMessage(alertKey, alertData) {
    const timestamp = new Date().toISOString();
    const severity = alertData.severity.toUpperCase();

    let message = `🚨 [${severity}] Security Alert: ${alertData.type}\n`;
    message += `⏰ Time: ${timestamp}\n`;
    message += `🔍 Alert Key: ${alertKey}\n\n`;

    switch (alertData.type) {
      case 'excessive_blocks':
        message += `📊 ${alertData.count} rate limit blocks in ${alertData.timeWindow} minutes\n`;
        message += `🌐 Unique IPs: ${alertData.details.uniqueIPs}\n`;
        message += `🎯 Endpoints: ${alertData.details.endpoints.join(', ')}\n`;
        break;

      case 'suspicious_ip':
        message += `🚫 IP ${alertData.ip} blocked ${alertData.count} times in ${alertData.timeWindow} minutes\n`;
        message += `🎯 Endpoints: ${alertData.details.endpoints.join(', ')}\n`;
        break;

      case 'massive_attack':
        message += `⚡ ${alertData.uniqueIPCount} unique IPs blocked (${alertData.totalBlocks} total blocks)\n`;
        message += `⏱️ Time window: ${alertData.timeWindow} minutes\n`;
        break;

      case 'slow_critical_endpoint':
        message += `🐌 Critical endpoint ${alertData.endpoint} is slow\n`;
        message += `📈 Average duration: ${alertData.averageDuration}ms (threshold: ${alertData.threshold}ms)\n`;
        message += `🔢 Slow requests: ${alertData.count}\n`;
        break;

      case 'high_error_rate':
        message += `💥 ${alertData.errorCount} server errors in ${alertData.timeWindow} minutes\n`;
        message += `🎯 Affected endpoints: ${alertData.details.endpoints.join(', ')}\n`;
        break;
    }

    return message;
  }

  // Enviar alerta por email
  async sendEmailAlert(message, alertData) {
    const subject = `🚨 Security Alert: ${alertData.type} [${alertData.severity.toUpperCase()}]`;
    
    for (const email of this.adminEmails) {
      await emailService.sendSecurityAlert(email, subject, message, alertData);
    }
  }

  // Enviar alerta para Slack
  async sendSlackAlert(message, alertData) {
    const payload = {
      text: message,
      username: 'Security Bot',
      icon_emoji: ':warning:',
      attachments: [{
        color: alertData.severity === 'critical' ? 'danger' : 
               alertData.severity === 'high' ? 'warning' : 'good',
        fields: [{
          title: 'Alert Type',
          value: alertData.type,
          short: true
        }, {
          title: 'Severity',
          value: alertData.severity.toUpperCase(),
          short: true
        }]
      }]
    };

    const response = await fetch(this.slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }
  }

  // Enviar alerta para Discord
  async sendDiscordAlert(message, alertData) {
    const payload = {
      content: message,
      username: 'Security Bot',
      embeds: [{
        title: `Security Alert: ${alertData.type}`,
        description: message,
        color: alertData.severity === 'critical' ? 0xff0000 : 
               alertData.severity === 'high' ? 0xff8800 : 0x00ff00,
        timestamp: new Date().toISOString()
      }]
    };

    const response = await fetch(this.discordWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }
  }

  // Utilitários
  getTopIPs(events, limit = 5) {
    const ipCounts = {};
    events.forEach(e => {
      ipCounts[e.ip] = (ipCounts[e.ip] || 0) + 1;
    });

    return Object.entries(ipCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([ip, count]) => ({ ip, count }));
  }

  getStatusCodeDistribution(events) {
    const statusCounts = {};
    events.forEach(e => {
      statusCounts[e.statusCode] = (statusCounts[e.statusCode] || 0) + 1;
    });
    return statusCounts;
  }

  // Obter estatísticas de alertas
  getAlertStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    return {
      rateLimitBlocks: {
        lastHour: alertState.rateLimitBlocks.filter(e => now - e.timestamp <= oneHour).length,
        lastDay: alertState.rateLimitBlocks.filter(e => now - e.timestamp <= oneDay).length,
        total: alertState.rateLimitBlocks.length
      },
      performanceIssues: {
        lastHour: alertState.performanceIssues.filter(e => now - e.timestamp <= oneHour).length,
        total: alertState.performanceIssues.length
      },
      activeAlerts: alertState.lastAlerts.size,
      lastAlerts: Array.from(alertState.lastAlerts.entries()).map(([key, timestamp]) => ({
        key,
        timestamp: new Date(timestamp).toISOString()
      }))
    };
  }
}

export const alertService = new AlertService();
export default alertService;