import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../config/database.js';

// Carregar variáveis de ambiente
dotenv.config();

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

  async login(data) {
    try {
      // Buscar usuário por email (case-insensitive)
      const query = `
        SELECT id, email, dados_pessoais->>'nome' as nome, role, status, password_hash
        FROM employees 
        WHERE LOWER(email) = LOWER($1) AND status = 'ativo'
      `;
      
      const result = await pool.query(query, [data.email]);
      
      if (result.rows.length === 0) {
        throw new Error('Credenciais inválidas');
      }

      const user = result.rows[0];

      // Verificar senha
      const isValidPassword = await bcrypt.compare(data.password, user.password_hash);
      
      if (!isValidPassword) {
        throw new Error('Credenciais inválidas');
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          nome: user.nome 
        },
        process.env.VITE_JWT_SECRET || 'default-secret',
        { expiresIn: process.env.VITE_JWT_EXPIRES_IN || '24h' }
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
        token,
        expires_in: 24 * 60 * 60 // 24 horas em segundos
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async register(data) {
    try {
      // Verificar se o email já existe (case-insensitive)
      const existingUser = await pool.query(
        'SELECT id FROM employees WHERE LOWER(email) = LOWER($1)',
        [data.email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Email já cadastrado');
      }

      // Hash da senha
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

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
        process.env.VITE_JWT_SECRET || 'default-secret',
        { expiresIn: process.env.VITE_JWT_EXPIRES_IN || '24h' }
      );

      const userRole = 'user';
      const permissions = this.getRolePermissions(userRole);

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
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.VITE_JWT_SECRET || 'default-secret');
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
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
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

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
}

export const authService = AuthService.getInstance();