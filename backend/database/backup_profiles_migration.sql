-- Script de Backup - Migração da tabela profiles para employees
-- Execute este script ANTES de executar a migração
-- Data: $(date)

-- 1. Criar tabela de backup dos dados da profiles
CREATE TABLE IF NOT EXISTS profiles_backup AS 
SELECT * FROM profiles;

-- 2. Verificar se o backup foi criado corretamente
SELECT 
  'profiles_backup' as tabela,
  COUNT(*) as total_registros,
  NOW() as data_backup
FROM profiles_backup;

-- 3. Mostrar estrutura da tabela original para referência
\d profiles;

-- 4. Exportar dados para arquivo (opcional - execute no terminal)
-- \copy profiles TO '/tmp/profiles_backup.csv' WITH CSV HEADER;

COMMENT ON TABLE profiles_backup IS 'Backup da tabela profiles antes da migração para employees - ' || NOW()::text;