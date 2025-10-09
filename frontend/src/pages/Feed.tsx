import React, { useState, useEffect } from 'react'
import { Plus, Calendar as CalendarIcon, List, Settings } from 'lucide-react'
import { usePermissions } from '../hooks/usePermissions'
import { Loading } from '../components/UI/Loading'
import { Calendar } from '../components/Calendar'
import { ActivityForm, AnnouncementForm, EventForm } from '../components/Feed'
import { feedService } from '../utils/feedService'
import { 
  FeedItem, 
  Activity, 
  Announcement, 
  CalendarEvent,
  FeedFilter,
  ActivityFormData,
  AnnouncementFormData,
  EventFormData
} from '../types/feed'

type ViewMode = 'feed' | 'calendar'
type FormMode = 'activity' | 'announcement' | 'event' | null

const Feed: React.FC = () => {
  const { canViewFeed } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('feed')
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [filter, setFilter] = useState<FeedFilter>({
    types: [],
    priorities: [],
    departments: [],
    showExpired: false,
    onlyMyItems: false
  })
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all')

  useEffect(() => {
    loadFeedData()
  }, [filter])

  const loadFeedData = async () => {
    setLoading(true)
    try {
      // TODO: Substituir por ID do usuário atual do contexto de autenticação
      const currentUserId = 'current-user-id'
      
      const items = await feedService.getFeedItems(filter, currentUserId)
      setFeedItems(items)
      
      // Carregar eventos para o calendário (incluindo atividades consolidadas)
      const events = items.filter(item => 
        item.type === 'event' || item.type === 'activity'
      ) as CalendarEvent[]
      setCalendarEvents(events)
    } catch (error) {
      console.error('Erro ao carregar feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateActivity = async (data: ActivityFormData) => {
    try {
      await feedService.createActivity(data, 'current-user-id') // TODO: pegar ID do usuário atual
      await loadFeedData()
      setFormMode(null)
    } catch (error) {
      console.error('Erro ao criar atividade:', error)
      throw error
    }
  }

  const handleCreateAnnouncement = async (data: AnnouncementFormData) => {
    try {
      await feedService.createAnnouncement(data, 'current-user-id') // TODO: pegar ID do usuário atual
      await loadFeedData()
      setFormMode(null)
    } catch (error) {
      console.error('Erro ao criar comunicado:', error)
      throw error
    }
  }

  const handleCreateEvent = async (data: EventFormData) => {
    try {
      await feedService.createEvent(data, 'current-user-id') // TODO: pegar ID do usuário atual
      await loadFeedData()
      setFormMode(null)
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      throw error
    }
  }

  if (!canViewFeed()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acesso Negado
          </h3>
          <p className="text-gray-600">
            Você não tem permissão para visualizar o feed.
          </p>
        </div>
      </div>
    )
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} dia${days > 1 ? 's' : ''} atrás`
    } else if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`
    } else {
      return 'Agora mesmo'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-blue-100 text-blue-800'
      case 'notification':
        return 'bg-green-100 text-green-800'
      case 'activity':
        return 'bg-purple-100 text-purple-800'
      case 'announcement':
        return 'bg-yellow-100 text-yellow-800'
      case 'event':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-600'
      case 'high':
        return 'border-l-red-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-green-500'
      default:
        return 'border-l-gray-300'
    }
  }

  const filteredItems = activeTypeFilter === 'all' 
    ? feedItems 
    : activeTypeFilter === 'activity'
      ? feedItems.filter(item => item.type === 'activity' || item.type === 'event')
      : feedItems.filter(item => item.type === activeTypeFilter)

  if (loading) {
    return <Loading text="Carregando feed..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
          <p className="text-gray-600">
            Acompanhe as últimas atividades e atualizações da plataforma
          </p>
        </div>
        
        {/* Botões de ação */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setFormMode(formMode ? null : 'activity')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </button>
            
            {formMode && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <button
                    onClick={() => setFormMode('activity')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Nova Atividade
                  </button>
                  <button
                    onClick={() => setFormMode('announcement')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Novo Comunicado
                  </button>
                  <button
                    onClick={() => setFormMode('event')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Novo Evento
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Abas de visualização */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setViewMode('feed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'feed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <List className="h-4 w-4 inline mr-2" />
              Feed
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CalendarIcon className="h-4 w-4 inline mr-2" />
              Calendário
            </button>
          </nav>
        </div>

        {/* Conteúdo das abas */}
        <div className="p-6">
          {viewMode === 'feed' && (
            <>
              {/* Filtros */}
              <div className="mb-6">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTypeFilter('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTypeFilter === 'all'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setActiveTypeFilter('task')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTypeFilter === 'task'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tarefas
                  </button>
                  <button
                    onClick={() => setActiveTypeFilter('notification')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTypeFilter === 'notification'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Notificações
                  </button>
                  <button
                    onClick={() => setActiveTypeFilter('activity')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTypeFilter === 'activity'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Atividades & Eventos
                  </button>
                  <button
                    onClick={() => setActiveTypeFilter('announcement')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTypeFilter === 'announcement'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Comunicados
                  </button>
                  <button
                    onClick={() => setActiveTypeFilter('event')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTypeFilter === 'event'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Eventos
                  </button>
                </div>
              </div>

              {/* Feed Items */}
              <div className="space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum item encontrado para o filtro selecionado.</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-gray-50 rounded-lg border-l-4 ${getPriorityColor(item.priority)} p-6 hover:bg-gray-100 transition-colors`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                            {item.type === 'task' && 'Tarefa'}
                            {item.type === 'notification' && 'Notificação'}
                            {item.type === 'activity' && 'Atividade'}
                            {item.type === 'announcement' && 'Comunicado'}
                            {item.type === 'event' && 'Evento'}
                          </span>
                          {item.department && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                              {item.department}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(item.createdAt)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-3">
                        {item.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Por: {item.authorName}
                        </span>
                        {item.priority && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.priority === 'urgent' ? 'bg-red-200 text-red-900' :
                            item.priority === 'high' ? 'bg-red-100 text-red-800' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.priority === 'urgent' && 'Urgente'}
                            {item.priority === 'high' && 'Alta'}
                            {item.priority === 'medium' && 'Média'}
                            {item.priority === 'low' && 'Baixa'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {viewMode === 'calendar' && (
            <Calendar
              events={calendarEvents}
              onEventClick={(event) => console.log('Event clicked:', event)}
              onDateClick={(date) => console.log('Date clicked:', date)}
            />
          )}
        </div>
      </div>

      {/* Formulários */}
      <ActivityForm
        isOpen={formMode === 'activity'}
        onClose={() => setFormMode(null)}
        onSubmit={handleCreateActivity}
      />

      <AnnouncementForm
        isOpen={formMode === 'announcement'}
        onClose={() => setFormMode(null)}
        onSubmit={handleCreateAnnouncement}
      />

      <EventForm
        isOpen={formMode === 'event'}
        onClose={() => setFormMode(null)}
        onSubmit={handleCreateEvent}
      />
    </div>
  )
}

export default Feed