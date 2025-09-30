import React, { useState } from 'react'
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

interface HemetProject {
  id: string
  name: string
  client: string
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
  startDate: string
  endDate?: string
  budget: number
  spent: number
  team: string[]
  progress: number
  description: string
}

interface HemetMetric {
  id: string
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change: number
}

const mockProjects: HemetProject[] = [
  {
    id: '1',
    name: 'Implementação Sistema de Gestão',
    client: 'Clínica São Paulo',
    status: 'in_progress',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    budget: 150000,
    spent: 75000,
    team: ['João Silva', 'Maria Santos', 'Pedro Costa'],
    progress: 65,
    description: 'Implementação completa do sistema de gestão hospitalar com módulos de agendamento, prontuário eletrônico e faturamento.'
  },
  {
    id: '2',
    name: 'Consultoria Estratégica',
    client: 'Hospital Central',
    status: 'planning',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    budget: 200000,
    spent: 0,
    team: ['Ana Lima', 'Carlos Ferreira'],
    progress: 10,
    description: 'Consultoria para reestruturação dos processos internos e otimização de recursos.'
  },
  {
    id: '3',
    name: 'Treinamento Equipe Médica',
    client: 'Clínica Especializada',
    status: 'completed',
    startDate: '2023-11-01',
    endDate: '2023-12-15',
    budget: 80000,
    spent: 78000,
    team: ['Lucia Oliveira', 'Roberto Silva'],
    progress: 100,
    description: 'Programa de treinamento para equipe médica em novas tecnologias e protocolos.'
  }
]

const mockMetrics: HemetMetric[] = [
  {
    id: '1',
    name: 'Projetos Ativos',
    value: 8,
    unit: 'projetos',
    trend: 'up',
    change: 2
  },
  {
    id: '2',
    name: 'Receita Mensal',
    value: 450000,
    unit: 'R$',
    trend: 'up',
    change: 15.5
  },
  {
    id: '3',
    name: 'Clientes Ativos',
    value: 25,
    unit: 'clientes',
    trend: 'stable',
    change: 0
  },
  {
    id: '4',
    name: 'Taxa de Conclusão',
    value: 92,
    unit: '%',
    trend: 'up',
    change: 5.2
  }
]

const statusLabels = {
  planning: 'Planejamento',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  on_hold: 'Pausado'
}

const statusColors = {
  planning: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  on_hold: 'bg-gray-100 text-gray-800'
}

export const HeMet: React.FC = () => {
  const permissions = usePermissions()
  const [projects] = useState<HemetProject[]>(mockProjects)
  const [metrics] = useState<HemetMetric[]>(mockMetrics)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<HemetProject | null>(null)

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="text-green-500" size={16} />
      case 'down':
        return <TrendingUp className="text-red-500 rotate-180" size={16} />
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />
    }
  }

  const handleViewProject = (project: HemetProject) => {
    setSelectedProject(project)
  }

  if (!permissions.hasPermission('activities.business.view')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acesso negado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Você não tem permissão para acessar esta seção.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HeMet</h1>
        <p className="text-gray-600">Gestão de projetos e métricas de negócios em saúde</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.unit === 'R$' ? formatCurrency(metric.value) : `${metric.value}${metric.unit !== 'projetos' && metric.unit !== 'clientes' ? metric.unit : ''}`}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros e Ações */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="planning">Planejamento</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluído</option>
            <option value="on_hold">Pausado</option>
          </select>
        </div>
        {permissions.hasPermission('activities.business.create') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus size={20} />
            <span>Novo Projeto</span>
          </button>
        )}
      </div>

      {/* Lista de Projetos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projeto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progresso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orçamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipe
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(project.startDate).toLocaleDateString('pt-BR')} - {project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'Em aberto'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.client}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                    {statusLabels[project.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatCurrency(project.budget)}</div>
                  <div className="text-sm text-gray-500">Gasto: {formatCurrency(project.spent)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{project.team.length}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleViewProject(project)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye size={16} />
                    </button>
                    {permissions.hasPermission('activities.business.update') && (
                      <button className="text-green-600 hover:text-green-900">
                        <Edit size={16} />
                      </button>
                    )}
                    {permissions.hasPermission('activities.business.delete') && (
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de visualização de projeto */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">{selectedProject.name}</h2>
                <p className="text-gray-600">{selectedProject.client}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-700">{selectedProject.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedProject.status]}`}>
                    {statusLabels[selectedProject.status]}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Progresso</h3>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${selectedProject.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{selectedProject.progress}%</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Orçamento</h3>
                  <p className="text-gray-700">{formatCurrency(selectedProject.budget)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Gasto</h3>
                  <p className="text-gray-700">{formatCurrency(selectedProject.spent)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Equipe</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.team.map((member, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {member}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Data de Início</h3>
                  <p className="text-gray-700">{new Date(selectedProject.startDate).toLocaleDateString('pt-BR')}</p>
                </div>
                {selectedProject.endDate && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Data de Término</h3>
                    <p className="text-gray-700">{new Date(selectedProject.endDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}