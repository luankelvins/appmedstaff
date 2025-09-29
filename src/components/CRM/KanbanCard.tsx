import React, { useState } from 'react'
import { 
  User, 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  Clock, 
  AlertCircle, 
  Calendar,
  MessageSquare,
  Target,
  Edit,
  Eye,
  MoreVertical,
  PhoneCall,
  UserCheck
} from 'lucide-react'
import { 
  LeadPipelineCard as LeadPipelineCardType, 
  ContactAttempt 
} from '../../types/crm'
import ContactAttemptModal from './ContactAttemptModal'

interface KanbanCardProps {
  leadCard: LeadPipelineCardType
  onContactAttempt: (leadId: string, attempt: Omit<ContactAttempt, 'id' | 'leadPipelineId'>) => void
  onTaskComplete: (taskId: string) => void
  onEdit: (leadId: string) => void
  onView: (leadId: string) => void
  isDragging: boolean
}

const STATUS_CONFIG = {
  ativo: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
  em_contato: { label: 'Em Contato', color: 'bg-blue-100 text-blue-800' },
  aguardando_retorno: { label: 'Aguardando Retorno', color: 'bg-yellow-100 text-yellow-800' },
  qualificado: { label: 'Qualificado', color: 'bg-green-100 text-green-800' },
  nao_qualificado: { label: 'Não Qualificado', color: 'bg-red-100 text-red-800' },
  perdido: { label: 'Perdido', color: 'bg-gray-100 text-gray-800' }
}

const formatTime = (hours: number): string => {
  if (hours < 24) {
    return `${Math.round(hours)}h`
  }
  const days = Math.floor(hours / 24)
  const remainingHours = Math.round(hours % 24)
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  leadCard,
  onContactAttempt,
  onTaskComplete,
  onEdit,
  onView,
  isDragging
}) => {
  const [showContactModal, setShowContactModal] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const statusConfig = STATUS_CONFIG[leadCard.status]
  const pendingTasks = leadCard.tasks.filter(task => task.status === 'pendente')
  const overdueTasks = pendingTasks.filter(task => new Date(task.dataVencimento) < new Date())

  const handleContactAttemptSubmit = (attempt: Omit<ContactAttempt, 'id' | 'leadPipelineId'>) => {
    onContactAttempt(leadCard.id, attempt)
    setShowContactModal(false)
  }

  return (
    <>
      <div 
        className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
          isDragging ? 'shadow-lg border-blue-300' : ''
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Header do card */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {leadCard.leadData.nome}
              </h4>
              <p className="text-sm text-gray-600 truncate">
                {leadCard.leadData.empresa || 'Pessoa Física'}
              </p>
            </div>
            
            {/* Actions menu */}
            <div className={`flex items-center space-x-1 transition-opacity ${
              showActions ? 'opacity-100' : 'opacity-0'
            }`}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onView(leadCard.id)
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                title="Visualizar detalhes"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(leadCard.id)
                }}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-all duration-200"
                title="Editar lead"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowContactModal(true)
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                title="Registrar tentativa de contato"
              >
                <PhoneCall size={16} />
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Informações de contato */}
        <div className="p-4 space-y-3">
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
              <Phone size={12} className="text-blue-600" />
            </div>
            <span className="truncate font-medium">{leadCard.leadData.telefone}</span>
          </div>
          
          {leadCard.leadData.email && (
            <div className="flex items-center space-x-3 text-sm text-gray-700">
              <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                <Mail size={12} className="text-green-600" />
              </div>
              <span className="truncate">{leadCard.leadData.email}</span>
            </div>
          )}
          
          {leadCard.leadData.cidade && (
            <div className="flex items-center space-x-3 text-sm text-gray-700">
              <div className="flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full">
                <MapPin size={12} className="text-purple-600" />
              </div>
              <span className="truncate">{leadCard.leadData.cidade}, {leadCard.leadData.estado}</span>
            </div>
          )}
        </div>

        {/* Métricas de tempo */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="flex items-center justify-center w-5 h-5 bg-orange-100 rounded-full">
                <Clock size={10} className="text-orange-600" />
              </div>
              <span className="font-medium">No estágio: {formatTime(leadCard.tempoNoEstagio)}</span>
            </div>
            <span className="text-gray-500 font-medium">Total: {formatTime(leadCard.tempoTotalPipeline)}</span>
          </div>
        </div>

        {/* Produtos de interesse */}
        {leadCard.leadData.produtosInteresse.length > 0 && (
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-1">
              {leadCard.leadData.produtosInteresse.slice(0, 2).map((produto) => (
                <span 
                  key={produto}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {produto.replace('_', ' ').toUpperCase()}
                </span>
              ))}
              {leadCard.leadData.produtosInteresse.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{leadCard.leadData.produtosInteresse.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tarefas pendentes */}
        {pendingTasks.length > 0 && (
          <div className="px-4 pb-4">
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 rounded-full">
                <AlertCircle size={12} className="text-yellow-600" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-yellow-800">
                  {pendingTasks.length} tarefa{pendingTasks.length > 1 ? 's' : ''} pendente{pendingTasks.length > 1 ? 's' : ''}
                </span>
                {overdueTasks.length > 0 && (
                  <div className="text-xs text-red-600 font-medium mt-1">
                    {overdueTasks.length} vencida{overdueTasks.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Últimas tentativas de contato */}
        {leadCard.contactAttempts.length > 0 && (
          <div className="px-4 pb-4">
            <div className="text-xs text-gray-500">
              Último contato: {new Date(leadCard.contactAttempts[leadCard.contactAttempts.length - 1].dataContato).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Modal de tentativas de contato */}
      <ContactAttemptModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSubmit={handleContactAttemptSubmit}
        leadCard={leadCard}
      />
    </>
  )
}

export default KanbanCard