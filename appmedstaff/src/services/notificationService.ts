import { useState, useEffect, useCallback } from 'react'
import { Notification, NotificationFilter, NotificationCreate, NotificationStats, NotificationSettings } from '../types/notification'

// Mock data para demonstração
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nova tarefa atribuída',
    message: 'Você foi designado para a tarefa "Análise de proposta comercial - Cliente ABC"',
    type: 'info',
    category: 'task',
    priority: 'medium',
    read: false,
    userId: 'user1',
    createdAt: new Date().toISOString(),
    actionUrl: '/tasks/1',
    actionLabel: 'Ver tarefa'
  },
  {
    id: '2',
    title: 'Aprovação de despesa necessária',
    message: 'Despesa de R$ 2.500,00 aguarda sua aprovação',
    type: 'warning',
    category: 'financial',
    priority: 'high',
    read: false,
    userId: 'user1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    actionUrl: '/finance/expenses/pending',
    actionLabel: 'Aprovar'
  },
  {
    id: '3',
    title: 'Lead convertido',
    message: 'Lead "Dr. João Silva" foi convertido em cliente',
    type: 'success',
    category: 'commercial',
    priority: 'medium',
    read: true,
    userId: 'user1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    readAt: new Date(Date.now() - 3600000).toISOString(),
    actionUrl: '/contacts/clients/123',
    actionLabel: 'Ver cliente'
  },
  {
    id: '4',
    title: 'Sistema de backup concluído',
    message: 'Backup automático realizado com sucesso às 02:00',
    type: 'success',
    category: 'system',
    priority: 'low',
    read: true,
    userId: 'user1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    readAt: new Date(Date.now() - 82800000).toISOString()
  },
  {
    id: '5',
    title: 'Erro no processamento de NF',
    message: 'Falha ao processar nota fiscal #12345. Verificação manual necessária.',
    type: 'error',
    category: 'operational',
    priority: 'urgent',
    read: false,
    userId: 'user1',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    actionUrl: '/operational/invoices/12345',
    actionLabel: 'Verificar'
  }
]

const mockSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  categories: {
    system: true,
    task: true,
    commercial: true,
    operational: true,
    financial: true,
    hr: true,
    audit: false
  },
  priorities: {
    low: false,
    medium: true,
    high: true,
    urgent: true
  }
}

// Simulação de WebSocket/SSE para notificações em tempo real
class NotificationManager {
  private listeners: ((notification: Notification) => void)[] = []
  private interval: NodeJS.Timeout | null = null

  subscribe(callback: (notification: Notification) => void) {
    this.listeners.push(callback)
    
    // Simula recebimento de notificações a cada 30 segundos
    if (!this.interval) {
      this.interval = setInterval(() => {
        const randomNotification = this.generateRandomNotification()
        this.listeners.forEach(listener => listener(randomNotification))
      }, 30000)
    }

    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
      if (this.listeners.length === 0 && this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }
    }
  }

  private generateRandomNotification(): Notification {
    const types: Notification['type'][] = ['info', 'success', 'warning', 'error']
    const categories: Notification['category'][] = ['system', 'task', 'commercial', 'operational', 'financial']
    const priorities: Notification['priority'][] = ['low', 'medium', 'high']

    const messages = [
      'Nova tarefa foi criada',
      'Documento foi aprovado',
      'Cliente entrou em contato',
      'Backup foi concluído',
      'Relatório está pronto'
    ]

    return {
      id: Date.now().toString(),
      title: 'Nova notificação',
      message: messages[Math.floor(Math.random() * messages.length)],
      type: types[Math.floor(Math.random() * types.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      read: false,
      userId: 'user1',
      createdAt: new Date().toISOString()
    }
  }
}

const notificationManager = new NotificationManager()

// Serviços de API
export const notificationService = {
  async getNotifications(filter?: NotificationFilter): Promise<Notification[]> {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let filtered = [...mockNotifications]

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter(n => n.type === filter.type)
      }
      if (filter.category) {
        filtered = filtered.filter(n => n.category === filter.category)
      }
      if (filter.priority) {
        filtered = filtered.filter(n => n.priority === filter.priority)
      }
      if (filter.read !== undefined) {
        filtered = filtered.filter(n => n.read === filter.read)
      }
      if (filter.dateFrom) {
        filtered = filtered.filter(n => new Date(n.createdAt) >= new Date(filter.dateFrom!))
      }
      if (filter.dateTo) {
        filtered = filtered.filter(n => new Date(n.createdAt) <= new Date(filter.dateTo!))
      }
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async markAsRead(notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const notification = mockNotifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      notification.readAt = new Date().toISOString()
    }
  },

  async markAllAsRead(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    mockNotifications.forEach(n => {
      if (!n.read) {
        n.read = true
        n.readAt = new Date().toISOString()
      }
    })
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = mockNotifications.findIndex(n => n.id === notificationId)
    if (index > -1) {
      mockNotifications.splice(index, 1)
    }
  },

  async createNotification(notification: NotificationCreate): Promise<Notification> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString()
    }
    mockNotifications.unshift(newNotification)
    return newNotification
  },

  async getStats(): Promise<NotificationStats> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const total = mockNotifications.length
    const unread = mockNotifications.filter(n => !n.read).length
    
    const byType = mockNotifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byCategory = mockNotifications.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byPriority = mockNotifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, unread, byType, byCategory, byPriority }
  },

  async getSettings(): Promise<NotificationSettings> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { ...mockSettings }
  },

  async updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    await new Promise(resolve => setTimeout(resolve, 200))
    Object.assign(mockSettings, settings)
    return { ...mockSettings }
  }
}

// Hook para gerenciar notificações
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(false)

  const loadNotifications = useCallback(async (filter?: NotificationFilter) => {
    setLoading(true)
    try {
      const data = await notificationService.getNotifications(filter)
      setNotifications(data)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const data = await notificationService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }, [])

  const loadSettings = useCallback(async () => {
    try {
      const data = await notificationService.getSettings()
      setSettings(data)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
        )
      )
      loadStats()
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }, [loadStats])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
      )
      loadStats()
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }, [loadStats])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      loadStats()
    } catch (error) {
      console.error('Erro ao excluir notificação:', error)
    }
  }, [loadStats])

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updated = await notificationService.updateSettings(newSettings)
      setSettings(updated)
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
    }
  }, [])

  // Subscrição para notificações em tempo real
  useEffect(() => {
    const unsubscribe = notificationManager.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev])
      loadStats()
    })

    return unsubscribe
  }, [loadStats])

  useEffect(() => {
    loadNotifications()
    loadStats()
    loadSettings()
  }, [loadNotifications, loadStats, loadSettings])

  return {
    notifications,
    stats,
    settings,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings
  }
}