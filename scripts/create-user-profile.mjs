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

async function createUserProfile() {
  try {
    console.log('👤 Criando perfil do usuário...')

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis do Supabase não configuradas')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // ID do usuário que está tentando fazer login
    const userId = 'b915cf4c-d2d9-4cd5-b37e-2cf0ff3147b5'
    const userEmail = 'Luankelvin@soumedstaff.com'

    console.log('1️⃣ Verificando se o perfil já existe...')
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar perfil:', checkError)
      return
    }

    if (existingProfile) {
      console.log('✅ Perfil já existe:', existingProfile)
      return
    }

    console.log('2️⃣ Criando perfil do usuário...')
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: userEmail,
        name: 'Luan Kelvin',
        full_name: 'Luan Kelvin',
        role: 'super_admin',
        permissions: ['*'],
        position: 'Desenvolvedor Full Stack',
        department: 'Tecnologia',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Erro ao criar perfil:', createError)
      return
    }

    console.log('✅ Perfil criado com sucesso:', newProfile)

    console.log('3️⃣ Verificando se o perfil foi criado...')
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (verifyError) {
      console.error('❌ Erro ao verificar perfil criado:', verifyError)
    } else {
      console.log('✅ Perfil verificado:', verifyProfile)
    }

    console.log('\n🎉 Perfil do usuário criado com sucesso!')
    console.log('📋 Agora você pode fazer login normalmente')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createUserProfile()
