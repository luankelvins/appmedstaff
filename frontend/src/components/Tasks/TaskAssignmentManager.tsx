import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  UserPlus, 
  Calendar
} from 'lucide-react';
import { LeadTask, TaskStatus } from '../../types/crm';
import { leadTaskService } from '../../utils/leadTaskService';
import { userService, UserSummary } from '../../utils/userService';

interface TaskAssignmentManagerProps {
  onTaskUpdate?: () => void;
}

interface TaskAssignmentData {
  task: LeadTask;
  assigneeName: string;
  isOverdue: boolean;
  daysUntilDue: number;
}

interface WorkloadStats {
  responsavelId: string;
  nome: string;
  totalTarefas: number;
  tarefasPendentes: number;
  tarefasVencidas: number;
  cargaTrabalho: 'baixa' | 'media' | 'alta' | 'critica';
}

export const TaskAssignmentManager: React.FC<TaskAssignmentManagerProps> = ({ onTaskUpdate }) => {
  const [tasks, setTasks] = useState<TaskAssignmentData[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedTask, setSelectedTask] = useState<LeadTask | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showReassignDialog, setShowReassignDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar usuários
      const availableUsers = await userService.getActiveUsers();
      setUsers(availableUsers);

      // Carregar tarefas pendentes
      const pendingTasks = await leadTaskService.getTarefasPendentes();
      
      // Enriquecer dados das tarefas
      const enrichedTasks: TaskAssignmentData[] = pendingTasks.map(task => {
        const assignee = availableUsers.find((u: UserSummary) => u.id === task.responsavel);
        const now = new Date();
        const dueDate = new Date(task.dataVencimento);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          task,
          assigneeName: assignee?.name || 'Usuário não encontrado',
          isOverdue: dueDate < now,
          daysUntilDue
        };
      });

      setTasks(enrichedTasks);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReassignTask = async () => {
    if (!selectedTask || !selectedAssignee) return;

    try {
      await leadTaskService.reatribuirTarefa(
        selectedTask.id,
        selectedAssignee,
        'Reatribuição manual'
      );

      setShowReassignDialog(false);
      setSelectedTask(null);
      setSelectedAssignee('');
      
      await loadData();
      onTaskUpdate?.();
    } catch (error) {
      console.error('Erro ao reatribuir tarefa:', error);
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    const statusConfig = {
      pendente: { label: 'Pendente', variant: 'secondary' as const },
      em_andamento: { label: 'Em Andamento', variant: 'default' as const },
      concluida: { label: 'Concluída', variant: 'outline' as const },
      vencida: { label: 'Vencida', variant: 'destructive' as const },
      cancelada: { label: 'Cancelada', variant: 'outline' as const }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      baixa: { label: 'Baixa', variant: 'outline' as const },
      media: { label: 'Média', variant: 'secondary' as const },
      alta: { label: 'Alta', variant: 'default' as const },
      urgente: { label: 'Urgente', variant: 'destructive' as const }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciamento de Atribuição de Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Lista de Tarefas */}
          <div className="space-y-3">
            {tasks.map(({ task, assigneeName, isOverdue, daysUntilDue }) => (
              <Card key={task.id} className={`${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{task.titulo}</h4>
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.prioridade)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{task.descricao}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {assigneeName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(task.dataVencimento).toLocaleDateString()}
                        </span>
                        {isOverdue ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            Vencida há {Math.abs(daysUntilDue)} dias
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {daysUntilDue} dias restantes
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowReassignDialog(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Reatribuir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {tasks.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma tarefa pendente encontrada.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Reatribuição Simples */}
      {showReassignDialog && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-md">
            <CardHeader>
              <CardTitle>Reatribuir Tarefa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tarefa:</label>
                <p className="text-sm text-gray-600">{selectedTask.titulo}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Novo Responsável:</label>
                <select 
                  value={selectedAssignee} 
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecione um responsável</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleReassignTask} disabled={!selectedAssignee}>
                  Reatribuir
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowReassignDialog(false);
                    setSelectedTask(null);
                    setSelectedAssignee('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};