import React, { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { 
  Phone, 
  Mail, 
  Clock, 
  Building2, 
  CheckCircle, 
  Edit, 
  Eye,
  Plus,
  Filter
} from 'lucide-react'
import { 
  LeadPipelineCard as LeadPipelineCardType, 
  LeadPipelineStage, 
  ContactAttempt,
  CommercialTeamMember 
} from '../../types/crm'
import LeadOutcomeModal from './LeadOutcomeModal'

// Configuração dos estágios
const STAGE_CONFIG = {
  novo_lead: { title: 'Novo Lead', color: '#3B82F6' },
  ligacao_1: { title: 'Ligação 1', color: '#F59E0B' },
  ligacao_2: { title: 'Ligação 2', color: '#EF4444' },
  mensagem: { title: 'Mensagem', color: '#8B5CF6' },
  recontato: { title: 'Recontato', color: '#06B6D4' },
  desfecho: { title: 'Desfecho', color: '#10B981' }
}

const stages: LeadPipelineStage[] = [
  'novo_lead', 'ligacao_1', 'ligacao_2', 'mensagem', 'recontato', 'desfecho'
]

// Time comercial interno baseado no leadDistributionService
const COMMERCIAL_TEAM: CommercialTeamMember[] = [
  {
    id: '11',
    nome: 'Mariana Souza',
    email: 'mariana.souza@medstaff.com',
    cargo: 'Gerente Comercial',
    departamento: 'Comercial',
    ativo: true,
    capacidadeLeads: 15,
    leadsAtivos: 0,
    prioridade: 1,
    especialidades: ['pj', 'consultoria', 'assistencia']
  },
  {
    id: '12',
    nome: 'Diego Martins',
    email: 'diego.martins@medstaff.com',
    cargo: 'Analista Comercial',
    departamento: 'Comercial',
    ativo: true,
    capacidadeLeads: 10,
    leadsAtivos: 0,
    prioridade: 2,
    especialidades: ['pf', 'pj']
  },
  {
    id: '37',
    nome: 'Fernando Santos',
    email: 'fernando.santos@medstaff.com',
    cargo: 'Diretor Comercial',
    departamento: 'Diretoria Comercial e Marketing',
    ativo: true,
    capacidadeLeads: 5,
    leadsAtivos: 0,
    prioridade: 3,
    especialidades: ['consultoria', 'assistencia']
  }
]

interface KanbanBoardProps {
  leadCards: LeadPipelineCardType[]
  onCardMove: (cardId: string, newStage: LeadPipelineStage) => void
  onCardClick?: (card: LeadPipelineCardType) => void
  onContactAttempt?: (leadId: string, attempt: Omit<ContactAttempt, 'id' | 'leadPipelineId'>) => void
  onTaskComplete?: (taskId: string) => void
  onEdit?: (leadId: string) => void
  onView?: (leadId: string) => void
  onQualifyLead?: (leadId: string, selectedPipelines: string[]) => void
  onDisqualifyLead?: (leadId: string, reason: string, customReason?: string) => void
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leadCards,
  onCardMove,
  onCardClick,
  onContactAttempt,
  onTaskComplete,
  onEdit,
  onView,
  onQualifyLead,
  onDisqualifyLead
}) => {
  const [pendingOutcomeLead, setPendingOutcomeLead] = useState<LeadPipelineCardType | null>(null)
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false)

  // Função para obter responsável automático do time comercial
  const getAutomaticResponsible = (): string => {
    // Busca o membro com menor carga de trabalho e maior prioridade
    const availableMembers = COMMERCIAL_TEAM
      .filter(member => member.ativo && member.leadsAtivos < member.capacidadeLeads)
      .sort((a, b) => {
        // Primeiro por prioridade (menor número = maior prioridade)
        if (a.prioridade !== b.prioridade) {
          return a.prioridade - b.prioridade
        }
        // Depois por carga de trabalho (menor carga primeiro)
        return a.leadsAtivos - b.leadsAtivos
      })

    // Se todos estão lotados, pega o com maior prioridade
    if (availableMembers.length === 0) {
      const highestPriorityMember = COMMERCIAL_TEAM
        .filter(member => member.ativo)
        .sort((a, b) => a.prioridade - b.prioridade)[0]
      return highestPriorityMember?.nome || 'Não atribuído'
    }

    return availableMembers[0].nome
  }

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStage = destination.droppableId as LeadPipelineStage
    const leadCard = leadCards.find(card => card.id === draggableId)

    if (!leadCard) return

    // Se o destino é 'desfecho', abrir modal obrigatório
    if (newStage === 'desfecho') {
      // Atribuir responsável automaticamente se não tiver
      const updatedLead = {
        ...leadCard,
        responsavelAtual: leadCard.responsavelAtual || getAutomaticResponsible()
      }
      setPendingOutcomeLead(updatedLead)
      setIsOutcomeModalOpen(true)
      return
    }

    // Para outros estágios, mover normalmente
    onCardMove(draggableId, newStage)
  }, [onCardMove, leadCards])

  const handleCloseOutcomeModal = () => {
    setIsOutcomeModalOpen(false)
    setPendingOutcomeLead(null)
  }

  const handleQualifyLead = (lead: LeadPipelineCardType, selectedPipelines: string[]) => {
    if (onQualifyLead && pendingOutcomeLead) {
      onQualifyLead(lead.id, selectedPipelines)
      // Mover para desfecho após qualificação
      onCardMove(pendingOutcomeLead.id, 'desfecho')
      handleCloseOutcomeModal()
    }
  }

  const handleDisqualifyLead = (lead: LeadPipelineCardType, reason: string, customReason?: string) => {
    if (onDisqualifyLead && pendingOutcomeLead) {
      onDisqualifyLead(lead.id, reason, customReason)
      // Mover para desfecho após desqualificação
      onCardMove(pendingOutcomeLead.id, 'desfecho')
      handleCloseOutcomeModal()
    }
  }

  const getLeadsByStage = (stage: LeadPipelineStage) => {
    return leadCards.filter(card => card.currentStage === stage)
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
    <div className="h-full overflow-hidden">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageLeads = getLeadsByStage(stage)
            const stageConfig = STAGE_CONFIG[stage]
            
            return (
              <div key={stage} className="flex-shrink-0 w-80">
                <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
                  <div 
                    className="p-4 border-b"
                    style={{ borderTopColor: stageConfig.color, borderTopWidth: '3px' }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{stageConfig.title}</h3>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                        {stageLeads.length}
                      </span>
                    </div>
                  </div>
                  
                  <Droppable droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-4 space-y-3 overflow-y-auto ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        {stageLeads.map((leadCard, index) => (
                          <Draggable key={leadCard.id} draggableId={leadCard.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 text-sm">
                                        {leadCard.leadData.nome}
                                      </h4>
                                      {leadCard.leadData.empresa && (
                                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                                          <Building2 className="w-3 h-3 mr-1" />
                                          {leadCard.leadData.empresa}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex space-x-1">
                                      {onView && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            onView(leadCard.id)
                                          }}
                                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                      )}
                                      {onEdit && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            onEdit(leadCard.id)
                                          }}
                                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    {leadCard.leadData.email && (
                                      <div className="flex items-center text-xs text-gray-600">
                                        <Mail className="w-3 h-3 mr-2" />
                                        <span className="truncate">{leadCard.leadData.email}</span>
                                      </div>
                                    )}
                                    {leadCard.leadData.telefone && (
                                      <div className="flex items-center text-xs text-gray-600">
                                        <Phone className="w-3 h-3 mr-2" />
                                        <span>{leadCard.leadData.telefone}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                     <div className="flex items-center">
                                       <Clock className="w-3 h-3 mr-1" />
                                       {formatDate(leadCard.dataCriacao.toString())}
                                     </div>
                                    {leadCard.responsavelAtual && (
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {leadCard.responsavelAtual}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {/* Modal de Desfecho Obrigatório */}
      {pendingOutcomeLead && (
        <LeadOutcomeModal
          lead={pendingOutcomeLead}
          isOpen={isOutcomeModalOpen}
          onClose={handleCloseOutcomeModal}
          onQualify={handleQualifyLead}
          onDisqualify={handleDisqualifyLead}
        />
      )}
    </div>
  )
}

export default KanbanBoard