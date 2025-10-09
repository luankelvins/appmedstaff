#!/usr/bin/env node

import bcrypt from 'bcrypt';
import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

const pool = new Pool({
  host: process.env.VITE_DB_HOST || 'localhost',
  port: process.env.VITE_DB_PORT || 5432,
  database: process.env.VITE_DB_NAME || 'appmedstaff',
  user: process.env.VITE_DB_USER || 'postgres',
  password: process.env.VITE_DB_PASSWORD || 'postgres'
});

async function updatePassword() {
  try {
    const email = 'luankelvin@soumedstaff.com';
    const newPassword = 'Test123!@#'; // Senha que atende aos critérios
    
    console.log('🔐 Atualizando senha do usuário de teste...');
    
    // Hash da nova senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Atualizar no banco
    const result = await pool.query(
      'UPDATE employees SET password_hash = $1 WHERE email = $2 RETURNING email',
      [hashedPassword, email]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Senha atualizada com sucesso!');
      console.log(`   Email: ${email}`);
      console.log(`   Nova senha: ${newPassword}`);
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar senha:', error.message);
  } finally {
    await pool.end();
  }
}

updatePassword();