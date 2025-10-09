import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authService } from './server-auth.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'], // Vite dev server (3000 é a porta atual)
  credentials: true
}));
app.use(express.json());

// Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas de autenticação
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('📥 Dados recebidos no login:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email e senha são obrigatórios' 
      });
    }

    const authResponse = await authService.login({ email, password });
    console.log('✅ Login bem-sucedido para:', email);
    res.json(authResponse);
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    console.error('📧 Email tentativa:', req.body.email);
    res.status(401).json({ 
      message: error.message || 'Erro ao fazer login' 
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const registerData = req.body;
    const authResponse = await authService.register(registerData);
    res.json(authResponse);
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(400).json({ 
      message: error.message || 'Erro ao registrar usuário' 
    });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = await authService.verifyToken(token);
    res.json(decoded);
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(401).json({ 
      message: 'Token inválido' 
    });
  }
});

app.get('/api/auth/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Verificar token
    await authService.verifyToken(token);
    
    const user = await authService.getCurrentUser(userId);
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(400).json({ 
      message: error.message || 'Erro ao buscar usuário' 
    });
  }
});

app.put('/api/auth/update-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Verificar token
    await authService.verifyToken(token);
    
    await authService.updatePassword(userId, currentPassword, newPassword);
    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(400).json({ 
      message: error.message || 'Erro ao atualizar senha' 
    });
  }
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de erro global
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ 
    message: 'Erro interno do servidor' 
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Rota não encontrada' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
});