import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir níveis de log customizados
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  security: 5
};

// Cores para cada nível
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
  security: 'cyan'
};

winston.addColors(logColors);

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Formato para console
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Configuração de transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }),
  
  // Arquivo para todos os logs
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: logFormat,
    maxsize: parseInt(process.env.LOG_FILE_MAX_SIZE) || 20971520, // 20MB por padrão
    maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES) || 5,
    tailable: true
  }),
  
  // Arquivo específico para erros
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: logFormat,
    maxsize: parseInt(process.env.LOG_FILE_MAX_SIZE) || 20971520, // 20MB por padrão
    maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES) || 5,
    tailable: true
  }),
  
  // Arquivo específico para logs de segurança
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/security.log'),
    level: 'security',
    format: logFormat,
    maxsize: parseInt(process.env.LOG_FILE_MAX_SIZE) || 20971520, // 20MB por padrão
    maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES) || 5,
    tailable: true
  }),
  
  // Arquivo específico para requests HTTP
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/http.log'),
    level: 'http',
    format: logFormat,
    maxsize: parseInt(process.env.LOG_FILE_MAX_SIZE) || 20971520, // 20MB por padrão
    maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES) || 5,
    tailable: true
  })
];

// Adicionar transport para produção (ex: Elasticsearch, CloudWatch)
if (process.env.NODE_ENV === 'production') {
  // Aqui você pode adicionar transports para serviços de log em nuvem
  // Exemplo: ElasticSearch, AWS CloudWatch, etc.
}

// Criar logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: logFormat,
  defaultMeta: { service: 'appmedstaff-backend' },
  transports,
  exitOnError: false
});

// Logger específico para auditoria
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/audit.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10
    })
  ]
});

// Logger específico para performance
const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/performance.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Funções utilitárias para logging
export const logRequest = (req, res, responseTime) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    contentLength: res.get('Content-Length'),
    timestamp: new Date().toISOString()
  });
};

export const logError = (error, req = null, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context
  };
  
  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
      params: req.params,
      query: req.query
    };
  }
  
  logger.error('Application Error', errorInfo);
};

export const logSecurity = (event, details = {}) => {
  logger.log('security', 'Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

export const logAudit = (action, userId, details = {}) => {
  auditLogger.info('Audit Log', {
    action,
    userId,
    ...details,
    timestamp: new Date().toISOString()
  });
};

export const logPerformance = (operation, duration, details = {}) => {
  performanceLogger.info('Performance Log', {
    operation,
    duration: `${duration}ms`,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Middleware para logging de requests
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logRequest(req, res, duration);
  });
  
  next();
};

// Middleware para captura de erros não tratados
export const errorLogger = (error, req, res, next) => {
  logError(error, req);
  next(error);
};

// Configurar captura de exceções não tratadas
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // Graceful shutdown
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason,
    promise: promise,
    timestamp: new Date().toISOString()
  });
});

export { logger, auditLogger, performanceLogger };
export default logger;