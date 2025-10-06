-- Script para configurar RLS policies da tabela employees
-- Execute este script no Supabase SQL Editor

-- Habilitar RLS na tabela employees se não estiver habilitado
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow users to view own employee data" ON employees;
DROP POLICY IF EXISTS "Allow super admins to view all employee data" ON employees;
DROP POLICY IF EXISTS "Allow authenticated users to view employees" ON employees;

-- Criar política para permitir que usuários autenticados vejam seus próprios dados
CREATE POLICY "Allow users to view own employee data" ON employees
FOR SELECT USING (auth.uid() = id);

-- Criar política para permitir que super admins vejam todos os dados
CREATE POLICY "Allow super admins to view all employee data" ON employees
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE id = auth.uid() 
    AND dados_profissionais->>'nivel_acesso' = 'superadmin'
  )
);

-- Criar política mais permissiva para desenvolvimento (temporária)
CREATE POLICY "Allow authenticated users to view employees" ON employees
FOR SELECT USING (auth.role() = 'authenticated');

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'employees';
