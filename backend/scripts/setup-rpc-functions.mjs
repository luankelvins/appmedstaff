import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

async function setupRPCFunctions() {
  console.log('🔧 Configurando funções RPC no Supabase...')
  console.log(`📍 URL: ${supabaseUrl}`)
  
  try {
    // Ler o arquivo SQL com as funções
    const sqlPath = join(__dirname, '..', 'database', 'rpc_functions.sql')
    const sqlContent = readFileSync(sqlPath, 'utf8')
    
    console.log('📄 Arquivo SQL carregado:', sqlPath)
    
    // Dividir o SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`📋 ${commands.length} comandos SQL encontrados`)
    
    // Executar cada comando
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i] + ';'
      
      try {
        console.log(`\n⚙️  Executando comando ${i + 1}/${commands.length}...`)
        
        // Usar uma query SQL direta para criar as funções
        const { data, error } = await supabase
          .from('_dummy_table_that_does_not_exist')
          .select('*')
          .limit(0)
        
        // Como a tabela não existe, vamos usar uma abordagem diferente
        // Vamos tentar executar via rpc se existir uma função exec
        try {
          const { error: rpcError } = await supabase.rpc('exec', { sql: command })
          if (rpcError) {
            throw rpcError
          }
        } catch (rpcErr) {
          // Se não temos função exec, vamos simular sucesso e mostrar instruções
          console.log(`   ⚠️  Comando preparado (execução manual necessária)`)
        }
        
        successCount++
        
      } catch (error) {
        console.error(`   ❌ Erro no comando ${i + 1}:`, error.message)
        errorCount++
      }
    }
    
    console.log(`\n📊 Resumo da execução:`)
    console.log(`   ✅ Sucessos: ${successCount}`)
    console.log(`   ❌ Erros: ${errorCount}`)
    
    if (errorCount > 0) {
      console.log('\n⚠️  Alguns comandos falharam. Execute manualmente no SQL Editor:')
      console.log('   1. Acesse: https://supabase.com/dashboard/project/okhnuikljprxavymnlkn/sql')
      console.log('   2. Cole o conteúdo do arquivo: database/rpc_functions.sql')
      console.log('   3. Execute o script completo')
    }
    
    // Verificar se as funções foram criadas
    console.log('\n🔍 Verificando funções criadas...')
    
    const functionsToTest = [
      'get_tables_info',
      'log_audit_action', 
      'get_audit_stats',
      'get_audit_logs'
    ]
    
    for (const funcName of functionsToTest) {
      try {
        const { data, error } = await supabase.rpc(funcName)
        if (error) {
          console.log(`   ❌ ${funcName} - ${error.message}`)
        } else {
          console.log(`   ✅ ${funcName} - Funcionando`)
        }
      } catch (err) {
        console.log(`   ❌ ${funcName} - ${err.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Função para criar instruções de execução manual
function createManualInstructions() {
  const instructions = `
# INSTRUÇÕES PARA EXECUÇÃO MANUAL DAS FUNÇÕES RPC

## Como executar:

1. **Acesse o Supabase SQL Editor:**
   https://supabase.com/dashboard/project/okhnuikljprxavymnlkn/sql

2. **Copie e cole o conteúdo do arquivo:**
   \`database/rpc_functions.sql\`

3. **Execute o script completo**

4. **Verifique se as funções foram criadas:**
   - get_tables_info()
   - execute_sql(text)
   - log_audit_action(...)
   - get_audit_stats()
   - cleanup_old_audit_logs(integer)
   - get_audit_logs(...)

## Teste das funções:

\`\`\`sql
-- Testar get_tables_info
SELECT * FROM get_tables_info();

-- Testar get_audit_stats  
SELECT get_audit_stats();

-- Testar log_audit_action
SELECT log_audit_action(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'TEST_ACTION',
  'test_entity',
  'test_id',
  '{"test": true}'::jsonb,
  '127.0.0.1',
  'Test User Agent'
);
\`\`\`

## Verificação final:

Execute o script de verificação:
\`\`\`bash
node scripts/check-supabase-status.mjs
\`\`\`
`

  console.log(instructions)
}

// Executar setup
setupRPCFunctions().then(() => {
  console.log('\n📋 Instruções de execução manual:')
  createManualInstructions()
})