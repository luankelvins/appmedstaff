# Documentação Completa da API MedStaff

## Informações Gerais
- **Versão da API**: 1.0.0
- **Base URL**: `http://localhost:3001/api/v1`
- **Autenticação**: Bearer Token (JWT)
- **Formato**: JSON

---

## 1. Autenticação e Autorização

### Login e Registro
- **POST** `/auth/login` - Fazer login no sistema
  - **Body**: `{ email, password }`
  - **Response**: Token JWT e dados do usuário

- **POST** `/auth/register` - Registrar novo usuário
  - **Body**: `{ nome, email, password, role }`

- **POST** `/auth/verify` - Verificar conta de usuário

- **POST** `/auth/forgot-password` - Solicitar redefinição de senha

- **POST** `/auth/reset-password` - Redefinir senha

- **POST** `/auth/refresh-token` - Renovar token de acesso

### Perfil do Usuário
- **GET** `/auth/me` - Obter dados do usuário logado

- **GET** `/auth/user/:userId` - Obter dados de usuário específico

- **PUT** `/auth/update-password` - Atualizar senha do usuário

- **POST** `/auth/logout` - Fazer logout

---

## 2. Autenticação de Dois Fatores (2FA)

- **GET** `/2fa/status` - Verificar status do 2FA
  - **Response**: Status de ativação do 2FA

- **POST** `/2fa/generate-secret` - Gerar segredo para 2FA
  - **Response**: QR Code e chave secreta

- **POST** `/2fa/enable` - Ativar 2FA
  - **Body**: `{ token }`

- **POST** `/2fa/disable` - Desativar 2FA
  - **Body**: `{ token }`

- **POST** `/2fa/regenerate-backup-codes` - Regenerar códigos de backup

- **POST** `/2fa/verify` - Verificar token 2FA
  - **Body**: `{ token }`

---

## 3. Dashboard e Métricas

### Dashboard Principal
- **GET** `/dashboard/quick-stats` - Estatísticas rápidas do dashboard
  - **Response**: Resumo geral de leads, tarefas, funcionários

- **GET** `/dashboard/tasks-metrics` - Métricas de tarefas

- **GET** `/dashboard/leads-metrics` - Métricas de leads

- **GET** `/dashboard/financial-metrics` - Métricas financeiras

- **GET** `/dashboard/system-metrics` - Métricas do sistema

- **GET** `/dashboard/notifications` - Notificações do dashboard

### Dashboard de Segurança
- **GET** `/security-dashboard/overview` - Visão geral de segurança
  - **Response**: Métricas de segurança e alertas

- **GET** `/security-dashboard/alerts` - Alertas de segurança
  - **Response**: Lista de alertas de segurança

- **GET** `/security-dashboard/public-metrics` - Métricas públicas

- **GET** `/security-dashboard/metrics` - Métricas detalhadas de segurança

---

## 4. Gestão de Funcionários

### CRUD de Funcionários
- **GET** `/employees` - Listar funcionários
  - **Query Params**: `page`, `limit`, `search`, `status`

- **GET** `/employees/stats` - Estatísticas de funcionários

- **GET** `/employees/search` - Buscar funcionários
  - **Query Params**: `q` (termo de busca)

- **GET** `/employees/:id` - Obter funcionário por ID

- **POST** `/employees` - Criar novo funcionário
  - **Body**: `{ nome, email, telefone, cargo, departamento, salario, dataAdmissao }`

- **PUT** `/employees/:id` - Atualizar funcionário completo

- **PATCH** `/employees/:id/status` - Atualizar status do funcionário
  - **Body**: `{ status }`

- **DELETE** `/employees/:id` - Excluir funcionário

---

## 5. Gestão de Tarefas

### CRUD de Tarefas
- **GET** `/tasks` - Listar tarefas
  - **Query Params**: `page`, `limit`, `status`, `priority`, `assignedTo`

- **GET** `/tasks/stats` - Estatísticas de tarefas

- **GET** `/tasks/user/:userId` - Tarefas de um usuário específico

