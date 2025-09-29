import React, { useState } from 'react'
import { usePermissions } from '../hooks/usePermissions'
import { Loading } from '../components/UI/Loading'

interface FeedItem {
  id: string
  type: 'task' | 'notification' | 'activity' | 'announcement'
  title: string
  description: string
  author: string
  timestamp: Date
  priority?: 'low' | 'medium' | 'high'
  department?: string
}

const mockFeedItems: FeedItem[] = [
  {
    id: '1',
    type: 'task',
    title: 'Nova tarefa atribuída',
    description: 'Revisar documentos do cliente PJ - Empresa ABC Ltda',
    author: 'João Silva',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    priority: 'high',
    department: 'Comercial'
  },
  {
    id: '2',
    type: 'notification',
    title: 'Documento aprovado',
    description: 'Contrato de prestação de serviços foi aprovado pela diretoria',
    author: 'Sistema',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
    department: 'Operacional'
  },
  {
    id: '3',
    type: 'activity',
    title: 'Reunião agendada',
    description: 'Reunião de alinhamento comercial - Quinta-feira 14:00',
    author: 'Maria Santos',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
    department: 'Comercial'
  },
  {
    id: '4',
    type: 'announcement',
    title: 'Nova funcionalidade',
    description: 'Sistema de emissão de NF foi atualizado com novas validações',
    author: 'TI',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
    department: 'Operacional'
  }
]

const Feed: React.FC = () => {
  const { canViewFeed } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')

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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
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

  const filteredItems = filter === 'all' 
    ? mockFeedItems 
    : mockFeedItems.filter(item => item.type === filter)

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
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('task')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'task'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tarefas
          </button>
          <button
            onClick={() => setFilter('notification')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'notification'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Notificações
          </button>
          <button
            onClick={() => setFilter('activity')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'activity'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Atividades
          </button>
          <button
            onClick={() => setFilter('announcement')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'announcement'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Comunicados
          </button>
        </div>
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Nenhum item encontrado para o filtro selecionado.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow border-l-4 ${getPriorityColor(item.priority)} p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                    {item.type === 'task' && 'Tarefa'}
                    {item.type === 'notification' && 'Notificação'}
                    {item.type === 'activity' && 'Atividade'}
                    {item.type === 'announcement' && 'Comunicado'}
                  </span>
                  {item.department && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {item.department}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {formatTimestamp(item.timestamp)}
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
                  Por: {item.author}
                </span>
                {item.priority && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.priority === 'high' ? 'bg-red-100 text-red-800' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
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
    </div>
  )
}

export default Feed