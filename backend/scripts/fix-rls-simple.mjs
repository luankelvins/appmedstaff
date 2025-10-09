import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente necessárias não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLS() {
  console.log('🔧 Tentando corrigir RLS da tabela tasks...')

  try {
    // Primeiro, vamos tentar inserir um task diretamente usando service role
    console.log('📝 Testando inserção com service role...')
    
    const testTask = {
      title: 'Teste RLS',
      description: 'Task de teste para verificar RLS',
      status: 'todo',
      priority: 'medium',
      created_by: '00000000-0000-0000-0000-000000000000', // UUID válido
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: insertData, error: insertError } = await supabase
      .from('tasks')
      .insert(testTask)
      .select()

    if (insertError) {
      console.error('❌ Erro ao inserir com service role:', insertError)
      
      // Se ainda falhar, vamos tentar desabilitar RLS completamente
      console.log('📝 Tentando desabilitar RLS...')
      
      // Usar uma query SQL direta
      const { data: sqlData, error: sqlError } = await supabase
        .from('tasks')
        .select('*')
        .limit(0) // Não queremos dados, só testar a conexão
      
      if (sqlError) {
        console.error('❌ Erro na query SQL:', sqlError)
      }
      
    } else {
      console.log('✅ Task inserida com sucesso:', insertData)
      
      // Limpar o task de teste
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('title', 'Teste RLS')
      
      if (deleteError) {
        console.log('⚠️ Erro ao limpar task de teste:', deleteError)
      } else {
        console.log('✅ Task de teste removida')
      }
    }

    // Testar se conseguimos listar tasks
    const { data: listData, error: listError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })

    if (listError) {
      console.error('❌ Erro ao listar tasks:', listError)
    } else {
      console.log('✅ Conseguimos acessar a tabela tasks')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar
fixRLS()