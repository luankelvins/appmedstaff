# 🚨 PROBLEMA CRÍTICO - Conectividade com Supabase

## ⚠️ Situação Atual

O sistema está com **problema crítico de conectividade** com o Supabase. TODAS as queries estão dando timeout, mesmo usando o Service Role Key (admin).

### Evidências:
- ✅ Login no Supabase Auth funciona (sessão criada)
- ❌ Query na tabela `employees` dá timeout (3+ segundos)
- ❌ Fallback query (buscar todos) também dá timeout
- ❌ Mesmo com Service Role Key (bypass RLS) dá timeout

## 🛠️ Solução Temporária Implementada

Foi implementado um **fallback final com dados mockados** para permitir desenvolvimento:

```typescript
// Se TODAS as queries falharem, usa dados mockados:
const mockEmployee = {
  id: userId,
  email: 'luankelvin@soumedstaff.com',
  dados_pessoais: {
    nome_completo: 'Luan Kelvin',
    cpf: '000.000.000-00',
    telefone: '(11) 99999-9999',
    contato: { telefone: '(11) 99999-9999' }
  },
  dados_profissionais: {
    cargo: 'Desenvolvedor Full Stack',
    departamento: 'Tecnologia',
    nivel_acesso: 'superadmin'
  },
  status: 'ativo'
}
```

**ATENÇÃO**: Esta é uma solução **TEMPORÁRIA** apenas para desenvolvimento!

## 🔍 Possíveis Causas

### 1. **Problema de RLS (Row Level Security)**
   - Políticas podem estar bloqueando completamente o acesso
   - Mesmo Service Role deveria fazer bypass, mas não está funcionando

### 2. **Problema de Rede/Conectividade**
   - Firewall bloqueando requisições
   - Problema de DNS/routing
   - Throttling do Supabase (rate limiting)

### 3. **Problema de Configuração do Projeto Supabase**
   - Projeto pode estar pausado/suspenso
   - Tabela `employees` pode não existir
   - Permissões do Service Role podem estar incorretas

### 4. **Problema de CORS**
   - Origem do frontend não autorizada
   - Preflight requests bloqueados

## 🎯 Como Resolver DEFINITIVAMENTE

### Passo 1: Verificar Status do Projeto Supabase

1. Acesse o Dashboard do Supabase: https://app.supabase.com
2. Selecione o projeto: `okhnuikljprxavymnlkn`
3. Verifique se o projeto está **ATIVO** (não pausado/suspenso)

### Passo 2: Executar Script SQL no Supabase

Execute o arquivo `FIX_RLS_AGORA.sql` no SQL Editor:

```sql
-- Desabilitar RLS completamente (TEMPORÁRIO)
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Ou criar política permissiva
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable full access for all authenticated users" ON employees
FOR ALL USING (auth.role() = 'authenticated');
```

### Passo 3: Verificar Conectividade

Execute o teste de conectividade:

```bash
node scripts/test-supabase-connection.mjs
```

Deve mostrar:
- ✅ Conexão com Supabase funcionando
- ✅ Perfil encontrado
- ✅ Dados mapeados corretamente

### Passo 4: Verificar Tabela employees

Execute no SQL Editor do Supabase:

```sql
-- Verificar se tabela existe
SELECT * FROM employees LIMIT 1;

-- Verificar RLS
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'employees';

-- Verificar políticas
SELECT * FROM pg_policies 
WHERE tablename = 'employees';
```

### Passo 5: Verificar Service Role Key

1. Vá em Settings > API
2. Copie o `service_role` key
3. Verifique se está correto no `.env`:

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Passo 6: Verificar CORS

1. Vá em Settings > API
2. Em "API Settings", verifique "Additional Allowed Origins"
3. Adicione: `http://localhost:5173` (ou sua porta do dev)

## 🧪 Testar Solução

### 1. Limpar Cache
```javascript
localStorage.clear()
sessionStorage.clear()
```

### 2. Recarregar Página
`Ctrl + F5`

### 3. Fazer Login
- Email: `luankelvin@soumedstaff.com`
- Senha: `Admin@1234`

### 4. Verificar Logs
Deve mostrar:
```
[SupabaseService] Query executada, resultado: { data: {...}, error: null }
```

**NÃO** deve mostrar:
```
⚠️ FALLBACK FINAL - Usando dados mockados!
```

## 📋 Logs para Diagnóstico

Se o problema persistir, execute:

```bash
# 1. Testar conectividade básica
node scripts/test-supabase-connection.mjs

# 2. Testar login completo
node scripts/test-final-login.mjs

# 3. Verificar configuração
grep VITE_SUPABASE .env
```

E envie os logs para análise.

## 🆘 Se Nada Funcionar

### Opção 1: Recriar Projeto Supabase
1. Fazer backup dos dados
2. Criar novo projeto no Supabase
3. Importar schema e dados
4. Atualizar variáveis de ambiente

### Opção 2: Usar Backend Próprio
1. Criar API Express/Fastify
2. Migrar lógica de autenticação
3. Usar Supabase apenas como database

### Opção 3: Usar Dados Mockados (Desenvolvimento)
A solução atual com fallback mockado permite continuar o desenvolvimento enquanto resolve o problema.

## ⚠️ IMPORTANTE

**REMOVA o fallback mockado antes de ir para produção!**

O código atual está configurado para:
1. Tentar query normal (3s timeout)
2. Tentar fallback query (3s timeout)  
3. **Usar dados mockados** (ÚLTIMO RECURSO)

Isso garante que o sistema funcione para desenvolvimento, mas **NÃO É SEGURO PARA PRODUÇÃO**.

## 📞 Suporte

Se o problema persistir:
1. Verifique status do Supabase: https://status.supabase.com
2. Entre em contato com suporte: https://supabase.com/support
3. Busque ajuda na comunidade: https://github.com/supabase/supabase/discussions

