# 🏦 Configuração do Sistema Financeiro

Este documento contém as instruções para configurar o sistema financeiro da plataforma MedStaff.

## 📋 Status Atual

✅ **Concluído:**
- Tipos TypeScript criados (`src/types/financial.ts`)
- Serviços financeiros implementados (`src/services/financialService.ts`)
- Componentes React criados
- Script de configuração do banco pronto

❌ **Pendente:**
- Criação das tabelas no Supabase
- Configuração de políticas RLS
- Teste da integração completa

## 🚀 Próximos Passos

### 1. Criar Tabelas no Supabase

Execute o comando para ver as instruções:

```bash
npm run setup-db
```

Ou execute diretamente:

```bash
node scripts/create-tables-sql.mjs
```

### 2. Executar SQL no Supabase Dashboard

1. **Acesse o Supabase Dashboard:**
   - 🔗 https://supabase.com/dashboard/project/okhnuikljprxavymnlkn/editor

2. **Clique em "SQL Editor" no menu lateral**

3. **Cole e execute o SQL completo** que será exibido pelo script

4. **Após executar o SQL, execute novamente:**
   ```bash
   npm run setup-db
   ```

### 3. Verificar Criação das Tabelas

O script verificará automaticamente se as tabelas foram criadas e inserirá dados de exemplo.

## 📊 Tabelas que serão criadas

- **`financial_categories`** - Categorias de receitas e despesas
- **`bank_accounts`** - Contas bancárias da empresa
- **`payment_methods`** - Métodos de pagamento disponíveis
- **`revenues`** - Receitas da empresa
- **`expenses`** - Despesas da empresa

## 🔒 Próximas Etapas de Segurança

Após criar as tabelas, será necessário:

1. **Implementar políticas RLS (Row Level Security)**
2. **Configurar autenticação e autorização**
3. **Testar a integração completa**

## 🛠️ Scripts Disponíveis

- `npm run setup-db` - Verifica e configura o banco de dados
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção

## 📁 Estrutura dos Arquivos

```
src/
├── types/financial.ts          # Tipos TypeScript
├── services/financialService.ts # Serviços de API
├── components/financial/       # Componentes React
└── pages/financial/           # Páginas do sistema

scripts/
└── create-tables-sql.mjs      # Script de configuração do banco
```

## ⚠️ Importante

- **Não execute o script em produção** sem antes testar em desenvolvimento
- **Faça backup** antes de executar qualquer SQL em produção
- **Verifique as variáveis de ambiente** no arquivo `.env`

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se as variáveis de ambiente estão configuradas
2. Confirme se o projeto Supabase está ativo
3. Execute `npm run setup-db` para ver instruções atualizadas