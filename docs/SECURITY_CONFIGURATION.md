# Configurações de Segurança - AppMedStaff Backend

## Visão Geral

Este documento descreve as configurações de segurança implementadas no backend do AppMedStaff, incluindo gerenciamento centralizado de variáveis de ambiente, rate limiting e práticas de segurança.

## Configuração Centralizada de Ambiente

### Arquivo: `backend/src/config/environment.js`

O sistema utiliza um arquivo de configuração centralizado que:
- Valida todas as variáveis de ambiente na inicialização
- Fornece valores padrão seguros
- Organiza configurações por categoria
- Oferece funções utilitárias para verificar o ambiente

### Categorias de Configuração

#### 1. Servidor
```javascript
server: {
  port: process.env.PORT || 3001,
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development'
}
```

#### 2. Banco de Dados
```javascript
database: {
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  // ... outras configurações
}
```

#### 3. JWT (JSON Web Tokens)
```javascript
jwt: {
  secret: process.env.VITE_JWT_SECRET,
  expiresIn: process.env.VITE_JWT_EXPIRES_IN || '24h',
  refreshSecret: process.env.VITE_JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.VITE_JWT_REFRESH_EXPIRES_IN || '7d'
}
```

#### 4. Reset de Senha
```javascript
passwordReset: {
  secret: process.env.PASSWORD_RESET_SECRET,
  expiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || '1h',
  tokenLength: parseInt(process.env.PASSWORD_RESET_TOKEN_LENGTH) || 32
}
```

#### 5. Configurações de Email
```javascript
email: {
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  // ... outras configurações
}
```

#### 6. Segurança
```javascript
security: {
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
  sessionSecret: process.env.SESSION_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  encryptionKey: process.env.ENCRYPTION_KEY
}
```

## Sistema de Rate Limiting

### Arquivo: `backend/src/middleware/rateLimiter.js`

Implementamos rate limiting específico para diferentes endpoints usando `express-rate-limit`.

### Rate Limiters Implementados

#### 1. Login Limiter
- **Janela**: Configurável via `RATE_LIMIT_LOGIN_WINDOW` (padrão: 15 minutos)
- **Máximo**: Configurável via `RATE_LIMIT_LOGIN_MAX_ATTEMPTS` (padrão: 5 tentativas)
- **Identificação**: IP + email
- **Comportamento**: Não conta requests bem-sucedidos

#### 2. Register Limiter
- **Janela**: Configurável via `RATE_LIMIT_REGISTER_WINDOW` (padrão: 60 minutos)
- **Máximo**: Configurável via `RATE_LIMIT_REGISTER_MAX_ATTEMPTS` (padrão: 3 tentativas)
- **Identificação**: IP

#### 3. Password Reset Limiter
- **Janela**: Configurável via `RATE_LIMIT_PASSWORD_RESET_WINDOW` (padrão: 60 minutos)
- **Máximo**: Configurável via `RATE_LIMIT_PASSWORD_RESET_MAX_ATTEMPTS` (padrão: 3 tentativas)
- **Identificação**: IP + email

#### 4. API General Limiter
- **Janela**: Configurável via `RATE_LIMIT_API_WINDOW` (padrão: 15 minutos)
- **Máximo**: Configurável via `RATE_LIMIT_API_MAX_REQUESTS` (padrão: 100 requests)
- **Identificação**: IP

#### 5. Refresh Token Limiter
- **Janela**: 15 minutos (fixo)
- **Máximo**: 10 tentativas
- **Identificação**: IP

### Aplicação nas Rotas

As rotas de autenticação (`authRoutes.js`) foram atualizadas para usar os rate limiters específicos:

```javascript
// Login com rate limiting específico
router.post('/login', loginLimiter, validateLogin, AuthController.login);

// Registro com rate limiting específico
router.post('/register', registerLimiter, validateRegister, AuthController.register);

// Reset de senha com rate limiting específico
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, AuthController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validateResetPassword, AuthController.resetPassword);

// Refresh token com rate limiting específico
router.post('/refresh-token', refreshTokenLimiter, AuthController.refreshToken);

// Outras rotas com rate limiting geral
router.get('/me', authenticateToken, apiLimiter, AuthController.getCurrentUser);
```

## Variáveis de Ambiente Obrigatórias

### Arquivo: `backend/.env.example`

