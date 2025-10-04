import React, { useState } from 'react'
import { 
  User, 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  MessageSquare,
  Target,
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  MoreVertical
} from 'lucide-react'
import { 
  LeadPipelineCard as LeadPipelineCardType, 
  LeadPipelineStage, 
  ContactAttempt,
  LeadTask 
} from '../../types/crm'
import ContactAttemptModal from './ContactAttemptModal'
import LeadOutcomeModal from './LeadOutcomeModal'

interface LeadPipelineCardProps {
  leadCard: LeadPipelineCardType
  onStageChange: (leadId: string, newStage: LeadPipelineStage) => void
  onContactAttempt: (leadId: string, attempt: Omit<ContactAttempt, 'id' | 'leadPipelineId'>) => void
  onTaskComplete: (taskId: string) => void
  onEdit: (leadId: string) => void
  onView: (leadId: string) => void
  onQualifyLead?: (leadId: string, selectedPipelines: string[]) => void
  onDisqualifyLead?: (leadId: string, reason: string, customReason?: string) => void
}

const STAGE_CONFIG = {
  novo_lead: {
    label: 'Novo Lead',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: Target
  },
  ligacao_1: {
    label: 'Ligação 1',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: Phone
  },
  ligacao_2: {
    label: 'Ligação 2',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    icon: Phone
  },
  mensagem: {
    label: 'Mensagem',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    icon: MessageSquare
  },
  recontato: {
    label: 'Recontato',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    icon: Calendar
  },
  desfecho: {
    label: 'Desfecho',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: CheckCircle
  }
}

const STATUS_CONFIG = {
  qualificado: { label: 'Qualificado', color: 'bg-green-100 text-green-800' },
  nao_qualificado: { label: 'Não Qualificado', color: 'bg-red-100 text-red-800' },
  nao_definido: { label: 'Não Definido', color: 'bg-gray-100 text-gray-800' }
}

