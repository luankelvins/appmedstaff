#!/usr/bin/env node

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

async function verifyTables() {
  try {
    console.log('🔍 Verificando se as tabelas de comentários foram criadas...')

    // Testar se conseguimos acessar a tabela lead_comments
    console.log('📋 Testando acesso à tabela lead_comments...')
    const { data: comments, error: commentsError } = await supabase
      .from('lead_comments')
      .select('id, content, created_at')
      .limit(5)

    if (commentsError) {
      console.error('❌ Erro ao acessar lead_comments:', commentsError.message)
      return false
    } else {
      console.log('✅ Tabela lead_comments acessível')
      console.log(`📊 Encontrados ${comments.length} comentários`)
      if (comments.length > 0) {
        console.log('📝 Exemplo de comentário:', comments[0])
      }
    }

    // Testar se conseguimos acessar a tabela lead_comment_attachments
    console.log('📎 Testando acesso à tabela lead_comment_attachments...')
    const { data: attachments, error: attachmentsError } = await supabase
      .from('lead_comment_attachments')
      .select('id, filename, upload_date')
      .limit(5)

    if (attachmentsError) {
      console.error('❌ Erro ao acessar lead_comment_attachments:', attachmentsError.message)
      return false
    } else {
      console.log('✅ Tabela lead_comment_attachments acessível')
      console.log(`📊 Encontrados ${attachments.length} anexos`)
    }

    // Testar inserção de um comentário de teste
    console.log('🧪 Testando inserção de comentário...')
    
    // Primeiro, vamos buscar um profile válido
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (profilesError || !profiles || profiles.length === 0) {
      console.warn('⚠️ Não foi possível encontrar um profile válido para teste')
      console.log('✅ Tabelas criadas com sucesso, mas não foi possível testar inserção')
      return true
    }

    const testComment = {
      lead_id: 'f11881d3-08a8-4d1e-b54e-1b556a852023',
      author_id: profiles[0].id,
      author_name: 'Teste Automático',
      author_role: 'Sistema',
      content: 'Comentário de teste para verificar se a tabela está funcionando corretamente.',
      is_private: false,
      priority: 'medium',
      comment_type: 'general'
    }

    const { data: newComment, error: insertError } = await supabase
      .from('lead_comments')
      .insert(testComment)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao inserir comentário de teste:', insertError.message)
      return false
    } else {
      console.log('✅ Comentário de teste inserido com sucesso')
      console.log('📝 ID do comentário:', newComment.id)

      // Limpar o comentário de teste
      const { error: deleteError } = await supabase
        .from('lead_comments')
        .delete()
        .eq('id', newComment.id)

      if (deleteError) {
        console.warn('⚠️ Não foi possível remover o comentário de teste:', deleteError.message)
      } else {
        console.log('🧹 Comentário de teste removido')
      }
    }

    console.log('🎉 Verificação concluída com sucesso!')
    console.log('✅ As tabelas de comentários estão funcionando corretamente')
    return true

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
    return false
  }
}

// Executar verificação
verifyTables().then(success => {
  process.exit(success ? 0 : 1)
})