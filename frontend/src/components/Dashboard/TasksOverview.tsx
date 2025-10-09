import React from 'react'
import { Task, TaskPriority, TaskStatus } from '../../types/task'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Circle,
  ArrowRight,
  Calendar
} from 'lucide-react'

interface TasksOverviewProps {
  tasks: Task[]
  loading?: boolean
  onViewAll?: () => void
  onTaskClick?: (task: Task) => void
}

const priorityColors = {
  [TaskPriority.LOW]: 'text-gray-500 bg-gray-100',
  [TaskPriority.MEDIUM]: 'text-blue-500 bg-blue-100',
  [TaskPriority.HIGH]: 'text-orange-500 bg-orange-100',
  [TaskPriority.URGENT]: 'text-red-500 bg-red-100'
}

const priorityLabels = {
  [TaskPriority.LOW]: 'Baixa',
  [TaskPriority.MEDIUM]: 'Média',
  [TaskPriority.HIGH]: 'Alta',
  [TaskPriority.URGENT]: 'Urgente'
}

const statusIcons = {
  [TaskStatus.TODO]: Circle,
  [TaskStatus.IN_PROGRESS]: Clock,
  [TaskStatus.IN_REVIEW]: AlertTriangle,
  [TaskStatus.DONE]: CheckCircle2,
  [TaskStatus.CANCELLED]: Circle
}

const statusColors = {
  [TaskStatus.TODO]: 'text-gray-500',
  [TaskStatus.IN_PROGRESS]: 'text-blue-500',
  [TaskStatus.IN_REVIEW]: 'text-yellow-500',
  [TaskStatus.DONE]: 'text-green-500',
  [TaskStatus.CANCELLED]: 'text-red-500'
}

export const TasksOverview = ({ 
  tasks, 
  loading = false, 
  onViewAll,
  onTaskClick 
}: TasksOverviewProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-6 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const pendingTasks = tasks.filter(task => 
    task.status === TaskStatus.TODO || task.status === TaskStatus.IN_PROGRESS
  ).slice(0, 5)

  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && 
    task.status !== TaskStatus.DONE && task.status !== TaskStatus.CANCELLED
  )

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Minhas Tarefas
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-medstaff-primary hover:text-medstaff-primary-dark transition-colors flex items-center"
          >
            Ver todas
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{pendingTasks.length}</p>
          <p className="text-sm text-blue-600">Pendentes</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
          <p className="text-sm text-red-600">Atrasadas</p>
        </div>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500">Todas as tarefas concluídas!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingTasks.map((task) => {
            const StatusIcon = statusIcons[task.status]
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
            
            return (
              <div
                key={task.id}
                className={`flex items-center space-x-3 p-3 border rounded-lg transition-all duration-200 ${
                  onTaskClick ? 'cursor-pointer hover:bg-gray-50 hover:border-medstaff-primary' : ''
                } ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
                onClick={() => onTaskClick?.(task)}
              >
                <StatusIcon className={`w-5 h-5 ${statusColors[task.status]}`} />
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isOverdue ? 'text-red-900' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {task.dueDate && (
                      <div className={`flex items-center text-xs ${
                        isOverdue ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(task.dueDate), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>
                    )}
                    {task.project && (
                      <span className="text-xs text-gray-500">
                        • {task.project}
                      </span>
                    )}
                  </div>
                </div>
                
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  priorityColors[task.priority]
                }`}>
                  {priorityLabels[task.priority]}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TasksOverview