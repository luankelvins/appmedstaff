# Configuração do Superadmin

Este documento contém as instruções para completar a configuração do superadmin no sistema.

## Status Atual

✅ **Concluído:**
- Funcionário criado na tabela `employees` para `Luankelvin@soumedstaff.com`
- Perfil existente na tabela `profiles` identificado
- Scripts de configuração criados
- Arquivo SQL para adicionar colunas preparado

⏳ **Pendente:**
- Execução do SQL para adicionar colunas `role`, `permissions` e `full_name`
- Aplicação das permissões de superadmin
- Teste final do acesso

## Próximos Passos

### 1. Executar SQL no Supabase (OBRIGATÓRIO)

1. Acesse o Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/[seu-projeto]/sql
   ```

2. Execute o conteúdo do arquivo:
   ```
   database/add-superadmin-columns.sql
   ```

3. Verifique se as colunas foram criadas com sucesso

### 2. Aplicar Permissões de Superadmin

Após executar o SQL, rode o script:
```bash
node scripts/apply-superadmin-permissions.mjs
```

### 3. Verificar Configuração

Para verificar se tudo está funcionando:
```bash
node scripts/verify-superadmin-setup.mjs
```

## Arquivos Criados

- `database/add-superadmin-columns.sql` - SQL para adicionar colunas necessárias
- `scripts/apply-superadmin-permissions.mjs` - Script para aplicar permissões
- `scripts/verify-superadmin-setup.mjs` - Script para verificar configuração
- `scripts/create-employee-superadmin.mjs` - Script usado para criar funcionário (já executado)

## Detalhes do Superadmin

- **Email:** `Luankelvin@soumedstaff.com`
- **Role:** `super_admin`
- **Permissões:** 14 permissões completas do sistema
- **Vinculação:** Funcionário e perfil vinculados

## Permissões Incluídas

O superadmin terá as seguintes permissões:
- `users:read`, `users:write`, `users:delete`
- `employees:read`, `employees:write`, `employees:delete`
- `departments:read`, `departments:write`, `departments:delete`
- `reports:read`, `reports:write`
- `settings:read`, `settings:write`
- `system:admin`

## Troubleshooting

### Se o SQL falhar:
- Verifique se você tem permissões de administrador no Supabase
- Confirme que está executando no projeto correto
- Verifique se as tabelas `profiles` existem

### Se as permissões não forem aplicadas:
- Execute primeiro o SQL do passo 1
- Verifique se as variáveis de ambiente estão corretas
- Rode o script de verificação para diagnóstico

### Para verificar logs:
```bash
# Verificar estrutura atual
node scripts/check-schema.mjs

# Verificar funcionário criado
node scripts/check-employees-schema.mjs
```

## Contato

Se encontrar problemas, verifique:
1. Variáveis de ambiente no `.env`
2. Conexão com Supabase
3. Permissões do service role key