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

async function testFrontendLogin() {
  try {
    console.log('🧪 Testando login como o frontend...')

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Variáveis do Supabase não configuradas')
      return
    }

    // Criar cliente exatamente como o frontend
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })

    console.log('1️⃣ Fazendo login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'luankelvin@soumedstaff.com',
      password: '123456'
    })

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message)
      return
    }

    console.log('✅ Login bem-sucedido!')
    console.log('   User ID:', loginData.user.id)
    console.log('   Email:', loginData.user.email)

    console.log('\n2️⃣ Testando busca do perfil...')
    const { data: profile, error: profileError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', loginData.user.id)
      .single()

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError)
      return
    }

    console.log('✅ Perfil encontrado!')
    console.log('   ID:', profile.id)
    console.log('   Email:', profile.email)
    console.log('   Status:', profile.status)
    console.log('   Nível de acesso:', profile.dados_profissionais?.nivel_acesso)
    console.log('   Nome:', profile.dados_pessoais?.nome_completo)

    console.log('\n3️⃣ Testando mapeamento...')
    const dadosPessoais = profile.dados_pessoais || {}
    const dadosProfissionais = profile.dados_profissionais || {}
    
    let role = 'user'
    if (dadosProfissionais.nivel_acesso === 'superadmin') {
      role = 'super_admin'
    }
    
    const mappedProfile = {
      id: profile.id,
      name: dadosPessoais.nome_completo || profile.email.split('@')[0],
      email: profile.email,
      role: role,
      department: dadosProfissionais.departamento || '',
      position: dadosProfissionais.cargo || '',
      permissions: role === 'super_admin' ? ['*'] : [],
      isActive: profile.status === 'ativo'
    }

    console.log('✅ Perfil mapeado:', mappedProfile)

    console.log('\n🎉 Teste completo bem-sucedido!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testFrontendLogin()