export const LeadPipelineCard: React.FC<LeadPipelineCardProps> = ({
  leadCard,
  onStageChange,
  onContactAttempt,
  onTaskComplete,
  onEdit,
  onView,
  onQualifyLead,
  onDisqualifyLead
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showOutcomeModal, setShowOutcomeModal] = useState(false)

  const currentStageConfig = STAGE_CONFIG[leadCard.currentStage]
  const statusConfig = STATUS_CONFIG[leadCard.status]
  const StageIcon = currentStageConfig.icon

  const formatTime = (hours: number): string => {
    if (hours < 24) {
      return `${Math.round(hours)}h`
    }
    const days = Math.floor(hours / 24)
    const remainingHours = Math.round(hours % 24)
    return `${days}d ${remainingHours}h`
  }

  const handleContactAttemptSubmit = (attempt: Omit<ContactAttempt, 'id' | 'leadPipelineId'>) => {
    onContactAttempt(leadCard.id, attempt)
    setShowContactModal(false)
  }

  const handleStageChange = (newStage: LeadPipelineStage) => {
    if (newStage === 'desfecho' && leadCard.currentStage !== 'desfecho') {
      // Se está movendo para desfecho, mostrar modal de desfecho
      setShowOutcomeModal(true)
    } else {
      // Para outros estágios, fazer mudança normal
      onStageChange(leadCard.id, newStage)
    }
  }

  const handleQualifyLead = (lead: LeadPipelineCardType, selectedPipelines: string[]) => {
    if (onQualifyLead) {
      onQualifyLead(leadCard.id, selectedPipelines)
    }
    setShowOutcomeModal(false)
  }

  const handleDisqualifyLead = (lead: LeadPipelineCardType, reason: string, customReason?: string) => {
    if (onDisqualifyLead) {
      onDisqualifyLead(leadCard.id, reason, customReason)
    }
    setShowOutcomeModal(false)
  }

  const pendingTasks = leadCard.tasks.filter(task => task.status === 'pendente')
  const overdueTasks = pendingTasks.filter(task => new Date(task.dataVencimento) < new Date())

  return (
    <div className={`rounded-lg border-2 ${currentStageConfig.bgColor} border-gray-200 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Header do Card */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${currentStageConfig.color} text-white`}>
              <StageIcon size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{leadCard.leadData.nome}</h3>
              <p className="text-sm text-gray-600">{leadCard.leadData.empresa || 'Pessoa Física'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>

        {/* Informações básicas */}
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Phone size={14} />
            <span>{leadCard.leadData.telefone}</span>
          </div>
          {leadCard.leadData.email && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail size={14} />
              <span>{leadCard.leadData.email}</span>
            </div>
          )}
          {leadCard.leadData.cidade && (
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin size={14} />
              <span>{leadCard.leadData.cidade}, {leadCard.leadData.estado}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock size={14} />
            <span>No estágio: {formatTime(leadCard.tempoNoEstagio)}</span>
          </div>
        </div>

        {/* Barra de progresso das etapas */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Progresso do Pipeline</span>
            <span>{formatTime(leadCard.tempoTotalPipeline)} total</span>
          </div>
          <div className="flex space-x-1">
            {Object.keys(STAGE_CONFIG).map((stage, index) => {
              const stageKey = stage as LeadPipelineStage
              const isCompleted = leadCard.stageHistory.some(h => h.stage === stageKey && h.dataFim)
              const isCurrent = leadCard.currentStage === stageKey
              
              return (
                <div
                  key={stage}
                  className={`flex-1 h-2 rounded-full ${
                    isCompleted || isCurrent 
                      ? STAGE_CONFIG[stageKey].color 
                      : 'bg-gray-200'
                  }`}
                />
              )
            })}
          </div>
        </div>

        {/* Tarefas pendentes */}
        {pendingTasks.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {pendingTasks.length} tarefa(s) pendente(s)
                {overdueTasks.length > 0 && (
                  <span className="text-red-600"> ({overdueTasks.length} vencida(s))</span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Produtos de interesse */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Produtos de Interesse</h4>
            <div className="flex flex-wrap gap-2">
              {leadCard.leadData.produtosInteresse.map((produto, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {produto}
                </span>
              ))}
            </div>
          </div>

          {/* Tentativas de contato */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Tentativas de Contato</h4>
              <button
                onClick={() => setShowContactModal(true)}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                + Registrar Contato
              </button>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {leadCard.contactAttempts.map((attempt) => (
                <div key={attempt.id} className="p-2 bg-white rounded border text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{attempt.tipo}</span>
                    <span className="text-gray-500">
                      {new Date(attempt.dataContato).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-gray-600 capitalize">{attempt.resultado}</div>
                  {attempt.observacoes && (
                    <div className="text-gray-500 text-xs mt-1">{attempt.observacoes}</div>
                  )}
                  {attempt.duracao && (
                    <div className="text-gray-500 text-xs">Duração: {attempt.duracao} min</div>
                  )}
                  {attempt.proximaAcao && (
                    <div className="text-blue-600 text-xs mt-1">
                      Próxima ação: {attempt.proximaAcao}
                      {attempt.dataProximaAcao && (
                        <span className="text-gray-500">
                          {' '}em {new Date(attempt.dataProximaAcao).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tarefas */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tarefas</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {leadCard.tasks.map((task) => (
                <div key={task.id} className="p-2 bg-white rounded border text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{task.titulo}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                        task.status === 'concluida' ? 'bg-green-100 text-green-800' :
                        task.status === 'vencida' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                      {task.status === 'pendente' && (
                        <button
                          onClick={() => onTaskComplete(task.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-600">{task.descricao}</div>
                  <div className="text-gray-500 text-xs">
                    Vencimento: {new Date(task.dataVencimento).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex space-x-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => onView(leadCard.id)}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              <Eye size={14} />
              <span>Ver Detalhes</span>
            </button>
            <button
              onClick={() => onEdit(leadCard.id)}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              <Edit size={14} />
              <span>Editar</span>
            </button>
            
            {/* Botões de mudança de estágio */}
            <select
              value={leadCard.currentStage}
              onChange={(e) => handleStageChange(e.target.value as LeadPipelineStage)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {Object.entries(STAGE_CONFIG).map(([stage, config]) => (
                <option key={stage} value={stage}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Modal de tentativas de contato */}
      <ContactAttemptModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSubmit={handleContactAttemptSubmit}
        leadCard={leadCard}
      />

      {/* Modal de desfecho */}
      <LeadOutcomeModal
        lead={leadCard}
        isOpen={showOutcomeModal}
        onClose={() => setShowOutcomeModal(false)}
        onQualify={handleQualifyLead}
        onDisqualify={handleDisqualifyLead}
      />
    </div>
  )
}

export default LeadPipelineCard