import { logger, requestLogger, errorLogger, logError, logSecurity } from '../config/logger.js';

// Middleware de log de requests usando Winston
export const logMiddleware = requestLogger;

// Middleware de erro melhorado
export const errorMiddleware = (error, req, res, next) => {
  // Log do erro
  logError(error, req, {
    errorType: error.name,
    statusCode: error.statusCode || 500
  });
  
  // Log de segurança para erros suspeitos
  if (error.statusCode === 401 || error.statusCode === 403) {
    logSecurity('UNAUTHORIZED_ACCESS_ATTEMPT', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      error: error.message
    });
  }
  
  // Resposta baseada no ambiente
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.statusCode || 500).json({
    message: error.message || 'Erro interno do servidor',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  });
};

// Middleware para rotas não encontradas
export const notFoundMiddleware = (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  res.status(404).json({
    message: 'Rota não encontrada',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

// Middleware para adicionar ID único a cada request
export const requestIdMiddleware = (req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Middleware para log de performance
export const performanceMiddleware = (req, res, next) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    // Log requests lentos (> 1 segundo)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration: `${duration.toFixed(2)}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  next();
};