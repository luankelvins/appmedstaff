# Solução: Erro HTTP 400 Bad Request na Autenticação

> **⚠️ NOTA HISTÓRICA**: Este documento descreve um problema que ocorreu quando o sistema ainda utilizava Supabase. O sistema foi migrado para PostgreSQL e não utiliza mais Supabase para autenticação.

## 🔍 **Problema Identificado**

O erro `HTTP 400 Bad Request` com a mensagem "Invalid login credentials" estava ocorrendo porque o usuário `luankelvin@soumedstaff.com` não existia no sistema de autenticação do Supabase.

### Detalhes do Erro:
- **Endpoint**: `https://okhnuikljprxavymnlkn.supabase.co/auth/v1/token?grant_type=password`
- **Erro**: `{"code":400,"error_code":"invalid_credentials","msg":"Invalid login credentials"}`
- **Causa**: Usuário não cadastrado no Supabase Auth

## 🔧 **Solução Implementada**

### 1. **Diagnóstico Realizado**
- ✅ Verificação da configuração do Supabase em `config/supabase.ts`
- ✅ Análise do fluxo de autenticação em `authService.ts`
- ✅ Teste direto da API do Supabase via curl
- ✅ Confirmação de que o usuário não existia no banco

### 2. **Correção Aplicada**
- ✅ Criação do usuário no Supabase Auth usando service role key
- ✅ Criação do perfil correspondente na tabela `profiles`
- ✅ Teste de login bem-sucedido

### 3. **Comandos Executados**

#### Criação do Usuário no Supabase Auth:
```bash
curl -X POST "https://okhnuikljprxavymnlkn.supabase.co/auth/v1/admin/users" \
  -H "Content-Type: application/json" \
  -H "apikey: [SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -d '{
    "email": "luankelvin@soumedstaff.com",
    "password": "Luan@1303",
    "email_confirm": true,
    "user_metadata": {
      "name": "Luan Kelvin",
      "position": "Admin"
    }
  }'
```

#### Criação do Perfil na Tabela profiles:
```bash
curl -X POST "https://okhnuikljprxavymnlkn.supabase.co/rest/v1/profiles" \
  -H "Content-Type: application/json" \
  -H "apikey: [SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -d '{
    "id": "b915cf4c-d2d9-4cd5-b37e-2cf0ff3147b5",
    "email": "luankelvin@soumedstaff.com",
    "name": "Luan Kelvin",
    "position": "Admin",
    "department": "Administração"
  }'
```

## 🛠️ **Script Automatizado**

Foi criado o script `scripts/create-admin-user.mjs` para automatizar a criação de usuários administradores:

```bash
node scripts/create-admin-user.mjs
```

### Funcionalidades do Script:
- ✅ Verifica se as variáveis de ambiente estão configuradas
- ✅ Cria usuário no Supabase Auth
- ✅ Cria perfil na tabela profiles
- ✅ Trata casos onde o usuário já existe
- ✅ Fornece feedback detalhado do processo

## 📋 **Credenciais de Acesso**

**Email**: `luankelvin@soumedstaff.com`  
**Senha**: `Luan@1303`  
**Cargo**: Admin  
**Departamento**: Administração  

## 🔐 **Permissões Concedidas**

Como o usuário foi criado com a posição "Admin", ele recebe automaticamente:
- ✅ Todas as permissões estratégicas
- ✅ Acesso total ao sistema
- ✅ Role: Super Admin
- ✅ Level: strategic

## ✅ **Verificação da Solução**

O login foi testado com sucesso e retornou:
- ✅ Token de acesso válido
- ✅ Refresh token
- ✅ Dados do usuário completos
- ✅ Sessão ativa

## 🚀 **Próximos Passos**

1. **Teste na Aplicação**: Faça login na aplicação web com as credenciais fornecidas
2. **Verificação de Permissões**: Confirme que todas as funcionalidades estão acessíveis
3. **Criação de Outros Usuários**: Use o script para criar outros usuários conforme necessário

## 📝 **Notas Importantes**

- O erro era específico de usuário não cadastrado, não um problema de configuração
- A configuração do Supabase estava correta
- O fluxo de autenticação no código estava funcionando adequadamente
- A solução é permanente e o usuário agora pode fazer login normalmente

## 🔄 **Prevenção de Problemas Futuros**

Para evitar problemas similares:
1. Use o script `create-admin-user.mjs` para criar novos usuários
2. Sempre verifique se o usuário existe antes de tentar fazer login
3. Mantenha as variáveis de ambiente atualizadas
4. Documente novos usuários criados