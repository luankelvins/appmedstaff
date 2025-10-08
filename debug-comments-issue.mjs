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

async function debugCommentsIssue() {
  console.log('🔍 Debugando problema com comentários...')

  try {
    // 1. Verificar usuários existentes
    console.log('\n1️⃣ Verificando usuários no sistema...')
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.log('❌ Erro ao buscar usuários:', authError.message)
      return
    }

    console.log(`✅ ${authUsers.users.length} usuários encontrados no auth.users:`)
    authUsers.users.forEach(user => {
      console.log(`   - ${user.email} (${user.id})`)
    })

    if (authUsers.users.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado. Vamos criar um usuário de teste...')
      
      // Criar usuário de teste
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: 'teste@medstaff.com',
        password: 'teste123',
        email_confirm: true
      })

      if (createUserError) {
        console.log('❌ Erro ao criar usuário:', createUserError.message)
        return
      }

      console.log('✅ Usuário de teste criado:', newUser.user.id)
    }

    // 2. Verificar estrutura da tabela lead_comments
    console.log('\n2️⃣ Verificando estrutura da tabela lead_comments...')
    
    // Usar uma query SQL direta para verificar a estrutura
    const structureSQL = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'lead_comments' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `

    try {
      const { data: structure, error: structureError } = await supabase.rpc('exec_sql', { 
        sql: structureSQL 
      })
      
      if (structureError) {
        console.log('⚠️ Não foi possível verificar estrutura via RPC')
      } else {
        console.log('✅ Estrutura da tabela lead_comments:')
        console.table(structure)
      }
    } catch (error) {
      console.log('⚠️ RPC não disponível para verificar estrutura')
    }

    // 3. Verificar constraints
    console.log('\n3️⃣ Verificando constraints da tabela...')
    
    const constraintsSQL = `
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_name = 'lead_comments'
      AND tc.table_schema = 'public';
    `

    try {
      const { data: constraints, error: constraintsError } = await supabase.rpc('exec_sql', { 
        sql: constraintsSQL 
      })
      
      if (constraintsError) {
        console.log('⚠️ Não foi possível verificar constraints via RPC')
      } else {
        console.log('✅ Constraints da tabela lead_comments:')
        console.table(constraints)
      }
    } catch (error) {
      console.log('⚠️ RPC não disponível para verificar constraints')
    }

    // 4. Tentar inserir comentário com usuário real
    console.log('\n4️⃣ Tentando inserir comentário com usuário real...')
    
    const realUserId = authUsers.users[0]?.id
    if (!realUserId) {
      console.log('❌ Nenhum usuário disponível para teste')
      return
    }

    // Buscar lead
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id')
      .limit(1)

    if (leadsError || !leads.length) {
      console.log('❌ Nenhum lead disponível para teste')
      return
    }

    const testComment = {
      lead_id: leads[0].id,
      author_id: realUserId,
      author_name: 'Usuário Real',
      author_role: 'Teste',
      content: 'Comentário de debug',
      comment_type: 'general',
      priority: 'medium',
      is_private: false
    }

    console.log('📝 Dados do comentário a ser inserido:')
    console.log(JSON.stringify(testComment, null, 2))

    const { data: newComment, error: insertError } = await supabase
      .from('lead_comments')
      .insert(testComment)
      .select()
      .single()

    if (insertError) {
      console.log('❌ Erro ao inserir comentário:', insertError.message)
      console.log('📋 Detalhes do erro:', insertError)
      
      // Verificar se o usuário existe na tabela auth.users
      console.log('\n🔍 Verificando se o usuário existe em auth.users...')
      const checkUserSQL = `SELECT id FROM auth.users WHERE id = '${realUserId}';`
      
      try {
        const { data: userCheck, error: userCheckError } = await supabase.rpc('exec_sql', { 
          sql: checkUserSQL 
        })
        
        if (userCheckError) {
          console.log('⚠️ Não foi possível verificar usuário via RPC')
        } else {
          console.log('✅ Resultado da verificação do usuário:')
          console.log(userCheck)
        }
      } catch (error) {
        console.log('⚠️ RPC não disponível para verificar usuário')
      }
      
      return
    }

    console.log('✅ Comentário inserido com sucesso!')
    console.log('📝 ID do comentário:', newComment.id)

    // Limpar comentário de teste
    await supabase
      .from('lead_comments')
      .delete()
      .eq('id', newComment.id)

    console.log('✅ Comentário de teste removido')

  } catch (error) {
    console.error('❌ Erro durante debug:', error)
  }
}

// Executar
debugCommentsIssue()
  .then(() => {
    console.log('\n🎉 Debug concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro no debug:', error)
    process.exit(1)
  })