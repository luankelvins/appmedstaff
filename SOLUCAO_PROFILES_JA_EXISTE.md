# ✅ Solução: Tabela `profiles` Já Existe

## ❌ Erro Recebido:
```
ERROR: 42809: "profiles" is not a view
```

**Significado:** A tabela `profiles` já existe como **tabela**, não como VIEW. Por isso não podemos usar `CREATE OR REPLACE VIEW`.

---

## 🔍 **Diagnóstico**

A tabela `profiles` foi criada anteriormente, mas:
- ❌ Não está populada com dados dos `employees`
- ❌ Não está sincronizada
- ❌ Código tenta acessá-la mas está vazia/desatualizada

---

## ✅ **SOLUÇÃO: Sincronizar `profiles` com `employees`**

### **Opção 1: Sincronização Manual + Trigger Automático** (Recomendado) ⚡

**Execute este SQL:**

```sql
-- 1. Criar função de sincronização
CREATE OR REPLACE FUNCTION sync_employee_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, email, name, full_name, avatar_url, 
    position, department, role, permissions,
    created_at, updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.dados_pessoais->>'nome_completo',
    NEW.dados_pessoais->>'nome_completo',
    NEW.dados_pessoais->>'foto',
    NEW.dados_profissionais->>'cargo',
    NEW.dados_profissionais->>'departamento',
    COALESCE(NEW.dados_profissionais->>'nivel_acesso', 'user'),
    CASE 
      WHEN NEW.dados_profissionais->>'nivel_acesso' = 'superadmin' 
      THEN ARRAY['*']::text[]
      ELSE ARRAY['dashboard.view']::text[]
    END,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    position = EXCLUDED.position,
    department = EXCLUDED.department,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger
DROP TRIGGER IF EXISTS sync_employee_to_profile_trigger ON employees;

CREATE TRIGGER sync_employee_to_profile_trigger
  AFTER INSERT OR UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION sync_employee_to_profile();

-- 3. Popular com dados existentes
INSERT INTO profiles (
  id, email, name, full_name, avatar_url, 
  position, department, role, permissions,
  created_at, updated_at
)
SELECT 
  id,
  email,
  dados_pessoais->>'nome_completo',
  dados_pessoais->>'nome_completo',
  dados_pessoais->>'foto',
  dados_profissionais->>'cargo',
  dados_profissionais->>'departamento',
  COALESCE(dados_profissionais->>'nivel_acesso', 'user'),
  CASE 
    WHEN dados_profissionais->>'nivel_acesso' = 'superadmin' 
    THEN ARRAY['*']::text[]
    ELSE ARRAY['dashboard.view']::text[]
  END,
  created_at,
  updated_at
FROM employees
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  position = EXCLUDED.position,
  department = EXCLUDED.department,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  updated_at = EXCLUDED.updated_at;
```

**Arquivo pronto:** `FIX_PROFILES_SYNC.sql`

---

## 🎯 **O Que Isso Faz:**

### **1. Função `sync_employee_to_profile()`**
- Sincroniza automaticamente dados de `employees` → `profiles`
- Mapeia campos JSONB para colunas simples
- Trata permissões baseado no nível de acesso

### **2. Trigger Automático**
- Toda vez que um `employee` é criado/atualizado
- Automaticamente atualiza `profiles`
- Mantém sincronização em tempo real

### **3. População Inicial**
- Copia todos os `employees` existentes para `profiles`
- Usa `ON CONFLICT DO UPDATE` para não duplicar
- Atualiza registros existentes

---

## 📊 **Mapeamento de Campos**

| `employees` | `profiles` |
|-------------|------------|
| `id` | `id` |
| `email` | `email` |
| `dados_pessoais.nome_completo` | `name` |
| `dados_pessoais.nome_completo` | `full_name` |
| `dados_pessoais.foto` | `avatar_url` |
| `dados_profissionais.cargo` | `position` |
| `dados_profissionais.departamento` | `department` |
| `dados_profissionais.nivel_acesso` | `role` |
| (calculado) | `permissions` |

---

## 🧪 **Verificação**

Após executar o SQL, verifique:

```sql
-- Ver registros sincronizados
SELECT id, email, name, position, role 
FROM profiles 
LIMIT 5;

-- Comparar com employees
SELECT 
  p.id,
  p.name as profile_name,
  e.dados_pessoais->>'nome_completo' as employee_name,
  p.email,
  p.role
FROM profiles p
JOIN employees e ON e.id = p.id
LIMIT 5;
```

**Resultado esperado:**
- ✅ Mesma quantidade de registros em ambas tabelas
- ✅ Nomes sincronizados
- ✅ Emails correspondentes

---

## ✅ **Após Executar:**

1. **Recarregue a aplicação** (F5)
2. **Erro `ERR_CONNECTION_CLOSED` deve sumir**
3. **Todos os serviços funcionarão**
4. **Sincronização automática ativa** ✨

---

## 📝 **Notas Importantes**

### **Sincronização Automática:**
- ✅ INSERT em `employees` → Cria em `profiles`
- ✅ UPDATE em `employees` → Atualiza `profiles`
- ⚠️ DELETE em `employees` → NÃO deleta `profiles` (por segurança)

### **Permissões:**
- `superadmin` → `permissions = ['*']`
- Outros → `permissions = ['dashboard.view']`

### **RLS:**
A tabela `profiles` deve ter RLS habilitado. Verifique com:
```sql
SELECT rowsecurity FROM pg_tables 
WHERE tablename = 'profiles';
```

Se não estiver habilitado:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## 🚀 **Ação Necessária**

**Execute AGORA:**
1. Abra Supabase SQL Editor
2. Cole o conteúdo de `FIX_PROFILES_SYNC.sql`
3. Execute todo o script
4. Recarregue a aplicação

**Tudo deve funcionar!** ✨


