import React, { useState, useEffect } from 'react'
import { Settings, Plus, LayoutGrid, RefreshCw, X, Grid3X3, Palette, Monitor, Save } from 'lucide-react'
import { AVAILABLE_WIDGETS, WidgetConfig } from './widgets'
import { useAuth } from '../../contexts/AuthContext'

interface DashboardWidget {
  id: string
  widgetId: string
  title: string
  position: { x: number; y: number }
  size: 'pequeno' | 'medio' | 'grande' | 'completo'
  type: string
  settings?: Record<string, any>
}

interface DashboardSettings {
  layout: 'grid' | 'masonry' | 'list'
  columns: 2 | 3 | 4 | 6
  spacing: 'compact' | 'normal' | 'relaxed'
  theme: 'light' | 'dark' | 'auto'
  showTitles: boolean
  autoRefresh: boolean
  refreshInterval: number
}

interface MainDashboardProps {
  userId?: string
  userRole?: string
  className?: string
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  userId = 'user-1',
  userRole = 'analista',
  className = ''
}) => {
  const { user, hasPermission } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showDashboardSettings, setShowDashboardSettings] = useState(false)
  const [showWidgetSettings, setShowWidgetSettings] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null)
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>({
    layout: 'grid',
    columns: 3,
    spacing: 'normal',
    theme: 'light',
    showTitles: true,
    autoRefresh: false,
    refreshInterval: 30
  })

  // Filtrar widgets baseado nas permissões REAIS do usuário
  const availableWidgets = AVAILABLE_WIDGETS.filter(widget => {
    if (!widget.permissions || widget.permissions.length === 0) return true
    
    // Super admin tem acesso a tudo
    if (user?.role === 'super_admin' || user?.permissions?.includes('*')) {
      return true
    }
    
    return widget.permissions.some(permission => {
      if (permission.endsWith('*')) {
        const basePermission = permission.slice(0, -1)
        return user?.permissions?.some(userPerm => userPerm.startsWith(basePermission)) || false
      }
      return hasPermission(permission)
    })
  })

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true)
      try {
        // Simular carregamento
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Carregar configurações do dashboard
        const savedSettings = localStorage.getItem(`dashboard-settings-${userId}`)
        if (savedSettings) {
          setDashboardSettings(JSON.parse(savedSettings))
        }
        
        // Carregar widgets salvos ou usar padrão
        const savedWidgets = localStorage.getItem(`dashboard-widgets-${userId}`)
        if (savedWidgets) {
          setWidgets(JSON.parse(savedWidgets))
        } else {
          // Widgets padrão
          const defaultWidgets: DashboardWidget[] = [
            {
              id: 'w1',
              widgetId: 'quick-stats',
              title: 'Estatísticas Rápidas',
              position: { x: 0, y: 0 },
              size: 'grande',
              type: 'estatisticas'
            },
            {
              id: 'w2',
              widgetId: 'tasks',
              title: 'Minhas Tarefas',
              position: { x: 1, y: 0 },
              size: 'medio',
              type: 'tarefas'
            },
            {
              id: 'w3',
              widgetId: 'notifications',
              title: 'Notificações',
              position: { x: 2, y: 0 },
              size: 'pequeno',
              type: 'notificacoes'
            }
          ]
          setWidgets(defaultWidgets)
          localStorage.setItem(`dashboard-widgets-${userId}`, JSON.stringify(defaultWidgets))
        }
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [userId])

  const addWidget = (widgetId: string) => {
    const widgetConfig = availableWidgets.find(w => w.id === widgetId)
    if (!widgetConfig) return

    const newWidget: DashboardWidget = {
      id: `w${Date.now()}`,
      widgetId,
      title: widgetConfig.title,
      position: { x: widgets.length % 3, y: Math.floor(widgets.length / 3) },
      size: widgetConfig.defaultSize,
      type: widgetConfig.type
    }

    const updatedWidgets = [...widgets, newWidget]
    setWidgets(updatedWidgets)
    localStorage.setItem(`dashboard-widgets-${userId}`, JSON.stringify(updatedWidgets))
    setShowAddWidget(false)
  }

  const removeWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId)
    setWidgets(updatedWidgets)
    localStorage.setItem(`dashboard-widgets-${userId}`, JSON.stringify(updatedWidgets))
  }

  const refreshAllWidgets = async () => {
    setRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Em produção, disparar refresh em todos os widgets
    } finally {
      setRefreshing(false)
    }
  }

  const saveDashboardSettings = (newSettings: DashboardSettings) => {
    setDashboardSettings(newSettings)
    localStorage.setItem(`dashboard-settings-${userId}`, JSON.stringify(newSettings))
  }

  const openWidgetSettings = (widget: DashboardWidget) => {
    setSelectedWidget(widget)
    setShowWidgetSettings(true)
  }

  const saveWidgetSettings = (widgetId: string, settings: Record<string, any>) => {
    const updatedWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, settings } : w
    )
    setWidgets(updatedWidgets)
    localStorage.setItem(`dashboard-widgets-${userId}`, JSON.stringify(updatedWidgets))
    setShowWidgetSettings(false)
    setSelectedWidget(null)
  }

  const updateWidgetSize = (widgetId: string, size: DashboardWidget['size']) => {
    const updatedWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, size } : w
    )
    setWidgets(updatedWidgets)
    localStorage.setItem(`dashboard-widgets-${userId}`, JSON.stringify(updatedWidgets))
  }

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'pequeno': return 'col-span-1'
      case 'medio': return 'col-span-2'
      case 'grande': return 'col-span-3'
      case 'completo': return 'col-span-full'
      default: return 'col-span-1'
    }
  }

  const getGridClasses = () => {
    const baseClasses = 'grid gap-6'
    const columnClasses = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'
    }
    const spacingClasses = {
      compact: 'gap-3',
      normal: 'gap-6',
      relaxed: 'gap-8'
    }
    
    return `${baseClasses} ${columnClasses[dashboardSettings.columns]} ${spacingClasses[dashboardSettings.spacing]}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Carregando dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral da plataforma MedStaff</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowAddWidget(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Widget</span>
          </button>

          <button 
            onClick={refreshAllWidgets}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={() => setShowDashboardSettings(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid de Widgets */}
      {widgets.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <LayoutGrid className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum widget configurado
          </h3>
          <p className="text-gray-600 mb-6">
            Adicione widgets para personalizar seu dashboard
          </p>
          <button
            onClick={() => setShowAddWidget(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Widget
          </button>
        </div>
      ) : (
        <div className={getGridClasses()}>
          {widgets.map(widget => {
            const widgetConfig = availableWidgets.find(w => w.id === widget.widgetId)
            if (!widgetConfig) return null

            const WidgetComponent = widgetConfig.component
            return (
              <div 
                key={widget.id} 
                className={`bg-white rounded-lg shadow-sm border p-6 ${getSizeClasses(widget.size)}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
                  <div className="flex items-center space-x-2">
                    {widgetConfig.refreshable && (
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                    {widgetConfig.configurable && (
                      <button 
                        onClick={() => openWidgetSettings(widget)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => removeWidget(widget.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <WidgetComponent />
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Adicionar Widget */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Adicionar Widget</h3>
              <button
                onClick={() => setShowAddWidget(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableWidgets.map(widget => (
                <div
                  key={widget.id}
                  className="border rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => addWidget(widget.id)}
                >
                  <h4 className="font-medium text-gray-900">{widget.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{widget.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {widget.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {widget.defaultSize}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Configurações do Dashboard */}
      {showDashboardSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Configurações do Dashboard</h3>
              <button
                onClick={() => setShowDashboardSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Layout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Grid3X3 className="w-4 h-4 inline mr-2" />
                  Layout
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['grid', 'masonry', 'list'] as const).map(layout => (
                    <button
                      key={layout}
                      onClick={() => saveDashboardSettings({ ...dashboardSettings, layout })}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        dashboardSettings.layout === layout
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {layout === 'grid' ? 'Grade' : layout === 'masonry' ? 'Mosaico' : 'Lista'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colunas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Número de Colunas
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {([2, 3, 4, 6] as const).map(columns => (
                    <button
                      key={columns}
                      onClick={() => saveDashboardSettings({ ...dashboardSettings, columns })}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        dashboardSettings.columns === columns
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {columns}
                    </button>
                  ))}
                </div>
              </div>

              {/* Espaçamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Espaçamento
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['compact', 'normal', 'relaxed'] as const).map(spacing => (
                    <button
                      key={spacing}
                      onClick={() => saveDashboardSettings({ ...dashboardSettings, spacing })}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        dashboardSettings.spacing === spacing
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {spacing === 'compact' ? 'Compacto' : spacing === 'normal' ? 'Normal' : 'Relaxado'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tema */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Palette className="w-4 h-4 inline mr-2" />
                  Tema
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'auto'] as const).map(theme => (
                    <button
                      key={theme}
                      onClick={() => saveDashboardSettings({ ...dashboardSettings, theme })}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        dashboardSettings.theme === theme
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Automático'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opções */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Mostrar títulos dos widgets
                  </label>
                  <button
                    onClick={() => saveDashboardSettings({ ...dashboardSettings, showTitles: !dashboardSettings.showTitles })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      dashboardSettings.showTitles ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        dashboardSettings.showTitles ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Atualização automática
                  </label>
                  <button
                    onClick={() => saveDashboardSettings({ ...dashboardSettings, autoRefresh: !dashboardSettings.autoRefresh })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      dashboardSettings.autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        dashboardSettings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {dashboardSettings.autoRefresh && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intervalo de atualização (segundos)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={dashboardSettings.refreshInterval}
                      onChange={(e) => saveDashboardSettings({ 
                        ...dashboardSettings, 
                        refreshInterval: parseInt(e.target.value) || 30 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Configurações do Widget */}
      {showWidgetSettings && selectedWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                Configurações - {selectedWidget.title}
              </h3>
              <button
                onClick={() => setShowWidgetSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Tamanho do Widget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Monitor className="w-4 h-4 inline mr-2" />
                  Tamanho do Widget
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['pequeno', 'medio', 'grande', 'completo'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => updateWidgetSize(selectedWidget.id, size)}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        selectedWidget.size === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Configurações específicas do widget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Configurações Específicas
                </label>
                <div className="space-y-4">
                  {selectedWidget.type === 'estatisticas' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Mostrar valores em tempo real
                        </label>
                        <button
                          onClick={() => {
                            const newSettings = { 
                              ...selectedWidget.settings, 
                              realTime: !selectedWidget.settings?.realTime 
                            };
                            saveWidgetSettings(selectedWidget.id, newSettings);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            selectedWidget.settings?.realTime ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              selectedWidget.settings?.realTime ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Mostrar gráficos de tendência
                        </label>
                        <button
                          onClick={() => {
                            const newSettings = { 
                              ...selectedWidget.settings, 
                              showTrends: !selectedWidget.settings?.showTrends 
                            };
                            saveWidgetSettings(selectedWidget.id, newSettings);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            selectedWidget.settings?.showTrends ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              selectedWidget.settings?.showTrends ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Período de análise
                        </label>
                        <select
                          value={selectedWidget.settings?.period || '7d'}
                          onChange={(e) => {
                            const newSettings = { 
                              ...selectedWidget.settings, 
                              period: e.target.value 
                            };
                            saveWidgetSettings(selectedWidget.id, newSettings);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="1d">Último dia</option>
                          <option value="7d">Últimos 7 dias</option>
                          <option value="30d">Últimos 30 dias</option>
                          <option value="90d">Últimos 90 dias</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedWidget.type === 'tarefas' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Filtrar por status
                        </label>
                        <select
                          value={selectedWidget.settings?.statusFilter || 'in_progress'}
                          onChange={(e) => {
                            const newSettings = { 
                              ...selectedWidget.settings, 
                              statusFilter: e.target.value 
                            };
                            saveWidgetSettings(selectedWidget.id, newSettings);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">Todas as tarefas</option>
                          <option value="todo">A fazer</option>
                          <option value="in_progress">Em progresso</option>
                          <option value="in_review">Em revisão</option>
                          <option value="done">Concluídas</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Limite de tarefas exibidas
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={selectedWidget.settings?.limit || 5}
                          onChange={(e) => {
                            const newSettings = { 
                              ...selectedWidget.settings, 
                              limit: parseInt(e.target.value) || 5 
                            };
                            saveWidgetSettings(selectedWidget.id, newSettings);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Mostrar apenas minhas tarefas
                        </label>
                        <button
                          onClick={() => {
                            const newSettings = { 
                              ...selectedWidget.settings, 
                              onlyMyTasks: !selectedWidget.settings?.onlyMyTasks 
                            };
                            saveWidgetSettings(selectedWidget.id, newSettings);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            selectedWidget.settings?.onlyMyTasks ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              selectedWidget.settings?.onlyMyTasks ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Mostrar progresso visual
                        </label>
                        <button
                          onClick={() => {
                            const newSettings = { 
                              ...selectedWidget.settings, 
                              showProgress: !selectedWidget.settings?.showProgress 
                            };
                            saveWidgetSettings(selectedWidget.id, newSettings);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            selectedWidget.settings?.showProgress ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              selectedWidget.settings?.showProgress ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}

                  {!['estatisticas', 'tarefas'].includes(selectedWidget.type) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        Configurações específicas para este tipo de widget ({selectedWidget.type}) serão implementadas em breve.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowWidgetSettings(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => saveWidgetSettings(selectedWidget.id, selectedWidget.settings || {})}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de desenvolvimento */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Settings className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Dashboard Funcional
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Agora você pode adicionar, remover e organizar widgets. 
                Clique em "Adicionar Widget" para começar a personalizar seu dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainDashboard