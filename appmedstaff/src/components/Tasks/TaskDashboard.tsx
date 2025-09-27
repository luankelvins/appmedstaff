import React from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types/task';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  PlayCircle, 
  PauseCircle,
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface TaskDashboardProps {
  tasks: Task[];
}

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  highPriority: number;
  urgent: number;
  totalEstimatedHours: number;
  totalActualHours: number;
}

const TaskDashboard: React.FC<TaskDashboardProps> = ({ tasks }) => {
  const calculateStats = (): TaskStats => {
    const now = new Date();
    
    return tasks.reduce((stats, task) => {
      stats.total++;
      
      // Status counts
      switch (task.status) {
        case TaskStatus.DONE:
          stats.completed++;
          break;
        case TaskStatus.IN_PROGRESS:
          stats.inProgress++;
          break;
        case TaskStatus.TODO:
          stats.pending++;
          break;
      }
      
      // Priority counts
      if (task.priority === TaskPriority.HIGH) {
        stats.highPriority++;
      }
      if (task.priority === TaskPriority.URGENT) {
        stats.urgent++;
      }
      
      // Overdue tasks
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== TaskStatus.DONE) {
        stats.overdue++;
      }
      
      // Hours
      stats.totalEstimatedHours += task.estimatedHours || 0;
      stats.totalActualHours += task.actualHours || 0;
      
      return stats;
    }, {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      overdue: 0,
      highPriority: 0,
      urgent: 0,
      totalEstimatedHours: 0,
      totalActualHours: 0
    });
  };

  const stats = calculateStats();
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const progressRate = stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0;

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ComponentType<any>; 
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Tarefas"
          value={stats.total}
          icon={Target}
          color="bg-blue-500"
        />
        
        <StatCard
          title="Concluídas"
          value={stats.completed}
          icon={CheckCircle}
          color="bg-green-500"
          subtitle={`${completionRate}% do total`}
        />
        
        <StatCard
          title="Em Progresso"
          value={stats.inProgress}
          icon={PlayCircle}
          color="bg-yellow-500"
          subtitle={`${progressRate}% do total`}
        />
        
        <StatCard
          title="Pendentes"
          value={stats.pending}
          icon={PauseCircle}
          color="bg-gray-500"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Atrasadas"
          value={stats.overdue}
          icon={AlertTriangle}
          color="bg-red-500"
        />
        
        <StatCard
          title="Alta Prioridade"
          value={stats.highPriority}
          icon={TrendingUp}
          color="bg-orange-500"
        />
        
        <StatCard
          title="Urgentes"
          value={stats.urgent}
          icon={Clock}
          color="bg-purple-500"
        />
        
        <StatCard
          title="Horas Estimadas"
          value={`${stats.totalEstimatedHours}h`}
          icon={Calendar}
          color="bg-indigo-500"
          subtitle={`${stats.totalActualHours}h realizadas`}
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Progresso Geral</h3>
          <span className="text-sm text-gray-500">{completionRate}% concluído</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{stats.completed} concluídas</span>
          <span>{stats.total - stats.completed} restantes</span>
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;