-- =====================================================
-- CORREÇÃO DAS RLS POLICIES DO CHAT
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Remover todas as políticas existentes que causam recursão
DROP POLICY IF EXISTS "Users can view channel members if they are members" ON chat_channel_members;
DROP POLICY IF EXISTS "Channel owners can add members" ON chat_channel_members;
DROP POLICY IF EXISTS "Users can view public channels" ON chat_channels;
DROP POLICY IF EXISTS "Users can create channels" ON chat_channels;
DROP POLICY IF EXISTS "Channel creators can update their channels" ON chat_channels;

-- 2. Recriar políticas SEM recursão

-- Política para chat_channels - SIMPLES, sem subquery recursiva
CREATE POLICY "Allow authenticated users to view channels" ON chat_channels
FOR SELECT USING (
  type = 'public' OR 
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM chat_channel_members 
    WHERE chat_channel_members.channel_id = chat_channels.id 
    AND chat_channel_members.user_id = auth.uid()
  )
);

CREATE POLICY "Allow authenticated users to create channels" ON chat_channels
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow channel creators to update" ON chat_channels
FOR UPDATE USING (auth.uid() = created_by);

-- Política para chat_channel_members - SIMPLES
CREATE POLICY "Allow users to view channel members" ON chat_channel_members
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM chat_channels 
    WHERE chat_channels.id = chat_channel_members.channel_id 
    AND (chat_channels.type = 'public' OR chat_channels.created_by = auth.uid())
  )
);

CREATE POLICY "Allow channel creators to add members" ON chat_channel_members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_channels 
    WHERE chat_channels.id = channel_id 
    AND chat_channels.created_by = auth.uid()
  )
);

CREATE POLICY "Allow users to remove themselves from channels" ON chat_channel_members
FOR DELETE USING (user_id = auth.uid());

-- 3. Verificar se as políticas foram criadas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd 
FROM pg_policies 
WHERE tablename IN ('chat_channels', 'chat_channel_members')
ORDER BY tablename, policyname;


