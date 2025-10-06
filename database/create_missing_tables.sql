-- Script para criar todas as tabelas faltantes no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela de Clientes Pessoa Física
CREATE TABLE IF NOT EXISTS clientes_pf (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_cliente TEXT UNIQUE,
  
  -- Dados pessoais
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  rg TEXT,
  data_nascimento DATE,
  estado_civil TEXT CHECK (estado_civil IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')),
  profissao TEXT,
  
  -- Endereço
  endereco JSONB NOT NULL DEFAULT '{}',
  
  -- Contato
  telefone TEXT,
  email TEXT,
  contato_emergencia JSONB,
  
  -- Dados profissionais
  dados_profissionais JSONB DEFAULT '{}',
  
  -- Cônjuge
  conjuge JSONB,
  
  -- Dependentes
  dependentes JSONB DEFAULT '[]',
  
  -- Dados financeiros
  dados_financeiros JSONB DEFAULT '{}',
  
  -- Serviços contratados
  servicos_contratados JSONB DEFAULT '[]',
  
  -- Documentos
  documentos JSONB DEFAULT '[]',
  
  -- Atendimentos
  atendimentos JSONB DEFAULT '[]',
  
  -- Preferências de contato
  preferencias_contato JSONB DEFAULT '{}',
  
  -- Controle
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
  responsavel_comercial TEXT,
  responsavel_operacional TEXT,
  data_cadastro TIMESTAMPTZ DEFAULT NOW(),
  data_ultima_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  observacoes TEXT,
  
  -- Comentários
  comments JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 2. Tabela de Clientes Pessoa Jurídica
CREATE TABLE IF NOT EXISTS clientes_pj (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_cliente TEXT UNIQUE,
  
  -- Dados da empresa
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT NOT NULL UNIQUE,
  inscricao_estadual TEXT,
  inscricao_municipal TEXT,
  
  -- Endereço
  endereco JSONB NOT NULL DEFAULT '{}',
  
  -- Contato
  contato JSONB NOT NULL DEFAULT '{}',
  
  -- Representante legal
  representante_legal JSONB NOT NULL DEFAULT '{}',
  
  -- Informações societárias
  informacoes_societarias JSONB NOT NULL DEFAULT '{}',
  
  -- Certificado digital
  certificado_digital JSONB,
  
  -- Contratos
  contratos JSONB DEFAULT '[]',
  
  -- Documentos
  documentos JSONB DEFAULT '[]',
  
  -- Vínculos
  vinculos JSONB DEFAULT '{"clientes_pf": [], "tomadores_servico": []}',
  
  -- Controle
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'cancelado')),
  data_cadastro TIMESTAMPTZ DEFAULT NOW(),
  data_ultima_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 3. Tabela de Contratos
CREATE TABLE IF NOT EXISTS contratos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_contrato TEXT NOT NULL UNIQUE,
  tipo_contrato TEXT NOT NULL CHECK (tipo_contrato IN ('pf', 'pj')),
  
  -- Referências aos clientes
  cliente_pj_id UUID REFERENCES clientes_pj(id),
  cliente_pf_id UUID REFERENCES clientes_pf(id),
  cliente_nome TEXT NOT NULL,
  
  -- Validade
  data_inicio DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  renovacao_automatica BOOLEAN DEFAULT false,
  
  -- Serviços contratados
  servicos_contratados JSONB NOT NULL DEFAULT '[]',
  
  -- Condições comerciais
  condicoes_comerciais JSONB NOT NULL DEFAULT '{}',
  
  -- Cláusulas jurídicas
  clausulas_juridicas TEXT,
  
  -- Documentos
  documentos JSONB DEFAULT '[]',
  
  -- Controle
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativo', 'suspenso', 'encerrado')),
  versao INTEGER DEFAULT 1,
  responsavel_comercial TEXT NOT NULL,
  responsavel_juridico TEXT,
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Constraint para garantir que pelo menos um cliente seja referenciado
  CONSTRAINT check_cliente CHECK (
    (cliente_pj_id IS NOT NULL AND cliente_pf_id IS NULL) OR
    (cliente_pj_id IS NULL AND cliente_pf_id IS NOT NULL)
  )
);

