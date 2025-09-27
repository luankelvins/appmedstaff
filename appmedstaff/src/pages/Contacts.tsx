import React, { useState } from 'react'
import { usePermissions } from '../hooks/usePermissions'
import { Loading } from '../components/UI/Loading'
import { 
  Plus,
  Search,
  Filter,
  Users,
  Building,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  type: 'lead' | 'cliente_pf' | 'cliente_pj' | 'tomador' | 'parceiro' | 'interno'
  company?: string
  position?: string
  address?: string
  city?: string
  state?: string
  status: 'ativo' | 'inativo' | 'prospecto'
  createdAt: Date
  lastContact?: Date
  notes?: string
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Dr. João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    type: 'cliente_pf',
    position: 'Médico Cardiologista',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    status: 'ativo',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    notes: 'Cliente premium, sempre pontual nos pagamentos'
  },
  {
    id: '2',
    name: 'Clínica ABC Ltda',
    email: 'contato@clinicaabc.com.br',
    phone: '(11) 3333-3333',
    type: 'cliente_pj',
    company: 'Clínica ABC Ltda',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    status: 'ativo',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notes: 'Contrato de 12 meses, renovação em dezembro'
  },
  {
    id: '3',
    name: 'Dra. Maria Santos',
    email: 'maria.santos@hospital.com',
    phone: '(11) 88888-8888',
    type: 'lead',
    company: 'Hospital Central',
    position: 'Diretora Médica',
    city: 'São Paulo',
    state: 'SP',
    status: 'prospecto',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    notes: 'Interessada em nossos serviços de consultoria'
  },
  {
    id: '4',
    name: 'Hospital São Lucas',
    email: 'rh@hospitalsaolucas.com.br',
    phone: '(11) 4444-4444',
    type: 'tomador',
    company: 'Hospital São Lucas',
    address: 'Rua da Saúde, 500',
    city: 'São Paulo',
    state: 'SP',
    status: 'ativo',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    lastContact: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    notes: 'Parceiro para alocação de profissionais'
  },
  {
    id: '5',
    name: 'TechMed Solutions',
    email: 'parceria@techmed.com.br',
    phone: '(11) 5555-5555',
    type: 'parceiro',
    company: 'TechMed Solutions',
    address: 'Rua da Tecnologia, 200',
    city: 'São Paulo',
    state: 'SP',
    status: 'ativo',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    lastContact: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    notes: 'Parceiro tecnológico para soluções digitais'
  }
]

const Contacts: React.FC = () => {
  const { canViewContacts, canCreateContacts, canUpdateContacts, canDeleteContacts, canViewInternalContacts } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  if (!canViewContacts()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acesso Negado
          </h3>
          <p className="text-gray-600">
            Você não tem permissão para visualizar contatos.
          </p>
        </div>
      </div>
    )
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lead':
        return 'Lead'
      case 'cliente_pf':
        return 'Cliente PF'
      case 'cliente_pj':
        return 'Cliente PJ'
      case 'tomador':
        return 'Tomador'
      case 'parceiro':
        return 'Parceiro'
      case 'interno':
        return 'Time Interno'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lead':
        return 'bg-yellow-100 text-yellow-800'
      case 'cliente_pf':
        return 'bg-blue-100 text-blue-800'
      case 'cliente_pj':
        return 'bg-purple-100 text-purple-800'
      case 'tomador':
        return 'bg-green-100 text-green-800'
      case 'parceiro':
        return 'bg-orange-100 text-orange-800'
      case 'interno':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800'
      case 'inativo':
        return 'bg-red-100 text-red-800'
      case 'prospecto':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const filteredContacts = mockContacts.filter(contact => {
    // Filtrar contatos internos se não tiver permissão
    if (contact.type === 'interno' && !canViewInternalContacts()) {
      return false
    }

    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === 'all' || contact.type === typeFilter
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return <Loading text="Carregando contatos..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contatos</h1>
          <p className="text-gray-600">
            Gerencie leads, clientes, parceiros e relacionamentos
          </p>
        </div>
        {canCreateContacts() && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Novo Contato
          </button>
        )}
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="lead">Leads</option>
              <option value="cliente_pf">Clientes PF</option>
              <option value="cliente_pj">Clientes PJ</option>
              <option value="tomador">Tomadores</option>
              <option value="parceiro">Parceiros</option>
              {canViewInternalContacts() && (
                <option value="interno">Time Interno</option>
              )}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="prospecto">Prospecto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Contatos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum contato encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros ou adicionar novos contatos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Contato
                  </th>
                  {(canUpdateContacts() || canDeleteContacts()) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contact.name}
                        </div>
                        {contact.company && (
                          <div className="text-sm text-gray-500">
                            {contact.company}
                          </div>
                        )}
                        {contact.position && (
                          <div className="text-sm text-gray-500">
                            {contact.position}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(contact.type)}`}>
                        {getTypeLabel(contact.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                        {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {contact.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {contact.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {contact.city && contact.state && (
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {contact.city}, {contact.state}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.lastContact ? formatDate(contact.lastContact) : '-'}
                    </td>
                    {(canUpdateContacts() || canDeleteContacts()) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {canUpdateContacts() && (
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDeleteContacts() && (
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Contatos</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredContacts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clientes Ativos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredContacts.filter(c => (c.type === 'cliente_pf' || c.type === 'cliente_pj') && c.status === 'ativo').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Leads</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredContacts.filter(c => c.type === 'lead').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Parceiros</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredContacts.filter(c => c.type === 'parceiro').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contacts