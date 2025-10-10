# Serviços - MedStaff Frontend

Esta pasta contém todos os serviços responsáveis pela comunicação com a API e lógica de negócio do frontend.

## Estrutura

```
services/
├── api.ts                    # Configuração base da API
├── authService.ts           # Autenticação e autorização
├── employeesService.ts      # Gerenciamento de funcionários
├── tasksService.ts          # Gerenciamento de tarefas
├── leadsService.ts          # Gerenciamento de leads
├── notificationsService.ts  # Sistema de notificações
├── expensesService.ts       # Gerenciamento de despesas
└── README.md               # Este arquivo
```

## Uso Rápido

### Importação

```typescript
import { AuthService } from './services/authService';
import { EmployeesService } from './services/employeesService';
// ... outros serviços
```

### Padrão Singleton

Todos os serviços seguem o padrão singleton:

```typescript
const authService = AuthService.getInstance();
const employeesService = EmployeesService.getInstance();
```

### Exemplo Básico

```typescript
// Autenticação
const authService = AuthService.getInstance();
await authService.login({ email: 'user@example.com', password: 'pass' });

// Funcionários
const employeesService = EmployeesService.getInstance();
const employees = await employeesService.getAll();

// Tarefas
const tasksService = TasksService.getInstance();
const tasks = await tasksService.getByUser(userId);
```

## Características

- ✅ **TypeScript**: Tipagem forte em todos os serviços
- ✅ **Singleton**: Uma instância por serviço
- ✅ **Interceptadores**: Tratamento automático de tokens e erros
- ✅ **Validação**: Validação de dados integrada
- ✅ **Formatação**: Métodos para formatação de dados
- ✅ **Cache**: Cache local quando apropriado
- ✅ **Tratamento de Erros**: Padronizado em todos os serviços

## Documentação Completa

Para documentação detalhada, consulte: `/docs/SERVICES_GUIDE.md`

## Teste dos Serviços

Acesse `/demo/services-integration` no navegador para testar todos os serviços.

## Contribuição

Ao adicionar novos serviços:

1. Siga o padrão singleton existente
2. Implemente TypeScript com interfaces apropriadas
3. Adicione validação de dados
4. Inclua tratamento de erros
5. Adicione métodos de formatação quando necessário
6. Atualize a documentação