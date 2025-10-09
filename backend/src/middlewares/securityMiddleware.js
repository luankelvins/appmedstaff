import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
// import xss from 'xss'; // Temporariamente removido para debug

// Configuração segura para XSS
const xssOptions = {
  whiteList: {}, // Lista vazia - remove todas as tags HTML
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script'],
  css: false // Desabilita processamento CSS para evitar erro "ruleset"
};

// Configuração básica do Helmet com headers de segurança
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  xssFilter: true
});

// Rate limiting simples
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});

// Rate limiting para autenticação
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5 // máximo 5 tentativas de login por IP
});

// Rate limiting estrito
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3 // máximo 3 tentativas por IP
});

// Sanitização básica
export const sanitizeInput = mongoSanitize();

// Proteção contra parameter pollution
export const parameterPollutionProtection = hpp();

// Proteção XSS básica - temporariamente desabilitada
export const xssProtection = (req, res, next) => {
  // Temporariamente desabilitado para debug
  next();
};

function sanitizeObject(obj) {
  // Temporariamente desabilitado para debug
  return obj;
}

// Validação básica de Content-Type
export const validateContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({ error: 'Content-Type deve ser application/json' });
    }
  }
  next();
};

// Validação básica de User-Agent
export const validateUserAgent = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  if (!userAgent) {
    return res.status(400).json({ error: 'User-Agent é obrigatório' });
  }
  next();
};

// Detecção básica de bots
export const botDetection = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const suspiciousBots = [
    'sqlmap', 'nikto', 'nmap', 'masscan', 'zap', 'burp',
    'acunetix', 'nessus', 'openvas', 'w3af'
  ];
  
  if (suspiciousBots.some(bot => userAgent.toLowerCase().includes(bot))) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
};

// Logger de segurança básico
export const securityLogger = (req, res, next) => {
  const securityInfo = {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  };
  
  // Log apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('Security Info:', securityInfo);
  }
  
  next();
};

export const securityMiddlewares = [
  helmetConfig,
  generalRateLimit,
  sanitizeInput,
  parameterPollutionProtection,
  xssProtection,
  validateContentType,
  validateUserAgent,
  botDetection,
  securityLogger
];