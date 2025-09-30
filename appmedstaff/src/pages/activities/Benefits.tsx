import React, { useState } from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import { 
  Heart, 
  Utensils, 
  Home, 
  Users, 
  TrendingUp,
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
  Phone,
  Mail,
  MapPin,
  Star,
  Award,
  Shield
} from 'lucide-react'

interface Benefit {
  id: string
  type: 'duo_gourmet' | 'medstaff_saude' | 'apoio_domestico'
  clientName: string
  clientCpf: string
  status: 'active' | 'inactive' | 'pending' | 'cancelled' | 'suspended'
  startDate: string
  endDate?: string
  monthlyValue: number
  responsiblePerson: string
  lastUpdate: string
  details: any
}

interface DuoGourmetDetails {
  restaurantPartners: number
  monthlyUsage: number
  favoriteRestaurants: string[]
  discountPercentage: number
}

interface MedStaffSaudeDetails {
  planType: 'basico' | 'intermediario' | 'premium'
  dependents: number
  medicalNetwork: string[]
  lastConsultation?: string
  preventiveExams: string[]
}

interface ApoioDomesticoDetails {
  serviceType: 'limpeza' | 'cozinha' | 'cuidador' | 'completo'
  frequency: 'semanal' | 'quinzenal' | 'mensal'
  hoursPerVisit: number
  professionalName?: string
  rating: number
  lastService?: string
}

