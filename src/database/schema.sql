-- Schema do banco de dados para MedStaff
-- Execute este script no Supabase SQL Editor

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  name TEXT,
  position TEXT,
  department TEXT,
  employee_id TEXT,
  phone TEXT,
  hire_date DATE,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de membros do time interno
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  dados_pessoais JSONB NOT NULL,
  dados_profissionais JSONB NOT NULL,
  dados_financeiros JSONB,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'afastado', 'desligado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
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
  responsavel UUID REFERENCES auth.users(id),
  data_contato TIMESTAMP WITH TIME ZONE,
  proxima_acao TEXT,
  data_proxima_acao TIMESTAMP WITH TIME ZONE,
  criado_por UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes PF
CREATE TABLE IF NOT EXISTS clientes_pf (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dados_pessoais JSONB NOT NULL,
  endereco JSONB NOT NULL,
  contato JSONB NOT NULL,
  informacoes_profissionais JSONB,
  documentos JSONB DEFAULT '[]'::jsonb,
  contratos JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'cancelado')),
  observacoes TEXT,
  responsavel UUID REFERENCES auth.users(id),
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
  endereco JSONB NOT NULL,
  contato JSONB NOT NULL,
  representante_legal JSONB NOT NULL,
  informacoes_societarias JSONB NOT NULL,
  certificado_digital JSONB,
  contratos JSONB DEFAULT '[]'::jsonb,
  documentos JSONB DEFAULT '[]'::jsonb,
  vinculos JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'cancelado')),
  observacoes TEXT,
  responsavel UUID REFERENCES auth.users(id),
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
  servicos_contratados JSONB NOT NULL,
  condicoes_comerciais JSONB NOT NULL,
  clausulas_juridicas TEXT,
  documentos JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativo', 'suspenso', 'encerrado')),
  versao INTEGER DEFAULT 1,
  responsavel_comercial UUID REFERENCES auth.users(id),
  responsavel_juridico UUID REFERENCES auth.users(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de declarações IRPF
CREATE TABLE IF NOT EXISTS irpf (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes_pf(id) ON DELETE CASCADE,
  ano_exercicio INTEGER NOT NULL,
  dados_pessoais JSONB NOT NULL,
  dependentes JSONB DEFAULT '[]'::jsonb,
  informes_rendimentos JSONB DEFAULT '[]'::jsonb,
  bens_direitos JSONB DEFAULT '[]'::jsonb,
  dividas_onus JSONB DEFAULT '[]'::jsonb,
  pagamentos_efetuados JSONB DEFAULT '{}'::jsonb,
  conta_restituicao JSONB,
  documentos JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_analise', 'entregue')),
  responsavel UUID REFERENCES auth.users(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_responsavel ON leads(responsavel);
CREATE INDEX IF NOT EXISTS idx_clientes_pf_status ON clientes_pf(status);
CREATE INDEX IF NOT EXISTS idx_clientes_pj_cnpj ON clientes_pj(cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_pj_status ON clientes_pj(status);
CREATE INDEX IF NOT EXISTS idx_contratos_numero ON contratos(numero_contrato);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON contratos(status);
CREATE INDEX IF NOT EXISTS idx_irpf_ano_exercicio ON irpf(ano_exercicio);
CREATE INDEX IF NOT EXISTS idx_irpf_status ON irpf(status);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_pf_updated_at BEFORE UPDATE ON clientes_pf FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_pj_updated_at BEFORE UPDATE ON clientes_pj FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON contratos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_irpf_updated_at BEFORE UPDATE ON irpf FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_pf ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_pj ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE irpf ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (podem ser refinadas conforme necessário)
-- Profiles: usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Employees: apenas usuários autenticados podem visualizar
CREATE POLICY "Authenticated users can view employees" ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert employees" ON employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update employees" ON employees FOR UPDATE TO authenticated USING (true);

-- Tasks: usuários podem ver tarefas atribuídas a eles ou criadas por eles
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_to OR auth.uid() = created_by);
CREATE POLICY "Users can create tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assigned_to OR auth.uid() = created_by);

-- Leads: usuários autenticados podem visualizar e gerenciar leads
CREATE POLICY "Authenticated users can view leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert leads" ON leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update leads" ON leads FOR UPDATE TO authenticated USING (true);

-- Clientes: usuários autenticados podem visualizar e gerenciar clientes
CREATE POLICY "Authenticated users can view clientes_pf" ON clientes_pf FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clientes_pf" ON clientes_pf FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clientes_pf" ON clientes_pf FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view clientes_pj" ON clientes_pj FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clientes_pj" ON clientes_pj FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clientes_pj" ON clientes_pj FOR UPDATE TO authenticated USING (true);

-- Contratos: usuários autenticados podem visualizar e gerenciar contratos
CREATE POLICY "Authenticated users can view contratos" ON contratos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contratos" ON contratos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update contratos" ON contratos FOR UPDATE TO authenticated USING (true);

-- IRPF: usuários autenticados podem visualizar e gerenciar declarações
CREATE POLICY "Authenticated users can view irpf" ON irpf FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert irpf" ON irpf FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update irpf" ON irpf FOR UPDATE TO authenticated USING (true);

-- Função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();