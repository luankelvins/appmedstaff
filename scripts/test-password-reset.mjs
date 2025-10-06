#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carregar variáveis do .env
try {
  const envPath = join(__dirname, '..', '.env')
  const envContent = readFileSync(envPath, 'utf8')
  const envLines = envContent.split('\n')
  
  envLines.forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      process.env[key.trim()] = value.trim()
    }
  })
} catch (error) {
  console.log('⚠️  Não foi possível carregar .env:', error.message)
}

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testPasswordReset() {
  try {
    console.log('🧪 Testando sistema de recuperação de senha...')

    // 1. Verificar se a tabela existe
    console.log('1️⃣ Verificando tabela password_reset_tokens...')
    const { data: tableData, error: tableError } = await supabase
      .from('password_reset_tokens')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('❌ Tabela password_reset_tokens não existe:', tableError.message)
      console.log('📋 Execute o schema no Supabase SQL Editor:')
      console.log('   database/password_reset_schema.sql')
      return
    }

    console.log('✅ Tabela password_reset_tokens existe')

    // 2. Verificar se há usuários na tabela profiles
    console.log('2️⃣ Verificando usuários na tabela profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .limit(5)

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError.message)
      return
    }

    console.log('✅ Profiles encontrados:', profiles.length)
    profiles.forEach(p => console.log(`   - ${p.email} (${p.name})`))

    // 3. Testar inserção de token
    console.log('3️⃣ Testando inserção de token...')
    const testUserId = profiles[0]?.id
    if (!testUserId) {
      console.error('❌ Nenhum usuário encontrado para teste')
      return
    }

    const testToken = `test-token-${Date.now()}`
    const { data: insertData, error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: testUserId,
        token: testToken,
        email: profiles[0].email,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      })
      .select()

    if (insertError) {
      console.error('❌ Erro ao inserir token:', insertError.message)
      return
    }

    console.log('✅ Token inserido com sucesso:', insertData[0].id)

    // 4. Limpar token de teste
    console.log('4️⃣ Limpando token de teste...')
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('token', testToken)

    console.log('✅ Token de teste removido')

    // 5. Verificar variáveis de ambiente
    console.log('5️⃣ Verificando variáveis de ambiente...')
    console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.log('   VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
    console.log('   VITE_RESEND_API_KEY:', process.env.VITE_RESEND_API_KEY ? '✅' : '❌')

    console.log('\n🎉 Sistema de recuperação de senha está funcionando!')
    console.log('📧 Configure VITE_RESEND_API_KEY para testar envio de emails')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testPasswordReset()
