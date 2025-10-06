-- SCHEMA DE AUDITORIA PARA MEDSTAFF
-- Execute este script completo no Supabase SQL Editor

-- 1. Criar tabela de logs de auditoria
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

-- 2. Criar tabela de sessões de usuário
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

-- 3. Criar tabela de configurações de auditoria
CREATE TABLE IF NOT EXISTS audit_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  retention_days INTEGER DEFAULT 365,
  log_level TEXT DEFAULT 'INFO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices para performance
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

-- 5. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Trigger para audit_settings
CREATE TRIGGER update_audit_settings_updated_at 
BEFORE UPDATE ON audit_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Função principal para registrar logs
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
    
    -- Se não há configuração, assumir habilitado
    IF setting_enabled IS NULL THEN
        setting_enabled := true;
    END IF;
    
    -- Se está desabilitada, não registrar
    IF setting_enabled = false THEN
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

-- 8. Função para estatísticas de auditoria
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

-- 9. Função para limpeza de logs antigos
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

-- 10. Habilitar RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_settings ENABLE ROW LEVEL SECURITY;

-- 11. Políticas RLS para audit_logs
CREATE POLICY "Superadmins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'superadmin'
        )
    );

CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR position ILIKE '%admin%' OR position ILIKE '%gerente%' OR position ILIKE '%diretor%')
        )
    );

CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (actor_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- 12. Políticas RLS para user_sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (role IN ('admin', 'superadmin') OR position ILIKE '%admin%' OR position ILIKE '%gerente%' OR position ILIKE '%diretor%')
        )
    );

CREATE POLICY "System can manage sessions" ON user_sessions
    FOR ALL USING (true);

-- 13. Políticas RLS para audit_settings
CREATE POLICY "Admins can manage audit settings" ON audit_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (role IN ('admin', 'superadmin') OR position ILIKE '%admin%' OR position ILIKE '%gerente%' OR position ILIKE '%diretor%')
        )
    );

-- 14. Inserir configurações padrão
INSERT INTO audit_settings (entity_type, is_enabled, retention_days, log_level) VALUES
('expense', true, 2555, 'INFO'),
('launch', true, 2555, 'INFO'),
('collaborator', true, 1825, 'INFO'),
('document', true, 2555, 'INFO'),
('role', true, 365, 'INFO'),
('user', true, 365, 'INFO'),
('contact', true, 1095, 'INFO'),
('activity', true, 730, 'INFO'),
('session', true, 90, 'INFO'),
('permission', true, 365, 'INFO'),
('sac_ticket', true, 1095, 'INFO')
ON CONFLICT (entity_type) DO NOTHING;

-- 15. Comentários para documentação
COMMENT ON TABLE audit_logs IS 'Tabela principal para armazenar todos os logs de auditoria do sistema';
COMMENT ON TABLE user_sessions IS 'Tabela para rastrear sessões de usuário e atividades';
COMMENT ON TABLE audit_settings IS 'Configurações de auditoria por tipo de entidade';
COMMENT ON FUNCTION log_audit_action IS 'Função para registrar uma ação de auditoria no sistema';
COMMENT ON FUNCTION get_audit_stats IS 'Função para obter estatísticas de auditoria em um período';
COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Função para limpar logs antigos baseado na política de retenção';