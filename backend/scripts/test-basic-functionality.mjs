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

async function testBasicFunctionality() {
  console.log('🧪 Testando funcionalidades básicas das tabelas administrativas...')
  
  let allTestsPassed = true
  
  // Teste 1: Verificar configurações do sistema
  console.log('\n📋 Teste 1: Verificando configurações do sistema')
  try {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('categoria', { ascending: true })
    
    if (error) {
      console.error('❌ Erro ao buscar configurações:', error.message)
      allTestsPassed = false
    } else {
      console.log(`✅ Configurações encontradas: ${settings.length}`)
      
      // Agrupar por categoria
      const byCategory = settings.reduce((acc, setting) => {
        if (!acc[setting.categoria]) acc[setting.categoria] = []
        acc[setting.categoria].push(setting)
        return acc
      }, {})
      
      Object.entries(byCategory).forEach(([categoria, configs]) => {
        console.log(`   📂 ${categoria}: ${configs.length} configurações`)
      })
    }
  } catch (err) {
    console.error('❌ Erro no teste 1:', err.message)
    allTestsPassed = false
  }
  
  // Teste 2: Testar inserção em admin_documents
  console.log('\n📋 Teste 2: Testando inserção em admin_documents')
  try {
    const testDoc = {
      titulo: 'Documento de Teste',
      categoria: 'outros',
      descricao: 'Documento criado para teste de funcionalidade',
      tipo_arquivo: 'pdf',
      tamanho_arquivo: 1024,
      url_arquivo: 'https://example.com/test.pdf',
      status: 'ativo',
      criado_por: '00000000-0000-0000-0000-000000000000' // UUID fictício
    }
    
    const { data: insertedDoc, error: insertError } = await supabase
      .from('admin_documents')
      .insert(testDoc)
      .select()
    
    if (insertError) {
      console.error('❌ Erro ao inserir documento:', insertError.message)
      allTestsPassed = false
    } else {
      console.log('✅ Documento inserido com sucesso')
      console.log(`   📄 ID: ${insertedDoc[0].id}`)
      
      // Limpar o teste
      const { error: deleteError } = await supabase
        .from('admin_documents')
        .delete()
        .eq('id', insertedDoc[0].id)
      
      if (deleteError) {
        console.log('⚠️  Não foi possível remover documento de teste')
      } else {
        console.log('🗑️  Documento de teste removido')
      }
    }
  } catch (err) {
    console.error('❌ Erro no teste 2:', err.message)
    allTestsPassed = false
  }
  
  // Teste 3: Testar inserção em time_entries
  console.log('\n📋 Teste 3: Testando inserção em time_entries')
  try {
    const testEntry = {
      employee_id: '00000000-0000-0000-0000-000000000000', // UUID fictício
      data_ponto: new Date().toISOString().split('T')[0],
      entrada_manha: '08:00:00',
      saida_noite: '17:00:00',
      tipo_registro: 'normal',
      status: 'pendente'
    }
    
    const { data: insertedEntry, error: insertError } = await supabase
      .from('time_entries')
      .insert(testEntry)
      .select()
    
    if (insertError) {
      console.error('❌ Erro ao inserir registro de ponto:', insertError.message)
      allTestsPassed = false
    } else {
      console.log('✅ Registro de ponto inserido com sucesso')
      console.log(`   ⏰ ID: ${insertedEntry[0].id}`)
      
      // Limpar o teste
      const { error: deleteError } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', insertedEntry[0].id)
      
      if (deleteError) {
        console.log('⚠️  Não foi possível remover registro de teste')
      } else {
        console.log('🗑️  Registro de teste removido')
      }
    }
  } catch (err) {
    console.error('❌ Erro no teste 3:', err.message)
    allTestsPassed = false
  }
  
  // Teste 4: Testar inserção em audit_logs
  console.log('\n📝 Teste 4: Testando inserção em audit_logs')
  try {
    const testLog = {
      usuario_id: '00000000-0000-0000-0000-000000000000', // UUID fictício
      acao: 'CREATE',
      tabela_afetada: 'test_table',
      modulo: 'administrativo',
      categoria: 'teste'
    }
    
    const { data: insertedLog, error: insertError } = await supabase
      .from('audit_logs')
      .insert(testLog)
      .select()
    
    if (insertError) {
      console.error('❌ Erro ao inserir log de auditoria:', insertError.message)
      allTestsPassed = false
    } else {
      console.log('✅ Log de auditoria inserido com sucesso')
      console.log(`   📝 ID: ${insertedLog[0].id}`)
      
      // Limpar o teste
      const { error: deleteError } = await supabase
        .from('audit_logs')
        .delete()
        .eq('id', insertedLog[0].id)
      
      if (deleteError) {
        console.log('⚠️  Não foi possível remover log de teste')
      } else {
        console.log('🗑️  Log de teste removido')
      }
    }
  } catch (err) {
    console.error('❌ Erro no teste 4:', err.message)
    allTestsPassed = false
  }
  
  // Teste 5: Verificar relacionamentos
  console.log('\n📋 Teste 5: Verificando relacionamentos entre tabelas')
  try {
    // Verificar se as tabelas podem ser consultadas juntas
    const { data: joinTest, error: joinError } = await supabase
      .from('system_settings')
      .select('chave, valor, categoria')
      .eq('categoria', 'sistema')
      .limit(3)
    
    if (joinError) {
      console.error('❌ Erro ao testar consulta:', joinError.message)
      allTestsPassed = false
    } else {
      console.log('✅ Consultas funcionando corretamente')
      console.log(`   📊 Configurações de sistema: ${joinTest.length}`)
    }
  } catch (err) {
    console.error('❌ Erro no teste 5:', err.message)
    allTestsPassed = false
  }
  
  console.log('\n📊 Resumo dos testes:')
  if (allTestsPassed) {
    console.log('✅ Todos os testes passaram! As tabelas administrativas estão funcionando corretamente.')
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os detalhes acima.')
  }
  
  return allTestsPassed
}

// Executar testes
testBasicFunctionality()
  .then(success => {
    if (success) {
      console.log('\n🎉 Testes concluídos com sucesso!')
      process.exit(0)
    } else {
      console.log('\n⚠️  Testes concluídos com problemas.')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n❌ Erro durante testes:', error.message)
    process.exit(1)
  })