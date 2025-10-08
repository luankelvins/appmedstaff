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
import { useEmployees } from '../../../hooks/useEmployees'
import LeadPipelineCard from '../../../components/CRM/LeadPipelineCard'
import KanbanBoard from '../../../components/CRM/KanbanBoard'
import LeadForm from '../../../components/CRM/LeadForm'
import { 
  LeadForm as LeadFormType, 
  LeadPipelineCard as LeadPipelineCardType,
  LeadPipelineStage,
  ContactAttempt,
  LeadPipelineStats,
  LeadComment
} from '../../../types/crm'
import leadDistributionService from '../../../services/leadDistributionService'
import leadsService from '../../../services/leadsService'
import { leadCommentsService, LeadComment as LeadCommentDB } from '../../../services/leadCommentsService'

const Leads: React.FC = () => {
  const { hasPermission } = usePermissions()
  const { employees } = useEmployees()
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

  // Estados para gerenciar comentários
  const [comments, setComments] = useState<LeadCommentDB[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentType, setCommentType] = useState<'general' | 'follow_up' | 'qualification' | 'objection' | 'proposal' | 'negotiation' | 'closing'>('general')
  const [commentPriority, setCommentPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [isPrivateComment, setIsPrivateComment] = useState(false)
  const [editingComment, setEditingComment] = useState<LeadCommentDB | null>(null)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentStats, setCommentStats] = useState<any>(null)

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
        desfecho: 'nao_definido',
        dataCriacao: new Date().toISOString(),
        criadoPor: 'sistema'
      },
      currentStage: 'novo_lead',
      status: 'nao_definido',
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
      dataCriacao: new Date(),
      responsavelNome: 'Carlos Silva',
      responsavelFoto: null
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
        desfecho: 'nao_informado',
        dataCriacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        criadoPor: 'sistema'
      },
      currentStage: 'ligacao_1',
      status: 'qualificado',
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
      dataCriacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      responsavelNome: 'Ana Costa',
      responsavelFoto: null
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
        qualificado: 2,
        desqualificado: 1,
        nao_definido: 3,
        nao_informado: 0
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

  // Função para verificar permissões de edição/exclusão
  const canEditOrDeleteComment = (comment: LeadCommentDB) => {
    // Verifica se é o autor do comentário ou se tem permissão de admin
    const currentUserId = '11' // Aqui você pegaria do contexto de autenticação
    const isAuthor = comment.author_id === currentUserId
    const isAdmin = hasPermission('activities.commercial.update') // Usando a permissão existente como proxy para admin
    
    return isAuthor || isAdmin
  }

  // Funções para gerenciar comentários
  const loadComments = async (leadId: string) => {
    try {
      setLoadingComments(true)
      const [commentsData, statsData] = await Promise.all([
        leadCommentsService.getLeadComments(leadId),
        leadCommentsService.getCommentStats(leadId)
      ])
      setComments(commentsData)
      setCommentStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
      // Fallback para comentários mock em caso de erro
      const mockComments: LeadCommentDB[] = [
        {
          id: '1',
          lead_id: leadId,
          content: 'Cliente demonstrou interesse em consultoria para abertura de clínica. Agendado reunião para próxima semana.',
          comment_type: 'negotiation',
          priority: 'high',
          is_private: false,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: null as any,
          author_id: '11',
          author_name: 'Luan Kelvin',
          author_role: 'Comercial'
        }
      ]
      setComments(mockComments)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedLead) return

    try {
      const commentData = {
        lead_id: selectedLead.leadId,
        content: newComment.trim(),
        comment_type: commentType,
        priority: commentPriority,
        is_private: isPrivateComment
      }

      const newCommentData = await leadCommentsService.createComment(commentData)
      setComments(prev => [newCommentData, ...prev])
      
      // Reset form
      setNewComment('')
      setShowCommentForm(false)
      setCommentType('general')
      setCommentPriority('medium')
      setIsPrivateComment(false)

      // Atualizar estatísticas
      if (selectedLead) {
        const stats = await leadCommentsService.getCommentStats(selectedLead.leadId)
        setCommentStats(stats)
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      alert('Erro ao adicionar comentário. Tente novamente.')
    }
  }

  const handleEditComment = (comment: LeadCommentDB) => {
    setEditingComment(comment)
    setNewComment(comment.content)
    setCommentType(comment.comment_type)
    setCommentPriority(comment.priority)
    setIsPrivateComment(comment.is_private)
    setShowCommentForm(true)
  }

  const handleUpdateComment = async () => {
    if (!editingComment || !newComment.trim()) return

    try {
      const updateData = {
        content: newComment.trim(),
        comment_type: commentType,
        priority: commentPriority,
        is_private: isPrivateComment
      }

      const updatedComment = await leadCommentsService.updateComment(editingComment.id, updateData)
      setComments(prev => prev.map(c => c.id === editingComment.id ? updatedComment : c))
      
      // Reset form
      setEditingComment(null)
      setNewComment('')
      setShowCommentForm(false)
      setCommentType('general')
      setCommentPriority('medium')
      setIsPrivateComment(false)
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error)
      alert('Erro ao atualizar comentário. Tente novamente.')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este comentário?')) {
      try {
        await leadCommentsService.deleteComment(commentId)
        setComments(prev => prev.filter(c => c.id !== commentId))
        
        // Atualizar estatísticas
        if (selectedLead) {
          const stats = await leadCommentsService.getCommentStats(selectedLead.leadId)
          setCommentStats(stats)
        }
      } catch (error) {
        console.error('Erro ao deletar comentário:', error)
        alert('Erro ao deletar comentário. Tente novamente.')
      }
    }
  }

  const handleCancelComment = () => {
    setEditingComment(null)
    setNewComment('')
    setShowCommentForm(false)
    setCommentType('general')
    setCommentPriority('medium')
    setIsPrivateComment(false)
  }

  // Carregar comentários quando um lead é selecionado
  useEffect(() => {
    if (selectedLead && showDetailsModal) {
      loadComments(selectedLead.leadId)
    }
  }, [selectedLead, showDetailsModal])

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

  // Função para buscar dados do responsável
  const getResponsavelData = (responsavelId: string) => {
    const employee = employees.find(emp => emp.id === responsavelId)
    return {
      nome: employee?.name || 'Não atribuído',
      foto: employee?.avatar || null
    }
  }

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
                employees={employees}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[95vh] flex flex-col overflow-hidden">
            {/* Header moderno com gradiente */}
            <div className="flex-shrink-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-8 py-8 relative overflow-hidden">
              {/* Padrão de fundo decorativo */}
              <div className="absolute inset-0 bg-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
              </div>
              
              <div className="relative flex justify-between items-center">
                <div className="flex items-center space-x-6">
                  {/* Avatar do responsável com borda */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {(() => {
                        const responsavelData = getResponsavelData(selectedLead.responsavelAtual)
                        return responsavelData.foto ? (
                          <img 
                            src={responsavelData.foto} 
                            alt={responsavelData.nome}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <span>
                            {responsavelData.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                          </span>
                        )
                      })()}
                    </div>
                    {/* Indicador online */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-white">{selectedLead.leadData.nome}</h2>
                    <p className="text-blue-100 text-lg">
                      {selectedLead.leadData.empresa || 'Pessoa Física'} 
                      {selectedLead.leadData.cargo && ` • ${selectedLead.leadData.cargo}`}
                    </p>
                    
                    {/* Badges informativos */}
                    <div className="flex items-center space-x-3 mt-3">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {selectedLead.currentStage === 'novo_lead' ? 'Novo Lead' :
                         selectedLead.currentStage === 'ligacao_1' ? 'Ligação 1' :
                         selectedLead.currentStage === 'ligacao_2' ? 'Ligação 2' :
                         selectedLead.currentStage === 'mensagem' ? 'Mensagem' :
                         selectedLead.currentStage === 'recontato' ? 'Recontato' :
                         selectedLead.currentStage === 'desfecho' ? 'Desfecho' :
                         'Não Definido'}
                      </span>
                      
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border ${
                        selectedLead.status === 'qualificado' ? 'bg-green-500/20 text-green-100 border-green-400/30' :
                        selectedLead.status === 'desqualificado' ? 'bg-red-500/20 text-red-100 border-red-400/30' :
                        selectedLead.status === 'nao_informado' ? 'bg-yellow-500/20 text-yellow-100 border-yellow-400/30' :
                        'bg-gray-500/20 text-gray-100 border-gray-400/30'
                      }`}>
                        {selectedLead.status === 'qualificado' ? '✓ Qualificado' :
                         selectedLead.status === 'desqualificado' ? '✗ Desqualificado' :
                         selectedLead.status === 'nao_informado' ? '❓ Não Informado' :
                         '⏳ Não Definido'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCloseModals}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Conteúdo com scroll suave */}
             <div className="flex-1 overflow-y-auto">
               <div className="p-8 space-y-8 pb-32">
              {/* Cards de informações organizados */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Card: Informações de Contato */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="text-blue-600" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Informações de Contato</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <svg className="text-gray-400 mr-3" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Telefone</p>
                        <p className="font-medium text-gray-800">{selectedLead.leadData.telefone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <svg className="text-gray-400 mr-3" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">{selectedLead.leadData.email || 'Não informado'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <svg className="text-gray-400 mr-3" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Localização</p>
                        <p className="font-medium text-gray-800">{selectedLead.leadData.cidade}, {selectedLead.leadData.estado}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card: Informações Profissionais */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="text-purple-600" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Informações Profissionais</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Empresa</p>
                      <p className="font-medium text-gray-800">{selectedLead.leadData.empresa || 'Pessoa Física'}</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Cargo</p>
                      <p className="font-medium text-gray-800">{selectedLead.leadData.cargo || 'Não informado'}</p>
                    </div>
                  </div>
                </div>

                {/* Card: Responsável da Empresa pelo Lead */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="text-emerald-600" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Responsável da Empresa pelo Lead</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Responsável Atual</p>
                      <div className="flex items-center">
                        {(() => {
                          const responsavelData = getResponsavelData(selectedLead.responsavelAtual)
                          return (
                            <>
                              {responsavelData.foto ? (
                                <img 
                                  src={responsavelData.foto} 
                                  alt={responsavelData.nome}
                                  className="w-8 h-8 rounded-full object-cover mr-3"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                                  <span className="text-white text-xs font-semibold">
                                    {responsavelData.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                  </span>
                                </div>
                              )}
                              <p className="font-medium text-gray-800">{responsavelData.nome}</p>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Responsável LK</p>
                      <p className="font-medium text-gray-800">Luan Kelvin</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Data de Distribuição</p>
                      <p className="font-medium text-gray-800">
                        {new Date(selectedLead.dataDistribuicao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card: Produtos de Interesse */}
              {selectedLead.leadData.produtosInteresse && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="text-green-600" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Produtos de Interesse</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {Array.isArray(selectedLead.leadData.produtosInteresse) ? (
                      selectedLead.leadData.produtosInteresse.map((produto, index) => (
                        <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <p className="font-medium text-gray-800">{produto}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <p className="font-medium text-gray-800">{selectedLead.leadData.produtosInteresse}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Card: Informações do Pipeline */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="text-indigo-600" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Informações do Pipeline</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <svg className="text-blue-600 mr-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm font-medium text-blue-700">Estágio Atual</p>
                    </div>
                    <p className="text-lg font-semibold text-blue-800 capitalize">{selectedLead.currentStage.replace('_', ' ')}</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-2">
                      <svg className="text-purple-600 mr-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-purple-700">Status de Qualificação</p>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedLead.status === 'qualificado' ? 'bg-green-100 text-green-800' :
                      selectedLead.status === 'desqualificado' ? 'bg-red-100 text-red-800' :
                      selectedLead.status === 'nao_informado' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedLead.status === 'qualificado' ? 'Qualificado' :
                       selectedLead.status === 'desqualificado' ? 'Desqualificado' :
                       selectedLead.status === 'nao_informado' ? 'Não Informado' :
                       'Não Definido'}
                    </span>
                  </div>
                  
                  {/* Card de Desfecho */}
                  {selectedLead.currentStage === 'desfecho' && (
                    <div className="md:col-span-2 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center mb-2">
                        <svg className="text-emerald-600 mr-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-emerald-700">Título do Card de Desfecho</p>
                      </div>
                      <p className="text-lg font-semibold text-emerald-800">
                        {selectedLead.status === 'qualificado' ? 'Lead Qualificado com Sucesso' :
                         selectedLead.status === 'desqualificado' ? 'Lead Desqualificado' :
                         'Aguardando Definição de Desfecho'}
                      </p>
                      {selectedLead.outcome && (
                        <p className="text-sm text-emerald-700 mt-2">
                          Motivo: {selectedLead.outcome.motivo}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center mb-2">
                      <svg className="text-yellow-600 mr-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-yellow-700">Tempo no Estágio</p>
                    </div>
                    <p className="text-lg font-semibold text-yellow-800">{selectedLead.tempoNoEstagio} dias</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                    <div className="flex items-center mb-2">
                      <svg className="text-teal-600 mr-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <p className="text-sm font-medium text-teal-700">Origem</p>
                    </div>
                    <p className="text-lg font-semibold text-teal-800">{selectedLead.leadData.origem || 'Não informado'}</p>
                  </div>
                  
                  {selectedLead.leadData.origemDetalhes && (
                    <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-600 mb-1">Detalhes da Origem</p>
                      <p className="text-gray-800">{selectedLead.leadData.origemDetalhes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card: Tentativas de Contato */}
              {selectedLead.contactAttempts && selectedLead.contactAttempts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="text-blue-600" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Tentativas de Contato 
                      <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {selectedLead.contactAttempts.length}
                      </span>
                    </h3>
                  </div>
                  
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {selectedLead.contactAttempts.map((contato) => (
                      <div key={contato.id} className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className={`w-3 h-3 rounded-full mt-2 mr-4 flex-shrink-0 ${
                          contato.resultado === 'sucesso' ? 'bg-green-500' :
                          contato.resultado === 'sem_resposta' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                contato.resultado === 'sucesso' ? 'bg-green-100 text-green-800' :
                                contato.resultado === 'sem_resposta' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {contato.tipo}
                              </span>
                              <span className="text-sm text-gray-600 capitalize font-medium">{contato.resultado}</span>
                            </div>
                            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                              {new Date(contato.dataContato).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {contato.observacoes && (
                            <p className="text-gray-700 bg-white/60 p-3 rounded-lg">{contato.observacoes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Card: Histórico de Estágios */}
              {selectedLead.stageHistory && selectedLead.stageHistory.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="text-orange-600" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Histórico de Estágios</h3>
                  </div>
                  
                  <div className="relative">
                    {/* Linha do tempo */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-orange-200"></div>
                    
                    <div className="space-y-6">
                      {selectedLead.stageHistory.map((history, index) => (
                        <div key={index} className="relative flex items-start">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10">
                            <span className="text-orange-600 font-bold text-sm">{index + 1}</span>
                          </div>
                          <div className="ml-6 flex-1">
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-800 capitalize text-lg">
                                  {history.stage.replace('_', ' ')}
                                </h4>
                                <div className="text-right">
                                  <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full block">
                                    {new Date(history.dataInicio).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    })}
                                  </span>
                                  <span className="text-xs text-gray-400 mt-1 block">
                                    {new Date(history.dataInicio).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                              {history.observacoes && (
                                <p className="text-gray-700 bg-white/60 p-3 rounded-lg mt-3">{history.observacoes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Card: Observações */}
              {selectedLead.leadData.observacoes && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="text-gray-600" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Observações</h3>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200 min-h-[120px]">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedLead.leadData.observacoes}</p>
                  </div>
                </div>
              )}

              {/* Card: Comentários e Histórico */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="text-indigo-600" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Comentários</h3>
                  </div>
                  <button 
                    onClick={() => setShowCommentForm(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    + Adicionar Comentário
                  </button>
                </div>

                {/* Formulário de Comentário */}
                {showCommentForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                          <select
                            value={commentType}
                            onChange={(e) => setCommentType(e.target.value as LeadCommentDB['comment_type'])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="general">Geral</option>
                            <option value="follow_up">Follow-up</option>
                            <option value="qualification">Qualificação</option>
                            <option value="objection">Objeção</option>
                            <option value="proposal">Proposta</option>
                            <option value="negotiation">Negociação</option>
                            <option value="closing">Fechamento</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                          <select
                            value={commentPriority}
                            onChange={(e) => setCommentPriority(e.target.value as LeadCommentDB['priority'])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                            <option value="urgent">Urgente</option>
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <input
                              type="checkbox"
                              checked={isPrivateComment}
                              onChange={(e) => setIsPrivateComment(e.target.checked)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Comentário privado</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comentário</label>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Digite seu comentário..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleCancelComment}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={editingComment ? handleUpdateComment : handleAddComment}
                          disabled={!newComment.trim()}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {editingComment ? 'Atualizar' : 'Adicionar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Lista de Comentários */}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => {
                      const priorityColors = {
                        low: 'border-gray-200 bg-gray-50',
                        medium: 'border-blue-200 bg-blue-50',
                        high: 'border-orange-200 bg-orange-50',
                        urgent: 'border-red-200 bg-red-50'
                      }
                      
                      const typeColors = {
                        general: 'bg-gray-500',
                        follow_up: 'bg-green-500',
                        qualification: 'bg-blue-500',
                        objection: 'bg-yellow-500',
                        proposal: 'bg-purple-500',
                        negotiation: 'bg-indigo-500',
                        closing: 'bg-emerald-500'
                      }

                      return (
                        <div key={comment.id} className={`border-l-4 pl-4 py-3 rounded-r-lg ${priorityColors[comment.priority]}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 rounded-full ${typeColors[comment.comment_type]} flex items-center justify-center`}>
                                <span className="text-white text-xs font-semibold">
                                  {comment.author_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-800">{comment.author_name}</span>
                                <span className="text-xs text-gray-500 ml-2">({comment.author_role})</span>
                              </div>
                              <div className="flex space-x-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  comment.comment_type === 'general' ? 'bg-gray-100 text-gray-700' :
                                  comment.comment_type === 'follow_up' ? 'bg-green-100 text-green-700' :
                                  comment.comment_type === 'qualification' ? 'bg-blue-100 text-blue-700' :
                                  comment.comment_type === 'objection' ? 'bg-yellow-100 text-yellow-700' :
                                  comment.comment_type === 'proposal' ? 'bg-purple-100 text-purple-700' :
                                  comment.comment_type === 'negotiation' ? 'bg-indigo-100 text-indigo-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {comment.comment_type.replace('_', '-')}
                                </span>
                                {comment.priority === 'high' && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                                    Alta prioridade
                                  </span>
                                )}
                                {comment.priority === 'urgent' && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                                    Urgente
                                  </span>
                                )}
                                {comment.is_private && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                                    Privado
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                {comment.updated_at && ' (editado)'}
                              </span>
                              <div className="flex space-x-1">
                                 {canEditOrDeleteComment(comment) && (
                                   <>
                                     <button
                                       onClick={() => handleEditComment(comment)}
                                       className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                       title="Editar comentário"
                                     >
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                       </svg>
                                     </button>
                                     <button
                                       onClick={() => handleDeleteComment(comment.id)}
                                       className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                       title="Excluir comentário"
                                     >
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                       </svg>
                                     </button>
                                   </>
                                 )}
                               </div>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-sm">Nenhum comentário ainda</p>
                      <p className="text-xs text-gray-400 mt-1">Clique em "Adicionar Comentário" para começar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

            {/* Footer com Informações Completas */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-8 py-6">
              <div className="flex justify-between items-start">
                {/* Informações do Lead */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Criado em</div>
                    <div className="font-medium text-gray-800">
                      {selectedLead.leadData.dataCriacao ? 
                        new Date(selectedLead.leadData.dataCriacao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        'Não informado'
                      }
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-500 mb-1">Última atualização</div>
                    <div className="font-medium text-gray-800">
                      {selectedLead.leadData.dataUltimaAtualizacao ? 
                        new Date(selectedLead.leadData.dataUltimaAtualizacao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        'Não informado'
                      }
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-500 mb-1">Total de comentários</div>
                    <div className="font-medium text-gray-800 flex items-center space-x-2">
                      <span>{comments.length}</span>
                      {comments.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {comments.filter(c => c.priority === 'high' || c.priority === 'urgent').length} alta prioridade
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-500 mb-1">Tempo no estágio atual</div>
                    <div className="font-medium text-gray-800">
                      {selectedLead.tempoNoEstagio || 'Não calculado'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-500 mb-1">Tentativas de contato</div>
                    <div className="font-medium text-gray-800">
                      {selectedLead.contactAttempts?.length || 0} tentativas
                    </div>
                  </div>
                  
                  <div>
                     <div className="text-gray-500 mb-1">Status atual</div>
                     <div className="font-medium">
                       <span className={`px-2 py-1 rounded-full text-xs ${
                         selectedLead.status === 'qualificado' ? 'bg-green-100 text-green-700' :
                         selectedLead.status === 'desqualificado' ? 'bg-red-100 text-red-700' :
                         selectedLead.status === 'nao_informado' ? 'bg-yellow-100 text-yellow-700' :
                         'bg-gray-100 text-gray-700'
                       }`}>
                         {selectedLead.status === 'qualificado' ? 'Qualificado' :
                          selectedLead.status === 'desqualificado' ? 'Desqualificado' :
                          selectedLead.status === 'nao_informado' ? 'Não Informado' :
                          'Não Definido'}
                       </span>
                     </div>
                   </div>
                </div>
                
                {/* Ações */}
                <div className="flex space-x-4 ml-6">
                  <button
                    onClick={handleCloseModals}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 hover:border-gray-400 transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Fechar</span>
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        setShowEditModal(true)
                      }}
                      className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Editar Lead</span>
                    </button>
                  )}
                </div>
              </div>
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