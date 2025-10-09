#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTableStructure() {
  console.log('🔍 Verificando estrutura real das tabelas...')
  
  const tables = [
    'admin_documents',
    'time_entries', 
    'time_validations',
    'system_settings',
    'admin_reports',
    'audit_logs'
  ]
  
  for (const tableName of tables) {
    console.log(`\n📋 Estrutura da tabela: ${tableName}`)
    
    try {
      // Tentar fazer uma consulta vazia para ver os campos disponíveis
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0)
      
      if (error) {
        console.error(`   ❌ Erro ao acessar ${tableName}:`, error.message)
        continue
      }
      
      console.log(`   ✅ Tabela ${tableName} acessível`)
      
      // Tentar uma consulta com LIMIT 1 para ver a estrutura
      const { data: sample, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (sampleError) {
        console.log(`   ⚠️  Erro ao buscar amostra: ${sampleError.message}`)
      } else if (sample && sample.length > 0) {
        console.log(`   📝 Colunas encontradas:`)
        Object.keys(sample[0]).forEach(column => {
          console.log(`      - ${column}`)
        })
      } else {
        console.log(`   📝 Tabela vazia, tentando inserção de teste...`)
        
        // Tentar inserção básica para descobrir campos obrigatórios
        const { error: insertError } = await supabase
          .from(tableName)
          .insert({})
        
        if (insertError) {
          console.log(`   💡 Erro de inserção (revela campos): ${insertError.message}`)
        }
      }
      
    } catch (err) {
      console.error(`   ❌ Erro geral ao verificar ${tableName}:`, err.message)
    }
  }
}

// Executar verificação
checkTableStructure()
  .then(() => {
    console.log('\n✅ Verificação de estrutura concluída!')
  })
  .catch(error => {
    console.error('\n❌ Erro durante verificação:', error.message)
    process.exit(1)
  })