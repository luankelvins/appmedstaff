import express from 'express';
import { alertService } from '../services/alertService.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { logger } from '../config/logger.js';
import Joi from 'joi';

const router = express.Router();

// GET /api/alerts/health-check - Verificar saúde do sistema de alertas (público)
router.get('/health-check', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      alertService: 'operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    };

    res.json(healthStatus);
  } catch (error) {
    logger.error('Error checking alert system health:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Schema para configuração de alertas
const alertConfigSchema = Joi.object({
  alertType: Joi.string().valid(
    'excessive_rate_limiting',
    'suspicious_ip', 
    'massive_attack',
    'slow_critical_endpoint',
    'high_error_rate',
    'suspicious_login'
  ).required(),
  threshold: Joi.number().min(1).max(1000).optional(),
  timeWindow: Joi.number().min(60000).max(86400000).optional(), // 1 min a 24h em ms
  cooldown: Joi.number().min(60000).max(3600000).optional(), // 1 min a 1h em ms
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional()
});

// GET /api/alerts/stats - Obter estatísticas de alertas
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Verificar se usuário é admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Acesso negado. Apenas administradores podem visualizar estatísticas de alertas.'
      });
    }

    const stats = alertService.getAlertStats();
    
    logger.info('Alert stats accessed', {
      userId: req.user.id,
      userEmail: req.user.email,
      ip: req.ip
    });

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching alert stats', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter estatísticas de alertas'
    });
  }
});

// GET /api/alerts/config - Obter configurações atuais de alertas
router.get('/config', authenticateToken, async (req, res) => {
  try {
    // Verificar se usuário é admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Acesso negado. Apenas administradores podem visualizar configurações de alertas.'
      });
    }

    // Retornar configurações atuais (sem dados sensíveis)
    const config = {
      rateLimiting: {
        excessiveBlocks: {
          threshold: 10,
          timeWindow: 5 * 60 * 1000,
          severity: 'high',
          cooldown: 15 * 60 * 1000
        },
        suspiciousIP: {
          threshold: 5,
          timeWindow: 10 * 60 * 1000,
          severity: 'critical',
          cooldown: 30 * 60 * 1000
        },
        massiveAttack: {
          threshold: 20,
          timeWindow: 5 * 60 * 1000,
          severity: 'critical',
          cooldown: 60 * 60 * 1000
        }
      },
      performance: {
        slowCriticalEndpoint: {
          threshold: 3000,
          consecutiveCount: 3,
          severity: 'high',
          cooldown: 10 * 60 * 1000
        },
        highErrorRate: {
          threshold: 10,
          timeWindow: 5 * 60 * 1000,
          severity: 'high',
          cooldown: 15 * 60 * 1000
        }
      },
      security: {
        suspiciousLogin: {
          threshold: 20,
          timeWindow: 10 * 60 * 1000,
          severity: 'medium',
          cooldown: 30 * 60 * 1000
        }
      },
      notifications: {
        emailEnabled: !!process.env.SMTP_HOST,
        slackEnabled: !!process.env.SLACK_WEBHOOK_URL,
        discordEnabled: !!process.env.DISCORD_WEBHOOK_URL,
        adminEmails: process.env.ADMIN_EMAILS?.split(',').length || 0
      }
    };

    logger.info('Alert config accessed', {
      userId: req.user.id,
      userEmail: req.user.email,
      ip: req.ip
    });

    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching alert config', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter configurações de alertas'
    });
  }
});

// POST /api/alerts/test - Testar sistema de alertas (apenas desenvolvimento)
router.post('/test', authenticateToken, async (req, res) => {
  try {
    // Verificar se usuário é admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Acesso negado. Apenas administradores podem testar alertas.'
      });
    }

    // Apenas em desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        error: 'Testes de alerta só são permitidos em ambiente de desenvolvimento.'
      });
    }

    const { alertType = 'test' } = req.body;

    // Simular diferentes tipos de alertas
    switch (alertType) {
      case 'rate_limiting':
        // Simular múltiplos bloqueios de rate limiting
        for (let i = 0; i < 12; i++) {
          alertService.recordRateLimitBlock({
            ip: `192.168.1.${100 + i}`,
            endpoint: '/login',
            userId: `test${i}@example.com`,
            userAgent: 'Test-Agent/1.0'
          });
        }
        break;

      case 'performance':
        // Simular problemas de performance
        for (let i = 0; i < 4; i++) {
          alertService.recordPerformanceIssue({
            endpoint: '/api/dashboard/quick-stats',
            duration: 4000 + (i * 500), // 4s, 4.5s, 5s, 5.5s
            statusCode: 200,
            critical: true,
            method: 'GET',
            userId: req.user.id,
            ip: req.ip
          });
        }
        break;

      case 'errors':
        // Simular alta taxa de erro
        for (let i = 0; i < 12; i++) {
          alertService.recordPerformanceIssue({
            endpoint: '/api/dashboard/tasks-metrics',
            duration: 1000,
            statusCode: 500,
            critical: true,
            method: 'GET',
            userId: req.user.id,
            ip: req.ip
          });
        }
        break;

      default:
        return res.status(400).json({
          error: 'Tipo de alerta inválido',
          validTypes: ['rate_limiting', 'performance', 'errors']
        });
    }

    logger.info('Alert test triggered', {
      alertType,
      userId: req.user.id,
      userEmail: req.user.email,
      ip: req.ip
    });

    res.json({
      success: true,
      message: `Teste de alerta '${alertType}' executado com sucesso`,
      alertType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error testing alerts', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível executar teste de alerta'
    });
  }
});

// GET /api/alerts/health - Health check do sistema de alertas
router.get('/health', authenticateToken, async (req, res) => {
  try {
    // Verificar se usuário é admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Acesso negado. Apenas administradores podem verificar saúde dos alertas.'
      });
    }

    const stats = alertService.getAlertStats();
    const health = {
      status: 'healthy',
      alertService: {
        running: true,
        totalRateLimitBlocks: stats.rateLimitBlocks.total,
        totalPerformanceIssues: stats.performanceIssues.total,
        activeAlerts: stats.activeAlerts
      },
      notifications: {
        email: {
          configured: !!process.env.SMTP_HOST,
          adminEmails: process.env.ADMIN_EMAILS?.split(',').length || 0
        },
        slack: {
          configured: !!process.env.SLACK_WEBHOOK_URL
        },
        discord: {
          configured: !!process.env.DISCORD_WEBHOOK_URL
        }
      },
      lastCheck: new Date().toISOString()
    };

    res.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error checking alert health', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível verificar saúde dos alertas',
      status: 'unhealthy'
    });
  }
});

export default router;