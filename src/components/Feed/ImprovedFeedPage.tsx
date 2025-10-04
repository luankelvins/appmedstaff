import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Megaphone, Activity, Filter, Search, 
  Bell, Settings, Grid, List, ChevronDown, Users, Tag,
  Clock, MapPin, Eye, MessageSquare, Heart, Share2
} from 'lucide-react';
import ImprovedActivityForm from './ImprovedActivityForm';
import ImprovedAnnouncementForm from './ImprovedAnnouncementForm';
import ImprovedEventForm from './ImprovedEventForm';
import { ActivityFormData, AnnouncementFormData, EventFormData, FeedItem, Priority } from '../../types/feed';

interface ImprovedFeedPageProps {
  // Props opcionais para integração com sistema existente
  onActivityCreate?: (data: ActivityFormData) => Promise<void>;
  onAnnouncementCreate?: (data: AnnouncementFormData) => Promise<void>;
  onEventCreate?: (data: EventFormData) => Promise<void>;
  feedItems?: FeedItem[];
}

const ImprovedFeedPage: React.FC<ImprovedFeedPageProps> = ({
  onActivityCreate,
  onAnnouncementCreate,
  onEventCreate,
  feedItems = []
}) => {
  const [activeForm, setActiveForm] = useState<'activity' | 'announcement' | 'event' | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'activity' | 'announcement' | 'event'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data para demonstração
  const [mockFeedItems, setMockFeedItems] = useState<FeedItem[]>([
    {
      id: '1',
      title: 'Reunião de Planejamento Q4',
      description: 'Discussão sobre metas e objetivos para o último trimestre do ano.',
      type: 'event',
      priority: 'high',
      author: 'user1',
      authorName: 'Ana Silva',
      authorAvatar: '',
      department: 'Gestão',
      tags: ['planejamento', 'metas', 'Q4'],
      isPublic: true,
      createdAt: new Date('2024-01-15T10:00:00'),
      updatedAt: new Date('2024-01-15T10:00:00'),
      createdBy: 'user1',
      updatedBy: 'user1'
    },
    {
      id: '2',
      title: 'Nova Política de Home Office',
      description: 'Comunicado sobre as novas diretrizes para trabalho remoto, incluindo horários flexíveis e ferramentas aprovadas.',
      type: 'announcement',
      priority: 'medium',
      author: 'user2',
      authorName: 'Carlos Santos',
      authorAvatar: '',
      department: 'RH',
      tags: ['política', 'home-office', 'trabalho-remoto'],
      isPublic: true,
      createdAt: new Date('2024-01-14T14:30:00'),
      updatedAt: new Date('2024-01-14T14:30:00'),
      createdBy: 'user2',
      updatedBy: 'user2'
    },
    {
      id: '3',
      title: 'Workshop de Desenvolvimento Pessoal',
      description: 'Atividade focada em técnicas de produtividade e gestão do tempo para toda a equipe.',
      type: 'activity',
      priority: 'low',
      author: 'user3',
      authorName: 'Maria Oliveira',
      authorAvatar: '',
      department: 'Desenvolvimento',
      tags: ['workshop', 'desenvolvimento', 'produtividade'],
      isPublic: true,
      createdAt: new Date('2024-01-13T09:15:00'),
      updatedAt: new Date('2024-01-13T09:15:00'),
      createdBy: 'user3',
      updatedBy: 'user3'
    }
  ]);

  const handleActivitySubmit = async (data: ActivityFormData) => {
    try {
      if (onActivityCreate) {
        await onActivityCreate(data);
      } else {
        // Mock implementation
        const newItem: FeedItem = {
          id: Date.now().toString(),
          title: data.title,
          description: data.description,
          type: 'activity',
          priority: data.priority,
          author: 'current-user',
          authorName: 'Usuário Atual',
          authorAvatar: '',
          department: 'Geral',
          tags: data.tags || [],
          isPublic: data.isPublic,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'current-user',
          updatedBy: 'current-user'
        };
        setMockFeedItems(prev => [newItem, ...prev]);
      }
      setActiveForm(null);
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
    }
  };

  const handleAnnouncementSubmit = async (data: AnnouncementFormData) => {
    try {
      if (onAnnouncementCreate) {
        await onAnnouncementCreate(data);
      } else {
        // Mock implementation
        const newItem: FeedItem = {
          id: Date.now().toString(),
          title: data.title,
          description: data.description,
          type: 'announcement',
          priority: data.priority,
          author: 'current-user',
          authorName: 'Usuário Atual',
          authorAvatar: '',
          department: 'Geral',
          tags: data.tags || [],
          isPublic: data.isPublic,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'current-user',
          updatedBy: 'current-user'
        };
        setMockFeedItems(prev => [newItem, ...prev]);
      }
      setActiveForm(null);
    } catch (error) {
      console.error('Erro ao criar comunicado:', error);
    }
  };

  const handleEventSubmit = async (data: EventFormData) => {
    try {
      if (onEventCreate) {
        await onEventCreate(data);
      } else {
        // Mock implementation
        const newItem: FeedItem = {
          id: Date.now().toString(),
          title: data.title,
          description: data.description,
          type: 'event',
          priority: data.priority,
          author: 'current-user',
          authorName: 'Usuário Atual',
          authorAvatar: '',
          department: 'Geral',
          tags: data.tags || [],
          isPublic: data.isPublic,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'current-user',
          updatedBy: 'current-user'
        };
        setMockFeedItems(prev => [newItem, ...prev]);
      }
      setActiveForm(null);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
    }
  };

  const filteredItems = (feedItems.length > 0 ? feedItems : mockFeedItems).filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedFilter === 'all' || item.type === selectedFilter;
    const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity': return <Activity className="h-5 w-5" />;
      case 'announcement': return <Megaphone className="h-5 w-5" />;
      case 'event': return <Calendar className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'activity': return 'bg-green-100 text-green-800 border-green-200';
      case 'announcement': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'event': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else if (diffInHours < 48) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {filteredItems.length} itens
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Botões de criação */}
              <div className="relative">
                <button
                  onClick={() => setActiveForm('activity')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Nova Atividade
                </button>
              </div>

              <button
                onClick={() => setActiveForm('announcement')}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Megaphone className="h-4 w-4 mr-2" />
                Novo Comunicado
              </button>

              <button
                onClick={() => setActiveForm('event')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Novo Evento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar no feed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Tipo:</label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="activity">Atividades</option>
                  <option value="announcement">Comunicados</option>
                  <option value="event">Eventos</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Prioridade:</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas</option>
                  <option value="urgent">Urgente</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>

              {/* Toggle de visualização */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Items */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }`}>
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <Activity className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item encontrado</h3>
              <p className="text-gray-600">
                {searchTerm || selectedFilter !== 'all' || selectedPriority !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando uma nova atividade, comunicado ou evento'
                }
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header do item */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(item.type)}`}>
                            {item.type === 'activity' && 'Atividade'}
                            {item.type === 'announcement' && 'Comunicado'}
                            {item.type === 'event' && 'Evento'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                            {item.priority === 'urgent' && '🔴 Urgente'}
                            {item.priority === 'high' && '🟠 Alta'}
                            {item.priority === 'medium' && '🟡 Média'}
                            {item.priority === 'low' && '🟢 Baixa'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          por {item.authorName} • {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-gray-600 hover:text-red-600 transition-colors">
                        <Heart className="h-4 w-4 mr-1" />
                        <span className="text-sm">Curtir</span>
                      </button>
                      <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span className="text-sm">Comentar</span>
                      </button>
                      <button className="flex items-center text-gray-600 hover:text-green-600 transition-colors">
                        <Share2 className="h-4 w-4 mr-1" />
                        <span className="text-sm">Compartilhar</span>
                      </button>
                    </div>
                    
                    {item.isPublic && (
                      <div className="flex items-center text-gray-500">
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="text-xs">Público</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Formulários */}
      <ImprovedActivityForm
        isOpen={activeForm === 'activity'}
        onClose={() => setActiveForm(null)}
        onSubmit={handleActivitySubmit}
        isEditing={false}
      />

      <ImprovedAnnouncementForm
        isOpen={activeForm === 'announcement'}
        onClose={() => setActiveForm(null)}
        onSubmit={handleAnnouncementSubmit}
        isEditing={false}
      />

      <ImprovedEventForm
        isOpen={activeForm === 'event'}
        onClose={() => setActiveForm(null)}
        onSubmit={handleEventSubmit}
        isEditing={false}
      />
    </div>
  );
};

export default ImprovedFeedPage;