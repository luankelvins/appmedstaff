# Migração: Remoção da Tabela Profiles

## Visão Geral
Esta migração remove a tabela `profiles` do banco de dados, pois ela foi substituída pela tabela `employees` que oferece uma estrutura mais robusta e escalável para gerenciar dados dos funcionários.

## ⚠️ IMPORTANTE - LEIA ANTES DE EXECUTAR

1. **Faça backup completo do banco de dados** antes de executar qualquer script
2. **Execute os scripts em ambiente de desenvolvimento primeiro**
3. **Verifique se todos os dados foram migrados para a tabela `employees`**
4. **Teste a aplicação completamente após a migração**

## Ordem de Execução

### 1. Backup (OBRIGATÓRIO)
```sql
-- Execute no Supabase SQL Editor ou psql
\i database/backup_profiles_migration.sql
```

### 2. Migração Principal
```sql
-- Execute no Supabase SQL Editor ou psql
\i database/remove_profiles_migration.sql
```

## Scripts Incluídos

### `backup_profiles_migration.sql`
- Cria uma tabela de backup `profiles_backup`
- Preserva todos os dados da tabela original
- Gera relatório de verificação

### `remove_profiles_migration.sql`
- Remove políticas RLS da tabela `profiles`
- Remove triggers e funções relacionadas
- Remove índices da tabela `profiles`
- Remove a tabela `profiles` completamente
- Executa verificações de integridade

### `schema.sql` (atualizado)
- Schema limpo sem referências à tabela `profiles`
- Mantém apenas a tabela `employees`
- Políticas RLS atualizadas

## Verificações Pós-Migração

### 1. Verificar se a tabela foi removida
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'profiles' 
AND table_schema = 'public';
-- Deve retornar 0 linhas
```

### 2. Verificar se o backup existe
```sql
SELECT COUNT(*) FROM profiles_backup;
-- Deve retornar o número de registros que existiam na profiles
```

### 3. Verificar se a tabela employees está funcionando
```sql
SELECT COUNT(*) FROM employees;
-- Deve retornar os funcionários cadastrados
```

### 4. Testar a aplicação
- Faça login na aplicação
- Verifique se os dados dos funcionários aparecem corretamente
- Teste funcionalidades de tarefas e atribuições
- Verifique se não há erros no console do navegador

## Rollback (Se Necessário)

Se algo der errado, você pode restaurar a tabela `profiles`:

```sql
-- APENAS EM CASO DE EMERGÊNCIA
CREATE TABLE profiles AS SELECT * FROM profiles_backup;

-- Recriar índices
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_employee_id ON profiles(employee_id);

-- Recriar políticas RLS (consulte o schema original)
```

## Arquivos Afetados na Aplicação

Os seguintes arquivos já foram atualizados no código:
- `src/services/profileService.ts`
- `src/components/TasksWidget.tsx`
- `src/components/SupabaseTest.tsx`
- `src/types/profile.ts`
- `src/services/__tests__/profileService.test.ts`

## Contato

Em caso de dúvidas ou problemas durante a migração, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.

---
**Data da Migração:** $(date)
**Versão:** 1.0
**Status:** Pronto para execução