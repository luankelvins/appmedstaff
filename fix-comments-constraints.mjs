import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixConstraints() {
  console.log('🔧 Corrigindo constraints da tabela lead_comments...')

  // SQL para corrigir as constraints
  const fixConstraintsSQL = `
    -- Remover constraint problemática se existir
    DO $$ 
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_lead_comments_author_id'
        ) THEN
            ALTER TABLE public.lead_comments DROP CONSTRAINT fk_lead_comments_author_id;
            RAISE NOTICE 'Constraint fk_lead_comments_author_id removida';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover constraint: %', SQLERRM;
    END $$;

    -- Adicionar constraint correta para author_id referenciando auth.users
    DO $$
    BEGIN
        ALTER TABLE public.lead_comments 
        ADD CONSTRAINT fk_lead_comments_author_id 
        FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Nova constraint fk_lead_comments_author_id adicionada';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Constraint já existe';
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao adicionar constraint: %', SQLERRM;
    END $$;

    -- Verificar se a constraint de lead_id está correta
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_lead_comments_lead_id'
        ) THEN
            ALTER TABLE public.lead_comments 
            ADD CONSTRAINT fk_lead_comments_lead_id 
            FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;
            RAISE NOTICE 'Constraint fk_lead_comments_lead_id adicionada';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao adicionar constraint de lead_id: %', SQLERRM;
    END $$;
  `

  console.log('📋 SQL a ser executado:')
  console.log(fixConstraintsSQL)

  // Tentar executar via RPC
  try {
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql: fixConstraintsSQL })
    
    if (rpcError) {
      console.log('⚠️ RPC exec_sql não disponível:', rpcError.message)
      console.log('📝 Execute o SQL manualmente no Supabase Dashboard:')
      console.log('---')
      console.log(fixConstraintsSQL)
      console.log('---')
    } else {
      console.log('✅ Constraints corrigidas com sucesso via RPC!')
    }
  } catch (error) {
    console.log('⚠️ Erro ao executar via RPC:', error.message)
    console.log('📝 Execute o SQL manualmente no Supabase Dashboard:')
    console.log('---')
    console.log(fixConstraintsSQL)
    console.log('---')
  }

  // Testar se agora conseguimos criar um comentário
  console.log('\n🧪 Testando criação de comentário após correção...')
  
  try {
    // Buscar um usuário real do sistema
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError || !users.users.length) {
      console.log('⚠️ Nenhum usuário encontrado para teste')
      return
    }

    const testUserId = users.users[0].id
    console.log(`📝 Usando usuário para teste: ${testUserId}`)

    // Buscar um lead para teste
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id')
      .limit(1)

    if (leadsError || !leads.length) {
      console.log('⚠️ Nenhum lead encontrado para teste')
      return
    }

    const testLeadId = leads[0].id

    // Tentar criar comentário
    const testComment = {
      lead_id: testLeadId,
      author_id: testUserId,
      author_name: 'Usuário Teste',
      author_role: 'Desenvolvedor',
      content: 'Comentário de teste após correção de constraints',
      comment_type: 'general',
      priority: 'medium',
      is_private: false
    }

    const { data: newComment, error: createError } = await supabase
      .from('lead_comments')
      .insert(testComment)
      .select()
      .single()

    if (createError) {
      console.log('❌ Ainda há erro ao criar comentário:', createError.message)
      return
    }

    console.log('✅ Comentário criado com sucesso após correção!')
    
    // Limpar o comentário de teste
    await supabase
      .from('lead_comments')
      .delete()
      .eq('id', newComment.id)

    console.log('✅ Comentário de teste removido')

  } catch (error) {
    console.log('❌ Erro durante teste:', error.message)
  }
}

// Executar
fixConstraints()
  .then(() => {
    console.log('\n🎉 Script concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error)
    process.exit(1)
  })