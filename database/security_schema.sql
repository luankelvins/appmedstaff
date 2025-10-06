-- Schema para Sistema de Segurança e Conformidade
-- Criado para AppMedStaff - Sistema de auditoria e validações de segurança

-- Tabela de alertas de segurança
CREATE TABLE IF NOT EXISTS security_alerts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('suspicious_activity', 'data_breach', 'unauthorized_access', 'compliance_violation')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    entity_type TEXT,
    entity_id TEXT,
    metadata JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de regras de conformidade
CREATE TABLE IF NOT EXISTS compliance_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    regulation TEXT NOT NULL CHECK (regulation IN ('LGPD', 'GDPR', 'SOX', 'ISO27001')),
    category TEXT NOT NULL CHECK (category IN ('data_protection', 'access_control', 'audit_trail', 'retention')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    conditions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de métricas de segurança (histórico)
CREATE TABLE IF NOT EXISTS security_metrics_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    total_alerts INTEGER NOT NULL DEFAULT 0,
    critical_alerts INTEGER NOT NULL DEFAULT 0,
    resolved_alerts INTEGER NOT NULL DEFAULT 0,
    average_resolution_time_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
    compliance_score INTEGER NOT NULL DEFAULT 100,
    risk_score INTEGER NOT NULL DEFAULT 0,
    top_threats JSONB DEFAULT '[]',
    compliance_violations JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de configurações de segurança
CREATE TABLE IF NOT EXISTS security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON security_alerts(type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_timestamp ON security_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON security_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_security_alerts_entity ON security_alerts(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_compliance_rules_regulation ON compliance_rules(regulation);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_category ON compliance_rules(category);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_enabled ON compliance_rules(enabled);

CREATE INDEX IF NOT EXISTS idx_security_metrics_date ON security_metrics_history(date);
CREATE INDEX IF NOT EXISTS idx_security_settings_key ON security_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_security_settings_category ON security_settings(category);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_security_alerts_updated_at 
    BEFORE UPDATE ON security_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_rules_updated_at 
    BEFORE UPDATE ON compliance_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_settings_updated_at 
    BEFORE UPDATE ON security_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular métricas de segurança
CREATE OR REPLACE FUNCTION calculate_security_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    total_alerts INTEGER,
    critical_alerts INTEGER,
    resolved_alerts INTEGER,
    average_resolution_time_hours DECIMAL,
    compliance_score INTEGER,
    risk_score INTEGER
) AS $$
DECLARE
    alerts_count INTEGER;
    critical_count INTEGER;
    resolved_count INTEGER;
    avg_resolution DECIMAL;
    compliance INTEGER;
    risk INTEGER;
BEGIN
    -- Contar alertas do dia
    SELECT COUNT(*) INTO alerts_count
    FROM security_alerts
    WHERE DATE(timestamp) = target_date;

    -- Contar alertas críticos
    SELECT COUNT(*) INTO critical_count
    FROM security_alerts
    WHERE DATE(timestamp) = target_date AND severity = 'critical';

    -- Contar alertas resolvidos
    SELECT COUNT(*) INTO resolved_count
    FROM security_alerts
    WHERE DATE(timestamp) = target_date AND resolved = true;

    -- Calcular tempo médio de resolução (em horas)
    SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - timestamp)) / 3600), 0) INTO avg_resolution
    FROM security_alerts
    WHERE DATE(timestamp) = target_date AND resolved = true AND resolved_at IS NOT NULL;

    -- Calcular score de conformidade (100 - 10 por alerta crítico)
    compliance := GREATEST(0, 100 - (critical_count * 10));

    -- Calcular score de risco (5 por alerta não resolvido)
    risk := LEAST(100, (alerts_count - resolved_count) * 5);

    RETURN QUERY SELECT alerts_count, critical_count, resolved_count, avg_resolution, compliance, risk;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para detectar padrões suspeitos
CREATE OR REPLACE FUNCTION detect_suspicious_patterns(
    user_id_param UUID,
    action_param TEXT,
    time_window_minutes INTEGER DEFAULT 60
)
RETURNS TABLE (
    pattern_type TEXT,
    count INTEGER,
    is_suspicious BOOLEAN
) AS $$
DECLARE
    failed_logins INTEGER;
    rapid_actions INTEGER;
    bulk_access INTEGER;
