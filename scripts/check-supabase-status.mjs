import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSupabaseStatus() {
  console.log('🔍 Verificando status do Supabase...')
  console.log(`📍 URL: ${supabaseUrl}`)
  console.log(`🔑 Projeto ID: ${supabaseUrl.split('//')[1]?.split('.')[0]}`)
  
  try {
    // Verificar tabelas existentes
    console.log('\n📊 Verificando tabelas existentes...')
    
    const tables = [
      'profiles', 'employees', 'tasks', 'leads', 
      'clientes_pf', 'clientes_pj', 'contratos', 'irpf',
      'financial_categories', 'bank_accounts', 'payment_methods', 'revenues', 'expenses',
      'audit_logs', 'user_sessions', 'audit_settings'
    ]
    
    const tableStatus = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          tableStatus[table] = { exists: false, error: error.message }
        } else {
          tableStatus[table] = { exists: true, count: data?.length || 0 }
        }
      } catch (err) {
        tableStatus[table] = { exists: false, error: err.message }
      }
    }
    
    // Exibir resultados
    console.log('\n📋 Status das tabelas:')
    Object.entries(tableStatus).forEach(([table, status]) => {
      if (status.exists) {
        console.log(`  ✅ ${table} - ${status.count} registros`)
      } else {
        console.log(`  ❌ ${table} - ${status.error}`)
      }
    })
    
    // Verificar funções RPC
    console.log('\n🔧 Verificando funções RPC...')
    
    const rpcFunctions = [
      'get_tables_info',
      'execute_sql', 
      'log_audit_action',
      'get_audit_stats'
    ]
    
    for (const func of rpcFunctions) {
      try {
        const { data, error } = await supabase.rpc(func)
        if (error) {
          console.log(`  ❌ ${func} - ${error.message}`)
        } else {
          console.log(`  ✅ ${func} - Funcionando`)
        }
      } catch (err) {
        console.log(`  ❌ ${func} - ${err.message}`)
      }
    }
    
    // Resumo
    const existingTables = Object.values(tableStatus).filter(s => s.exists).length
    const totalTables = Object.keys(tableStatus).length
    
    console.log('\n📈 Resumo:')
    console.log(`  📊 Tabelas: ${existingTables}/${totalTables} existentes`)
    console.log(`  🔧 Funções RPC: Verificadas acima`)
    
    if (existingTables < totalTables) {
      console.log('\n⚠️  Algumas tabelas estão faltando. Será necessário executar migrações.')
    } else {
      console.log('\n✅ Todas as tabelas principais estão presentes!')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

checkSupabaseStatus()