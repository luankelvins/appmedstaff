import rateLimit from 'express-rate-limit';
import { config } from '../config/environment.js';
import securityLogger from '../services/securityLogger.js';
import { alertService } from '../services/alertService.js';
import { extractRequestInfo, extractEmailFromRequest } from '../utils/requestUtils.js';

// Rate limiter para login
export const loginLimiter = rateLimit({
  windowMs: config.rateLimiting.loginWindow * 1000, // Janela de tempo em ms
  max: config.rateLimiting.loginMaxAttempts, // Máximo de tentativas por janela
  message: {
    error: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
    retryAfter: Math.ceil(config.rateLimiting.loginWindow / 60) // em minutos
  },
  standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  skipSuccessfulRequests: true, // Não conta requests bem-sucedidos
  keyGenerator: (req) => {
    // Usar IP + email (se fornecido) para identificar tentativas
    const email = req.body?.email || '';
    return `${req.ip}:${email}`;
  },
  handler: async (req, res) => {
    // Log bloqueio por rate limiting
    const { ip, userAgent } = extractRequestInfo(req);
    const email = extractEmailFromRequest(req);
    
    await securityLogger.logRateLimitBlock({
      endpoint: '/login',
      ip,
      userAgent,
      email,
      limit: config.rateLimiting.loginMaxAttempts,
      windowMs: config.rateLimiting.loginWindow * 1000
    });
    
    // Registrar evento para sistema de alertas
    alertService.recordRateLimitBlock({
      ip,
      endpoint: '/login',
      userId: email,
      userAgent
    });
    
    res.status(429).json({
      error: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
      retryAfter: Math.ceil(config.rateLimiting.loginWindow / 60)
    });
  }
});

// Rate limiter para registro
export const registerLimiter = rateLimit({
  windowMs: config.rateLimiting.registerWindow * 1000,
  max: config.rateLimiting.registerMaxAttempts,
  message: {
    error: 'Muitas tentativas de registro. Tente novamente em alguns minutos.',
    retryAfter: Math.ceil(config.rateLimiting.registerWindow / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: async (req, res) => {
    // Log bloqueio por rate limiting
    const { ip, userAgent } = extractRequestInfo(req);
    const email = extractEmailFromRequest(req);
    
    await securityLogger.logRateLimitBlock({
      endpoint: '/register',
      ip,
      userAgent,
      email,
      limit: config.rateLimiting.registerMaxAttempts,
      windowMs: config.rateLimiting.registerWindow * 1000
    });
    
    // Registrar evento para sistema de alertas
    alertService.recordRateLimitBlock({
      ip,
      endpoint: '/register',
      userId: email,
      userAgent
    });
    
    res.status(429).json({
      error: 'Muitas tentativas de registro. Tente novamente em alguns minutos.',
      retryAfter: Math.ceil(config.rateLimiting.registerWindow / 60)
    });
  }
});

// Rate limiter para reset de senha
export const passwordResetLimiter = rateLimit({
  windowMs: config.rateLimiting.passwordResetWindow * 1000,
  max: config.rateLimiting.passwordResetMaxAttempts,
  message: {
    error: 'Muitas tentativas de reset de senha. Tente novamente em alguns minutos.',
    retryAfter: Math.ceil(config.rateLimiting.passwordResetWindow / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email || '';
    return `${req.ip}:${email}`;
  },
  handler: async (req, res) => {
    // Log bloqueio por rate limiting
    const { ip, userAgent } = extractRequestInfo(req);
    const email = extractEmailFromRequest(req);
    
    await securityLogger.logRateLimitBlock({
      endpoint: '/forgot-password',
      ip,
      userAgent,
      email,
      limit: config.rateLimiting.passwordResetMaxAttempts,
      windowMs: config.rateLimiting.passwordResetWindow * 1000
    });
    
    res.status(429).json({
      error: 'Muitas tentativas de reset de senha. Tente novamente em alguns minutos.',
      retryAfter: Math.ceil(config.rateLimiting.passwordResetWindow / 60)
    });
  }
});

// Rate limiter geral para API
export const apiLimiter = rateLimit({
  windowMs: config.rateLimiting.apiWindow * 1000,
  max: config.rateLimiting.apiMaxRequests,
  message: {
    error: 'Muitas requisições. Tente novamente em alguns minutos.',
    retryAfter: Math.ceil(config.rateLimiting.apiWindow / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas requisições. Tente novamente em alguns minutos.',
      retryAfter: Math.ceil(config.rateLimiting.apiWindow / 60)
    });
  }
});

// Rate limiter para refresh token
export const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 refresh por 15 minutos
  message: {
    error: 'Muitas tentativas de refresh token. Tente novamente em alguns minutos.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas tentativas de refresh token. Tente novamente em alguns minutos.',
      retryAfter: 15
    });
  }
});

// Rate limiter para verificação de token 2FA
export const twoFactorVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 tentativas de verificação por 15 minutos
  message: {
    error: 'Muitas tentativas de verificação 2FA. Tente novamente em alguns minutos.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usar IP + userId para identificar tentativas
    const userId = req.user?.id || req.body?.userId || '';
    return `${req.ip}:${userId}`;
  },
  handler: async (req, res) => {
    const { ip, userAgent } = extractRequestInfo(req);
    const userId = req.user?.id || req.body?.userId;
    
    await securityLogger.logRateLimitBlock({
      endpoint: '/2fa/verify',
      ip,
      userAgent,
      userId,
      limit: 10,
      windowMs: 15 * 60 * 1000
    });
    
    res.status(429).json({
      error: 'Muitas tentativas de verificação 2FA. Tente novamente em alguns minutos.',
      retryAfter: 15
    });
  }
});

// Rate limiter para habilitação/desabilitação de 2FA
export const twoFactorSetupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutos
  max: 5, // Máximo 5 tentativas de setup por hora
  message: {
    error: 'Muitas tentativas de configuração 2FA. Tente novamente em uma hora.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usar IP + userId para identificar tentativas
    const userId = req.user?.id || '';
    return `${req.ip}:${userId}`;
  },
  handler: async (req, res) => {
    const { ip, userAgent } = extractRequestInfo(req);
    const userId = req.user?.userId || req.user?.id;
    
    await securityLogger.logRateLimitBlock({
      endpoint: '/2fa/setup',
      ip,
      userAgent,
      userId,
      limit: 5,
      windowMs: 60 * 60 * 1000
    });
    
    res.status(429).json({
      error: 'Muitas tentativas de configuração 2FA. Tente novamente em uma hora.',
      retryAfter: 60
    });
  }
});

// Rate limiter para regeneração de códigos de backup
export const twoFactorBackupLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 3, // Máximo 3 regenerações por dia
  message: {
    error: 'Muitas tentativas de regeneração de códigos de backup. Tente novamente amanhã.',
    retryAfter: 24 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usar IP + userId para identificar tentativas
    const userId = req.user?.id || '';
    return `${req.ip}:${userId}`;
  },
  handler: async (req, res) => {
    const { ip, userAgent } = extractRequestInfo(req);
    const userId = req.user?.userId || req.user?.id;
    
    await securityLogger.logRateLimitBlock({
      endpoint: '/2fa/backup-codes',
      ip,
      userAgent,
      userId,
      limit: 3,
      windowMs: 24 * 60 * 60 * 1000
    });
    
    res.status(429).json({
      error: 'Muitas tentativas de regeneração de códigos de backup. Tente novamente amanhã.',
      retryAfter: 24 * 60
    });
  }
});