import { logger } from '../config/logger.js';
import { alertService } from '../services/alertService.js';
import { 
  performanceHistogram, 
  performanceCounter, 
  performanceGauge,
  performanceSummary 
} from '../config/monitoring.js';

// Configuração de endpoints críticos para monitoramento
const CRITICAL_ENDPOINTS = {
  // Endpoints de autenticação
  'POST /api/auth/login': { category: 'auth', critical: true, threshold: 2000 },
  'POST /api/auth/register': { category: 'auth', critical: true, threshold: 3000 },
  'POST /api/auth/refresh-token': { category: 'auth', critical: true, threshold: 1000 },
  'GET /api/auth/me': { category: 'auth', critical: true, threshold: 500 },
  'POST /api/auth/logout': { category: 'auth', critical: false, threshold: 1000 },
  
  // Endpoints do dashboard
  'GET /api/dashboard/quick-stats': { category: 'dashboard', critical: true, threshold: 1500 },
  'GET /api/dashboard/tasks-metrics': { category: 'dashboard', critical: true, threshold: 2000 },
  'GET /api/dashboard/leads-metrics': { category: 'dashboard', critical: true, threshold: 2000 },
  'GET /api/dashboard/financial-metrics': { category: 'dashboard', critical: true, threshold: 2500 },
  'GET /api/dashboard/system-metrics': { category: 'dashboard', critical: true, threshold: 1000 },
  'GET /api/dashboard/notifications': { category: 'dashboard', critical: false, threshold: 1000 },
  
  // Endpoints de 2FA
  'POST /api/2fa/enable': { category: '2fa', critical: true, threshold: 2000 },
  'POST /api/2fa/verify': { category: '2fa', critical: true, threshold: 1000 },
  'POST /api/2fa/disable': { category: '2fa', critical: true, threshold: 1500 },
  
  // Health check
  'GET /api/health': { category: 'system', critical: false, threshold: 200 }
};

// Middleware principal de performance
export const performanceMiddleware = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();
  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  const endpointConfig = CRITICAL_ENDPOINTS[endpoint];
  
  // Adicionar informações de timing ao request
  req.performanceStart = startTime;
  req.performanceMemoryStart = startMemory;
  req.endpointConfig = endpointConfig;
  
  // Interceptar o final da resposta
  const originalSend = res.send;
  res.send = function(data) {
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();
    const duration = Number(endTime - startTime) / 1000000; // Converter para ms
    
    // Calcular uso de memória
    const memoryDelta = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external
    };
    
    // Registrar métricas
    recordPerformanceMetrics(req, res, duration, memoryDelta);
    
    // Chamar o método original
    originalSend.call(this, data);
  };
  
  next();
};

