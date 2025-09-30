import React, { useState, useEffect } from 'react'
import { usePermissions } from '../hooks/usePermissions'
import { useToast } from '../hooks/useToast'
import { Loading } from '../components/UI/Loading'
import { ToastContainer } from '../components/UI/Toast'
import { getStatusLabel, getPriorityLabel, getStatusColor, getPriorityColor } from '../utils/taskLabels'
import { TaskStatus, TaskPriority } from '../types/task'
import { taskService } from '../services/taskService'
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot
} from 'react-beautiful-dnd'
import { 
  List, 
  Calendar, 
  Kanban,
  Plus,
  Filter,
  Search,
  Clock,
  User,
  AlertCircle,
  Play,
  Pause,
  CheckCircle,
  MessageCircle,
  Paperclip,
  Users,
  Timer,
  RotateCcw,
  Loader
} from 'lucide-react'

interface TaskParticipant {
  id: string
  name: string
  role: string
  avatar?: string
}

interface TaskTimeEntry {
  id: string
  startTime: Date
  endTime?: Date
  duration: number // em minutos
  status: 'running' | 'paused' | 'completed'
}

interface TaskComment {
  id: string
  author: string
  content: string
  timestamp: Date
  attachments?: string[]
  emoji?: string
}

interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: TaskParticipant
  participants: TaskParticipant[]
  dueDate: Date
  createdAt: Date
  department: string
  tags: string[]
  timeEntries: TaskTimeEntry[]
  totalTimeSpent: number // em minutos
  estimatedTime?: number // em minutos
  comments: TaskComment[]
  attachments: string[]
  isOverdue: boolean
}

// Mock de usuários do time interno
const mockInternalTeam: TaskParticipant[] = [
  { id: '1', name: 'João Silva', role: 'Analista Comercial' },
  { id: '2', name: 'Maria Santos', role: 'Gerente Operacional' },
  { id: '3', name: 'Pedro Costa', role: 'Analista Financeiro' },
  { id: '4', name: 'Ana Lima', role: 'Coordenadora RH' },
  { id: '5', name: 'Carlos Oliveira', role: 'Desenvolvedor' },
  { id: '6', name: 'Lucia Ferreira', role: 'Designer UX' }
]

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Revisar contrato Cliente ABC',
    description: 'Análise completa do contrato de prestação de serviços',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    assignee: mockInternalTeam[0],
    participants: [mockInternalTeam[0], mockInternalTeam[1]],
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Atrasado
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    department: 'Comercial',
    tags: ['contrato', 'urgente'],
    timeEntries: [],
    totalTimeSpent: 0,
    estimatedTime: 120,
    comments: [],
    attachments: [],
    isOverdue: true
  },
  {
    id: '2',
    title: 'Emitir NF para Empresa XYZ',
    description: 'Processamento da nota fiscal referente aos serviços prestados',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    assignee: mockInternalTeam[1],
    participants: [mockInternalTeam[1], mockInternalTeam[2]],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    department: 'Operacional',
    tags: ['nf', 'faturamento'],
    timeEntries: [
      {
        id: 't1',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        duration: 60,
        status: 'completed'
      }
    ],
    totalTimeSpent: 60,
    estimatedTime: 90,
    comments: [
      {
        id: 'c1',
        author: 'Maria Santos',
        content: 'Iniciando processamento da NF 📄',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        emoji: '📄'
      }
    ],
    attachments: ['documento.pdf'],
    isOverdue: false
  },
  {
    id: '3',
    title: 'Atualizar dados cadastrais',
    description: 'Verificar e atualizar informações dos clientes PF',
    status: TaskStatus.IN_REVIEW,
    priority: TaskPriority.LOW,
    assignee: mockInternalTeam[2],
    participants: [mockInternalTeam[2]],
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    department: 'Operacional',
    tags: ['cadastro', 'dados'],
    timeEntries: [],
    totalTimeSpent: 45,
    estimatedTime: 60,
    comments: [],
    attachments: [],
    isOverdue: false
  },
  {
    id: '4',
    title: 'Relatório financeiro mensal',
    description: 'Compilar dados financeiros do mês anterior',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    assignee: mockInternalTeam[3],
    participants: [mockInternalTeam[3], mockInternalTeam[2]],
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    department: 'Financeiro',
    tags: ['relatório', 'mensal'],
    timeEntries: [],
    totalTimeSpent: 180,
    estimatedTime: 150,
    comments: [
      {
        id: 'c2',
        author: 'Ana Lima',
        content: 'Relatório concluído com sucesso! ✅',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        emoji: '✅'
      }
    ],
    attachments: ['relatorio_janeiro.xlsx'],
    isOverdue: false
  }
]

