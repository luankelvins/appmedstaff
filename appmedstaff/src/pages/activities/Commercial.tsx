import React, { useState } from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import { 
  Users, 
  Building2, 
  Package, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  source: 'website' | 'referral' | 'social' | 'ads' | 'event'
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  value?: number
  assignedTo: string
  createdAt: string
  lastContact?: string
}

interface PJClient {
  id: string
  companyName: string
  cnpj: string
  contactName: string
  email: string
  phone: string
  address: string
  status: 'active' | 'inactive' | 'pending'
  contractValue: number
  startDate: string
  renewalDate: string
  assignedTo: string
}

interface Product {
  id: string
  name: string
  category: 'consultoria' | 'software' | 'servico' | 'treinamento'
  description: string
  price: number
  status: 'active' | 'inactive' | 'development'
  salesCount: number
  revenue: number
}

const Commercial: React.FC = () => {
  const permissions = usePermissions()
  const [activeTab, setActiveTab] = useState<'leads' | 'pj' | 'products'>('leads')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Mock data
  const mockLeads: Lead[] = [
    {
      id: '1',
      name: 'Dr. João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999',
      company: 'Clínica São Paulo',
      source: 'website',
      status: 'qualified',
      value: 50000,
      assignedTo: 'Ana Costa',
      createdAt: '2024-01-15T10:00:00Z',
      lastContact: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      name: 'Dra. Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(11) 88888-8888',
      company: 'Hospital Central',
      source: 'referral',
      status: 'proposal',
      value: 75000,
      assignedTo: 'Carlos Lima',
      createdAt: '2024-01-10T09:00:00Z',
      lastContact: '2024-01-22T16:00:00Z'
    }
  ]

  const mockPJClients: PJClient[] = [
    {
      id: '1',
      companyName: 'Clínica MedCenter',
      cnpj: '12.345.678/0001-90',
      contactName: 'Dr. Pedro Oliveira',
      email: 'contato@medcenter.com.br',
      phone: '(11) 3333-3333',
      address: 'Av. Paulista, 1000 - São Paulo/SP',
      status: 'active',
      contractValue: 120000,
      startDate: '2024-01-01',
      renewalDate: '2024-12-31',
      assignedTo: 'Ana Costa'
    },
    {
      id: '2',
      companyName: 'Hospital São Lucas',
      cnpj: '98.765.432/0001-10',
      contactName: 'Dra. Lucia Ferreira',
      email: 'admin@saolucas.com.br',
      phone: '(11) 4444-4444',
      address: 'Rua das Flores, 500 - São Paulo/SP',
      status: 'active',
      contractValue: 200000,
      startDate: '2023-06-01',
      renewalDate: '2024-05-31',
      assignedTo: 'Carlos Lima'
    }
  ]

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Consultoria Abertura de Clínica',
      category: 'consultoria',
      description: 'Consultoria completa para abertura de clínicas médicas',
      price: 15000,
      status: 'active',
      salesCount: 25,
      revenue: 375000
    },
    {
      id: '2',
      name: 'Sistema de Gestão Médica',
      category: 'software',
      description: 'Software completo para gestão de clínicas e consultórios',
      price: 299,
      status: 'active',
      salesCount: 150,
      revenue: 44850
    }
  ]

  if (!permissions.canViewCommercialActivities) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Acesso Negado</h3>
          <p className="text-gray-500">Você não tem permissão para visualizar atividades comerciais.</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      proposal: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-orange-100 text-orange-800',
      won: 'bg-emerald-100 text-emerald-800',
      lost: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      development: 'bg-blue-100 text-blue-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atividades Comerciais</h1>
          <p className="text-gray-600">Gestão de leads, clientes PJ e produtos</p>
        </div>
        {permissions.canCreateCommercialActivities && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads Ativos</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12%</span>
            <span className="text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes PJ</p>
              <p className="text-2xl font-bold text-gray-900">18</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+8%</span>
            <span className="text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
              <p className="text-2xl font-bold text-gray-900">R$ 85.4K</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+15%</span>
            <span className="text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa Conversão</p>
              <p className="text-2xl font-bold text-gray-900">32%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+5%</span>
            <span className="text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'leads', label: 'Leads', icon: Users },
              { id: 'pj', label: 'Clientes PJ', icon: Building2 },
              { id: 'products', label: 'Produtos', icon: Package }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os status</option>
                {activeTab === 'leads' && (
                  <>
                    <option value="new">Novo</option>
                    <option value="contacted">Contatado</option>
                    <option value="qualified">Qualificado</option>
                    <option value="proposal">Proposta</option>
                    <option value="negotiation">Negociação</option>
                    <option value="won">Ganho</option>
                    <option value="lost">Perdido</option>
                  </>
                )}
                {activeTab === 'pj' && (
                  <>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="pending">Pendente</option>
                  </>
                )}
                {activeTab === 'products' && (
                  <>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="development">Desenvolvimento</option>
                  </>
                )}
              </select>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'leads' && (
            <div className="space-y-4">
              {mockLeads.map((lead) => (
                <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{lead.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {lead.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {lead.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {lead.company || 'N/A'}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>Valor: {lead.value ? formatCurrency(lead.value) : 'N/A'}</span>
                        <span>Responsável: {lead.assignedTo}</span>
                        <span>Criado: {formatDate(lead.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </button>
                      {permissions.canUpdateCommercialActivities && (
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {permissions.canDeleteCommercialActivities && (
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pj' && (
            <div className="space-y-4">
              {mockPJClients.map((client) => (
                <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{client.companyName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {client.contactName}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {client.phone}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>Valor: {formatCurrency(client.contractValue)}</span>
                        <span>Responsável: {client.assignedTo}</span>
                        <span>Renovação: {formatDate(client.renewalDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </button>
                      {permissions.canUpdateCommercialActivities && (
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {permissions.canDeleteCommercialActivities && (
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              {mockProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {product.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Preço: {formatCurrency(product.price)}</span>
                        <span>Vendas: {product.salesCount}</span>
                        <span>Receita: {formatCurrency(product.revenue)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </button>
                      {permissions.canUpdateCommercialActivities && (
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {permissions.canDeleteCommercialActivities && (
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Commercial