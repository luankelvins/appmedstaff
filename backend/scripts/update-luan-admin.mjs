#!/usr/bin/env node

import bcrypt from 'bcrypt';
import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

// Configuração do PostgreSQL
const pool = new Pool({
  host: process.env.VITE_DB_HOST || 'localhost',
  port: process.env.VITE_DB_PORT || 5432,
  database: process.env.VITE_DB_NAME || 'appmedstaff',
  user: process.env.VITE_DB_USER || 'postgres',
  password: process.env.VITE_DB_PASSWORD || 'postgres'
});

async function updateLuanToAdmin() {
  const email = 'luankelvin@soumedstaff.com';
  const newPassword = 'Admin@1234';
  
  console.log('🔐 Iniciando atualização do usuário:', email);
  console.log('');
  
  try {
    // 1. Verificar se o usuário existe
    console.log('📝 Etapa 1: Verificando usuário...');
    
    const userCheck = await pool.query(
      'SELECT id, email, dados_pessoais, role FROM employees WHERE email = $1',
      [email]
    );
    
    if (userCheck.rows.length === 0) {
      console.error('❌ Usuário não encontrado na tabela employees');
      return;
    }
    
    const user = userCheck.rows[0];
    const dadosPessoais = user.dados_pessoais || {};
    const nomeCompleto = dadosPessoais.nome_completo || 'Nome não informado';
    
    console.log('✅ Usuário encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${nomeCompleto}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role atual: ${user.role || 'não definido'}`);
    console.log('');
    
    // 2. Atualizar senha
    console.log('📝 Etapa 2: Atualizando senha...');
    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const passwordResult = await pool.query(
      'UPDATE employees SET password_hash = $1 WHERE email = $2 RETURNING email, dados_pessoais',
      [hashedPassword, email]
    );
    
    if (passwordResult.rows.length > 0) {
      console.log('✅ Senha atualizada com sucesso!');
    } else {
      console.log('❌ Erro ao atualizar senha');
      return;
    }
    
    console.log('');
    
    // 3. Atualizar role e permissões
    console.log('📝 Etapa 3: Configurando permissões de superadmin...');
    
    const roleResult = await pool.query(
      'UPDATE employees SET role = $1 WHERE email = $2 RETURNING email, dados_pessoais, role',
      ['superadmin', email]
    );
    
    if (roleResult.rows.length > 0) {
      const updatedUser = roleResult.rows[0];
      console.log('✅ Permissões atualizadas com sucesso!');
      console.log(`   Role: ${updatedUser.role}`);
      console.log('   Permissions: Acesso total (superadmin)');
    } else {
      console.log('❌ Erro ao atualizar permissões');
      return;
    }
    
    console.log('');
    console.log('🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('');
    console.log('📋 Resumo das alterações:');
    console.log(`   Email: ${email}`);
    console.log(`   Nova senha: ${newPassword}`);
    console.log('   Role: superadmin');
    console.log('   Permissions: Acesso total à plataforma');
    console.log('');
    console.log('🔑 O usuário agora tem acesso completo à plataforma!');
    
  } catch (error) {
    console.error('❌ Erro durante a atualização:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

updateLuanToAdmin();