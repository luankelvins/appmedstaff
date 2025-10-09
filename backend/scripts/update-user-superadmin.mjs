#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  console.error('Certifique-se de ter VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function updateUserToSuperAdmin() {
  const email = 'Luankelvin@soumedstaff.com'
  
  console.log('🔍 Buscando usuário:', email)
  
  // Buscar usuário atual
  const { data: user, error: findError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (findError) {
    console.error('❌ Erro ao buscar usuário:', findError)
    return
  }

  if (!user) {
    console.error('❌ Usuário não encontrado')
    return
  }

  console.log('👤 Usuário atual:')
  console.log('   ID:', user.id)
  console.log('   Nome:', user.name)
  console.log('   Email:', user.email)
  console.log('   Role atual:', user.role || 'não definido')
  console.log('   Permissions atuais:', user.permissions || 'não definido')
  console.log('')

  // Atualizar para super_admin
  console.log('🔄 Atualizando para super_admin...')
  
  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({
      role: 'super_admin',
      permissions: ['*']
    })
    .eq('email', email)
    .select()
    .single()

  if (updateError) {
    console.error('❌ Erro ao atualizar:', updateError)
    return
  }

  console.log('✅ Usuário atualizado com sucesso!')
  console.log('   Role:', updated.role)
  console.log('   Permissions:', updated.permissions)
  console.log('')
  console.log('🎉 Agora você é um SUPER ADMIN!')
  console.log('   Você tem acesso total a todas as funcionalidades do sistema.')
}

updateUserToSuperAdmin()

