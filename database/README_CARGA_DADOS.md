# Scripts de Carga de Dados - MedStaff

Este diretório contém scripts SQL para popular o banco de dados do sistema MedStaff com dados de exemplo para desenvolvimento e testes.

## 📋 Arquivos Disponíveis

### Scripts de Inserção de Dados

1. **`insert_clientes_pf.sql`**
   - Insere dados de exemplo para clientes pessoa física
   - 10 registros com diferentes perfis de médicos
   - Inclui dados completos: CPF, endereço, contatos, etc.

2. **`insert_clientes_pj.sql`**
   - Insere dados de exemplo para clientes pessoa jurídica
   - 8 registros de clínicas, hospitais e consultórios
   - Inclui dados empresariais: CNPJ, razão social, etc.

3. **`insert_declaracoes_irpf.sql`**
   - Insere declarações de IRPF vinculadas aos clientes PF
   - Múltiplas declarações por cliente (anos diferentes)
   - Dados realistas de valores e status

4. **`insert_servicos_especiais.sql`**
   - Insere serviços especiais vinculados aos clientes PJ
   - Diferentes tipos de serviços com dados JSONB
   - Status variados para simular fluxo real

5. **`insert_pipelines.sql`**
   - Insere pipelines de vendas
   - Vinculados a leads e clientes
   - Diferentes estágios e propostas comerciais

6. **`insert_leads.sql`**
   - Insere leads de diferentes origens
   - Status variados do funil de vendas
   - Dados de contato e interesse

### Scripts de Verificação e Testes

7. **`verify_relationships.sql`**
   - Verifica integridade dos relacionamentos entre tabelas
   - Identifica inconsistências nos dados
   - Valida campos JSONB e temporais
   - Gera relatórios de consistência

8. **`performance_tests.sql`**
   - Testa consultas complexas do sistema
   - Análises de dashboard e métricas
   - Consultas com JOINs, agregações e window functions
   - Testes de performance com dados JSONB

## 🚀 Como Executar

### Pré-requisitos
- Acesso ao Supabase SQL Editor
- Banco de dados com schema já criado
- Usuários criados no sistema (para foreign keys)

### Ordem de Execução

1. **Primeiro, execute os scripts de inserção na ordem:**
   ```sql
   -- 1. Clientes (base para outros relacionamentos)
   \i insert_clientes_pf.sql
   \i insert_clientes_pj.sql
   
   -- 2. Leads (independente)
   \i insert_leads.sql
   
   -- 3. Serviços vinculados aos clientes
   \i insert_declaracoes_irpf.sql
   \i insert_servicos_especiais.sql
   
   -- 4. Pipelines (vinculados a leads e clientes)
   \i insert_pipelines.sql
   ```

2. **Depois, execute as verificações:**
   ```sql
   -- Verificar integridade
   \i verify_relationships.sql
   
   -- Testar performance
   \i performance_tests.sql
   ```

### Execução Manual no Supabase

1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Copie e cole o conteúdo de cada arquivo
4. Execute um arquivo por vez
5. Verifique os resultados antes de prosseguir

## 📊 Dados Inseridos

### Resumo Quantitativo
- **Clientes PF**: 10 registros
- **Clientes PJ**: 8 registros  
- **Leads**: 10 registros
- **Declarações IRPF**: ~20 registros (múltiplas por cliente)
- **Serviços Especiais**: ~15 registros
- **Pipelines**: ~12 registros

### Características dos Dados

#### Clientes PF
- Médicos de diferentes especialidades
- Endereços em São Paulo/SP
- Status variados (ativo, inativo, prospecto)
- CPFs válidos para testes

#### Clientes PJ
- Clínicas, hospitais e consultórios
- CNPJs válidos para testes
- Diferentes portes e especialidades
- Endereços comerciais realistas

#### Leads
- Diferentes origens (site, indicação, eventos, etc.)
- Status do funil completo (novo → ganho/perdido)
- Produtos de interesse variados
- Datas de follow-up futuras

#### Declarações IRPF
- Anos de exercício: 2022, 2023, 2024
- Status: rascunho, em_andamento, entregue
- Valores realistas de imposto e restituição
- Datas de entrega dentro dos prazos

#### Serviços Especiais
- Tipos: contabilidade_pj, consultoria_tributaria, etc.
- Dados JSONB com valores, prazos e observações
- Status do fluxo de trabalho
- Vinculação correta com clientes PJ

#### Pipelines
- Estágios: prospecção → fechamento
- Propostas comerciais em JSONB
- Histórico de interações
- Vinculação com leads e clientes

## 🔍 Verificações Importantes

### Integridade Referencial
- Todos os foreign keys são válidos
- Relacionamentos entre tabelas consistentes
- Dados JSONB bem formados

### Consistência Temporal
- `created_at` sempre ≤ `updated_at`
- Datas de follow-up no futuro
- Sequência lógica de status

### Dados Realistas
- CPFs e CNPJs válidos (algoritmo)
- Endereços e telefones brasileiros
- Valores monetários coerentes
- Nomes e empresas verossímeis

## ⚠️ Observações Importantes

1. **Usuários**: Os scripts assumem que existe pelo menos um usuário na tabela `auth.users`. Ajuste as referências conforme necessário.

2. **IDs**: Todos os IDs são gerados automaticamente (UUID). Não há dependência de valores específicos.

3. **Ambiente**: Estes dados são apenas para desenvolvimento/teste. **NÃO use em produção**.

4. **Performance**: Os scripts de teste podem demorar alguns segundos para executar devido à complexidade das consultas.

5. **Limpeza**: Para limpar os dados, execute `DELETE` nas tabelas na ordem inversa da inserção.

## 🛠️ Troubleshooting

### Erro de Foreign Key
- Verifique se existem usuários em `auth.users`
- Execute os scripts na ordem correta
- Confirme que o schema está atualizado

### Erro de JSONB
- Verifique a sintaxe JSON nos dados
- Confirme que as colunas são do tipo JSONB
- Teste com dados menores primeiro

### Performance Lenta
- Execute os scripts em horários de menor uso
- Monitore o uso de recursos do Supabase
- Considere executar em lotes menores

## 📈 Próximos Passos

Após executar todos os scripts:

1. Teste as funcionalidades do sistema
2. Verifique os dashboards e relatórios
3. Ajuste os dados conforme necessário
4. Documente quaisquer problemas encontrados
5. Considere criar scripts de limpeza automática

---

**Criado em**: Janeiro 2024  
**Versão**: 1.0  
**Compatibilidade**: Supabase PostgreSQL 15+