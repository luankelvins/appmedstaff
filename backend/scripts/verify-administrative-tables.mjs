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

async function verifyTables() {
  console.log('🔍 Verificando integridade das tabelas administrativas...')
  console.log(`📍 URL: ${supabaseUrl}`)
  
  const tables = [
    'admin_documents',
    'time_entries', 
    'time_validations',
    'system_settings',
    'admin_reports',
    'audit_logs'
  ]
  
  let allTablesOk = true
  
  for (const tableName of tables) {
    console.log(`\n📋 Verificando tabela: ${tableName}`)
    
    try {
      // Verificar se a tabela existe e tem dados
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error(`   ❌ Erro ao acessar ${tableName}:`, error.message)
        allTablesOk = false
        continue
      }
      
      console.log(`   ✅ Tabela ${tableName} acessível`)
      console.log(`   📊 Registros: ${count || 0}`)
      
      // Verificar estrutura da tabela
      const { data: columns, error: columnsError } = await supabase.rpc('get_table_columns', {
        table_name: tableName
      }).catch(() => ({ data: null, error: { message: 'Função get_table_columns não disponível' } }))
      
      if (columnsError) {
        console.log(`   ⚠️  Não foi possível verificar colunas: ${columnsError.message}`)
      } else if (columns) {
        console.log(`   📝 Colunas: ${columns.length}`)
      }
      
      // Testar inserção básica (apenas para algumas tabelas)
      if (tableName === 'system_settings') {
        console.log(`   🧪 Testando inserção em ${tableName}...`)
        
        const testSetting = {
          chave: 'test_verification',
          valor: 'test_value',
          categoria: 'test',
          descricao: 'Configuração de teste para verificação',
          tipo_valor: 'string',
          visivel_usuario: false
        }
        
        const { data: insertData, error: insertError } = await supabase
          .from(tableName)
          .insert(testSetting)
          .select()
        
        if (insertError) {
          console.error(`   ❌ Erro ao inserir teste em ${tableName}:`, insertError.message)
          allTablesOk = false
        } else {
          console.log(`   ✅ Inserção de teste bem-sucedida`)
          
          // Remover o registro de teste
          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .eq('chave', 'test_verification')
          
          if (deleteError) {
            console.log(`   ⚠️  Não foi possível remover registro de teste: ${deleteError.message}`)
          } else {
            console.log(`   🗑️  Registro de teste removido`)
          }
        }
      }
      
      // Verificar RLS
      console.log(`   🔒 Verificando RLS para ${tableName}...`)
      const { data: rlsData, error: rlsError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (rlsError && rlsError.message.includes('row-level security')) {
        console.log(`   ✅ RLS ativo (acesso negado como esperado)`)
      } else if (rlsError) {
        console.log(`   ⚠️  Erro RLS: ${rlsError.message}`)
      } else {
        console.log(`   ✅ RLS configurado (acesso permitido)`)
      }
      
    } catch (err) {
      console.error(`   ❌ Erro geral ao verificar ${tableName}:`, err.message)
      allTablesOk = false
    }
  }
  
  console.log('\n📊 Resumo da verificação:')
  if (allTablesOk) {
    console.log('✅ Todas as tabelas administrativas estão funcionando corretamente!')
  } else {
    console.log('⚠️  Algumas tabelas apresentaram problemas. Verifique os detalhes acima.')
  }
  
  // Verificar configurações iniciais
  console.log('\n⚙️  Verificando configurações iniciais...')
  try {
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('*')
    
    if (settingsError) {
      console.error('❌ Erro ao buscar configurações:', settingsError.message)
    } else {
      console.log(`✅ Configurações encontradas: ${settings?.length || 0}`)
      
      if (settings && settings.length > 0) {
        const categories = [...new Set(settings.map(s => s.categoria))]
        console.log(`📂 Categorias: ${categories.join(', ')}`)
      }
    }
  } catch (err) {
    console.error('❌ Erro ao verificar configurações:', err.message)
  }
  
  return allTablesOk
}

// Executar verificação
verifyTables()
  .then(success => {
    if (success) {
      console.log('\n🎉 Verificação concluída com sucesso!')
      process.exit(0)
    } else {
      console.log('\n⚠️  Verificação concluída com problemas.')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n❌ Erro durante verificação:', error.message)
    process.exit(1)
  })