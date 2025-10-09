#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carregar variáveis de ambiente
const envPath = join(__dirname, '..', '.env')
const envContent = readFileSync(envPath, 'utf8')
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').trim()
    process.env[key.trim()] = value
  }
})

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas')
  console.error('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY estão no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🚀 Iniciando setup de User Preferences...\n')

async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql })
    if (error) {
      console.error('❌ Erro ao executar SQL:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('❌ Erro:', err.message)
    return false
  }
}

async function main() {
  try {
    // Ler o arquivo SQL
    const sqlPath = join(__dirname, '..', 'database', 'user_preferences_schema.sql')
    const sqlContent = readFileSync(sqlPath, 'utf8')

    console.log('📄 Executando user_preferences_schema.sql...')
    
    // Dividir em statements individuais (simples, pode não cobrir todos os casos)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement) continue

      console.log(`\n[${i + 1}/${statements.length}] Executando statement...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          query: statement + ';' 
        })

        if (error) {
          // Ignorar erros de "já existe"
          if (
            error.message?.includes('already exists') ||
            error.message?.includes('duplicate key')
          ) {
            console.log('⚠️  Já existe (ignorado)')
            successCount++
          } else {
            console.error('❌ Erro:', error.message)
            errorCount++
          }
        } else {
          console.log('✅ Sucesso')
          successCount++
        }
      } catch (err) {
        console.error('❌ Erro de execução:', err.message)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Sucesso: ${successCount}`)
    console.log(`❌ Erros: ${errorCount}`)
    console.log('='.repeat(50))

    // Verificar tabelas criadas
    console.log('\n📊 Verificando tabelas criadas...\n')

    const tables = [
      'user_preferences',
      'user_security_settings',
      'trusted_devices',
      'activity_logs'
    ]

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ ${table}: Erro - ${error.message}`)
      } else {
        console.log(`✅ ${table}: ${count || 0} registros`)
      }
    }

    console.log('\n✅ Setup de User Preferences concluído!\n')
    console.log('📝 Próximos passos:')
    console.log('1. Teste acessar /profile no navegador')
    console.log('2. Altere preferências, segurança, notificações')
    console.log('3. Recarregue a página e verifique se as mudanças foram salvas\n')

  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message)
    process.exit(1)
  }
}

main()

