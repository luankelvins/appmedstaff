-- =====================================================
-- EXECUTE ESTE SCRIPT AGORA NO SUPABASE SQL EDITOR
-- Link: https://supabase.com/dashboard/project/okhnuikljprxavymnlkn/sql
-- =====================================================

-- DESABILITAR RLS nas tabelas de chat
ALTER TABLE chat_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_direct_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_typing_indicators DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS foi desabilitado (deve retornar false para todas)
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename LIKE 'chat_%' 
AND schemaname = 'public'
ORDER BY tablename;

-- Se aparecer "false" para todas as tabelas, está correto! ✅


