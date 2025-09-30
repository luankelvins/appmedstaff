export interface DashboardWidget {
  id: string
  type: 'stats' | 'chart' | 'tasks' | 'activities' | 'projects'
  title: string
  enabled: boolean
  position: number
  size: 'small' | 'medium' | 'large'
  config?: Record<string, any>
}

export interface UserPreferences {
  dashboardLayout: 'grid' | 'list' | 'compact'
  theme: 'light' | 'dark' | 'auto'
  widgets: DashboardWidget[]
  notifications: {
    email: boolean
    push: boolean
    taskReminders: boolean
    projectUpdates: boolean
  }
  defaultViews: {
    tasksView: 'list' | 'kanban' | 'calendar'
    projectsView: 'grid' | 'list'
  }
}

class UserPreferencesService {
  private readonly STORAGE_KEY = 'medstaff_user_preferences'

  private defaultPreferences: UserPreferences = {
    dashboardLayout: 'grid',
    theme: 'light',
    widgets: [
      {
        id: 'stats-clients',
        type: 'stats',
        title: 'Total de Clientes',
        enabled: true,
        position: 1,
        size: 'small'
      },
      {
        id: 'stats-tasks-completed',
        type: 'stats',
        title: 'Tarefas Concluídas',
        enabled: true,
        position: 2,
        size: 'small'
      },
      {
        id: 'stats-tasks-pending',
        type: 'stats',
        title: 'Tarefas Pendentes',
        enabled: true,
        position: 3,
        size: 'small'
      },
      {
        id: 'stats-revenue',
        type: 'stats',
        title: 'Receita Mensal',
        enabled: true,
        position: 4,
        size: 'small'
      },
      {
        id: 'tasks-overview',
        type: 'tasks',
        title: 'Visão Geral das Tarefas',
        enabled: true,
        position: 5,
        size: 'medium'
      },
      {
        id: 'recent-activities',
        type: 'activities',
        title: 'Atividades Recentes',
        enabled: true,
        position: 6,
        size: 'medium'
      },
      {
        id: 'task-status-chart',
        type: 'chart',
        title: 'Status das Tarefas',
        enabled: true,
        position: 7,
        size: 'medium',
        config: { chartType: 'donut' }
      },
      {
        id: 'projects-overview',
        type: 'projects',
        title: 'Visão Geral dos Projetos',
        enabled: true,
        position: 8,
        size: 'large'
      }
    ],
    notifications: {
      email: true,
      push: true,
      taskReminders: true,
      projectUpdates: true
    },
    defaultViews: {
      tasksView: 'kanban',
      projectsView: 'grid'
    }
  }

  async getPreferences(): Promise<UserPreferences> {
    console.log('⚙️ UserPreferencesService - getPreferences executado (MOCK ESTÁTICO)')
    
    // Retorno imediato para debug
    return this.defaultPreferences
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const current = await this.getPreferences()
      const updated = { ...current, ...preferences }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Erro ao salvar preferências do usuário:', error)
      throw error
    }
  }

  async updateWidget(widgetId: string, updates: Partial<DashboardWidget>): Promise<void> {
    const preferences = await this.getPreferences()
    const widgetIndex = preferences.widgets.findIndex(w => w.id === widgetId)
    
    if (widgetIndex >= 0) {
      preferences.widgets[widgetIndex] = {
        ...preferences.widgets[widgetIndex],
        ...updates
      }
      await this.updatePreferences({ widgets: preferences.widgets })
    }
  }

  async toggleWidget(widgetId: string): Promise<void> {
    const preferences = await this.getPreferences()
    const widget = preferences.widgets.find(w => w.id === widgetId)
    
    if (widget) {
      await this.updateWidget(widgetId, { enabled: !widget.enabled })
    }
  }

  async reorderWidgets(widgetIds: string[]): Promise<void> {
    const preferences = await this.getPreferences()
    const reorderedWidgets = widgetIds.map((id, index) => {
      const widget = preferences.widgets.find(w => w.id === id)
      return widget ? { ...widget, position: index + 1 } : null
    }).filter(Boolean) as DashboardWidget[]

    await this.updatePreferences({ widgets: reorderedWidgets })
  }

  async resetToDefaults(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  // Métodos para configurações específicas
  async updateTheme(theme: UserPreferences['theme']): Promise<void> {
    await this.updatePreferences({ theme })
  }

  async updateDashboardLayout(layout: UserPreferences['dashboardLayout']): Promise<void> {
    await this.updatePreferences({ dashboardLayout: layout })
  }

  async updateNotificationSettings(notifications: Partial<UserPreferences['notifications']>): Promise<void> {
    const current = await this.getPreferences()
    await this.updatePreferences({
      notifications: { ...current.notifications, ...notifications }
    })
  }

  async updateDefaultViews(views: Partial<UserPreferences['defaultViews']>): Promise<void> {
    const current = await this.getPreferences()
    await this.updatePreferences({
      defaultViews: { ...current.defaultViews, ...views }
    })
  }
}

export default new UserPreferencesService()