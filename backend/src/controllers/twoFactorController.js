import twoFactorService from '../services/twoFactorService.js';
import { authService } from '../services/authService.js';
import { body, param, validationResult } from 'express-validator';
import securityLogger from '../services/securityLogger.js';

class TwoFactorController {
  /**
   * Gera um novo secret para configuração do 2FA
   */
  async generateSecret(req, res) {
    try {
      const userId = req.user.userId;
      const userEmail = req.user.email;

      // Gerar novo secret (o serviço já verifica se 2FA está habilitado)
      const secretData = await twoFactorService.generateSecret(userId, userEmail);

      // Log da ação
      await securityLogger.logTwoFactorSetupInitiated(userId, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: {
          secret: secretData.secret,
          qrCode: secretData.qrCode,
          manualEntryKey: secretData.manualEntryKey,
          appName: 'AppMedStaff'
        }
      });

    } catch (error) {
      console.error('Erro ao gerar secret 2FA:', error);
      
      if (error.message === '2FA já está habilitado para este usuário' || 
          error.message === 'Usuário não encontrado') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Habilita 2FA para o usuário
   */
  async enableTwoFactor(req, res) {
    try {
      const userId = req.user.userId;
      const { token } = req.body;

      // Habilitar 2FA (o serviço já verifica se está habilitado)
      const result = await twoFactorService.enableTwoFactor(userId, token);

      // Log da ação
      await securityLogger.logTwoFactorEnabled(userId, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(result);

    } catch (error) {
      console.error('Erro ao habilitar 2FA:', error);
      
      // Log da tentativa falhada
      await securityLogger.logTwoFactorSetupFailed(req.user.userId, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: error.message
      });

      if (error.message === 'Token inválido' || 
          error.message === '2FA já está habilitado' ||
          error.message === 'Secret 2FA não encontrado. Gere um novo QR Code.' ||
          error.message === 'Usuário não encontrado') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Desabilita 2FA para o usuário
   */
  async disableTwoFactor(req, res) {
    try {
      const userId = req.user.userId;

      // Desabilitar 2FA
      const result = await twoFactorService.disableTwoFactor(userId);

      // Log da ação
      await securityLogger.logTwoFactorDisabled(userId, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: '2FA desabilitado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao desabilitar 2FA:', error);

      // Log da tentativa falhada
      await securityLogger.logTwoFactorDisableFailed(req.user.userId, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: error.message
      });

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verifica o status do 2FA do usuário
   */
  async getStatus(req, res) {
    try {
      const userId = req.user.userId;

      const isTwoFactorEnabled = await twoFactorService.isTwoFactorEnabled(userId);

      res.json({
        success: true,
        data: {
          enabled: isTwoFactorEnabled
        }
      });

    } catch (error) {
      console.error('Erro ao verificar status 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Regenera códigos de backup para 2FA
   */
  async regenerateBackupCodes(req, res) {
    try {
      const userId = req.user.userId;
      const { token } = req.body;

      // Regenerar códigos (o serviço já verifica se 2FA está habilitado e valida o token)
      const newBackupCodes = await twoFactorService.regenerateBackupCodes(userId, token);

      // Log da ação
      await securityLogger.logTwoFactorBackupCodesRegenerated(userId, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Códigos de backup regenerados com sucesso',
        data: {
          backupCodes: newBackupCodes
        }
      });

    } catch (error) {
      console.error('Erro ao regenerar códigos de backup:', error);

      // Log da tentativa falhada
      await securityLogger.logTwoFactorBackupCodesFailed(req.user.userId, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: error.message
      });

      if (error.message === '2FA não está habilitado para este usuário' ||
          error.message === 'Token inválido') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verifica um token 2FA (para login)
   */
  async verifyToken(req, res) {
    try {
      const { email, password, token } = req.body;

      // Primeiro, verificar credenciais básicas
      const loginResult = await authService.verifyCredentials(email, password);
      if (!loginResult.success) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      const user = loginResult.user;

      // Verificar se o usuário tem 2FA habilitado
      const isTwoFactorEnabled = await twoFactorService.isTwoFactorEnabled(user.id);
      if (!isTwoFactorEnabled) {
        return res.status(400).json({
          success: false,
          message: '2FA não está habilitado para este usuário'
        });
      }

      // Verificar token 2FA ou código de backup
      const verificationResult = await twoFactorService.verifyToken(user.id, token);

      if (!verificationResult.verified) {
        // Log da tentativa falhada
        await securityLogger.logTwoFactorLoginFailed(user.id, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          email: email
        });

        return res.status(401).json({
          success: false,
          message: 'Token ou código de backup inválido'
        });
      }

      // Gerar JWT token
      const authToken = authService.generateToken(user);

      // Log do login bem-sucedido
      await securityLogger.logSuccessfulLogin(user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        email: email,
        twoFactorUsed: true,
        backupCodeUsed: verificationResult.backupCodeUsed || false
      });

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token: authToken,
          user: {
            id: user.id,
            email: user.email,
            nome: user.nome,
            role: user.role
          }
        }
      });

    } catch (error) {
      console.error('Erro ao verificar token 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

// Validações
export const twoFactorValidations = {
  enableTwoFactor: [
    body('token')
      .notEmpty()
      .withMessage('Token é obrigatório')
      .isLength({ min: 6, max: 6 })
      .withMessage('Token deve ter 6 dígitos')
      .isNumeric()
      .withMessage('Token deve conter apenas números')
  ],

  disableTwoFactor: [
    // Não requer validações - apenas autenticação
  ],

  regenerateBackupCodes: [
    body('token')
      .notEmpty()
      .withMessage('Token é obrigatório')
      .isLength({ min: 6, max: 6 })
      .withMessage('Token deve ter 6 dígitos')
      .isNumeric()
      .withMessage('Token deve conter apenas números')
  ],

  verifyToken: [
    body('email')
      .isEmail()
      .withMessage('Email deve ser válido')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Senha é obrigatória'),
    body('token')
      .notEmpty()
      .withMessage('Token é obrigatório')
      .isLength({ min: 6, max: 8 })
      .withMessage('Token deve ter entre 6 e 8 caracteres')
  ]
};

const twoFactorController = new TwoFactorController();
export default twoFactorController;