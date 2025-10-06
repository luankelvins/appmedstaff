-- ============================================
-- SCHEMA PARA RECUPERAÇÃO DE SENHA
-- ============================================

-- Tabela para armazenar tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_created_at ON password_reset_tokens(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_password_reset_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_password_reset_tokens_updated_at
  BEFORE UPDATE ON password_reset_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_password_reset_tokens_updated_at();

-- Função para limpar tokens expirados (executar periodicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM password_reset_tokens 
  WHERE expires_at < NOW() OR used = TRUE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar rate limiting
CREATE OR REPLACE FUNCTION check_password_reset_rate_limit(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
  one_hour_ago TIMESTAMP WITH TIME ZONE;
BEGIN
  one_hour_ago := NOW() - INTERVAL '1 hour';
  
  SELECT COUNT(*)
  INTO attempt_count
  FROM password_reset_tokens
  WHERE email = user_email
    AND created_at >= one_hour_ago;
  
  -- Máximo 3 tentativas por hora
  RETURN attempt_count < 3;
END;
$$ LANGUAGE plpgsql;

-- Função para invalidar tokens antigos do usuário
CREATE OR REPLACE FUNCTION invalidate_user_password_reset_tokens(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE password_reset_tokens
  SET used = TRUE, used_at = NOW()
  WHERE user_id = user_uuid AND used = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios tokens
CREATE POLICY "Users can view their own password reset tokens" ON password_reset_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Sistema pode inserir tokens (service role)
CREATE POLICY "Service role can insert password reset tokens" ON password_reset_tokens
  FOR INSERT WITH CHECK (true);

-- Política: Sistema pode atualizar tokens (service role)
CREATE POLICY "Service role can update password reset tokens" ON password_reset_tokens
  FOR UPDATE USING (true);

-- Política: Sistema pode deletar tokens (service role)
CREATE POLICY "Service role can delete password reset tokens" ON password_reset_tokens
  FOR DELETE USING (true);

-- Comentários
COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperação de senha';
COMMENT ON COLUMN password_reset_tokens.user_id IS 'ID do usuário que solicitou a recuperação';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único para recuperação';
COMMENT ON COLUMN password_reset_tokens.email IS 'Email do usuário (para rate limiting)';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Data de expiração do token (1 hora)';
COMMENT ON COLUMN password_reset_tokens.used IS 'Se o token já foi utilizado';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Data de utilização do token';

-- Inserir dados de exemplo (opcional - remover em produção)
-- INSERT INTO password_reset_tokens (user_id, token, email, expires_at) VALUES
-- ('b915cf4c-d2d9-4cd5-b37e-2cf0ff3147b5', 'example-token', 'luankelvin@soumedstaff.com', NOW() + INTERVAL '1 hour');
