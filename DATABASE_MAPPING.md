# Mapeamento de Formulários CRM para Banco de Dados

## Tabelas Existentes

### 1. profiles
- **Uso**: Perfis de usuários do sistema
- **Campos**: id, email, name, position, department, employee_id, phone, hire_date, avatar_url, created_at, updated_at
- **Status**: ✅ Adequada

### 2. employees  
- **Uso**: Membros do Time Interno
- **Campos**: id, email, dados_pessoais (jsonb), dados_profissionais (jsonb), dados_financeiros (jsonb), status, created_at, updated_at
- **Status**: ✅ Adequada para TimeInternoForm

### 3. tasks
- **Uso**: Tarefas do sistema
- **Campos**: id, title, description, status, priority, assigned_to, created_by, due_date, completed_at, created_at, updated_at
- **Status**: ✅ Adequada

### 4. leads
- **Uso**: Leads básicos
- **Campos**: id, name, email, phone, company, status, stage, assigned_to, source, value, notes, created_at, updated_at
- **Status**: ⚠️ Precisa expansão para LeadForm completo

## Tabelas Necessárias (Novas)

### 1. clientes_pj (Cliente Pessoa Jurídica)
**Formulário**: ClientePJForm
```sql
CREATE TABLE clientes_pj (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT NOT NULL UNIQUE,
  inscricao_estadual TEXT,
  inscricao_municipal TEXT,
  
  -- Endereço (JSONB)
  endereco JSONB NOT NULL,
  
  -- Contato (JSONB)
  contato JSONB NOT NULL,
  
  -- Representante Legal (JSONB)
  representante_legal JSONB NOT NULL,
  
  -- Informações Societárias (JSONB)
  informacoes_societarias JSONB NOT NULL,
  
  -- Certificado Digital (JSONB)
  certificado_digital JSONB,
  
  -- Vínculos (JSONB)
  vinculos JSONB DEFAULT '{"clientes_pf": [], "tomadores_servico": []}'::jsonb,
  
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'cancelado')),
  observacoes TEXT,
  data_cadastro TIMESTAMPTZ DEFAULT NOW(),
  data_ultima_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. clientes_pf (Cliente Pessoa Física)
**Formulário**: IRPFForm (dados pessoais)
```sql
CREATE TABLE clientes_pf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  data_nascimento DATE,
  telefone TEXT,
  email TEXT,
  
  -- Endereço (JSONB)
  endereco JSONB,
  
  -- Conta para restituição (JSONB)
  conta_restituicao JSONB,
  
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. contratos
**Formulário**: ContratoForm
```sql
CREATE TABLE contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  
  -- Serviços contratados (JSONB Array)
  servicos_contratados JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Condições comerciais (JSONB)
  condicoes_comerciais JSONB NOT NULL,
  
  -- Cláusulas jurídicas
  clausulas_juridicas TEXT,
  
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativo', 'suspenso', 'encerrado')),
  versao INTEGER DEFAULT 1,
  responsavel_comercial TEXT NOT NULL,
  responsavel_juridico TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint para garantir que pelo menos um cliente seja referenciado
  CONSTRAINT check_cliente CHECK (
    (cliente_pj_id IS NOT NULL AND cliente_pf_id IS NULL) OR
    (cliente_pj_id IS NULL AND cliente_pf_id IS NOT NULL)
  )
);
```

### 4. documentos
**Uso**: Documentos anexados aos formulários
```sql
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'validated', 'rejected')),
  data_upload TIMESTAMPTZ DEFAULT NOW(),
  observacoes TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. declaracoes_irpf
**Formulário**: IRPFForm
```sql
CREATE TABLE declaracoes_irpf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_pf_id UUID NOT NULL REFERENCES clientes_pf(id),
  ano_exercicio INTEGER NOT NULL,
  
  -- Dependentes (JSONB Array)
  dependentes JSONB DEFAULT '[]'::jsonb,
  
  -- Informes de rendimentos (JSONB Array)
  informes_rendimentos JSONB DEFAULT '[]'::jsonb,
  
  -- Bens e direitos (JSONB Array)
  bens_e_direitos JSONB DEFAULT '[]'::jsonb,
  
  -- Dívidas e ônus (JSONB Array)
  dividas_e_onus JSONB DEFAULT '[]'::jsonb,
  
  -- Pagamentos efetuados (JSONB)
  pagamentos_efetuados JSONB DEFAULT '{}'::jsonb,
  
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_analise', 'entregue')),
  responsavel TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint para unicidade por cliente e ano
  UNIQUE(cliente_pf_id, ano_exercicio)
);
```

### 6. servicos_especiais
**Formulário**: ServicoEspecialForm
```sql
CREATE TABLE servicos_especiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_servico TEXT NOT NULL CHECK (tipo_servico IN ('auxilio_moradia', 'recuperacao_tributaria_pj', 'restituicao_previdenciaria_pf', 'alteracao_pj')),
  
  -- Cliente
  cliente_id TEXT NOT NULL,
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT,
  cliente_telefone TEXT,
  
  -- Dados específicos do serviço (JSONB)
  dados_especificos JSONB DEFAULT '{}'::jsonb,
  
  status TEXT DEFAULT 'iniciado' CHECK (status IN ('iniciado', 'documentacao', 'analise', 'execucao', 'concluido')),
  responsavel_comercial TEXT NOT NULL,
  responsavel_operacional TEXT,
  data_inicio DATE NOT NULL,
  previsao_conclusao DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. pipelines
