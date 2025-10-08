import React, { useState } from 'react'
import { DollarSign, TrendingUp, PieChart, Calculator, Users, FileText, Search, Filter, Plus, Eye, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

interface FinancialConsultation {
  id: string
  clientName: string
  cpf: string
  email: string
  phone: string
  consultationType: 'investment' | 'debt_negotiation' | 'financial_planning' | 'tax_optimization' | 'retirement_planning'
  status: 'initial_contact' | 'analysis' | 'proposal' | 'implementation' | 'monitoring' | 'completed'
  startDate: string
  consultant: string
  partner: string
  currentIncome: number
  financialGoals: string[]
  priority: 'low' | 'medium' | 'high'
  nextAction: string
  documents: Document[]
  meetings: Meeting[]
}

interface Document {
  id: string
  name: string
  type: 'income_proof' | 'bank_statement' | 'investment_portfolio' | 'debt_statement' | 'other'
  status: 'pending' | 'received' | 'analyzed'
  uploadDate?: string
}

interface Meeting {
  id: string
  date: string
  type: 'initial' | 'analysis' | 'proposal' | 'follow_up'
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

const mockConsultations: FinancialConsultation[] = [
  {
    id: '1',
    clientName: 'Dr. Maria Santos',
    cpf: '123.456.789-00',
    email: 'maria.santos@email.com',
    phone: '(11) 99999-9999',
    consultationType: 'investment',
    status: 'analysis',
    startDate: '2024-01-15',
    consultant: 'João Consultor Financeiro',
    partner: 'FinancePartner Consultoria',
    currentIncome: 25000,
    financialGoals: ['Aposentadoria', 'Compra de imóvel', 'Reserva de emergência'],
    priority: 'high',
    nextAction: 'Análise de perfil de investidor',
    documents: [
      { id: '1', name: 'Comprovante de Renda', type: 'income_proof', status: 'received', uploadDate: '2024-01-16' },
      { id: '2', name: 'Extrato Bancário', type: 'bank_statement', status: 'pending' }
    ],
    meetings: [
      { id: '1', date: '2024-01-15', type: 'initial', status: 'completed', notes: 'Primeira consulta realizada' },
      { id: '2', date: '2024-01-22', type: 'analysis', status: 'scheduled' }
    ]
  },
  {
    id: '2',
    clientName: 'Dr. Carlos Oliveira',
    cpf: '987.654.321-00',
    email: 'carlos.oliveira@email.com',
    phone: '(11) 88888-8888',
    consultationType: 'debt_negotiation',
    status: 'proposal',
    startDate: '2024-02-01',
    consultant: 'Maria Consultora Financeira',
    partner: 'DebtSolution Consultoria',
    currentIncome: 18000,
    financialGoals: ['Quitação de dívidas', 'Reorganização financeira'],
    priority: 'medium',
    nextAction: 'Apresentação da proposta de renegociação',
    documents: [
      { id: '3', name: 'Comprovante de Renda', type: 'income_proof', status: 'received', uploadDate: '2024-02-02' },
      { id: '4', name: 'Extrato de Dívidas', type: 'debt_statement', status: 'analyzed', uploadDate: '2024-02-03' }
    ],
    meetings: [
      { id: '3', date: '2024-02-01', type: 'initial', status: 'completed', notes: 'Levantamento de dívidas' },
      { id: '4', date: '2024-02-08', type: 'proposal', status: 'scheduled' }
    ]
  }
]

const consultationTypeLabels = {
  investment: 'Investimentos',
  debt_negotiation: 'Negociação de Dívidas',
  financial_planning: 'Planejamento Financeiro',
  tax_optimization: 'Otimização Tributária',
  retirement_planning: 'Planejamento de Aposentadoria'
}

const statusLabels = {
  initial_contact: 'Contato Inicial',
  analysis: 'Análise',
  proposal: 'Proposta',
  implementation: 'Implementação',
  monitoring: 'Monitoramento',
  completed: 'Concluído'
}

const statusColors = {
  initial_contact: 'bg-blue-100 text-blue-800',
  analysis: 'bg-yellow-100 text-yellow-800',
  proposal: 'bg-orange-100 text-orange-800',
  implementation: 'bg-purple-100 text-purple-800',
  monitoring: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800'
}

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
}

const documentStatusLabels = {
  pending: 'Pendente',
  received: 'Recebido',
  analyzed: 'Analisado'
}

const documentStatusColors = {
  pending: 'bg-gray-100 text-gray-800',
  received: 'bg-blue-100 text-blue-800',
  analyzed: 'bg-green-100 text-green-800'
}

export const FinancialConsultingPF: React.FC = () => {
  const permissions = usePermissions()
  const [consultations] = useState<FinancialConsultation[]>(mockConsultations)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedConsultation, setSelectedConsultation] = useState<FinancialConsultation | null>(null)

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.cpf.includes(searchTerm) ||
                         consultation.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter
    const matchesType = typeFilter === 'all' || consultation.consultationType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleViewConsultation = (consultation: FinancialConsultation) => {
    setSelectedConsultation(consultation)
  }

  const getMeetingIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />
      case 'scheduled':
        return <Clock className="text-blue-500" size={16} />
      case 'cancelled':
        return <AlertCircle className="text-red-500" size={16} />
      default:
        return <Clock className="text-gray-400" size={16} />
    }
  }

  if (!permissions.hasPermission('activities.partners.view')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
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
        <h1 className="text-2xl font-bold text-gray-900">Consultoria Financeira PF</h1>
        <p className="text-gray-600">Gestão de consultorias financeiras para pessoas físicas em parceria</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Consultorias Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{consultations.filter(c => c.status !== 'completed').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">{consultations.filter(c => c.status === 'completed').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Renda Média</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(consultations.reduce((sum, c) => sum + c.currentIncome, 0) / consultations.length)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <PieChart className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Investimentos</p>
              <p className="text-2xl font-bold text-gray-900">
                {consultations.filter(c => c.consultationType === 'investment').length}
              </p>
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
              placeholder="Buscar consultorias..."
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
            <option value="initial_contact">Contato Inicial</option>
            <option value="analysis">Análise</option>
            <option value="proposal">Proposta</option>
            <option value="implementation">Implementação</option>
            <option value="monitoring">Monitoramento</option>
            <option value="completed">Concluído</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="investment">Investimentos</option>
            <option value="debt_negotiation">Negociação de Dívidas</option>
            <option value="financial_planning">Planejamento Financeiro</option>
            <option value="tax_optimization">Otimização Tributária</option>
            <option value="retirement_planning">Planejamento de Aposentadoria</option>
          </select>
        </div>
        {permissions.hasPermission('activities.partners.create') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus size={20} />
            <span>Nova Consultoria</span>
          </button>
        )}
      </div>

      {/* Lista de Consultorias */}
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
                Prioridade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Renda
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
            {filteredConsultations.map((consultation) => (
              <tr key={consultation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{consultation.clientName}</div>
                    <div className="text-sm text-gray-500">{consultation.cpf}</div>
                    <div className="text-sm text-gray-500">{consultation.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {consultationTypeLabels[consultation.consultationType]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[consultation.status]}`}>
                    {statusLabels[consultation.status]}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{consultation.nextAction}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[consultation.priority]}`}>
                    {priorityLabels[consultation.priority]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(consultation.currentIncome)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{consultation.consultant}</div>
                  <div className="text-sm text-gray-500">{consultation.partner}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleViewConsultation(consultation)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye size={16} />
                    </button>
                    {permissions.hasPermission('activities.partners.update') && (
                      <button className="text-green-600 hover:text-green-900">
                        <Edit size={16} />
                      </button>
                    )}
                    {permissions.hasPermission('activities.partners.delete') && (
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

      {/* Modal de visualização de consultoria */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selectedConsultation.clientName}</h2>
                <p className="text-gray-600">{consultationTypeLabels[selectedConsultation.consultationType]}</p>
                <p className="text-gray-500">{selectedConsultation.cpf} - {selectedConsultation.email}</p>
              </div>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações Gerais */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Informações da Consultoria</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedConsultation.status]}`}>
                        {statusLabels[selectedConsultation.status]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prioridade:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[selectedConsultation.priority]}`}>
                        {priorityLabels[selectedConsultation.priority]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Renda Atual:</span>
                      <span className="text-gray-900">{formatCurrency(selectedConsultation.currentIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultor:</span>
                      <span className="text-gray-900">{selectedConsultation.consultant}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parceiro:</span>
                      <span className="text-gray-900">{selectedConsultation.partner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Início:</span>
                      <span className="text-gray-900">{new Date(selectedConsultation.startDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Próxima Ação:</span>
                      <span className="text-gray-900">{selectedConsultation.nextAction}</span>
                    </div>
                  </div>
                </div>

                {/* Objetivos Financeiros */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Objetivos Financeiros</h3>
                  <div className="space-y-1">
                    {selectedConsultation.financialGoals.map((goal) => (
                      <div key={goal} className="flex items-center">
                        <CheckCircle size={16} className="text-green-500 mr-2" />
                        <span className="text-sm text-gray-900">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documentos */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Documentos</h3>
                  <div className="space-y-2">
                    {selectedConsultation.documents.map((doc) => (
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

              {/* Reuniões */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Histórico de Reuniões</h3>
                <div className="space-y-3">
                  {selectedConsultation.meetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getMeetingIcon(meeting.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {meeting.type === 'initial' && 'Reunião Inicial'}
                            {meeting.type === 'analysis' && 'Análise'}
                            {meeting.type === 'proposal' && 'Apresentação de Proposta'}
                            {meeting.type === 'follow_up' && 'Acompanhamento'}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {new Date(meeting.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {meeting.notes && (
                          <p className="text-sm text-gray-600 mt-1">{meeting.notes}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Status: {meeting.status === 'completed' ? 'Concluída' : meeting.status === 'scheduled' ? 'Agendada' : 'Cancelada'}
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