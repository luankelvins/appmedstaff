-- =====================================================
-- TABELAS ADMINISTRATIVAS
-- =====================================================

-- Documentos administrativos
CREATE TABLE IF NOT EXISTS admin_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('politica', 'procedimento', 'manual', 'formulario', 'contrato_modelo', 'outros')),
  categoria TEXT NOT NULL,
  descricao TEXT,
  arquivo_url TEXT,
  arquivo_nome TEXT,
  arquivo_tamanho INTEGER,
  versao TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'arquivado')),
  tags TEXT[],
  criado_por UUID,
  aprovado_por UUID,
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  data_validade TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registros de ponto
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  data_ponto DATE NOT NULL,
  hora_entrada TIME,
  hora_saida TIME,
  hora_almoco_saida TIME,
  hora_almoco_retorno TIME,
  horas_trabalhadas INTERVAL,
  horas_extras INTERVAL,
  observacoes TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  aprovado_por UUID REFERENCES employees(id),
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Validações de ponto
CREATE TABLE IF NOT EXISTS time_validations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  time_entry_id UUID REFERENCES time_entries(id) ON DELETE CASCADE,
  validador_id UUID REFERENCES employees(id),
  status TEXT NOT NULL CHECK (status IN ('aprovado', 'rejeitado', 'pendente')),
  motivo_rejeicao TEXT,
  data_validacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  categoria TEXT NOT NULL,
  chave TEXT NOT NULL,
  valor TEXT NOT NULL,
  tipo_valor TEXT DEFAULT 'string' CHECK (tipo_valor IN ('string', 'number', 'boolean', 'json')),
  descricao TEXT,
  grupo_configuracao TEXT,
  editavel BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(categoria, chave)
);

-- Relatórios administrativos
CREATE TABLE IF NOT EXISTS admin_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo_relatorio TEXT NOT NULL CHECK (tipo_relatorio IN ('ponto', 'financeiro', 'vendas', 'clientes', 'tarefas', 'personalizado')),
  descricao TEXT,
  configuracao JSONB NOT NULL DEFAULT '{}'::jsonb,
  agendamento JSONB DEFAULT '{}'::jsonb,
  destinatarios TEXT[],
  formato TEXT DEFAULT 'pdf' CHECK (formato IN ('pdf', 'excel', 'csv')),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  criado_por UUID,
  ultima_execucao TIMESTAMP WITH TIME ZONE,
  proxima_execucao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  acao TEXT NOT NULL,
  tabela TEXT NOT NULL,
  registro_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);