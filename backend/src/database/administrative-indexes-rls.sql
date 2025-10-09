-- =====================================================
-- ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE
-- =====================================================

-- Índices para admin_documents
CREATE INDEX IF NOT EXISTS idx_admin_documents_categoria ON admin_documents(categoria);
CREATE INDEX IF NOT EXISTS idx_admin_documents_status ON admin_documents(status);
CREATE INDEX IF NOT EXISTS idx_admin_documents_criado_por ON admin_documents(criado_por);
CREATE INDEX IF NOT EXISTS idx_admin_documents_data_validade ON admin_documents(data_validade);

-- Índices para time_entries
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_data ON time_entries(employee_id, data_ponto);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_data_ponto ON time_entries(data_ponto);
CREATE INDEX IF NOT EXISTS idx_time_entries_tipo_registro ON time_entries(tipo_registro);

-- Índices para time_validations
CREATE INDEX IF NOT EXISTS idx_time_validations_time_entry ON time_validations(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_time_validations_employee ON time_validations(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_validations_validador ON time_validations(validador_id);
CREATE INDEX IF NOT EXISTS idx_time_validations_status ON time_validations(status_novo);

-- Índices para system_settings
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_settings_categoria_chave ON system_settings(categoria, chave);
CREATE INDEX IF NOT EXISTS idx_system_settings_categoria ON system_settings(categoria);
CREATE INDEX IF NOT EXISTS idx_system_settings_grupo ON system_settings(grupo_configuracao);

-- Índices para admin_reports
CREATE INDEX IF NOT EXISTS idx_admin_reports_tipo ON admin_reports(tipo_relatorio);
CREATE INDEX IF NOT EXISTS idx_admin_reports_criado_por ON admin_reports(criado_por);
CREATE INDEX IF NOT EXISTS idx_admin_reports_status ON admin_reports(status);
CREATE INDEX IF NOT EXISTS idx_admin_reports_proxima_execucao ON admin_reports(proxima_execucao);

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela_registro ON audit_logs(tabela_afetada, registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_categoria ON audit_logs(categoria);
CREATE INDEX IF NOT EXISTS idx_audit_logs_modulo ON audit_logs(modulo);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severidade ON audit_logs(nivel_severidade);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE admin_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA ADMIN_DOCUMENTS
-- =====================================================

DROP POLICY IF EXISTS "Usuários podem visualizar documentos" ON admin_documents;
CREATE POLICY "Usuários podem visualizar documentos" ON admin_documents 
FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuários podem criar documentos" ON admin_documents;
CREATE POLICY "Usuários podem criar documentos" ON admin_documents 
FOR INSERT WITH CHECK (auth.uid() = criado_por);

DROP POLICY IF EXISTS "Usuários podem atualizar seus documentos" ON admin_documents;
CREATE POLICY "Usuários podem atualizar seus documentos" ON admin_documents 
FOR UPDATE USING (auth.uid() = criado_por OR auth.uid() = aprovado_por);

-- =====================================================
-- POLÍTICAS RLS PARA TIME_ENTRIES
-- =====================================================

DROP POLICY IF EXISTS "Funcionários podem ver seus pontos" ON time_entries;
CREATE POLICY "Funcionários podem ver seus pontos" ON time_entries 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM employees WHERE employees.id = time_entries.employee_id AND employees.email = auth.jwt() ->> 'email')
  OR EXISTS (SELECT 1 FROM employees WHERE employees.email = auth.jwt() ->> 'email' AND role IN ('admin', 'superadmin'))
);

DROP POLICY IF EXISTS "Funcionários podem registrar ponto" ON time_entries;
CREATE POLICY "Funcionários podem registrar ponto" ON time_entries 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM employees WHERE employees.id = time_entries.employee_id AND employees.email = auth.jwt() ->> 'email')
);

DROP POLICY IF EXISTS "Funcionários podem atualizar seus pontos pendentes" ON time_entries;
CREATE POLICY "Funcionários podem atualizar seus pontos pendentes" ON time_entries 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM employees WHERE employees.id = time_entries.employee_id AND employees.email = auth.jwt() ->> 'email')
  AND status = 'pendente'
);

-- =====================================================
-- POLÍTICAS RLS PARA TIME_VALIDATIONS
-- =====================================================

DROP POLICY IF EXISTS "Usuários podem ver validações relacionadas" ON time_validations;
CREATE POLICY "Usuários podem ver validações relacionadas" ON time_validations 
FOR SELECT USING (
  auth.uid() = validador_id 
  OR EXISTS (SELECT 1 FROM employees WHERE employees.id = time_validations.employee_id AND employees.email = auth.jwt() ->> 'email')
);