-- 4. Tabela de Documentos
CREATE TABLE IF NOT EXISTS documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  categoria TEXT CHECK (categoria IN ('contrato', 'documento_pessoal', 'certificado', 'fiscal', 'outros')),
  
  -- Referências polimórficas
  entidade_tipo TEXT NOT NULL CHECK (entidade_tipo IN ('cliente_pj', 'cliente_pf', 'contrato', 'irpf', 'servico_especial', 'employee', 'pipeline')),
  entidade_id UUID NOT NULL,
  
  -- Arquivo
  arquivo_url TEXT,
  arquivo_nome TEXT,
  arquivo_tamanho INTEGER,
  arquivo_tipo TEXT,
  
  -- Metadados
  descricao TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Controle
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'validated', 'rejected')),
  data_upload TIMESTAMPTZ DEFAULT NOW(),
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 5. Tabela de Declarações IRPF
CREATE TABLE IF NOT EXISTS declaracoes_irpf (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_pf_id UUID NOT NULL REFERENCES clientes_pf(id),
  ano_exercicio INTEGER NOT NULL,
  
  -- Dados pessoais (cópia para facilitar consultas)
  dados_pessoais JSONB NOT NULL DEFAULT '{}',
  
  -- Dependentes
  dependentes JSONB DEFAULT '[]',
  
  -- Informes de rendimentos
  informes_rendimentos JSONB DEFAULT '[]',
  
  -- Bens e direitos
  bens_e_direitos JSONB DEFAULT '[]',
  
  -- Dívidas e ônus
  dividas_e_onus JSONB DEFAULT '[]',
  
  -- Pagamentos efetuados
  pagamentos_efetuados JSONB DEFAULT '{}',
  
  -- Conta para restituição
  conta_restituicao JSONB,
  
  -- Documentos
  documentos JSONB DEFAULT '[]',
  
  -- Controle
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_analise', 'entregue')),
  responsavel TEXT NOT NULL,
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Constraint para unicidade por cliente e ano
  UNIQUE(cliente_pf_id, ano_exercicio)
);

-- 6. Tabela de Serviços Especiais
CREATE TABLE IF NOT EXISTS servicos_especiais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_servico TEXT NOT NULL CHECK (tipo_servico IN ('auxilio_moradia', 'recuperacao_tributaria_pj', 'restituicao_previdenciaria_pf', 'alteracao_pj')),
  
  -- Cliente
  cliente_id TEXT NOT NULL,
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT,
  cliente_telefone TEXT,
  
  -- Dados específicos do serviço
  dados_especificos JSONB DEFAULT '{}',
  
  -- Documentos
  documentos JSONB DEFAULT '[]',
  
  -- Controle
  status TEXT DEFAULT 'iniciado' CHECK (status IN ('iniciado', 'documentacao', 'analise', 'execucao', 'concluido')),
  responsavel_comercial TEXT NOT NULL,
  responsavel_operacional TEXT,
  data_inicio DATE NOT NULL,
  previsao_conclusao DATE,
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 7. Tabela de Pipelines (já existe, mas vamos expandir)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estado TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS produtos_interesse JSONB DEFAULT '[]';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS origem TEXT DEFAULT 'site';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS origem_detalhes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS responsavel TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS data_contato DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS proxima_acao TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS data_proxima_acao DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS criado_por TEXT;

