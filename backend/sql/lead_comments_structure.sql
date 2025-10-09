-- Criação da tabela lead_comments
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

-- Criação da tabela lead_comment_attachments
CREATE TABLE IF NOT EXISTS public.lead_comment_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES public.lead_comments(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_lead_comments_lead_id ON public.lead_comments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_comments_user_id ON public.lead_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_comments_created_at ON public.lead_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_comments_parent_id ON public.lead_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_lead_comment_attachments_comment_id ON public.lead_comment_attachments(comment_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lead_comments_updated_at 
    BEFORE UPDATE ON public.lead_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.lead_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_comment_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lead_comments
CREATE POLICY "Users can view lead comments" ON public.lead_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert lead comments" ON public.lead_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead comments" ON public.lead_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead comments" ON public.lead_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para lead_comment_attachments
CREATE POLICY "Users can view lead comment attachments" ON public.lead_comment_attachments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert lead comment attachments" ON public.lead_comment_attachments
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own lead comment attachments" ON public.lead_comment_attachments
    FOR DELETE USING (auth.uid() = uploaded_by);