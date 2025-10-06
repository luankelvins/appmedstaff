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

async function clearBrowserCache() {
  try {
    console.log('🧹 Limpando cache do navegador...')

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Variáveis do Supabase não configuradas')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Fazer logout para limpar a sessão
    console.log('1️⃣ Fazendo logout...')
    const { error: logoutError } = await supabase.auth.signOut()
    
    if (logoutError) {
      console.log('⚠️  Erro no logout (pode ser normal):', logoutError.message)
    } else {
      console.log('✅ Logout realizado')
    }

    // Limpar storage local (simular limpeza do navegador)
    console.log('2️⃣ Limpando storage...')
    // Em um ambiente real, isso seria feito no navegador
    console.log('   (No navegador, execute: localStorage.clear() e sessionStorage.clear())')

    console.log('\n📋 Instruções para o navegador:')
    console.log('1. Abra o DevTools (F12)')
    console.log('2. Vá para a aba Application/Storage')
    console.log('3. Clique em "Clear storage" ou execute:')
    console.log('   localStorage.clear()')
    console.log('   sessionStorage.clear()')
    console.log('4. Recarregue a página (Ctrl+F5)')
    console.log('5. Tente fazer login novamente')

    console.log('\n🔧 Verificações adicionais:')
    console.log('- Verifique se as variáveis de ambiente estão corretas no .env')
    console.log('- Verifique se o servidor de desenvolvimento está rodando')
    console.log('- Verifique se não há erros no console do navegador')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

clearBrowserCache()
