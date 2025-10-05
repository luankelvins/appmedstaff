# Instruções para Configurar Schema de Auditoria

## ⚠️ IMPORTANTE
Este documento contém instruções para executar manualmente o schema de auditoria no Supabase SQL Editor.

## 📋 Pré-requisitos
- Acesso ao dashboard do Supabase
- Permissões de administrador no projeto
- Arquivo `audit_schema.sql` disponível

## 🚀 Passo a Passo

### 1. Acessar o Supabase SQL Editor
1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**

### 2. Executar o Schema de Auditoria
1. Abra o arquivo `/database/audit_schema.sql`
2. Copie todo o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** para executar

### 3. Verificar Execução
Após a execução, verifique se as seguintes tabelas foram criadas:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('audit_logs', 'user_sessions', 'audit_settings');
```

### 4. Verificar Funções
Verifique se as funções foram criadas:

```sql
-- Verificar funções criadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('log_audit_action', 'get_audit_stats', 'cleanup_old_audit_logs');
```

### 5. Testar Funcionalidade
Execute um teste básico:

```sql
-- Teste básico da função de log
SELECT log_audit_action(
  'test-user-id',
  'Usuário Teste',
  'Administrador',
  'user.login',
  'user',
  'test-user-id',
  '{"test": true}'::jsonb,
  true,
  null,
  '127.0.0.1',
  'Test User Agent'
);
```

## 🔧 Solução de Problemas

### Erro: "relation already exists"
- **Causa**: Tabelas já existem no banco
- **Solução**: Ignore o erro ou execute DROP TABLE antes

### Erro: "function already exists"
- **Causa**: Funções já existem no banco
- **Solução**: Ignore o erro ou execute DROP FUNCTION antes

### Erro de permissões
- **Causa**: Usuário sem permissões adequadas
- **Solução**: Use a service role key ou contate o administrador

## 📊 Estrutura Criada

### Tabelas
- **audit_logs**: Logs principais de auditoria
- **user_sessions**: Sessões de usuário
- **audit_settings**: Configurações de auditoria

### Funções
- **log_audit_action**: Registra ações de auditoria
- **get_audit_stats**: Obtém estatísticas
- **cleanup_old_audit_logs**: Limpeza automática

### Índices
- Índices otimizados para consultas por data, usuário e ação
- Índices compostos para melhor performance

### Políticas RLS
- Políticas de segurança para acesso controlado
- Permissões baseadas em autenticação

## ✅ Próximos Passos
Após executar o schema:
1. Testar a integração com o frontend
2. Verificar se os logs estão sendo registrados
3. Validar as estatísticas de auditoria
4. Configurar limpeza automática se necessário

## 🆘 Suporte
Se encontrar problemas:
1. Verifique os logs de erro no SQL Editor
2. Confirme as permissões do usuário
3. Valide a sintaxe SQL
4. Consulte a documentação do Supabase