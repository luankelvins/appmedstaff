import React, { useState, useEffect } from 'react'
import { Calendar, Filter, Download, Activity, MapPin, Monitor, Smartphone } from 'lucide-react'
import { ActivityLog, ProfileStats } from '../../types/profile'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ActivityTabProps {
  userId: string
  onExportActivity: () => Promise<void>
}

export const ActivityTab: React.FC<ActivityTabProps> = ({
  userId,
  onExportActivity
}) => {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    loadActivityData()
  }, [userId, filter, dateRange])

  const loadActivityData = async () => {
    setLoading(true)
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          userId,
          action: 'login',
          description: 'Login realizado com sucesso',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          location: 'São Paulo, SP',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min ago
        },
        {
          id: '2',
          userId,
          action: 'profile.update',
          description: 'Perfil atualizado',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          location: 'São Paulo, SP',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2h ago
        },
        {
          id: '3',
          userId,
          action: 'password.change',
          description: 'Senha alterada',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
          location: 'São Paulo, SP',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        },
        {
          id: '4',
          userId,
          action: 'task.create',
          description: 'Nova tarefa criada: "Revisar documentos"',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          location: 'São Paulo, SP',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
        },
        {
          id: '5',
          userId,
          action: 'document.upload',
          description: 'Documento enviado: contrato.pdf',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          location: 'São Paulo, SP',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
        }
      ]

      const mockStats: ProfileStats = {
        loginCount: 127,
        lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        accountAge: 365,
        tasksCompleted: 89,
        messagesExchanged: 234,
        documentsUploaded: 45
      }

      setActivities(mockActivities)
      setStats(mockStats)
    } catch (error) {
      console.error('Erro ao carregar atividades:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return '🔐'
    if (action.includes('profile')) return '👤'
    if (action.includes('password')) return '🔑'
    if (action.includes('task')) return '📋'
    if (action.includes('document')) return '📄'
    if (action.includes('message')) return '💬'
    return '📊'
  }

  const getActionColor = (action: string) => {
    if (action.includes('login')) return 'bg-green-100 text-green-800'
    if (action.includes('profile')) return 'bg-blue-100 text-blue-800'
    if (action.includes('password')) return 'bg-yellow-100 text-yellow-800'
    if (action.includes('task')) return 'bg-purple-100 text-purple-800'
    if (action.includes('document')) return 'bg-indigo-100 text-indigo-800'
    if (action.includes('message')) return 'bg-pink-100 text-pink-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('iPhone') || userAgent.includes('Android')) {
      return <Smartphone className="w-4 h-4" />
    }
    return <Monitor className="w-4 h-4" />
  }

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true
    return activity.action.includes(filter)
  })

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Estatísticas da Conta
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.loginCount}</div>
              <div className="text-sm text-gray-500">Logins</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.accountAge}</div>
              <div className="text-sm text-gray-500">Dias de conta</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.tasksCompleted}</div>
              <div className="text-sm text-gray-500">Tarefas</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{stats.messagesExchanged}</div>
              <div className="text-sm text-gray-500">Mensagens</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.documentsUploaded}</div>
              <div className="text-sm text-gray-500">Documentos</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">Último login</div>
              <div className="text-sm font-medium text-gray-900">
                {formatDistanceToNow(new Date(stats.lastLogin), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Histórico de Atividades */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">
              Histórico de Atividades
            </h3>
            
            <div className="flex items-center space-x-3">
              {/* Filtros */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todas</option>
                  <option value="login">Login</option>
                  <option value="profile">Perfil</option>
                  <option value="password">Senha</option>
                  <option value="task">Tarefas</option>
                  <option value="document">Documentos</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                  <option value="1y">Último ano</option>
                </select>
              </div>
              
              <button
                onClick={onExportActivity}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredActivities.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Nenhuma atividade encontrada para os filtros selecionados
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Ícone da ação */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                    </div>
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(activity.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        {getDeviceIcon(activity.userAgent)}
                        <span>
                          {activity.userAgent.includes('iPhone') ? 'Mobile' : 
                           activity.userAgent.includes('Android') ? 'Mobile' : 'Desktop'}
                        </span>
                      </div>
                      
                      {activity.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{activity.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <span>IP: {activity.ip}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: ptBR })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {filteredActivities.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500 text-center">
              Mostrando {filteredActivities.length} de {activities.length} atividades
            </p>
          </div>
        )}
      </div>
    </div>
  )
}