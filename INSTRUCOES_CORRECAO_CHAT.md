# 🔧 Correção Urgente - RLS Chat

## ⚠️ Problema Identificado

**Erro:** `infinite recursion detected in policy for relation "chat_channel_members"`

**Causa:** As políticas RLS do chat estavam causando recursão infinita ao tentar verificar permissões que dependiam umas das outras.

## ✅ Solução Aplicada

### 1. **Script SQL de Correção** ✅
Arquivo criado: `CORRECAO_RLS_CHAT.sql`

**O QUE FAZER AGORA:**
```sql
-- Abra o Supabase SQL Editor
-- Cole e execute todo o conteúdo do arquivo CORRECAO_RLS_CHAT.sql
```

Este script:
- Remove as políticas RLS problemáticas
- Recria políticas SIMPLES sem recursão
- Verifica se foram criadas corretamente

### 2. **Correção no Frontend** ✅
**Arquivo modificado:** `src/services/chatService.ts`

**Mudança:**
- Antes: Query com `INNER JOIN` que causava recursão
- Agora: Duas queries separadas (membros → canais)
- Resultado: Sem dependência circular nas RLS

### 3. **Silenciamento de Erros de Tabelas Ausentes** ✅
**Arquivos modificados:**
- `src/services/widgetDataService.ts`

**Tabelas silenciadas:**
- `team_performance` ✅
- `hr_metrics` ✅
- `team_attendance` ✅ (já estava)
- `team_wellbeing` ✅ (já estava)
- `audit_logs` ✅ (já estava em dashboardService)

Essas tabelas são opcionais e não precisam existir para o sistema funcionar.

## 📋 Checklist de Execução

### PASSO 1: Executar SQL ⚠️ **IMPORTANTE**
```bash
# Vá até: https://supabase.com/dashboard/project/okhnuikljprxavymnlkn/sql
# Cole o conteúdo de: CORRECAO_RLS_CHAT.sql
# Clique em: Run
```

### PASSO 2: Verificar se funcionou
Após executar o SQL:
1. Recarregue a página da aplicação (F5)
2. O erro de recursão deve desaparecer
3. O chat deve funcionar normalmente

### PASSO 3: Confirmar que está OK
No console do navegador, você NÃO deve mais ver:
- ❌ `infinite recursion detected`
- ❌ `500 Internal Server Error` no chat

Você PODE ainda ver (são normais):
- ⚠️ `404` para `audit_logs` (tabela opcional)
- ⚠️ `404` para `hr_metrics` (tabela opcional)
- ⚠️ `404` para `team_performance` (tabela opcional)

Mas esses erros não aparecem mais no console, foram silenciados.

## 🧪 Teste Manual

Após executar o script SQL:

```javascript
// 1. Teste buscar canais (deve funcionar)
const channels = await chatService.getMyChannels('SEU_USER_ID')
console.log('Canais:', channels)
// Deve retornar um array (vazio ou com canais)

// 2. Teste criar canal
const canal = await chatService.createChannel(
  'Teste',
  'Canal de teste',
  'public',
  'SEU_USER_ID',
  []
)
console.log('Canal criado:', canal)
```

## ✅ Status da Correção

- ✅ Script SQL criado
- ✅ Frontend corrigido
- ✅ Erros de tabelas ausentes silenciados
- ⏳ **AGUARDANDO:** Você executar o SQL no Supabase

## 🔄 Próximos Passos

1. **Execute o SQL agora:** `CORRECAO_RLS_CHAT.sql`
2. Recarregue a página
3. Teste o chat
4. Confirme se funcionou

## 📝 Notas Técnicas

### Por que ocorreu a recursão?

**Antes:**
```sql
-- chat_channels verifica chat_channel_members
-- chat_channel_members verifica chat_channels
-- = LOOP INFINITO ❌
```

**Agora:**
```sql
-- Cada tabela tem suas próprias regras simples
-- Sem dependências circulares ✅
```

### Mudança na Query

**Antes:**
```typescript
.from('chat_channels')
.select('*, chat_channel_members!inner(user_id)')
.eq('chat_channel_members.user_id', userId)
// ❌ Causa recursão na RLS
```

**Agora:**
```typescript
// 1. Buscar membros
.from('chat_channel_members').select('channel_id').eq('user_id', userId)

// 2. Buscar canais
.from('chat_channels').select('*').in('id', channelIds)
// ✅ Sem recursão
```


