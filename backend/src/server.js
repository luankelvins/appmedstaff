import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
// Importar rotas
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import twoFactorRoutes from './routes/twoFactorRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import securityDashboardRoutes from './routes/securityDashboardRoutes.js';
import { 
  logMiddleware, 
  errorMiddleware, 
  notFoundMiddleware, 
  requestIdMiddleware, 
  performanceMiddleware 
} from './middlewares/logMiddleware.js';
import { 
  performanceMiddleware as advancedPerformanceMiddleware,
  authPerformanceMiddleware,
  dashboardPerformanceMiddleware 
} from './middlewares/performanceMiddleware.js';
import { 
  helmetConfig, 
  generalRateLimit, 
  sanitizeInput, 
  parameterPollutionProtection, 
  xssProtection, 
  validateContentType, 
  validateUserAgent, 
  botDetection, 
  securityLogger 
} from './middlewares/securityMiddleware.js';
import { sanitizeInput as validationSanitize } from './middlewares/validationMiddleware-simple.js';
import { logger } from './config/logger.js';
import { 
  initializeSentry, 
  metricsMiddleware, 
  metricsEndpoint, 
  sentryRequestHandler, 
  sentryTracingHandler, 
  sentryErrorHandler,
  healthCheck 
} from './config/monitoring.js';
import { specs, swaggerUi } from './config/swagger.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Sentry
initializeSentry(app);

// Trust proxy para obter IP real em produção
app.set('trust proxy', 1);

// Middlewares do Sentry (devem vir antes de outros middlewares)
app.use(sentryRequestHandler);
app.use(sentryTracingHandler);

// Middlewares de segurança (ordem importante)
app.use(helmetConfig); // Headers de segurança
app.use(compression()); // Compressão de resposta
app.use(requestIdMiddleware); // ID único para cada request
app.use(securityLogger); // Log de segurança
app.use(botDetection); // Detecção de bots maliciosos
// app.use(generalRateLimit); // Rate limiting geral - temporariamente desabilitado
app.use(validateUserAgent); // Validação de User-Agent

// CORS configurado
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Permitir requests sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin, ip: 'unknown' });
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Request-ID']
}));

// Middlewares de parsing e sanitização
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Verificar se o JSON é válido
    try {
      JSON.parse(buf);
    } catch (e) {
      logger.warn('Invalid JSON received', {
        ip: req.ip,
        path: req.path,
        error: e.message
      });
      throw new Error('JSON inválido');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(validateContentType); // Validação de Content-Type
app.use(sanitizeInput); // Sanitização contra NoSQL injection
// app.use(parameterPollutionProtection); // Proteção contra parameter pollution - temporariamente desabilitado
app.use(xssProtection); // Proteção XSS
app.use(validationSanitize); // Sanitização adicional

// Middlewares de logging e performance
// app.use(logMiddleware); // Log de requests - temporariamente desabilitado
// app.use(performanceMiddleware); // Monitoramento de performance - temporariamente desabilitado
app.use(metricsMiddleware); // Coleta de métricas
app.use(advancedPerformanceMiddleware); // Métricas avançadas de performance

// Endpoints de monitoramento
app.get('/metrics', metricsEndpoint);

// Rota de health check avançado
app.get('/api/health', async (req, res) => {
  try {
    const health = await healthCheck();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rota de health check simples (antes das rotas principais)
app.get('/api/health/simple', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    requestId: req.id
  };
  
  logger.info('Health check accessed', { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  });
  
  res.json(healthData);
});

// Documentação Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MedStaff API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// Endpoint para obter especificação OpenAPI em JSON
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Rotas principais com middlewares específicos de performance
app.use('/api/auth', authPerformanceMiddleware, authRoutes);
app.use('/api/dashboard', dashboardPerformanceMiddleware, dashboardRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/security-dashboard', securityDashboardRoutes);

// Middlewares de erro (devem vir por último)
app.use(sentryErrorHandler); // Sentry error handler deve vir antes do error middleware
app.use(errorMiddleware);
app.use(notFoundMiddleware);

app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
  console.log(`📊 Dashboard endpoints: http://localhost:${PORT}/api/dashboard/*`);
  console.log(`🔒 2FA endpoints: http://localhost:${PORT}/api/2fa/*`);
});