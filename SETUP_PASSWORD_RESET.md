# 🔐 Configuração do Sistema de Recuperação de Senha

## 📋 Pré-requisitos

1. **Supabase configurado** com as tabelas básicas
2. **Resend API Key** para envio de emails
3. **Variáveis de ambiente** configuradas

## 🚀 Passo a Passo

### 1. Executar Schema no Supabase

**Opção A: Script Automático**
```bash
# No terminal do projeto
npm run setup-password-reset
```

**Opção B: Manual (Recomendado)**
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Execute o conteúdo do arquivo `database/password_reset_schema.sql`

### 2. Configurar Resend

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Gere uma API Key
4. Adicione no arquivo `.env`:

```env
VITE_RESEND_API_KEY=re_xxxxxxxxx
```

### 3. Verificar Configuração

```bash
# Instalar dependências
npm install

# Executar projeto
npm run dev
```

## 🧪 Testar o Fluxo

1. **Acesse** `/forgot-password`
2. **Digite** seu email cadastrado
3. **Verifique** sua caixa de entrada
4. **Clique** no link do email
5. **Redefina** sua senha

## 📊 Funcionalidades Implementadas

### ✅ Segurança
- **Tokens únicos** e seguros
- **Expiração** de 1 hora
- **Rate limiting** (3 tentativas/hora)
- **Validação** de senha robusta
- **Tokens únicos** (não reutilizáveis)

### ✅ Banco de Dados
- **Tabela** `password_reset_tokens`
- **Índices** para performance
- **RLS Policies** para segurança
- **Funções** de limpeza automática

### ✅ Interface
- **Design consistente** com Login
- **Validação em tempo real**
- **Feedback visual** completo
- **Estados de loading** informativos

### ✅ Email
- **Templates HTML** profissionais
- **Design responsivo**
- **Instruções claras**
- **Segurança** (não reutilizável)

## 🔧 Estrutura do Sistema

```
src/
├── services/
│   ├── passwordResetService.ts    # Lógica de negócio
│   └── emailService.ts            # Envio de emails
├── pages/
│   ├── ForgotPassword.tsx         # Solicitar recuperação
│   └── ResetPassword.tsx          # Redefinir senha
└── database/
    └── password_reset_schema.sql  # Schema do banco
```

## 🚨 Troubleshooting

### Erro: "Token inválido"
- Verifique se executou o schema no Supabase
- Confirme se a tabela `password_reset_tokens` existe

### Erro: "Email não enviado"
- Verifique se `VITE_RESEND_API_KEY` está configurada
- Confirme se a API Key do Resend é válida

### Erro: "Rate limit exceeded"
- Aguarde 1 hora antes de tentar novamente
- Ou limpe os tokens antigos no banco

## 📈 Monitoramento

### Verificar Tokens no Banco
```sql
SELECT 
  email,
  created_at,
  expires_at,
  used,
  used_at
FROM password_reset_tokens
ORDER BY created_at DESC
LIMIT 10;
```

### Limpar Tokens Expirados
```sql
SELECT cleanup_expired_password_reset_tokens();
```

## 🎯 Próximos Passos

1. **Configurar** Resend API Key
2. **Executar** schema no Supabase
3. **Testar** fluxo completo
4. **Monitorar** logs de erro
5. **Configurar** limpeza automática (cron job)

---

**✅ Sistema pronto para uso em produção!**
