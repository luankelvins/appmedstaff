import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import alertService from '../services/alertService.js';
import { logger } from '../config/logger.js';
import { register } from '../config/monitoring.js';

const router = express.Router();

/**
 * @swagger
 * /api/security-dashboard/overview:
 *   get:
 *     summary: Visão geral das métricas de segurança
 *     description: Retorna uma visão completa das métricas de segurança do sistema (apenas para administradores)
 *     tags: [Segurança]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas de segurança obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     alerts:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         byType:
 *                           type: object
 *                         bySeverity:
 *                           type: object
 *                         recent:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Alert'
 *                     performance:
 *                       type: object
 *                       properties:
 *                         totalRequests:
 *                           type: integer
 *                         averageResponseTime:
 *                           type: number
 *                         errorRate:
 *                           type: number
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    // Verificar se usuário é admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Acesso negado. Apenas administradores podem visualizar o dashboard de segurança.'
      });
    }

    // Obter estatísticas de alertas
    const alertStats = alertService.getAlertStats();
    
    // Obter métricas do Prometheus
    const metrics = await register.metrics();
    
    // Processar métricas para extrair dados relevantes
    const securityMetrics = extractSecurityMetrics(metrics);
    
    const overview = {
      alerts: {
        total: alertStats.totalAlerts,
        byType: alertStats.alertsByType,
        bySeverity: alertStats.alertsBySeverity,
        recent: alertStats.recentAlerts?.slice(0, 10) || []
      },
      performance: {
        totalRequests: securityMetrics.totalRequests,
        averageResponseTime: securityMetrics.averageResponseTime,
        errorRate: securityMetrics.errorRate,
        slowEndpoints: securityMetrics.slowEndpoints
      },
      rateLimiting: {
        blockedRequests: securityMetrics.blockedRequests,
        topBlockedIPs: securityMetrics.topBlockedIPs,
        blockedEndpoints: securityMetrics.blockedEndpoints
      },
      timestamp: new Date().toISOString()
    };

    logger.info('Security dashboard overview accessed', {
      userId: req.user.id,
      userEmail: req.user.email,
      ip: req.ip
    });

    res.json({
      success: true,
      data: overview
    });

  } catch (error) {
    logger.error('Error getting security dashboard overview:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter visão geral do dashboard de segurança'
    });
  }
});

/**
 * @swagger
 * /api/security-dashboard/alerts:
 *   get:
 *     summary: Alertas detalhados com filtros e paginação
 *     description: Retorna lista de alertas de segurança com opções de filtro e paginação
 *     tags: [Segurança]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de itens por página
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filtrar por severidade
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [login_attempt, suspicious_activity, system_error, security_breach]
 *         description: Filtrar por tipo de alerta
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para filtro (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para filtro (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de alertas obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     alerts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Alert'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    // Verificar se usuário é admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Acesso negado. Apenas administradores podem visualizar alertas.'
      });
    }

    const { page = 1, limit = 20, severity, type, startDate, endDate } = req.query;
    
    const alertStats = alertService.getAlertStats();
    
    // Filtrar alertas baseado nos parâmetros
    let filteredAlerts = alertStats.recentAlerts || [];
    
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    
    if (type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filteredAlerts = filteredAlerts.filter(alert => new Date(alert.timestamp) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredAlerts = filteredAlerts.filter(alert => new Date(alert.timestamp) <= end);
    }

    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        alerts: paginatedAlerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredAlerts.length,
          totalPages: Math.ceil(filteredAlerts.length / limit)
        },
        filters: {
          severity,
          type,
          startDate,
          endDate
        }
      }
    });

  } catch (error) {
    logger.error('Error getting security alerts:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter alertas de segurança'
    });
  }
});

// GET /api/security-dashboard/public-metrics - Métricas públicas básicas
router.get('/public-metrics', async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Obter estatísticas básicas dos últimos 24h
    const basicStats = alertService.getAlertStats();
    
    // Métricas públicas (sem dados sensíveis)
    const publicMetrics = {
      timestamp: now.toISOString(),
      period: '24h',
      summary: {
        totalAlerts: basicStats.totalAlerts || 0,
        criticalAlerts: basicStats.criticalAlerts || 0,
        systemHealth: basicStats.totalAlerts < 10 ? 'healthy' : 
                     basicStats.totalAlerts < 50 ? 'warning' : 'critical',
        lastUpdate: now.toISOString()
      },
      trends: {
        alertsLast1h: Math.floor(Math.random() * 5), // Simulado para demo
        alertsLast6h: Math.floor(Math.random() * 20),
        alertsLast24h: basicStats.totalAlerts || 0
      }
    };
    
    res.json({
      success: true,
      data: publicMetrics
    });
  } catch (error) {
    logger.error('Erro ao obter métricas públicas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/security-dashboard/metrics - Métricas em tempo real
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    // Verificar se usuário é admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Acesso negado. Apenas administradores podem visualizar métricas.'
      });
    }

    const { timeRange = '1h' } = req.query;
    
    // Obter métricas do Prometheus
    const metrics = await promClient.register.metrics();
    const securityMetrics = extractSecurityMetrics(metrics);
    
    // Adicionar dados de tendência baseado no timeRange
    const trendData = generateTrendData(timeRange);
    
    res.json({
      success: true,
      data: {
        current: securityMetrics,
        trends: trendData,
        timeRange,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error getting security metrics:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter métricas de segurança'
    });
  }
});

// Função auxiliar para extrair métricas de segurança do Prometheus
function extractSecurityMetrics(metricsText) {
  const lines = metricsText.split('\n');
  const metrics = {
    totalRequests: 0,
    averageResponseTime: 0,
    errorRate: 0,
    blockedRequests: 0,
    slowEndpoints: [],
    topBlockedIPs: [],
    blockedEndpoints: []
  };

  // Processar métricas do Prometheus
  lines.forEach(line => {
    if (line.startsWith('endpoint_requests_total')) {
      const match = line.match(/endpoint_requests_total{.*?} (\d+)/);
      if (match) {
        metrics.totalRequests += parseInt(match[1]);
      }
    }
    
    if (line.startsWith('endpoint_performance_duration_ms_sum')) {
      const match = line.match(/endpoint_performance_duration_ms_sum{.*?} ([\d.]+)/);
      if (match) {
        metrics.averageResponseTime += parseFloat(match[1]);
      }
    }
  });

  // Calcular taxa de erro (simulado)
  metrics.errorRate = Math.random() * 5; // 0-5% de erro simulado
  
  // Dados simulados para demonstração
  metrics.slowEndpoints = [
    { endpoint: '/api/dashboard/reports', avgTime: 1250, requests: 45 },
    { endpoint: '/api/auth/login', avgTime: 890, requests: 123 },
    { endpoint: '/api/dashboard/analytics', avgTime: 750, requests: 67 }
  ];
  
  metrics.topBlockedIPs = [
    { ip: '192.168.1.100', blocks: 15, lastBlock: new Date().toISOString() },
    { ip: '10.0.0.50', blocks: 8, lastBlock: new Date().toISOString() },
    { ip: '172.16.0.25', blocks: 5, lastBlock: new Date().toISOString() }
  ];
  
  metrics.blockedEndpoints = [
    { endpoint: '/api/auth/login', blocks: 28 },
    { endpoint: '/api/auth/register', blocks: 12 },
    { endpoint: '/api/auth/reset-password', blocks: 7 }
  ];

  return metrics;
}

// Função auxiliar para gerar dados de tendência
function generateTrendData(timeRange) {
  const now = new Date();
  const points = [];
  let interval, count;
  
  switch (timeRange) {
    case '1h':
      interval = 5 * 60 * 1000; // 5 minutos
      count = 12;
      break;
    case '24h':
      interval = 60 * 60 * 1000; // 1 hora
      count = 24;
      break;
    case '7d':
      interval = 24 * 60 * 60 * 1000; // 1 dia
      count = 7;
      break;
    default:
      interval = 5 * 60 * 1000;
      count = 12;
  }
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * interval));
    points.push({
      timestamp: timestamp.toISOString(),
      requests: Math.floor(Math.random() * 100) + 50,
      alerts: Math.floor(Math.random() * 10),
      blockedRequests: Math.floor(Math.random() * 20),
      averageResponseTime: Math.floor(Math.random() * 500) + 200
    });
  }
  
  return points;
}

export default router;