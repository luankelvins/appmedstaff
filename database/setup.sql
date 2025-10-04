-- Script de configuração das tabelas para o MedStaff no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  employee_id TEXT,
  phone TEXT,
  hire_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de funcionários (dados completos)
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  dados_pessoais JSONB NOT NULL,
  dados_profissionais JSONB NOT NULL,
  dados_financeiros JSONB,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pendente',
  priority TEXT DEFAULT 'media',
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'novo',
  stage TEXT DEFAULT 'prospeccao',
  assigned_to UUID REFERENCES profiles(id),
  source TEXT,
  value DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND (position ILIKE '%admin%' OR position ILIKE '%gerente%' OR position ILIKE '%diretor%')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para PROFILES
-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (is_admin(auth.uid()));

-- Admins podem inserir novos perfis
CREATE POLICY "Admins can insert profiles" ON profiles
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Políticas para EMPLOYEES
-- Usuários autenticados podem ver funcionários (dados básicos)
CREATE POLICY "Authenticated users can view employees" ON employees
    FOR SELECT USING (auth.role() = 'authenticated');

-- Apenas admins podem inserir funcionários
CREATE POLICY "Admins can insert employees" ON employees
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Apenas admins podem atualizar funcionários
CREATE POLICY "Admins can update employees" ON employees
    FOR UPDATE USING (is_admin(auth.uid()));

-- Apenas admins podem deletar funcionários
CREATE POLICY "Admins can delete employees" ON employees
    FOR DELETE USING (is_admin(auth.uid()));

-- Políticas para TASKS
-- Usuários podem ver tarefas atribuídas a eles, criadas por eles, ou se forem admins
CREATE POLICY "Users can view relevant tasks" ON tasks
    FOR SELECT USING (
        auth.uid() = assigned_to OR 
        auth.uid() = created_by OR
        is_admin(auth.uid())
    );

-- Usuários autenticados podem criar tarefas
CREATE POLICY "Authenticated users can create tasks" ON tasks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Usuários podem atualizar tarefas atribuídas a eles, criadas por eles, ou se forem admins
CREATE POLICY "Users can update relevant tasks" ON tasks
    FOR UPDATE USING (
        auth.uid() = assigned_to OR 
        auth.uid() = created_by OR
        is_admin(auth.uid())
    );

-- Apenas criadores ou admins podem deletar tarefas
CREATE POLICY "Creators and admins can delete tasks" ON tasks
    FOR DELETE USING (
        auth.uid() = created_by OR
        is_admin(auth.uid())
    );

-- Políticas para LEADS
-- Usuários podem ver leads atribuídos a eles ou se forem admins
CREATE POLICY "Users can view relevant leads" ON leads
    FOR SELECT USING (
        auth.uid() = assigned_to OR
        is_admin(auth.uid()) OR
        auth.role() = 'authenticated'
    );

-- Usuários autenticados podem inserir leads
CREATE POLICY "Authenticated users can insert leads" ON leads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Usuários podem atualizar leads atribuídos a eles ou se forem admins
CREATE POLICY "Users can update relevant leads" ON leads
    FOR UPDATE USING (
        auth.uid() = assigned_to OR
        is_admin(auth.uid())
    );

-- Apenas admins podem deletar leads
CREATE POLICY "Admins can delete leads" ON leads
    FOR DELETE USING (is_admin(auth.uid()));

