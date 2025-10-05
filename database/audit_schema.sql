-- Script de criação das tabelas de auditoria para o MedStaff no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Tabela principal de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  meta JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de sessões de usuário para rastreamento
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de configurações de auditoria
CREATE TABLE IF NOT EXISTS audit_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  retention_days INTEGER DEFAULT 365,
  log_level TEXT DEFAULT 'INFO', -- DEBUG, INFO, WARN, ERROR
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_audit_settings_updated_at 
BEFORE UPDATE ON audit_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para limpar logs antigos baseado na configuração de retenção
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
DECLARE
    setting_record RECORD;
BEGIN
    FOR setting_record IN 
        SELECT entity_type, retention_days 
        FROM audit_settings 
        WHERE is_enabled = true AND retention_days > 0
    LOOP
        DELETE FROM audit_logs 
        WHERE entity = setting_record.entity_type 
        AND created_at < NOW() - INTERVAL '1 day' * setting_record.retention_days;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de auditoria
CREATE OR REPLACE FUNCTION get_audit_stats(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
    total_logs BIGINT,
    successful_actions BIGINT,
    failed_actions BIGINT,
    top_actions JSONB,
    top_actors JSONB,
    actions_by_day JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE success = true) as successful,
            COUNT(*) FILTER (WHERE success = false) as failed
        FROM audit_logs 
        WHERE timestamp BETWEEN start_date AND end_date
    ),
    top_actions_data AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'action', action,
                'count', count
            ) ORDER BY count DESC
        ) as actions
        FROM (
            SELECT action, COUNT(*) as count
            FROM audit_logs 
            WHERE timestamp BETWEEN start_date AND end_date
            GROUP BY action
            ORDER BY count DESC
            LIMIT 10
        ) t
    ),
    top_actors_data AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'actor_name', actor_name,
                'count', count
            ) ORDER BY count DESC
        ) as actors
        FROM (
            SELECT actor_name, COUNT(*) as count
            FROM audit_logs 
            WHERE timestamp BETWEEN start_date AND end_date
            GROUP BY actor_name
            ORDER BY count DESC
            LIMIT 10
        ) t
    ),
    daily_actions AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'date', date,
                'count', count
            ) ORDER BY date
        ) as daily_data
        FROM (
            SELECT 
                DATE(timestamp) as date,
                COUNT(*) as count
            FROM audit_logs 
            WHERE timestamp BETWEEN start_date AND end_date
            GROUP BY DATE(timestamp)
            ORDER BY date
        ) t
    )
    SELECT 
        s.total,
        s.successful,
        s.failed,
        COALESCE(ta.actions, '[]'::jsonb),
        COALESCE(tac.actors, '[]'::jsonb),
        COALESCE(da.daily_data, '[]'::jsonb)
    FROM stats s
    CROSS JOIN top_actions_data ta
    CROSS JOIN top_actors_data tac
    CROSS JOIN daily_actions da;
END;
$$ LANGUAGE plpgsql;

-- Políticas RLS (Row Level Security)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para AUDIT_LOGS
-- Apenas admins podem ver todos os logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (position ILIKE '%admin%' OR position ILIKE '%gerente%' OR position ILIKE '%diretor%')
        )
    );

-- Usuários podem ver apenas seus próprios logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (actor_id = auth.uid());

-- Apenas o sistema pode inserir logs (através de triggers ou funções)
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Políticas para USER_SESSIONS
-- Usuários podem ver apenas suas próprias sessões
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (user_id = auth.uid());

-- Admins podem ver todas as sessões
CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (position ILIKE '%admin%' OR position ILIKE '%gerente%' OR position ILIKE '%diretor%')
        )
    );

-- Sistema pode inserir/atualizar sessões
CREATE POLICY "System can manage sessions" ON user_sessions
    FOR ALL USING (true);

-- Políticas para AUDIT_SETTINGS
-- Apenas admins podem gerenciar configurações de auditoria
CREATE POLICY "Admins can manage audit settings" ON audit_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (position ILIKE '%admin%' OR position ILIKE '%gerente%' OR position ILIKE '%diretor%')
        )
    );

-- Inserir configurações padrão de auditoria
INSERT INTO audit_settings (entity_type, is_enabled, retention_days, log_level) VALUES
('expense', true, 2555, 'INFO'),        -- 7 anos para dados financeiros
('launch', true, 2555, 'INFO'),         -- 7 anos para dados financeiros
('collaborator', true, 1825, 'INFO'),   -- 5 anos para dados de RH
('document', true, 2555, 'INFO'),       -- 7 anos para documentos
('role', true, 365, 'INFO'),            -- 1 ano para mudanças de permissão
('user', true, 365, 'INFO'),            -- 1 ano para mudanças de usuário
('contact', true, 1095, 'INFO'),        -- 3 anos para contatos
('activity', true, 730, 'INFO'),        -- 2 anos para atividades
('session', true, 90, 'INFO')           -- 3 meses para sessões
ON CONFLICT (entity_type) DO NOTHING;

-- Função para registrar log de auditoria
CREATE OR REPLACE FUNCTION log_audit_action(
    p_actor_id UUID,
    p_actor_name TEXT,
    p_actor_role TEXT,
    p_action TEXT,
    p_entity TEXT,
    p_entity_id TEXT,
    p_meta JSONB DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    setting_enabled BOOLEAN;
BEGIN
    -- Verificar se a auditoria está habilitada para esta entidade
    SELECT is_enabled INTO setting_enabled
    FROM audit_settings
    WHERE entity_type = p_entity;
    
    -- Se não há configuração ou está desabilitada, não registrar
    IF setting_enabled IS NULL OR setting_enabled = false THEN
        RETURN NULL;
    END IF;
    
    -- Inserir o log
    INSERT INTO audit_logs (
        actor_id, actor_name, actor_role, action, entity, entity_id,
        meta, success, error_message, ip_address, user_agent
    ) VALUES (
        p_actor_id, p_actor_name, p_actor_role, p_action, p_entity, p_entity_id,
        p_meta, p_success, p_error_message, p_ip_address, p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE audit_logs IS 'Tabela principal para armazenar todos os logs de auditoria do sistema';
COMMENT ON TABLE user_sessions IS 'Tabela para rastrear sessões de usuário e atividades';
COMMENT ON TABLE audit_settings IS 'Configurações de auditoria por tipo de entidade';

COMMENT ON FUNCTION log_audit_action IS 'Função para registrar uma ação de auditoria no sistema';
COMMENT ON FUNCTION get_audit_stats IS 'Função para obter estatísticas de auditoria em um período';
COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Função para limpar logs antigos baseado na política de retenção';