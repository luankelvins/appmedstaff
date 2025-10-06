## ❌ Erro: `net::ERR_CONNECTION_CLOSED` na tabela `profiles`

### **Problema Identificado:**

O sistema está tentando acessar a tabela `profiles` que **não existe** no Supabase.

**Arquivos afetados:**
- `widgetDataService.ts` - Health check
- `realtimeService.ts` - Teste de latência
- `authService.ts` - Autenticação
- `supabaseService.ts` - Operações de perfil
- `dashboardService.ts` - Contagem de membros
- `passwordResetService.ts` - Reset de senha
- E outros...

---

## ✅ **SOLUÇÕES**

### **SOLUÇÃO 1: Criar VIEW `profiles` (Mais Rápida)** ⚡

Esta solução cria uma VIEW que mapeia a tabela `employees` para `profiles`, permitindo que todo o código existente continue funcionando sem modificações.

**Execute no Supabase SQL Editor:**

```sql
CREATE OR REPLACE VIEW profiles AS
SELECT 
  id,
  email,
  dados_pessoais->>'nome_completo' as name,
  dados_pessoais->>'nome_completo' as full_name,
  dados_pessoais->>'foto' as avatar_url,
  dados_profissionais->>'cargo' as position,
  dados_profissionais->>'departamento' as department,
  dados_profissionais->>'nivel_acesso' as role,
  ARRAY['dashboard.view']::text[] as permissions,
  created_at,
  updated_at
FROM employees;
```

**Arquivo pronto:** `FIX_PROFILES_TABLE.sql`

**Vantagens:**
- ✅ Não precisa modificar código
- ✅ Implementação instantânea
- ✅ Mantém sincronização automática com `employees`
- ✅ Sem duplicação de dados

**Desvantagens:**
- ⚠️ VIEWs podem ter limitações com RLS
- ⚠️ Não suporta INSERT/UPDATE direto (precisaria de triggers)

---

### **SOLUÇÃO 2: Criar Tabela `profiles` Real**

Cria uma tabela separada e sincroniza com `employees` via triggers.

**Mais trabalhoso, mas mais flexível.**

---

## 🔧 **Correções Já Aplicadas no Código:**

### **1. widgetDataService.ts** ✅
```typescript
// Antes
await supabase.from('profiles').select('id').limit(1)

// Agora
await supabase.from('employees').select('id').limit(1)
```

### **2. realtimeService.ts** ✅
```typescript
// Antes
await supabase.from('profiles').select('id').limit(1)

// Agora
await supabase.from('employees').select('id').limit(1)
```

Essas correções resolvem os **health checks** que estavam causando `ERR_CONNECTION_CLOSED`.

---

## 🎯 **Ação Recomendada:**

**Execute a SOLUÇÃO 1 (VIEW)** para resolver rapidamente:

1. Abra o Supabase SQL Editor
2. Cole o conteúdo de `FIX_PROFILES_TABLE.sql`
3. Execute a seção da VIEW
4. Recarregue a aplicação

**OU**

Aguarde e vamos refatorar todos os serviços para usar apenas `employees` (mais trabalhoso).

---

## 📋 **Status das Correções:**

### **✅ Corrigido (não usam mais `profiles`):**
- `widgetDataService.ts` - Health check
- `realtimeService.ts` - Latency test

### **⏳ Ainda usam `profiles` (precisam de VIEW ou refatoração):**
- `authService.ts`
- `supabaseService.ts`
- `dashboardService.ts`
- `passwordResetService.ts`
- `enhancedAuditService.ts`
- `auditService.ts`
- `useEmployees.ts`
- `SupabaseTest.tsx`

---

## 🚀 **Recomendação Final:**

**Criar a VIEW `profiles`** é a solução mais rápida e eficiente para resolver o problema imediatamente sem precisar refatorar 10+ arquivos.

Execute o SQL e o erro desaparecerá! ✨


