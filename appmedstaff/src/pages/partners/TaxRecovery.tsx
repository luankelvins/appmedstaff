import React, { useState } from 'react'
import { Calculator, FileText, DollarSign, TrendingUp, Building, Users, Search, Filter, Plus, Eye, Edit, Trash2, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

interface TaxRecoveryCase {
  id: string
  companyName: string
  cnpj: string
  email: string
  phone: string
  companyType: 'mei' | 'ltda' | 'sa' | 'eireli' | 'cooperativa'
  taxRegime: 'simples' | 'lucro_presumido' | 'lucro_real'
  recoveryType: 'icms' | 'pis_cofins' | 'irpj_csll' | 'inss' | 'iss' | 'multiple'
  status: 'initial_analysis' | 'document_collection' | 'calculation' | 'administrative_submission' | 'judicial_process' | 'approved' | 'rejected' | 'completed'
  startDate: string
  estimatedValue: number
  recoveredValue?: number
  period: {
    startDate: string
    endDate: string
  }
  partner: string
  accountant: string
  lawyer?: string
  priority: 'low' | 'medium' | 'high'
  nextAction: string
  documents: Document[]
  timeline: TimelineEvent[]
  calculations: TaxCalculation[]
  protocols: Protocol[]
}

interface Document {
  id: string
  name: string
  type: 'cnpj' | 'contrato_social' | 'balancetes' | 'darf' | 'gfip' | 'sped' | 'nfe' | 'other'
  status: 'pending' | 'received' | 'analyzed' | 'approved'
  uploadDate?: string
  period?: string
}

interface TaxCalculation {
  id: string
  taxType: string
  period: string
  originalValue: number
  correctedValue: number
  recoveryValue: number
  interest: number
  penalties: number
  status: 'draft' | 'calculated' | 'reviewed' | 'approved'
}

interface Protocol {
  id: string
  type: 'administrative' | 'judicial'
  number: string
  submissionDate: string
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'appealed'
  expectedResponse?: string
  value: number
}

interface TimelineEvent {
  id: string
  date: string
  type: 'case_opened' | 'documents_requested' | 'calculation_completed' | 'protocol_submitted' | 'response_received' | 'payment_received'
  description: string
  status: 'completed' | 'pending' | 'cancelled'
}

const mockCases: TaxRecoveryCase[] = [
  {
    id: '1',
    companyName: 'Clínica Médica São Paulo Ltda',
    cnpj: '12.345.678/0001-90',
    email: 'financeiro@clinicasp.com.br',
    phone: '(11) 3333-4444',
    companyType: 'ltda',
    taxRegime: 'lucro_presumido',
    recoveryType: 'pis_cofins',
    status: 'calculation',
    startDate: '2024-01-15',
    estimatedValue: 150000,
    period: {
      startDate: '2019-01-01',
      endDate: '2023-12-31'
    },
    partner: 'Tributária Especializada Ltda',
    accountant: 'João Contador',
    lawyer: 'Dra. Maria Tributarista',
    priority: 'high',
    nextAction: 'Finalizar cálculos de PIS/COFINS',
    documents: [
      { id: '1', name: 'Cartão CNPJ', type: 'cnpj', status: 'approved', uploadDate: '2024-01-16' },
      { id: '2', name: 'Contrato Social', type: 'contrato_social', status: 'approved', uploadDate: '2024-01-16' },
      { id: '3', name: 'Balancetes 2019-2023', type: 'balancetes', status: 'analyzed', uploadDate: '2024-01-18', period: '2019-2023' },
      { id: '4', name: 'SPED Fiscal', type: 'sped', status: 'received', uploadDate: '2024-01-20', period: '2019-2023' }
    ],
    timeline: [
      { id: '1', date: '2024-01-15', type: 'case_opened', description: 'Caso aberto para análise', status: 'completed' },
      { id: '2', date: '2024-01-16', type: 'documents_requested', description: 'Documentos solicitados', status: 'completed' },
      { id: '3', date: '2024-01-25', type: 'calculation_completed', description: 'Cálculos em andamento', status: 'pending' }
    ],
    calculations: [
      {
        id: '1',
        taxType: 'PIS',
        period: '2019-2023',
        originalValue: 50000,
        correctedValue: 75000,
        recoveryValue: 25000,
        interest: 8000,
        penalties: 2000,
        status: 'calculated'
      },
      {
        id: '2',
        taxType: 'COFINS',
        period: '2019-2023',
        originalValue: 200000,
        correctedValue: 300000,
        recoveryValue: 100000,
        interest: 32000,
        penalties: 8000,
        status: 'calculated'
      }
    ],
    protocols: []
  },
  {
    id: '2',
    companyName: 'Hospital Regional Norte S.A.',
    cnpj: '98.765.432/0001-10',
    email: 'juridico@hospitalregional.com.br',
    phone: '(11) 2222-3333',
    companyType: 'sa',
    taxRegime: 'lucro_real',
    recoveryType: 'icms',
    status: 'approved',
    startDate: '2023-10-01',
    estimatedValue: 500000,
    recoveredValue: 480000,
    period: {
      startDate: '2018-01-01',
      endDate: '2022-12-31'
    },
    partner: 'Recuperação Fiscal Avançada',
    accountant: 'Carlos Tributário',
    lawyer: 'Dr. Pedro Fiscal',
    priority: 'medium',
    nextAction: 'Aguardar liberação do crédito',
    documents: [
      { id: '5', name: 'Cartão CNPJ', type: 'cnpj', status: 'approved', uploadDate: '2023-10-02' },
      { id: '6', name: 'Contrato Social', type: 'contrato_social', status: 'approved', uploadDate: '2023-10-02' },
      { id: '7', name: 'SPED Fiscal', type: 'sped', status: 'approved', uploadDate: '2023-10-05', period: '2018-2022' },
      { id: '8', name: 'Notas Fiscais', type: 'nfe', status: 'approved', uploadDate: '2023-10-10', period: '2018-2022' }
    ],
    timeline: [
      { id: '4', date: '2023-10-01', type: 'case_opened', description: 'Caso aberto', status: 'completed' },
      { id: '5', date: '2023-10-15', type: 'calculation_completed', description: 'Cálculos finalizados', status: 'completed' },
      { id: '6', date: '2023-11-01', type: 'protocol_submitted', description: 'Protocolo administrativo submetido', status: 'completed' },
      { id: '7', date: '2024-01-15', type: 'response_received', description: 'Resposta favorável recebida', status: 'completed' }
    ],
    calculations: [
      {
        id: '3',
        taxType: 'ICMS',
        period: '2018-2022',
        originalValue: 800000,
        correctedValue: 1200000,
        recoveryValue: 400000,
        interest: 64000,
        penalties: 16000,
        status: 'approved'
      }
    ],
    protocols: [
      {
        id: '1',
        type: 'administrative',
        number: 'SEFAZ-SP-2023-001234',
        submissionDate: '2023-11-01',
        status: 'approved',
        value: 480000
      }
    ]
  }
]

const companyTypeLabels = {
  mei: 'MEI',
  ltda: 'Ltda',
  sa: 'S.A.',
  eireli: 'EIRELI',
  cooperativa: 'Cooperativa'
}

const taxRegimeLabels = {
  simples: 'Simples Nacional',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real'
}

const recoveryTypeLabels = {
  icms: 'ICMS',
  pis_cofins: 'PIS/COFINS',
  irpj_csll: 'IRPJ/CSLL',
  inss: 'INSS',
  iss: 'ISS',
  multiple: 'Múltiplos Tributos'
}

const statusLabels = {
  initial_analysis: 'Análise Inicial',
  document_collection: 'Coleta de Documentos',
  calculation: 'Cálculos',
  administrative_submission: 'Protocolo Administrativo',
  judicial_process: 'Processo Judicial',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  completed: 'Concluído'
}

const statusColors = {
  initial_analysis: 'bg-blue-100 text-blue-800',
  document_collection: 'bg-yellow-100 text-yellow-800',
  calculation: 'bg-orange-100 text-orange-800',
  administrative_submission: 'bg-purple-100 text-purple-800',
  judicial_process: 'bg-indigo-100 text-indigo-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800'
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
  approved: 'Aprovado'
}

const documentStatusColors = {
  pending: 'bg-gray-100 text-gray-800',
  received: 'bg-blue-100 text-blue-800',
  analyzed: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800'
}

export const TaxRecovery: React.FC = () => {
  const permissions = usePermissions()
  const [cases] = useState<TaxRecoveryCase[]>(mockCases)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [recoveryTypeFilter, setRecoveryTypeFilter] = useState<string>('all')
  const [selectedCase, setSelectedCase] = useState<TaxRecoveryCase | null>(null)

  const filteredCases = cases.filter(taxCase => {
    const matchesSearch = taxCase.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taxCase.cnpj.includes(searchTerm) ||
                         taxCase.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || taxCase.status === statusFilter
    const matchesRecoveryType = recoveryTypeFilter === 'all' || taxCase.recoveryType === recoveryTypeFilter
    return matchesSearch && matchesStatus && matchesRecoveryType
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleViewCase = (taxCase: TaxRecoveryCase) => {
    setSelectedCase(taxCase)
  }

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'case_opened':
        return <CheckCircle className="text-blue-500" size={16} />
      case 'documents_requested':
        return <FileText className="text-yellow-500" size={16} />
      case 'calculation_completed':
        return <Calculator className="text-purple-500" size={16} />
      case 'protocol_submitted':
        return <Building className="text-orange-500" size={16} />
      case 'response_received':
        return <AlertCircle className="text-indigo-500" size={16} />
      case 'payment_received':
        return <DollarSign className="text-green-500" size={16} />
      default:
        return <Clock className="text-gray-400" size={16} />
    }
  }

  if (!permissions.hasPermission('activities.partners.view')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calculator className="mx-auto h-12 w-12 text-gray-400" />
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
        <h1 className="text-2xl font-bold text-gray-900">Recuperação Tributária PJ</h1>
        <p className="text-gray-600">Gestão de processos de recuperação de tributos para pessoas jurídicas em parceria</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Aprovados</p>
              <p className="text-2xl font-bold text-gray-900">{cases.filter(c => c.status === 'approved').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Estimado</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(cases.reduce((sum, c) => sum + c.estimatedValue, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Recuperado</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(cases.reduce((sum, c) => sum + (c.recoveredValue || 0), 0))}
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
            <option value="calculation">Cálculos</option>
            <option value="administrative_submission">Protocolo Administrativo</option>
            <option value="judicial_process">Processo Judicial</option>
            <option value="approved">Aprovado</option>
            <option value="completed">Concluído</option>
            <option value="rejected">Rejeitado</option>
          </select>
          <select
            value={recoveryTypeFilter}
            onChange={(e) => setRecoveryTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tributos</option>
            <option value="icms">ICMS</option>
            <option value="pis_cofins">PIS/COFINS</option>
            <option value="irpj_csll">IRPJ/CSLL</option>
            <option value="inss">INSS</option>
            <option value="iss">ISS</option>
            <option value="multiple">Múltiplos Tributos</option>
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
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo/Regime
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tributo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valores
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Período
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parceiro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCases.map((taxCase) => (
              <tr key={taxCase.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{taxCase.companyName}</div>
                    <div className="text-sm text-gray-500">{taxCase.cnpj}</div>
                    <div className="text-sm text-gray-500">{taxCase.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{companyTypeLabels[taxCase.companyType]}</div>
                  <div className="text-sm text-gray-500">{taxRegimeLabels[taxCase.taxRegime]}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {recoveryTypeLabels[taxCase.recoveryType]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[taxCase.status]}`}>
                    {statusLabels[taxCase.status]}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{taxCase.nextAction}</div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${priorityColors[taxCase.priority]}`}>
                    {priorityLabels[taxCase.priority]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Est: {formatCurrency(taxCase.estimatedValue)}</div>
                  {taxCase.recoveredValue && (
                    <div className="text-sm text-green-600">Rec: {formatCurrency(taxCase.recoveredValue)}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{new Date(taxCase.period.startDate).getFullYear()}</div>
                  <div>até {new Date(taxCase.period.endDate).getFullYear()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{taxCase.accountant}</div>
                  <div className="text-sm text-gray-500">{taxCase.partner}</div>
                  {taxCase.lawyer && (
                    <div className="text-sm text-gray-500">{taxCase.lawyer}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleViewCase(taxCase)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selectedCase.companyName}</h2>
                <p className="text-gray-600">{recoveryTypeLabels[selectedCase.recoveryType]}</p>
                <p className="text-gray-500">{selectedCase.cnpj} - {selectedCase.email}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      <span className="text-gray-600">Tipo Empresa:</span>
                      <span className="text-gray-900">{companyTypeLabels[selectedCase.companyType]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Regime:</span>
                      <span className="text-gray-900">{taxRegimeLabels[selectedCase.taxRegime]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Estimado:</span>
                      <span className="text-gray-900">{formatCurrency(selectedCase.estimatedValue)}</span>
                    </div>
                    {selectedCase.recoveredValue && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor Recuperado:</span>
                        <span className="text-green-600">{formatCurrency(selectedCase.recoveredValue)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Período:</span>
                      <span className="text-gray-900">
                        {new Date(selectedCase.period.startDate).getFullYear()} - {new Date(selectedCase.period.endDate).getFullYear()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contador:</span>
                      <span className="text-gray-900">{selectedCase.accountant}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parceiro:</span>
                      <span className="text-gray-900">{selectedCase.partner}</span>
                    </div>
                    {selectedCase.lawyer && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Advogado:</span>
                        <span className="text-gray-900">{selectedCase.lawyer}</span>
                      </div>
                    )}
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
                          <div>
                            <span className="text-sm text-gray-900">{doc.name}</span>
                            {doc.period && (
                              <div className="text-xs text-gray-500">{doc.period}</div>
                            )}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${documentStatusColors[doc.status]}`}>
                          {documentStatusLabels[doc.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Protocolos */}
                {selectedCase.protocols.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Protocolos</h3>
                    <div className="space-y-2">
                      {selectedCase.protocols.map((protocol) => (
                        <div key={protocol.id} className="p-3 bg-gray-50 rounded">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{protocol.number}</div>
                              <div className="text-xs text-gray-500">
                                {protocol.type === 'administrative' ? 'Administrativo' : 'Judicial'}
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              protocol.status === 'approved' ? 'bg-green-100 text-green-800' :
                              protocol.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {protocol.status === 'approved' ? 'Aprovado' :
                               protocol.status === 'rejected' ? 'Rejeitado' :
                               protocol.status === 'under_review' ? 'Em Análise' :
                               protocol.status === 'appealed' ? 'Recurso' : 'Submetido'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-900">{formatCurrency(protocol.value)}</div>
                          <div className="text-xs text-gray-500">
                            Submetido em {new Date(protocol.submissionDate).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cálculos */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Cálculos Tributários</h3>
                <div className="space-y-3">
                  {selectedCase.calculations.map((calc) => (
                    <div key={calc.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{calc.taxType}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          calc.status === 'approved' ? 'bg-green-100 text-green-800' :
                          calc.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          calc.status === 'calculated' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {calc.status === 'approved' ? 'Aprovado' :
                           calc.status === 'reviewed' ? 'Revisado' :
                           calc.status === 'calculated' ? 'Calculado' : 'Rascunho'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{calc.period}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor Original:</span>
                          <span className="text-gray-900">{formatCurrency(calc.originalValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor Corrigido:</span>
                          <span className="text-gray-900">{formatCurrency(calc.correctedValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Recuperação:</span>
                          <span className="text-green-600 font-medium">{formatCurrency(calc.recoveryValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Juros:</span>
                          <span className="text-gray-900">{formatCurrency(calc.interest)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Multas:</span>
                          <span className="text-gray-900">{formatCurrency(calc.penalties)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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