-- ============================================
-- EXECUTE ESTE SQL NO SUPABASE SQL EDITOR
-- ============================================

-- 1. Adicionar coluna role
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Adicionar coluna permissions  
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- 3. Adicionar coluna full_name
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_permissions ON profiles USING GIN(permissions);

-- 5. Atualizar SEU usuário para super_admin
UPDATE profiles
SET 
  role = 'super_admin',
  permissions = '["*"]'::jsonb
WHERE email = 'Luankelvin@soumedstaff.com';

-- 6. Verificar (deve mostrar role='super_admin' e permissions='["*"]')
SELECT id, name, email, role, permissions 
FROM profiles 
WHERE email = 'Luankelvin@soumedstaff.com';