type ViewMode = 'list' | 'kanban' | 'calendar'

const Tasks: React.FC = () => {
  const { canViewTasks, canCreateTasks, canUpdateTasks, canDeleteTasks, user } = usePermissions()
  const { toasts, success, error, removeToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dragLoading, setDragLoading] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [runningTimers, setRunningTimers] = useState<Record<string, Date>>({})
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)

  // Atualizar timers em execução
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (runningTimers[task.id]) {
            const currentEntry = task.timeEntries.find(entry => entry.status === 'running')
            if (currentEntry) {
              const elapsed = Math.floor((Date.now() - runningTimers[task.id].getTime()) / 60000)
              return {
                ...task,
                totalTimeSpent: task.totalTimeSpent + elapsed
              }
            }
          }
          return task
        })
      )
    }, 60000) // Atualizar a cada minuto

    return () => clearInterval(interval)
  }, [runningTimers])

  if (!canViewTasks()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acesso Negado
          </h3>
          <p className="text-gray-600">
            Você não tem permissão para visualizar tarefas.
          </p>
        </div>
      </div>
    )
  }



  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Função para verificar se o usuário pode mover uma tarefa específica
  const canMoveTask = (task: Task, newStatus?: TaskStatus): boolean => {
    // Verificação básica de permissão
    if (!canUpdateTasks()) return false
    
    // SuperAdmin pode mover qualquer tarefa
    if (user?.role.slug === 'super_admin') return true
    
    // Usuário pode mover suas próprias tarefas
    if (task.assignee.id === user?.id) return true
    
    // Gerentes podem mover tarefas relacionadas ao seu departamento
    if (user?.role.level === 'managerial') {
      const userRole = user?.role.slug
      // Gerente comercial pode mover tarefas comerciais
      if (userRole === 'gerente_comercial' && task.department === 'Comercial') return true
      // Gerente operacional pode mover tarefas operacionais
      if (userRole === 'gerente_operacional' && task.department === 'Operacional') return true
      // Gerente financeiro pode mover tarefas financeiras
      if (userRole === 'gerente_financeiro' && task.department === 'Financeiro') return true
      // Gerente RH pode mover tarefas de RH
      if (userRole === 'gerente_rh' && task.department === 'RH') return true
    }
    
    // Validações específicas por status
    if (newStatus === TaskStatus.DONE) {
      // Apenas o responsável ou gerente pode marcar como concluído
      return task.assignee.id === user?.id || user?.role.level === 'managerial'
    }
    
    return false
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleStartTimer = (taskId: string) => {
    setRunningTimers(prev => ({ ...prev, [taskId]: new Date() }))
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newEntry: TaskTimeEntry = {
            id: `t${Date.now()}`,
            startTime: new Date(),
            duration: 0,
            status: 'running'
          }
          return {
            ...task,
            timeEntries: [...task.timeEntries, newEntry],
            status: task.status === TaskStatus.TODO ? TaskStatus.IN_PROGRESS : task.status
          }
        }
        return task
      })
    )
  }

  const handlePauseTimer = (taskId: string) => {
    const startTime = runningTimers[taskId]
    if (startTime) {
      const duration = Math.floor((Date.now() - startTime.getTime()) / 60000)
      
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            const updatedEntries = task.timeEntries.map(entry => {
              if (entry.status === 'running') {
                return {
                  ...entry,
                  endTime: new Date(),
                  duration,
                  status: 'paused' as const
                }
              }
              return entry
            })
            return {
              ...task,
              timeEntries: updatedEntries,
              totalTimeSpent: task.totalTimeSpent + duration
            }
          }
          return task
        })
      )
      
      setRunningTimers(prev => {
        const { [taskId]: removed, ...rest } = prev
        return rest
      })
    }
  }

  const handleCompleteTask = (taskId: string) => {
    handlePauseTimer(taskId) // Para o timer se estiver rodando
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status: TaskStatus.DONE
          }
        }
        return task
      })
    )
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    
    // Se moveu para uma coluna diferente, atualiza o status
    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId as TaskStatus
      const task = tasks.find(t => t.id === draggableId)
      
      if (!task) return
      
      // Verificar permissões específicas para esta tarefa e status
      if (!canMoveTask(task, newStatus)) {
        error(`Você não tem permissão para mover a tarefa "${task.title}" para ${getStatusLabel(newStatus)}`)
        return
      }
      
      // Atualiza UI otimisticamente
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === draggableId) {
            return { 
              ...task, 
              status: newStatus,
              // Atualiza timestamp se moveu para "done"
              ...(newStatus === TaskStatus.DONE && { completedAt: new Date() })
            }
          }
          return task
        })
      )
      
      // Mostra loading para esta tarefa específica
      setDragLoading(draggableId)
      
      try {
        // Chama API para persistir mudança
        const updatedTask = await taskService.updateTaskStatus(draggableId, newStatus)
        
        if (updatedTask) {
          // Feedback visual com toast
          success(`Tarefa "${task.title}" movida para ${getStatusLabel(newStatus)}`)
        } else {
          throw new Error('Falha ao atualizar tarefa')
        }
      } catch (err) {
        // Reverte mudança em caso de erro
        setTasks(prevTasks => 
          prevTasks.map(t => {
            if (t.id === draggableId) {
              return { ...t, status: task.status }
            }
            return t
          })
        )
        
        error(`Erro ao mover tarefa "${task.title}". Tente novamente.`)
      } finally {
        setDragLoading(null)
      }
    }
    
    // Se moveu dentro da mesma coluna, reordena as tarefas
    if (source.droppableId === destination.droppableId && source.index !== destination.index) {
      const columnTasks = filteredTasks.filter(task => task.status === source.droppableId)
      const [movedTask] = columnTasks.splice(source.index, 1)
      
      // Verificar permissões para reordenar esta tarefa
      if (!canMoveTask(movedTask)) {
        error(`Você não tem permissão para reordenar a tarefa "${movedTask.title}"`)
        return
      }
      
      columnTasks.splice(destination.index, 0, movedTask)
      
      // Atualiza a ordem das tarefas na coluna
      setTasks(prevTasks => {
        const otherTasks = prevTasks.filter(task => task.status !== source.droppableId)
        return [...otherTasks, ...columnTasks]
      })
      
      success(`Tarefa "${movedTask.title}" reordenada na coluna`)
    }
  }

  // Ordenar tarefas por prioridade e status
  const sortedTasks = [...tasks].sort((a, b) => {
    // Primeiro por status (não concluídas primeiro)
    if (a.status === TaskStatus.DONE && b.status !== TaskStatus.DONE) return 1
    if (a.status !== TaskStatus.DONE && b.status === TaskStatus.DONE) return -1
    
    // Depois por prioridade
    const priorityOrder = { 
      [TaskPriority.URGENT]: 4,
      [TaskPriority.HIGH]: 3, 
      [TaskPriority.MEDIUM]: 2, 
      [TaskPriority.LOW]: 1 
    }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  const filteredTasks = sortedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesDepartment = departmentFilter === 'all' || task.department === departmentFilter
    const matchesTag = tagFilter === 'all' || task.tags.includes(tagFilter)
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const today = new Date()
      const taskDate = new Date(task.dueDate)
      
      switch (dateFilter) {
        case 'today':
          matchesDate = taskDate.toDateString() === today.toDateString()
          break
        case 'week':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          matchesDate = taskDate >= today && taskDate <= weekFromNow
          break
        case 'overdue':
          matchesDate = taskDate < today && task.status !== TaskStatus.DONE
          break
        case 'month':
          const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
          matchesDate = taskDate >= today && taskDate <= monthFromNow
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment && matchesTag && matchesDate
  })

  // Separar tarefas concluídas e não concluídas
  const incompleteTasks = filteredTasks.filter(task => task.status !== TaskStatus.DONE)
  const completedTasks = filteredTasks.filter(task => task.status === TaskStatus.DONE)

  const renderTaskCard = (task: Task, showActions = true) => {
    const isRunning = runningTimers[task.id]
    const isLoading = dragLoading === task.id
    const cardClasses = `relative bg-white rounded-lg p-3 shadow-sm border transition-all hover:shadow-lg cursor-pointer ${
      task.isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
    } hover:border-gray-300 ${isLoading ? 'kanban-card-loading opacity-75' : ''}`

    return (
      <div key={task.id} className={cardClasses}>
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center z-10">
            <Loader className="w-4 h-4 text-blue-600 animate-spin" />
          </div>
        )}
        {/* Título da tarefa */}
        <h4 className="font-medium text-gray-900 mb-2 text-sm leading-tight">{task.title}</h4>
        
        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Responsável */}
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
            <span className="text-xs font-medium text-gray-600">
              {task.assignee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </span>
          </div>
          <span className="text-xs text-gray-600 truncate">{task.assignee.name}</span>
        </div>

        {/* Prioridade e Data */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </span>
          
          <div className="flex items-center space-x-2">
            {/* Comentários e Anexos */}
            {task.comments.length > 0 && (
              <div className="flex items-center text-gray-500">
                <MessageCircle className="w-3 h-3 mr-1" />
                <span className="text-xs">{task.comments.length}</span>
              </div>
            )}
            {task.attachments.length > 0 && (
              <div className="flex items-center text-gray-500">
                <Paperclip className="w-3 h-3 mr-1" />
                <span className="text-xs">{task.attachments.length}</span>
              </div>
            )}
            
            {/* Data de vencimento */}
            <span className={`text-xs ${task.isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              {formatDate(task.dueDate)}
            </span>
          </div>
        </div>

        {/* Tempo gasto (se houver) */}
        {task.totalTimeSpent > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center">
                <Timer className="w-3 h-3 mr-1" />
                <span>{formatTime(task.totalTimeSpent)}</span>
              </div>
              {isRunning && (
                <span className="text-green-600 font-medium">Em execução</span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarefa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responsável
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prazo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {task.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {task.description}
                    </div>
                    <div className="flex space-x-1 mt-2">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center ${getPriorityColor(task.priority)}`}>
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-900">{task.assignee.name}</div>
                      <div className="text-xs text-gray-500">{task.assignee.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900">{formatDate(task.dueDate)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderKanbanView = () => {
    const columns = [
      { id: TaskStatus.TODO, title: 'A Fazer', status: TaskStatus.TODO, color: 'bg-gray-100' },
      { id: TaskStatus.IN_PROGRESS, title: 'Em Andamento', status: TaskStatus.IN_PROGRESS, color: 'bg-blue-100' },
      { id: TaskStatus.IN_REVIEW, title: 'Em Revisão', status: TaskStatus.IN_REVIEW, color: 'bg-yellow-100' },
      { id: TaskStatus.DONE, title: 'Concluído', status: TaskStatus.DONE, color: 'bg-green-100' }
    ]

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="kanban-column bg-gray-50 rounded-lg p-3">
              <div className={`${column.color} rounded-lg p-3 mb-4`}>
                <h3 className="font-semibold text-gray-800 text-sm flex items-center justify-between">
                  {column.title}
                  <span className="bg-white text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                    {filteredTasks.filter(task => task.status === column.status).length}
                  </span>
                </h3>
              </div>
              <Droppable droppableId={column.status}>
                 {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                   <div
                     ref={provided.innerRef}
                     {...provided.droppableProps}
                     className={`space-y-2 min-h-[300px] transition-colors ${
                       snapshot.isDraggingOver ? 'drag-over' : ''
                     }`}
                   >
                     {filteredTasks
                       .filter(task => task.status === column.status)
                       .map((task, index) => (
                         <Draggable key={task.id} draggableId={task.id} index={index}>
                           {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                             <div
                               ref={provided.innerRef}
                               {...provided.draggableProps}
                               {...provided.dragHandleProps}
                               className={`kanban-card ${
                                 snapshot.isDragging ? 'dragging' : ''
                               }`}
                             >
                               {renderTaskCard(task, false)}
                             </div>
                           )}
                         </Draggable>
                       ))}
                     {provided.placeholder}
                   </div>
                 )}
               </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    )
  }

  const renderCalendarView = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Visualização de Calendário
        </h3>
        <p className="text-gray-600">
          A visualização de calendário será implementada em uma próxima versão.
        </p>
      </div>
    </div>
  )

  if (loading) {
    return <Loading text="Carregando tarefas..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600">
            Gerencie suas tarefas e acompanhe o progresso da equipe
          </p>
        </div>
        {canCreateTasks() && (
          <button 
            onClick={() => setShowNewTaskForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <List className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg font-semibold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-lg font-semibold text-gray-900">{incompleteTasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Atrasadas</p>
              <p className="text-lg font-semibold text-gray-900">
                {tasks.filter(task => task.isOverdue).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Concluídas</p>
              <p className="text-lg font-semibold text-gray-900">{completedTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* View Mode */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Visualização Kanban"
            >
              <Kanban className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Visualização de Calendário"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os Status</option>
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="review">Em Revisão</option>
                <option value="done">Concluído</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
              
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros Avançados
              </button>
            </div>
            
            {/* Filtros Avançados */}
            {showAdvancedFilters && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 p-4 bg-gray-50 rounded-lg">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos os Departamentos</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Operacional">Operacional</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="RH">RH</option>
                  <option value="TI">TI</option>
                </select>
                
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todas as Tags</option>
                  {Array.from(new Set(tasks.flatMap(task => task.tags))).map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos os Prazos</option>
                  <option value="overdue">Atrasadas</option>
                  <option value="today">Hoje</option>
                  <option value="week">Esta Semana</option>
                  <option value="month">Este Mês</option>
                </select>
                
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setPriorityFilter('all')
                    setDepartmentFilter('all')
                    setTagFilter('all')
                    setDateFilter('all')
                  }}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'kanban' && renderKanbanView()}
      {viewMode === 'calendar' && renderCalendarView()}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  )
}

export default Tasks