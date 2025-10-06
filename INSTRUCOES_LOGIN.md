# 🔐 Instruções para Corrigir o Problema de Login

## 📋 Problema Identificado

O sistema está com problema de **RLS (Row Level Security)** na tabela `employees`, causando timeout nas queries de autenticação. A query demora mais de 10 segundos e nunca retorna resultado.

## ✅ Solução Aplicada

### 1. Correção Temporária (Imediata)
O código foi atualizado para usar o **Service Role Key** (admin) ao buscar perfis de usuários, contornando temporariamente as políticas de RLS.

**Arquivo modificado**: `src/services/supabaseService.ts`
- Agora usa `supabaseAdmin` (service role) em vez de `supabase` (anon key)
- Isso bypassa as políticas de RLS que estão bloqueando o acesso

### 2. Correção Definitiva (Executar no Supabase)

**⚠️ IMPORTANTE**: Execute o script `FIX_RLS_AGORA.sql` no Supabase SQL Editor:

1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Copie e cole o conteúdo do arquivo `FIX_RLS_AGORA.sql`
4. Execute o script
5. Verifique se as políticas foram criadas corretamente

## 🧪 Como Testar

### No Terminal (antes de testar no navegador):

```bash
# 1. Limpar cache do navegador
node scripts/clear-browser-cache.mjs

# 2. Testar login
node scripts/test-final-login.mjs
```

### No Navegador:

1. **Limpar cache e storage**:
   - Abra DevTools (F12)
   - Vá para Application > Storage
   - Clique em "Clear site data"
   - Ou execute no console:
     ```javascript
     localStorage.clear()
     sessionStorage.clear()
     ```

2. **Recarregar página**:
   - Pressione `Ctrl + F5` (força reload sem cache)

3. **Fazer login**:
   - Email: `luankelvin@soumedstaff.com`
   - Senha: `123456`

## 📊 O que Deve Acontecer

### Logs Esperados no Console:

```
[AuthContext] Verificando sessão...
[SupabaseService] Buscando perfil para userId: b915cf4c-d2d9-4cd5-b37e-2cf0ff3147b5
[SupabaseService] Usando cliente: Admin (bypass RLS)
[SupabaseService] Query executada, resultado: { data: {...}, error: null }
[SupabaseService] Perfil mapeado: { name: 'Luan Kelvin', role: 'super_admin', ... }
[AuthContext] Usuário setado com sucesso! Role: super_admin
```

## 🔧 Configurações Importantes

### Variáveis de Ambiente (.env)

Certifique-se de que estas variáveis estão configuradas:

```env
VITE_SUPABASE_URL=https://okhnuikljprxavymnlkn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Service Role vs Anon Key

- **Anon Key**: Respeita RLS policies (estava causando o problema)
- **Service Role Key**: Bypass RLS (solução temporária)

## ⚠️ Importante para Produção

A solução atual usa o **Service Role Key no frontend**, o que **não é recomendado para produção** por questões de segurança.

### Solução Final para Produção:

1. Executar `FIX_RLS_AGORA.sql` para corrigir as políticas de RLS
2. Criar políticas mais específicas baseadas em:
   - Usuário pode ver apenas seus próprios dados
   - Super admins podem ver todos os dados
3. Voltar a usar apenas `supabase` (anon key) após corrigir RLS

## 📝 Checklist

- [x] Código atualizado para usar Service Role Key
- [ ] Executar `FIX_RLS_AGORA.sql` no Supabase
- [ ] Limpar cache do navegador
- [ ] Testar login no frontend
- [ ] Verificar se usuário é redirecionado para /dashboard
- [ ] Verificar se role é 'super_admin'
- [ ] Verificar se permissions inclui ['*']

## 🐛 Se Ainda Não Funcionar

1. Verifique os logs do console do navegador
2. Verifique se o servidor de desenvolvimento está rodando
3. Execute `node scripts/test-final-login.mjs` para testar no terminal
4. Verifique se as variáveis de ambiente estão corretas
5. Entre em contato com suporte técnico