-- Criar tabela de pipelines se não existir
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('captacao', 'proposta', 'contrato', 'execucao')),
  
  -- Referências
  lead_id UUID REFERENCES leads(id),
  cliente_id TEXT,
  nome_cliente TEXT NOT NULL,
  email_cliente TEXT NOT NULL,
  telefone_cliente TEXT NOT NULL,
  
  -- Serviços de interesse
  servicos_interesse JSONB DEFAULT '[]',
  
  -- Estágio
  estagio TEXT NOT NULL CHECK (estagio IN ('captacao', 'qualificacao', 'proposta', 'negociacao', 'fechamento', 'execucao', 'encerramento')),
  
  -- Proposta comercial
  proposta_comercial JSONB,
  
  -- Ações
  proxima_acao TEXT NOT NULL,
  data_proxima_acao DATE NOT NULL,
  responsavel TEXT NOT NULL,
  
  -- Histórico
  historico JSONB DEFAULT '[]',
  
  -- Controle
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'ganho', 'perdido')),
  motivo_perdido TEXT,
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_pf_cpf ON clientes_pf(cpf);
CREATE INDEX IF NOT EXISTS idx_clientes_pf_nome ON clientes_pf(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_pf_status ON clientes_pf(status);
CREATE INDEX IF NOT EXISTS idx_clientes_pf_numero_cliente ON clientes_pf(numero_cliente);

CREATE INDEX IF NOT EXISTS idx_clientes_pj_cnpj ON clientes_pj(cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_pj_razao_social ON clientes_pj(razao_social);
CREATE INDEX IF NOT EXISTS idx_clientes_pj_status ON clientes_pj(status);
CREATE INDEX IF NOT EXISTS idx_clientes_pj_numero_cliente ON clientes_pj(numero_cliente);

CREATE INDEX IF NOT EXISTS idx_contratos_numero ON contratos(numero_contrato);
CREATE INDEX IF NOT EXISTS idx_contratos_cliente_pj ON contratos(cliente_pj_id);
CREATE INDEX IF NOT EXISTS idx_contratos_cliente_pf ON contratos(cliente_pf_id);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON contratos(status);

CREATE INDEX IF NOT EXISTS idx_documentos_entidade ON documentos(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_documentos_status ON documentos(status);
CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos(categoria);

CREATE INDEX IF NOT EXISTS idx_irpf_cliente ON declaracoes_irpf(cliente_pf_id);
CREATE INDEX IF NOT EXISTS idx_irpf_ano ON declaracoes_irpf(ano_exercicio);
CREATE INDEX IF NOT EXISTS idx_irpf_status ON declaracoes_irpf(status);

CREATE INDEX IF NOT EXISTS idx_servicos_tipo ON servicos_especiais(tipo_servico);
CREATE INDEX IF NOT EXISTS idx_servicos_status ON servicos_especiais(status);
CREATE INDEX IF NOT EXISTS idx_servicos_cliente ON servicos_especiais(cliente_id);

CREATE INDEX IF NOT EXISTS idx_pipelines_lead ON pipelines(lead_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_estagio ON pipelines(estagio);
CREATE INDEX IF NOT EXISTS idx_pipelines_status ON pipelines(status);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clientes_pf_updated_at BEFORE UPDATE ON clientes_pf
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_pj_updated_at BEFORE UPDATE ON clientes_pj
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON contratos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_declaracoes_irpf_updated_at BEFORE UPDATE ON declaracoes_irpf
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_especiais_updated_at BEFORE UPDATE ON servicos_especiais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON pipelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE clientes_pf ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_pj ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE declaracoes_irpf ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos_especiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

-- Políticas para CLIENTES_PF
CREATE POLICY "Users can view clientes_pf" ON clientes_pf
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert clientes_pf" ON clientes_pf
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update clientes_pf" ON clientes_pf
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para CLIENTES_PJ
CREATE POLICY "Users can view clientes_pj" ON clientes_pj
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert clientes_pj" ON clientes_pj
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update clientes_pj" ON clientes_pj
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para CONTRATOS
CREATE POLICY "Users can view contratos" ON contratos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert contratos" ON contratos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update contratos" ON contratos
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para DOCUMENTOS
CREATE POLICY "Users can view documentos" ON documentos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert documentos" ON documentos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update documentos" ON documentos
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para DECLARACOES_IRPF
CREATE POLICY "Users can view declaracoes_irpf" ON declaracoes_irpf
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert declaracoes_irpf" ON declaracoes_irpf
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update declaracoes_irpf" ON declaracoes_irpf
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para SERVICOS_ESPECIAIS
CREATE POLICY "Users can view servicos_especiais" ON servicos_especiais
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert servicos_especiais" ON servicos_especiais
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update servicos_especiais" ON servicos_especiais
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para PIPELINES
CREATE POLICY "Users can view pipelines" ON pipelines
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert pipelines" ON pipelines
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update pipelines" ON pipelines
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE clientes_pf IS 'Clientes pessoa física do sistema';
COMMENT ON TABLE clientes_pj IS 'Clientes pessoa jurídica do sistema';
COMMENT ON TABLE contratos IS 'Contratos comerciais com clientes';
COMMENT ON TABLE documentos IS 'Documentos anexados às entidades';
COMMENT ON TABLE declaracoes_irpf IS 'Declarações de imposto de renda pessoa física';
COMMENT ON TABLE servicos_especiais IS 'Serviços especiais oferecidos';
COMMENT ON TABLE pipelines IS 'Pipeline comercial de vendas';