```bash
# Servidor
PORT=3001
HOST=localhost
NODE_ENV=development

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/appmedstaff
DB_HOST=localhost
DB_PORT=5432
DB_NAME=appmedstaff
DB_USER=your_user
DB_PASSWORD=your_password

# JWT
VITE_JWT_SECRET=your-super-secret-jwt-key-here
VITE_JWT_EXPIRES_IN=24h
VITE_JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
VITE_JWT_REFRESH_EXPIRES_IN=7d

# Reset de Senha
PASSWORD_RESET_SECRET=your-password-reset-secret-here
PASSWORD_RESET_EXPIRES_IN=1h
PASSWORD_RESET_TOKEN_LENGTH=32

# Email
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=AppMedStaff
EMAIL_FROM_ADDRESS=noreply@appmedstaff.com

# URLs do Frontend
FRONTEND_URL=http://localhost:5173
PASSWORD_RESET_URL=http://localhost:5173/reset-password

# Segurança
SESSION_SECRET=your-session-secret-here
COOKIE_SECRET=your-cookie-secret-here
ENCRYPTION_KEY=your-32-character-encryption-key
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_LOGIN_WINDOW=900
RATE_LIMIT_LOGIN_MAX_ATTEMPTS=5
RATE_LIMIT_REGISTER_WINDOW=3600
RATE_LIMIT_REGISTER_MAX_ATTEMPTS=3
RATE_LIMIT_PASSWORD_RESET_WINDOW=3600
RATE_LIMIT_PASSWORD_RESET_MAX_ATTEMPTS=3
RATE_LIMIT_API_WINDOW=900
RATE_LIMIT_API_MAX_REQUESTS=100

# Timeouts (em segundos)
LOGIN_ATTEMPT_TIMEOUT=300
PASSWORD_RESET_CLEANUP_TIMEOUT=3600
TOKEN_BLACKLIST_CLEANUP_TIMEOUT=86400

# Validação
MIN_PASSWORD_LENGTH=8
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=1800

# Monitoramento
ENABLE_METRICS=true
METRICS_PORT=9090

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## Melhorias de Segurança Implementadas

### 1. AuthService Atualizado
- Uso de configurações centralizadas em vez de `process.env` direto
- Validação de configurações na inicialização
- Melhores práticas de hashing de senhas
- Tokens JWT com configurações seguras

### 2. Rate Limiting Granular
- Limitação específica por tipo de endpoint
- Identificação inteligente (IP + email para login)
- Headers padronizados de rate limit
- Mensagens de erro informativas

### 3. Validação de Ambiente
- Verificação de variáveis obrigatórias na inicialização
- Valores padrão seguros
- Funções utilitárias para verificar ambiente

### 4. Configuração de Segurança
- Bcrypt com salt rounds configurável
- Secrets separados para diferentes funcionalidades
- Timeouts configuráveis
- Configurações de validação flexíveis

## Testes

### Testes Unitários
- Todos os métodos do `AuthController` testados
- Cobertura de casos de sucesso e erro
- Mocks apropriados para dependências
- Validação de rate limiting

### Comando para Executar Testes
```bash
cd backend
npm test -- authController.test.js
```

## Próximos Passos

1. **Configurar Serviço de Email**: Implementar integração com provedor de email para reset de senha
2. **Monitoramento**: Adicionar métricas de rate limiting e tentativas de login
3. **Logs de Segurança**: Implementar logging detalhado de eventos de segurança
4. **Testes de Integração**: Criar testes para validar rate limiting em ambiente real
5. **Documentação de API**: Atualizar documentação da API com informações de rate limiting

## Considerações de Produção

### Variáveis de Ambiente Críticas
- Sempre use secrets fortes e únicos em produção
- Nunca commite arquivos `.env` no repositório
- Use serviços de gerenciamento de secrets (AWS Secrets Manager, etc.)
- Rotacione secrets regularmente

### Rate Limiting
- Monitore métricas de rate limiting
- Ajuste limites baseado no uso real
- Considere usar Redis para rate limiting distribuído
- Implemente alertas para tentativas de abuso

### Segurança Geral
- Mantenha dependências atualizadas
- Use HTTPS em produção
- Implemente logging de segurança
- Monitore tentativas de login suspeitas
- Configure CORS adequadamente