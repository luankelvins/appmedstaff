#!/usr/bin/env node

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

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco de dados...\n');

    // Verificar se a tabela employees existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'employees'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela employees não existe!');
      return;
    }

    console.log('✅ Tabela employees existe');

    // Listar todos os usuários
    const usersQuery = `
      SELECT 
        id, 
        email, 
        dados_pessoais->>'nome' as nome, 
        role, 
        status,
        CASE 
          WHEN password_hash IS NOT NULL THEN 'Sim'
          ELSE 'Não'
        END as tem_senha,
        created_at
      FROM employees 
      ORDER BY created_at DESC;
    `;
    
    const result = await pool.query(usersQuery);
    
    console.log(`\n📊 Total de usuários encontrados: ${result.rows.length}\n`);
    
    if (result.rows.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado na tabela employees');
      console.log('💡 Você precisa criar um usuário primeiro');
      return;
    }

    console.log('👥 Usuários encontrados:');
    console.log('─'.repeat(80));
    
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Nome: ${user.nome || 'Não informado'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Tem senha: ${user.tem_senha}`);
      console.log(`   Criado em: ${user.created_at}`);
      console.log('─'.repeat(40));
    });

    // Verificar usuários ativos
    const activeUsers = result.rows.filter(user => user.status === 'ativo');
    console.log(`\n✅ Usuários ativos: ${activeUsers.length}`);
    
    // Verificar usuários com senha
    const usersWithPassword = result.rows.filter(user => user.tem_senha === 'Sim');
    console.log(`🔐 Usuários com senha: ${usersWithPassword.length}`);

    if (activeUsers.length === 0) {
      console.log('\n⚠️  Nenhum usuário ativo encontrado!');
    }

    if (usersWithPassword.length === 0) {
      console.log('\n⚠️  Nenhum usuário com senha encontrado!');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error.message);
    console.error('📝 Detalhes do erro:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();