#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas:')
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupPasswordReset() {
  try {
    console.log('🔧 Configurando sistema de recuperação de senha...')

    // Ler o arquivo SQL
    const sqlPath = join(__dirname, '..', 'database', 'password_reset_schema.sql')
    const sqlContent = readFileSync(sqlPath, 'utf8')

    // Executar o SQL
    console.log('📝 Executando schema de recuperação de senha...')
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent })

    if (error) {
      console.error('❌ Erro ao executar SQL:', error)
      
      // Tentar executar manualmente
      console.log('🔄 Tentando executar manualmente...')
      
      // Criar tabela
      const { error: tableError } = await supabase
        .from('password_reset_tokens')
        .select('id')
        .limit(1)

      if (tableError && tableError.code === 'PGRST116') {
        console.log('📋 Criando tabela password_reset_tokens...')
        
        // Executar comandos SQL individuais
        const commands = [
          `CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            token TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            used_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`,
          `CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)`,
          `CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)`,
          `CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email)`,
          `CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)`,
          `CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_created_at ON password_reset_tokens(created_at)`
        ]

        for (const command of commands) {
          try {
            await supabase.rpc('exec_sql', { sql: command })
            console.log('✅ Comando executado:', command.substring(0, 50) + '...')
          } catch (cmdError) {
            console.log('⚠️  Comando falhou (pode já existir):', cmdError.message)
          }
        }
      }
    }

    // Verificar se a tabela foi criada
    const { data: testData, error: testError } = await supabase
      .from('password_reset_tokens')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('❌ Erro ao verificar tabela:', testError)
      console.log('\n📋 Execute manualmente no Supabase SQL Editor:')
      console.log('1. Acesse: https://supabase.com/dashboard')
      console.log('2. Vá em SQL Editor')
      console.log('3. Execute o conteúdo do arquivo: database/password_reset_schema.sql')
      process.exit(1)
    }

    console.log('✅ Sistema de recuperação de senha configurado com sucesso!')
    console.log('📧 Lembre-se de configurar VITE_RESEND_API_KEY no .env')

  } catch (error) {
    console.error('❌ Erro geral:', error)
    console.log('\n📋 Execute manualmente no Supabase SQL Editor:')
    console.log('1. Acesse: https://supabase.com/dashboard')
    console.log('2. Vá em SQL Editor')
    console.log('3. Execute o conteúdo do arquivo: database/password_reset_schema.sql')
    process.exit(1)
  }
}

setupPasswordReset()
