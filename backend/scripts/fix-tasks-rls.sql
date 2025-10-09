-- Script para corrigir políticas RLS da tabela tasks

-- Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;

-- Criar políticas mais permissivas para usuários autenticados
CREATE POLICY "Authenticated users can view tasks" ON tasks 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create tasks" ON tasks 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks" ON tasks 
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete tasks" ON tasks 
  FOR DELETE TO authenticated USING (true);

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'tasks';