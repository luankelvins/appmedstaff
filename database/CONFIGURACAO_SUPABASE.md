# Configuração do Supabase para MedStaff

Este guia explica como configurar o banco de dados Supabase para o projeto MedStaff com funcionalidades avançadas.

## 1. Configuração Inicial

### 1.1 Acesse seu projeto Supabase
1. Faça login em [supabase.com](https://supabase.com)
2. Acesse seu projeto: `https://okhnuikljprxavymnlkn.supabase.co`
3. Vá para a seção **SQL Editor**

### 1.2 Execute o script de configuração
1. Copie todo o conteúdo do arquivo `database/setup.sql`
2. Cole no SQL Editor do Supabase
3. Clique em **Run** para executar o script

## 2. Funcionalidades Implementadas

### 2.1 Tabelas Criadas
- **`profiles`** - Perfis de usuário vinculados ao auth.users
- **`employees`** - Dados completos dos funcionários (JSONB estruturado)
- **`tasks`** - Sistema completo de gerenciamento de tarefas
- **`leads`** - Sistema de CRM para gestão de leads

### 2.2 Funcionalidades Avançadas
- **Triggers automáticos** para atualização de `updated_at`
- **Índices otimizados** para consultas rápidas
- **Função de inicialização** de dados de exemplo
- **Políticas RLS robustas** com controle de acesso baseado em roles

### 2.3 Sistema de Permissões
- **Usuários regulares**: Acesso limitado aos próprios dados
- **Administradores**: Acesso completo (detectados por cargo: admin, gerente, diretor)
- **Segurança por nível**: Diferentes permissões para SELECT, INSERT, UPDATE, DELETE

## 3. Variáveis de Ambiente

Certifique-se de que seu arquivo `.env` contém:

```env
VITE_SUPABASE_URL=https://okhnuikljprxavymnlkn.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

## 4. Inicialização de Dados

### 4.1 Função Automática de Inicialização
O script inclui uma função `initialize_sample_data()` que:
- Verifica se já existem dados nas tabelas
- Insere dados de exemplo apenas se as tabelas estiverem vazias
- Cria 5 funcionários, 3 tarefas e 3 leads de exemplo
- Inclui dados realistas com estrutura JSONB completa

### 4.2 Executar Inicialização
```sql
-- Execute no SQL Editor para inicializar dados de exemplo
SELECT initialize_sample_data();
```

## 5. Teste da Conexão

### 5.1 Componente de Diagnóstico Avançado
O componente `SupabaseTest` verifica:
- ✅ Configuração de variáveis de ambiente
- ✅ Conexão básica com Supabase
- ✅ Acesso a cada tabela (profiles, employees, tasks, leads)
- ✅ Funcionamento do supabaseService
- ✅ Contagem de registros existentes
- ✅ Capacidade de inicialização de dados

### 5.2 Como usar
1. Acesse a aplicação em `http://localhost:3000`
2. O componente mostra status detalhado de cada verificação
3. Use o botão "Inicializar Dados de Exemplo" se necessário

## 7. Políticas de Segurança (RLS)

### 7.1 Função de Detecção de Admin
```sql
-- Detecta automaticamente administradores baseado no cargo
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND (position ILIKE '%admin%' OR position ILIKE '%gerente%' OR position ILIKE '%diretor%')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 7.2 Níveis de Acesso
- **Profiles**: Usuários veem próprio perfil, admins veem todos
- **Employees**: Todos veem dados básicos, apenas admins modificam
- **Tasks**: Acesso baseado em atribuição/criação + admin override
- **Leads**: Acesso baseado em atribuição + admin override

## 8. Próximos Passos Recomendados

### 8.1 Configuração Adicional
1. **Autenticação**: Configurar providers (Google, GitHub, etc.)
2. **Storage**: Configurar bucket para uploads de arquivos
3. **Edge Functions**: Implementar lógica de negócio serverless
4. **Realtime**: Ativar subscriptions para atualizações em tempo real

### 8.2 Otimizações
1. **Índices customizados**: Baseados nos padrões de consulta
2. **Views materializadas**: Para relatórios complexos
3. **Particionamento**: Para tabelas com grande volume
4. **Cache**: Implementar estratégias de cache

### 8.3 Monitoramento
1. **Logs**: Configurar logging detalhado
2. **Métricas**: Monitorar performance das queries
3. **Alertas**: Configurar alertas para problemas
4. **Backup**: Estratégia de backup automatizada

## 9. Troubleshooting Avançado

### 9.1 Problemas de Conexão
```bash
# Verificar conectividade
curl -I https://okhnuikljprxavymnlkn.supabase.co

# Testar API
curl -H "apikey: SUA_CHAVE" https://okhnuikljprxavymnlkn.supabase.co/rest/v1/employees
```

### 9.2 Problemas de Permissão
- Verificar se o usuário está autenticado
- Confirmar se as políticas RLS estão ativas
- Testar com diferentes níveis de usuário
- Verificar logs do Supabase Dashboard

### 9.3 Performance
- Analisar query plans no Dashboard
- Verificar uso de índices
- Monitorar tempo de resposta das APIs
- Otimizar consultas JSONB quando necessário

## 6. Estrutura dos Dados Aprimorada

### 6.1 Employees (Funcionários) - Estrutura Completa
```json
{
  "dados_pessoais": {
    "nome": "João Silva",
    "cpf": "123.456.789-00",
    "telefone": "(11) 99999-1111",
    "emailPessoal": "joao.silva@medstaff.com",
    "endereco": {
      "rua": "Rua das Flores, 123",
      "cidade": "São Paulo",
      "cep": "01234-567"
    },
    "dataNascimento": "1990-05-15"
  },
  "dados_profissionais": {
    "cargo": "Desenvolvedor Senior",
    "departamento": "Tecnologia",
    "dataAdmissao": "2023-01-15",
    "numeroRegistro": "EMP001",
    "supervisor": "Carlos Mendes",
    "horarioTrabalho": "09:00-18:00"
  },
  "dados_financeiros": {
    "salario": 8000,
    "beneficios": ["Vale Refeição", "Plano de Saúde", "Vale Transporte"],
    "contaBancaria": {
      "banco": "Banco do Brasil",
      "agencia": "1234",
      "conta": "56789-0"
    }
  }
}
```

### 6.2 Tasks (Tarefas)
- **Status**: pendente, em_andamento, concluida
- **Priority**: baixa, media, alta
- **Controle de acesso**: Usuários veem apenas tarefas atribuídas/criadas por eles
- **Admins**: Acesso completo a todas as tarefas

### 6.3 Leads
- **Status**: novo, qualificado, em_negociacao, fechado
- **Stage**: prospeccao, proposta, negociacao, fechamento
- **Dados completos**: empresa, valor, fonte, notas
- **Atribuição**: Leads podem ser atribuídos a usuários específicos