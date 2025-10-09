import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  User,
  ArrowRight,
  Plus
} from 'lucide-react'
import DashboardWidget from '../DashboardWidget'
import { apiService } from '../../../services/apiService'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

interface TaskItem {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  assignedTo?: {
    id: string
    name: string
    avatar?: string
  }
  project?: {
    id: string
    name: string
    color: string
  }
}

const TasksWidget: React.FC<BaseWidgetProps> = ({ 
  onRefresh, 
  onConfigure, 
  className 
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(undefined)
      
      // Buscar tarefas usando o apiService
      const tasksResponse = await apiService.getTasksMetrics()

      // Mapear dados para o formato esperado pelo componente
      const realTasks: TaskItem[] = tasksResponse.recentTasks.map((task: any) => {
        // Determinar status baseado na data de vencimento
        let taskStatus = task.status as TaskItem['status']
        if (task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed') {
          taskStatus = 'overdue'
        }

        // Mapear prioridade
        let taskPriority: TaskItem['priority'] = 'medium'
        if (task.priority === 'HIGH') taskPriority = 'high'
        else if (task.priority === 'LOW') taskPriority = 'low'
        else if (task.priority === 'URGENT') taskPriority = 'urgent'

        // Determinar cor do projeto baseado no status
        const getProjectColor = (status: string) => {
          switch (status) {
            case 'completed': return 'green'
            case 'in_progress': return 'blue'
            case 'overdue': return 'red'
            default: return 'gray'
          }
        }

        return {
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          status: taskStatus,
          priority: taskPriority,
          dueDate: task.due_date || undefined,
          assignedTo: task.assigned_to ? {
            id: task.assigned_to,
            name: `Usuário ${task.assigned_to}`
          } : undefined,
          project: {
            id: task.project || 'default',
            name: task.project || 'Geral',
            color: getProjectColor(taskStatus)
          }
        }
      })
      
      setTasks(realTasks)
    } catch (err) {
      setError('Erro ao carregar tarefas')
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleRefresh = () => {
    loadTasks()
    onRefresh?.()
  }

  const getStatusIcon = (status: TaskItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500'
      case 'high':
        return 'border-l-orange-500'
      case 'medium':
        return 'border-l-yellow-500'
      default:
        return 'border-l-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  const pendingTasks = tasks.filter(task => task.status !== 'completed')

  return (
    <DashboardWidget
      id="tasks"
      title="Minhas Tarefas"
      subtitle={`${pendingTasks.length} tarefas pendentes`}
      loading={loading}
      error={error}
      size="medium"
      refreshable
      configurable
      onRefresh={handleRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="space-y-3">
        {tasks.slice(0, 5).map((task) => (
          <div
            key={task.id}
            className={`
              p-3 border-l-4 bg-gray-50 rounded-r-md hover:bg-gray-100 
              transition-colors cursor-pointer
              ${getPriorityColor(task.priority)}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {getStatusIcon(task.status)}
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </h4>
                </div>
                
                {task.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  {task.dueDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  )}
                  
                  {task.assignedTo && (
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{task.assignedTo.name}</span>
                    </div>
                  )}
                  
                  {task.project && (
                    <div className="flex items-center space-x-1">
                      <div 
                        className={`w-2 h-2 rounded-full bg-${task.project.color}-500`}
                      />
                      <span>{task.project.name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <ArrowRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
            </div>
          </div>
        ))}
        
        {tasks.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhuma tarefa encontrada</p>
          </div>
        )}
        
        {tasks.length > 5 && (
          <div className="pt-3 border-t border-gray-200">
            <button className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
              <span>Ver todas as tarefas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </DashboardWidget>
  )
}

export default TasksWidget