#!/usr/bin/env node

/**
 * Script para criar usuário administrador no Supabase
 * 
 * Este script resolve o problema de "Invalid login credentials" criando
 * o usuário no sistema de autenticação do Supabase e seu perfil correspondente.
 * 
 * Uso: node scripts/create-admin-user.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas')
  console.error('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY estão definidas no .env')
  process.exit(1)
}

// Cliente Supabase com service role para operações administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Cria um usuário administrador no Supabase
 */
async function createAdminUser() {
  const adminData = {
    email: 'luankelvin@soumedstaff.com',
    password: 'Luan@1303',
    name: 'Luan Kelvin',
    position: 'Admin',
    department: 'Administração'
  }

  try {
    console.log('🔄 Criando usuário administrador...')

    // 1. Criar usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      email_confirm: true,
      user_metadata: {
        name: adminData.name,
        position: adminData.position
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  Usuário já existe no sistema de autenticação')
        
        // Buscar usuário existente
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers.users.find(u => u.email === adminData.email)
        
        if (existingUser) {
          console.log('✅ Usuário encontrado:', existingUser.id)
          
          // Verificar se perfil existe
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', existingUser.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            // Perfil não existe, criar
            await createProfile(existingUser.id, adminData)
          } else if (profile) {
            console.log('✅ Perfil já existe na tabela profiles')
          }
        }
      } else {
        throw authError
      }
    } else {
      console.log('✅ Usuário criado no sistema de autenticação:', authUser.user.id)
      
      // 2. Criar perfil na tabela profiles
      await createProfile(authUser.user.id, adminData)
    }

    console.log('🎉 Usuário administrador configurado com sucesso!')
    console.log('📧 Email:', adminData.email)
    console.log('🔑 Senha:', adminData.password)
    console.log('')
    console.log('Agora você pode fazer login na aplicação com essas credenciais.')

  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error.message)
    process.exit(1)
  }
}

/**
 * Cria o perfil do usuário na tabela profiles
 */
async function createProfile(userId, userData) {
  console.log('🔄 Criando perfil na tabela profiles...')

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      email: userData.email,
      name: userData.name,
      position: userData.position,
      department: userData.department
    })

  if (profileError) {
    if (profileError.code === '23505') {
      console.log('ℹ️  Perfil já existe na tabela profiles')
    } else {
      throw profileError
    }
  } else {
    console.log('✅ Perfil criado na tabela profiles')
  }
}

/**
 * Verifica se as tabelas necessárias existem
 */
async function checkTables() {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1)

    if (error && error.code === '42P01') {
      console.error('❌ Erro: Tabela "profiles" não existe')
      console.error('Execute primeiro os scripts de configuração do banco de dados')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message)
    process.exit(1)
  }
}

// Executar script
async function main() {
  console.log('🚀 Iniciando criação de usuário administrador...')
  console.log('')
  
  await checkTables()
  await createAdminUser()
}

main().catch(console.error)