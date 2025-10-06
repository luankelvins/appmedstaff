-- ⚠️ EXECUTE ESTE SCRIPT IMEDIATAMENTE NO SUPABASE SQL EDITOR ⚠️
-- Script para corrigir RLS policies da tabela employees

-- 1. Desabilitar RLS temporariamente
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Allow users to view own employee data" ON employees;
DROP POLICY IF EXISTS "Allow super admins to view all employee data" ON employees;
DROP POLICY IF EXISTS "Allow authenticated users to view employees" ON employees;
DROP POLICY IF EXISTS "Enable read access for all users" ON employees;

-- 3. Habilitar RLS novamente
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 4. Criar política PERMISSIVA para desenvolvimento (permite acesso total)
-- ⚠️ Esta política é TEMPORÁRIA para desenvolvimento - ajustar para produção
CREATE POLICY "Enable read access for all users" ON employees
FOR SELECT USING (true);

-- 5. Verificar se funcionou
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'employees';

