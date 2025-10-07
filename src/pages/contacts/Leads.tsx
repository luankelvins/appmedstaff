import React, { useState, useEffect } from 'react'
import { 
  Target, 
  Plus, 
  Filter, 
  Search, 
  BarChart3, 
  Clock, 
  Users, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  List,
  Columns,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Calendar,
  Edit,
  Eye,
  Trash2
} from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'
import LeadForm from '../../components/CRM/LeadForm'
import { 
  LeadForm as LeadFormType, 
  LeadPipelineStage,
  LeadStatus
} from '../../types/crm'
import { ContactLead } from '../../services/leadsService'
import leadsService from '../../services/leadsService'

const Leads: React.FC = () => {
  const { hasPermission } = usePermissions()
  const [leads, setLeads] = useState<ContactLead[]>([])
  const [loading, setLoading] = useState(true)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStage, setFilterStage] = useState<LeadPipelineStage | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'qualificado' | 'nao_qualificado' | 'nao_definido' | 'all'>('all')
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'quarter' | 'custom'>('all')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [disqualificationStats, setDisqualificationStats] = useState<Record<string, number>>({})
  const [stats, setStats] = useState({
    total: 0,
    qualificado: 0,
    nao_qualificado: 0,
    nao_definido: 0,
    taxaQualificacao: 0,
    novosHoje: 0,
    novosEstaSemana: 0,
    novosEsteMes: 0
  })

  // Permissões
  const canCreate = hasPermission('contacts.create')
  const canEdit = hasPermission('contacts.update')
  const canDelete = hasPermission('contacts.delete')
  const canView = hasPermission('contacts.read')

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      setLoading(true)
      
      // Carregar leads
      const contactLeads = await leadsService.getContactLeads()
      setLeads(contactLeads)
      
      // Carregar estatísticas do banco
      const leadsStats = await leadsService.getLeadsStats()
      setStats(leadsStats)
      
      // Carregar estatísticas de desqualificação
      const disqualStats = await leadsService.getDisqualificationStats()
      setDisqualificationStats(disqualStats)
    } catch (error) {
      console.error('Erro ao carregar leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLeadSubmit = async (leadData: LeadFormType) => {
    try {
      await leadsService.createLead(leadData)
      await loadLeads()
      setShowLeadForm(false)
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      alert('Erro ao criar lead. Tente novamente.')
    }
  }

  const handleShowDetails = (lead: ContactLead) => {
    setSelectedLead(lead)
    setShowDetailsModal(true)
  }

  const handleShowEdit = (lead: ContactLead) => {
    setSelectedLead(lead)
    setShowEditModal(true)
  }

  const handleCloseModals = () => {
    setSelectedLead(null)
    setShowDetailsModal(false)
    setShowEditModal(false)
  }

  const handleEditSubmit = async (leadData: LeadFormType) => {
    if (!selectedLead) return
    
    try {
      await leadsService.updateLead(selectedLead.id, leadData)
      await loadLeads()
      handleCloseModals()
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
      alert('Erro ao atualizar lead. Tente novamente.')
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return
    
    try {
      // Implementar lógica de exclusão
      console.log('Excluindo lead:', leadId)
      await loadLeads()
    } catch (error) {
      console.error('Erro ao excluir lead:', error)
    }
  }

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualificado': return 'bg-green-100 text-green-800'
      case 'nao_qualificado': return 'bg-red-100 text-red-800'
      case 'nao_definido': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Função para obter label do status
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'qualificado': return 'Qualificado'
      case 'nao_qualificado': return 'Não Qualificado'
      case 'nao_definido': return 'Não Definido'
      default: return status
    }
  }

  // Função para obter label da etapa do pipeline
  const getPipelineStageLabel = (stage?: LeadPipelineStage) => {
    if (!stage) return 'Não definido'
    
    switch (stage) {
      case 'novo_lead': return 'Novo Lead'
      case 'ligacao_1': return 'Ligação 1'
      case 'ligacao_2': return 'Ligação 2'
      case 'mensagem': return 'Mensagem'
      case 'recontato': return 'Recontato'
      case 'desfecho': return 'Desfecho'
      default: return stage
    }
  }

  // Função para obter cor da etapa do pipeline
  const getPipelineStageColor = (stage?: LeadPipelineStage) => {
    if (!stage) return 'bg-gray-100 text-gray-800'
    
    switch (stage) {
      case 'novo_lead': return 'bg-blue-100 text-blue-800'
      case 'ligacao_1': return 'bg-yellow-100 text-yellow-800'
      case 'ligacao_2': return 'bg-orange-100 text-orange-800'
      case 'mensagem': return 'bg-purple-100 text-purple-800'
      case 'recontato': return 'bg-indigo-100 text-indigo-800'
      case 'desfecho': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Função auxiliar para calcular períodos de tempo
  const getDateRange = (period: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (period) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) }
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)
        return { start: weekStart, end: weekEnd }
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        monthEnd.setHours(23, 59, 59, 999)
        return { start: monthStart, end: monthEnd }
      case 'quarter':
        const quarterMonth = Math.floor(today.getMonth() / 3) * 3
        const quarterStart = new Date(today.getFullYear(), quarterMonth, 1)
        const quarterEnd = new Date(today.getFullYear(), quarterMonth + 3, 0)
        quarterEnd.setHours(23, 59, 59, 999)
        return { start: quarterStart, end: quarterEnd }
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate)
          const end = new Date(customEndDate)
          end.setHours(23, 59, 59, 999)
          return { start, end }
        }
        return null
      default:
        return null
    }
  }

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.includes(searchTerm) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStage = filterStage === 'all' || lead.pipelineStage === filterStage
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus
    
    // Filtro por período
    let matchesPeriod = true
    if (filterPeriod !== 'all') {
      const dateRange = getDateRange(filterPeriod)
      if (dateRange && lead.createdAt) {
        const leadDate = new Date(lead.createdAt)
        matchesPeriod = leadDate >= dateRange.start && leadDate <= dateRange.end
      } else if (filterPeriod === 'custom' && (!customStartDate || !customEndDate)) {
        matchesPeriod = true // Se custom mas sem datas, não filtra
      } else {
        matchesPeriod = false
      }
    }
    
    return matchesSearch && matchesStage && matchesStatus && matchesPeriod
  })

  // Estatísticas vêm do banco via state (loadLeads)

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acesso Negado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Você não tem permissão para visualizar leads.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medstaff-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Gerencie seus leads e prospects</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowLeadForm(true)}
            className="bg-medstaff-primary text-white px-4 py-2 rounded-lg hover:bg-medstaff-primary-dark flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Novo Lead</span>
          </button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Leads</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Qualificados</p>
              <p className="text-2xl font-bold text-green-600">{stats.qualificado}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Não Qualificados</p>
              <p className="text-2xl font-bold text-red-600">{stats.nao_qualificado}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Não Definidos</p>
              <p className="text-2xl font-bold text-gray-600">{stats.nao_definido}</p>
            </div>
            <Clock className="h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Indicadores Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Qualificação</p>
              <p className="text-2xl font-bold text-purple-600">{stats.taxaQualificacao}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Novos Hoje</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.novosHoje}</p>
            </div>
            <Calendar className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Esta Semana</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.novosEstaSemana}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-cyan-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Este Mês</p>
              <p className="text-2xl font-bold text-teal-600">{stats.novosEsteMes}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-teal-500" />
          </div>
        </div>
      </div>

      {/* Dashboard de Motivos de Desqualificação */}
      {Object.keys(disqualificationStats).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Motivos de Desqualificação</h3>
              <p className="text-sm text-gray-600">Principais razões para desqualificação de leads</p>
            </div>
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(disqualificationStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([motivo, count]) => (
                <div key={motivo} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate" title={motivo}>
                        {motivo}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {((count / stats.nao_qualificado) * 100).toFixed(1)}% dos não qualificados
                      </p>
                    </div>
                    <div className="ml-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {count}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(count / Math.max(...Object.values(disqualificationStats))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {Object.keys(disqualificationStats).length > 6 && (
            <div className="mt-4 text-center">
              <button className="text-sm text-medstaff-primary hover:text-medstaff-primary-dark">
                Ver todos os motivos ({Object.keys(disqualificationStats).length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value as LeadPipelineStage | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
          >
            <option value="all">Todas as etapas</option>
            <option value="novo_lead">Novo Lead</option>
            <option value="ligacao_1">Ligação 1</option>
            <option value="ligacao_2">Ligação 2</option>
            <option value="mensagem">Mensagem</option>
            <option value="recontato">Recontato</option>
            <option value="desfecho">Desfecho</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'qualificado' | 'nao_qualificado' | 'nao_definido' | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="qualificado">Qualificado</option>
            <option value="nao_qualificado">Não Qualificado</option>
            <option value="nao_definido">Não Definido</option>
          </select>
          
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as 'all' | 'today' | 'week' | 'month' | 'quarter' | 'custom')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
          >
            <option value="all">Todos os períodos</option>
            <option value="today">Hoje</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mês</option>
            <option value="quarter">Este trimestre</option>
            <option value="custom">Período personalizado</option>
          </select>
          
          {filterPeriod === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent text-sm"
                placeholder="Data inicial"
              />
              <span className="text-gray-500">até</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent text-sm"
                placeholder="Data final"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter size={16} />
            <span>{filteredLeads.length} de {leads.length} leads</span>
          </div>
        </div>
      </div>

      {/* Lista de Leads */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum lead encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {leads.length === 0 
                ? 'Comece criando seu primeiro lead.' 
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etapa Pipeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-medstaff-primary flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          {lead.company && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Building className="h-3 w-3 mr-1" />
                              {lead.company}
                            </div>
                          )}
                          {lead.position && (
                            <div className="text-xs text-gray-400">{lead.position}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {lead.phone && (
                          <div className="text-sm text-gray-900 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {lead.phone}
                          </div>
                        )}
                        {lead.email && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {lead.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPipelineStageColor(lead.pipelineStage)}`}>
                        {getPipelineStageLabel(lead.pipelineStage)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(lead.city || lead.state) && (
                        <div className="text-sm text-gray-900 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {lead.city}{lead.city && lead.state && ', '}{lead.state}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.dataUltimoContato ? (
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(lead.dataUltimoContato).toLocaleDateString('pt-BR')}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleShowDetails(lead)}
                          className="text-medstaff-primary hover:text-medstaff-primary-dark"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleShowEdit(lead)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal do formulário de lead */}
      {showLeadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Novo Lead</h2>
                <button
                  onClick={() => setShowLeadForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
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

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalhes do Lead</h2>
                <p className="text-sm text-gray-500 mt-1">Informações completas do lead</p>
              </div>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* DADOS BÁSICOS */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
                  📋 Dados Básicos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nome Completo *</label>
                    <p className="text-sm font-medium text-gray-900">{selectedLead.name}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Telefone *</label>
                    <p className="text-sm text-gray-900">{selectedLead.phone}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">E-mail</label>
                    <p className="text-sm text-gray-900">{selectedLead.email || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Empresa</label>
                    <p className="text-sm text-gray-900">{selectedLead.company || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cargo</label>
                    <p className="text-sm text-gray-900">{selectedLead.position || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cidade</label>
                    <p className="text-sm text-gray-900">{selectedLead.city || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Estado</label>
                    <p className="text-sm text-gray-900">{selectedLead.state || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              {/* PRODUTOS DE INTERESSE */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500">
                  🎯 Produtos de Interesse
                </h3>
                <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
                  <div className="text-sm text-gray-900 space-y-2">
                    {selectedLead.notes ? (
                      // Se tiver produtos no notes, extrair e mostrar
                      selectedLead.notes.split('\n').map((line, index) => {
                        if (line.includes('Produtos de Interesse:')) {
                          const produtos = line.replace('Produtos de Interesse:', '').trim()
                          return produtos ? (
                            <div key={index} className="space-y-1">
                              {produtos.split(',').map((produto, idx) => (
                                <div key={idx} className="flex items-start">
                                  <span className="text-indigo-600 mr-2">✓</span>
                                  <span className="text-gray-800">{produto.trim()}</span>
                                </div>
                              ))}
                            </div>
                          ) : <p className="text-gray-500">Não informado</p>
                        }
                        return null
                      })
                    ) : (
                      <p className="text-gray-500">Não informado</p>
                    )}
                  </div>
                </div>
              </div>

              {/* INFORMAÇÕES ADICIONAIS */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-500">
                  ℹ️ Informações Adicionais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Origem do Lead</label>
                    <p className="text-sm text-gray-900">{selectedLead.source || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Detalhes da Origem</label>
                    <p className="text-sm text-gray-900">{(selectedLead as any).origem_detalhes || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Responsável</label>
                    <p className="text-sm text-gray-900">{(selectedLead as any).assigned_to_name || 'Não atribuído'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Etapa do Pipeline</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPipelineStageColor(selectedLead.pipelineStage)}`}>
                      {getPipelineStageLabel(selectedLead.pipelineStage)}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Criado em</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedLead.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {(selectedLead.lastContact || selectedLead.dataUltimoContato) && (
                    <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Último Contato</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedLead.lastContact || selectedLead.dataUltimoContato!).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                  {selectedLead.motivoDesqualificacao && (
                    <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                      <label className="block text-xs font-semibold text-red-700 mb-1">Motivo de Desqualificação</label>
                      <p className="text-sm text-red-900">{selectedLead.motivoDesqualificacao}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* OBSERVAÇÕES */}
              {selectedLead.notes && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
                    📝 Observações
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedLead.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={handleCloseModals}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              {canEdit && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setShowEditModal(true)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Lead
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Lead</h2>
              <button
                onClick={handleCloseModals}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <LeadForm
              initialData={{
                nome: selectedLead.name,
                telefone: selectedLead.phone,
                email: selectedLead.email || '',
                empresa: selectedLead.company || '',
                cargo: selectedLead.position || '',
                cidade: selectedLead.city || '',
                estado: selectedLead.state || '',
                produtosInteresse: [],
                origem: 'site',
                status: selectedLead.status as any,
                observacoes: selectedLead.notes || ''
              }}
              onSubmit={handleEditSubmit}
              onCancel={handleCloseModals}
              isInternal={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Leads