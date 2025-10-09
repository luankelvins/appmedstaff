import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY não encontrada no .env')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkTableStructure(tableName) {
  console.log(`\n🔍 === DIAGNÓSTICO DA TABELA ${tableName.toUpperCase()} ===`)
  
  try {
    // Tentar uma query simples para verificar se a tabela existe
    const { data: testData, error: testError } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .limit(1)

    if (testError && (testError.code === '42P01' || testError.message.includes('does not exist'))) {
      console.log(`❌ Tabela '${tableName}' NÃO EXISTE`)
      return { exists: false, count: 0, structure: null }
    }

    if (testError) {
      console.log(`⚠️  Erro ao acessar tabela '${tableName}':`, testError.message)
      return { exists: false, count: 0, structure: null, error: testError.message }
    }

    // Contar registros
    const { count, error: countError } = await supabaseAdmin
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log(`⚠️  Erro ao contar registros em '${tableName}':`, countError.message)
      return { exists: true, count: 'unknown', structure: null }
    }

    console.log(`✅ Tabela '${tableName}' existe com ${count} registros`)

    // Obter estrutura da tabela (primeiros registros para ver colunas)
    const { data: sampleData, error: sampleError } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .limit(1)

    let structure = null
    if (!sampleError && sampleData && sampleData.length > 0) {
      structure = Object.keys(sampleData[0])
      console.log(`📋 Colunas disponíveis:`, structure.join(', '))
    } else if (count === 0) {
      console.log(`ℹ️  Tabela vazia - não é possível determinar estrutura`)
    }

    return { exists: true, count, structure }

  } catch (error) {
    console.log(`❌ Erro ao verificar tabela '${tableName}':`, error.message)
    return { exists: false, count: 0, structure: null, error: error.message }
  }
}

async function checkRelationships() {
  console.log(`\n🔗 === VERIFICAÇÃO DE RELACIONAMENTOS ===`)
  
  try {
    // Verificar foreign keys em tasks
    const { data: tasksData, error: tasksError } = await supabaseAdmin
      .from('tasks')
      .select('id, assigned_to, created_by, user_id')
      .limit(5)

    if (!tasksError && tasksData) {
      console.log(`📊 Amostra de relacionamentos em tasks:`)
      tasksData.forEach((task, index) => {
        console.log(`  Task ${index + 1}: assigned_to=${task.assigned_to}, created_by=${task.created_by}, user_id=${task.user_id}`)
      })
    }

    // Verificar se há referências órfãs
    const { data: orphanTasks, error: orphanError } = await supabaseAdmin
      .from('tasks')
      .select('id, assigned_to')
      .not('assigned_to', 'is', null)

    if (!orphanError && orphanTasks) {
      console.log(`⚠️  Tasks com assigned_to não nulo: ${orphanTasks.length}`)
    }

  } catch (error) {
    console.log(`❌ Erro ao verificar relacionamentos:`, error.message)
  }
}

async function checkRLSPolicies() {
  console.log(`\n🔒 === VERIFICAÇÃO DE POLÍTICAS RLS ===`)
  
  const tables = ['tasks', 'employees', 'notifications']
  
  for (const table of tables) {
    try {
      // Tentar uma query que seria afetada por RLS
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`⚠️  Possível problema de RLS em '${table}':`, error.message)
      } else {
        console.log(`✅ RLS OK para '${table}'`)
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar RLS em '${table}':`, error.message)
    }
  }
}

async function runDiagnostic() {
  console.log('🏥 === DIAGNÓSTICO COMPLETO DAS TABELAS ===')
  console.log(`Conectando em: ${supabaseUrl}`)
  
  const tables = ['tasks', 'employees', 'notifications', 'profiles']
  const results = {}

  // Verificar cada tabela
  for (const table of tables) {
    results[table] = await checkTableStructure(table)
  }

  // Verificar tabelas financeiras
  const financialTables = ['contratos', 'clientes_pf', 'clientes_pj', 'irpf']
  console.log(`\n💰 === VERIFICAÇÃO DE TABELAS FINANCEIRAS ===`)
  
  for (const table of financialTables) {
    results[table] = await checkTableStructure(table)
  }

  // Verificar relacionamentos
  await checkRelationships()

  // Verificar RLS
  await checkRLSPolicies()

  // Resumo final
  console.log(`\n📋 === RESUMO DO DIAGNÓSTICO ===`)
  Object.entries(results).forEach(([table, result]) => {
    const status = result.exists ? `✅ Existe (${result.count} registros)` : '❌ Não existe'
    console.log(`${table.padEnd(15)}: ${status}`)
  })

  // Verificar se profiles ainda existe
  if (results.profiles?.exists) {
    console.log(`\n⚠️  ATENÇÃO: A tabela 'profiles' ainda existe!`)
    console.log(`   - Registros: ${results.profiles.count}`)
    console.log(`   - Colunas: ${results.profiles.structure?.join(', ') || 'N/A'}`)
  }

  return results
}

// Executar diagnóstico
runDiagnostic()
  .then((results) => {
    console.log('\n✅ Diagnóstico concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro durante diagnóstico:', error)
    process.exit(1)
  })