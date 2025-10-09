#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

async function addRoleAndPermissionsColumns() {
  console.log('🔧 Adicionando colunas role e permissions à tabela profiles...\n')

  try {
    // Ler o arquivo SQL
    const sqlPath = join(__dirname, '..', 'database', 'add-permissions-columns.sql')
    const sql = readFileSync(sqlPath, 'utf8')

    console.log('📄 Executando SQL:\n')
    console.log(sql)
    console.log('\n')

    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Tentar executar via query direta
      console.log('⚠️  RPC não disponível, tentando via query direta...\n')
      
      // Adicionar coluna role
      const { error: error1 } = await supabase.rpc('exec', { 
        query: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';`
      })
      
      if (error1) {
        console.log('Tentando método alternativo...')
        // Como não podemos executar DDL diretamente, vamos usar o painel do Supabase
        console.log('\n⚠️  Não foi possível executar via API.')
        console.log('\n📋 Execute este SQL manualmente no Supabase SQL Editor:\n')
        console.log('─'.repeat(80))
        console.log(sql)
        console.log('─'.repeat(80))
        console.log('\n🔗 Acesse: https://app.supabase.com/project/_/sql\n')
        return
      }
    }

    console.log('✅ Colunas adicionadas com sucesso!')
    
  } catch (err) {
    console.error('❌ Erro:', err)
  }
}

addRoleAndPermissionsColumns()

