import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import type { AuthResponse, LoginData, RegisterData } from '../types/database';

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Buscar usuário por email (case-insensitive)
      const query = `
        SELECT id, email, dados_pessoais->>'nome' as nome, role, status, password_hash
        FROM employees 
        WHERE LOWER(email) = LOWER($1) AND status = 'ativo'
      `;
      
      const result = await db.query(query, [data.email]);
      
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

      return {
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          role: 'user' // TODO: implementar sistema de roles
        },
        token,
        expires_in: 24 * 60 * 60 // 24 horas em segundos
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Verificar se o email já existe (case-insensitive)
      const existingUser = await db.query(
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

      const result = await db.query(insertQuery, [
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

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          nome: newUser.nome,
          role: 'user'
        },
        token,
        expires_in: 24 * 60 * 60
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.VITE_JWT_SECRET || 'default-secret');
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  async getCurrentUser(userId: string) {
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
      
      const result = await db.query(query, [userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      throw error;
    }
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Buscar senha atual
      const userQuery = 'SELECT password_hash FROM employees WHERE id = $1';
      const userResult = await db.query(userQuery, [userId]);
      
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
      await db.query(
        'UPDATE employees SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPasswordHash, userId]
      );
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    // Para JWT, o logout é feito no frontend removendo o token
    // Aqui podemos implementar uma blacklist de tokens se necessário
    return Promise.resolve();
  }
}

export const authService = AuthService.getInstance();