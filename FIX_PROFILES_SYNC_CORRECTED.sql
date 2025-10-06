-- =====================================================
-- CORRIGIDO: Sincronizar profiles com employees
-- Coluna permissions é JSONB, não TEXT[]
-- =====================================================

-- 1. Criar função de sincronização (CORRIGIDA)
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
    -- CORRIGIDO: Converter para JSONB
    CASE 
      WHEN NEW.dados_profissionais->>'nivel_acesso' = 'superadmin' 
      THEN '["*"]'::jsonb
      ELSE '["dashboard.view"]'::jsonb
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

-- 2. Criar trigger
DROP TRIGGER IF EXISTS sync_employee_to_profile_trigger ON employees;

CREATE TRIGGER sync_employee_to_profile_trigger
  AFTER INSERT OR UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION sync_employee_to_profile();

-- 3. Popular com dados existentes (CORRIGIDO)
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
  -- CORRIGIDO: Converter para JSONB
  CASE 
    WHEN dados_profissionais->>'nivel_acesso' = 'superadmin' 
    THEN '["*"]'::jsonb
    ELSE '["dashboard.view"]'::jsonb
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

-- 4. Verificar resultado
SELECT 
  p.id,
  p.email,
  p.name,
  p.position,
  p.department,
  p.role,
  p.permissions,
  e.dados_pessoais->>'nome_completo' as employee_name
FROM profiles p
LEFT JOIN employees e ON e.id = p.id
LIMIT 5;

-- 5. Verificar total de registros
SELECT 
  (SELECT COUNT(*) FROM employees) as total_employees,
  (SELECT COUNT(*) FROM profiles) as total_profiles;

-- 6. Verificar RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- Se RLS não estiver habilitado, habilite:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Testar query simples (deve funcionar agora)
SELECT id, email, name FROM profiles LIMIT 1;

COMMIT;


