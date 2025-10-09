-- Tabelas Administrativas para a seção Empresa > Administrativo
-- Execute este script no Supabase SQL Editor após o schema principal

-- =====================================================
-- 1. TABELA DE DOCUMENTOS ADMINISTRATIVOS
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('politica', 'contrato', 'procedimento', 'manual', 'certificado', 'outros')),
  tipo_arquivo TEXT NOT NULL,
  tamanho_arquivo BIGINT NOT NULL,
  url_arquivo TEXT NOT NULL,
  versao TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'arquivado')),
  tags TEXT[],
  departamento_responsavel TEXT,
  data_validade DATE,
  data_revisao DATE,
  criado_por UUID REFERENCES auth.users(id) NOT NULL,
  aprovado_por UUID REFERENCES auth.users(id),
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA DE PONTO INTERNO (CONTROLE DE HORÁRIOS)
-- =====================================================
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  data_ponto DATE NOT NULL,
  entrada_manha TIME,
  saida_almoco TIME,
  entrada_tarde TIME,
  saida_noite TIME,
  horas_trabalhadas INTERVAL,
  horas_extras INTERVAL DEFAULT '00:00:00',
  tipo_registro TEXT DEFAULT 'normal' CHECK (tipo_registro IN ('normal', 'falta', 'atestado', 'ferias', 'folga')),
  justificativa TEXT,
  localizacao JSONB, -- Para armazenar coordenadas GPS se necessário
  ip_address INET,
  dispositivo TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  observacoes TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA DE VALIDAÇÃO DE PONTO
-- =====================================================
CREATE TABLE IF NOT EXISTS time_validations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  time_entry_id UUID REFERENCES time_entries(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  validador_id UUID REFERENCES auth.users(id) NOT NULL,
  status_anterior TEXT NOT NULL,
  status_novo TEXT NOT NULL CHECK (status_novo IN ('aprovado', 'rejeitado', 'pendente_correcao')),
  motivo_validacao TEXT,
  observacoes_validador TEXT,
  data_validacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  correcoes_solicitadas JSONB DEFAULT '[]'::jsonb,
  historico_alteracoes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA DE CONFIGURAÇÕES DO SISTEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  categoria TEXT NOT NULL,
  chave TEXT NOT NULL,
  valor JSONB NOT NULL,
  tipo_valor TEXT NOT NULL CHECK (tipo_valor IN ('string', 'number', 'boolean', 'object', 'array')),
  descricao TEXT,
  valor_padrao JSONB,
  requer_reinicializacao BOOLEAN DEFAULT false,
  visivel_usuario BOOLEAN DEFAULT true,
  editavel_usuario BOOLEAN DEFAULT true,
  nivel_permissao TEXT DEFAULT 'admin' CHECK (nivel_permissao IN ('admin', 'manager', 'user')),
  grupo_configuracao TEXT,
  ordem_exibicao INTEGER DEFAULT 0,
  validacao_regex TEXT,
  opcoes_validas JSONB, -- Para campos com opções limitadas
  modificado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(categoria, chave)
);