- **GET** `/tasks/assigned/:userId` - Tarefas atribuídas a um usuário

- **GET** `/tasks/:id` - Obter tarefa por ID

- **POST** `/tasks` - Criar nova tarefa
  - **Body**: `{ titulo, descricao, prioridade, dataVencimento, responsavelId }`

- **PUT** `/tasks/:id` - Atualizar tarefa completa

- **PATCH** `/tasks/:id/status` - Atualizar status da tarefa
  - **Body**: `{ status }`

- **DELETE** `/tasks/:id` - Excluir tarefa

---

## 6. Gestão de Leads

### CRUD de Leads
- **GET** `/leads` - Listar leads
  - **Query Params**: `page`, `limit`, `status`, `origem`, `responsavelId`

- **GET** `/leads/stats` - Estatísticas de leads

- **GET** `/leads/follow-up` - Leads para follow-up

- **GET** `/leads/responsible/:responsavelId` - Leads por responsável

- **GET** `/leads/status/:status` - Leads por status

- **GET** `/leads/:id` - Obter lead por ID

- **POST** `/leads` - Criar novo lead
  - **Body**: `{ nome, email, telefone, empresa, origem, observacoes }`

- **PUT** `/leads/:id` - Atualizar lead completo

- **PATCH** `/leads/:id/status` - Atualizar status do lead
  - **Body**: `{ status }`

- **DELETE** `/leads/:id` - Excluir lead

---

## 7. Gestão de Clientes Pessoa Física

### CRUD de Clientes PF
- **GET** `/clientes-pf` - Listar clientes pessoa física
  - **Query Params**: `page`, `limit`, `status`, `responsavelId`

- **GET** `/clientes-pf/stats` - Estatísticas de clientes PF

- **GET** `/clientes-pf/cpf/:cpf` - Buscar cliente por CPF

- **GET** `/clientes-pf/responsible/:responsavelId` - Clientes por responsável

- **GET** `/clientes-pf/:id` - Obter cliente PF por ID

- **POST** `/clientes-pf` - Criar novo cliente PF
  - **Body**: `{ nome, email, telefone, cpf, endereco, responsavelId }`

- **PUT** `/clientes-pf/:id` - Atualizar cliente PF completo

- **PATCH** `/clientes-pf/:id/status` - Atualizar status do cliente PF

- **POST** `/clientes-pf/:id/documentos` - Upload de documentos

- **DELETE** `/clientes-pf/:id` - Excluir cliente PF

---

## 8. Gestão de Clientes Pessoa Jurídica

### CRUD de Clientes PJ
- **GET** `/clientes-pj` - Listar clientes pessoa jurídica
  - **Query Params**: `page`, `limit`, `status`

- **GET** `/clientes-pj/stats` - Estatísticas de clientes PJ

- **GET** `/clientes-pj/cnpj/:cnpj` - Buscar cliente por CNPJ

- **GET** `/clientes-pj/:id` - Obter cliente PJ por ID

- **POST** `/clientes-pj` - Criar novo cliente PJ
  - **Body**: `{ razaoSocial, nomeFantasia, cnpj, email, telefone, endereco }`

- **PUT** `/clientes-pj/:id` - Atualizar cliente PJ completo

- **PATCH** `/clientes-pj/:id/status` - Atualizar status do cliente PJ

- **PATCH** `/clientes-pj/:id/certificado-digital` - Atualizar certificado digital

- **DELETE** `/clientes-pj/:id` - Excluir cliente PJ

---

## 9. Sistema de Notificações

### CRUD de Notificações
- **GET** `/notifications` - Listar notificações
  - **Query Params**: `page`, `limit`, `type`, `read`

- **GET** `/notifications/user/:userId` - Notificações de um usuário

- **GET** `/notifications/user/:userId/unread` - Notificações não lidas

- **GET** `/notifications/user/:userId/unread/count` - Contador de não lidas

- **GET** `/notifications/:id` - Obter notificação por ID

- **POST** `/notifications` - Criar nova notificação
  - **Body**: `{ userId, titulo, mensagem, tipo, dados }`

