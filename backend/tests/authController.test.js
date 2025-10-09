import { jest } from '@jest/globals';
import { AuthController } from '../src/controllers/authController.js';
import { authService } from '../src/services/authService.js';

// Mock do authService
jest.mock('../src/services/authService.js', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    verifyToken: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    refreshToken: jest.fn(),
    getCurrentUser: jest.fn(),
    updatePassword: jest.fn(),
    logout: jest.fn(),
  },
}));

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    // Mock dos objetos req e res
    req = {
      body: {},
      user: {},
      headers: {},
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    // Limpar todos os mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };
      const authResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          nome: 'Test User',
          role: 'user',
          permissions: ['dashboard.view'],
        },
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        expires_in: 86400,
      };

      req.body = loginData;
      authService.login.mockResolvedValue(authResponse);

      await AuthController.login(req, res);

      expect(authService.login).toHaveBeenCalledWith(loginData, { ip: 'unknown', userAgent: 'unknown' });
      expect(res.json).toHaveBeenCalledWith(authResponse);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 quando email não for fornecido', async () => {
      req.body = { password: 'Test123!@#' };

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email e senha são obrigatórios',
      });
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 quando senha não for fornecida', async () => {
      req.body = { email: 'test@example.com' };

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email e senha são obrigatórios',
      });
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('deve retornar erro 401 quando credenciais forem inválidas', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      authService.login.mockRejectedValue(new Error('Credenciais inválidas'));

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Credenciais inválidas',
      });
    });
  });

  describe('register', () => {
    it('deve registrar usuário com sucesso', async () => {
      const registerData = {
        nome: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
        cpf: '12345678901',
        telefone: '11999999999',
      };
      const authResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          nome: 'Test User',
          role: 'user',
          permissions: ['dashboard.view'],
        },
        token: 'jwt-token',
        expires_in: 86400,
      };

      req.body = registerData;
      authService.register.mockResolvedValue(authResponse);

      await AuthController.register(req, res);

      expect(authService.register).toHaveBeenCalledWith(registerData, { ip: 'unknown', userAgent: 'unknown' });
      expect(res.json).toHaveBeenCalledWith(authResponse);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 quando email já estiver cadastrado', async () => {
      req.body = {
        nome: 'Test User',
        email: 'existing@example.com',
        password: 'Test123!@#',
      };
      authService.register.mockRejectedValue(new Error('Email já cadastrado'));

      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email já cadastrado',
      });
    });
  });

  describe('verify', () => {
    it('deve verificar token com sucesso', async () => {
      const token = 'valid-jwt-token';
      const decodedToken = {
        userId: '123',
        email: 'test@example.com',
        nome: 'Test User',
      };

      req.headers.authorization = `Bearer ${token}`;
      authService.verifyToken.mockResolvedValue(decodedToken);

      await AuthController.verify(req, res);

      expect(authService.verifyToken).toHaveBeenCalledWith(token);
      expect(res.json).toHaveBeenCalledWith(decodedToken);
    });

    it('deve retornar erro 401 quando token não for fornecido', async () => {
      req.headers = {};

      await AuthController.verify(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token não fornecido',
      });
    });

    it('deve retornar erro 401 quando token for inválido', async () => {
      const token = 'invalid-token';
      req.headers.authorization = `Bearer ${token}`;
      authService.verifyToken.mockRejectedValue(new Error('Token inválido'));

      await AuthController.verify(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token inválido',
      });
    });
  });

  describe('forgotPassword', () => {
    it('deve solicitar reset de senha com sucesso', async () => {
      const email = 'test@example.com';

      req.body = { email };
      authService.forgotPassword.mockResolvedValue();

      await AuthController.forgotPassword(req, res);

      expect(authService.forgotPassword).toHaveBeenCalledWith(email, { ip: 'unknown', userAgent: 'unknown' });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email de recuperação enviado com sucesso',
      });
    });

    it('deve retornar erro 400 quando ocorrer erro', async () => {
      req.body = { email: 'test@example.com' };
      authService.forgotPassword.mockRejectedValue(new Error('Email não encontrado'));

      await AuthController.forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email não encontrado',
      });
    });
  });

  describe('resetPassword', () => {
    it('deve redefinir senha com sucesso', async () => {
      const token = 'valid-reset-token';
      const password = 'NewPassword123!@#';

      req.body = { token, password };
      authService.resetPassword.mockResolvedValue();

      await AuthController.resetPassword(req, res);

      expect(authService.resetPassword).toHaveBeenCalledWith(token, password);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Senha redefinida com sucesso',
      });
    });

    it('deve retornar erro 400 quando token for inválido', async () => {
      req.body = { token: 'invalid-token', password: 'NewPassword123!@#' };
      authService.resetPassword.mockRejectedValue(new Error('Token inválido ou expirado'));

      await AuthController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token inválido ou expirado',
      });
    });
  });

  describe('refreshToken', () => {
    it('deve renovar token com sucesso', async () => {
      const refreshToken = 'valid-refresh-token';
      const response = {
        user: {
          id: '123',
          email: 'test@example.com',
          nome: 'Test User',
          role: 'user',
          permissions: ['dashboard.view'],
        },
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
        expires_in: 86400,
      };

      req.body = { refreshToken };
      authService.refreshToken.mockResolvedValue(response);

      await AuthController.refreshToken(req, res);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it('deve retornar erro 401 quando refresh token for inválido', async () => {
      req.body = { refreshToken: 'invalid-refresh-token' };
      authService.refreshToken.mockRejectedValue(new Error('Refresh token inválido'));

      await AuthController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Refresh token inválido',
      });
    });
  });

  describe('logout', () => {
    it('deve fazer logout com sucesso', async () => {
      const token = 'valid-token';
      req.headers.authorization = `Bearer ${token}`;
      authService.logout.mockResolvedValue();

      await AuthController.logout(req, res);

      expect(authService.logout).toHaveBeenCalledWith(token);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logout realizado com sucesso',
      });
    });

    it('deve fazer logout sem token', async () => {
      req.headers = {};

      await AuthController.logout(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Logout realizado com sucesso',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('deve retornar usuário atual com sucesso', async () => {
      const userId = '123';
      const user = {
        id: '123',
        email: 'test@example.com',
        nome: 'Test User',
        role: 'user',
        status: 'ativo',
      };

      req.user = { id: userId };
      authService.getCurrentUser.mockResolvedValue(user);

      await AuthController.getCurrentUser(req, res);

      expect(authService.getCurrentUser).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('deve retornar erro 401 quando usuário não estiver autenticado', async () => {
      req.user = undefined;

      await AuthController.getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário não autenticado',
      });
    });

    it('deve retornar erro 400 quando usuário não for encontrado', async () => {
      req.user = { id: '123' };
      authService.getCurrentUser.mockRejectedValue(new Error('Usuário não encontrado'));

      await AuthController.getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário não encontrado',
      });
    });
  });
});