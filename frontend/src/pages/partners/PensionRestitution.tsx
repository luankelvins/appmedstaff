import React, { useState } from 'react'
import { Shield, Calculator, FileText, Clock, DollarSign, Users, Search, Filter, Plus, Eye, Edit, Trash2, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

interface PensionCase {
  id: string
  clientName: string
  cpf: string
  email: string
  phone: string
  caseType: 'revision' | 'restitution' | 'benefit_review' | 'contribution_review' | 'retirement_calculation'
  status: 'initial_analysis' | 'document_collection' | 'inss_submission' | 'administrative_process' | 'judicial_process' | 'completed' | 'rejected'
  startDate: string
  expectedValue: number
  actualValue?: number
  lawyer: string
  partner: string
  priority: 'low' | 'medium' | 'high'
  nextAction: string
  documents: Document[]
  timeline: TimelineEvent[]
  inssProtocol?: string
}

interface Document {
  id: string
  name: string
  type: 'identity' | 'cpf' | 'work_record' | 'salary_proof' | 'contribution_proof' | 'medical_report' | 'other'
  status: 'pending' | 'received' | 'analyzed' | 'submitted'
  uploadDate?: string
}

interface TimelineEvent {
  id: string
  date: string
  type: 'document_request' | 'document_received' | 'inss_submission' | 'inss_response' | 'hearing' | 'decision'
  description: string
  status: 'completed' | 'pending' | 'cancelled'
}

const mockCases: PensionCase[] = [
  {
    id: '1',
    clientName: 'Dr. João Silva',
    cpf: '123.456.789-00',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    caseType: 'revision',
    status: 'administrative_process',
    startDate: '2024-01-15',
    expectedValue: 50000,
    lawyer: 'Dra. Ana Previdenciária',
    partner: 'Previdência Legal Advocacia',
    priority: 'high',
    nextAction: 'Aguardar resposta do INSS',
    inssProtocol: 'INSS-2024-001234',
    documents: [
      { id: '1', name: 'RG', type: 'identity', status: 'submitted', uploadDate: '2024-01-16' },
      { id: '2', name: 'CPF', type: 'cpf', status: 'submitted', uploadDate: '2024-01-16' },
      { id: '3', name: 'CTPS', type: 'work_record', status: 'submitted', uploadDate: '2024-01-17' },
      { id: '4', name: 'Comprovantes de Salário', type: 'salary_proof', status: 'analyzed', uploadDate: '2024-01-18' }
    ],
    timeline: [
      { id: '1', date: '2024-01-15', type: 'document_request', description: 'Solicitação de documentos ao cliente', status: 'completed' },
      { id: '2', date: '2024-01-20', type: 'document_received', description: 'Documentos recebidos e analisados', status: 'completed' },
      { id: '3', date: '2024-01-25', type: 'inss_submission', description: 'Protocolo submetido ao INSS', status: 'completed' },
      { id: '4', date: '2024-02-15', type: 'inss_response', description: 'Aguardando resposta do INSS', status: 'pending' }
    ]
  },
  {
    id: '2',
    clientName: 'Dra. Maria Santos',
    cpf: '987.654.321-00',
    email: 'maria.santos@email.com',
    phone: '(11) 88888-8888',
    caseType: 'restitution',
    status: 'document_collection',
    startDate: '2024-02-01',
    expectedValue: 75000,
    lawyer: 'Dr. Carlos Previdenciário',
    partner: 'Direitos Previdenciários Ltda',
    priority: 'medium',
    nextAction: 'Aguardar envio de documentos complementares',
    documents: [
      { id: '5', name: 'RG', type: 'identity', status: 'received', uploadDate: '2024-02-02' },
      { id: '6', name: 'CPF', type: 'cpf', status: 'received', uploadDate: '2024-02-02' },
      { id: '7', name: 'CTPS', type: 'work_record', status: 'pending' },
      { id: '8', name: 'Extrato CNIS', type: 'contribution_proof', status: 'pending' }
    ],
    timeline: [
      { id: '5', date: '2024-02-01', type: 'document_request', description: 'Solicitação inicial de documentos', status: 'completed' },
      { id: '6', date: '2024-02-05', type: 'document_received', description: 'Documentos básicos recebidos', status: 'completed' },
      { id: '7', date: '2024-02-10', type: 'document_request', description: 'Solicitação de documentos complementares', status: 'pending' }
    ]
  }
]

const caseTypeLabels = {
  revision: 'Revisão de Benefício',
  restitution: 'Restituição',
  benefit_review: 'Revisão de Aposentadoria',
  contribution_review: 'Revisão de Contribuições',
  retirement_calculation: 'Cálculo de Aposentadoria'
}

const statusLabels = {
  initial_analysis: 'Análise Inicial',
  document_collection: 'Coleta de Documentos',
  inss_submission: 'Protocolo no INSS',
  administrative_process: 'Processo Administrativo',
  judicial_process: 'Processo Judicial',
  completed: 'Concluído',
  rejected: 'Rejeitado'
}

const statusColors = {
  initial_analysis: 'bg-blue-100 text-blue-800',
  document_collection: 'bg-yellow-100 text-yellow-800',
  inss_submission: 'bg-orange-100 text-orange-800',
  administrative_process: 'bg-purple-100 text-purple-800',
  judicial_process: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
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
  analyzed: 'Analisado',
  submitted: 'Protocolado'
}

const documentStatusColors = {
  pending: 'bg-gray-100 text-gray-800',
  received: 'bg-blue-100 text-blue-800',
  analyzed: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-green-100 text-green-800'
}

export const PensionRestitution: React.FC = () => {
  const permissions = usePermissions()
  const [cases] = useState<PensionCase[]>(mockCases)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedCase, setSelectedCase] = useState<PensionCase | null>(null)

  const filteredCases = cases.filter(pensionCase => {
    const matchesSearch = pensionCase.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pensionCase.cpf.includes(searchTerm) ||
                         pensionCase.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pensionCase.inssProtocol && pensionCase.inssProtocol.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || pensionCase.status === statusFilter
    const matchesType = typeFilter === 'all' || pensionCase.caseType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleViewCase = (pensionCase: PensionCase) => {
    setSelectedCase(pensionCase)
  }

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'document_request':
        return <FileText className="text-blue-500" size={16} />
      case 'document_received':
        return <CheckCircle className="text-green-500" size={16} />
      case 'inss_submission':
        return <Shield className="text-purple-500" size={16} />
      case 'inss_response':
        return <Clock className="text-orange-500" size={16} />
      case 'hearing':
        return <Calendar className="text-indigo-500" size={16} />
      case 'decision':
        return <CheckCircle className="text-green-500" size={16} />
      default:
        return <Clock className="text-gray-400" size={16} />
    }
  }

  if (!permissions.hasPermission('activities.partners.view')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
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
        <h1 className="text-2xl font-bold text-gray-900">Restituição Previdenciária PF</h1>
        <p className="text-gray-600">Gestão de processos de restituição e revisão previdenciária em parceria</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Casos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{cases.filter(c => !['completed', 'rejected'].includes(c.status)).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concluídos</p>
              <p className="text-2xl font-bold text-gray-900">{cases.filter(c => c.status === 'completed').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Esperado</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(cases.reduce((sum, c) => sum + c.expectedValue, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">No INSS</p>
              <p className="text-2xl font-bold text-gray-900">
                {cases.filter(c => ['inss_submission', 'administrative_process'].includes(c.status)).length}
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
              placeholder="Buscar casos..."
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
            <option value="initial_analysis">Análise Inicial</option>
            <option value="document_collection">Coleta de Documentos</option>
            <option value="inss_submission">Protocolo no INSS</option>
            <option value="administrative_process">Processo Administrativo</option>
            <option value="judicial_process">Processo Judicial</option>
            <option value="completed">Concluído</option>
            <option value="rejected">Rejeitado</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="revision">Revisão de Benefício</option>
            <option value="restitution">Restituição</option>
            <option value="benefit_review">Revisão de Aposentadoria</option>
            <option value="contribution_review">Revisão de Contribuições</option>
            <option value="retirement_calculation">Cálculo de Aposentadoria</option>
          </select>
        </div>
        {permissions.hasPermission('activities.partners.create') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus size={20} />
            <span>Novo Caso</span>
          </button>
        )}
      </div>

      {/* Lista de Casos */}
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
                Valor Esperado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Protocolo INSS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Advogado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCases.map((pensionCase) => (
              <tr key={pensionCase.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{pensionCase.clientName}</div>
                    <div className="text-sm text-gray-500">{pensionCase.cpf}</div>
                    <div className="text-sm text-gray-500">{pensionCase.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {caseTypeLabels[pensionCase.caseType]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[pensionCase.status]}`}>
                    {statusLabels[pensionCase.status]}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{pensionCase.nextAction}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatCurrency(pensionCase.expectedValue)}</div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[pensionCase.priority]}`}>
                    {priorityLabels[pensionCase.priority]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pensionCase.inssProtocol || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{pensionCase.lawyer}</div>
                  <div className="text-sm text-gray-500">{pensionCase.partner}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleViewCase(pensionCase)}
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

      {/* Modal de visualização de caso */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selectedCase.clientName}</h2>
                <p className="text-gray-600">{caseTypeLabels[selectedCase.caseType]}</p>
                <p className="text-gray-500">{selectedCase.cpf} - {selectedCase.email}</p>
                {selectedCase.inssProtocol && (
                  <p className="text-gray-500">Protocolo INSS: {selectedCase.inssProtocol}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações Gerais */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Informações do Caso</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedCase.status]}`}>
                        {statusLabels[selectedCase.status]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prioridade:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[selectedCase.priority]}`}>
                        {priorityLabels[selectedCase.priority]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Esperado:</span>
                      <span className="text-gray-900">{formatCurrency(selectedCase.expectedValue)}</span>
                    </div>
                    {selectedCase.actualValue && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor Obtido:</span>
                        <span className="text-gray-900">{formatCurrency(selectedCase.actualValue)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Advogado:</span>
                      <span className="text-gray-900">{selectedCase.lawyer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parceiro:</span>
                      <span className="text-gray-900">{selectedCase.partner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Início:</span>
                      <span className="text-gray-900">{new Date(selectedCase.startDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Próxima Ação:</span>
                      <span className="text-gray-900">{selectedCase.nextAction}</span>
                    </div>
                  </div>
                </div>

                {/* Documentos */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Documentos</h3>
                  <div className="space-y-2">
                    {selectedCase.documents.map((doc) => (
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

              {/* Timeline */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Timeline do Processo</h3>
                <div className="space-y-3">
                  {selectedCase.timeline.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getTimelineIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{event.description}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Status: {event.status === 'completed' ? 'Concluído' : event.status === 'pending' ? 'Pendente' : 'Cancelado'}
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