- **POST** `/notifications/bulk` - Criar notificações em lote

- **PATCH** `/notifications/:id/read` - Marcar como lida

- **PATCH** `/notifications/user/:userId/read-all` - Marcar todas como lidas

- **PATCH** `/notifications/read-multiple` - Marcar múltiplas como lidas

- **DELETE** `/notifications/cleanup` - Limpeza de notificações antigas

- **DELETE** `/notifications/:id` - Excluir notificação

---

## 10. Gestão Financeira

### CRUD de Despesas
- **GET** `/expenses` - Listar despesas
  - **Query Params**: `page`, `limit`, `status`, `categoria`, `dataInicio`, `dataFim`

- **GET** `/expenses/overdue` - Despesas em atraso

- **GET** `/expenses/due-soon` - Despesas vencendo em breve

- **GET** `/expenses/total/:period` - Total de despesas por período

- **GET** `/expenses/:id` - Obter despesa por ID

- **POST** `/expenses` - Criar nova despesa
  - **Body**: `{ descricao, valor, categoria, dataVencimento, fornecedor }`

- **PUT** `/expenses/:id` - Atualizar despesa completa

- **PATCH** `/expenses/:id/pay` - Marcar despesa como paga

- **PATCH** `/expenses/:id/cancel` - Cancelar despesa

- **POST** `/expenses/:id/anexos` - Upload de anexos

- **DELETE** `/expenses/:id/anexos/:anexoId` - Excluir anexo

- **DELETE** `/expenses/:id` - Excluir despesa

---

## 11. Sistema de Alertas e Monitoramento

### Alertas e Health Check
- **GET** `/alerts/health-check` - Verificação de saúde do sistema

- **GET** `/alerts/stats` - Estatísticas de alertas

- **GET** `/alerts/config` - Configurações de alertas

- **POST** `/alerts/test` - Testar sistema de alertas

- **GET** `/alerts/health` - Status de saúde detalhado

---

## Códigos de Status HTTP

### Sucesso
- **200** - OK: Requisição bem-sucedida
- **201** - Created: Recurso criado com sucesso
- **204** - No Content: Operação bem-sucedida sem conteúdo

### Erro do Cliente
- **400** - Bad Request: Dados inválidos
- **401** - Unauthorized: Token inválido ou ausente
- **403** - Forbidden: Acesso negado
- **404** - Not Found: Recurso não encontrado
- **409** - Conflict: Conflito de dados (ex: email já existe)
- **422** - Unprocessable Entity: Dados não processáveis

### Erro do Servidor
- **500** - Internal Server Error: Erro interno do servidor
- **503** - Service Unavailable: Serviço indisponível

---

## Estruturas de Dados Principais

### User
```json
{
  "id": "string",
  "nome": "string",
  "email": "string",
  "role": "admin|user|manager",
  "ativo": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Lead
```json
{
  "id": "string",
  "nome": "string",
  "email": "string",
  "telefone": "string",
  "empresa": "string",
  "origem": "string",
  "status": "novo|contato|qualificado|proposta|fechado|perdido",
  "observacoes": "string",
  "responsavelId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Task
```json
{
  "id": "string",
  "titulo": "string",
  "descricao": "string",
  "status": "pendente|em_andamento|concluida|cancelada",
  "prioridade": "baixa|media|alta|urgente",
  "dataVencimento": "datetime",
  "responsavelId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Employee
```json
{
  "id": "string",
  "nome": "string",
  "email": "string",
  "telefone": "string",
  "cargo": "string",
  "departamento": "string",
  "salario": "number",
  "status": "ativo|inativo|suspenso",
  "dataAdmissao": "date",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## Autenticação

Todos os endpoints protegidos requerem um token JWT no header:
```
Authorization: Bearer <token>
```

O token é obtido através do endpoint `/auth/login` e tem validade de 24 horas.

---

## Paginação

Endpoints que retornam listas suportam paginação:
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máximo: 100)

Resposta inclui metadados de paginação:
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```