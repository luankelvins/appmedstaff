import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import client from 'prom-client';
import { logger } from './logger.js';

// Configuração do Sentry
export const initializeSentry = (app) => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
    nodeProfilingIntegration(),
  ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Filtrar dados sensíveis
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
      }
      return event;
    },
  });

  logger.info('Sentry initialized successfully');
};

// Configuração do Prometheus - versão simplificada
const register = new client.Registry();

// Coletar métricas padrão do Node.js primeiro
client.collectDefaultMetrics({ 
  register,
  timeout: 5000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  eventLoopMonitoringPrecision: 10
});

// Métricas customizadas
export const metrics = {
  // Contador de requests HTTP
  httpRequestsTotal: new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
  }),
  
  // Histograma de duração de requests
  httpRequestDuration: new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
    registers: [register]
  }),
  
  // Gauge para conexões ativas
  activeConnections: new client.Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    registers: [register]
  }),
  
  // Contador de erros
  errorsTotal: new client.Counter({
    name: 'errors_total',
    help: 'Total number of errors',
    labelNames: ['type', 'route'],
    registers: [register]
  }),
  
  // Gauge para uso de memória
  memoryUsage: new client.Gauge({
    name: 'memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'],
    registers: [register]
  }),
  
  // Contador de tentativas de autenticação
  authAttempts: new client.Counter({
    name: 'auth_attempts_total',
    help: 'Total number of authentication attempts',
    labelNames: ['type', 'status'],
    registers: [register]
  }),
  
  // Gauge para usuários ativos
  activeUsers: new client.Gauge({
    name: 'active_users',
    help: 'Number of active users',
    registers: [register]
  }),
  
  // Contador de uploads de arquivos
  fileUploads: new client.Counter({
    name: 'file_uploads_total',
    help: 'Total number of file uploads',
    labelNames: ['type', 'status'],
    registers: [register]
  }),
  
  // Histograma de tamanho de arquivos
  fileSize: new client.Histogram({
    name: 'file_size_bytes',
    help: 'Size of uploaded files in bytes',
    buckets: [1024, 10240, 102400, 1048576, 10485760], // 1KB, 10KB, 100KB, 1MB, 10MB
    registers: [register]
  }),
  
  // Contador de rate limiting
  rateLimitBlocks: new client.Counter({
    name: 'rate_limit_blocks_total',
    help: 'Total number of rate limit blocks',
    labelNames: ['limiter_type', 'endpoint', 'user_id'],
    registers: [register]
  }),
  
  // Gauge para rate limit atual
  rateLimitCurrent: new client.Gauge({
    name: 'rate_limit_current_usage',
    help: 'Current rate limit usage',
    labelNames: ['limiter_type', 'endpoint', 'user_id'],
    registers: [register]
  }),
  
  // Contador de rate limit reset time
  rateLimitResetTime: new client.Histogram({
    name: 'rate_limit_reset_time_seconds',
    help: 'Time until rate limit reset in seconds',
    labelNames: ['limiter_type', 'endpoint'],
    buckets: [60, 300, 900, 1800, 3600], // 1min, 5min, 15min, 30min, 1h
    registers: [register]
  }),

  // === MÉTRICAS DE PERFORMANCE ===
  
  // Histograma de performance para endpoints críticos
  performanceHistogram: new client.Histogram({
    name: 'endpoint_performance_duration_ms',
    help: 'Performance duration of critical endpoints in milliseconds',
    labelNames: ['method', 'endpoint', 'status_code', 'status_class', 'category', 'critical'],
    buckets: [10, 50, 100, 250, 500, 1000, 2000, 5000, 10000], // ms
    registers: [register]
  }),

  // Contador de requisições por endpoint
  performanceCounter: new client.Counter({
    name: 'endpoint_requests_total',
    help: 'Total number of requests per endpoint',
    labelNames: ['method', 'endpoint', 'status_code', 'status_class', 'category', 'critical'],
    registers: [register]
  }),

  // Summary para percentis de performance
  performanceSummary: new client.Summary({
    name: 'endpoint_performance_summary_ms',
    help: 'Summary of endpoint performance in milliseconds',
    labelNames: ['method', 'endpoint', 'category', 'critical'],
    percentiles: [0.5, 0.9, 0.95, 0.99],
    registers: [register]
  }),

  // Gauge para métricas de memória por endpoint
  performanceGauge: new client.Gauge({
    name: 'endpoint_memory_usage_bytes',
    help: 'Memory usage per endpoint in bytes',
    labelNames: ['method', 'endpoint', 'category', 'critical', 'metric'],
    registers: [register]
  }),

  // Contador de alertas de performance
  performanceAlerts: new client.Counter({
    name: 'performance_alerts_total',
    help: 'Total number of performance alerts triggered',
    labelNames: ['endpoint', 'alert_type', 'severity'],
    registers: [register]
  }),

  // Gauge para threshold de performance
  performanceThresholds: new client.Gauge({
    name: 'endpoint_performance_thresholds_ms',
    help: 'Performance thresholds for endpoints in milliseconds',
    labelNames: ['endpoint', 'category'],
    registers: [register]
  }),

  // Histograma de queries de banco por endpoint
  databaseQueries: new client.Histogram({
    name: 'database_queries_per_request',
    help: 'Number of database queries per request',
    labelNames: ['endpoint', 'category'],
    buckets: [1, 2, 5, 10, 20, 50],
    registers: [register]
  }),

  // Gauge para cache hit rate
  cacheHitRate: new client.Gauge({
    name: 'cache_hit_rate_percent',
    help: 'Cache hit rate percentage',
    labelNames: ['endpoint', 'cache_type'],
    registers: [register]
  })
};

