-- =====================================================
-- CORRIGIR: Tabela profiles já existe
-- Vamos sincronizá-la com employees
-- =====================================================

-- 1. Verificar estrutura da tabela profiles existente
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver quantos registros existem
SELECT COUNT(*) as total_profiles FROM profiles;

-- 3. OPÇÃO A: Deletar dados antigos e popular com employees
-- (Execute apenas se quiser substituir os dados existentes)

/*
TRUNCATE TABLE profiles;

INSERT INTO profiles (
  id, 
  email, 
  name, 
  full_name, 
  avatar_url, 
  position, 
  department, 
  role, 
  permissions,
  created_at, 
  updated_at
)
SELECT 
  id,
  email,
  dados_pessoais->>'nome_completo' as name,
  dados_pessoais->>'nome_completo' as full_name,
  dados_pessoais->>'foto' as avatar_url,
  dados_profissionais->>'cargo' as position,
  dados_profissionais->>'departamento' as department,
  COALESCE(dados_profissionais->>'nivel_acesso', 'user') as role,
  CASE 
    WHEN dados_profissionais->>'nivel_acesso' = 'superadmin' THEN ARRAY['*']::text[]
    ELSE ARRAY['dashboard.view']::text[]
  END as permissions,
  created_at,
  updated_at
FROM employees
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  position = EXCLUDED.position,
  department = EXCLUDED.department,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  updated_at = EXCLUDED.updated_at;
*/

-- 4. OPÇÃO B: Criar trigger para sincronizar automaticamente
-- Toda vez que um employee for criado/atualizado, atualiza profiles

CREATE OR REPLACE FUNCTION sync_employee_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    email, 
    name, 
    full_name, 
    avatar_url, 
    position, 
    department, 
    role, 
    permissions,
    created_at, 
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.dados_pessoais->>'nome_completo',
    NEW.dados_pessoais->>'nome_completo',
    NEW.dados_pessoais->>'foto',
    NEW.dados_profissionais->>'cargo',
    NEW.dados_profissionais->>'departamento',
    COALESCE(NEW.dados_profissionais->>'nivel_acesso', 'user'),
    CASE 
      WHEN NEW.dados_profissionais->>'nivel_acesso' = 'superadmin' THEN ARRAY['*']::text[]
      ELSE ARRAY['dashboard.view']::text[]
    END,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    position = EXCLUDED.position,
    department = EXCLUDED.department,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS sync_employee_to_profile_trigger ON employees;

CREATE TRIGGER sync_employee_to_profile_trigger
  AFTER INSERT OR UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION sync_employee_to_profile();

-- 5. Popular profiles com dados atuais dos employees
INSERT INTO profiles (
  id, 
  email, 
  name, 
  full_name, 
  avatar_url, 
  position, 
  department, 
  role, 
  permissions,
  created_at, 
  updated_at
)
SELECT 
  id,
  email,
  dados_pessoais->>'nome_completo' as name,
  dados_pessoais->>'nome_completo' as full_name,
  dados_pessoais->>'foto' as avatar_url,
  dados_profissionais->>'cargo' as position,
  dados_profissionais->>'departamento' as department,
  COALESCE(dados_profissionais->>'nivel_acesso', 'user') as role,
  CASE 
    WHEN dados_profissionais->>'nivel_acesso' = 'superadmin' THEN ARRAY['*']::text[]
    ELSE ARRAY['dashboard.view']::text[]
  END as permissions,
  created_at,
  updated_at
FROM employees
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  position = EXCLUDED.position,
  department = EXCLUDED.department,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  updated_at = EXCLUDED.updated_at;

-- 6. Verificar resultado
SELECT 
  p.id,
  p.email,
  p.name,
  p.position,
  p.department,
  p.role,
  e.dados_pessoais->>'nome_completo' as employee_name
FROM profiles p
LEFT JOIN employees e ON e.id = p.id
LIMIT 5;

-- 7. Verificar RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- Se RLS não estiver habilitado, habilite:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

