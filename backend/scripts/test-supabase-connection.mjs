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

async function testSupabaseConnection() {
  try {
    console.log('🧪 Testando conexão com Supabase...')

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

    console.log('1️⃣ Verificando variáveis...')
    console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.log('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌')

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Variáveis do Supabase não configuradas')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log('2️⃣ Testando conexão básica...')
    const { data: healthData, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (healthError) {
      console.error('❌ Erro na conexão:', healthError)
      return
    }

    console.log('✅ Conexão com Supabase funcionando')

    console.log('3️⃣ Testando busca de perfil específico...')
    const testUserId = 'b915cf4c-d2d9-4cd5-b37e-2cf0ff3147b5'
    
    console.log('   Buscando perfil para userId:', testUserId)
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single()

    console.log('   Resultado da busca:', { profileData, profileError })

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError)
      
      if (profileError.code === 'PGRST116') {
        console.log('📋 Perfil não encontrado. Verificando se existe na tabela...')
        
        const { data: allProfiles, error: allError } = await supabase
          .from('profiles')
          .select('id, email, name')
          .limit(10)

        if (allError) {
          console.error('❌ Erro ao listar profiles:', allError)
        } else {
          console.log('📋 Profiles encontrados:')
          allProfiles.forEach(p => console.log(`   - ${p.id}: ${p.email} (${p.name})`))
        }
      }
    } else {
      console.log('✅ Perfil encontrado:', profileData)
    }

    console.log('4️⃣ Testando RLS policies...')
    const { data: rlsTest, error: rlsError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1)

    if (rlsError) {
      console.error('❌ Erro RLS:', rlsError)
    } else {
      console.log('✅ RLS funcionando:', rlsTest)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testSupabaseConnection()
