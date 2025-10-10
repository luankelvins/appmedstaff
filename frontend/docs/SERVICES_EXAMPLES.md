# Exemplos Práticos - Serviços MedStaff

Este documento contém exemplos práticos de como usar os serviços em cenários reais.

## Cenários de Autenticação

### 1. Login com Validação

```typescript
import { AuthService } from '../services/authService';
import { useApiNotifications } from '../hooks/useApiNotifications';

const LoginComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useApiNotifications();
  const navigate = useNavigate();
  
  const authService = AuthService.getInstance();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      showSuccess('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      showError(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        required 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        required 
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};
```

### 2. Proteção de Rotas

```typescript
import { AuthService } from '../services/authService';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const authService = AuthService.getInstance();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (requiredPermission && !authService.hasPermission(requiredPermission)) {
    return <div>Acesso negado</div>;
  }

  return children;
};

// Uso
<ProtectedRoute requiredPermission="users.create">
  <CreateUserPage />
</ProtectedRoute>
```

## Cenários de Funcionários

### 1. Lista com Busca e Filtros

```typescript
import { EmployeesService } from '../services/employeesService';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('');
  
  const employeesService = EmployeesService.getInstance();

  const loadEmployees = async () => {
    setLoading(true);
    try {
      let data;
      if (searchTerm || department) {
        data = await employeesService.search({
          nome: searchTerm,
          departamento: department
        });
      } else {
        data = await employeesService.getAll();
      }
      setEmployees(data);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [searchTerm, department]);

  return (
    <div>
      <input 
        placeholder="Buscar por nome..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select value={department} onChange={(e) => setDepartment(e.target.value)}>
        <option value="">Todos os departamentos</option>
        <option value="TI">TI</option>
        <option value="RH">RH</option>
        <option value="Vendas">Vendas</option>
      </select>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div>
          {employees.map(employee => (
            <div key={employee.id}>
              <h3>{employee.nome}</h3>
              <p>{employee.cargo} - {employee.departamento}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 2. Formulário de Criação/Edição

```typescript
import { EmployeesService } from '../services/employeesService';

const EmployeeForm = ({ employeeId, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    departamento: '',
    salario: '',
    data_admissao: ''
  });
  const [loading, setLoading] = useState(false);
  
  const employeesService = EmployeesService.getInstance();

  useEffect(() => {
    if (employeeId) {
      loadEmployee();
    }
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      const employee = await employeesService.getById(employeeId);
      setFormData(employee);
    } catch (error) {
      console.error('Erro ao carregar funcionário:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (employeeId) {
        result = await employeesService.update(employeeId, formData);
      } else {
        result = await employeesService.create(formData);
      }
      onSave(result);
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        placeholder="Nome"
        value={formData.nome}
        onChange={(e) => setFormData({...formData, nome: e.target.value})}
        required
      />
      <input 
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      {/* Outros campos... */}
      <button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
};
```

## Cenários de Tarefas

### 1. Dashboard de Tarefas

```typescript
import { TasksService } from '../services/tasksService';
import { AuthService } from '../services/authService';

const TasksDashboard = () => {
  const [myTasks, setMyTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [stats, setStats] = useState({});
  
  const tasksService = TasksService.getInstance();
  const authService = AuthService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = authService.getUser();
      
      // Carregar minhas tarefas
      const userTasks = await tasksService.getByUser(user.id);
      setMyTasks(userTasks);

      // Se for admin, carregar todas as tarefas
      if (authService.hasRole('admin')) {
        const all = await tasksService.getAll();
        setAllTasks(all);
      }

      // Calcular estatísticas
      const pending = userTasks.filter(t => t.status === 'pendente').length;
      const inProgress = userTasks.filter(t => t.status === 'em_andamento').length;
      const completed = userTasks.filter(t => t.status === 'concluida').length;
      
      setStats({ pending, inProgress, completed });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await tasksService.updateStatus(taskId, newStatus);
      loadDashboardData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  return (
    <div>
      <div className="stats">
        <div>Pendentes: {stats.pending}</div>
        <div>Em Andamento: {stats.inProgress}</div>
        <div>Concluídas: {stats.completed}</div>
      </div>

      <div className="my-tasks">
        <h2>Minhas Tarefas</h2>
        {myTasks.map(task => (
          <div key={task.id} className="task-card">
            <h3>{task.titulo}</h3>
            <p>{task.descricao}</p>
            <select 
              value={task.status}
              onChange={(e) => updateTaskStatus(task.id, e.target.value)}
            >
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Cenários de Notificações

### 1. Centro de Notificações

```typescript
import { NotificationsService } from '../services/notificationsService';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ unread: 0, total: 0 });
  
  const notificationsService = NotificationsService.getInstance();

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    try {
      const user = authService.getUser();
      const data = await notificationsService.getUserNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const loadStats = async () => {
    try {
      const user = authService.getUser();
      const statsData = await notificationsService.getStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationsService.markAsRead(notificationId);
      loadNotifications();
      loadStats();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = authService.getUser();
      await notificationsService.markAllAsRead(user.id);
      loadNotifications();
      loadStats();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  return (
    <div>
      <div className="notification-header">
        <h2>Notificações ({stats.unread} não lidas)</h2>
        {stats.unread > 0 && (
          <button onClick={markAllAsRead}>
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification ${!notification.lida ? 'unread' : ''}`}
            onClick={() => !notification.lida && markAsRead(notification.id)}
          >
            <h4>{notification.titulo}</h4>
            <p>{notification.mensagem}</p>
            <small>{new Date(notification.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Cenários de Despesas

### 1. Relatório de Despesas

```typescript
import { ExpensesService } from '../services/expensesService';

const ExpensesReport = () => {
  const [expenses, setExpenses] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const expensesService = ExpensesService.getInstance();

  useEffect(() => {
    loadMonthlyReport();
  }, [selectedMonth, selectedYear]);

  const loadMonthlyReport = async () => {
    try {
      const report = await expensesService.getMonthlyReport(selectedYear, selectedMonth);
      setMonthlyReport(report);
      
      const startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
      
      const monthlyExpenses = await expensesService.getByDateRange(startDate, endDate);
      setExpenses(monthlyExpenses);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    }
  };

  const exportReport = () => {
    // Lógica para exportar relatório
    const csvContent = expenses.map(expense => 
      `${expense.descricao},${expense.valor},${expense.data_despesa}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `despesas-${selectedYear}-${selectedMonth}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="report-controls">
        <select 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          {Array.from({length: 12}, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
            </option>
          ))}
        </select>
        
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {Array.from({length: 5}, (_, i) => (
            <option key={i} value={new Date().getFullYear() - i}>
              {new Date().getFullYear() - i}
            </option>
          ))}
        </select>
        
        <button onClick={exportReport}>Exportar CSV</button>
      </div>

      {monthlyReport && (
        <div className="report-summary">
          <h3>Resumo do Mês</h3>
          <p>Total de Despesas: R$ {monthlyReport.total.toFixed(2)}</p>
          <p>Número de Transações: {monthlyReport.count}</p>
          <p>Média por Transação: R$ {monthlyReport.average.toFixed(2)}</p>
        </div>
      )}

      <div className="expenses-list">
        {expenses.map(expense => (
          <div key={expense.id} className="expense-item">
            <div>{expense.descricao}</div>
            <div>R$ {expense.valor.toFixed(2)}</div>
            <div>{new Date(expense.data_despesa).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Hook Personalizado para Dados

```typescript
// hooks/useServiceData.ts
import { useState, useEffect, useCallback } from 'react';

export const useServiceData = <T>(
  serviceMethod: () => Promise<T[]>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceMethod();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refetch: loadData
  };
};

// Uso do hook
const EmployeesList = () => {
  const employeesService = EmployeesService.getInstance();
  const { data: employees, loading, error, refetch } = useServiceData(
    () => employeesService.getAll()
  );

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>Atualizar</button>
      {employees.map(employee => (
        <div key={employee.id}>{employee.nome}</div>
      ))}
    </div>
  );
};
```

## Tratamento de Erros Avançado

```typescript
// utils/errorHandler.ts
export const handleServiceError = (error: any, context: string) => {
  console.error(`Erro em ${context}:`, error);
  
  if (error.status === 401) {
    // Token expirado - fazer logout
    const authService = AuthService.getInstance();
    authService.logout();
    window.location.href = '/login';
    return 'Sessão expirada. Faça login novamente.';
  }
  
  if (error.status === 403) {
    return 'Você não tem permissão para realizar esta ação.';
  }
  
  if (error.status === 404) {
    return 'Recurso não encontrado.';
  }
  
  if (error.status >= 500) {
    return 'Erro interno do servidor. Tente novamente mais tarde.';
  }
  
  return error.message || 'Erro desconhecido.';
};

// Uso
try {
  await employeesService.create(newEmployee);
} catch (error) {
  const message = handleServiceError(error, 'criação de funcionário');
  showError(message);
}
```

Estes exemplos cobrem os cenários mais comuns de uso dos serviços. Para casos específicos, consulte a documentação completa em `/docs/SERVICES_GUIDE.md`.