-- =====================================================
-- EXTENSÕES NECESSÁRIAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- FUNÇÃO PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de funcionários (substitui profiles)
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  dados_pessoais JSONB NOT NULL DEFAULT '{}'::jsonb,
  dados_profissionais JSONB NOT NULL DEFAULT '{}'::jsonb,
  dados_financeiros JSONB DEFAULT '{}'::jsonb,
  role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'admin', 'superadmin', 'manager', 'supervisor')),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'afastado', 'desligado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  created_by UUID,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  empresa TEXT,
  cargo TEXT,
  cidade TEXT,
  estado TEXT,
  produtos_interesse TEXT[],
  origem TEXT NOT NULL CHECK (origem IN ('site', 'indicacao', 'evento', 'redes_sociais', 'google', 'time_interno', 'outros')),
  origem_detalhes TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'qualificado', 'proposta', 'negociacao', 'ganho', 'perdido')),
  responsavel UUID,
  data_contato TIMESTAMP WITH TIME ZONE,
  proxima_acao TEXT,
  data_proxima_acao TIMESTAMP WITH TIME ZONE,
  criado_por UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes PF
CREATE TABLE IF NOT EXISTS clientes_pf (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dados_pessoais JSONB NOT NULL DEFAULT '{}'::jsonb,
  endereco JSONB NOT NULL DEFAULT '{}'::jsonb,
  contato JSONB NOT NULL DEFAULT '{}'::jsonb,
  informacoes_profissionais JSONB DEFAULT '{}'::jsonb,
  documentos JSONB DEFAULT '[]'::jsonb,
  contratos JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'cancelado')),
  observacoes TEXT,
  responsavel UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes PJ
CREATE TABLE IF NOT EXISTS clientes_pj (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT UNIQUE NOT NULL,
  inscricao_estadual TEXT,
  inscricao_municipal TEXT,
  endereco JSONB NOT NULL DEFAULT '{}'::jsonb,
  contato JSONB NOT NULL DEFAULT '{}'::jsonb,
  representante_legal JSONB NOT NULL DEFAULT '{}'::jsonb,
  informacoes_societarias JSONB NOT NULL DEFAULT '{}'::jsonb,
  certificado_digital JSONB DEFAULT '{}'::jsonb,
  contratos JSONB DEFAULT '[]'::jsonb,
  documentos JSONB DEFAULT '[]'::jsonb,
  vinculos JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'cancelado')),
  observacoes TEXT,
  responsavel UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contratos
CREATE TABLE IF NOT EXISTS contratos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero_contrato TEXT UNIQUE NOT NULL,
  tipo_contrato TEXT NOT NULL CHECK (tipo_contrato IN ('pf', 'pj')),
  cliente_id UUID NOT NULL,
  cliente_nome TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  renovacao_automatica BOOLEAN DEFAULT false,
  servicos_contratados JSONB NOT NULL DEFAULT '{}'::jsonb,
  condicoes_comerciais JSONB NOT NULL DEFAULT '{}'::jsonb,
  clausulas_juridicas TEXT,
  documentos JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativo', 'suspenso', 'encerrado')),
  versao INTEGER DEFAULT 1,
  responsavel_comercial UUID,
  responsavel_juridico UUID,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de declarações IRPF
CREATE TABLE IF NOT EXISTS irpf (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes_pf(id) ON DELETE CASCADE,
  ano_exercicio INTEGER NOT NULL,
  dados_pessoais JSONB NOT NULL DEFAULT '{}'::jsonb,
  dependentes JSONB DEFAULT '[]'::jsonb,
  informes_rendimentos JSONB DEFAULT '[]'::jsonb,
  bens_direitos JSONB DEFAULT '[]'::jsonb,
  dividas_onus JSONB DEFAULT '[]'::jsonb,
  pagamentos_efetuados JSONB DEFAULT '{}'::jsonb,
  conta_restituicao JSONB DEFAULT '{}'::jsonb,
  documentos JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_analise', 'entregue')),
  responsavel UUID,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);