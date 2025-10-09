import React, { useState, useEffect } from 'react'
import { 
  User, 
  FileText, 
  DollarSign, 
  Users, 
  Calendar,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react'
import DashboardWidget from '../DashboardWidget'
import { dashboardService } from '../../../utils/dashboardService'
import { ActivityItem } from '../RecentActivity'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

interface Activity {
  id: string
  type: 'user' | 'document' | 'financial' | 'commercial' | 'task' | 'communication'
  title: string
  description: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  metadata?: {
    entityType?: string
    entityId?: string
    amount?: number
    status?: string
  }
}

const RecentActivitiesWidget: React.FC<BaseWidgetProps> = ({ 
  onRefresh, 
  onConfigure, 
  className 
}) => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)

  const loadActivities = async () => {
    try {
      setLoading(true)
      setError(undefined)
      
      // Carregar atividades reais do dashboardService
      const realActivities = await dashboardService.getRecentActivities(6)
      
      // Mapear os dados para o formato esperado pelo widget
      const mappedActivities: Activity[] = realActivities.map(activity => ({
        id: activity.id,
        type: mapActivityType(activity.type),
        title: activity.title,
        description: activity.description,
        user: {
          id: 'user-' + activity.user.name.replace(/\s+/g, '-').toLowerCase(),
          name: activity.user.name,
          avatar: activity.user.avatar
        },
        timestamp: activity.timestamp instanceof Date ? activity.timestamp.toISOString() : activity.timestamp,
        metadata: {
          entityType: activity.metadata?.taskId ? 'task' : 'general',
          entityId: activity.metadata?.taskId || activity.metadata?.projectId || activity.id,
          status: activity.metadata?.newStatus || activity.metadata?.oldStatus
        }
      }))
      
      setActivities(mappedActivities)
    } catch (err) {
      setError('Erro ao carregar atividades')
      console.error('Error loading activities:', err)
    } finally {
      setLoading(false)
    }
  }

  // Função para mapear tipos de atividade para os tipos esperados pelo widget
  const mapActivityType = (type: string): Activity['type'] => {
    switch (type) {
      case 'task_completed':
      case 'task_created':
        return 'task'
      case 'lead_created':
      case 'lead_updated':
        return 'commercial'
      case 'revenue_added':
      case 'expense_added':
        return 'financial'
      case 'document_uploaded':
        return 'document'
      case 'comment_added':
        return 'communication'
      case 'user_joined':
        return 'user'
      default:
        return 'task'
    }
  }

  useEffect(() => {
    loadActivities()
  }, [])

  const handleRefresh = () => {
    loadActivities()
    onRefresh?.()
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4 text-blue-500" />
      case 'document':
        return <FileText className="w-4 h-4 text-green-500" />
      case 'financial':
        return <DollarSign className="w-4 h-4 text-emerald-500" />
      case 'commercial':
        return <Users className="w-4 h-4 text-purple-500" />
      case 'task':
        return <CheckCircle className="w-4 h-4 text-orange-500" />
      case 'communication':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'user':
        return 'bg-blue-50 border-blue-200'
      case 'document':
        return 'bg-green-50 border-green-200'
      case 'financial':
        return 'bg-emerald-50 border-emerald-200'
      case 'commercial':
        return 'bg-purple-50 border-purple-200'
      case 'task':
        return 'bg-orange-50 border-orange-200'
      case 'communication':
        return 'bg-indigo-50 border-indigo-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}min atrás`
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  return (
    <DashboardWidget
      id="recent-activities"
      title="Atividades Recentes"
      subtitle={`${activities.length} atividades hoje`}
      loading={loading}
      error={error}
      size="medium"
      refreshable
      onRefresh={handleRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`
              p-3 rounded-lg border transition-colors hover:shadow-sm cursor-pointer
              ${getActivityColor(activity.type)}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {activity.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{activity.user.name}</span>
                      <span>{formatTimestamp(activity.timestamp)}</span>
                    </div>
                    
                    {activity.metadata?.amount && (
                      <div className="mt-2 text-xs font-medium text-green-600">
                        {formatAmount(activity.metadata.amount)}
                      </div>
                    )}
                  </div>
                  
                  <ArrowRight className="w-3 h-3 text-gray-400 ml-2 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhuma atividade recente</p>
          </div>
        )}
        
        <div className="pt-3 border-t border-gray-200">
          <button className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
            <span>Ver todas as atividades</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </DashboardWidget>
  )
}

export default RecentActivitiesWidget