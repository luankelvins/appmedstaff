-- Migração para adicionar suporte a autenticação de dois fatores (2FA)

-- Adicionar colunas de 2FA na tabela employees
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_enabled_at TIMESTAMP WITH TIME ZONE;

-- Criar tabela para códigos de backup do 2FA
CREATE TABLE IF NOT EXISTS two_factor_backup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_two_factor_backup_codes_employee_id ON two_factor_backup_codes(employee_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_backup_codes_code ON two_factor_backup_codes(code);
CREATE INDEX IF NOT EXISTS idx_two_factor_backup_codes_used ON two_factor_backup_codes(used);

-- Criar índices na tabela employees para as novas colunas
CREATE INDEX IF NOT EXISTS idx_employees_two_factor_enabled ON employees(two_factor_enabled);
CREATE INDEX IF NOT EXISTS idx_employees_two_factor_secret ON employees(two_factor_secret);
CREATE INDEX IF NOT EXISTS idx_employees_two_factor_enabled_at ON employees(two_factor_enabled_at);

-- Criar índices compostos para consultas otimizadas
CREATE INDEX IF NOT EXISTS idx_two_factor_backup_codes_employee_unused ON two_factor_backup_codes(employee_id, used) WHERE used = FALSE;
CREATE INDEX IF NOT EXISTS idx_two_factor_backup_codes_employee_code ON two_factor_backup_codes(employee_id, code);
CREATE INDEX IF NOT EXISTS idx_two_factor_backup_codes_created_at ON two_factor_backup_codes(created_at);
CREATE INDEX IF NOT EXISTS idx_two_factor_backup_codes_used_at ON two_factor_backup_codes(used_at);

-- Comentários para documentação
COMMENT ON COLUMN users.two_factor_secret IS 'Secret base32 para autenticação TOTP';
COMMENT ON COLUMN users.two_factor_enabled IS 'Indica se o 2FA está habilitado para o usuário';
COMMENT ON COLUMN users.two_factor_enabled_at IS 'Data e hora quando o 2FA foi habilitado';

COMMENT ON TABLE two_factor_backup_codes IS 'Códigos de backup para autenticação de dois fatores';
COMMENT ON COLUMN two_factor_backup_codes.code IS 'Código de backup de 8 caracteres';
COMMENT ON COLUMN two_factor_backup_codes.used IS 'Indica se o código já foi utilizado';
COMMENT ON COLUMN two_factor_backup_codes.used_at IS 'Data e hora quando o código foi utilizado';