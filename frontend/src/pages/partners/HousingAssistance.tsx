import React, { useState } from 'react'
import { Home, MapPin, DollarSign, Calendar, Users, Search, Filter, Plus, Eye, Edit, Trash2, CheckCircle, Clock, AlertCircle, Star } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

interface HousingApplication {
  id: string
  residentName: string
  cpf: string
  email: string
  phone: string
  medicalProgram: string
  hospital: string
  residencyYear: number
  specialty: string
  status: 'application_review' | 'document_verification' | 'property_search' | 'property_visit' | 'contract_negotiation' | 'approved' | 'rejected' | 'active' | 'completed'
  applicationDate: string
  preferredLocation: string
  maxBudget: number
  propertyType: 'apartment' | 'house' | 'shared' | 'studio'
  roommates?: number
  partner: string
  realtor: string
  priority: 'low' | 'medium' | 'high'
  properties: Property[]
  documents: Document[]
  timeline: TimelineEvent[]
  contractDetails?: ContractDetails
}

interface Property {
  id: string
  address: string
  neighborhood: string
  type: 'apartment' | 'house' | 'shared' | 'studio'
  bedrooms: number
  bathrooms: number
  area: number
  rent: number
  deposit: number
  utilities: number
  furnished: boolean
  petFriendly: boolean
  nearHospital: boolean
  distanceToHospital: number
  rating: number
  photos: string[]
  status: 'available' | 'visited' | 'interested' | 'selected' | 'unavailable'
  visitDate?: string
  notes?: string
}

interface Document {
  id: string
  name: string
  type: 'identity' | 'cpf' | 'income_proof' | 'residency_certificate' | 'hospital_letter' | 'guarantor_docs' | 'other'
  status: 'pending' | 'received' | 'verified' | 'approved'
  uploadDate?: string
}

interface ContractDetails {
  propertyId: string
  startDate: string
  endDate: string
  monthlyRent: number
  deposit: number
  utilities: number
  contractSigned: boolean
  moveInDate?: string
}

interface TimelineEvent {
  id: string
  date: string
  type: 'application_submitted' | 'documents_requested' | 'property_suggested' | 'property_visited' | 'contract_signed' | 'move_in'
  description: string
  status: 'completed' | 'pending' | 'cancelled'
}

const mockApplications: HousingApplication[] = [
  {
    id: '1',
    residentName: 'Dr. Pedro Oliveira',
    cpf: '123.456.789-00',
    email: 'pedro.oliveira@email.com',
    phone: '(11) 99999-9999',
    medicalProgram: 'Residência em Cardiologia',
    hospital: 'Hospital das Clínicas',
    residencyYear: 2,
    specialty: 'Cardiologia',
    status: 'property_search',
    applicationDate: '2024-01-15',
    preferredLocation: 'Próximo ao Hospital das Clínicas',
    maxBudget: 2500,
    propertyType: 'apartment',
    partner: 'Moradia Médica Imóveis',
    realtor: 'Ana Imobiliária',
    priority: 'high',
    properties: [
      {
        id: '1',
        address: 'Rua Dr. Arnaldo, 455',
        neighborhood: 'Cerqueira César',
        type: 'apartment',
        bedrooms: 1,
        bathrooms: 1,
        area: 45,
        rent: 2200,
        deposit: 2200,
        utilities: 300,
        furnished: true,
        petFriendly: false,
        nearHospital: true,
        distanceToHospital: 0.5,
        rating: 4.5,
        photos: [],
        status: 'interested',
        visitDate: '2024-01-20',
        notes: 'Apartamento bem localizado, mobiliado'
      },
      {
        id: '2',
        address: 'Av. Paulista, 1000',
        neighborhood: 'Bela Vista',
        type: 'studio',
        bedrooms: 0,
        bathrooms: 1,
        area: 30,
        rent: 1800,
        deposit: 1800,
        utilities: 250,
        furnished: true,
        petFriendly: true,
        nearHospital: true,
        distanceToHospital: 1.2,
        rating: 4.0,
        photos: [],
        status: 'available',
        notes: 'Studio compacto, aceita pets'
      }
    ],
    documents: [
      { id: '1', name: 'RG', type: 'identity', status: 'approved', uploadDate: '2024-01-16' },
      { id: '2', name: 'CPF', type: 'cpf', status: 'approved', uploadDate: '2024-01-16' },
      { id: '3', name: 'Comprovante de Renda', type: 'income_proof', status: 'verified', uploadDate: '2024-01-17' },
      { id: '4', name: 'Carta do Hospital', type: 'hospital_letter', status: 'approved', uploadDate: '2024-01-18' }
    ],
    timeline: [
      { id: '1', date: '2024-01-15', type: 'application_submitted', description: 'Aplicação submetida', status: 'completed' },
      { id: '2', date: '2024-01-16', type: 'documents_requested', description: 'Documentos solicitados', status: 'completed' },
      { id: '3', date: '2024-01-18', type: 'property_suggested', description: 'Propriedades sugeridas', status: 'completed' },
      { id: '4', date: '2024-01-20', type: 'property_visited', description: 'Visita agendada', status: 'pending' }
    ]
  },
  {
    id: '2',
    residentName: 'Dra. Carla Santos',
    cpf: '987.654.321-00',
    email: 'carla.santos@email.com',
    phone: '(11) 88888-8888',
    medicalProgram: 'Residência em Pediatria',
    hospital: 'Hospital Infantil',
    residencyYear: 1,
    specialty: 'Pediatria',
    status: 'active',
    applicationDate: '2023-12-01',
    preferredLocation: 'Próximo ao Hospital Infantil',
    maxBudget: 2000,
    propertyType: 'shared',
    roommates: 1,
    partner: 'Residência Compartilhada',
    realtor: 'Carlos Corretor',
    priority: 'medium',
    properties: [
      {
        id: '3',
        address: 'Rua Augusta, 200',
        neighborhood: 'Consolação',
        type: 'shared',
        bedrooms: 2,
        bathrooms: 2,
        area: 60,
        rent: 1500,
        deposit: 1500,
        utilities: 200,
        furnished: true,
        petFriendly: false,
        nearHospital: true,
        distanceToHospital: 0.8,
        rating: 4.2,
        photos: [],
        status: 'selected',
        notes: 'Apartamento compartilhado com outro residente'
      }
    ],
    documents: [
      { id: '5', name: 'RG', type: 'identity', status: 'approved', uploadDate: '2023-12-02' },
      { id: '6', name: 'CPF', type: 'cpf', status: 'approved', uploadDate: '2023-12-02' },
      { id: '7', name: 'Comprovante de Renda', type: 'income_proof', status: 'approved', uploadDate: '2023-12-03' },
      { id: '8', name: 'Carta do Hospital', type: 'hospital_letter', status: 'approved', uploadDate: '2023-12-03' }
    ],
    timeline: [
      { id: '5', date: '2023-12-01', type: 'application_submitted', description: 'Aplicação submetida', status: 'completed' },
      { id: '6', date: '2023-12-05', type: 'property_visited', description: 'Propriedade visitada', status: 'completed' },
      { id: '7', date: '2023-12-10', type: 'contract_signed', description: 'Contrato assinado', status: 'completed' },
      { id: '8', date: '2023-12-15', type: 'move_in', description: 'Mudança realizada', status: 'completed' }
    ],
    contractDetails: {
      propertyId: '3',
      startDate: '2023-12-15',
      endDate: '2024-12-15',
      monthlyRent: 1500,
      deposit: 1500,
      utilities: 200,
      contractSigned: true,
      moveInDate: '2023-12-15'
    }
  }
]

const statusLabels = {
  application_review: 'Análise da Aplicação',
  document_verification: 'Verificação de Documentos',
  property_search: 'Busca de Propriedades',
  property_visit: 'Visita de Propriedades',
  contract_negotiation: 'Negociação de Contrato',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  active: 'Ativo',
  completed: 'Concluído'
}

const statusColors = {
  application_review: 'bg-blue-100 text-blue-800',
  document_verification: 'bg-yellow-100 text-yellow-800',
  property_search: 'bg-orange-100 text-orange-800',
  property_visit: 'bg-purple-100 text-purple-800',
  contract_negotiation: 'bg-indigo-100 text-indigo-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800'
}

const propertyTypeLabels = {
  apartment: 'Apartamento',
  house: 'Casa',
  shared: 'Compartilhado',
  studio: 'Studio'
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
  verified: 'Verificado',
  approved: 'Aprovado'
}

const documentStatusColors = {
  pending: 'bg-gray-100 text-gray-800',
  received: 'bg-blue-100 text-blue-800',
  verified: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800'
}

export const HousingAssistance: React.FC = () => {
  const permissions = usePermissions()
  const [applications] = useState<HousingApplication[]>(mockApplications)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [hospitalFilter, setHospitalFilter] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] = useState<HousingApplication | null>(null)

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.cpf.includes(searchTerm) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesHospital = hospitalFilter === 'all' || app.hospital === hospitalFilter
    return matchesSearch && matchesStatus && matchesHospital
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleViewApplication = (application: HousingApplication) => {
    setSelectedApplication(application)
  }

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'application_submitted':
        return <CheckCircle className="text-blue-500" size={16} />
      case 'documents_requested':
        return <AlertCircle className="text-yellow-500" size={16} />
      case 'property_suggested':
        return <Home className="text-purple-500" size={16} />
      case 'property_visited':
        return <Eye className="text-orange-500" size={16} />
      case 'contract_signed':
        return <CheckCircle className="text-green-500" size={16} />
      case 'move_in':
        return <Home className="text-green-500" size={16} />
      default:
        return <Clock className="text-gray-400" size={16} />
    }
  }

  if (!permissions.hasPermission('activities.partners.view')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
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
        <h1 className="text-2xl font-bold text-gray-900">Auxílio Moradia Residência Médica</h1>
        <p className="text-gray-600">Gestão de auxílio habitacional para residentes médicos em parceria</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aplicações Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{applications.filter(a => !['completed', 'rejected'].includes(a.status)).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Home className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Moradias Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{applications.filter(a => a.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Orçamento Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(applications.reduce((sum, a) => sum + a.maxBudget, 0) / applications.length)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concluídos</p>
              <p className="text-2xl font-bold text-gray-900">{applications.filter(a => a.status === 'completed').length}</p>
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
              placeholder="Buscar aplicações..."
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
            <option value="application_review">Análise da Aplicação</option>
            <option value="document_verification">Verificação de Documentos</option>
            <option value="property_search">Busca de Propriedades</option>
            <option value="property_visit">Visita de Propriedades</option>
            <option value="contract_negotiation">Negociação de Contrato</option>
            <option value="approved">Aprovado</option>
            <option value="active">Ativo</option>
            <option value="completed">Concluído</option>
            <option value="rejected">Rejeitado</option>
          </select>
          <select
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os hospitais</option>
            <option value="Hospital das Clínicas">Hospital das Clínicas</option>
            <option value="Hospital Infantil">Hospital Infantil</option>
          </select>
        </div>
        {permissions.hasPermission('activities.partners.create') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus size={20} />
            <span>Nova Aplicação</span>
          </button>
        )}
      </div>

      {/* Lista de Aplicações */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Residente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Programa/Hospital
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo/Orçamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localização
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Corretor
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredApplications.map((application) => (
              <tr key={application.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{application.residentName}</div>
                    <div className="text-sm text-gray-500">{application.cpf}</div>
                    <div className="text-sm text-gray-500">{application.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{application.medicalProgram}</div>
                  <div className="text-sm text-gray-500">{application.hospital}</div>
                  <div className="text-sm text-gray-500">R{application.residencyYear} - {application.specialty}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                    {statusLabels[application.status]}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${priorityColors[application.priority]}`}>
                    {priorityLabels[application.priority]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{propertyTypeLabels[application.propertyType]}</div>
                  <div className="text-sm text-gray-500">{formatCurrency(application.maxBudget)}</div>
                  {application.roommates && (
                    <div className="text-sm text-gray-500">{application.roommates} colegas</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {application.preferredLocation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{application.realtor}</div>
                  <div className="text-sm text-gray-500">{application.partner}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleViewApplication(application)}
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

      {/* Modal de visualização de aplicação */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selectedApplication.residentName}</h2>
                <p className="text-gray-600">{selectedApplication.medicalProgram}</p>
                <p className="text-gray-500">{selectedApplication.hospital} - R{selectedApplication.residencyYear}</p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informações da Aplicação */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Informações da Aplicação</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedApplication.status]}`}>
                        {statusLabels[selectedApplication.status]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prioridade:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[selectedApplication.priority]}`}>
                        {priorityLabels[selectedApplication.priority]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="text-gray-900">{propertyTypeLabels[selectedApplication.propertyType]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Orçamento:</span>
                      <span className="text-gray-900">{formatCurrency(selectedApplication.maxBudget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Localização:</span>
                      <span className="text-gray-900">{selectedApplication.preferredLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Corretor:</span>
                      <span className="text-gray-900">{selectedApplication.realtor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parceiro:</span>
                      <span className="text-gray-900">{selectedApplication.partner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aplicação:</span>
                      <span className="text-gray-900">{new Date(selectedApplication.applicationDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                {/* Documentos */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Documentos</h3>
                  <div className="space-y-2">
                    {selectedApplication.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-900">{doc.name}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${documentStatusColors[doc.status]}`}>
                          {documentStatusLabels[doc.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Propriedades */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Propriedades</h3>
                <div className="space-y-3">
                  {selectedApplication.properties.map((property) => (
                    <div key={property.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{property.address}</h4>
                          <p className="text-xs text-gray-500">{property.neighborhood}</p>
                        </div>
                        <div className="flex items-center">
                          <Star className="text-yellow-400 mr-1" size={12} />
                          <span className="text-xs text-gray-600">{property.rating}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                        <div>{property.bedrooms} quarto(s)</div>
                        <div>{property.bathrooms} banheiro(s)</div>
                        <div>{property.area}m²</div>
                        <div>{property.distanceToHospital}km do hospital</div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-2">
                        {formatCurrency(property.rent)}/mês
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {property.furnished && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            Mobiliado
                          </span>
                        )}
                        {property.petFriendly && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Pet Friendly
                          </span>
                        )}
                        {property.nearHospital && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            Próximo Hospital
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Status: {property.status === 'available' ? 'Disponível' : 
                                property.status === 'visited' ? 'Visitado' :
                                property.status === 'interested' ? 'Interessado' :
                                property.status === 'selected' ? 'Selecionado' : 'Indisponível'}
                      </div>
                      {property.notes && (
                        <div className="text-xs text-gray-600 mt-1">{property.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-3">
                  {selectedApplication.timeline.map((event) => (
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

                {/* Detalhes do Contrato */}
                {selectedApplication.contractDetails && (
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-900 mb-3">Contrato Ativo</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Aluguel:</span>
                          <span className="text-gray-900">{formatCurrency(selectedApplication.contractDetails.monthlyRent)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Início:</span>
                          <span className="text-gray-900">{new Date(selectedApplication.contractDetails.startDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fim:</span>
                          <span className="text-gray-900">{new Date(selectedApplication.contractDetails.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="text-green-600">
                            {selectedApplication.contractDetails.contractSigned ? 'Assinado' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>
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