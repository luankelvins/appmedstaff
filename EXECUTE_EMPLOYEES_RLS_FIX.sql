-- Script para corrigir RLS policies da tabela employees
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente para configurar
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Allow users to view own employee data" ON employees;
DROP POLICY IF EXISTS "Allow super admins to view all employee data" ON employees;
DROP POLICY IF EXISTS "Allow authenticated users to view employees" ON employees;
DROP POLICY IF EXISTS "Enable read access for all users" ON employees;

-- 3. Habilitar RLS novamente
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 4. Criar política permissiva para desenvolvimento (TEMPORÁRIA)
-- ATENÇÃO: Esta política permite acesso total - use apenas para desenvolvimento
CREATE POLICY "Enable read access for all users" ON employees
FOR SELECT USING (true);

-- 5. Criar política para permitir que usuários vejam seus próprios dados
CREATE POLICY "Allow users to view own employee data" ON employees
FOR SELECT USING (auth.uid() = id);

-- 6. Criar política para permitir que super admins vejam todos os dados
CREATE POLICY "Allow super admins to view all employee data" ON employees
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE id = auth.uid() 
    AND dados_profissionais->>'nivel_acesso' = 'superadmin'
  )
);

-- 7. Verificar se as políticas foram criadas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'employees'
ORDER BY policyname;

-- 8. Verificar se RLS está habilitado
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'employees';
