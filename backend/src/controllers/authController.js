import { authService } from '../services/authService.js';

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
  }

  static async register(req, res) {
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
}