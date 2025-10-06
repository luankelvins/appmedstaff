-- =====================================================
-- SOLUÇÃO DEFINITIVA - DESABILITAR RLS TEMPORARIAMENTE
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. DESABILITAR RLS completamente nas tabelas de chat
ALTER TABLE chat_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_direct_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_typing_indicators DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users to view channels" ON chat_channels;
DROP POLICY IF EXISTS "Allow authenticated users to create channels" ON chat_channels;
DROP POLICY IF EXISTS "Allow channel creators to update" ON chat_channels;
DROP POLICY IF EXISTS "Users can view public channels" ON chat_channels;
DROP POLICY IF EXISTS "Users can create channels" ON chat_channels;
DROP POLICY IF EXISTS "Channel creators can update their channels" ON chat_channels;

DROP POLICY IF EXISTS "Allow users to view channel members" ON chat_channel_members;
DROP POLICY IF EXISTS "Allow channel creators to add members" ON chat_channel_members;
DROP POLICY IF EXISTS "Allow users to remove themselves from channels" ON chat_channel_members;
DROP POLICY IF EXISTS "Users can view channel members if they are members" ON chat_channel_members;
DROP POLICY IF EXISTS "Channel owners can add members" ON chat_channel_members;
DROP POLICY IF EXISTS "Users can leave channels" ON chat_channel_members;

DROP POLICY IF EXISTS "Users can view messages in their channels" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their channels" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;

DROP POLICY IF EXISTS "Users can view their direct conversations" ON chat_direct_conversations;
DROP POLICY IF EXISTS "Users can create direct conversations" ON chat_direct_conversations;

DROP POLICY IF EXISTS "Users can view typing indicators in their channels" ON chat_typing_indicators;
DROP POLICY IF EXISTS "Users can create typing indicators" ON chat_typing_indicators;
DROP POLICY IF EXISTS "Users can delete their own typing indicators" ON chat_typing_indicators;

-- 3. Verificar que RLS está desabilitado
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'chat_%' 
AND schemaname = 'public';

-- Se rowsecurity = false, está correto ✅

COMMIT;

-- =====================================================
-- NOTA IMPORTANTE:
-- Com RLS desabilitado, TODOS os usuários autenticados
-- terão acesso a TODOS os canais e mensagens.
-- 
-- Isso é TEMPORÁRIO para desenvolvimento.
-- Em produção, implemente RLS corretamente usando
-- service role key ou políticas mais simples.
-- =====================================================

