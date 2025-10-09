import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import pool from '../config/database.js';

class TwoFactorService {
  static instance = null;

  static getInstance() {
    if (!TwoFactorService.instance) {
      TwoFactorService.instance = new TwoFactorService();
    }
    return TwoFactorService.instance;
  }

  /**
   * Gerar secret para 2FA
   */
  async generateSecret(userId, userEmail) {
    try {
      // Verificar se o usuário existe
      const userQuery = 'SELECT id, email, two_factor_enabled FROM employees WHERE id = $1';
      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const user = userResult.rows[0];

      if (user.two_factor_enabled) {
        throw new Error('2FA já está habilitado para este usuário');
      }

      // Gerar secret
      const secret = speakeasy.generateSecret({
        name: `AppMedStaff (${userEmail})`,
        issuer: 'AppMedStaff',
        length: 32
      });

      // Salvar secret temporário no banco (não habilitado ainda)
      const updateQuery = `
        UPDATE employees 
        SET two_factor_secret = $1, updated_at = NOW()
        WHERE id = $2
      `;
      await pool.query(updateQuery, [secret.base32, userId]);

      // Gerar QR Code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      };

    } catch (error) {
      console.error('Erro ao gerar secret 2FA:', error);
      throw error;
    }
  }

  /**
   * Verificar token e habilitar 2FA
   */
  async enableTwoFactor(userId, token) {
    try {
      // Buscar dados do usuário
      const userQuery = `
        SELECT email, nome, two_factor_secret, two_factor_enabled 
        FROM employees 
        WHERE id = $1
      `;
      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const user = userResult.rows[0];

      if (user.two_factor_enabled) {
        throw new Error('2FA já está habilitado');
      }

      if (!user.two_factor_secret) {
        throw new Error('Secret 2FA não encontrado. Gere um novo QR Code.');
      }

      // Verificar token
      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        throw new Error('Token inválido');
      }

      // Habilitar 2FA
      const enableQuery = `
        UPDATE employees 
        SET two_factor_enabled = true, two_factor_enabled_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `;
      await pool.query(enableQuery, [userId]);

      // Gerar códigos de backup
      const backupCodes = this.generateBackupCodes();
      await this.saveBackupCodes(userId, backupCodes);

      return {
        success: true,
        backupCodes: backupCodes
      };

    } catch (error) {
      console.error('Erro ao habilitar 2FA:', error);
      throw error;
    }
  }

  /**
   * Desabilitar 2FA
   */
  async disableTwoFactor(userId) {
    try {
      // Desabilitar 2FA
      const disableQuery = `
        UPDATE employees 
        SET two_factor_secret = NULL, 
            two_factor_enabled = false, 
            two_factor_enabled_at = NULL,
            updated_at = NOW()
        WHERE id = $1
      `;
      await pool.query(disableQuery, [userId]);

      // Remover códigos de backup
      await this.removeBackupCodes(userId);

      return { success: true };

    } catch (error) {
      console.error('Erro ao desabilitar 2FA:', error);
      throw error;
    }
  }

  /**
   * Verificar token 2FA
   */
  async verifyToken(userId, token) {
    try {
      // Buscar secret do usuário
      const userQuery = `
        SELECT two_factor_secret, two_factor_enabled 
        FROM employees 
        WHERE id = $1
      `;
      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const user = userResult.rows[0];

      if (!user.two_factor_enabled || !user.two_factor_secret) {
        throw new Error('2FA não está habilitado para este usuário');
      }

      // Verificar se é um código de backup
      if (token.length === 8) {
        return await this.verifyBackupCode(userId, token);
      }

      // Verificar token TOTP
      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      return { verified };

    } catch (error) {
      console.error('Erro ao verificar token 2FA:', error);
      throw error;
    }
  }

  /**
   * Gerar códigos de backup
   */
  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  /**
   * Salvar códigos de backup
   */
  async saveBackupCodes(userId, codes) {
    try {
      // Remover códigos antigos
      await pool.query('DELETE FROM two_factor_backup_codes WHERE employee_id = $1', [userId]);

      // Inserir novos códigos
      const insertQuery = `
        INSERT INTO two_factor_backup_codes (employee_id, code, used, created_at, updated_at)
        VALUES ($1, $2, false, NOW(), NOW())
      `;

      for (const code of codes) {
        await pool.query(insertQuery, [userId, code]);
      }

      return { success: true };

    } catch (error) {
      console.error('Erro ao salvar códigos de backup:', error);
      throw error;
    }
  }

  /**
   * Verificar código de backup
   */
  async verifyBackupCode(userId, code) {
    try {
      // Buscar código não usado
      const codeQuery = `
        SELECT id FROM two_factor_backup_codes 
        WHERE employee_id = $1 AND code = $2 AND used = false
      `;
      const codeResult = await pool.query(codeQuery, [userId, code.toUpperCase()]);

      if (codeResult.rows.length === 0) {
        return { verified: false };
      }

      // Marcar código como usado
      const updateQuery = `
        UPDATE two_factor_backup_codes 
        SET used = true, used_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `;
      await pool.query(updateQuery, [codeResult.rows[0].id]);

      return { verified: true, backupCodeUsed: true };

    } catch (error) {
      console.error('Erro ao verificar código de backup:', error);
      throw error;
    }
  }

  /**
   * Remover códigos de backup
   */
  async removeBackupCodes(userId) {
    try {
      await pool.query('DELETE FROM two_factor_backup_codes WHERE employee_id = $1', [userId]);
    } catch (error) {
      console.error('Erro ao remover códigos de backup:', error);
      throw error;
    }
  }

  /**
   * Verificar se 2FA está habilitado
   */
  async isTwoFactorEnabled(userId) {
    try {
      const query = 'SELECT two_factor_enabled FROM employees WHERE id = $1';
      const result = await pool.query(query, [userId]);

      if (result.rows.length === 0) {
        return false;
      }

      return result.rows[0].two_factor_enabled || false;

    } catch (error) {
      console.error('Erro ao verificar status 2FA:', error);
      return false;
    }
  }

  /**
   * Obter secret 2FA (para regenerar QR code)
   */
  async getSecret(userId) {
    try {
      const query = 'SELECT two_factor_secret FROM employees WHERE id = $1';
      const result = await pool.query(query, [userId]);

      if (result.rows.length === 0 || !result.rows[0].two_factor_secret) {
        return null;
      }

      return result.rows[0].two_factor_secret;

    } catch (error) {
      console.error('Erro ao obter secret 2FA:', error);
      return null;
    }
  }

  /**
   * Regenerar códigos de backup
   */
  async regenerateBackupCodes(userId, token) {
    try {
      // Verificar se 2FA está habilitado
      const isTwoFactorEnabled = await this.isTwoFactorEnabled(userId);
      if (!isTwoFactorEnabled) {
        throw new Error('2FA não está habilitado para este usuário');
      }

      // Verificar token
      const verificationResult = await this.verifyToken(userId, token);
      if (!verificationResult.verified) {
        throw new Error('Token inválido');
      }

      // Gerar novos códigos
      const newBackupCodes = this.generateBackupCodes();
      await this.saveBackupCodes(userId, newBackupCodes);

      return newBackupCodes;

    } catch (error) {
      console.error('Erro ao regenerar códigos de backup:', error);
      throw error;
    }
  }
}

export const twoFactorService = TwoFactorService.getInstance();
export default twoFactorService;