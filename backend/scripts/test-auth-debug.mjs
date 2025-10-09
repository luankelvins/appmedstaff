#!/usr/bin/env node

import bcrypt from 'bcrypt';
import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.VITE_DB_HOST || 'localhost',
  port: parseInt(process.env.VITE_DB_PORT || '5432'),
  database: process.env.VITE_DB_NAME || 'appmedstaff',
  user: process.env.VITE_DB_USER || 'postgres',
  password: process.env.VITE_DB_PASSWORD || 'postgres',
});

async function testAuth() {
  try {
    console.log('🔐 Testando autenticação...\n');

    // Testar com os usuários existentes
    const testUsers = [
      { email: 'luankelvin@soumedstaff.com', password: '123456' },
      { email: 'admin@appmedstaff.com', password: '123456' },
      { email: 'admin@appmedstaff.com', password: 'admin123' },
      { email: 'luankelvin@soumedstaff.com', password: 'admin123' }
    ];

    for (const testUser of testUsers) {
      console.log(`🧪 Testando login: ${testUser.email} com senha: ${testUser.password}`);
      
      try {
        // Buscar usuário por email
        const query = `
          SELECT id, email, dados_pessoais->>'nome' as nome, role, status, password_hash
          FROM employees 
          WHERE LOWER(email) = LOWER($1) AND status = 'ativo'
        `;
        
        const result = await pool.query(query, [testUser.email]);
        
        if (result.rows.length === 0) {
          console.log(`   ❌ Usuário não encontrado: ${testUser.email}\n`);
          continue;
        }

        const user = result.rows[0];
        console.log(`   ✅ Usuário encontrado: ${user.nome} (${user.role})`);

        // Verificar senha
        const isValidPassword = await bcrypt.compare(testUser.password, user.password_hash);
        
        if (isValidPassword) {
          console.log(`   ✅ Senha correta! Login seria bem-sucedido.\n`);
        } else {
          console.log(`   ❌ Senha incorreta.\n`);
        }

      } catch (error) {
        console.log(`   ❌ Erro no teste: ${error.message}\n`);
      }
    }

    // Verificar hash das senhas armazenadas
    console.log('🔍 Verificando hashes das senhas armazenadas:\n');
    
    const allUsersQuery = `
      SELECT email, dados_pessoais->>'nome' as nome, 
             LEFT(password_hash, 20) || '...' as hash_preview
      FROM employees 
      WHERE status = 'ativo'
    `;
    
    const allUsers = await pool.query(allUsersQuery);
    
    allUsers.rows.forEach(user => {
      console.log(`📧 ${user.email} (${user.nome})`);
      console.log(`   Hash: ${user.hash_preview}`);
    });

  } catch (error) {
    console.error('❌ Erro no teste de autenticação:', error.message);
    console.error('📝 Detalhes:', error);
  } finally {
    await pool.end();
  }
}

testAuth();