// Middleware para coletar métricas de HTTP
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Incrementar conexões ativas
  metrics.activeConnections.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    // Registrar métricas
    metrics.httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode
    });
    
    metrics.httpRequestDuration.observe({
      method: req.method,
      route: route,
      status_code: res.statusCode
    }, duration);
    
    // Decrementar conexões ativas
    metrics.activeConnections.dec();
  });
  
  next();
};

// Função para atualizar métricas de memória
export const updateMemoryMetrics = () => {
  const memUsage = process.memoryUsage();
  metrics.memoryUsage.set({ type: 'rss' }, memUsage.rss);
  metrics.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
  metrics.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
  metrics.memoryUsage.set({ type: 'external' }, memUsage.external);
};

// Atualizar métricas de memória a cada 30 segundos
setInterval(updateMemoryMetrics, 30000);

// Endpoint para expor métricas
export const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
};

// Função para registrar métricas customizadas
export const recordCustomMetric = (metricName, value, labels = {}) => {
  try {
    if (metrics[metricName]) {
      if (typeof metrics[metricName].inc === 'function') {
        metrics[metricName].inc(labels, value);
      } else if (typeof metrics[metricName].set === 'function') {
        metrics[metricName].set(labels, value);
      } else if (typeof metrics[metricName].observe === 'function') {
        metrics[metricName].observe(labels, value);
      }
    }
  } catch (error) {
    console.error('Error recording custom metric:', error);
  }
};

// Handlers do Sentry - versão simplificada
export const sentryErrorHandler = (err, req, res, next) => {
  if (err.status >= 500) {
    Sentry.captureException(err);
  }
  next(err);
};

export const sentryRequestHandler = (req, res, next) => {
  Sentry.addBreadcrumb({
    message: `${req.method} ${req.url}`,
    category: 'http',
    level: 'info'
  });
  next();
};

export const sentryTracingHandler = (req, res, next) => {
  // Middleware de tracing simplificado
  next();
};

// Funções para capturar erros e mensagens
export const captureException = (error, context = {}) => {
  try {
    Sentry.withScope((scope) => {
      Object.keys(context).forEach(key => {
        scope.setTag(key, context[key]);
      });
      Sentry.captureException(error);
    });
  } catch (err) {
    console.error('Error capturing exception:', err);
  }
};

export const captureMessage = (message, level = 'info', context = {}) => {
  try {
    Sentry.withScope((scope) => {
      Object.keys(context).forEach(key => {
        scope.setTag(key, context[key]);
      });
      Sentry.captureMessage(message, level);
    });
  } catch (err) {
    console.error('Error capturing message:', err);
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      memory: {
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      },
      environment: process.env.NODE_ENV || 'development'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Exportar métricas específicas de performance
export const {
  performanceHistogram,
  performanceCounter,
  performanceSummary,
  performanceGauge,
  performanceAlerts,
  performanceThresholds,
  databaseQueries,
  cacheHitRate
} = metrics;

export { register };
export default { initializeSentry, metrics, metricsMiddleware, captureException, captureMessage };