#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Diagnóstico de Conectividade Supabase\n')

// Verificar variáveis de ambiente
console.log('1️⃣ Verificando variáveis de ambiente:')
console.log(`   VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ Não configurada'}`)
console.log(`   VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada'}`)
console.log(`   VITE_SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Configurada' : '❌ Não configurada'}`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Variáveis essenciais não configuradas. Abortando...')
  process.exit(1)
}

// Criar clientes
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'medstaff-diagnostic'
    }
  }
})

const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'X-Client-Info': 'medstaff-diagnostic-admin'
        }
      }
    })
  : null

async function testConnection() {
  console.log('\n2️⃣ Testando conectividade básica:')
  
  try {
    // Teste de conectividade básica
    const startTime = Date.now()
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
    
    const latency = Date.now() - startTime
    
    if (error) {
      console.log(`   ❌ Erro na conexão: ${error.message}`)
      console.log(`   📊 Detalhes: ${JSON.stringify(error, null, 2)}`)
      return false
    } else {
      console.log(`   ✅ Conexão estabelecida (${latency}ms)`)
      return true
    }
  } catch (err) {
    console.log(`   ❌ Erro de rede: ${err.message}`)
    return false
  }
}

async function testTables() {
  console.log('\n3️⃣ Testando acesso às tabelas:')
  
  const tables = ['profiles', 'employees', 'tasks', 'leads', 'lead_comments']
  
  for (const table of tables) {
    try {
      const startTime = Date.now()
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      const latency = Date.now() - startTime
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message} (${latency}ms)`)
      } else {
        console.log(`   ✅ ${table}: Acessível (${latency}ms)`)
      }
    } catch (err) {
      console.log(`   ❌ ${table}: Erro de rede - ${err.message}`)
    }
  }
}

async function testAuth() {
  console.log('\n4️⃣ Testando autenticação:')
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log(`   ❌ Erro ao verificar sessão: ${error.message}`)
    } else {
      console.log(`   ✅ Verificação de sessão: ${session ? 'Usuário logado' : 'Sem sessão ativa'}`)
    }
  } catch (err) {
    console.log(`   ❌ Erro na verificação de auth: ${err.message}`)
  }
}

async function testAdminConnection() {
  if (!supabaseAdmin) {
    console.log('\n5️⃣ Testando conexão admin: ⚠️ Service role key não configurada')
    return
  }
  
  console.log('\n5️⃣ Testando conexão admin:')
  
  try {
    const startTime = Date.now()
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('count', { count: 'exact', head: true })
    
    const latency = Date.now() - startTime
    
    if (error) {
      console.log(`   ❌ Erro na conexão admin: ${error.message} (${latency}ms)`)
    } else {
      console.log(`   ✅ Conexão admin estabelecida (${latency}ms)`)
    }
  } catch (err) {
    console.log(`   ❌ Erro de rede admin: ${err.message}`)
  }
}

async function runDiagnostic() {
  const connectionOk = await testConnection()
  
  if (connectionOk) {
    await testTables()
    await testAuth()
    await testAdminConnection()
  }
  
  console.log('\n📋 Diagnóstico concluído!')
  
  if (!connectionOk) {
    console.log('\n🔧 Sugestões para resolver problemas de conectividade:')
    console.log('   1. Verifique se as variáveis de ambiente estão corretas')
    console.log('   2. Confirme se o projeto Supabase está ativo')
    console.log('   3. Verifique sua conexão com a internet')
    console.log('   4. Tente acessar o dashboard do Supabase diretamente')
    console.log('   5. Verifique se há firewalls bloqueando a conexão')
  }
}

runDiagnostic().catch(console.error)