const Benefits: React.FC = () => {
  const permissions = usePermissions()
  const [activeTab, setActiveTab] = useState<'duo_gourmet' | 'medstaff_saude' | 'apoio_domestico' | 'overview'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Mock data
  const mockBenefits: Benefit[] = [
    {
      id: '1',
      type: 'duo_gourmet',
      clientName: 'Dr. João Silva',
      clientCpf: '123.456.789-00',
      status: 'active',
      startDate: '2024-01-15',
      monthlyValue: 89.90,
      responsiblePerson: 'Ana Costa',
      lastUpdate: '2024-01-20T14:30:00Z',
      details: {
        restaurantPartners: 150,
        monthlyUsage: 12,
        favoriteRestaurants: ['Outback', 'Spoleto', 'Subway'],
        discountPercentage: 30
      } as DuoGourmetDetails
    },
    {
      id: '2',
      type: 'medstaff_saude',
      clientName: 'Dra. Maria Santos',
      clientCpf: '987.654.321-00',
      status: 'active',
      startDate: '2024-01-10',
      monthlyValue: 299.90,
      responsiblePerson: 'Carlos Lima',
      lastUpdate: '2024-01-22T16:00:00Z',
      details: {
        planType: 'premium',
        dependents: 2,
        medicalNetwork: ['Hospital Sírio-Libanês', 'Hospital Albert Einstein'],
        lastConsultation: '2024-01-18',
        preventiveExams: ['Check-up Anual', 'Exames Laboratoriais']
      } as MedStaffSaudeDetails
    },
    {
      id: '3',
      type: 'apoio_domestico',
      clientName: 'Dr. Pedro Oliveira',
      clientCpf: '456.789.123-00',
      status: 'active',
      startDate: '2024-01-05',
      monthlyValue: 450.00,
      responsiblePerson: 'Lucia Ferreira',
      lastUpdate: '2024-01-21T10:15:00Z',
      details: {
        serviceType: 'completo',
        frequency: 'semanal',
        hoursPerVisit: 4,
        professionalName: 'Rosa Silva',
        rating: 4.8,
        lastService: '2024-01-19'
      } as ApoioDomesticoDetails
    }
  ]

  if (!permissions.canViewBenefitsActivities) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <Heart className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Acesso Negado</h3>
          <p className="text-gray-500">Você não tem permissão para visualizar Med Benefícios.</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      suspended: 'bg-orange-100 text-orange-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      active: CheckCircle,
      pending: Clock,
      cancelled: AlertCircle,
      suspended: AlertCircle
    }
    const Icon = icons[status as keyof typeof icons] || Clock
    return <Icon className="h-4 w-4" />
  }

  const getBenefitIcon = (type: string) => {
    const icons = {
      duo_gourmet: Utensils,
      medstaff_saude: Heart,
      apoio_domestico: Home
    }
    return icons[type as keyof typeof icons] || Heart
  }

  const getBenefitColor = (type: string) => {
    const colors = {
      duo_gourmet: 'bg-orange-100 text-orange-600',
      medstaff_saude: 'bg-red-100 text-red-600',
      apoio_domestico: 'bg-blue-100 text-blue-600'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600'
  }

  const getBenefitName = (type: string) => {
    const names = {
      duo_gourmet: 'Duo Gourmet',
      medstaff_saude: 'MedStaff + Saúde',
      apoio_domestico: 'Apoio Doméstico'
    }
    return names[type as keyof typeof names] || type
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

  const filteredBenefits = mockBenefits.filter(benefit => {
    const matchesSearch = benefit.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         benefit.clientCpf.includes(searchTerm)
    const matchesStatus = filterStatus === 'all' || benefit.status === filterStatus
    const matchesTab = activeTab === 'overview' || benefit.type === activeTab
    return matchesSearch && matchesStatus && matchesTab
  })

  const getOverviewStats = () => {
    const total = mockBenefits.length
    const active = mockBenefits.filter(b => b.status === 'active').length
    const revenue = mockBenefits.reduce((sum, b) => sum + b.monthlyValue, 0)
    const duoGourmet = mockBenefits.filter(b => b.type === 'duo_gourmet').length
    const medStaffSaude = mockBenefits.filter(b => b.type === 'medstaff_saude').length
    const apoioDomestico = mockBenefits.filter(b => b.type === 'apoio_domestico').length

    return { total, active, revenue, duoGourmet, medStaffSaude, apoioDomestico }
  }

  const stats = getOverviewStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Med Benefícios</h1>
          <p className="text-gray-600">Gestão de benefícios exclusivos para profissionais da saúde</p>
        </div>
        {permissions.canCreateBenefitsActivities && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Benefício
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Benefícios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Award className="h-6 w-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Benefícios Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
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
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+22%</span>
            <span className="text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfação</p>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+0.2</span>
            <span className="text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* Benefit Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Duo Gourmet</h3>
              <p className="text-sm text-gray-600">Descontos em restaurantes</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Clientes ativos:</span>
              <span className="font-medium">{stats.duoGourmet}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Parceiros:</span>
              <span className="font-medium">150+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Desconto médio:</span>
              <span className="font-medium">30%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500 p-3 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">MedStaff + Saúde</h3>
              <p className="text-sm text-gray-600">Plano de saúde exclusivo</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Clientes ativos:</span>
              <span className="font-medium">{stats.medStaffSaude}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Rede credenciada:</span>
              <span className="font-medium">500+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cobertura:</span>
              <span className="font-medium">Nacional</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Apoio Doméstico</h3>
              <p className="text-sm text-gray-600">Serviços domiciliares</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Clientes ativos:</span>
              <span className="font-medium">{stats.apoioDomestico}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Profissionais:</span>
              <span className="font-medium">50+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avaliação média:</span>
              <span className="font-medium">4.8⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Award },
              { id: 'duo_gourmet', label: 'Duo Gourmet', icon: Utensils },
              { id: 'medstaff_saude', label: 'MedStaff + Saúde', icon: Heart },
              { id: 'apoio_domestico', label: 'Apoio Doméstico', icon: Home }
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
                  placeholder="Buscar por cliente ou CPF..."
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
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="pending">Pendente</option>
                <option value="cancelled">Cancelado</option>
                <option value="suspended">Suspenso</option>
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
          <div className="space-y-4">
            {filteredBenefits.map((benefit) => {
              const BenefitIcon = getBenefitIcon(benefit.type)
              return (
                <div key={benefit.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${getBenefitColor(benefit.type)}`}>
                          <BenefitIcon className="h-4 w-4" />
                        </div>
                        <h3 className="font-medium text-gray-900">{benefit.clientName}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {getBenefitName(benefit.type)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(benefit.status)}`}>
                          {getStatusIcon(benefit.status)}
                          <span className="ml-1">{benefit.status}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                        <div>CPF: {benefit.clientCpf}</div>
                        <div>Valor: {formatCurrency(benefit.monthlyValue)}</div>
                        <div>Início: {formatDate(benefit.startDate)}</div>
                        <div>Responsável: {benefit.responsiblePerson}</div>
                      </div>
                      
                      {/* Benefit-specific details */}
                      {benefit.type === 'duo_gourmet' && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded">
                            {(benefit.details as DuoGourmetDetails).restaurantPartners} parceiros
                          </span>
                          <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded">
                            {(benefit.details as DuoGourmetDetails).monthlyUsage} usos/mês
                          </span>
                          <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded">
                            {(benefit.details as DuoGourmetDetails).discountPercentage}% desconto
                          </span>
                        </div>
                      )}
                      
                      {benefit.type === 'medstaff_saude' && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-red-50 text-red-700 rounded">
                            Plano {(benefit.details as MedStaffSaudeDetails).planType}
                          </span>
                          <span className="px-2 py-1 bg-red-50 text-red-700 rounded">
                            {(benefit.details as MedStaffSaudeDetails).dependents} dependentes
                          </span>
                          {(benefit.details as MedStaffSaudeDetails).lastConsultation && (
                            <span className="px-2 py-1 bg-red-50 text-red-700 rounded">
                              Última consulta: {formatDate((benefit.details as MedStaffSaudeDetails).lastConsultation!)}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {benefit.type === 'apoio_domestico' && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            {(benefit.details as ApoioDomesticoDetails).serviceType}
                          </span>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            {(benefit.details as ApoioDomesticoDetails).frequency}
                          </span>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            {(benefit.details as ApoioDomesticoDetails).hoursPerVisit}h por visita
                          </span>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            ⭐ {(benefit.details as ApoioDomesticoDetails).rating}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Mail className="h-4 w-4" />
                      </button>
                      {permissions.canUpdateBenefitsActivities && (
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {permissions.canDeleteBenefitsActivities && (
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredBenefits.length === 0 && (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum benefício encontrado</h3>
              <p className="text-gray-500">
                Tente ajustar os filtros ou criar um novo benefício.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Benefits