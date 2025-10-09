import React, { useState } from 'react'
import { CheckCircle, XCircle, X, AlertTriangle } from 'lucide-react'
import { LeadPipelineCard as LeadPipelineCardType } from '../../types/crm'

interface LeadOutcomeModalProps {
  lead: LeadPipelineCardType
  isOpen: boolean
  onClose: () => void
  onQualify: (lead: LeadPipelineCardType, selectedPipelines: string[]) => void
  onDisqualify: (lead: LeadPipelineCardType, reason: string, customReason?: string) => void
}

const DISQUALIFICATION_REASONS = [
  'Não tem interesse no produto/serviço',
  'Não tem orçamento disponível',
  'Não é o decisor',
  'Já possui solução similar',
  'Timing inadequado',
  'Não atende aos critérios de qualificação',
  'Não respondeu às tentativas de contato',
  'Informações de contato incorretas',
  'Concorrente',
  'Outro motivo'
]

const PIPELINE_OPTIONS = [
  { id: 'comercial', name: 'Pipeline Comercial', description: 'Vendas diretas e consultoria' },
  { id: 'pj', name: 'Pipeline PJ', description: 'Produtos para Pessoa Jurídica' },
  { id: 'pf', name: 'Pipeline PF', description: 'Produtos para Pessoa Física' },
  { id: 'irpf', name: 'Pipeline IRPF', description: 'Imposto de Renda Pessoa Física' },
  { id: 'consultoria', name: 'Pipeline Consultoria', description: 'Serviços de consultoria especializada' }
]

const LeadOutcomeModal: React.FC<LeadOutcomeModalProps> = ({
  lead,
  isOpen,
  onClose,
  onQualify,
  onDisqualify
}) => {
  const [outcomeType, setOutcomeType] = useState<'qualified' | 'disqualified' | null>(null)
  const [selectedPipelines, setSelectedPipelines] = useState<string[]>([])
  const [disqualificationReason, setDisqualificationReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handlePipelineToggle = (pipelineId: string) => {
    setSelectedPipelines(prev => 
      prev.includes(pipelineId)
        ? prev.filter(id => id !== pipelineId)
        : [...prev, pipelineId]
    )
  }

  const handleSubmit = async () => {
    if (!outcomeType) return

    setIsSubmitting(true)
    
    try {
      if (outcomeType === 'qualified') {
        if (selectedPipelines.length === 0) {
          alert('Selecione pelo menos um pipeline para o lead qualificado.')
          return
        }
        await onQualify(lead, selectedPipelines)
      } else {
        if (!disqualificationReason) {
          alert('Selecione um motivo para a desqualificação.')
          return
        }
        
        const finalReason = disqualificationReason === 'Outro motivo' && customReason
          ? customReason
          : disqualificationReason
          
        await onDisqualify(lead, finalReason, customReason)
      }
      
      handleClose()
    } catch (error) {
      console.error('Erro ao processar desfecho do lead:', error)
      alert('Erro ao processar desfecho. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setOutcomeType(null)
    setSelectedPipelines([])
    setDisqualificationReason('')
    setCustomReason('')
    setIsSubmitting(false)
    onClose()
  }

  const getRecommendedPipelines = () => {
    const interests = lead.leadData.produtosInteresse || []
    const recommended: string[] = []

    interests.forEach(interest => {
      if (interest.includes('pj') || interest.includes('clinica') || interest.includes('empresa')) {
        if (!recommended.includes('pj')) recommended.push('pj')
        if (!recommended.includes('comercial')) recommended.push('comercial')
      }
      if (interest.includes('pf') || interest.includes('pessoa-fisica')) {
        if (!recommended.includes('pf')) recommended.push('pf')
      }
      if (interest.includes('irpf') || interest.includes('imposto-renda')) {
        if (!recommended.includes('irpf')) recommended.push('irpf')
      }
      if (interest.includes('consultoria')) {
        if (!recommended.includes('consultoria')) recommended.push('consultoria')
      }
    })

    return recommended.length > 0 ? recommended : ['comercial']
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Desfecho do Lead</h2>
              <p className="text-sm text-gray-600 mt-1">
                {lead.leadData.nome} - {lead.leadData.empresa || 'Pessoa Física'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!outcomeType ? (
            /* Seleção do tipo de desfecho */
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Qual foi o resultado do contato com este lead?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setOutcomeType('qualified')}
                  className="p-6 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">Lead Qualificado</h4>
                      <p className="text-sm text-green-700 mt-1">
                        O lead demonstrou interesse e atende aos critérios de qualificação
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setOutcomeType('disqualified')}
                  className="p-6 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <h4 className="font-semibold text-red-900">Lead Desqualificado</h4>
                      <p className="text-sm text-red-700 mt-1">
                        O lead não atende aos critérios ou não demonstrou interesse
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : outcomeType === 'qualified' ? (
            /* Formulário de qualificação */
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle size={24} />
                <h3 className="text-lg font-medium">Lead Qualificado</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecione os pipelines para este lead:
                </label>
                
                <div className="space-y-3">
                  {PIPELINE_OPTIONS.map(pipeline => {
                    const isRecommended = getRecommendedPipelines().includes(pipeline.id)
                    const isSelected = selectedPipelines.includes(pipeline.id)
                    
                    return (
                      <div
                        key={pipeline.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : isRecommended
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handlePipelineToggle(pipeline.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handlePipelineToggle(pipeline.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <h4 className="font-medium text-gray-900">{pipeline.name}</h4>
                              {isRecommended && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Recomendado
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 ml-6">{pipeline.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {selectedPipelines.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Pipelines selecionados:</strong> {selectedPipelines.length}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Formulário de desqualificação */
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle size={24} />
                <h3 className="text-lg font-medium">Lead Desqualificado</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Motivo da desqualificação:
                </label>
                
                <select
                  value={disqualificationReason}
                  onChange={(e) => setDisqualificationReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione um motivo</option>
                  {DISQUALIFICATION_REASONS.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>

                {disqualificationReason === 'Outro motivo' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especifique o motivo:
                    </label>
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Descreva o motivo da desqualificação..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={outcomeType ? () => setOutcomeType(null) : handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              {outcomeType ? 'Voltar' : 'Cancelar'}
            </button>
            
            {outcomeType && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (outcomeType === 'qualified' && selectedPipelines.length === 0) || (outcomeType === 'disqualified' && !disqualificationReason)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  outcomeType === 'qualified'
                    ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300'
                    : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300'
                } disabled:cursor-not-allowed`}
              >
                {isSubmitting ? 'Processando...' : outcomeType === 'qualified' ? 'Qualificar Lead' : 'Desqualificar Lead'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeadOutcomeModal