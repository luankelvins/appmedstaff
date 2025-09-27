import React, { useState } from 'react'
import { Users, MessageCircle, Star, Clock, Search, Filter, Send, Eye } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

interface Collaborator {
  id: string
  name: string
  email: string
  position: string
  department: string
  status: 'active' | 'inactive' | 'vacation'
  joinDate: string
  performance: number
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  type: 'PF' | 'PJ'
  status: 'active' | 'inactive' | 'prospect'
  lastContact: string
  satisfaction: number
}

interface SACTicket {
  id: string
  clientName: string
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  assignedTo?: string
  responses: SACResponse[]
}

interface SACResponse {
  id: string
  message: string
  author: string
  createdAt: string
  isInternal: boolean
}

const mockCollaborators: Collaborator[] = [
  {
    id: '1',
    name: 'Pedro Costa',
    email: 'pedro.costa@medstaff.com',
    position: 'Analista Comercial',
    department: 'Comercial',
    status: 'active',
    joinDate: '2023-03-15',
    performance: 4.5
  },
  {
    id: '2',
    name: 'Carlos Lima',
    email: 'carlos.lima@medstaff.com',
    position: 'Analista Operacional',
    department: 'Operacional',
    status: 'active',
    joinDate: '2023-01-10',
    performance: 4.2
  },
  {
    id: '3',
    name: 'Lucia Ferreira',
    email: 'lucia.ferreira@medstaff.com',
    position: 'Assistente Administrativo',
    department: 'Administrativo',
    status: 'vacation',
    joinDate: '2023-06-20',
    performance: 4.0
  }
]

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Dr. João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    type: 'PF',
    status: 'active',
    lastContact: '2024-01-20',
    satisfaction: 4.8
  },
  {
    id: '2',
    name: 'Clínica São Paulo',
    email: 'contato@clinicasp.com',
    phone: '(11) 88888-8888',
    type: 'PJ',
    status: 'active',
    lastContact: '2024-01-18',
    satisfaction: 4.5
  },
  {
    id: '3',
    name: 'Dra. Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 77777-7777',
    type: 'PF',
    status: 'prospect',
    lastContact: '2024-01-15',
    satisfaction: 0
  }
]

const mockSACTickets: SACTicket[] = [
  {
    id: '1',
    clientName: 'Dr. João Silva',
    subject: 'Dúvida sobre faturamento',
    description: 'Gostaria de entender melhor como funciona o processo de faturamento dos serviços.',
    priority: 'medium',
    status: 'open',
    createdAt: '2024-01-22T10:30:00Z',
    responses: []
  },
  {
    id: '2',
    clientName: 'Clínica São Paulo',
    subject: 'Problema com acesso ao sistema',
    description: 'Não conseguimos acessar o sistema desde ontem. Aparece erro de conexão.',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2024-01-21T14:15:00Z',
    assignedTo: 'Suporte TI',
    responses: [
      {
        id: '1',
        message: 'Recebemos sua solicitação e estamos investigando o problema.',
        author: 'Suporte TI',
        createdAt: '2024-01-21T14:30:00Z',
        isInternal: false
      }
    ]
  }
]

const statusLabels = {
  active: 'Ativo',
  inactive: 'Inativo',
  vacation: 'Férias',
  prospect: 'Prospect'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  vacation: 'bg-blue-100 text-blue-800',
  prospect: 'bg-yellow-100 text-yellow-800'
}

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const sacStatusLabels = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  resolved: 'Resolvido',
  closed: 'Fechado'
}

const sacStatusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
}

