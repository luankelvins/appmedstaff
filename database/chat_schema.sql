-- =====================================================
-- SCHEMA DE CHAT INTERNO
-- =====================================================

-- Tabela de canais de chat
CREATE TABLE IF NOT EXISTS chat_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'public', -- 'public', 'private', 'direct'
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Tabela de membros dos canais
CREATE TABLE IF NOT EXISTS chat_channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'owner', 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text', -- 'text', 'file', 'image', 'system'
  metadata JSONB, -- Para anexos, menções, etc
  reply_to UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conversas diretas
CREATE TABLE IF NOT EXISTS chat_direct_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Tabela de indicadores de digitação
CREATE TABLE IF NOT EXISTS chat_typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_channels_type ON chat_channels(type);
CREATE INDEX IF NOT EXISTS idx_chat_channels_created_by ON chat_channels(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_channel_members_channel ON chat_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_channel_members_user ON chat_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_direct_conv_users ON chat_direct_conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_chat_typing_channel ON chat_typing_indicators(channel_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_channels_updated_at
BEFORE UPDATE ON chat_channels
FOR EACH ROW EXECUTE FUNCTION update_chat_updated_at();

CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON chat_messages
FOR EACH ROW EXECUTE FUNCTION update_chat_updated_at();

-- RLS Policies
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_direct_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_typing_indicators ENABLE ROW LEVEL SECURITY;

-- Políticas para canais
CREATE POLICY "Users can view public channels" ON chat_channels
FOR SELECT USING (type = 'public' OR id IN (
  SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create channels" ON chat_channels
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Channel creators can update their channels" ON chat_channels
FOR UPDATE USING (auth.uid() = created_by);

-- Políticas para membros
CREATE POLICY "Users can view channel members if they are members" ON chat_channel_members
FOR SELECT USING (
  channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
);

CREATE POLICY "Channel owners can add members" ON chat_channel_members
FOR INSERT WITH CHECK (
  channel_id IN (
    SELECT id FROM chat_channels WHERE created_by = auth.uid()
  )
);

-- Políticas para mensagens
CREATE POLICY "Users can view messages in their channels" ON chat_messages
FOR SELECT USING (
  channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can send messages to their channels" ON chat_messages
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own messages" ON chat_messages
FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para conversas diretas
CREATE POLICY "Users can view their direct conversations" ON chat_direct_conversations
FOR SELECT USING (auth.uid() IN (user1_id, user2_id));

CREATE POLICY "Users can create direct conversations" ON chat_direct_conversations
FOR INSERT WITH CHECK (auth.uid() IN (user1_id, user2_id));

-- Políticas para indicadores de digitação
CREATE POLICY "Users can view typing indicators in their channels" ON chat_typing_indicators
FOR SELECT USING (
  channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can set their own typing indicators" ON chat_typing_indicators
FOR ALL USING (auth.uid() = user_id);

-- Função para limpar indicadores de digitação antigos
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_typing_indicators
  WHERE started_at < NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter mensagens não lidas
CREATE OR REPLACE FUNCTION get_unread_messages_count(p_user_id UUID, p_channel_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_last_read TIMESTAMP WITH TIME ZONE;
  v_count INTEGER;
BEGIN
  SELECT last_read_at INTO v_last_read
  FROM chat_channel_members
  WHERE user_id = p_user_id AND channel_id = p_channel_id;
  
  SELECT COUNT(*) INTO v_count
  FROM chat_messages
  WHERE channel_id = p_channel_id 
    AND created_at > COALESCE(v_last_read, '1970-01-01'::timestamp)
    AND user_id != p_user_id;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar mensagens como lidas
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_user_id UUID, p_channel_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE chat_channel_members
  SET last_read_at = NOW()
  WHERE user_id = p_user_id AND channel_id = p_channel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

