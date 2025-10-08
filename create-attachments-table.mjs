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

async function createAttachmentsTable() {
  console.log('🔧 Criando tabela lead_comment_attachments...')

  try {
    // Verificar se a tabela já existe
    const { data: existingTable } = await supabase
      .from('lead_comment_attachments')
      .select('id')
      .limit(1)

    if (existingTable) {
      console.log('✅ Tabela lead_comment_attachments já existe')
      return
    }
  } catch (error) {
    // Tabela não existe, vamos criá-la
    console.log('📝 Tabela não existe, criando...')
  }

  // SQL para criar a tabela
  const createTableSQL = `
    -- Criar tabela lead_comment_attachments
    CREATE TABLE IF NOT EXISTS public.lead_comment_attachments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      comment_id UUID NOT NULL REFERENCES public.lead_comments(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_url TEXT NOT NULL,
      uploaded_by UUID NOT NULL REFERENCES auth.users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_lead_comment_attachments_comment_id 
    ON public.lead_comment_attachments(comment_id);

    CREATE INDEX IF NOT EXISTS idx_lead_comment_attachments_uploaded_by 
    ON public.lead_comment_attachments(uploaded_by);

    -- Habilitar RLS
    ALTER TABLE public.lead_comment_attachments ENABLE ROW LEVEL SECURITY;

    -- Políticas RLS
    CREATE POLICY "Usuários podem ver anexos de comentários que podem ver" 
    ON public.lead_comment_attachments FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM public.lead_comments lc 
        WHERE lc.id = comment_id 
        AND (
          lc.is_private = false 
          OR lc.author_id = auth.uid()
        )
      )
    );

    CREATE POLICY "Usuários podem inserir anexos em seus comentários" 
    ON public.lead_comment_attachments FOR INSERT 
    WITH CHECK (
      uploaded_by = auth.uid() 
      AND EXISTS (
        SELECT 1 FROM public.lead_comments lc 
        WHERE lc.id = comment_id 
        AND lc.author_id = auth.uid()
      )
    );

    CREATE POLICY "Usuários podem deletar seus próprios anexos" 
    ON public.lead_comment_attachments FOR DELETE 
    USING (uploaded_by = auth.uid());
  `

  console.log('📋 SQL a ser executado:')
  console.log(createTableSQL)

  // Tentar executar via RPC (se disponível)
  try {
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (rpcError) {
      console.log('⚠️ RPC exec_sql não disponível:', rpcError.message)
      console.log('📝 Execute o SQL manualmente no Supabase Dashboard:')
      console.log('---')
      console.log(createTableSQL)
      console.log('---')
    } else {
      console.log('✅ Tabela lead_comment_attachments criada com sucesso via RPC!')
    }
  } catch (error) {
    console.log('⚠️ Erro ao executar via RPC:', error.message)
    console.log('📝 Execute o SQL manualmente no Supabase Dashboard:')
    console.log('---')
    console.log(createTableSQL)
    console.log('---')
  }

  // Verificar se a tabela foi criada
  try {
    const { data, error } = await supabase
      .from('lead_comment_attachments')
      .select('id')
      .limit(1)

    if (error) {
      console.log('❌ Erro ao verificar tabela:', error.message)
      console.log('📝 Execute o SQL manualmente no Supabase Dashboard')
    } else {
      console.log('✅ Tabela lead_comment_attachments está funcionando!')
    }
  } catch (error) {
    console.log('❌ Erro na verificação:', error.message)
  }
}

// Executar
createAttachmentsTable()
  .then(() => {
    console.log('🎉 Script concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error)
    process.exit(1)
  })