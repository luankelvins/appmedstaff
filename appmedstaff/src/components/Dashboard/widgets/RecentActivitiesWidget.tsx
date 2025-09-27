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
      
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'commercial',
          title: 'Novo lead cadastrado',
          description: 'Lead "Clínica São Paulo" adicionado ao pipeline',
          user: {
            id: '1',
            name: 'Ana Silva'
          },
          timestamp: '2024-01-15T10:30:00Z',
          metadata: {
            entityType: 'lead',
            entityId: 'lead-123'
          }
        },
        {
          id: '2',
          type: 'financial',
          title: 'Pagamento recebido',
          description: 'Fatura #1234 paga pelo cliente MedCorp',
          user: {
            id: '2',
            name: 'Carlos Santos'
          },
          timestamp: '2024-01-15T09:15:00Z',
          metadata: {
            entityType: 'payment',
            amount: 5500,
            status: 'completed'
          }
        },
        {
          id: '3',
          type: 'task',
          title: 'Tarefa concluída',
          description: 'Emissão de NF para cliente finalizada',
          user: {
            id: '3',
            name: 'Maria Costa'
          },
          timestamp: '2024-01-15T08:45:00Z',
          metadata: {
            entityType: 'task',
            status: 'completed'
          }
        },
        {
          id: '4',
          type: 'document',
          title: 'Documento enviado',
          description: 'Contrato assinado enviado para cliente',
          user: {
            id: '4',
            name: 'João Oliveira'
          },
          timestamp: '2024-01-14T16:20:00Z',
          metadata: {
            entityType: 'contract'
          }
        },
        {
          id: '5',
          type: 'communication',
          title: 'Mensagem recebida',
          description: 'Nova mensagem no chat interno',
          user: {
            id: '5',
            name: 'Paula Ferreira'
          },
          timestamp: '2024-01-14T15:10:00Z',
          metadata: {
            entityType: 'message'
          }
        },
        {
          id: '6',
          type: 'user',
          title: 'Novo usuário',
          description: 'Colaborador adicionado ao sistema',
          user: {
            id: '6',
            name: 'Admin Sistema'
          },
          timestamp: '2024-01-14T14:00:00Z',
          metadata: {
            entityType: 'user'
          }
        }
      ]
      
      setActivities(mockActivities)
    } catch (err) {
      setError('Erro ao carregar atividades')
      console.error('Error loading activities:', err)
    } finally {
      setLoading(false)
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