-- Função para inicializar dados de exemplo
CREATE OR REPLACE FUNCTION initialize_sample_data()
RETURNS void AS $$
BEGIN
    -- Verificar se já existem dados
    IF (SELECT COUNT(*) FROM employees) = 0 THEN
        -- Inserir funcionários de exemplo
        INSERT INTO employees (email, dados_pessoais, dados_profissionais, dados_financeiros, status) VALUES
        ('joao.silva@medstaff.com', 
         '{"nome": "João Silva", "cpf": "123.456.789-00", "telefone": "(11) 99999-1111", "emailPessoal": "joao.silva@medstaff.com", "endereco": {"rua": "Rua das Flores, 123", "cidade": "São Paulo", "cep": "01234-567"}, "dataNascimento": "1990-05-15"}',
         '{"cargo": "Desenvolvedor Senior", "departamento": "Tecnologia", "dataAdmissao": "2023-01-15", "numeroRegistro": "EMP001", "supervisor": "Carlos Mendes", "horarioTrabalho": "09:00-18:00"}',
         '{"salario": 8000, "beneficios": ["Vale Refeição", "Plano de Saúde", "Vale Transporte"], "contaBancaria": {"banco": "Banco do Brasil", "agencia": "1234", "conta": "56789-0"}}',
         'ativo'),
        ('maria.santos@medstaff.com',
         '{"nome": "Maria Santos", "cpf": "987.654.321-00", "telefone": "(11) 99999-2222", "emailPessoal": "maria.santos@medstaff.com", "endereco": {"rua": "Av. Paulista, 456", "cidade": "São Paulo", "cep": "01310-100"}, "dataNascimento": "1988-08-22"}',
         '{"cargo": "Analista de RH", "departamento": "Recursos Humanos", "dataAdmissao": "2023-02-01", "numeroRegistro": "EMP002", "supervisor": "Ana Costa", "horarioTrabalho": "08:00-17:00"}',
         '{"salario": 6000, "beneficios": ["Vale Refeição", "Plano de Saúde"], "contaBancaria": {"banco": "Itaú", "agencia": "5678", "conta": "12345-6"}}',
         'ativo'),
        ('carlos.mendes@medstaff.com',
         '{"nome": "Carlos Mendes", "cpf": "456.789.123-00", "telefone": "(11) 99999-3333", "emailPessoal": "carlos.mendes@medstaff.com", "endereco": {"rua": "Rua Augusta, 789", "cidade": "São Paulo", "cep": "01305-000"}, "dataNascimento": "1985-12-10"}',
         '{"cargo": "Gerente de Tecnologia", "departamento": "Tecnologia", "dataAdmissao": "2022-06-15", "numeroRegistro": "EMP003", "supervisor": "Diretor Geral", "horarioTrabalho": "09:00-18:00"}',
         '{"salario": 12000, "beneficios": ["Vale Refeição", "Plano de Saúde", "Vale Transporte", "Participação nos Lucros"], "contaBancaria": {"banco": "Santander", "agencia": "9876", "conta": "54321-0"}}',
         'ativo'),
        ('ana.costa@medstaff.com',
         '{"nome": "Ana Costa", "cpf": "789.123.456-00", "telefone": "(11) 99999-4444", "emailPessoal": "ana.costa@medstaff.com", "endereco": {"rua": "Rua Oscar Freire, 321", "cidade": "São Paulo", "cep": "01426-001"}, "dataNascimento": "1987-03-18"}',
         '{"cargo": "Coordenadora de RH", "departamento": "Recursos Humanos", "dataAdmissao": "2022-09-01", "numeroRegistro": "EMP004", "supervisor": "Diretor Geral", "horarioTrabalho": "08:00-17:00"}',
         '{"salario": 9000, "beneficios": ["Vale Refeição", "Plano de Saúde", "Vale Transporte"], "contaBancaria": {"banco": "Bradesco", "agencia": "1357", "conta": "24680-1"}}',
         'ativo'),
        ('pedro.oliveira@medstaff.com',
         '{"nome": "Pedro Oliveira", "cpf": "321.654.987-00", "telefone": "(11) 99999-5555", "emailPessoal": "pedro.oliveira@medstaff.com", "endereco": {"rua": "Rua Consolação, 654", "cidade": "São Paulo", "cep": "01302-000"}, "dataNascimento": "1992-07-25"}',
         '{"cargo": "Desenvolvedor Junior", "departamento": "Tecnologia", "dataAdmissao": "2023-08-01", "numeroRegistro": "EMP005", "supervisor": "João Silva", "horarioTrabalho": "09:00-18:00"}',
         '{"salario": 4500, "beneficios": ["Vale Refeição", "Plano de Saúde"], "contaBancaria": {"banco": "Caixa Econômica", "agencia": "2468", "conta": "13579-2"}}',
         'ativo');

        RAISE NOTICE 'Dados de exemplo inseridos com sucesso!';
    ELSE
        RAISE NOTICE 'Dados já existem na tabela employees. Inicialização ignorada.';
    END IF;

    -- Inserir algumas tarefas de exemplo se não existirem
    IF (SELECT COUNT(*) FROM tasks) = 0 THEN
        INSERT INTO tasks (title, description, status, priority, created_by, due_date) VALUES
        ('Configurar ambiente de desenvolvimento', 'Configurar o ambiente local para novos desenvolvedores', 'pendente', 'alta', (SELECT id FROM profiles LIMIT 1), NOW() + INTERVAL '7 days'),
        ('Revisar políticas de RH', 'Atualizar as políticas de recursos humanos da empresa', 'em_andamento', 'media', (SELECT id FROM profiles LIMIT 1), NOW() + INTERVAL '14 days'),
        ('Implementar nova funcionalidade', 'Desenvolver sistema de notificações em tempo real', 'pendente', 'alta', (SELECT id FROM profiles LIMIT 1), NOW() + INTERVAL '21 days');

        RAISE NOTICE 'Tarefas de exemplo inseridas com sucesso!';
    END IF;

    -- Inserir alguns leads de exemplo se não existirem
    IF (SELECT COUNT(*) FROM leads) = 0 THEN
        INSERT INTO leads (name, email, phone, company, status, stage, source, value, notes) VALUES
        ('Hospital São Lucas', 'contato@saolucas.com.br', '(11) 3333-4444', 'Hospital São Lucas', 'novo', 'prospeccao', 'website', 50000.00, 'Interessados em sistema completo de gestão'),
        ('Clínica Vida Nova', 'admin@vidanova.com.br', '(11) 5555-6666', 'Clínica Vida Nova', 'qualificado', 'proposta', 'indicacao', 25000.00, 'Necessitam de módulo de agendamento'),
        ('Centro Médico Excellence', 'info@excellence.com.br', '(11) 7777-8888', 'Centro Médico Excellence', 'em_negociacao', 'negociacao', 'evento', 75000.00, 'Projeto de grande porte - múltiplas unidades');

        RAISE NOTICE 'Leads de exemplo inseridos com sucesso!';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Executar a função de inicialização (descomente a linha abaixo se quiser executar automaticamente)
-- SELECT initialize_sample_data();