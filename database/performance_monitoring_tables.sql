-- ==================== TABELAS DE MONITORAMENTO DE PERFORMANCE ====================

-- Tabela para métricas de performance de operações
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  operation_name TEXT NOT NULL,
  duration NUMERIC NOT NULL, -- em milissegundos
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  memory_usage NUMERIC, -- em bytes
  cpu_usage NUMERIC, -- percentual
  network_latency NUMERIC, -- em milissegundos
  page_url TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'test', 'production')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para relatórios de sistema
CREATE TABLE IF NOT EXISTS system_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  memory_used NUMERIC NOT NULL, -- em bytes
  memory_total NUMERIC NOT NULL, -- em bytes
  memory_percentage NUMERIC NOT NULL, -- percentual
  cpu_cores INTEGER NOT NULL,
  cpu_usage NUMERIC NOT NULL, -- percentual
  network_type TEXT NOT NULL,
  network_downlink NUMERIC NOT NULL, -- Mbps
  network_rtt NUMERIC NOT NULL, -- em milissegundos
  environment TEXT NOT NULL CHECK (environment IN ('development', 'test', 'production')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ÍNDICES PARA PERFORMANCE ====================

-- Índices para performance_metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session_id ON performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_operation_name ON performance_metrics(operation_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_success ON performance_metrics(success);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_environment ON performance_metrics(environment);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_duration ON performance_metrics(duration);

-- Índices para system_reports
CREATE INDEX IF NOT EXISTS idx_system_reports_timestamp ON system_reports(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_reports_user_id ON system_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_system_reports_session_id ON system_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_system_reports_environment ON system_reports(environment);
CREATE INDEX IF NOT EXISTS idx_system_reports_memory_percentage ON system_reports(memory_percentage);
CREATE INDEX IF NOT EXISTS idx_system_reports_cpu_usage ON system_reports(cpu_usage);

-- ==================== TRIGGERS PARA UPDATED_AT ====================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_performance_metrics_updated_at 
  BEFORE UPDATE ON performance_metrics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_reports_updated_at 
  BEFORE UPDATE ON system_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== POLÍTICAS RLS (ROW LEVEL SECURITY) ====================

-- Habilitar RLS nas tabelas
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para performance_metrics
CREATE POLICY "Usuários podem ver suas próprias métricas" ON performance_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias métricas" ON performance_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias métricas" ON performance_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias métricas" ON performance_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para system_reports
CREATE POLICY "Usuários podem ver seus próprios relatórios" ON system_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios relatórios" ON system_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios relatórios" ON system_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios relatórios" ON system_reports
  FOR DELETE USING (auth.uid() = user_id);

-- ==================== VIEWS PARA ANÁLISE ====================

-- View para estatísticas de performance por usuário
CREATE OR REPLACE VIEW performance_stats_by_user AS
SELECT 
  user_id,
  environment,
  COUNT(*) as total_operations,
  AVG(duration) as avg_duration,
  MIN(duration) as min_duration,
  MAX(duration) as max_duration,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration) as median_duration,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration) as p95_duration,
  COUNT(*) FILTER (WHERE success = true) as successful_operations,
  COUNT(*) FILTER (WHERE success = false) as failed_operations,
  (COUNT(*) FILTER (WHERE success = true)::FLOAT / COUNT(*)) * 100 as success_rate
FROM performance_metrics
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY user_id, environment;

-- View para operações mais lentas
CREATE OR REPLACE VIEW slowest_operations AS
SELECT 
  operation_name,
  environment,
  AVG(duration) as avg_duration,
  MAX(duration) as max_duration,
  COUNT(*) as operation_count,
  COUNT(*) FILTER (WHERE success = false) as error_count
FROM performance_metrics
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY operation_name, environment
ORDER BY avg_duration DESC;

-- View para uso de recursos do sistema
CREATE OR REPLACE VIEW system_resource_usage AS
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  environment,
  AVG(memory_percentage) as avg_memory_usage,
  MAX(memory_percentage) as max_memory_usage,
  AVG(cpu_usage) as avg_cpu_usage,
  MAX(cpu_usage) as max_cpu_usage,
  AVG(network_rtt) as avg_network_latency,
  COUNT(*) as report_count
FROM system_reports
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp), environment
ORDER BY hour DESC;

-- ==================== FUNÇÕES PARA LIMPEZA AUTOMÁTICA ====================

-- Função para limpar dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_performance_data(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_metrics INTEGER;
  deleted_reports INTEGER;
  cutoff_date TIMESTAMPTZ;
BEGIN
  cutoff_date := NOW() - (days_to_keep || ' days')::INTERVAL;
  
  -- Deletar métricas antigas
  DELETE FROM performance_metrics WHERE timestamp < cutoff_date;
  GET DIAGNOSTICS deleted_metrics = ROW_COUNT;
  
  -- Deletar relatórios antigos
  DELETE FROM system_reports WHERE timestamp < cutoff_date;
  GET DIAGNOSTICS deleted_reports = ROW_COUNT;
  
  -- Log da limpeza
  RAISE NOTICE 'Limpeza concluída: % métricas e % relatórios removidos', deleted_metrics, deleted_reports;
  
  RETURN deleted_metrics + deleted_reports;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== COMENTÁRIOS NAS TABELAS ====================

COMMENT ON TABLE performance_metrics IS 'Armazena métricas de performance de operações da aplicação';
COMMENT ON TABLE system_reports IS 'Armazena relatórios de uso de recursos do sistema';

COMMENT ON COLUMN performance_metrics.duration IS 'Duração da operação em milissegundos';
COMMENT ON COLUMN performance_metrics.memory_usage IS 'Uso de memória em bytes no momento da operação';
COMMENT ON COLUMN performance_metrics.cpu_usage IS 'Uso de CPU em percentual no momento da operação';
COMMENT ON COLUMN performance_metrics.network_latency IS 'Latência de rede em milissegundos';

COMMENT ON COLUMN system_reports.memory_used IS 'Memória utilizada em bytes';
COMMENT ON COLUMN system_reports.memory_total IS 'Memória total disponível em bytes';
COMMENT ON COLUMN system_reports.memory_percentage IS 'Percentual de uso de memória';
COMMENT ON COLUMN system_reports.cpu_cores IS 'Número de cores de CPU disponíveis';
COMMENT ON COLUMN system_reports.cpu_usage IS 'Percentual de uso de CPU';
COMMENT ON COLUMN system_reports.network_downlink IS 'Velocidade de download da rede em Mbps';
COMMENT ON COLUMN system_reports.network_rtt IS 'Round-trip time da rede em milissegundos';

-- ==================== GRANTS DE PERMISSÃO ====================

-- Permitir que usuários autenticados acessem as tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON performance_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON system_reports TO authenticated;

-- Permitir acesso às views
GRANT SELECT ON performance_stats_by_user TO authenticated;
GRANT SELECT ON slowest_operations TO authenticated;
GRANT SELECT ON system_resource_usage TO authenticated;

-- Permitir execução da função de limpeza (apenas para administradores)
GRANT EXECUTE ON FUNCTION cleanup_old_performance_data TO service_role;