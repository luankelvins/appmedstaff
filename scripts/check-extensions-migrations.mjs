import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente necessárias:')
  console.error('   - VITE_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkExtensions() {
  console.log('🔌 Verificando extensões instaladas...')
  
  try {
    // Query para listar extensões instaladas
    const { data, error } = await supabase
      .from('pg_extension')
      .select('extname, extversion')
      .order('extname')
    
    if (error) {
      console.log('   ⚠️  Não foi possível acessar pg_extension diretamente')
      console.log('   💡 Tentando método alternativo...')
      
      // Tentar via query SQL direta se tivermos função execute_sql
      try {
        const { data: sqlData, error: sqlError } = await supabase.rpc('execute_sql', {
          query: 'SELECT extname, extversion FROM pg_extension ORDER BY extname'
        })
        
        if (sqlError) throw sqlError
        
        console.log('   ✅ Extensões encontradas via RPC:')
        sqlData.forEach(ext => {
          console.log(`      - ${ext.extname} (v${ext.extversion})`)
        })
        
      } catch (rpcError) {
        console.log('   ⚠️  RPC execute_sql não disponível')
        console.log('   📋 Extensões esperadas para Supabase:')
        console.log('      - pg_stat_statements')
        console.log('      - pgcrypto')
        console.log('      - pgjwt')
        console.log('      - uuid-ossp')
        console.log('      - plpgsql')
      }
      
    } else {
      console.log('   ✅ Extensões instaladas:')
      data.forEach(ext => {
        console.log(`      - ${ext.extname} (v${ext.extversion})`)
      })
    }
    
  } catch (error) {
    console.error('   ❌ Erro ao verificar extensões:', error.message)
  }
}

async function checkMigrations() {
  console.log('\n📋 Verificando migrações aplicadas...')
  
  try {
    // Verificar se existe tabela de migrações do Supabase
    const { data: migrationTables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'supabase_migrations')
    
    if (tableError) {
      console.log('   ⚠️  Schema supabase_migrations não encontrado')
    } else if (migrationTables && migrationTables.length > 0) {
      console.log('   ✅ Schema de migrações encontrado')
      
      // Tentar listar migrações
      try {
        const { data: migrations, error: migError } = await supabase
          .from('supabase_migrations.schema_migrations')
          .select('*')
          .order('version')
        
        if (migError) {
          console.log('   ⚠️  Não foi possível acessar schema_migrations:', migError.message)
        } else {
          console.log(`   📊 ${migrations.length} migrações encontradas`)
          migrations.slice(-5).forEach(mig => {
            console.log(`      - ${mig.version} (${mig.inserted_at || 'sem data'})`)
          })
        }
        
      } catch (migErr) {
        console.log('   ⚠️  Erro ao listar migrações:', migErr.message)
      }
    }
    
    // Verificar tabelas do sistema Supabase
    console.log('\n🔍 Verificando tabelas do sistema...')
    
    const systemTables = [
      'auth.users',
      'auth.sessions', 
      'storage.buckets',
      'storage.objects'
    ]
    
    for (const table of systemTables) {
      try {
        const [schema, tableName] = table.split('.')
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', schema)
          .eq('table_name', tableName)
          .single()
        
        if (error || !data) {
          console.log(`   ❌ ${table} - Não encontrada`)
        } else {
          console.log(`   ✅ ${table} - Presente`)
        }
        
      } catch (err) {
        console.log(`   ❌ ${table} - Erro: ${err.message}`)
      }
    }
    
  } catch (error) {
    console.error('   ❌ Erro ao verificar migrações:', error.message)
  }
}

async function checkDatabaseHealth() {
  console.log('\n🏥 Verificando saúde geral do banco...')
  
  try {
    // Verificar conexão básica
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('count')
      .eq('table_schema', 'public')
    
    if (error) {
      console.log('   ❌ Problema de conexão:', error.message)
    } else {
      console.log('   ✅ Conexão com banco funcionando')
    }
    
    // Verificar se RLS está habilitado nas tabelas principais
    const mainTables = ['profiles', 'employees', 'audit_logs']
    
    console.log('\n🔒 Verificando Row Level Security (RLS):')
    
    for (const table of mainTables) {
      try {
        const { data: rlsData, error: rlsError } = await supabase
          .from('pg_tables')
          .select('rowsecurity')
          .eq('schemaname', 'public')
          .eq('tablename', table)
          .single()
        
        if (rlsError || !rlsData) {
          console.log(`   ⚠️  ${table} - Não foi possível verificar RLS`)
        } else {
          const status = rlsData.rowsecurity ? '✅ Habilitado' : '⚠️  Desabilitado'
          console.log(`   ${status} - ${table}`)
        }
        
      } catch (err) {
        console.log(`   ❌ ${table} - Erro: ${err.message}`)
      }
    }
    
  } catch (error) {
    console.error('   ❌ Erro na verificação de saúde:', error.message)
  }
}

async function main() {
  console.log('🔍 VERIFICAÇÃO COMPLETA DO SUPABASE')
  console.log('=====================================')
  console.log(`📍 URL: ${supabaseUrl}`)
  console.log(`🔑 Usando chave: ${supabaseServiceKey.substring(0, 20)}...`)
  
  await checkExtensions()
  await checkMigrations()
  await checkDatabaseHealth()
  
  console.log('\n✅ Verificação concluída!')
  console.log('\n📋 Próximos passos recomendados:')
  console.log('   1. Execute as funções RPC manualmente no SQL Editor')
  console.log('   2. Verifique se todas as políticas RLS estão configuradas')
  console.log('   3. Teste as funcionalidades da aplicação')
}

main().catch(console.error)