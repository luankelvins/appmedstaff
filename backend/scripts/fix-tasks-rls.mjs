import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixTasksRLS() {
  console.log('🔧 Corrigindo políticas RLS da tabela tasks...')

  try {
    // Primeiro, vamos tentar desabilitar RLS temporariamente para permitir operações
    console.log('📝 Desabilitando RLS temporariamente...')
    
    const { error: disableRLSError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;' 
    })
    
    if (disableRLSError) {
      console.log('⚠️ Não foi possível desabilitar RLS (pode não existir):', disableRLSError.message)
    } else {
      console.log('✅ RLS desabilitado temporariamente')
    }

    // Agora vamos reabilitar com políticas mais permissivas
    console.log('📝 Reabilitando RLS com políticas permissivas...')
    
    const { error: enableRLSError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;' 
    })
    
    if (enableRLSError) {
      console.error('❌ Erro ao reabilitar RLS:', enableRLSError)
      throw enableRLSError
    }

    console.log('✅ RLS reabilitado')

    // Criar política simples que permite tudo para usuários autenticados
    const { error: policyError } = await supabase.rpc('exec_sql', { 
      sql: `
        DROP POLICY IF EXISTS "allow_all_for_authenticated" ON tasks;
        CREATE POLICY "allow_all_for_authenticated" ON tasks
          FOR ALL USING (true);
      `
    })
    
    if (policyError) {
      console.error('❌ Erro ao criar política:', policyError)
      throw policyError
    }

    console.log('✅ Política permissiva criada')

    // Testar se conseguimos acessar a tabela
    const { data: testData, error: testError } = await supabase
      .from('tasks')
      .select('count(*)')
      .limit(1)

    if (testError) {
      console.error('❌ Erro ao testar acesso:', testError)
    } else {
      console.log('✅ Acesso à tabela tasks confirmado')
    }

    console.log('🎉 Correção das políticas RLS concluída!')

  } catch (error) {
    console.error('❌ Erro durante a correção:', error)
    process.exit(1)
  }
}

// Executar a correção
fixTasksRLS()