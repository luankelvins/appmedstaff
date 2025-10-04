# Instruções para Execução Manual dos Scripts de Carga de Dados

## 📋 Visão Geral

Este documento fornece instruções detalhadas para executar manualmente os scripts de carga de dados no Supabase SQL Editor, devido a problemas de conectividade com o MCP (Model Context Protocol).

## 🚀 Pré-requisitos

1. **Acesso ao Supabase Dashboard**: Certifique-se de ter acesso ao projeto no Supabase
2. **Permissões de Administrador**: Necessário para executar scripts DDL/DML
3. **Schema Criado**: O schema deve estar criado conforme `setup.sql`

## 📁 Arquivos Disponíveis

### Scripts de Inserção (Ordem de Execução)
1. `insert_clientes_pf.sql` - Clientes Pessoa Física
2. `insert_clientes_pj.sql` - Clientes Pessoa Jurídica  
3. `insert_leads.sql` - Leads e Prospects
4. `insert_declaracoes_irpf.sql` - Declarações de IRPF
5. `insert_servicos_especiais.sql` - Serviços Especiais
6. `insert_pipelines.sql` - Pipelines de Vendas

### Scripts de Verificação
- `verify_relationships.sql` - Verificação de integridade
- `performance_tests.sql` - Testes de performance

### Script Consolidado
- `execute_all_inserts.sql` - **RECOMENDADO**: Todos os inserts em um arquivo

## 🎯 Método Recomendado: Script Consolidado

### Passo 1: Acessar o Supabase SQL Editor
1. Faça login no [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Navegue para **SQL Editor** no menu lateral

### Passo 2: Executar o Script Consolidado
1. Abra o arquivo `execute_all_inserts.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** ou pressione `Ctrl+Enter`

### Passo 3: Verificar Resultados
O script inclui queries de verificação no final que mostrarão:
- Contagem de registros inseridos por tabela
- Verificação de integridade referencial
- Estatísticas básicas dos dados

## 🔄 Método Alternativo: Execução Individual

Se preferir executar os scripts individualmente:

### Ordem de Execução Obrigatória
```
1. insert_clientes_pf.sql
2. insert_clientes_pj.sql
3. insert_leads.sql
4. insert_declaracoes_irpf.sql
5. insert_servicos_especiais.sql
6. insert_pipelines.sql
```

### Para cada script:
1. Abra o arquivo no editor de texto
2. Copie o conteúdo
3. Cole no Supabase SQL Editor
4. Execute com **Run**
5. Verifique se não há erros antes de prosseguir

## ✅ Verificação de Integridade

Após executar todos os inserts, execute:

```sql
-- Verificação rápida de contagens
SELECT 'clientes_pf' as tabela, COUNT(*) as registros FROM clientes_pf
UNION ALL
SELECT 'clientes_pj', COUNT(*) FROM clientes_pj
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'declaracoes_irpf', COUNT(*) FROM declaracoes_irpf
UNION ALL
SELECT 'servicos_especiais', COUNT(*) FROM servicos_especiais
UNION ALL
SELECT 'pipelines', COUNT(*) FROM pipelines;
```

**Resultados Esperados:**
- clientes_pf: 10 registros
- clientes_pj: 8 registros
- leads: 15 registros
- declaracoes_irpf: 12 registros
- servicos_especiais: 10 registros
- pipelines: 12 registros

## 🔍 Verificação Completa

Para uma verificação completa, execute:
```bash
# No Supabase SQL Editor
-- Cole o conteúdo de verify_relationships.sql
```

## ⚠️ Troubleshooting

### Erro: "relation does not exist"
- **Causa**: Schema não foi criado
- **Solução**: Execute primeiro o `setup.sql`

### Erro: "duplicate key value violates unique constraint"
- **Causa**: Dados já foram inseridos
- **Solução**: Limpe as tabelas ou use `ON CONFLICT` clauses

### Erro: "foreign key constraint violation"
- **Causa**: Ordem de execução incorreta
- **Solução**: Siga a ordem especificada acima

### Erro: "permission denied"
- **Causa**: Usuário sem permissões adequadas
- **Solução**: Use uma conta com privilégios de administrador

## 🧹 Limpeza (Se Necessário)

Para limpar os dados e recomeçar:

```sql
-- CUIDADO: Isso apagará todos os dados!
TRUNCATE TABLE pipelines CASCADE;
TRUNCATE TABLE servicos_especiais CASCADE;
TRUNCATE TABLE declaracoes_irpf CASCADE;
TRUNCATE TABLE leads CASCADE;
TRUNCATE TABLE clientes_pj CASCADE;
TRUNCATE TABLE clientes_pf CASCADE;
```

## 📊 Dados Inseridos

### Características dos Dados
- **Realistas**: Nomes, CPFs, CNPJs e endereços brasileiros
- **Consistentes**: Relacionamentos íntegros entre tabelas
- **Variados**: Diferentes cenários de negócio
- **Testáveis**: Dados adequados para testes de funcionalidade

### Cenários Cobertos
- Clientes ativos e inativos
- Leads em diferentes estágios
- Declarações de IRPF de anos variados
- Serviços especiais diversos
- Pipelines com diferentes status

## 🎯 Próximos Passos

Após a carga bem-sucedida:

1. **Teste a Aplicação**: Verifique se os dados aparecem corretamente
2. **Execute Testes**: Use `performance_tests.sql` para análises
3. **Monitore Performance**: Observe o comportamento com dados reais
4. **Backup**: Considere fazer backup dos dados de teste

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de erro no Supabase
2. Confirme as permissões do usuário
3. Valide a estrutura do schema
4. Consulte a documentação do Supabase

---

**Nota**: Esta documentação foi criada devido a problemas temporários com o MCP do Supabase. Uma vez resolvidos, os scripts podem ser executados automaticamente via ferramentas de CI/CD.