-- =====================================================
-- 5. TABELA DE RELATÓRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo_relatorio TEXT NOT NULL CHECK (tipo_relatorio IN ('funcionarios', 'ponto', 'documentos', 'auditoria', 'financeiro', 'personalizado')),
  parametros JSONB NOT NULL DEFAULT '{}'::jsonb,
  filtros JSONB DEFAULT '{}'::jsonb,
  colunas_exibicao TEXT[],
  formato_saida TEXT DEFAULT 'pdf' CHECK (formato_saida IN ('pdf', 'excel', 'csv', 'json')),
  agendamento JSONB, -- Para relatórios automáticos
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'arquivado')),
  publico BOOLEAN DEFAULT false,
  compartilhado_com UUID[], -- Array de user IDs
  criado_por UUID REFERENCES auth.users(id) NOT NULL,
  ultima_execucao TIMESTAMP WITH TIME ZONE,
  proxima_execucao TIMESTAMP WITH TIME ZONE,
  template_personalizado TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABELA DE AUDITORIA (LOGS DO SISTEMA)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id),
  acao TEXT NOT NULL,
  tabela_afetada TEXT,
  registro_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT,
  sessao_id TEXT,
  modulo TEXT NOT NULL, -- ex: 'administrativo', 'financeiro', 'crm'
  categoria TEXT NOT NULL CHECK (categoria IN ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import')),
  nivel_severidade TEXT DEFAULT 'info' CHECK (nivel_severidade IN ('info', 'warning', 'error', 'critical')),
  sucesso BOOLEAN DEFAULT true,
  mensagem_erro TEXT,
  duracao_ms INTEGER,
  contexto_adicional JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- =====================================================

-- Índices para admin_documents
CREATE INDEX IF NOT EXISTS idx_admin_documents_categoria ON admin_documents(categoria);
CREATE INDEX IF NOT EXISTS idx_admin_documents_status ON admin_documents(status);
CREATE INDEX IF NOT EXISTS idx_admin_documents_criado_por ON admin_documents(criado_por);
CREATE INDEX IF NOT EXISTS idx_admin_documents_data_validade ON admin_documents(data_validade);

-- Índices para time_entries
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_data_ponto ON time_entries(data_ponto);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_data ON time_entries(employee_id, data_ponto);

-- Índices para time_validations
CREATE INDEX IF NOT EXISTS idx_time_validations_time_entry_id ON time_validations(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_time_validations_employee_id ON time_validations(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_validations_validador_id ON time_validations(validador_id);
CREATE INDEX IF NOT EXISTS idx_time_validations_data ON time_validations(data_validacao);

-- Índices para system_settings
CREATE INDEX IF NOT EXISTS idx_system_settings_categoria ON system_settings(categoria);
CREATE INDEX IF NOT EXISTS idx_system_settings_chave ON system_settings(chave);
CREATE INDEX IF NOT EXISTS idx_system_settings_categoria_chave ON system_settings(categoria, chave);

-- Índices para admin_reports
CREATE INDEX IF NOT EXISTS idx_admin_reports_tipo ON admin_reports(tipo_relatorio);
CREATE INDEX IF NOT EXISTS idx_admin_reports_criado_por ON admin_reports(criado_por);
CREATE INDEX IF NOT EXISTS idx_admin_reports_status ON admin_reports(status);

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario_id ON audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_acao ON audit_logs(acao);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela ON audit_logs(tabela_afetada);
CREATE INDEX IF NOT EXISTS idx_audit_logs_categoria ON audit_logs(categoria);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_modulo ON audit_logs(modulo);

-- =====================================================
-- TRIGGERS PARA ATUALIZAR updated_at
-- =====================================================

-- Triggers para admin_documents
CREATE TRIGGER update_admin_documents_updated_at 
  BEFORE UPDATE ON admin_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para time_entries
CREATE TRIGGER update_time_entries_updated_at 
  BEFORE UPDATE ON time_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para system_settings
CREATE TRIGGER update_system_settings_updated_at 
  BEFORE UPDATE ON system_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para admin_reports
CREATE TRIGGER update_admin_reports_updated_at 
  BEFORE UPDATE ON admin_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS DE SEGURANÇA RLS
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE admin_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_documents
CREATE POLICY "Authenticated users can view documents" ON admin_documents 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create documents" ON admin_documents 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update documents" ON admin_documents 
  FOR UPDATE TO authenticated USING (true);

-- Políticas para time_entries
CREATE POLICY "Users can view own time entries" ON time_entries 
  FOR SELECT TO authenticated USING (
    employee_id IN (
      SELECT id FROM employees WHERE email = auth.jwt() ->> 'email'
    ) OR 
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.email = auth.jwt() ->> 'email' 
      AND e.dados_profissionais ->> 'cargo' IN ('Gerente', 'Supervisor', 'RH')
    )
  );
CREATE POLICY "Users can create own time entries" ON time_entries 
  FOR INSERT TO authenticated WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE email = auth.jwt() ->> 'email'
    )
  );
