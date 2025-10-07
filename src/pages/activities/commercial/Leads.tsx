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
  Columns
} from 'lucide-react'
import { usePermissions } from '../../../hooks/usePermissions'
import LeadPipelineCard from '../../../components/CRM/LeadPipelineCard'
import KanbanBoard from '../../../components/CRM/KanbanBoard'
import LeadForm from '../../../components/CRM/LeadForm'
import { 
  LeadForm as LeadFormType, 
  LeadPipelineCard as LeadPipelineCardType,
  LeadPipelineStage,
  ContactAttempt,
  LeadPipelineStats
} from '../../../types/crm'
import leadDistributionService from '../../../services/leadDistributionService'
import leadsService from '../../../services/leadsService'

const Leads: React.FC = () => {
  const { hasPermission } = usePermissions()
  const [leadCards, setLeadCards] = useState<LeadPipelineCardType[]>([])
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStage, setFilterStage] = useState<LeadPipelineStage | 'all'>('all')
  const [filterResponsavel, setFilterResponsavel] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'hoje' | 'semana' | 'mes' | 'custom'>('all')
  const [customDateStart, setCustomDateStart] = useState('')
  const [customDateEnd, setCustomDateEnd] = useState('')
  const [stats, setStats] = useState<LeadPipelineStats | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban')
  const [selectedLead, setSelectedLead] = useState<LeadPipelineCardType | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Permissões
  const canCreate = hasPermission('activities.commercial.create')
  const canEdit = hasPermission('activities.commercial.update')
  const canView = hasPermission('activities.commercial.view')

  // Dados mock para demonstração
  const mockLeadCards: LeadPipelineCardType[] = [
    {
      id: '1',
      leadId: 'lead-1',
      leadData: {
        id: 'lead-1',
        nome: 'Dr. João Silva',
        telefone: '(11) 99999-9999',
        email: 'joao.silva@clinica.com',
        empresa: 'Clínica São João',
        cargo: 'Diretor Médico',
        cidade: 'São Paulo',
        estado: 'SP',
        produtosInteresse: ['consultoria-clinicas', 'pj-medstaff-15'],
        origem: 'site',
        status: 'novo',
        dataCriacao: new Date().toISOString(),
        criadoPor: 'sistema'
      },
      currentStage: 'novo_lead',
      status: 'ativo',
      responsavelAtual: '11',
      dataDistribuicao: new Date(),
      dataUltimaAtualizacao: new Date(),
      tempoNoEstagio: 2,
      tempoTotalPipeline: 2,
      stageHistory: [
        {
          stage: 'novo_lead',
          responsavel: '11',
          dataInicio: new Date(),
          observacoes: 'Lead criado automaticamente'
        }
      ],
      contactAttempts: [],
      tasks: [
        {
          id: 'task-1',
          leadPipelineId: '1',
          titulo: 'Contato inicial com lead',
          descricao: 'Realizar primeiro contato com Dr. João Silva - Clínica São João',
          tipo: 'contato_inicial',
          status: 'pendente',
          prioridade: 'alta',
          responsavel: '11',
          dataVencimento: new Date(Date.now() + 24 * 60 * 60 * 1000),
          dataCriacao: new Date(),
          tentativasRedistribuicao: 0,
          maxTentativasRedistribuicao: 3,
          notificacoes: []
        }
      ],
      observacoes: 'Lead interessado em consultoria para abertura de clínica',
      criadoPor: 'sistema',
      dataCriacao: new Date()
    },
    {
      id: '2',
      leadId: 'lead-2',
      leadData: {
        id: 'lead-2',
        nome: 'Dra. Maria Santos',
        telefone: '(11) 88888-8888',
        email: 'maria.santos@email.com',
        empresa: 'Consultório Médico',
        cargo: 'Médica',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        produtosInteresse: ['dirpf', 'planejamento-financeiro-pf'],
        origem: 'indicacao',
        status: 'contatado',
        dataCriacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        criadoPor: 'sistema'
      },
      currentStage: 'ligacao_1',
      status: 'em_contato',
      responsavelAtual: '12',
      dataDistribuicao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dataUltimaAtualizacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tempoNoEstagio: 24,
      tempoTotalPipeline: 72,
      stageHistory: [
        {
          stage: 'novo_lead',
          responsavel: '12',
          dataInicio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          dataFim: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tempoNoEstagio: 24,
          observacoes: 'Lead distribuído automaticamente'
        },
        {
          stage: 'ligacao_1',
          responsavel: '12',
          dataInicio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          observacoes: 'Primeira tentativa de contato realizada'
        }
      ],
      contactAttempts: [
        {
          id: 'contact-1',
          leadPipelineId: '2',
          tipo: 'ligacao',
          resultado: 'sem_resposta',
          dataContato: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          responsavel: '12',
          duracao: 0,
          observacoes: 'Ligação não atendida, deixado recado'
        }
      ],
      tasks: [],
      observacoes: 'Lead interessado em planejamento financeiro',
      criadoPor: 'sistema',
      dataCriacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ]

  const mockStats: LeadPipelineStats = {
    totalLeads: 15,
    leadsPorEstagio: {
      novo_lead: 5,
      ligacao_1: 4,
      ligacao_2: 2,
      mensagem: 2,
      recontato: 1,
      desfecho: 1
    },
    leadsPorStatus: {
      ativo: 10,
      em_contato: 3,
      aguardando_retorno: 1,
      qualificado: 1,
      nao_qualificado: 0,
      perdido: 0
    },
    tempoMedioPorEstagio: {
      novo_lead: 12,
      ligacao_1: 24,
      ligacao_2: 18,
      mensagem: 6,
      recontato: 48,
      desfecho: 2
    },
    tempoMedioTotal: 110,
    taxaConversao: {
      novoParaContato: 0.8,
      contatoParaQualificado: 0.6,
      qualificadoParaGanho: 0.4,
      geral: 0.192
    },
    leadsPorResponsavel: {
      '11': { total: 8, qualificados: 3, perdidos: 1, tempoMedio: 95 },
      '12': { total: 7, qualificados: 2, perdidos: 0, tempoMedio: 125 }
    },
    tarefasVencidas: 2,
    leadsSemContato24h: 3,
    leadsParaRecontato: 1
  }

  useEffect(() => {
    // Carregar leads do serviço compartilhado
    const loadLeads = async () => {
      try {
        const allLeads = await leadsService.getAllLeads()
        // Garantir que sempre seja um array
        setLeadCards(Array.isArray(allLeads) ? allLeads : [])
        
        // Carregar estatísticas do banco
        const pipelineStats = await leadsService.getPipelineStats()
        setStats(pipelineStats)
      } catch (error) {
        console.error('Erro ao carregar leads:', error)
        setLeadCards([]) // Inicializar como array vazio em caso de erro
      }
    }

    loadLeads()

    // Subscrever para mudanças nos leads
    const unsubscribe = leadsService.subscribe(async (leads) => {
      try {
        const updatedLeads = await leadsService.getAllLeads()
        setLeadCards(Array.isArray(updatedLeads) ? updatedLeads : [])
        
        // Atualizar estatísticas também
        const pipelineStats = await leadsService.getPipelineStats()
        setStats(pipelineStats)
      } catch (error) {
        console.error('Erro ao atualizar leads:', error)
      }
    })

    return unsubscribe
  }, [])

  const handleLeadSubmit = async (leadData: LeadFormType) => {
    try {
      // Usar o serviço compartilhado para criar o lead
      await leadsService.createLead(leadData)
      setShowLeadForm(false)
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      alert('Erro ao criar lead. Tente novamente.')
    }
  }

  const handleShowDetails = (leadId: string) => {
    const lead = leadCards.find(l => l.id === leadId)
    if (lead) {
      setSelectedLead(lead)
      setShowDetailsModal(true)
    }
  }

  const handleShowEdit = (leadId: string) => {
    const lead = leadCards.find(l => l.id === leadId)
    if (lead) {
      setSelectedLead(lead)
      setShowEditModal(true)
    }
  }

  const handleCloseModals = () => {
    setSelectedLead(null)
    setShowDetailsModal(false)
    setShowEditModal(false)
  }

  const handleEditSubmit = async (leadData: LeadFormType) => {
    if (!selectedLead) return
    
    try {
      await leadsService.updateLead(selectedLead.leadId, leadData)
      handleCloseModals()
      // Recarregar leads após atualização
      const updatedLeads = await leadsService.getAllLeads()
      setLeadCards(Array.isArray(updatedLeads) ? updatedLeads : [])
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
      alert('Erro ao atualizar lead. Tente novamente.')
    }
  }

  const handleStageChange = (leadId: string, newStage: LeadPipelineStage) => {
    try {
      leadsService.updateLeadStage(leadId, newStage)
    } catch (error) {
      console.error('Erro ao atualizar estágio do lead:', error)
      alert('Erro ao atualizar estágio. Tente novamente.')
    }
  }

  const handleContactAttempt = (leadId: string, attempt: Omit<ContactAttempt, 'id' | 'leadPipelineId'>) => {
    try {
      leadsService.addContactAttempt(leadId, attempt)
    } catch (error) {
      console.error('Erro ao registrar tentativa de contato:', error)
      alert('Erro ao registrar contato. Tente novamente.')
    }
  }

  const handleTaskComplete = (taskId: string) => {
    try {
      leadsService.completeTask(taskId)
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error)
      alert('Erro ao concluir tarefa. Tente novamente.')
    }
  }

  const handleQualifyLead = (leadId: string, selectedPipelines: string[]) => {
    try {
      leadsService.qualifyLead(leadId, selectedPipelines)
    } catch (error) {
      console.error('Erro ao qualificar lead:', error)
      alert('Erro ao qualificar lead. Tente novamente.')
    }
  }

  const handleDisqualifyLead = (leadId: string, reason: string, customReason?: string) => {
    try {
      leadsService.disqualifyLead(leadId, reason, customReason)
    } catch (error) {
      console.error('Erro ao desqualificar lead:', error)
      alert('Erro ao desqualificar lead. Tente novamente.')
    }
  }

  // Função para verificar se uma data está dentro do período selecionado
  const isDateInPeriod = (date: Date) => {
    const now = new Date()
    const leadDate = new Date(date)
    
    switch (filterPeriod) {
      case 'hoje':
        return leadDate.toDateString() === now.toDateString()
      case 'semana':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return leadDate >= weekAgo && leadDate <= now
      case 'mes':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return leadDate >= monthAgo && leadDate <= now
      case 'custom':
        if (!customDateStart || !customDateEnd) return true
        const startDate = new Date(customDateStart)
        const endDate = new Date(customDateEnd)
        return leadDate >= startDate && leadDate <= endDate
      default:
        return true
    }
  }

  const filteredLeads = leadCards.filter(card => {
    const matchesSearch = card.leadData.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.leadData.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.leadData.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStage = filterStage === 'all' || card.currentStage === filterStage
    const matchesResponsavel = filterResponsavel === 'all' || card.responsavelAtual === filterResponsavel
    const matchesPeriod = filterPeriod === 'all' || isDateInPeriod(card.dataCriacao)

    return matchesSearch && matchesStage && matchesResponsavel && matchesPeriod
  })

  const responsaveis = Array.from(new Set(leadCards.map(card => card.responsavelAtual)))

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acesso negado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Você não tem permissão para visualizar leads.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline de Leads</h1>
            <p className="text-gray-600">Gerencie e acompanhe seus leads comerciais</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Botões de visualização */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Columns size={16} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} />
              <span>Lista</span>
            </button>
          </div>

          {canCreate && (
            <button
              onClick={() => setShowLeadForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Novo Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-green-600">
                  {(stats.taxaConversao.geral * 100).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(stats.tempoMedioTotal / 24)}d
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tarefas Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{stats.tarefasVencidas}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value as LeadPipelineStage | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os estágios</option>
            <option value="novo_lead">Novo Lead</option>
            <option value="ligacao_1">Ligação 1</option>
            <option value="ligacao_2">Ligação 2</option>
            <option value="mensagem">Mensagem</option>
            <option value="recontato">Recontato</option>
            <option value="desfecho">Desfecho</option>
          </select>
          
          <select
            value={filterResponsavel}
            onChange={(e) => setFilterResponsavel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os responsáveis</option>
            {responsaveis.map(responsavel => (
              <option key={responsavel} value={responsavel}>
                Responsável {responsavel}
              </option>
            ))}
          </select>

          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as 'all' | 'hoje' | 'semana' | 'mes' | 'custom')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os períodos</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Última semana</option>
            <option value="mes">Último mês</option>
            <option value="custom">Período personalizado</option>
          </select>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter size={16} />
            <span>{filteredLeads.length} de {leadCards.length} leads</span>
          </div>
        </div>

        {/* Filtro de data personalizado */}
        {filterPeriod === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data inicial</label>
              <input
                type="date"
                value={customDateStart}
                onChange={(e) => setCustomDateStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data final</label>
              <input
                type="date"
                value={customDateEnd}
                onChange={(e) => setCustomDateEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Visualização de Leads */}
      {viewMode === 'kanban' ? (
        <div className="h-[calc(100vh-400px)] min-h-[600px]">
          <KanbanBoard
            leadCards={filteredLeads}
            onCardMove={handleStageChange}
            onContactAttempt={handleContactAttempt}
            onTaskComplete={handleTaskComplete}
            onEdit={handleShowEdit}
            onView={handleShowDetails}
            onQualifyLead={handleQualifyLead}
            onDisqualifyLead={handleDisqualifyLead}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum lead encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {leadCards.length === 0 
                  ? 'Comece criando seu primeiro lead.' 
                  : 'Tente ajustar os filtros de busca.'
                }
              </p>
            </div>
          ) : (
            filteredLeads.map(leadCard => (
              <LeadPipelineCard
                key={leadCard.id}
                leadCard={leadCard}
                onStageChange={handleStageChange}
                onContactAttempt={handleContactAttempt}
                onTaskComplete={handleTaskComplete}
                onEdit={handleShowEdit}
                onView={handleShowDetails}
                onQualifyLead={handleQualifyLead}
                onDisqualifyLead={handleDisqualifyLead}
              />
            ))
          )}
        </div>
      )}

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
                <p className="text-sm text-gray-500 mt-1">Informações completas do lead no pipeline</p>
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
                    <p className="text-sm font-medium text-gray-900">{selectedLead.leadData.nome}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Telefone *</label>
                    <p className="text-sm text-gray-900">{selectedLead.leadData.telefone}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">E-mail</label>
                    <p className="text-sm text-gray-900">{selectedLead.leadData.email || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Empresa</label>
                    <p className="text-sm text-gray-900">{selectedLead.leadData.empresa || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cargo</label>
                    <p className="text-sm text-gray-900">{selectedLead.leadData.cargo || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cidade</label>
                    <p className="text-sm text-gray-900">{selectedLead.leadData.cidade || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Estado</label>
                    <p className="text-sm text-gray-900">{selectedLead.leadData.estado || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              {/* PRODUTOS DE INTERESSE */}
              {selectedLead.leadData.produtosInteresse && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500">
                    🎯 Produtos de Interesse
                  </h3>
                  <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
                    <div className="text-sm text-gray-900 space-y-2">
                      {Array.isArray(selectedLead.leadData.produtosInteresse) ? (
                        selectedLead.leadData.produtosInteresse.map((produto, index) => (
                          <div key={index} className="flex items-start">
                            <span className="text-indigo-600 mr-2">✓</span>
                            <span className="text-gray-800">{produto}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-start">
                          <span className="text-indigo-600 mr-2">✓</span>
                          <span className="text-gray-800">{selectedLead.leadData.produtosInteresse}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* INFORMAÇÕES ADICIONAIS */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-500">
                  ℹ️ Informações Adicionais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Estágio Atual</label>
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {selectedLead.currentStage.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tempo no Estágio</label>
                    <p className="text-sm text-gray-900">{selectedLead.tempoNoEstagio} dias</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Origem do Lead</label>
                    <p className="text-sm text-gray-900">{selectedLead.leadData.origem || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Detalhes da Origem</label>
                    <p className="text-sm text-gray-900">{selectedLead.leadData.origemDetalhes || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Responsável</label>
                    <p className="text-sm text-gray-900">{(selectedLead as any).responsavelNome || 'Não atribuído'}</p>
                  </div>
                </div>
              </div>

              {/* TENTATIVAS DE CONTATO */}
              {selectedLead.contactAttempts && selectedLead.contactAttempts.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-500">
                    📞 Tentativas de Contato ({selectedLead.contactAttempts.length})
                  </h3>
                  <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400 max-h-60 overflow-y-auto">
                    <div className="space-y-3">
                      {selectedLead.contactAttempts.map((contato) => (
                        <div key={contato.id} className="bg-white p-3 rounded-lg border border-orange-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  contato.resultado === 'sucesso' ? 'bg-green-100 text-green-800' :
                                  contato.resultado === 'sem_resposta' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {contato.tipo}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">{contato.resultado}</span>
                              </div>
                              {contato.observacoes && (
                                <p className="text-sm text-gray-600 mt-1">{contato.observacoes}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                              {new Date(contato.dataContato).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* HISTÓRICO DE ESTÁGIOS */}
              {selectedLead.stageHistory && selectedLead.stageHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-teal-500">
                    🔄 Histórico de Estágios
                  </h3>
                  <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-400">
                    <div className="space-y-3">
                      {selectedLead.stageHistory.map((history, index) => (
                        <div key={index} className="flex items-start space-x-3 text-sm bg-white p-2 rounded-lg">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="font-semibold text-gray-900 capitalize">{history.stage.replace('_', ' ')}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600">{new Date(history.dataInicio).toLocaleDateString('pt-BR')}</span>
                            </div>
                            {history.observacoes && (
                              <p className="text-gray-600 mt-1">{history.observacoes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* OBSERVAÇÕES */}
              {selectedLead.leadData.observacoes && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
                    📝 Observações
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedLead.leadData.observacoes}</p>
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
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
              initialData={selectedLead.leadData}
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