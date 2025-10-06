-- Script para adicionar colunas de superadmin à tabela profiles
-- Execute este script no Supabase SQL Editor

-- Adicionar colunas à tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_permissions ON profiles USING GIN(permissions);

-- Função para verificar se um usuário é superadmin
CREATE OR REPLACE FUNCTION is_superadmin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS para superadmins
CREATE POLICY "Superadmins can view all profiles" ON profiles
  FOR SELECT USING (is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can update all profiles" ON profiles
  FOR UPDATE USING (is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can delete profiles" ON profiles
  FOR DELETE USING (is_superadmin(auth.uid()));

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('role', 'permissions', 'full_name')
ORDER BY column_name;