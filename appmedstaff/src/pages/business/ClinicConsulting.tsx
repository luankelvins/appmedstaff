import React, { useState } from 'react'
import { Building2, MapPin, Calendar, DollarSign, Users, FileText, Search, Filter, Plus, Eye, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

interface ClinicProject {
  id: string
  clientName: string
  clinicName: string
  specialty: string
  location: string
  status: 'initial_consultation' | 'planning' | 'documentation' | 'licensing' | 'construction' | 'equipment' | 'opening' | 'completed'
  startDate: string
  expectedOpening?: string
  budget: number
  currentPhase: string
  progress: number
  consultant: string
  documents: Document[]
  milestones: Milestone[]
}

interface Document {
  id: string
  name: string
  type: 'license' | 'permit' | 'contract' | 'plan' | 'other'
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  uploadDate?: string
}

interface Milestone {
  id: string
  name: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  description: string
}

const mockProjects: ClinicProject[] = [
  {
    id: '1',
    clientName: 'Dr. Ana Silva',
    clinicName: 'Clínica Cardiológica Silva',
    specialty: 'Cardiologia',
    location: 'São Paulo, SP',
    status: 'planning',
    startDate: '2024-01-15',
    expectedOpening: '2024-06-15',
    budget: 500000,
    currentPhase: 'Elaboração do projeto arquitetônico',
    progress: 35,
    consultant: 'João Consultor',
    documents: [
      { id: '1', name: 'Alvará de Funcionamento', type: 'license', status: 'pending' },
      { id: '2', name: 'Projeto Arquitetônico', type: 'plan', status: 'submitted', uploadDate: '2024-01-20' }
    ],
    milestones: [
      { id: '1', name: 'Aprovação do projeto', dueDate: '2024-02-15', status: 'completed', description: 'Projeto aprovado pela prefeitura' },
      { id: '2', name: 'Início da construção', dueDate: '2024-03-01', status: 'in_progress', description: 'Início das obras de construção' }
    ]
  },
  {
    id: '2',
    clientName: 'Dr. Carlos Mendes',
    clinicName: 'Centro Médico Mendes',
    specialty: 'Clínica Geral',
    location: 'Rio de Janeiro, RJ',
    status: 'documentation',
    startDate: '2024-02-01',
    expectedOpening: '2024-08-01',
    budget: 750000,
    currentPhase: 'Documentação e licenciamento',
    progress: 20,
    consultant: 'Maria Consultora',
    documents: [
      { id: '3', name: 'Licença Sanitária', type: 'license', status: 'submitted', uploadDate: '2024-02-05' },
      { id: '4', name: 'Contrato de Locação', type: 'contract', status: 'approved', uploadDate: '2024-01-30' }
    ],
    milestones: [
      { id: '3', name: 'Definição do local', dueDate: '2024-02-10', status: 'completed', description: 'Local definido e contrato assinado' },
      { id: '4', name: 'Obtenção de licenças', dueDate: '2024-03-15', status: 'in_progress', description: 'Processo de licenciamento em andamento' }
    ]
  }
]

const statusLabels = {
  initial_consultation: 'Consulta Inicial',
  planning: 'Planejamento',
  documentation: 'Documentação',
  licensing: 'Licenciamento',
  construction: 'Construção',
  equipment: 'Equipamentos',
  opening: 'Abertura',
  completed: 'Concluído'
}

const statusColors = {
  initial_consultation: 'bg-blue-100 text-blue-800',
  planning: 'bg-yellow-100 text-yellow-800',
  documentation: 'bg-orange-100 text-orange-800',
  licensing: 'bg-purple-100 text-purple-800',
  construction: 'bg-indigo-100 text-indigo-800',
  equipment: 'bg-pink-100 text-pink-800',
  opening: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800'
}

const documentStatusLabels = {
  pending: 'Pendente',
  submitted: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Rejeitado'
}

const documentStatusColors = {
  pending: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

const milestoneStatusLabels = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  delayed: 'Atrasado'
}

const milestoneStatusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  delayed: 'bg-red-100 text-red-800'
}

export const ClinicConsulting: React.FC = () => {
  const permissions = usePermissions()
  const [projects] = useState<ClinicProject[]>(mockProjects)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<ClinicProject | null>(null)

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleViewProject = (project: ClinicProject) => {
    setSelectedProject(project)
  }

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />
      case 'in_progress':
        return <Clock className="text-blue-500" size={16} />
      case 'delayed':
        return <AlertCircle className="text-red-500" size={16} />
      default:
        return <Clock className="text-gray-400" size={16} />
    }
  }

  if (!permissions.hasPermission('activities.business.view')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
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
        <h1 className="text-2xl font-bold text-gray-900">Consultoria Abertura de Clínicas</h1>
        <p className="text-gray-600">Gestão de projetos de abertura e estruturação de clínicas médicas</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Projetos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status !== 'completed').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concluídos</p>
              <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'completed').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Investimento Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(projects.reduce((sum, p) => sum + p.budget, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>
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
            <option value="initial_consultation">Consulta Inicial</option>
            <option value="planning">Planejamento</option>
            <option value="documentation">Documentação</option>
            <option value="licensing">Licenciamento</option>
            <option value="construction">Construção</option>
            <option value="equipment">Equipamentos</option>
            <option value="opening">Abertura</option>
            <option value="completed">Concluído</option>
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
                Consultor
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
                    <div className="text-sm font-medium text-gray-900">{project.clinicName}</div>
                    <div className="text-sm text-gray-500">{project.specialty}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MapPin size={12} className="mr-1" />
                      {project.location}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                    {statusLabels[project.status]}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{project.currentPhase}</div>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(project.budget)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.consultant}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selectedProject.clinicName}</h2>
                <p className="text-gray-600">{selectedProject.clientName} - {selectedProject.specialty}</p>
                <p className="text-gray-500 flex items-center mt-1">
                  <MapPin size={14} className="mr-1" />
                  {selectedProject.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações Gerais */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Informações do Projeto</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedProject.status]}`}>
                        {statusLabels[selectedProject.status]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fase Atual:</span>
                      <span className="text-gray-900">{selectedProject.currentPhase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Progresso:</span>
                      <span className="text-gray-900">{selectedProject.progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Orçamento:</span>
                      <span className="text-gray-900">{formatCurrency(selectedProject.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultor:</span>
                      <span className="text-gray-900">{selectedProject.consultant}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Início:</span>
                      <span className="text-gray-900">{new Date(selectedProject.startDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {selectedProject.expectedOpening && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Abertura Prevista:</span>
                        <span className="text-gray-900">{new Date(selectedProject.expectedOpening).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documentos */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Documentos</h3>
                  <div className="space-y-2">
                    {selectedProject.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <FileText size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{doc.name}</span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${documentStatusColors[doc.status]}`}>
                          {documentStatusLabels[doc.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Marcos e Timeline */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Marcos do Projeto</h3>
                <div className="space-y-3">
                  {selectedProject.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getMilestoneIcon(milestone.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{milestone.name}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${milestoneStatusColors[milestone.status]}`}>
                            {milestoneStatusLabels[milestone.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Prazo: {new Date(milestone.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}