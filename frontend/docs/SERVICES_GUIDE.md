# Guia de Uso dos Serviços - MedStaff

Este documento fornece um guia completo sobre como usar os novos serviços implementados no frontend da aplicação MedStaff.

## Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura dos Serviços](#estrutura-dos-serviços)
3. [AuthService](#authservice)
4. [EmployeesService](#employeesservice)
5. [TasksService](#tasksservice)
6. [LeadsService](#leadsservice)
7. [NotificationsService](#notificationsservice)
8. [ExpensesService](#expensesservice)
9. [Como Usar nos Componentes](#como-usar-nos-componentes)
10. [Tratamento de Erros](#tratamento-de-erros)
11. [Testes](#testes)

## Visão Geral

Os serviços foram criados para centralizar toda a lógica de comunicação com a API e fornecer uma interface consistente para os componentes React. Cada serviço é uma classe singleton que gerencia:

- Comunicação HTTP com endpoints específicos
- Validação de dados
- Formatação de dados para exibição
- Cache local quando apropriado
- Tratamento de erros padronizado

## Estrutura dos Serviços

Todos os serviços seguem o mesmo padrão arquitetural:

```typescript
class ServiceName {
  private static instance: ServiceName;
  
  public static getInstance(): ServiceName {
    if (!ServiceName.instance) {
      ServiceName.instance = new ServiceName();
    }
    return ServiceName.instance;
  }
  
  // Métodos CRUD
  // Métodos de validação
  // Métodos de formatação
  // Métodos utilitários
}
```

## AuthService

### Funcionalidades Principais

- Autenticação de usuários (login/logout)
- Registro de novos usuários
- Gerenciamento de tokens JWT
- Autenticação de dois fatores (2FA)
- Recuperação de senha
- Verificação de permissões e roles

### Exemplo de Uso

```typescript
import { AuthService } from '../services/authService';

const authService = AuthService.getInstance();

// Login
const loginData = {
  email: 'usuario@exemplo.com',
  password: 'senha123'
};

try {
  const response = await authService.login(loginData);
  console.log('Login realizado:', response.user);
} catch (error) {
  console.error('Erro no login:', error);
}

// Verificar se está autenticado
if (authService.isAuthenticated()) {
  const user = authService.getUser();
  console.log('Usuário logado:', user);
}

// Verificar permissões
if (authService.hasPermission('users.create')) {
  // Usuário pode criar usuários
}

// Logout
authService.logout();
```

### Métodos Principais

- `login(credentials)` - Realizar login
- `logout()` - Realizar logout
- `register(userData)` - Registrar novo usuário
- `isAuthenticated()` - Verificar se está autenticado
- `hasPermission(permission)` - Verificar permissão específica
- `hasRole(role)` - Verificar role do usuário
- `getCurrentUser()` - Obter dados do usuário atual
- `refreshToken()` - Renovar token de acesso

## EmployeesService

### Funcionalidades Principais

- CRUD completo de funcionários
- Busca e filtros avançados
- Validação de dados de funcionário
- Formatação para exibição

### Exemplo de Uso

```typescript
import { EmployeesService } from '../services/employeesService';

const employeesService = EmployeesService.getInstance();

// Listar funcionários
const employees = await employeesService.getAll();

// Buscar funcionário por ID
const employee = await employeesService.getById(1);

// Criar novo funcionário
const newEmployee = {
  nome: 'João Silva',
  email: 'joao@exemplo.com',
  cargo: 'Desenvolvedor',
  departamento: 'TI'
};

const created = await employeesService.create(newEmployee);

// Atualizar funcionário
const updated = await employeesService.update(1, { cargo: 'Senior Developer' });

// Deletar funcionário
await employeesService.delete(1);

// Buscar com filtros
const filtered = await employeesService.search({
  departamento: 'TI',
  ativo: true
});
```

## TasksService

### Funcionalidades Principais

- Gerenciamento completo de tarefas
- Filtros por status, prioridade, responsável
- Validação de dados de tarefa
- Formatação para exibição

### Exemplo de Uso

```typescript
import { TasksService } from '../services/tasksService';

const tasksService = TasksService.getInstance();

// Listar tarefas
const tasks = await tasksService.getAll();

// Criar nova tarefa
const newTask = {
  titulo: 'Implementar nova funcionalidade',
  descricao: 'Descrição detalhada da tarefa',
  prioridade: 'alta',
  status: 'pendente',
  responsavel_id: 1,
  prazo: '2024-12-31'
};

const created = await tasksService.create(newTask);

// Atualizar status da tarefa
await tasksService.updateStatus(1, 'em_andamento');

// Buscar tarefas por responsável
const userTasks = await tasksService.getByUser(1);

// Buscar tarefas por status
const pendingTasks = await tasksService.getByStatus('pendente');
```

## LeadsService

### Funcionalidades Principais

- Gerenciamento de leads/prospects
- Acompanhamento do funil de vendas
- Validação de dados de contato
- Formatação para exibição

### Exemplo de Uso

```typescript
import { LeadsService } from '../services/leadsService';

const leadsService = LeadsService.getInstance();

// Criar novo lead
const newLead = {
  nome: 'Empresa ABC',
  email: 'contato@empresaabc.com',
  telefone: '(11) 99999-9999',
  status: 'novo',
  fonte: 'website'
};

const created = await leadsService.create(newLead);

// Atualizar status do lead
await leadsService.updateStatus(1, 'qualificado');

// Buscar leads por status
const newLeads = await leadsService.getByStatus('novo');

// Converter lead em cliente
await leadsService.convertToClient(1);
```

## NotificationsService

### Funcionalidades Principais

- Gerenciamento de notificações do sistema
- Marcação de leitura
- Filtros por tipo e status
- Estatísticas de notificações

### Exemplo de Uso

```typescript
import { NotificationsService } from '../services/notificationsService';

const notificationsService = NotificationsService.getInstance();

// Listar notificações do usuário
const notifications = await notificationsService.getUserNotifications(1);

// Marcar como lida
await notificationsService.markAsRead(1);

// Marcar todas como lidas
await notificationsService.markAllAsRead(1);

// Obter estatísticas
const stats = await notificationsService.getStats(1);
console.log(`Não lidas: ${stats.unread}`);

// Criar nova notificação
const newNotification = {
  user_id: 1,
  titulo: 'Nova tarefa atribuída',
  mensagem: 'Você tem uma nova tarefa para revisar',
  tipo: 'info',
  categoria: 'tarefa'
};

await notificationsService.create(newNotification);
```

## ExpensesService

### Funcionalidades Principais

- Gerenciamento de despesas
- Categorização de gastos
- Relatórios financeiros
- Validação de dados financeiros

### Exemplo de Uso

```typescript
import { ExpensesService } from '../services/expensesService';

const expensesService = ExpensesService.getInstance();

// Criar nova despesa
const newExpense = {
  descricao: 'Compra de equipamentos',
  valor: 1500.00,
  categoria_id: 1,
  data_despesa: '2024-01-15',
  funcionario_id: 1
};

const created = await expensesService.create(newExpense);

// Buscar despesas por período
const monthlyExpenses = await expensesService.getByDateRange(
  '2024-01-01',
  '2024-01-31'
);

// Buscar por categoria
const categoryExpenses = await expensesService.getByCategory(1);

// Obter relatório mensal
const report = await expensesService.getMonthlyReport(2024, 1);
```

## Como Usar nos Componentes

### Hook Personalizado (Recomendado)

Crie hooks personalizados para encapsular a lógica dos serviços:

```typescript
// hooks/useEmployees.ts
import { useState, useEffect } from 'react';
import { EmployeesService } from '../services/employeesService';

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const employeesService = EmployeesService.getInstance();

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeesService.getAll();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    refetch: loadEmployees
  };
};
```

### Uso Direto no Componente

```typescript
// components/EmployeeList.tsx
import React, { useState, useEffect } from 'react';
import { EmployeesService } from '../services/employeesService';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState([]);
  const employeesService = EmployeesService.getInstance();

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await employeesService.getAll();
        setEmployees(data);
      } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
      }
    };

    loadEmployees();
  }, []);

  return (
    <div>
      {employees.map(employee => (
        <div key={employee.id}>
          {employee.nome} - {employee.cargo}
        </div>
      ))}
    </div>
  );
};
```

## Tratamento de Erros

Todos os serviços implementam tratamento de erros padronizado:

```typescript
try {
  const result = await service.someMethod();
  // Sucesso
} catch (error) {
  if (error.status === 401) {
    // Não autorizado - redirecionar para login
  } else if (error.status === 403) {
    // Sem permissão
  } else if (error.status === 404) {
    // Não encontrado
  } else {
    // Erro genérico
    console.error('Erro:', error.message);
  }
}
```

### Interceptadores Globais

Os serviços usam interceptadores para:
- Adicionar tokens de autenticação automaticamente
- Renovar tokens expirados
- Tratar erros globalmente
- Fazer logout automático em caso de token inválido

## Testes

### Componente de Teste

Acesse `/demo/services-integration` para testar todos os serviços em um ambiente controlado.

### Testes Unitários

```typescript
// __tests__/services/authService.test.ts
import { AuthService } from '../../services/authService';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = AuthService.getInstance();
  });

  test('deve fazer login com credenciais válidas', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const result = await authService.login(credentials);
    expect(result.user).toBeDefined();
    expect(result.token).toBeDefined();
  });
});
```

## Boas Práticas

1. **Sempre use try/catch** ao chamar métodos dos serviços
2. **Implemente loading states** para melhor UX
3. **Use hooks personalizados** para reutilizar lógica
4. **Valide dados** antes de enviar para os serviços
5. **Trate erros específicos** de acordo com o contexto
6. **Use TypeScript** para aproveitar a tipagem forte
7. **Mantenha os componentes limpos** delegando lógica para os serviços

## Próximos Passos

- Implementar cache mais sofisticado
- Adicionar suporte offline
- Implementar sincronização em tempo real
- Adicionar métricas e monitoramento
- Criar testes de integração mais abrangentes

---

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.