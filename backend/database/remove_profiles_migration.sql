-- Script de Migração: Remoção da tabela profiles
-- Execute este script APÓS fazer o backup com backup_profiles_migration.sql
-- Data: $(date)

-- IMPORTANTE: Execute o backup_profiles_migration.sql ANTES deste script!

BEGIN;

-- 1. Verificar se existem dados na tabela profiles
DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    RAISE NOTICE 'Total de registros na tabela profiles: %', profile_count;
    
    IF profile_count > 0 THEN
        RAISE NOTICE 'ATENÇÃO: Existem % registros na tabela profiles que serão removidos!', profile_count;
        RAISE NOTICE 'Certifique-se de que os dados foram migrados para a tabela employees.';
    END IF;
END $$;

-- 2. Atualizar foreign keys na tabela tasks
-- Primeiro, vamos verificar se há tarefas que referenciam profiles
DO $$
DECLARE
    task_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO task_count 
    FROM tasks 
    WHERE assigned_to IS NOT NULL OR created_by IS NOT NULL OR user_id IS NOT NULL;
    
    RAISE NOTICE 'Total de tarefas com referências a usuários: %', task_count;
    
    IF task_count > 0 THEN
        RAISE WARNING 'ATENÇÃO: Existem % tarefas que referenciam auth.users. Verifique se isso está correto.', task_count;
    END IF;
END $$;

-- 3. Remover políticas RLS relacionadas à tabela profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 4. Remover trigger da tabela profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 5. Remover função que cria perfil automaticamente
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 6. Remover índices da tabela profiles
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_employee_id;

-- 7. Remover a tabela profiles
DROP TABLE IF EXISTS profiles CASCADE;

-- 8. Verificar se a tabela foi removida
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Tabela profiles removida com sucesso!';
    ELSE
        RAISE EXCEPTION 'Erro: Tabela profiles ainda existe!';
    END IF;
END $$;

-- 9. Verificar se a tabela employees existe e tem dados
DO $$
DECLARE
    employee_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
        SELECT COUNT(*) INTO employee_count FROM employees;
        RAISE NOTICE 'Tabela employees existe com % registros', employee_count;
    ELSE
        RAISE WARNING 'ATENÇÃO: Tabela employees não existe!';
    END IF;
END $$;

-- 10. Atualizar comentários no schema
COMMENT ON TABLE employees IS 'Tabela de funcionários - substitui a antiga tabela profiles';

COMMIT;

-- Verificação final
SELECT 
    'Migração concluída' as status,
    NOW() as data_execucao,
    (SELECT COUNT(*) FROM employees) as total_employees,
    (SELECT COUNT(*) FROM tasks) as total_tasks;