#!/usr/bin/env node

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

async function testEmailService() {
  try {
    console.log('🧪 Testando serviço de email...')

    // Verificar variáveis de ambiente
    console.log('1️⃣ Verificando variáveis de ambiente...')
    console.log('   VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅' : '❌')
    console.log('   VITE_SUPABASE_SERVICE_ROLE_KEY:', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌')
    console.log('   VITE_RESEND_API_KEY:', process.env.VITE_RESEND_API_KEY ? '✅' : '❌')

    if (!process.env.VITE_RESEND_API_KEY) {
      console.error('❌ VITE_RESEND_API_KEY não configurada')
      console.log('📧 Configure a API Key do Resend no arquivo .env')
      return
    }

    // Testar Resend diretamente
    console.log('2️⃣ Testando Resend API...')
    
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.VITE_RESEND_API_KEY)

    const { data, error } = await resend.emails.send({
      from: 'MedStaff <onboarding@resend.dev>',
      to: ['luankelvin@soumedstaff.com'], // Email do usuário (obrigatório em modo teste)
      subject: 'Teste de Email - MedStaff',
      html: '<h1>Teste de Email</h1><p>Este é um email de teste do sistema MedStaff.</p>'
    })

    if (error) {
      console.error('❌ Erro ao enviar email:', error)
      return
    }

    console.log('✅ Email enviado com sucesso:', data)

    console.log('\n🎉 Serviço de email está funcionando!')
    console.log('📋 Próximos passos:')
    console.log('   1. Execute o SQL no Supabase: EXECUTE_PASSWORD_RESET_SCHEMA.sql')
    console.log('   2. Teste o fluxo completo no navegador')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testEmailService()
