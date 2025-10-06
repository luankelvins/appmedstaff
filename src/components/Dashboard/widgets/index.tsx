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
import { widgetDataService } from '../../../services/widgetDataService'
import { TaskStatus } from '../../../types/task'

// Importando os novos widgets avançados
import ProductivityAnalyticsWidget from './ProductivityAnalyticsWidget'
import SystemMonitorWidget from './SystemMonitorWidget'
import SalesAnalyticsWidget from './SalesAnalyticsWidget'
import TeamManagementWidget from './TeamManagementWidget'
import FinancialAnalyticsWidget from './FinancialAnalyticsWidget'

// Widget de Estatísticas Rápidas Melhorado
const QuickStatsWidget: React.FC = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month')

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Buscar dados reais do banco
        const dashboardData = await dashboardService.getDashboardData()
        
        // Buscar dados do período anterior para comparação
        // Por enquanto, se não houver dados no banco, mostrar zeros (sem simulação)
        const enhancedStats = {
          totalClients: dashboardData.stats.totalClients || 0,
          previousClients: 0, // TODO: implementar busca do mês anterior
          completedTasks: dashboardData.stats.completedTasks || 0,
          previousCompletedTasks: 0, // TODO: implementar busca do mês anterior
          pendingTasks: dashboardData.stats.pendingTasks || 0,
          previousPendingTasks: 0, // TODO: implementar busca do mês anterior
          monthlyRevenue: dashboardData.stats.monthlyRevenue || 0,
          previousRevenue: 0, // TODO: implementar busca do mês anterior
          efficiency: 0,
          previousEfficiency: 0
        }
        
        setStats(enhancedStats)
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
        setError('Erro ao carregar dados do dashboard')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [period])

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">
          <AlertTriangle className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-gray-600 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const statsData = [
    {
      id: 'clients',
      label: 'Clientes',
      value: stats?.totalClients || 0,
      previous: stats?.previousClients || 0,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-500',
      boldColor: 'text-blue-900'
    },
    {
      id: 'completed',
      label: 'Concluídas',
      value: stats?.completedTasks || 0,
      previous: stats?.previousCompletedTasks || 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconColor: 'text-green-500',
      boldColor: 'text-green-900'
    },
    {
      id: 'pending',
      label: 'Pendentes',
      value: stats?.pendingTasks || 0,
      previous: stats?.previousPendingTasks || 0,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      iconColor: 'text-yellow-500',
      boldColor: 'text-yellow-900'
    },
    {
      id: 'revenue',
      label: 'Receita',
      value: stats?.monthlyRevenue || 0,
      previous: stats?.previousRevenue || 0,
      icon: DollarSign,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconColor: 'text-purple-500',
      boldColor: 'text-purple-900',
      format: 'currency'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Seletor de Período */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">Estatísticas Rápidas</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'today', label: 'Hoje' },
            { key: 'week', label: 'Semana' },
            { key: 'month', label: 'Mês' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key as any)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                period === key
                  ? 'bg-white text-medstaff-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-2 gap-3">
        {statsData.map((stat) => {
          const change = calculateChange(stat.value, stat.previous)
          const Icon = stat.icon
          
          return (
            <div
              key={stat.id}
              className={`${stat.bgColor} p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium ${stat.textColor}`}>{stat.label}</span>
                  {getTrendIcon(change)}
                </div>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              
              <div className="space-y-1">
                <div className={`text-xl font-bold ${stat.boldColor}`}>
                  {stat.format === 'currency' 
                    ? `R$ ${stat.value.toLocaleString()}`
                    : stat.value.toLocaleString()
                  }
                </div>
                
                <div className="flex items-center justify-between">
                  <div className={`text-xs font-medium ${getChangeColor(change)}`}>
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    vs. período anterior
                  </div>
                </div>
                
                {/* Mini barra de progresso */}
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      change > 0 ? 'bg-green-500' : change < 0 ? 'bg-red-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min(Math.abs(change) * 2, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Resumo de Eficiência */}
      <div className="bg-gradient-to-r from-medstaff-light to-medstaff-accent/20 border border-medstaff-secondary/30 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-medstaff-primary" />
            <span className="text-sm font-semibold text-medstaff-primary">Eficiência Geral</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-medstaff-primary">
              {stats?.efficiency?.toFixed(1) || 0}%
            </div>
            <div className={`text-xs font-medium ${getChangeColor(calculateChange(stats?.efficiency || 0, stats?.previousEfficiency || 0))}`}>
              {calculateChange(stats?.efficiency || 0, stats?.previousEfficiency || 0) > 0 ? '+' : ''}
              {calculateChange(stats?.efficiency || 0, stats?.previousEfficiency || 0).toFixed(1)}%
            </div>
          </div>
        </div>
        
        {/* Barra de progresso da eficiência */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-medstaff-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats?.efficiency || 0}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Widget de Tarefas Melhorado
const TasksWidget: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'high' | 'today' | 'overdue'>('all')
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 })

  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Buscar tarefas reais do usuário
        const taskResponse = await taskService.getTasks(undefined, undefined, 1, 10)
        const userTasks = taskResponse.tasks
        
        // Enriquecer dados das tarefas com informações adicionais
        const enrichedTasks = userTasks.slice(0, 10).map((task: any) => ({
          id: task.id,
          title: task.title,
          category: task.category || 'Geral',
          priority: task.priority || 'medium',
          status: task.status,
          progress: task.status === TaskStatus.DONE ? 100 : task.status === TaskStatus.IN_PROGRESS ? 50 : 0,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : new Date().toISOString(),
          assignee: task.assignedTo || 'Não atribuído',
          estimatedHours: task.estimatedHours || 4,
          spentHours: task.actualHours || 0
        }))

        // Aplicar filtros
        let filteredTasks = enrichedTasks
        const today = new Date().toDateString()
        
        switch (filter) {
          case 'high':
            filteredTasks = enrichedTasks.filter(task => task.priority === 'high')
            break
          case 'today':
            filteredTasks = enrichedTasks.filter(task => 
              new Date(task.dueDate).toDateString() === today
            )
            break
          case 'overdue':
            filteredTasks = enrichedTasks.filter(task => 
              new Date(task.dueDate) < new Date() && task.status !== 'completed'
            )
            break
          default:
            filteredTasks = enrichedTasks
        }

        setTasks(filteredTasks)
        
        // Calcular estatísticas
        const totalTasks = enrichedTasks.length
        const completedTasks = enrichedTasks.filter(t => t.status === 'completed').length
        const pendingTasks = enrichedTasks.filter(t => t.status === 'pending').length
        const overdueTasks = enrichedTasks.filter(t => 
          new Date(t.dueDate) < new Date() && t.status !== 'completed'
        ).length

        setStats({
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          overdue: overdueTasks
        })
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error)
        setError('Erro ao carregar tarefas')
      } finally {
        setLoading(false)
      }
    }
    loadTasks()
  }, [filter])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return 'Normal'
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const formatTimeRemaining = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffMs = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `${Math.abs(diffDays)}d atrasado`
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Amanhã'
    return `${diffDays}d restantes`
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-gray-200 rounded w-full"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">
          <AlertTriangle className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-gray-600 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com Estatísticas */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">Minhas Tarefas</h3>
        <div className="flex items-center space-x-2 text-xs">
          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
            {stats.total} total
          </span>
          {stats.overdue > 0 && (
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full">
              {stats.overdue} atrasadas
            </span>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        {[
          { key: 'all', label: 'Todas', count: stats.total },
          { key: 'high', label: 'Alta', count: null },
          { key: 'today', label: 'Hoje', count: null },
          { key: 'overdue', label: 'Atrasadas', count: stats.overdue }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-md transition-colors flex-1 justify-center ${
              filter === key
                ? 'bg-white text-medstaff-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{label}</span>
            {count !== null && count > 0 && (
              <span className={`text-xs px-1 rounded-full ${
                filter === key ? 'bg-medstaff-primary/20' : 'bg-gray-200'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              {filter === 'all' ? 'Nenhuma tarefa encontrada' : 
               filter === 'overdue' ? 'Nenhuma tarefa atrasada' :
               filter === 'today' ? 'Nenhuma tarefa para hoje' :
               'Nenhuma tarefa de alta prioridade'}
            </p>
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer ${
                isOverdue(task.dueDate) ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`w-3 h-3 rounded-full mt-1 ${getPriorityColor(task.priority)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{task.category}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{task.assignee}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-xs font-medium ${
                    isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {formatTimeRemaining(task.dueDate)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {task.spentHours}h / {task.estimatedHours}h
                  </div>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    task.priority === 'high' ? 'bg-red-100 text-red-600' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-600">{task.progress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    task.progress >= 80 ? 'bg-green-500' :
                    task.progress >= 50 ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resumo de Produtividade */}
      {tasks.length > 0 && (
        <div className="bg-gradient-to-r from-medstaff-light to-medstaff-accent/20 border border-medstaff-secondary/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-medstaff-primary" />
              <span className="text-sm font-semibold text-medstaff-primary">Produtividade</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-medstaff-primary">
                {Math.round(tasks.reduce((acc, task) => acc + task.progress, 0) / tasks.length)}%
              </div>
              <div className="text-xs text-gray-600">Progresso médio</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Widget de Notificações Melhorado
const NotificationsWidget: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'important' | 'system'>('unread')
  const [stats, setStats] = useState({ total: 0, unread: 0, important: 0, system: 0 })

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Buscar notificações reais do usuário
        const realNotifications = await notificationService.getNotifications()
        
        // Mapear notificações para o formato esperado pelo widget
        const enrichedNotifications = realNotifications.slice(0, 10).map((notification: any) => ({
          id: notification.id,
          title: notification.title,
          message: notification.message || notification.content,
          type: notification.type || 'info',
          category: notification.category || 'general',
          priority: notification.priority || 'medium',
          read: notification.read || false,
          createdAt: notification.created_at || notification.createdAt,
          actionRequired: notification.action_required || false,
          actionUrl: notification.action_url || null,
          sender: notification.sender || 'Sistema'
        }))

        // Aplicar filtros
        let filteredNotifications = enrichedNotifications
        
        switch (filter) {
          case 'unread':
            filteredNotifications = enrichedNotifications.filter(n => !n.read)
            break
          case 'important':
            filteredNotifications = enrichedNotifications.filter(n => n.priority === 'high')
            break
          case 'system':
            filteredNotifications = enrichedNotifications.filter(n => n.category === 'system')
            break
          default:
            filteredNotifications = enrichedNotifications
        }

        setNotifications(filteredNotifications.slice(0, 8))
        
        // Calcular estatísticas
        const totalNotifications = enrichedNotifications.length
        const unreadNotifications = enrichedNotifications.filter(n => !n.read).length
        const importantNotifications = enrichedNotifications.filter(n => n.priority === 'high').length
        const systemNotifications = enrichedNotifications.filter(n => n.category === 'system').length

        setStats({
          total: totalNotifications,
          unread: unreadNotifications,
          important: importantNotifications,
          system: systemNotifications
        })
      } catch (error) {
        console.error('Erro ao carregar notificações:', error)
        setError('Erro ao carregar notificações. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }
    loadNotifications()
  }, [filter])

  const getNotificationIcon = (type: string, category: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'task': return <Briefcase className="w-4 h-4 text-blue-500" />
      case 'reminder': return <Clock className="w-4 h-4 text-orange-500" />
      case 'comment': return <MessageSquare className="w-4 h-4 text-purple-500" />
      case 'system': return <Activity className="w-4 h-4 text-gray-500" />
      default: return <Bell className="w-4 h-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    return `${diffDays}d atrás`
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setStats(prev => ({ ...prev, unread: 0 }))
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-gray-200 rounded w-full"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-sm text-gray-600 mb-3">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 text-xs bg-medstaff-primary text-white rounded hover:bg-medstaff-secondary transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com Estatísticas e Ações */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">Notificações</h3>
        <div className="flex items-center space-x-2">
          {stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-medstaff-primary hover:text-medstaff-secondary transition-colors"
            >
              Marcar todas como lidas
            </button>
          )}
          <div className="flex items-center space-x-1 text-xs">
            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              {stats.total} total
            </span>
            {stats.unread > 0 && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full">
                {stats.unread} não lidas
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        {[
          { key: 'unread', label: 'Não lidas', count: stats.unread },
          { key: 'all', label: 'Todas', count: stats.total },
          { key: 'important', label: 'Importantes', count: stats.important },
          { key: 'system', label: 'Sistema', count: stats.system }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-md transition-colors flex-1 justify-center ${
              filter === key
                ? 'bg-white text-medstaff-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{label}</span>
            {count > 0 && (
              <span className={`text-xs px-1 rounded-full ${
                filter === key ? 'bg-medstaff-primary/20' : 'bg-gray-200'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              {filter === 'unread' ? 'Nenhuma notificação não lida' :
               filter === 'important' ? 'Nenhuma notificação importante' :
               filter === 'system' ? 'Nenhuma notificação do sistema' :
               'Nenhuma notificação encontrada'}
            </p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`border-l-4 rounded-lg p-3 transition-all hover:shadow-sm cursor-pointer ${
                getPriorityColor(notification.priority)
              } ${!notification.read ? 'ring-1 ring-blue-200' : ''}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start space-x-3 flex-1">
                  {getNotificationIcon(notification.type, notification.category)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{notification.sender}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      
                      {notification.actionRequired && (
                        <button className="text-xs text-medstaff-primary hover:text-medstaff-secondary font-medium">
                          Ver detalhes
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    notification.priority === 'high' ? 'bg-red-100 text-red-600' :
                    notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {notification.priority === 'high' ? 'Alta' :
                     notification.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                  
                  {notification.actionRequired && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resumo de Atividade */}
      {notifications.length > 0 && (
        <div className="bg-gradient-to-r from-medstaff-light to-medstaff-accent/20 border border-medstaff-secondary/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-medstaff-primary" />
              <span className="text-sm font-semibold text-medstaff-primary">Centro de Notificações</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-medstaff-primary">
                {stats.unread}
              </div>
              <div className="text-xs text-gray-600">Pendentes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Widget de Atividades Recentes
const RecentActivitiesWidget: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await dashboardService.getRecentActivities(5)
        setActivities(data)
      } catch (error) {
        console.error('Erro ao carregar atividades:', error)
        setError('Erro ao carregar atividades recentes. Tente novamente.')
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-sm text-gray-600 mb-3">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 text-xs bg-medstaff-primary text-white rounded hover:bg-medstaff-secondary transition-colors"
        >
          Tentar novamente
        </button>
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
        // Buscar tarefas do dia como eventos
        const taskResponse = await taskService.getTasks(undefined, undefined, 1, 10)
        const today = new Date().toDateString()
        
        const todayTasks = taskResponse.tasks
          .filter((task: any) => task.dueDate && new Date(task.dueDate).toDateString() === today)
          .map((task: any) => ({
            id: task.id,
            title: task.title,
            time: new Date(task.dueDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            type: task.priority === 'high' ? 'deadline' : 'meeting'
          }))
        
        setEvents(todayTasks)
      } catch (error) {
        console.error('Erro ao carregar eventos:', error)
        setEvents([])
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
        // TODO: Implementar serviço de chat real
        // Por enquanto, mostra lista vazia até termos o serviço
        setMessages([])
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error)
        setMessages([])
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
  type: 'estatisticas' | 'lista' | 'grafico' | 'calendario' | 'chat' | 'financeiro' | 'produtividade' | 'sistema' | 'vendas' | 'equipe' | 'analytics'
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
  },
  {
    id: 'productivity-analytics',
    title: 'Análise de Produtividade',
    description: 'Métricas avançadas de produtividade da equipe',
    component: ProductivityAnalyticsWidget,
    type: 'produtividade',
    defaultSize: 'grande',
    refreshable: true,
    configurable: true,
    permissions: ['dashboard.view', 'analytics.view']
  },
  {
    id: 'system-monitor',
    title: 'Monitor do Sistema',
    description: 'Monitoramento em tempo real do sistema',
    component: SystemMonitorWidget,
    type: 'sistema',
    defaultSize: 'grande',
    refreshable: true,
    configurable: true,
    permissions: ['system.monitor', 'dashboard.view']
  },
  {
    id: 'sales-analytics',
    title: 'Análise de Vendas',
    description: 'Métricas de vendas e conversão',
    component: SalesAnalyticsWidget,
    type: 'vendas',
    defaultSize: 'grande',
    refreshable: true,
    configurable: true,
    permissions: ['sales.view', 'analytics.view']
  },
  {
    id: 'team-management',
    title: 'Gestão de Equipe',
    description: 'Métricas de RH e gestão de pessoas',
    component: TeamManagementWidget,
    type: 'equipe',
    defaultSize: 'grande',
    refreshable: true,
    configurable: true,
    permissions: ['hr.view', 'team.manage']
  },
  {
    id: 'financial-analytics',
    title: 'Analytics Financeiro',
    description: 'Análise financeira avançada com projeções',
    component: FinancialAnalyticsWidget,
    type: 'analytics',
    defaultSize: 'grande',
    refreshable: true,
    configurable: true,
    permissions: ['finance.analytics', 'dashboard.view']
  }
]