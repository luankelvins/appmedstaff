#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applySchemaPermissions() {
  console.log('🔧 Aplicando schema com colunas role e permissions...')
  
  try {
    // Primeiro, vamos tentar uma abordagem mais simples
    // Vamos usar o método de inserção/atualização para verificar se as colunas existem
    
    console.log('📋 Verificando perfil existente...')
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'Luankelvin@soumedstaff.com')
      .single()
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message)
      return
    }
    
    console.log('✅ Perfil encontrado:', existingProfile.email)
    
    // Tentar atualizar o perfil com as novas colunas
    console.log('🔧 Tentando adicionar colunas role, permissions e full_name...')
    
    const updateData = {
      role: 'super_admin',
      permissions: [
        'users.read', 'users.write', 'users.delete',
        'profiles.read', 'profiles.write', 'profiles.delete',
        'employees.read', 'employees.write', 'employees.delete',
        'tasks.read', 'tasks.write', 'tasks.delete',
        'leads.read', 'leads.write', 'leads.delete',
        'admin.access', 'admin.users', 'admin.settings',
        'system.backup', 'system.restore', 'system.maintenance',
        'reports.view', 'reports.export', 'analytics.view'
      ],
      full_name: 'Luan Kelvin'
    }
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('email', 'Luankelvin@soumedstaff.com')
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Erro ao atualizar perfil (colunas podem não existir):', updateError.message)
      console.log('\n📋 Isso indica que as colunas role, permissions e full_name ainda não existem.')
      console.log('🔧 Vamos tentar criar as colunas usando uma abordagem alternativa...')
      
      await createColumnsAlternative()
    } else {
      console.log('✅ Perfil atualizado com sucesso!')
      console.log('📋 Dados atualizados:')
      console.log(`  Role: ${updatedProfile.role}`)
      console.log(`  Full Name: ${updatedProfile.full_name}`)
      console.log(`  Permissions: ${updatedProfile.permissions?.length} permissões`)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

async function createColumnsAlternative() {
  console.log('🔧 Tentando criar colunas usando método alternativo...')
  
  try {
    // Vamos tentar usar uma query SQL direta através do REST API
    const sqlCommands = [
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT"
    ]
    
    for (const sql of sqlCommands) {
      console.log(`📄 Executando: ${sql}`)
      
      try {
        // Tentar executar usando fetch direto para a API REST do Supabase
        const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
          },
          body: JSON.stringify({ sql })
        })
        
        if (response.ok) {
          console.log('✅ Comando executado com sucesso')
        } else {
          const errorText = await response.text()
          console.log(`⚠️ Resposta: ${response.status} - ${errorText}`)
        }
      } catch (fetchError) {
        console.log(`⚠️ Erro na requisição: ${fetchError.message}`)
      }
    }
    
    // Verificar se as colunas foram criadas
    console.log('\n🔍 Verificando se as colunas foram criadas...')
    await verifyAndApplyPermissions()
    
  } catch (error) {
    console.error('❌ Erro no método alternativo:', error.message)
    
    // Se tudo falhar, mostrar instruções manuais
    showManualInstructions()
  }
}

async function verifyAndApplyPermissions() {
  try {
    const updateData = {
      role: 'super_admin',
      permissions: [
        'users.read', 'users.write', 'users.delete',
        'profiles.read', 'profiles.write', 'profiles.delete',
        'employees.read', 'employees.write', 'employees.delete',
        'tasks.read', 'tasks.write', 'tasks.delete',
        'leads.read', 'leads.write', 'leads.delete',
        'admin.access', 'admin.users', 'admin.settings',
        'system.backup', 'system.restore', 'system.maintenance',
        'reports.view', 'reports.export', 'analytics.view'
      ],
      full_name: 'Luan Kelvin'
    }
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('email', 'Luankelvin@soumedstaff.com')
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ As colunas ainda não existem:', updateError.message)
      showManualInstructions()
    } else {
      console.log('🎉 Sucesso! Perfil atualizado com permissões de superadmin!')
      console.log('📋 Dados finais:')
      console.log(`  Email: ${updatedProfile.email}`)
      console.log(`  Nome: ${updatedProfile.full_name}`)
      console.log(`  Role: ${updatedProfile.role}`)
      console.log(`  Permissões: ${updatedProfile.permissions?.length} permissões`)
      console.log(`  Employee ID: ${updatedProfile.employee_id}`)
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar e aplicar permissões:', error.message)
    showManualInstructions()
  }
}

function showManualInstructions() {
  console.log('\n📋 INSTRUÇÕES MANUAIS:')
  console.log('Como as colunas não puderam ser criadas automaticamente,')
  console.log('você precisa executar o seguinte SQL manualmente no Supabase SQL Editor:')
  console.log('')
  console.log('1. Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql')
  console.log('2. Execute o seguinte SQL:')
  console.log('')
  console.log('-- Adicionar colunas à tabela profiles')
  console.log("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';")
  console.log("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;")
  console.log("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;")
  console.log('')
  console.log('-- Criar índices')
  console.log('CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);')
  console.log('CREATE INDEX IF NOT EXISTS idx_profiles_permissions ON profiles USING GIN(permissions);')
  console.log('')
  console.log('3. Após executar o SQL, rode novamente:')
  console.log('   node scripts/apply-superadmin-permissions.mjs')
  console.log('')
}

// Executar o script
applySchemaPermissions()