DROP POLICY IF EXISTS "Gestores podem criar validações" ON time_validations;
CREATE POLICY "Gestores podem criar validações" ON time_validations 
FOR INSERT WITH CHECK (
  auth.uid() = validador_id 
  AND EXISTS (SELECT 1 FROM employees WHERE employees.email = auth.jwt() ->> 'email' AND role IN ('admin', 'superadmin'))
);

-- =====================================================
-- POLÍTICAS RLS PARA SYSTEM_SETTINGS
-- =====================================================

DROP POLICY IF EXISTS "Usuários podem ver configurações visíveis" ON system_settings;
CREATE POLICY "Usuários podem ver configurações visíveis" ON system_settings 
FOR SELECT USING (
  visivel_usuario = true 
  OR EXISTS (SELECT 1 FROM employees WHERE employees.email = auth.jwt() ->> 'email' AND role IN ('admin', 'superadmin'))
);

DROP POLICY IF EXISTS "Apenas admins podem alterar configurações" ON system_settings;
CREATE POLICY "Apenas admins podem alterar configurações" ON system_settings 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM employees WHERE employees.email = auth.jwt() ->> 'email' AND role IN ('admin', 'superadmin'))
);

-- =====================================================
-- POLÍTICAS RLS PARA ADMIN_REPORTS
-- =====================================================

DROP POLICY IF EXISTS "Usuários podem ver relatórios públicos ou próprios" ON admin_reports;
CREATE POLICY "Usuários podem ver relatórios públicos ou próprios" ON admin_reports 
FOR SELECT USING (
  publico = true 
  OR auth.uid() = criado_por 
  OR auth.uid() = ANY(compartilhado_com)
  OR EXISTS (SELECT 1 FROM employees WHERE employees.email = auth.jwt() ->> 'email' AND role IN ('admin', 'superadmin'))
);

DROP POLICY IF EXISTS "Usuários podem criar relatórios" ON admin_reports;
CREATE POLICY "Usuários podem criar relatórios" ON admin_reports 
FOR INSERT WITH CHECK (auth.uid() = criado_por);

DROP POLICY IF EXISTS "Usuários podem atualizar seus relatórios" ON admin_reports;
CREATE POLICY "Usuários podem atualizar seus relatórios" ON admin_reports 
FOR UPDATE USING (auth.uid() = criado_por);

-- =====================================================
-- POLÍTICAS RLS PARA AUDIT_LOGS
-- =====================================================

DROP POLICY IF EXISTS "Apenas admins podem ver logs de auditoria" ON audit_logs;
CREATE POLICY "Apenas admins podem ver logs de auditoria" ON audit_logs 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM employees WHERE employees.email = auth.jwt() ->> 'email' AND role IN ('admin', 'superadmin'))
);

DROP POLICY IF EXISTS "Sistema pode inserir logs" ON audit_logs;
CREATE POLICY "Sistema pode inserir logs" ON audit_logs 
FOR INSERT WITH CHECK (true);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para as tabelas
DROP TRIGGER IF EXISTS update_admin_documents_updated_at ON admin_documents;
CREATE TRIGGER update_admin_documents_updated_at 
  BEFORE UPDATE ON admin_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_entries_updated_at ON time_entries;
CREATE TRIGGER update_time_entries_updated_at 
  BEFORE UPDATE ON time_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at 
  BEFORE UPDATE ON system_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_reports_updated_at ON admin_reports;
CREATE TRIGGER update_admin_reports_updated_at 
  BEFORE UPDATE ON admin_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE admin_documents IS 'Tabela para armazenar documentos administrativos da empresa';
COMMENT ON TABLE time_entries IS 'Tabela para registros de ponto dos funcionários';
COMMENT ON TABLE time_validations IS 'Tabela para validações dos registros de ponto';
COMMENT ON TABLE system_settings IS 'Tabela para configurações do sistema';
COMMENT ON TABLE admin_reports IS 'Tabela para definições de relatórios administrativos';
COMMENT ON TABLE audit_logs IS 'Tabela para logs de auditoria do sistema';

-- Comentários nas colunas principais
COMMENT ON COLUMN admin_documents.categoria IS 'Categoria do documento: politica, contrato, procedimento, manual, certificado, outros';
COMMENT ON COLUMN admin_documents.status IS 'Status do documento: ativo, inativo, arquivado';
COMMENT ON COLUMN time_entries.tipo_registro IS 'Tipo de registro: normal, falta, atestado, ferias, folga';
COMMENT ON COLUMN time_entries.status IS 'Status da validação: pendente, aprovado, rejeitado';
COMMENT ON COLUMN audit_logs.categoria IS 'Categoria da ação: create, read, update, delete, login, logout, export, import';
COMMENT ON COLUMN audit_logs.nivel_severidade IS 'Nível de severidade: info, warning, error, critical';