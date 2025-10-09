import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Configuração centralizada de variáveis de ambiente
 * Inclui validação e valores padrão para desenvolvimento
 */
export const config = {
  // Configuração do Servidor
  server: {
    port: parseInt(process.env.PORT) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  },

  // Configuração do Banco de Dados
  database: {
    host: process.env.VITE_DB_HOST || 'localhost',
    port: parseInt(process.env.VITE_DB_PORT) || 5432,
    name: process.env.VITE_DB_NAME || 'appmedstaff',
    user: process.env.VITE_DB_USER || 'postgres',
    password: process.env.VITE_DB_PASSWORD || 'postgres',
  },

  // Configuração JWT
  jwt: {
    secret: process.env.VITE_JWT_SECRET || 'default-jwt-secret-for-development',
    expiresIn: process.env.VITE_JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.VITE_JWT_REFRESH_SECRET || 'default-refresh-secret-for-development',
    refreshExpiresIn: process.env.VITE_JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Configuração de Reset de Senha
  passwordReset: {
    secret: process.env.PASSWORD_RESET_SECRET || 'default-password-reset-secret',
    expiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || '1h',
    tokenLength: parseInt(process.env.PASSWORD_RESET_TOKEN_LENGTH) || 32,
    cleanupInterval: process.env.PASSWORD_RESET_CLEANUP_INTERVAL || '1h',
  },

  // Configuração de Email
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    fromName: process.env.EMAIL_FROM_NAME || 'AppMedStaff',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@appmedstaff.com',
  },

  // URLs do Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    resetPasswordUrl: process.env.RESET_PASSWORD_URL || 'http://localhost:3000/reset-password',
  },

  // Configurações de Segurança
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'default-session-secret-for-development',
    cookieSecret: process.env.COOKIE_SECRET || 'default-cookie-secret-for-development',
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key-dev',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
    strictMaxRequests: parseInt(process.env.STRICT_RATE_LIMIT_MAX) || 3,
  },

  // Configurações específicas de Rate Limiting
  rateLimiting: {
    // Login
    loginWindow: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW) || 900, // 15 minutos em segundos
    loginMaxAttempts: parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 10, // Aumentado para testes
    
    // Registro
    registerWindow: parseInt(process.env.REGISTER_RATE_LIMIT_WINDOW) || 3600, // 1 hora
    registerMaxAttempts: parseInt(process.env.REGISTER_RATE_LIMIT_MAX) || 5,
    
    // Reset de senha
    passwordResetWindow: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_WINDOW) || 3600, // 1 hora
    passwordResetMaxAttempts: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_MAX) || 5,
    
    // API geral
    apiWindow: parseInt(process.env.API_RATE_LIMIT_WINDOW) || 900, // 15 minutos
    apiMaxRequests: parseInt(process.env.API_RATE_LIMIT_MAX) || 100,
  },

  // Configurações de Timeout
  timeouts: {
    loginAttempt: process.env.LOGIN_ATTEMPT_TIMEOUT || '15m',
    tokenBlacklistCleanup: process.env.TOKEN_BLACKLIST_CLEANUP_INTERVAL || '24h',
  },

  // Configurações de Validação
  validation: {
    minPasswordLength: parseInt(process.env.MIN_PASSWORD_LENGTH) || 8,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    accountLockoutDuration: process.env.ACCOUNT_LOCKOUT_DURATION || '30m',
  },

  // Monitoramento
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    sentryEnvironment: process.env.SENTRY_ENVIRONMENT || 'development',
    sentryTracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 1.0,
    sentryProfilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 1.0,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    fileMaxSize: parseInt(process.env.LOG_FILE_MAX_SIZE) || 20971520,
    fileMaxFiles: parseInt(process.env.LOG_FILE_MAX_FILES) || 5,
  },
};

/**
 * Validação de variáveis de ambiente críticas
 */
export function validateEnvironment() {
  const errors = [];

  // Validar JWT secrets em produção
  if (config.server.nodeEnv === 'production') {
    if (config.jwt.secret === 'default-jwt-secret-for-development') {
      errors.push('VITE_JWT_SECRET deve ser definido em produção');
    }
    if (config.jwt.refreshSecret === 'default-refresh-secret-for-development') {
      errors.push('VITE_JWT_REFRESH_SECRET deve ser definido em produção');
    }
    if (config.security.sessionSecret === 'default-session-secret-for-development') {
      errors.push('SESSION_SECRET deve ser definido em produção');
    }
    if (config.security.encryptionKey === 'default-32-char-encryption-key-dev') {
      errors.push('ENCRYPTION_KEY deve ser definido em produção');
    }
  }

  // Validar configurações de email se funcionalidade estiver habilitada
  if (config.email.user && !config.email.password) {
    errors.push('EMAIL_PASSWORD deve ser definido quando EMAIL_USER estiver configurado');
  }

  // Validar configurações de banco de dados
  if (!config.database.host || !config.database.name) {
    errors.push('Configurações de banco de dados são obrigatórias');
  }

  if (errors.length > 0) {
    console.error('❌ Erros de configuração de ambiente:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    if (config.server.nodeEnv === 'production') {
      throw new Error('Configuração de ambiente inválida para produção');
    } else {
      console.warn('⚠️  Usando valores padrão para desenvolvimento');
    }
  }

  console.log('✅ Configuração de ambiente validada com sucesso');
}

/**
 * Função para obter configuração específica
 */
export function getConfig(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], config);
}

/**
 * Função para verificar se estamos em ambiente de desenvolvimento
 */
export function isDevelopment() {
  return config.server.nodeEnv === 'development';
}

/**
 * Função para verificar se estamos em ambiente de produção
 */
export function isProduction() {
  return config.server.nodeEnv === 'production';
}

/**
 * Função para verificar se estamos em ambiente de teste
 */
export function isTest() {
  return config.server.nodeEnv === 'test';
}

// Validar ambiente na inicialização
validateEnvironment();