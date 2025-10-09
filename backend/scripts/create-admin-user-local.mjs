#!/usr/bin/env node

/**
 * Script para criar usuário administrador no banco PostgreSQL local
 * 
 * Uso: node scripts/create-admin-user-local.mjs
 */

import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

// Configuração do banco PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'appmedstaff',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(dbConfig);

/**
 * Cria um usuário administrador no banco local
 */
async function createAdminUser() {
  const adminData = {
    email: 'luankelvin@soumedstaff.com',
    password: 'Admin@1234',
    dados_pessoais: {
      nome: 'Luan Kelvin',
      cpf: '12345678901',
      telefone: '(11) 99999-9999',
      data_nascimento: '1990-01-01'
    },
    dados_profissionais: {
      cargo: 'Administrador',
      departamento: 'Administração',
      data_admissao: new Date().toISOString().split('T')[0],
      salario: 10000
    },
    dados_financeiros: {
      banco: 'Banco do Brasil',
      agencia: '1234',
      conta: '12345-6',
      pix: 'luankelvin@soumedstaff.com'
    },
    role: 'admin'
  };

  const client = await pool.connect();

  try {
    console.log('🔄 Criando usuário administrador...');

    // Verificar se o usuário já existe
    const existingUser = await client.query(
      'SELECT id FROM employees WHERE email = $1',
      [adminData.email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Usuário já existe. Atualizando dados...');
      
      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      
      // Atualizar usuário existente
      await client.query(`
        UPDATE employees 
        SET 
          dados_pessoais = $1,
          dados_profissionais = $2,
          dados_financeiros = $3,
          password_hash = $4,
          role = $5,
          status = 'ativo',
          updated_at = NOW()
        WHERE email = $6
      `, [
        JSON.stringify(adminData.dados_pessoais),
        JSON.stringify(adminData.dados_profissionais),
        JSON.stringify(adminData.dados_financeiros),
        hashedPassword, 
        adminData.role, 
        adminData.email
      ]);
      
      console.log('✅ Usuário administrador atualizado com sucesso!');
    } else {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      
      // Criar novo usuário
      const result = await client.query(`
        INSERT INTO employees (
          email, 
          dados_pessoais,
          dados_profissionais,
          dados_financeiros,
          password_hash, 
          role, 
          status,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id, email, dados_pessoais, role
      `, [
        adminData.email,
        JSON.stringify(adminData.dados_pessoais),
        JSON.stringify(adminData.dados_profissionais),
        JSON.stringify(adminData.dados_financeiros),
        hashedPassword,
        adminData.role,
        'ativo'
      ]);

      console.log('✅ Usuário administrador criado com sucesso!');
      console.log('📋 Dados do usuário:');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Email: ${result.rows[0].email}`);
      console.log(`   Nome: ${JSON.parse(result.rows[0].dados_pessoais).nome}`);
      console.log(`   Role: ${result.rows[0].role}`);
    }

    console.log('');
    console.log('🔑 Credenciais de acesso:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Senha: ${adminData.password}`);
    console.log('');
    console.log('🎯 O usuário pode agora fazer login na aplicação com privilégios de administrador.');

  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Verifica se a tabela employees existe
 */
async function checkTables() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'employees'
    `);
    
    if (result.rows.length === 0) {
      throw new Error('Tabela employees não encontrada. Execute primeiro o setup do banco de dados.');
    }
    
    console.log('✅ Tabela employees encontrada');
  } finally {
    client.release();
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log('🚀 Iniciando criação de usuário administrador...');
    
    await checkTables();
    await createAdminUser();
    
    console.log('🎉 Processo concluído com sucesso!');
  } catch (error) {
    console.error('💥 Erro durante a execução:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);