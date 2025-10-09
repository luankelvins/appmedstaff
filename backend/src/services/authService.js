import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/database.js';
import { config, isDevelopment } from '../config/environment.js';
import emailService from './emailService.js';
import securityLogger from './securityLogger.js';

export class AuthService {
  static instance = null;

  static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Mapear roles para permissões
  getRolePermissions(role) {
    const rolePermissions = {
      'superadmin': [
        // Todas as permissões
        'dashboard.view', 'feed.view', 'notifications.view',
        'tasks.view', 'tasks.create', 'tasks.update', 'tasks.delete',
        'profile.view', 'profile.update',
        'contacts.read', 'contacts.create', 'contacts.update', 'contacts.delete',
        'contacts.internal.view',
        'crm.forms.access',
        'activities.commercial.view', 'activities.operational.view',
        'activities.benefits.view', 'activities.business.view', 'activities.partners.view',
        'org.chart.view', 'org.chart.update',
        'admin.docs.read', 'admin.docs.write',
        'finance.expenses.create', 'finance.expenses.view', 'finance.expenses.approve',
        'relationship.collaborators.read', 'relationship.collaborators.write',
        'chat.view', 'chat.send',
        'audit.read', 'audit.write',
        'users.read', 'users.write', 'users.delete',
        'employees.read', 'employees.write', 'employees.delete',
        'leads.read', 'leads.write', 'leads.delete',
        'admin.access', 'admin.users', 'admin.settings',
        'system.backup', 'system.restore', 'system.maintenance',
        'reports.view', 'reports.export', 'analytics.view'
      ],
      'gerente_rh': [
        'dashboard.view', 'feed.view', 'notifications.view',
        'tasks.view', 'tasks.create', 'tasks.update',
        'profile.view', 'profile.update',
        'contacts.read', 'contacts.create', 'contacts.update',
        'contacts.internal.view',
        'org.chart.view', 'org.chart.update',
        'admin.docs.read',
        'relationship.collaborators.read', 'relationship.collaborators.write',
        'chat.view', 'chat.send',
        'audit.read',
        'employees.read', 'employees.write',
        'reports.view'
      ],
      'analista_rh': [
        'dashboard.view', 'feed.view', 'notifications.view',
        'tasks.view', 'tasks.create', 'tasks.update',
        'profile.view', 'profile.update',
        'contacts.read', 'contacts.create', 'contacts.update',
        'contacts.internal.view',
        'org.chart.view',
        'admin.docs.read',
        'relationship.collaborators.read',
        'chat.view', 'chat.send',
        'employees.read'
      ],
      'gerente_comercial': [
        'dashboard.view', 'feed.view', 'notifications.view',
        'tasks.view', 'tasks.create', 'tasks.update',
        'profile.view', 'profile.update',
        'contacts.read', 'contacts.create', 'contacts.update',
        'crm.forms.access',
        'activities.commercial.view', 'activities.business.view',
        'chat.view', 'chat.send',
        'leads.read', 'leads.write', 'leads.delete',
        'reports.view'
      ],
      'analista_comercial': [
        'dashboard.view', 'feed.view', 'notifications.view',
        'tasks.view', 'tasks.create', 'tasks.update',
        'profile.view', 'profile.update',
        'contacts.read', 'contacts.create', 'contacts.update',
        'crm.forms.access',
        'activities.commercial.view',
        'chat.view', 'chat.send',
        'leads.read', 'leads.write'
      ],
      'user': [
        'dashboard.view', 'feed.view', 'notifications.view',
        'tasks.view', 'tasks.create', 'tasks.update',
        'profile.view', 'profile.update',
        'contacts.read',
        'chat.view', 'chat.send'
      ]
    };

    return rolePermissions[role] || rolePermissions['user'];
  }

