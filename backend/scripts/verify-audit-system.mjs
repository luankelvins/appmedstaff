#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyAuditSystem() {
  console.log('🔍 Verificando sistema de auditoria...\n')

  try {
    // 1. Verificar se as tabelas existem
    console.log('📋 Verificando tabelas de auditoria...')
    
    const tables = ['audit_logs', 'user_sessions', 'audit_settings']
    const tableStatus = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          tableStatus[table] = { exists: false, error: error.message }
        } else {
          tableStatus[table] = { exists: true, count: data?.length || 0 }
        }
      } catch (err) {
        tableStatus[table] = { exists: false, error: err.message }
      }
    }

    // 2. Verificar funções
    console.log('\n🔧 Verificando funções de auditoria...')
    
    const functions = ['log_audit_action', 'get_audit_stats', 'cleanup_old_audit_logs']
    const functionStatus = {}
    
    for (const func of functions) {
      try {
        // Tentar chamar a função com parâmetros mínimos para verificar se existe
        if (func === 'log_audit_action') {
          const { error } = await supabase.rpc(func, {
            p_actor_id: '00000000-0000-0000-0000-000000000000',
            p_actor_name: 'test',
            p_actor_role: 'test',
            p_action: 'test',
            p_entity: 'test',
            p_entity_id: 'test'
          })
          functionStatus[func] = { exists: !error || !error.message.includes('function') }
        } else if (func === 'get_audit_stats') {
          const { error } = await supabase.rpc(func)
          functionStatus[func] = { exists: !error || !error.message.includes('function') }
        } else {
          const { error } = await supabase.rpc(func)
          functionStatus[func] = { exists: !error || !error.message.includes('function') }
        }
      } catch (err) {
        functionStatus[func] = { exists: false, error: err.message }
      }
    }

    // 3. Verificar configurações de auditoria
    console.log('\n⚙️ Verificando configurações de auditoria...')
    
    let auditSettings = []
    if (tableStatus.audit_settings?.exists) {
      try {
        const { data, error } = await supabase
          .from('audit_settings')
          .select('*')
        
        if (!error) {
          auditSettings = data || []
        }
      } catch (err) {
        console.log('❌ Erro ao buscar configurações:', err.message)
      }
    }

    // 4. Verificar logs existentes
    console.log('\n📊 Verificando logs de auditoria...')
    
    let auditLogsCount = 0
    if (tableStatus.audit_logs?.exists) {
      try {
        const { count, error } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
        
        if (!error) {
          auditLogsCount = count || 0
        }
      } catch (err) {
        console.log('❌ Erro ao contar logs:', err.message)
      }
    }

    // Relatório final
    console.log('\n📋 RELATÓRIO DO SISTEMA DE AUDITORIA')
    console.log('=' .repeat(50))
    
    console.log('\n📊 Status das Tabelas:')
    for (const [table, status] of Object.entries(tableStatus)) {
      if (status.exists) {
        console.log(`✅ ${table}: Existe`)
      } else {
        console.log(`❌ ${table}: Não existe - ${status.error}`)
      }
    }
    
    console.log('\n🔧 Status das Funções:')
    for (const [func, status] of Object.entries(functionStatus)) {
      if (status.exists) {
        console.log(`✅ ${func}: Existe`)
      } else {
        console.log(`❌ ${func}: Não existe`)
      }
    }
    
    console.log('\n⚙️ Configurações de Auditoria:')
    if (auditSettings.length > 0) {
      console.log(`✅ ${auditSettings.length} configurações encontradas:`)
      auditSettings.forEach(setting => {
        console.log(`   - ${setting.entity_type}: ${setting.is_enabled ? 'Ativo' : 'Inativo'} (${setting.retention_days} dias)`)
      })
    } else {
      console.log('❌ Nenhuma configuração encontrada')
    }
    
    console.log('\n📊 Logs de Auditoria:')
    console.log(`📈 Total de logs: ${auditLogsCount}`)
    
    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:')
    
    const missingTables = Object.entries(tableStatus).filter(([_, status]) => !status.exists)
    const missingFunctions = Object.entries(functionStatus).filter(([_, status]) => !status.exists)
    
    if (missingTables.length > 0 || missingFunctions.length > 0) {
      console.log('❌ Sistema de auditoria incompleto!')
      console.log('📝 Execute o SQL manualmente no Supabase SQL Editor:')
      console.log('   - Arquivo: database/audit_schema.sql')
      console.log('   - Ou execute: node scripts/setup-audit-schema.mjs')
    } else {
      console.log('✅ Sistema de auditoria está funcionando!')
      if (auditLogsCount === 0) {
        console.log('💡 Considere testar o sistema criando alguns logs de teste')
      }
    }

  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message)
    process.exit(1)
  }
}

verifyAuditSystem()