BEGIN
    -- Verificar múltiplas tentativas de login falhadas
    SELECT COUNT(*) INTO failed_logins
    FROM audit_logs
    WHERE actor_id = user_id_param::TEXT
      AND action = 'auth.failed_login'
      AND timestamp >= NOW() - INTERVAL '1 hour';

    -- Verificar ações rápidas (muitas ações em pouco tempo)
    SELECT COUNT(*) INTO rapid_actions
    FROM audit_logs
    WHERE actor_id = user_id_param::TEXT
      AND timestamp >= NOW() - (time_window_minutes || ' minutes')::INTERVAL;

    -- Verificar acesso em massa a dados
    SELECT COUNT(*) INTO bulk_access
    FROM audit_logs
    WHERE actor_id = user_id_param::TEXT
      AND action LIKE 'data.%.view'
      AND timestamp >= NOW() - INTERVAL '1 hour';

    -- Retornar resultados
    RETURN QUERY VALUES 
        ('failed_logins', failed_logins, failed_logins >= 5),
        ('rapid_actions', rapid_actions, rapid_actions >= 10),
        ('bulk_access', bulk_access, bulk_access >= 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar violações de conformidade
CREATE OR REPLACE FUNCTION check_compliance_violation(
    regulation_param TEXT,
    action_param TEXT,
    entity_param TEXT,
    metadata_param JSONB DEFAULT '{}'
)
RETURNS TABLE (
    rule_id TEXT,
    violation_detected BOOLEAN,
    violation_details JSONB
) AS $$
DECLARE
    rule RECORD;
    violation_found BOOLEAN;
    details JSONB;
BEGIN
    -- Iterar sobre regras ativas da regulamentação
    FOR rule IN 
        SELECT * FROM compliance_rules 
        WHERE regulation = regulation_param AND enabled = true
    LOOP
        violation_found := false;
        details := '{}';

        -- Verificar regras específicas
        CASE rule.id
            WHEN 'lgpd-consent-tracking' THEN
                IF action_param LIKE '%personal_data%' AND NOT (metadata_param ? 'consent') THEN
                    violation_found := true;
                    details := jsonb_build_object('reason', 'missing_consent', 'action', action_param);
                END IF;

            WHEN 'sox-financial-audit' THEN
                IF action_param LIKE 'finance.%' AND NOT (metadata_param ? 'audit_trail') THEN
                    violation_found := true;
                    details := jsonb_build_object('reason', 'missing_audit_trail', 'action', action_param);
                END IF;

            WHEN 'iso27001-access-control' THEN
                IF action_param IN ('rbac.role.create', 'rbac.permission.assign') 
                   AND NOT (metadata_param ? 'mfa_verified') THEN
                    violation_found := true;
                    details := jsonb_build_object('reason', 'missing_mfa', 'action', action_param);
                END IF;
        END CASE;

        RETURN QUERY SELECT rule.id, violation_found, details;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para gerar relatório de segurança
CREATE OR REPLACE FUNCTION generate_security_report(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    period TEXT,
    total_alerts INTEGER,
    critical_alerts INTEGER,
    resolved_alerts INTEGER,
    resolution_rate DECIMAL,
    avg_resolution_time_hours DECIMAL,
    compliance_score INTEGER,
    risk_score INTEGER,
    top_threats JSONB,
    recommendations JSONB
) AS $$
DECLARE
    alerts_total INTEGER;
    alerts_critical INTEGER;
    alerts_resolved INTEGER;
    resolution_percentage DECIMAL;
    avg_time DECIMAL;
    comp_score INTEGER;
    risk_level INTEGER;
    threats JSONB;
    recommendations_list JSONB;
BEGIN
    -- Calcular estatísticas do período
    SELECT COUNT(*) INTO alerts_total
    FROM security_alerts
    WHERE DATE(timestamp) BETWEEN start_date AND end_date;

    SELECT COUNT(*) INTO alerts_critical
    FROM security_alerts
    WHERE DATE(timestamp) BETWEEN start_date AND end_date AND severity = 'critical';

    SELECT COUNT(*) INTO alerts_resolved
    FROM security_alerts
    WHERE DATE(timestamp) BETWEEN start_date AND end_date AND resolved = true;

    resolution_percentage := CASE 
        WHEN alerts_total > 0 THEN (alerts_resolved::DECIMAL / alerts_total * 100)
        ELSE 100
    END;

    SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - timestamp)) / 3600), 0) INTO avg_time
    FROM security_alerts
    WHERE DATE(timestamp) BETWEEN start_date AND end_date 
      AND resolved = true AND resolved_at IS NOT NULL;

    comp_score := GREATEST(0, 100 - (alerts_critical * 5));
    risk_level := LEAST(100, (alerts_total - alerts_resolved) * 3);

    -- Top ameaças
    SELECT jsonb_agg(jsonb_build_object('type', type, 'count', count))
    INTO threats
    FROM (
        SELECT type, COUNT(*) as count
        FROM security_alerts
        WHERE DATE(timestamp) BETWEEN start_date AND end_date
        GROUP BY type
        ORDER BY count DESC
        LIMIT 5
    ) t;

    -- Recomendações baseadas nos dados
    recommendations_list := jsonb_build_array();
    
    IF alerts_critical > 5 THEN
        recommendations_list := recommendations_list || jsonb_build_object(
            'priority', 'high',
            'title', 'Muitos alertas críticos',
            'description', 'Revisar políticas de segurança e implementar controles adicionais'
        );
    END IF;

    IF resolution_percentage < 80 THEN
        recommendations_list := recommendations_list || jsonb_build_object(
            'priority', 'medium',
            'title', 'Taxa de resolução baixa',
            'description', 'Melhorar processos de resposta a incidentes'
        );
    END IF;

    RETURN QUERY SELECT 
        start_date::TEXT || ' a ' || end_date::TEXT,
        alerts_total,
        alerts_critical,
        alerts_resolved,
        resolution_percentage,
        avg_time,
        comp_score,
        risk_level,
        COALESCE(threats, '[]'::jsonb),
        recommendations_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS (Row Level Security)
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para security_alerts
CREATE POLICY "Usuários podem ver seus próprios alertas" ON security_alerts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins podem ver todos os alertas" ON security_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'security_manager')
        )
    );