  async login(data, requestInfo = {}) {
    const { ip = 'unknown', userAgent = 'unknown' } = requestInfo;
    let user = null;
    
    try {
      // Buscar usuário por email (case-insensitive)
      const query = `
        SELECT id, email, dados_pessoais->>'nome' as nome, role, status, password_hash
        FROM employees 
        WHERE LOWER(email) = LOWER($1) AND status = 'ativo'
      `;
      
      const result = await pool.query(query, [data.email]);
      
      if (result.rows.length === 0) {
        // Log tentativa de login com email inexistente
        await securityLogger.logLoginAttempt({
          email: data.email,
          success: false,
          ip,
          userAgent,
          reason: 'email_not_found'
        });
        throw new Error('Credenciais inválidas');
      }

      user = result.rows[0];

      // Verificar senha
      const isValidPassword = await bcrypt.compare(data.password, user.password_hash);
      
      if (!isValidPassword) {
        // Log tentativa de login com senha incorreta
        await securityLogger.logLoginAttempt({
          email: data.email,
          success: false,
          ip,
          userAgent,
          userId: user.id,
          reason: 'invalid_password'
        });
        throw new Error('Credenciais inválidas');
      }

      // Gerar tokens JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          nome: user.nome 
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      const refreshToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          type: 'refresh'
        },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      const userRole = user.role || 'user';
      const permissions = this.getRolePermissions(userRole);

      // Log login bem-sucedido
      await securityLogger.logLoginAttempt({
        email: data.email,
        success: true,
        ip,
        userAgent,
        userId: user.id,
        reason: 'success'
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          role: userRole,
          permissions: permissions
        },
        token,
        refreshToken,
        expires_in: 24 * 60 * 60 // 24 horas em segundos
      };
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Se não foi logado ainda (erro inesperado), logar aqui
      if (error.message !== 'Credenciais inválidas') {
        await securityLogger.logLoginAttempt({
          email: data.email,
          success: false,
          ip,
          userAgent,
          userId: user?.id || null,
          reason: 'system_error'
        });
      }
      
      throw error;
    }
  }

  async register(data, requestInfo = {}) {
    const { ip = 'unknown', userAgent = 'unknown' } = requestInfo;
    
    try {
      // Verificar se o email já existe (case-insensitive)
      const existingUser = await pool.query(
        'SELECT id FROM employees WHERE LOWER(email) = LOWER($1)',
        [data.email]
      );

      if (existingUser.rows.length > 0) {
        // Log tentativa de registro com email já existente
        await securityLogger.logRegisterAttempt({
          email: data.email,
          success: false,
          ip,
          userAgent,
          reason: 'email_already_exists'
        });
        throw new Error('Email já cadastrado');
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(data.password, config.security.bcryptSaltRounds);

      // Inserir novo usuário
      const insertQuery = `
        INSERT INTO employees (email, dados_pessoais, password_hash, role, status)
        VALUES ($1, $2, $3, 'employee', 'ativo')
        RETURNING id, email, dados_pessoais->>'nome' as nome
      `;

      const dadosPessoais = {
        nome: data.nome,
        cpf: data.cpf,
        telefone: data.telefone
      };

      const result = await pool.query(insertQuery, [
        data.email,
        JSON.stringify(dadosPessoais),
        passwordHash
      ]);

      const newUser = result.rows[0];

      // Gerar token JWT
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email,
          nome: newUser.nome 
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      const userRole = 'user';
      const permissions = this.getRolePermissions(userRole);

      // Enviar email de boas-vindas (não bloqueia o registro se falhar)
      try {
        await emailService.sendWelcomeEmail(newUser.email, newUser.nome, userRole);
      } catch (emailError) {
        console.warn('Falha ao enviar email de boas-vindas:', emailError.message);
      }

      // Log registro bem-sucedido
      await securityLogger.logRegisterAttempt({
        email: data.email,
        success: true,
        ip,
        userAgent,
        userId: newUser.id,
        reason: 'success'
      });

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          nome: newUser.nome,
          role: userRole,
          permissions: permissions
        },
        token,
        expires_in: 24 * 60 * 60
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      
      // Se não foi logado ainda (erro inesperado), logar aqui
      if (error.message !== 'Email já cadastrado') {
        await securityLogger.logRegisterAttempt({
          email: data.email,
          success: false,
          ip,
          userAgent,
          reason: 'system_error'
        });
      }
      
      throw error;
    }
  }

  /**
   * Verifica se o token JWT é válido
   */
  async verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Verifica credenciais do usuário sem fazer login completo
   * Usado para validação antes do 2FA
   */
  async verifyCredentials(email, password) {
    try {
      // Buscar usuário por email
      const result = await pool.query(
        'SELECT id, email, password, nome, role, ativo FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Credenciais inválidas'
        };
      }

      const user = result.rows[0];

      // Verificar se o usuário está ativo
      if (!user.ativo) {
        return {
          success: false,
          message: 'Conta desativada'
        };
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Credenciais inválidas'
        };
      }

      // Retornar dados do usuário sem token
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          role: user.role
        }
      };

    } catch (error) {
      console.error('Erro ao verificar credenciais:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  async getCurrentUser(userId) {
    try {
      const query = `
        SELECT id, email, 
               dados_pessoais->>'nome' as nome,
               dados_pessoais->>'cpf' as cpf,
               dados_pessoais->>'telefone' as telefone,
               role, status, created_at, updated_at
        FROM employees 
        WHERE id = $1 AND status = 'ativo'
      `;
      
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      throw error;
    }
  }

  async updatePassword(userId, currentPassword, newPassword) {
    try {
      // Buscar senha atual
      const userQuery = 'SELECT password_hash FROM employees WHERE id = $1';
      const userResult = await pool.query(userQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar senha atual
      const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
      
      if (!isValidPassword) {
        throw new Error('Senha atual incorreta');
      }

      // Hash da nova senha
      const newPasswordHash = await bcrypt.hash(newPassword, config.security.bcryptSaltRounds);

      // Atualizar senha
      await pool.query(
        'UPDATE employees SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPasswordHash, userId]
      );
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    }
  }

  async logout() {
    // Para JWT, o logout é feito no frontend removendo o token
    return Promise.resolve();
  }

  async forgotPassword(email, requestInfo = {}) {
    const { ip = 'unknown', userAgent = 'unknown' } = requestInfo;
    
    try {
      // Verificar se o usuário existe
      const userQuery = `
        SELECT id, email, dados_pessoais->>'nome' as nome
        FROM employees 
        WHERE LOWER(email) = LOWER($1) AND status = 'ativo'
      `;
      
      const result = await pool.query(userQuery, [email]);
      
      if (result.rows.length === 0) {
        // Log tentativa de reset com email inexistente
        await securityLogger.logPasswordResetAttempt({
          email,
          success: false,
          ip,
          userAgent,
          reason: 'email_not_found'
        });
        
        // Por segurança, não revelamos se o email existe ou não
        return { message: 'Se o email existir, você receberá instruções para redefinir sua senha.' };
      }

      const user = result.rows[0];

      // Gerar token de reset
      const resetToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          type: 'password_reset'
        },
        config.passwordReset.secret,
        { expiresIn: config.passwordReset.expiresIn }
      );

      // Salvar token de reset no banco (com expiração)
      const expiresAt = new Date(Date.now() + (config.timeouts.passwordResetCleanup * 1000));
      await pool.query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at) 
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id) 
         DO UPDATE SET token = $2, expires_at = $3, created_at = NOW()`,
        [user.id, resetToken, expiresAt]
      );

      // Enviar email de reset de senha
      try {
        await emailService.sendPasswordResetEmail(email, resetToken, user.nome);
        console.log(`✅ Email de reset enviado para ${email}`);
      } catch (emailError) {
        console.error('Erro ao enviar email de reset:', emailError.message);
        // Em produção, não revelamos se o email existe ou não
        if (isDevelopment()) {
          console.log(`🔐 Token de reset para ${email}: ${resetToken}`);
          console.log(`⏰ Expira em: ${expiresAt.toISOString()}`);
        }
      }

      // Log tentativa de reset bem-sucedida
      await securityLogger.logPasswordResetAttempt({
        email,
        success: true,
        ip,
        userAgent,
        reason: 'success'
      });

      return { 
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
        // Em desenvolvimento, retornamos o token para facilitar testes
        ...(isDevelopment() && { resetToken })
      };
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      
      // Log erro do sistema
      await securityLogger.logPasswordResetAttempt({
        email,
        success: false,
        ip,
        userAgent,
        reason: 'system_error'
      });
      
      throw new Error('Erro interno do servidor');
    }
  }

  async resetPassword(token, newPassword) {
    try {
      // Verificar e decodificar o token
      let decoded;
      try {
        decoded = jwt.verify(token, config.passwordReset.secret);
      } catch (error) {
        throw new Error('Token inválido ou expirado');
      }

      // Verificar se é um token de reset
      if (decoded.type !== 'password_reset') {
        throw new Error('Token inválido');
      }

      // Verificar se o token existe no banco, não expirou e não foi usado
      const tokenQuery = `
        SELECT user_id, expires_at, used 
        FROM password_reset_tokens 
        WHERE token = $1 AND expires_at > NOW() AND used = FALSE
      `;
      
      const tokenResult = await pool.query(tokenQuery, [token]);
      
      if (tokenResult.rows.length === 0) {
        throw new Error('Token inválido, expirado ou já utilizado');
      }

      const { user_id } = tokenResult.rows[0];

      // Verificar se o usuário ainda existe e está ativo
      const userQuery = `
        SELECT id FROM employees 
        WHERE id = $1 AND status = 'ativo'
      `;
      
      const userResult = await pool.query(userQuery, [user_id]);
      
      if (userResult.rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      // Hash da nova senha
      const newPasswordHash = await bcrypt.hash(newPassword, config.security.bcryptSaltRounds);

      // Atualizar senha e remover token de reset
      await pool.query('BEGIN');
      
      try {
        await pool.query(
          'UPDATE employees SET password_hash = $1, updated_at = NOW() WHERE id = $2',
          [newPasswordHash, user_id]
        );

        await pool.query(
          'UPDATE password_reset_tokens SET used = TRUE, used_at = NOW() WHERE token = $1',
          [token]
        );

        await pool.query('COMMIT');
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }

      return { message: 'Senha redefinida com sucesso' };
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      // Verificar e decodificar o refresh token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      } catch (error) {
        throw new Error('Refresh token inválido');
      }

      // Verificar se o usuário ainda existe e está ativo
      const userQuery = `
        SELECT id, email, dados_pessoais->>'nome' as nome, role, status
        FROM employees 
        WHERE id = $1 AND status = 'ativo'
      `;
      
      const result = await pool.query(userQuery, [decoded.userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const user = result.rows[0];

      // Gerar novo access token
      const newAccessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          nome: user.nome 
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Gerar novo refresh token (opcional - pode reutilizar o atual)
      const newRefreshToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          type: 'refresh'
        },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      const userRole = user.role || 'user';
      const permissions = this.getRolePermissions(userRole);

      return {
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          role: userRole,
          permissions: permissions
        },
        token: newAccessToken,
        refreshToken: newRefreshToken,
        expires_in: 24 * 60 * 60 // 24 horas em segundos
      };
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance();