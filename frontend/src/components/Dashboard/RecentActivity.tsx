import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  CheckCircle, 
  Clock, 
  User, 
  FileText, 
  MessageCircle,
  AlertCircle,
  TrendingUp,
  UserPlus
} from 'lucide-react'

export interface ActivityItem {
  id: string
  type: 'task_completed' | 'task_created' | 'comment_added' | 'user_joined' | 'document_uploaded' | 'status_changed' | 'milestone_reached'
  title: string
  description: string
  user: {
    name: string
    avatar?: string
  }
  timestamp: Date
  metadata?: {
    taskId?: string
    projectId?: string
    documentName?: string
    oldStatus?: string
    newStatus?: string
  }
}

interface RecentActivityProps {
  activities: ActivityItem[]
  loading?: boolean
  maxItems?: number
  onViewAll?: () => void
}

const activityIcons = {
  task_completed: CheckCircle,
  task_created: Clock,
  comment_added: MessageCircle,
  user_joined: UserPlus,
  document_uploaded: FileText,
  status_changed: AlertCircle,
  milestone_reached: TrendingUp
}

const activityColors = {
  task_completed: 'text-green-500 bg-green-100',
  task_created: 'text-blue-500 bg-blue-100',
  comment_added: 'text-purple-500 bg-purple-100',
  user_joined: 'text-indigo-500 bg-indigo-100',
  document_uploaded: 'text-yellow-500 bg-yellow-100',
  status_changed: 'text-orange-500 bg-orange-100',
  milestone_reached: 'text-pink-500 bg-pink-100'
}

export const RecentActivity = ({ 
  activities, 
  loading = false, 
  maxItems = 5,
  onViewAll 
}: RecentActivityProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-start space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const displayedActivities = activities.slice(0, maxItems)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Atividades Recentes
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-medstaff-primary hover:text-medstaff-primary-dark transition-colors"
          >
            Ver todas
          </button>
        )}
      </div>
      
      {displayedActivities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma atividade recente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedActivities.map((activity) => {
            const Icon = activityIcons[activity.type]
            const colorClass = activityColors[activity.type]
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-full ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user.name}</span>{' '}
                    {activity.description}
                  </p>
                  {activity.title && (
                    <p className="text-sm text-gray-600 truncate">
                      {activity.title}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDistanceToNow(activity.timestamp, { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default RecentActivity