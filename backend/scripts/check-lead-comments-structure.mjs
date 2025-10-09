#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkLeadCommentsStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela lead_comments...')

    // Tentar fazer uma consulta simples para ver quais colunas existem
    const { data, error } = await supabase
      .from('lead_comments')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Erro ao consultar lead_comments:', error)
      return
    }

    console.log('✅ Tabela lead_comments existe e é acessível')
    
    if (data && data.length > 0) {
      console.log('📋 Estrutura encontrada (baseada em dados existentes):')
      console.log('Colunas:', Object.keys(data[0]))
      console.log('Exemplo de dados:', data[0])
    } else {
      console.log('📋 Tabela está vazia, tentando inserir um comentário de teste...')
      
      // Buscar um usuário válido
      const { data: users } = await supabase.auth.admin.listUsers()
      
      if (!users || users.users.length === 0) {
        console.log('❌ Nenhum usuário encontrado para teste')
        return
      }

      const testUserId = users.users[0].id
      console.log('👤 Usando usuário para teste:', testUserId)

      // Tentar inserir um comentário de teste
      const testComment = {
        lead_id: 'f11881d3-08a8-4d1e-b54e-1b556a852023', // ID fictício
        user_id: testUserId,
        content: 'Comentário de teste para verificar estrutura',
        comment_type: 'general',
        priority: 'medium',
        is_private: false
      }

      const { data: insertData, error: insertError } = await supabase
        .from('lead_comments')
        .insert(testComment)
        .select()

      if (insertError) {
        console.error('❌ Erro ao inserir comentário de teste:', insertError)
        console.log('💡 Isso pode indicar que a coluna "metadata" está faltando ou há outro problema de estrutura')
      } else {
        console.log('✅ Comentário de teste inserido com sucesso')
        console.log('📋 Estrutura confirmada:', Object.keys(insertData[0]))
        
        // Limpar o comentário de teste
        await supabase
          .from('lead_comments')
          .delete()
          .eq('id', insertData[0].id)
        
        console.log('🧹 Comentário de teste removido')
      }
    }

    // Tentar uma operação de update para verificar se a coluna metadata existe
    console.log('🔍 Testando se a coluna metadata existe...')
    const { error: updateError } = await supabase
      .from('lead_comments')
      .update({ metadata: { test: true } })
      .eq('id', 'non-existent-id') // ID que não existe, só para testar a estrutura

    if (updateError) {
      if (updateError.message.includes('metadata')) {
        console.log('❌ Coluna metadata não existe ou há problema com ela')
        console.log('Erro:', updateError.message)
      } else {
        console.log('✅ Coluna metadata parece existir (erro esperado para ID inexistente)')
      }
    }

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
  }
}

// Executar o script
checkLeadCommentsStructure()