// Função para registrar métricas de performance
function recordPerformanceMetrics(req, res, duration, memoryDelta) {
  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  const endpointConfig = req.endpointConfig;
  const statusCode = res.statusCode;
  const statusClass = Math.floor(statusCode / 100) + 'xx';
  
  // Labels para métricas
  const labels = {
    method: req.method,
    endpoint: req.route?.path || req.path,
    status_code: statusCode.toString(),
    status_class: statusClass,
    category: endpointConfig?.category || 'other',
    critical: endpointConfig?.critical ? 'true' : 'false'
  };
  
  try {
    // Registrar duração da requisição
    if (performanceHistogram) {
      performanceHistogram.observe(labels, duration);
    }
    
    // Registrar contador de requisições
    if (performanceCounter) {
      performanceCounter.inc(labels);
    }
    
    // Registrar summary para percentis
    if (performanceSummary) {
      performanceSummary.observe(labels, duration);
    }
    
    // Registrar uso de memória para endpoints críticos
    if (endpointConfig?.critical && performanceGauge) {
      performanceGauge.set(
        { ...labels, metric: 'memory_rss_delta' }, 
        memoryDelta.rss
      );
      performanceGauge.set(
        { ...labels, metric: 'memory_heap_used_delta' }, 
        memoryDelta.heapUsed
      );
    }
    
    // Log detalhado para endpoints críticos ou requisições lentas
    const threshold = endpointConfig?.threshold || 5000;
    const isSlowRequest = duration > threshold;
    const isCritical = endpointConfig?.critical;
    const isError = statusCode >= 400;
    
    if (isCritical || isSlowRequest || isError) {
      const logLevel = isError ? 'error' : isSlowRequest ? 'warn' : 'info';
      const logData = {
        endpoint,
        method: req.method,
        path: req.path,
        duration: Math.round(duration * 100) / 100,
        statusCode,
        critical: isCritical,
        slow: isSlowRequest,
        threshold,
        memory: {
          rssDelta: Math.round(memoryDelta.rss / 1024 / 1024 * 100) / 100, // MB
          heapUsedDelta: Math.round(memoryDelta.heapUsed / 1024 / 1024 * 100) / 100 // MB
        },
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.id,
        requestId: req.id
      };
      
      logger[logLevel](`Performance metrics - ${endpoint}`, logData);
    }
    
    // Alertas para performance crítica
    if (isSlowRequest && isCritical) {
      logger.error('CRITICAL PERFORMANCE ALERT', {
        endpoint,
        duration,
        threshold,
        statusCode,
        message: `Critical endpoint ${endpoint} took ${Math.round(duration)}ms (threshold: ${threshold}ms)`
      });
    }
    
    // Registrar problemas de performance no sistema de alertas
    if (isSlowRequest || isError) {
      alertService.recordPerformanceIssue({
        endpoint: req.route?.path || req.path,
        duration,
        statusCode,
        critical: isCritical,
        method: req.method,
        userId: req.user?.id,
        ip: req.ip
      });
    }
    
  } catch (error) {
    logger.error('Error recording performance metrics', {
      endpoint,
      error: error.message,
      stack: error.stack
    });
  }
}

// Middleware específico para endpoints de autenticação
export const authPerformanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Interceptar resposta para capturar métricas específicas de auth
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    const endpoint = `${req.method} ${req.path}`;
    
    // Métricas específicas de autenticação
    const authMetrics = {
      endpoint,
      duration,
      success: res.statusCode < 400,
      hasToken: !!data?.token,
      hasRefreshToken: !!data?.refreshToken,
      userId: data?.user?.id,
      userEmail: data?.user?.email,
      rateLimited: res.statusCode === 429,
      timestamp: new Date().toISOString()
    };
    
    // Log específico para autenticação
    if (endpoint.includes('/auth/')) {
      logger.info('Auth performance metrics', authMetrics);
    }
    
    originalJson.call(this, data);
  };
  
  next();
};

// Middleware específico para endpoints do dashboard
export const dashboardPerformanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  let queryCount = 0;
  
  // Interceptar queries do banco (se usando pool)
  req.queryCount = 0;
  
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    const endpoint = `${req.method} ${req.path}`;
    
    // Métricas específicas do dashboard
    const dashboardMetrics = {
      endpoint,
      duration,
      success: res.statusCode < 400,
      dataSize: JSON.stringify(data).length,
      queryCount: req.queryCount || 0,
      cacheHit: req.cacheHit || false,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    };
    
    // Log específico para dashboard
    if (endpoint.includes('/dashboard/')) {
      logger.info('Dashboard performance metrics', dashboardMetrics);
    }
    
    originalJson.call(this, data);
  };
  
  next();
};

// Função para obter estatísticas de performance
export const getPerformanceStats = () => {
  return {
    criticalEndpoints: Object.keys(CRITICAL_ENDPOINTS).filter(
      endpoint => CRITICAL_ENDPOINTS[endpoint].critical
    ),
    totalEndpoints: Object.keys(CRITICAL_ENDPOINTS).length,
    categories: [...new Set(Object.values(CRITICAL_ENDPOINTS).map(config => config.category))],
    thresholds: Object.fromEntries(
      Object.entries(CRITICAL_ENDPOINTS).map(([endpoint, config]) => [
        endpoint, 
        config.threshold
      ])
    )
  };
};

export default {
  performanceMiddleware,
  authPerformanceMiddleware,
  dashboardPerformanceMiddleware,
  getPerformanceStats
};