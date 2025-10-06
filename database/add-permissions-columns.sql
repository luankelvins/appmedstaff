-- Script para adicionar colunas de role e permissions à tabela profiles
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna role se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
        RAISE NOTICE 'Coluna role adicionada à tabela profiles';
    ELSE
        RAISE NOTICE 'Coluna role já existe na tabela profiles';
    END IF;
END $$;

-- 2. Adicionar coluna permissions se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'permissions') THEN
        ALTER TABLE profiles ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Coluna permissions adicionada à tabela profiles';
    ELSE
        RAISE NOTICE 'Coluna permissions já existe na tabela profiles';
    END IF;
END $$;

-- 3. Adicionar coluna full_name se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
        RAISE NOTICE 'Coluna full_name adicionada à tabela profiles';
    ELSE
        RAISE NOTICE 'Coluna full_name já existe na tabela profiles';
    END IF;
END $$;

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_permissions ON profiles USING GIN(permissions);

-- 5. Atualizar políticas RLS para incluir superadmin
-- Função para verificar se o usuário é superadmin
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

-- Política para superadmins verem todos os perfis
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON profiles;
CREATE POLICY "Superadmins can view all profiles" ON profiles
    FOR SELECT USING (is_superadmin(auth.uid()));

-- Política para superadmins atualizarem todos os perfis
DROP POLICY IF EXISTS "Superadmins can update all profiles" ON profiles;
CREATE POLICY "Superadmins can update all profiles" ON profiles
    FOR UPDATE USING (is_superadmin(auth.uid()));

-- Política para superadmins inserirem perfis
DROP POLICY IF EXISTS "Superadmins can insert profiles" ON profiles;
CREATE POLICY "Superadmins can insert profiles" ON profiles
    FOR INSERT WITH CHECK (is_superadmin(auth.uid()));

-- Política para superadmins deletarem perfis
DROP POLICY IF EXISTS "Superadmins can delete profiles" ON profiles;
CREATE POLICY "Superadmins can delete profiles" ON profiles
    FOR DELETE USING (is_superadmin(auth.uid()));

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;