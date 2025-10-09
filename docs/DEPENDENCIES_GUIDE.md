# 📦 Guia Completo de Dependências - AppMedStaff

## 🎯 Visão Geral
Este documento lista todas as dependências instaladas no projeto AppMedStaff, organizadas por categoria e funcionalidade.

## 🔧 Backend Dependencies

### 📱 Comunicação e Integração
- **@whiskeysockets/baileys** - Biblioteca para integração com WhatsApp
- **nodemailer** - Envio de emails
- **qrcode-terminal** - Geração de QR codes no terminal
- **socket.io** - Comunicação em tempo real
- **twilio** - Serviços de SMS e comunicação
- **@sendgrid/mail** - Serviço de email da SendGrid
- **resend** - Serviço moderno de email
- **telegraf** - Bot framework para Telegram

### 🔐 Segurança e Autenticação
- **helmet** - Middleware de segurança para Express
- **express-rate-limit** - Rate limiting
- **express-validator** - Validação de dados
- **joi** - Schema validation
- **argon2** - Hash de senhas (mais seguro que bcrypt)
- **speakeasy** - Autenticação de dois fatores (2FA)
- **qrcode** - Geração de QR codes
- **passport** - Framework de autenticação
- **passport-local** - Estratégia local do Passport
- **passport-jwt** - Estratégia JWT do Passport
- **passport-google-oauth20** - OAuth Google
- **express-session** - Gerenciamento de sessões
- **connect-redis** - Store Redis para sessões
- **redis** - Cliente Redis
- **crypto-js** - Funções criptográficas
- **uuid** - Geração de UUIDs

### 📊 Monitoramento e Logging
- **winston** - Sistema de logging avançado
- **morgan** - HTTP request logger
- **pino** - Logger de alta performance
- **pino-pretty** - Pretty printer para Pino
- **@sentry/node** - Monitoramento de erros
- **@sentry/tracing** - Tracing de performance
- **prom-client** - Métricas Prometheus
- **newrelic** - Monitoramento APM
- **elastic-apm-node** - APM Elasticsearch
- **swagger-ui-express** - Documentação API
- **swagger-jsdoc** - Geração de docs Swagger
- **compression** - Compressão de respostas

### ✅ Validação e Sanitização
- **yup** - Schema validation
- **class-validator** - Validação baseada em decorators
- **class-transformer** - Transformação de objetos
- **validator** - Biblioteca de validação
- **dompurify** - Sanitização de HTML
- **xss** - Proteção contra XSS
- **sanitize-html** - Sanitização de HTML
- **express-mongo-sanitize** - Proteção contra NoSQL injection
- **hpp** - Proteção contra HTTP Parameter Pollution

### 📁 Processamento de Arquivos
- **multer** - Upload de arquivos
- **sharp** - Processamento de imagens
- **jimp** - Manipulação de imagens
- **pdf-parse** - Parsing de PDFs
- **xlsx** - Manipulação de planilhas Excel
- **csv-parser** - Parsing de CSV
- **archiver** - Criação de arquivos ZIP
- **unzipper** - Extração de arquivos ZIP
- **mime-types** - Detecção de tipos MIME
- **file-type** - Detecção de tipos de arquivo
- **aws-sdk** - SDK da AWS (legacy)
- **@aws-sdk/client-s3** - Cliente S3 moderno
- **cloudinary** - Serviço de mídia na nuvem
- **formidable** - Parser de formulários

## 🎨 Frontend Dependencies

### ⚛️ React e Ecosystem
- **@tanstack/react-query** - Gerenciamento de estado servidor
- **@tanstack/react-query-devtools** - DevTools para React Query
- **react-dropzone** - Drag & drop de arquivos
- **react-pdf** - Visualização de PDFs
- **@react-pdf/renderer** - Geração de PDFs
- **html2canvas** - Captura de tela
- **jspdf** - Geração de PDFs
- **react-virtualized** - Virtualização de listas
- **react-window** - Virtualização otimizada
- **socket.io-client** - Cliente Socket.IO
- **@headlessui/react** - Componentes acessíveis
- **@heroicons/react** - Ícones Heroicons
- **react-helmet-async** - Gerenciamento de head

### 🎯 Funcionalidades Existentes
- **@hookform/resolvers** - Resolvers para React Hook Form
- **axios** - Cliente HTTP
- **clsx** - Utilitário para classes CSS
- **date-fns** - Manipulação de datas
- **framer-motion** - Animações
- **i18next** - Internacionalização
- **lucide-react** - Ícones Lucide
- **moment** - Manipulação de datas (legacy)
- **react-beautiful-dnd** - Drag & drop
- **react-big-calendar** - Componente de calendário
- **react-hook-form** - Formulários
- **react-hot-toast** - Notificações
- **react-router-dom** - Roteamento
- **recharts** - Gráficos
- **tailwind-merge** - Merge de classes Tailwind
- **zod** - Validação de schema
- **zustand** - Gerenciamento de estado

## 🚀 Scripts de Desenvolvimento

### Backend
```bash
npm run start    # Produção
npm run dev      # Desenvolvimento com nodemon
npm run test     # Testes com Jest
```

### Frontend
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run test     # Testes com Vitest
```

## 🔧 Configurações Recomendadas

### Variáveis de Ambiente (.env)
```env
# Comunicação
WHATSAPP_SESSION_PATH=./sessions
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TELEGRAM_BOT_TOKEN=your_telegram_token

# Segurança
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
SESSION_SECRET=your_session_secret

# Monitoramento
SENTRY_DSN=your_sentry_dsn
NEW_RELIC_LICENSE_KEY=your_newrelic_key

# Arquivos
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📈 Próximos Passos

1. **Configurar serviços externos** (SendGrid, Twilio, etc.)
2. **Implementar middleware de segurança**
3. **Configurar monitoramento**
4. **Criar testes automatizados**
5. **Documentar APIs com Swagger**

## 🛡️ Segurança

Todas as dependências foram verificadas e as vulnerabilidades conhecidas foram resolvidas. Recomenda-se executar `npm audit` regularmente para manter a segurança atualizada.

## 📝 Notas

- Algumas dependências podem ter warnings de deprecação - isso é normal e não afeta a funcionalidade
- O projeto está configurado para ambientes de desenvolvimento, teste e produção
- Todas as bibliotecas são compatíveis com as versões atuais do Node.js e React