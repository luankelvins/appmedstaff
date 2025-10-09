export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'system' | 'task' | 'commercial' | 'operational' | 'financial' | 'hr' | 'audit'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  read: boolean
  userId: string
  createdAt: string
  readAt?: string
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
}

export interface NotificationFilter {
  type?: 'info' | 'success' | 'warning' | 'error'
  category?: 'system' | 'task' | 'commercial' | 'operational' | 'financial' | 'hr' | 'audit'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  read?: boolean
  dateFrom?: string
  dateTo?: string
}

export interface NotificationCreate {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'system' | 'task' | 'commercial' | 'operational' | 'financial' | 'hr' | 'audit'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  userId: string
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<string, number>
  byCategory: Record<string, number>
  byPriority: Record<string, number>
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  categories: {
    system: boolean
    task: boolean
    commercial: boolean
    operational: boolean
    financial: boolean
    hr: boolean
    audit: boolean
  }
  priorities: {
    low: boolean
    medium: boolean
    high: boolean
    urgent: boolean
  }
}