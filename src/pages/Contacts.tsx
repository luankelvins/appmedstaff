import React, { useState, useEffect } from 'react'
import { usePermissions } from '../hooks/usePermissions'
import { Loading } from '../components/UI/Loading'
import LeadForm from '../components/CRM/LeadForm'
import { LeadForm as LeadFormType, LeadPipelineStage } from '../types/crm'
import leadsService, { ContactLead } from '../services/leadsService'
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
  Trash2,
  UserPlus,
  Target
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
  status: 'ativo' | 'inativo' | 'prospecto' | 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
  pipelineStage?: LeadPipelineStage
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
    status: 'qualificado',
    pipelineStage: 'ligacao_1',
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
  },
  {
    id: '6',
    name: 'Dr. Carlos Oliveira',
    email: 'carlos.oliveira@clinica.com',
    phone: '(11) 77777-7777',
    type: 'lead',
    company: 'Clínica Oliveira',
    position: 'Médico Ortopedista',
    city: 'Rio de Janeiro',
    state: 'RJ',
    status: 'novo',
    pipelineStage: 'novo_lead',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notes: 'Interessado em abertura de PJ'
  },
  {
    id: '7',
    name: 'Dra. Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 66666-6666',
    type: 'lead',
    company: 'Consultório Ana Costa',
    position: 'Dermatologista',
    city: 'Belo Horizonte',
    state: 'MG',
    status: 'contatado',
    pipelineStage: 'ligacao_2',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    notes: 'Já foi contatada, aguardando retorno'
  },
  {
    id: '8',
    name: 'Dr. Pedro Silva',
    email: 'pedro.silva@hospital.com',
    phone: '(11) 55555-5555',
    type: 'lead',
    company: 'Hospital Regional',
    position: 'Cirurgião',
    city: 'Brasília',
    state: 'DF',
    status: 'perdido',
    pipelineStage: 'desfecho',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    notes: 'Não demonstrou interesse nos serviços'
  }
]

const Contacts: React.FC = () => {
  const { canViewContacts, canCreateContacts, canUpdateContacts, canDeleteContacts, canViewInternalContacts } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'all' | 'leads'>('all')
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [contactLeads, setContactLeads] = useState<ContactLead[]>([])

  // Carregar leads do serviço compartilhado
  useEffect(() => {
    // Carregar leads iniciais
    setContactLeads(leadsService.getContactLeads())

    // Subscrever para mudanças nos leads
    const unsubscribe = leadsService.subscribe((leads) => {
      setContactLeads(leadsService.getContactLeads())
    })

    return unsubscribe
  }, [])

  // Função para lidar com o envio do formulário de lead
  const handleLeadSubmit = async (leadData: LeadFormType) => {
    try {
      await leadsService.createLead(leadData)
      setShowLeadForm(false)
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      alert('Erro ao criar lead. Tente novamente.')
    }
  }

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
      case 'novo':
        return 'bg-blue-100 text-blue-800'
      case 'contatado':
        return 'bg-purple-100 text-purple-800'
      case 'qualificado':
        return 'bg-green-100 text-green-800'
      case 'proposta':
        return 'bg-orange-100 text-orange-800'
      case 'negociacao':
        return 'bg-yellow-100 text-yellow-800'
      case 'ganho':
        return 'bg-emerald-100 text-emerald-800'
      case 'perdido':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPipelineStageLabel = (stage: LeadPipelineStage) => {
    switch (stage) {
      case 'novo_lead':
        return 'Novo Lead'
      case 'ligacao_1':
        return '1ª Ligação'
      case 'ligacao_2':
        return '2ª Ligação'
      case 'mensagem':
        return 'Mensagem Enviada'
      case 'recontato':
        return 'Recontato'
      case 'desfecho':
        return 'Desfecho'
      default:
        return stage
    }
  }

  const getPipelineStageColor = (stage: LeadPipelineStage) => {
    switch (stage) {
      case 'novo_lead':
        return 'bg-blue-100 text-blue-800'
      case 'ligacao_1':
        return 'bg-purple-100 text-purple-800'
      case 'ligacao_2':
        return 'bg-indigo-100 text-indigo-800'
      case 'mensagem':
        return 'bg-cyan-100 text-cyan-800'
      case 'recontato':
        return 'bg-yellow-100 text-yellow-800'
      case 'desfecho':
        return 'bg-gray-100 text-gray-800'
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

  // Filtrar contatos baseado na aba ativa
  const getFilteredData = () => {
    if (activeTab === 'leads') {
      // Combinar leads do mock e leads criados
      const allLeads = [
          ...mockContacts.filter(contact => contact.type === 'lead'),
          ...contactLeads
        ]
      
      return allLeads.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             contact.phone.includes(searchTerm)
        
        const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
        
        return matchesSearch && matchesStatus
      })
    } else {
      // Todos os contatos
      return mockContacts.filter(contact => {
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
    }
  }

  const filteredContacts = getFilteredData()

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
          <div className="flex space-x-3">
            {activeTab === 'leads' && (
              <button 
                onClick={() => setShowLeadForm(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center shadow-lg transform hover:scale-105"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                + Novo Lead
              </button>
            )}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contato
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Todos os Contatos
                <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {mockContacts.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'leads'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Leads
                <span className="ml-2 bg-green-100 text-green-600 py-1 px-2 rounded-full text-xs">
                  {mockContacts.filter(c => c.type === 'lead').length + contactLeads.length}
                </span>
              </div>
            </button>
          </nav>
        </div>
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
                  {activeTab === 'leads' ? (
                    // Cabeçalhos específicos para Leads
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Etapa do Pipeline
                      </th>
                      {(canUpdateContacts() || canDeleteContacts()) && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      )}
                    </>
                  ) : (
                    // Cabeçalhos padrão para outros contatos
                    <>
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
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    {activeTab === 'leads' ? (
                      // Layout específico para Leads
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                            {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                          </span>
                        </td>
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
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {contact.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {contact.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {contact.pipelineStage ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPipelineStageColor(contact.pipelineStage)}`}>
                              {getPipelineStageLabel(contact.pipelineStage)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
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
                      </>
                    ) : (
                      // Layout padrão para outros contatos
                      <>
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
                      </>
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

      {/* Modal do Formulário de Lead */}
      {showLeadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Novo Lead</h2>
              <button
                onClick={() => setShowLeadForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <LeadForm
                onSubmit={handleLeadSubmit}
                onCancel={() => setShowLeadForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Contacts