export const Relationship: React.FC = () => {
  const permissions = usePermissions()
  const [activeTab, setActiveTab] = useState<'collaborators' | 'clients' | 'sac'>('collaborators')
  const [collaborators] = useState<Collaborator[]>(mockCollaborators)
  const [clients] = useState<Client[]>(mockClients)
  const [sacTickets] = useState<SACTicket[]>(mockSACTickets)
  const [selectedTicket, setSelectedTicket] = useState<SACTicket | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ))
  }

  const handleViewTicket = (ticket: SACTicket) => {
    setSelectedTicket(ticket)
  }

  const handleRespondTicket = (ticketId: string, message: string) => {
    // Implementar resposta ao ticket
    console.log('Responder ticket:', ticketId, message)
  }

  if (!permissions.hasPermission('relationship.collaborators.read') && 
      !permissions.hasPermission('relationship.clients.read') && 
      !permissions.hasPermission('relationship.sac.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
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
        <h1 className="text-2xl font-bold text-gray-900">Relacionamento</h1>
        <p className="text-gray-600">Gestão de colaboradores, clientes e SAC</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {permissions.hasPermission('relationship.collaborators.read') && (
            <button
              onClick={() => setActiveTab('collaborators')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'collaborators'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="inline-block w-4 h-4 mr-2" />
              Colaboradores
            </button>
          )}
          {permissions.hasPermission('relationship.clients.read') && (
            <button
              onClick={() => setActiveTab('clients')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'clients'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="inline-block w-4 h-4 mr-2" />
              Clientes
            </button>
          )}
          {permissions.hasPermission('relationship.sac.read') && (
            <button
              onClick={() => setActiveTab('sac')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sac'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="inline-block w-4 h-4 mr-2" />
              SAC
            </button>
          )}
        </nav>
      </div>

      {/* Colaboradores */}
      {activeTab === 'collaborators' && permissions.hasPermission('relationship.collaborators.read') && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar colaboradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colaborador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admissão
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collaborators.map((collaborator) => (
                  <tr key={collaborator.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{collaborator.name}</div>
                        <div className="text-sm text-gray-500">{collaborator.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collaborator.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collaborator.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[collaborator.status]}`}>
                        {statusLabels[collaborator.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {renderStars(collaborator.performance)}
                        <span className="text-sm text-gray-600 ml-2">{collaborator.performance}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(collaborator.joinDate).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clientes */}
      {activeTab === 'clients' && permissions.hasPermission('relationship.clients.read') && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">Todos os tipos</option>
                <option value="PF">Pessoa Física</option>
                <option value="PJ">Pessoa Jurídica</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satisfação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Contato
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                        <div className="text-sm text-gray-500">{client.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.type === 'PF' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {client.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[client.status]}`}>
                        {statusLabels[client.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.satisfaction > 0 ? (
                        <div className="flex items-center space-x-1">
                          {renderStars(client.satisfaction)}
                          <span className="text-sm text-gray-600 ml-2">{client.satisfaction}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(client.lastContact).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SAC */}
      {activeTab === 'sac' && permissions.hasPermission('relationship.sac.read') && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">Todos os status</option>
                <option value="open">Aberto</option>
                <option value="in_progress">Em Andamento</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Fechado</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">Todas as prioridades</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sacTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{ticket.id}</div>
                        <div className="text-sm text-gray-500">{ticket.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                        {priorityLabels[ticket.priority]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sacStatusColors[ticket.status]}`}>
                        {sacStatusLabels[ticket.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewTicket(ticket)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye size={16} />
                        </button>
                        {permissions.hasPermission('relationship.sac.respond') && (
                          <button className="text-green-600 hover:text-green-900">
                            <Send size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de visualização de ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">Ticket #{selectedTicket.id}</h2>
                <p className="text-gray-600">{selectedTicket.subject}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-900">{selectedTicket.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Por {selectedTicket.clientName} em {new Date(selectedTicket.createdAt).toLocaleString('pt-BR')}
                </div>
              </div>
              
              {selectedTicket.responses.map((response) => (
                <div key={response.id} className={`p-4 rounded-lg ${response.isInternal ? 'bg-blue-50' : 'bg-green-50'}`}>
                  <p className="text-sm text-gray-900">{response.message}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Por {response.author} em {new Date(response.createdAt).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
              
              {permissions.hasPermission('relationship.sac.respond') && (
                <div className="border-t pt-4">
                  <textarea
                    placeholder="Digite sua resposta..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                      <Send size={16} />
                      <span>Enviar Resposta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}