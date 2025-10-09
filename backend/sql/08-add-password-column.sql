-- Migração para adicionar coluna de senha à tabela employees
-- Data: 2024-10-08

-- Adicionar coluna password_hash à tabela employees
ALTER TABLE employees 
ADD COLUMN password_hash TEXT;

-- Criar índice para melhorar performance de consultas de autenticação
CREATE INDEX idx_employees_password_hash ON employees(password_hash);

-- Comentário na coluna
COMMENT ON COLUMN employees.password_hash IS 'Hash da senha do usuário para autenticação';

-- Criar tabela para tokens de reset de senha
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Índices para a tabela de tokens
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Comentários na tabela
COMMENT ON TABLE password_reset_tokens IS 'Tokens para reset de senha dos usuários';
COMMENT ON COLUMN password_reset_tokens.user_id IS 'ID do usuário que solicitou o reset';
COMMENT ON COLUMN password_reset_tokens.email IS 'Email do usuário';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único para reset de senha';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Data de expiração do token';
COMMENT ON COLUMN password_reset_tokens.used IS 'Indica se o token já foi usado';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Data em que o token foi usado';