import React, { useState, useEffect } from 'react'
import { 
  Users, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Bell,
  Calendar,
  MessageSquare,
  Activity,
  BarChart3,
  FileText,
  AlertTriangle,
  Target,
  Briefcase
} from 'lucide-react'
import { dashboardService } from '../../../services/dashboardService'
import { taskService } from '../../../services/taskService'
import { notificationService } from '../../../services/notificationService'
import { TaskStatus } from '../../../types/task'

// Widget de Estatísticas Rápidas
const QuickStatsWidget: React.FC = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardService.getDashboardData()
        setStats(data.stats)
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Clientes</p>
              <p className="text-2xl font-bold text-blue-900">{stats?.totalClients || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Tarefas</p>
              <p className="text-2xl font-bold text-green-900">{stats?.completedTasks || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-900">{stats?.pendingTasks || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Receita</p>
              <p className="text-lg font-bold text-purple-900">
                R$ {(stats?.monthlyRevenue || 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Widget de Tarefas
const TasksWidget: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await taskService.getTasks({ status: [TaskStatus.IN_PROGRESS] }, undefined, 1, 5)
        setTasks(response.tasks)
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTasks()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Nenhuma tarefa em andamento</p>
        </div>
      ) : (
        tasks.map(task => (
          <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className={`w-3 h-3 rounded-full ${
              task.priority === 'high' ? 'bg-red-500' :
              task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
              <p className="text-xs text-gray-500">{task.category}</p>
            </div>
            <div className="text-xs text-gray-400">
              {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// Widget de Notificações
const NotificationsWidget: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await notificationService.getNotifications({ read: false })
        setNotifications(data.slice(0, 5))
      } catch (error) {
        console.error('Erro ao carregar notificações:', error)
      } finally {
        setLoading(false)
      }
    }
    loadNotifications()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <Bell className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Nenhuma notificação</p>
        </div>
      ) : (
        notifications.map(notification => (
          <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            {getNotificationIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// Widget de Atividades Recentes
const RecentActivitiesWidget: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await dashboardService.getRecentActivities(5)
        setActivities(data)
      } catch (error) {
        console.error('Erro ao carregar atividades:', error)
      } finally {
        setLoading(false)
      }
    }
    loadActivities()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'task_created': return <Target className="w-4 h-4 text-blue-500" />
      case 'document_uploaded': return <FileText className="w-4 h-4 text-purple-500" />
      case 'status_changed': return <Activity className="w-4 h-4 text-orange-500" />
      case 'comment_added': return <MessageSquare className="w-4 h-4 text-gray-500" />
      case 'milestone_reached': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'user_joined': return <Users className="w-4 h-4 text-blue-600" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-3">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          {getActivityIcon(activity.type)}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">
              <span className="font-medium">{activity.user.name}</span> {activity.description}
            </p>
            <p className="text-sm font-medium text-gray-700">{activity.title}</p>
            <p className="text-xs text-gray-400">
              {new Date(activity.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Widget de Gráfico de Performance
const PerformanceChartWidget: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const stats = await dashboardService.getStatsWithTrends()
        setData(stats)
      } catch (error) {
        console.error('Erro ao carregar dados de performance:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Tarefas Concluídas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data?.completedTasks || 0}</p>
          <p className="text-xs text-green-600">+12% este mês</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Projetos Ativos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data?.activeProjects || 0}</p>
          <p className="text-xs text-blue-600">+5% este mês</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Performance Geral</p>
            <p className="text-lg font-bold text-gray-900">Excelente</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">94%</p>
            <p className="text-xs text-gray-500">Meta: 90%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Widget de Calendário
const CalendarWidget: React.FC = () => {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        // Simular eventos do calendário
        const mockEvents = [
          { id: 1, title: 'Reunião com cliente', time: '09:00', type: 'meeting' },
          { id: 2, title: 'Entrega de projeto', time: '14:00', type: 'deadline' },
          { id: 3, title: 'Call da equipe', time: '16:30', type: 'meeting' }
        ]
        setEvents(mockEvents)
      } catch (error) {
        console.error('Erro ao carregar eventos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-lg font-bold text-gray-900">
          {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </p>
      </div>
      
      <div className="space-y-2">
        {events.map(event => (
          <div key={event.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${
              event.type === 'meeting' ? 'bg-blue-500' : 'bg-red-500'
            }`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{event.title}</p>
              <p className="text-xs text-gray-500">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Widget de Chat/Mensagens
const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Simular mensagens recentes
        const mockMessages = [
          { id: 1, user: 'João Silva', message: 'Projeto finalizado!', time: '10:30', unread: true },
          { id: 2, user: 'Maria Santos', message: 'Preciso de ajuda com...', time: '09:15', unread: true },
          { id: 3, user: 'Pedro Costa', message: 'Reunião confirmada', time: '08:45', unread: false }
        ]
        setMessages(mockMessages)
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMessages()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.map(message => (
        <div key={message.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
          message.unread ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
        }`}>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {message.user.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{message.user}</p>
            <p className="text-sm text-gray-600 truncate">{message.message}</p>
            <p className="text-xs text-gray-400">{message.time}</p>
          </div>
          {message.unread && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </div>
      ))}
    </div>
  )
}

// Widget de Relatórios Financeiros
const FinanceWidget: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const stats = await dashboardService.getDashboardData()
        setData(stats.stats)
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Receita Mensal</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {(data?.monthlyRevenue || 0).toLocaleString()}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-500" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Clientes Ativos</p>
          <p className="text-lg font-bold text-gray-900">{data?.totalClients || 0}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Projetos</p>
          <p className="text-lg font-bold text-gray-900">{data?.activeProjects || 0}</p>
        </div>
      </div>
    </div>
  )
}

// Configuração dos widgets
export interface BaseWidgetProps {
  className?: string
}

export interface WidgetConfig {
  id: string
  title: string
  description: string
  component: React.FC<BaseWidgetProps>
  type: 'estatisticas' | 'lista' | 'grafico' | 'calendario' | 'chat' | 'financeiro'
  defaultSize: 'pequeno' | 'medio' | 'grande' | 'completo'
  refreshable: boolean
  configurable: boolean
  permissions?: string[]
}

export const AVAILABLE_WIDGETS: WidgetConfig[] = [
  {
    id: 'quick-stats',
    title: 'Estatísticas Rápidas',
    description: 'Visão geral dos principais indicadores',
    component: QuickStatsWidget,
    type: 'estatisticas',
    defaultSize: 'grande',
    refreshable: true,
    configurable: false,
    permissions: ['dashboard.view']
  },
  {
    id: 'tasks',
    title: 'Minhas Tarefas',
    description: 'Lista das tarefas em andamento',
    component: TasksWidget,
    type: 'lista',
    defaultSize: 'medio',
    refreshable: true,
    configurable: true,
    permissions: ['tasks.view']
  },
  {
    id: 'notifications',
    title: 'Notificações',
    description: 'Notificações não lidas',
    component: NotificationsWidget,
    type: 'lista',
    defaultSize: 'medio',
    refreshable: true,
    configurable: true,
    permissions: ['notifications.view']
  },
  {
    id: 'recent-activities',
    title: 'Atividades Recentes',
    description: 'Últimas atividades da equipe',
    component: RecentActivitiesWidget,
    type: 'lista',
    defaultSize: 'grande',
    refreshable: true,
    configurable: false,
    permissions: ['dashboard.view']
  },
  {
    id: 'performance-chart',
    title: 'Gráfico de Performance',
    description: 'Indicadores de performance da equipe',
    component: PerformanceChartWidget,
    type: 'grafico',
    defaultSize: 'medio',
    refreshable: true,
    configurable: true,
    permissions: ['dashboard.view']
  },
  {
    id: 'calendar',
    title: 'Calendário',
    description: 'Eventos e compromissos do dia',
    component: CalendarWidget,
    type: 'calendario',
    defaultSize: 'medio',
    refreshable: true,
    configurable: true,
    permissions: ['dashboard.view']
  },
  {
    id: 'chat',
    title: 'Chat/Mensagens',
    description: 'Mensagens recentes da equipe',
    component: ChatWidget,
    type: 'chat',
    defaultSize: 'medio',
    refreshable: true,
    configurable: true,
    permissions: ['chat.view']
  },
  {
    id: 'finance',
    title: 'Relatórios Financeiros',
    description: 'Resumo financeiro e indicadores',
    component: FinanceWidget,
    type: 'financeiro',
    defaultSize: 'medio',
    refreshable: true,
    configurable: true,
    permissions: ['finance.dre.view']
  }
]