**Formulário**: PipelineForm
```sql
CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('captacao', 'proposta', 'contrato', 'execucao')),
  
  -- Referências
  lead_id UUID REFERENCES leads(id),
  cliente_id TEXT,
  nome_cliente TEXT NOT NULL,
  email_cliente TEXT NOT NULL,
  telefone_cliente TEXT NOT NULL,
  
  -- Serviços de interesse (JSONB Array)
  servicos_interesse JSONB DEFAULT '[]'::jsonb,
  
  -- Estágio
  estagio TEXT NOT NULL CHECK (estagio IN ('captacao', 'qualificacao', 'proposta', 'negociacao', 'fechamento', 'execucao', 'encerramento')),
  
  -- Proposta comercial (JSONB)
  proposta_comercial JSONB,
  
  -- Ações
  proxima_acao TEXT NOT NULL,
  data_proxima_acao DATE NOT NULL,
  responsavel TEXT NOT NULL,
  
  -- Histórico (JSONB Array)
  historico JSONB DEFAULT '[]'::jsonb,
  
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'ganho', 'perdido')),
  motivo_perdido TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Expansões Necessárias

### leads (Expansão)
Adicionar campos para suportar LeadForm completo:
```sql
ALTER TABLE leads ADD COLUMN cargo TEXT;
ALTER TABLE leads ADD COLUMN cidade TEXT;
ALTER TABLE leads ADD COLUMN estado TEXT;
ALTER TABLE leads ADD COLUMN produtos_interesse JSONB DEFAULT '[]'::jsonb;
ALTER TABLE leads ADD COLUMN origem TEXT DEFAULT 'site';
ALTER TABLE leads ADD COLUMN origem_detalhes TEXT;
ALTER TABLE leads ADD COLUMN responsavel TEXT;
ALTER TABLE leads ADD COLUMN data_contato DATE;
ALTER TABLE leads ADD COLUMN proxima_acao TEXT;
ALTER TABLE leads ADD COLUMN data_proxima_acao DATE;
ALTER TABLE leads ADD COLUMN criado_por TEXT;
```

## Índices Recomendados

```sql
-- clientes_pj
CREATE INDEX idx_clientes_pj_cnpj ON clientes_pj(cnpj);
CREATE INDEX idx_clientes_pj_status ON clientes_pj(status);
CREATE INDEX idx_clientes_pj_razao_social ON clientes_pj(razao_social);

-- clientes_pf  
CREATE INDEX idx_clientes_pf_cpf ON clientes_pf(cpf);
CREATE INDEX idx_clientes_pf_nome ON clientes_pf(nome);

-- contratos
CREATE INDEX idx_contratos_numero ON contratos(numero_contrato);
CREATE INDEX idx_contratos_cliente_pj ON contratos(cliente_pj_id);
CREATE INDEX idx_contratos_cliente_pf ON contratos(cliente_pf_id);
CREATE INDEX idx_contratos_status ON contratos(status);

-- documentos
CREATE INDEX idx_documentos_entidade ON documentos(entidade_tipo, entidade_id);
CREATE INDEX idx_documentos_status ON documentos(status);

-- declaracoes_irpf
CREATE INDEX idx_irpf_cliente ON declaracoes_irpf(cliente_pf_id);
CREATE INDEX idx_irpf_ano ON declaracoes_irpf(ano_exercicio);

-- servicos_especiais
CREATE INDEX idx_servicos_tipo ON servicos_especiais(tipo_servico);
CREATE INDEX idx_servicos_status ON servicos_especiais(status);

-- pipelines
CREATE INDEX idx_pipelines_lead ON pipelines(lead_id);
CREATE INDEX idx_pipelines_estagio ON pipelines(estagio);
CREATE INDEX idx_pipelines_status ON pipelines(status);
```

## Próximos Passos

1. ✅ Análise completa dos formulários
2. ✅ Mapeamento do esquema atual vs necessário
3. 🔄 Criar tabelas ausentes
4. 🔄 Expandir tabela leads
5. 🔄 Criar relacionamentos (foreign keys)
6. 🔄 Configurar políticas RLS
7. 🔄 Criar índices para performance
8. 🔄 Testar com dados de exemplo