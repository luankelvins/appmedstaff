import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import { 
  initializeSentry, 
  metricsMiddleware, 
  metricsEndpoint, 
  sentryRequestHandler, 
  sentryTracingHandler, 
  sentryErrorHandler,
  healthCheck 
} from './config/monitoring.js';
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
import { sanitizeInput as validationSanitize } from './middlewares/validationMiddleware.js';

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

// Middlewares básicos
app.use(compression());

// Middlewares de segurança (adicionando gradualmente)
app.use(helmetConfig);
app.use(generalRateLimit);
app.use(parameterPollutionProtection);
app.use(sanitizeInput); // Proteção contra NoSQL injection
app.use(xssProtection); // Proteção XSS
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Request-ID']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Server gradual funcionando' });
});

app.get('/api/health/simple', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor gradual rodando na porta ${PORT}`);
});