CREATE POLICY "Admins podem inserir alertas" ON security_alerts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'security_manager')
        )
    );

CREATE POLICY "Admins podem atualizar alertas" ON security_alerts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'security_manager')
        )
    );

-- Políticas RLS para compliance_rules
CREATE POLICY "Todos podem ver regras de conformidade" ON compliance_rules
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem modificar regras" ON compliance_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- Políticas RLS para security_metrics_history
CREATE POLICY "Admins podem ver métricas" ON security_metrics_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'security_manager')
        )
    );

-- Políticas RLS para security_settings
CREATE POLICY "Apenas admins podem ver configurações" ON security_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- Inserir regras de conformidade padrão
INSERT INTO compliance_rules (id, name, description, regulation, category, severity, conditions) VALUES
('lgpd-data-retention', 'Retenção de Dados LGPD', 'Dados pessoais devem ser mantidos apenas pelo tempo necessário', 'LGPD', 'retention', 'high', '{"maxRetentionDays": 2555}'),
('lgpd-consent-tracking', 'Rastreamento de Consentimento LGPD', 'Todas as ações com dados pessoais devem ter consentimento registrado', 'LGPD', 'data_protection', 'critical', '{"requireConsent": true}'),
('sox-financial-audit', 'Auditoria Financeira SOX', 'Todas as transações financeiras devem ser auditadas', 'SOX', 'audit_trail', 'critical', '{"auditFinancialActions": true}'),
('iso27001-access-control', 'Controle de Acesso ISO 27001', 'Acesso a sistemas deve ser controlado e monitorado', 'ISO27001', 'access_control', 'high', '{"requireMFA": true, "sessionTimeout": 3600}'),
('gdpr-data-portability', 'Portabilidade de Dados GDPR', 'Usuários devem poder exportar seus dados', 'GDPR', 'data_protection', 'medium', '{"enableDataExport": true}'),
('gdpr-right-to-be-forgotten', 'Direito ao Esquecimento GDPR', 'Usuários devem poder solicitar exclusão de dados', 'GDPR', 'data_protection', 'high', '{"enableDataDeletion": true}')
ON CONFLICT (id) DO NOTHING;

-- Inserir configurações de segurança padrão
INSERT INTO security_settings (setting_key, setting_value, description, category) VALUES
('max_failed_logins', '5', 'Número máximo de tentativas de login falhadas antes de bloquear', 'authentication'),
('session_timeout_minutes', '60', 'Tempo limite da sessão em minutos', 'authentication'),
('require_mfa_for_admin', 'true', 'Exigir MFA para ações administrativas', 'authentication'),
('alert_retention_days', '365', 'Dias para manter alertas de segurança', 'retention'),
('auto_resolve_low_alerts', 'false', 'Resolver automaticamente alertas de baixa severidade', 'automation'),
('notification_email', '""', 'Email para notificações de segurança', 'notifications'),
('enable_real_time_monitoring', 'true', 'Habilitar monitoramento em tempo real', 'monitoring'),
('suspicious_activity_threshold', '10', 'Limite de ações por minuto para detectar atividade suspeita', 'monitoring')
ON CONFLICT (setting_key) DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE security_alerts IS 'Alertas de segurança gerados pelo sistema de monitoramento';
COMMENT ON TABLE compliance_rules IS 'Regras de conformidade para diferentes regulamentações';
COMMENT ON TABLE security_metrics_history IS 'Histórico de métricas de segurança para análise temporal';
COMMENT ON TABLE security_settings IS 'Configurações do sistema de segurança';

COMMENT ON COLUMN security_alerts.type IS 'Tipo do alerta: suspicious_activity, data_breach, unauthorized_access, compliance_violation';
COMMENT ON COLUMN security_alerts.severity IS 'Severidade: low, medium, high, critical';
COMMENT ON COLUMN compliance_rules.regulation IS 'Regulamentação: LGPD, GDPR, SOX, ISO27001';
COMMENT ON COLUMN compliance_rules.category IS 'Categoria: data_protection, access_control, audit_trail, retention';