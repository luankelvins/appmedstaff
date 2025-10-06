-- =====================================================
-- SOLUÇÃO: Criar tabela profiles ou view
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- OPÇÃO 1: Criar VIEW profiles apontando para employees (Recomendado)
-- Isso permite que o código existente continue funcionando

CREATE OR REPLACE VIEW profiles AS
SELECT 
  id,
  email,
  dados_pessoais->>'nome_completo' as name,
  dados_pessoais->>'nome_completo' as full_name,
  dados_pessoais->>'foto' as avatar_url,
  dados_profissionais->>'cargo' as position,
  dados_profissionais->>'departamento' as department,
  dados_profissionais->>'nivel_acesso' as role,
  ARRAY['dashboard.view']::text[] as permissions,
  created_at,
  updated_at
FROM employees;

-- Verificar se a view foi criada
SELECT * FROM profiles LIMIT 1;

-- =====================================================
-- OPÇÃO 2: Criar tabela profiles real (se preferir)
-- =====================================================

/*
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  position TEXT,
  department TEXT,
  role TEXT DEFAULT 'user',
  permissions TEXT[] DEFAULT ARRAY['dashboard.view'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Inserir dados dos employees existentes
INSERT INTO profiles (id, email, name, full_name, avatar_url, position, department, role, created_at, updated_at)
SELECT 
  id,
  email,
  dados_pessoais->>'nome_completo',
  dados_pessoais->>'nome_completo',
  dados_pessoais->>'foto',
  dados_profissionais->>'cargo',
  dados_profissionais->>'departamento',
  dados_profissionais->>'nivel_acesso',
  created_at,
  updated_at
FROM employees
ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- Verificação
-- =====================================================

-- Verificar se profiles existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) as profiles_exists;

-- Contar registros
SELECT COUNT(*) as total_profiles FROM profiles;

-- Verificar se RLS está ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles' 
AND schemaname = 'public';


