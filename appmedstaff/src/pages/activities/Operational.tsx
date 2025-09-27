import React, { useState } from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import { 
  Building2, 
  FileText, 
  Eye, 
  TrendingUp,
  Calculator,
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  Users,
  Download
} from 'lucide-react'

interface Company {
  id: string
  name: string
  cnpj: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  type: 'abertura' | 'alteracao' | 'baixa'
  responsiblePerson: string
  createdAt: string
  lastUpdate: string
  documents: string[]
  progress: number
}

interface Invoice {
  id: string
  number: string
  company: string
  cnpj: string
  value: number
  issueDate: string
  dueDate: string
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  services: string[]
  responsiblePerson: string
}

interface IRPFProcess {
  id: string
  clientName: string
  cpf: string
  year: number
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'delivered'
  type: 'simples' | 'completa'
  refund: number
  responsiblePerson: string
  deadline: string
  documents: string[]
}

const Operational: React.FC = () => {
  const permissions = usePermissions()
  const [activeTab, setActiveTab] = useState<'companies' | 'invoices' | 'irpf' | 'monitoring'>('companies')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Mock data
  const mockCompanies: Company[] = [
    {
      id: '1',
      name: 'Clínica Nova Esperança',
      cnpj: '12.345.678/0001-90',
      status: 'active',
      type: 'abertura',
      responsiblePerson: 'Ana Silva',
      createdAt: '2024-01-15T10:00:00Z',
      lastUpdate: '2024-01-20T14:30:00Z',
      documents: ['Contrato Social', 'Alvará', 'Inscrição Municipal'],
      progress: 85
    },
    {
      id: '2',
      name: 'Consultório Dr. João',
      cnpj: '98.765.432/0001-10',
      status: 'pending',
      type: 'alteracao',
      responsiblePerson: 'Carlos Lima',
      createdAt: '2024-01-10T09:00:00Z',
      lastUpdate: '2024-01-22T16:00:00Z',
      documents: ['Alteração Contratual', 'Ata de Assembleia'],
      progress: 45
    }
  ]

  const mockInvoices: Invoice[] = [
    {
      id: '1',
      number: 'NF-2024-001',
      company: 'Clínica MedCenter',
      cnpj: '12.345.678/0001-90',
      value: 5500,
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      status: 'paid',
      services: ['Consultoria Contábil', 'Emissão de Guias'],
      responsiblePerson: 'Ana Silva'
    },
    {
      id: '2',
      number: 'NF-2024-002',
      company: 'Hospital São Lucas',
      cnpj: '98.765.432/0001-10',
      value: 8200,
      issueDate: '2024-01-20',
      dueDate: '2024-02-20',
      status: 'issued',
      services: ['Gestão Fiscal', 'Declarações'],
      responsiblePerson: 'Carlos Lima'
    }
  ]

  const mockIRPF: IRPFProcess[] = [
    {
      id: '1',
      clientName: 'Dr. Pedro Oliveira',
      cpf: '123.456.789-00',
      year: 2024,
      status: 'completed',
      type: 'completa',
      refund: 2500,
      responsiblePerson: 'Maria Santos',
      deadline: '2024-04-30',
      documents: ['Informe de Rendimentos', 'Recibos Médicos', 'Comprovantes']
    },
    {
      id: '2',
      clientName: 'Dra. Lucia Ferreira',
      cpf: '987.654.321-00',
      year: 2024,
      status: 'in_progress',
      type: 'simples',
      refund: 0,
      responsiblePerson: 'João Costa',
      deadline: '2024-04-30',
      documents: ['Informe de Rendimentos']
    }
  ]

  if (!permissions.canViewOperationalActivities) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <Building2 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Acesso Negado</h3>
          <p className="text-gray-500">Você não tem permissão para visualizar atividades operacionais.</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      issued: 'bg-blue-100 text-blue-800',
      sent: 'bg-purple-100 text-purple-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      delivered: 'bg-emerald-100 text-emerald-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      active: CheckCircle,
      pending: Clock,
      suspended: AlertCircle,
      paid: CheckCircle,
      overdue: AlertCircle,
      completed: CheckCircle,
      in_progress: Clock
    }
    const Icon = icons[status as keyof typeof icons] || Clock
    return <Icon className="h-4 w-4" />
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atividades Operacionais</h1>
          <p className="text-gray-600">Gestão de empresas, notas fiscais, IRPF e acompanhamento</p>
        </div>
        {permissions.canCreateOperationalActivities && (
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
              <p className="text-sm font-medium text-gray-600">Empresas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">42</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">NFs Emitidas</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">IRPFs Processados</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Calculator className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+25%</span>
            <span className="text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ 125K</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+18%</span>
            <span className="text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'companies', label: 'Empresas', icon: Building2 },
              { id: 'invoices', label: 'Notas Fiscais', icon: FileText },
              { id: 'irpf', label: 'IRPF', icon: Calculator },
              { id: 'monitoring', label: 'Acompanhamento', icon: Eye }
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
                {activeTab === 'companies' && (
                  <>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="pending">Pendente</option>
                    <option value="suspended">Suspenso</option>
                  </>
                )}
                {activeTab === 'invoices' && (
                  <>
                    <option value="draft">Rascunho</option>
                    <option value="issued">Emitida</option>
                    <option value="sent">Enviada</option>
                    <option value="paid">Paga</option>
                    <option value="overdue">Vencida</option>
                  </>
                )}
                {activeTab === 'irpf' && (
                  <>
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="review">Revisão</option>
                    <option value="completed">Concluído</option>
                    <option value="delivered">Entregue</option>
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
          {activeTab === 'companies' && (
            <div className="space-y-4">
              {mockCompanies.map((company) => (
                <div key={company.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{company.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                          {getStatusIcon(company.status)}
                          <span className="ml-1">{company.status}</span>
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {company.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>CNPJ: {company.cnpj}</div>
                        <div>Responsável: {company.responsiblePerson}</div>
                        <div>Criado: {formatDate(company.createdAt)}</div>
                      </div>
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progresso</span>
                          <span>{company.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(company.progress)}`}
                            style={{ width: `${company.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {company.documents.map((doc, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </button>
                      {permissions.canUpdateOperationalActivities && (
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {permissions.canDeleteOperationalActivities && (
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

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              {mockInvoices.map((invoice) => (
                <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{invoice.number}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1">{invoice.status}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                        <div>Empresa: {invoice.company}</div>
                        <div>Valor: {formatCurrency(invoice.value)}</div>
                        <div>Emissão: {formatDate(invoice.issueDate)}</div>
                        <div>Vencimento: {formatDate(invoice.dueDate)}</div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {invoice.services.map((service, index) => (
                          <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                            {service}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">
                        Responsável: {invoice.responsiblePerson}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </button>
                      {permissions.canUpdateOperationalActivities && (
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'irpf' && (
            <div className="space-y-4">
              {mockIRPF.map((irpf) => (
                <div key={irpf.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{irpf.clientName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(irpf.status)}`}>
                          {getStatusIcon(irpf.status)}
                          <span className="ml-1">{irpf.status}</span>
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {irpf.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                        <div>CPF: {irpf.cpf}</div>
                        <div>Ano: {irpf.year}</div>
                        <div>Restituição: {formatCurrency(irpf.refund)}</div>
                        <div>Prazo: {formatDate(irpf.deadline)}</div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {irpf.documents.map((doc, index) => (
                          <span key={index} className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs">
                            {doc}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">
                        Responsável: {irpf.responsiblePerson}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </button>
                      {permissions.canUpdateOperationalActivities && (
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Acompanhamento em Desenvolvimento</h3>
              <p className="text-gray-500">
                Esta seção conterá dashboards e relatórios de acompanhamento das atividades operacionais.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Operational