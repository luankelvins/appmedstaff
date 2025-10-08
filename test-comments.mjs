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

async function testComments() {
  console.log('🧪 Testando funcionalidade de comentários...')

  try {
    // 1. Verificar estrutura da tabela lead_comments
    console.log('\n1️⃣ Verificando estrutura da tabela lead_comments...')
    
    const { data: comments, error: commentsError } = await supabase
      .from('lead_comments')
      .select('*')
      .limit(1)

    if (commentsError) {
      console.log('❌ Erro ao acessar lead_comments:', commentsError.message)
      return
    }

    console.log('✅ Tabela lead_comments acessível')

    // 2. Verificar se existe algum lead para testar
    console.log('\n2️⃣ Verificando leads disponíveis...')
    
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, name')
      .limit(5)

    if (leadsError) {
      console.log('❌ Erro ao buscar leads:', leadsError.message)
      return
    }

    if (!leads || leads.length === 0) {
      console.log('⚠️ Nenhum lead encontrado para testar')
      return
    }

    console.log(`✅ ${leads.length} leads encontrados:`)
    leads.forEach(lead => console.log(`   - ${lead.name} (${lead.id})`))

    const testLeadId = leads[0].id

    // 3. Testar criação de comentário
    console.log('\n3️⃣ Testando criação de comentário...')
    
    const testComment = {
      lead_id: testLeadId,
      author_id: '00000000-0000-0000-0000-000000000000', // UUID de teste
      author_name: 'Teste Usuário',
      author_role: 'Desenvolvedor',
      content: 'Este é um comentário de teste criado automaticamente',
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
      console.log('❌ Erro ao criar comentário:', createError.message)
      return
    }

    console.log('✅ Comentário criado com sucesso:', newComment.id)

    // 4. Testar busca de comentários
    console.log('\n4️⃣ Testando busca de comentários...')
    
    const { data: foundComments, error: searchError } = await supabase
      .from('lead_comments')
      .select('*')
      .eq('lead_id', testLeadId)

    if (searchError) {
      console.log('❌ Erro ao buscar comentários:', searchError.message)
      return
    }

    console.log(`✅ ${foundComments.length} comentários encontrados para o lead`)

    // 5. Testar atualização de comentário
    console.log('\n5️⃣ Testando atualização de comentário...')
    
    const { data: updatedComment, error: updateError } = await supabase
      .from('lead_comments')
      .update({ 
        content: 'Comentário atualizado via teste automatizado',
        updated_at: new Date().toISOString()
      })
      .eq('id', newComment.id)
      .select()
      .single()

    if (updateError) {
      console.log('❌ Erro ao atualizar comentário:', updateError.message)
      return
    }

    console.log('✅ Comentário atualizado com sucesso')

    // 6. Testar exclusão de comentário
    console.log('\n6️⃣ Testando exclusão de comentário...')
    
    const { error: deleteError } = await supabase
      .from('lead_comments')
      .delete()
      .eq('id', newComment.id)

    if (deleteError) {
      console.log('❌ Erro ao deletar comentário:', deleteError.message)
      return
    }

    console.log('✅ Comentário deletado com sucesso')

    // 7. Verificar tabela de anexos
    console.log('\n7️⃣ Verificando tabela lead_comment_attachments...')
    
    const { data: attachments, error: attachmentsError } = await supabase
      .from('lead_comment_attachments')
      .select('*')
      .limit(1)

    if (attachmentsError) {
      console.log('❌ Erro ao acessar lead_comment_attachments:', attachmentsError.message)
      return
    }

    console.log('✅ Tabela lead_comment_attachments acessível')

    console.log('\n🎉 Todos os testes passaram! A funcionalidade de comentários está funcionando corretamente.')

  } catch (error) {
    console.error('❌ Erro durante os testes:', error)
  }
}

// Executar testes
testComments()
  .then(() => {
    console.log('\n✅ Testes concluídos!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro nos testes:', error)
    process.exit(1)
  })