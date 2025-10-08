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

async function createLeadCommentsTables() {
  try {
    console.log('🚀 Criando tabelas lead_comments...')

    // Criar tabela lead_comments
    console.log('📝 Criando tabela lead_comments...')
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.lead_comments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          lead_id UUID NOT NULL,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          comment_type VARCHAR(50) DEFAULT 'general' CHECK (comment_type IN ('general', 'follow_up', 'qualification', 'objection', 'proposal', 'negotiation', 'closing')),
          priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          is_private BOOLEAN DEFAULT false,
          parent_comment_id UUID REFERENCES public.lead_comments(id) ON DELETE CASCADE,
          pipeline_stage VARCHAR(100),
          tags TEXT[],
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (createTableError) {
      console.error('❌ Erro ao criar tabela lead_comments:', createTableError)
    } else {
      console.log('✅ Tabela lead_comments criada com sucesso')
    }

    // Verificar se a tabela foi criada testando uma consulta simples
    console.log('🔍 Verificando se a tabela foi criada...')
    const { data, error } = await supabase
      .from('lead_comments')
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ Erro ao verificar tabela:', error.message)
      
      // Tentar criar a tabela usando uma abordagem alternativa
      console.log('🔄 Tentando abordagem alternativa...')
      
      // Usar o SQL Editor do Supabase ou criar manualmente
      console.log(`
📋 Execute o seguinte SQL no Supabase Dashboard:

CREATE TABLE IF NOT EXISTS public.lead_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  comment_type VARCHAR(50) DEFAULT 'general' CHECK (comment_type IN ('general', 'follow_up', 'qualification', 'objection', 'proposal', 'negotiation', 'closing')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_private BOOLEAN DEFAULT false,
  parent_comment_id UUID REFERENCES public.lead_comments(id) ON DELETE CASCADE,
  pipeline_stage VARCHAR(100),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_lead_comments_lead_id ON public.lead_comments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_comments_user_id ON public.lead_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_comments_created_at ON public.lead_comments(created_at);

-- RLS
ALTER TABLE public.lead_comments ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view lead comments" ON public.lead_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert lead comments" ON public.lead_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lead comments" ON public.lead_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lead comments" ON public.lead_comments FOR DELETE USING (auth.uid() = user_id);
      `)
      
    } else {
      console.log('✅ Tabela lead_comments está funcionando corretamente')
    }

  } catch (error) {
    console.error('❌ Erro durante a criação:', error)
  }
}

// Executar o script
createLeadCommentsTables()