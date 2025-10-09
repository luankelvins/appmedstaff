import { authService } from '../services/authService.js';
import { extractRequestInfo } from '../utils/requestUtils.js';

export class AuthController {
  static async login(req, res) {
    try {
      console.log('📥 Dados recebidos no login:', req.body);
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Email e senha são obrigatórios' 
        });
      }

      // Extrair informações de segurança do request
      const requestInfo = extractRequestInfo(req);

      const authResponse = await authService.login({ email, password }, requestInfo);
      console.log('✅ Login bem-sucedido para:', email);
      res.json(authResponse);
    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      console.error('📧 Email tentativa:', req.body.email);
      res.status(401).json({ 
        message: error.message || 'Erro ao fazer login' 
      });
    }
  }

  static async register(req, res) {
    try {
      const registerData = req.body;
      
      // Extrair informações de segurança do request
      const requestInfo = extractRequestInfo(req);
      
      const authResponse = await authService.register(registerData, requestInfo);
      res.json(authResponse);
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(400).json({ 
        message: error.message || 'Erro ao registrar usuário' 
      });
    }
  }

  static async verify(req, res) {
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
  }

  static async getUser(req, res) {
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
  }

  static async updatePassword(req, res) {
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
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      // Extrair informações de segurança do request
      const requestInfo = extractRequestInfo(req);
      
      await authService.forgotPassword(email, requestInfo);
      res.json({ message: 'Email de recuperação enviado com sucesso' });
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      res.status(400).json({ 
        message: error.message || 'Erro ao solicitar recuperação de senha' 
      });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      res.status(400).json({ 
        message: error.message || 'Erro ao redefinir senha' 
      });
    }
  }

  static async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        await authService.logout(token);
      }
      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      res.status(400).json({ 
        message: error.message || 'Erro ao fazer logout' 
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const newTokens = await authService.refreshToken(refreshToken);
      res.json(newTokens);
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      res.status(401).json({ 
        message: error.message || 'Erro ao renovar token' 
      });
    }
  }

  static async getCurrentUser(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      const user = await authService.getCurrentUser(userId);
      res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      res.status(400).json({ 
        message: error.message || 'Erro ao buscar usuário atual' 
      });
    }
  }
}