CREATE POLICY "Users can update own time entries" ON time_entries 
  FOR UPDATE TO authenticated USING (
    employee_id IN (
      SELECT id FROM employees WHERE email = auth.jwt() ->> 'email'
    ) OR 
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.email = auth.jwt() ->> 'email' 
      AND e.dados_profissionais ->> 'cargo' IN ('Gerente', 'Supervisor', 'RH')
    )
  );

-- Políticas para time_validations
CREATE POLICY "Managers can view time validations" ON time_validations 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.email = auth.jwt() ->> 'email' 
      AND e.dados_profissionais ->> 'cargo' IN ('Gerente', 'Supervisor', 'RH')
    )
  );
CREATE POLICY "Managers can create time validations" ON time_validations 
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.email = auth.jwt() ->> 'email' 
      AND e.dados_profissionais ->> 'cargo' IN ('Gerente', 'Supervisor', 'RH')
    )
  );

-- Políticas para system_settings
CREATE POLICY "Admins can manage settings" ON system_settings 
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.email = auth.jwt() ->> 'email' 
      AND e.dados_profissionais ->> 'cargo' = 'Administrador'
    )
  );

-- Políticas para admin_reports
CREATE POLICY "Authenticated users can view reports" ON admin_reports 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create reports" ON admin_reports 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own reports" ON admin_reports 
  FOR UPDATE TO authenticated USING (criado_por = auth.uid());

-- Políticas para audit_logs
CREATE POLICY "Admins can view audit logs" ON audit_logs 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.email = auth.jwt() ->> 'email' 
      AND e.dados_profissionais ->> 'cargo' IN ('Administrador', 'Gerente')
    )
  );
CREATE POLICY "System can create audit logs" ON audit_logs 
  FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE admin_documents IS 'Documentos administrativos da empresa - políticas, manuais, certificados';
COMMENT ON TABLE time_entries IS 'Registros de ponto dos funcionários - entrada, saída, horas trabalhadas';
COMMENT ON TABLE time_validations IS 'Validações e aprovações dos registros de ponto pelos supervisores';
COMMENT ON TABLE system_settings IS 'Configurações do sistema - parâmetros e preferências';
COMMENT ON TABLE admin_reports IS 'Configurações e templates de relatórios administrativos';
COMMENT ON TABLE audit_logs IS 'Logs de auditoria - registro de todas as ações no sistema';

-- =====================================================
-- DADOS INICIAIS DE EXEMPLO
-- =====================================================

-- Configurações iniciais do sistema
INSERT INTO system_settings (categoria, chave, valor, tipo_valor, descricao, grupo_configuracao) VALUES
('ponto', 'horario_entrada_padrao', '"08:00"', 'string', 'Horário padrão de entrada dos funcionários', 'Controle de Ponto'),
('ponto', 'horario_saida_padrao', '"18:00"', 'string', 'Horário padrão de saída dos funcionários', 'Controle de Ponto'),
('ponto', 'tolerancia_atraso_minutos', '15', 'number', 'Tolerância em minutos para atrasos', 'Controle de Ponto'),
('ponto', 'horas_semanais_padrao', '40', 'number', 'Carga horária semanal padrão', 'Controle de Ponto'),
('documentos', 'tamanho_maximo_mb', '50', 'number', 'Tamanho máximo para upload de documentos em MB', 'Documentos'),
('documentos', 'tipos_permitidos', '["pdf", "doc", "docx", "jpg", "png"]', 'array', 'Tipos de arquivo permitidos para upload', 'Documentos'),
('sistema', 'nome_empresa', '"MedStaff"', 'string', 'Nome da empresa', 'Geral'),
('sistema', 'timezone', '"America/Sao_Paulo"', 'string', 'Fuso horário do sistema', 'Geral'),
('relatorios', 'formato_padrao', '"pdf"', 'string', 'Formato padrão para geração de relatórios', 'Relatórios'),
('auditoria', 'retencao_logs_dias', '365', 'number', 'Período de retenção dos logs de auditoria em dias', 'Auditoria');