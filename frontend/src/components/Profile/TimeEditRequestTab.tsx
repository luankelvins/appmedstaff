import React, { useState, useEffect } from 'react'
import {
  Edit3,
  Plus,
  Clock,
  Calendar,
  FileText,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Paperclip,
  MessageSquare,
  Filter,
  Search
} from 'lucide-react'
import {
  TimeEditRequest,
  TimeEditChanges,
  RequestAttachment
} from '../../types/timeTracking'
import { timeEditRequestService } from '../../utils/timeEditRequestService'

interface TimeEditRequestTabProps {
  employeeId: string
  employeeName: string
}

export const TimeEditRequestTab: React.FC<TimeEditRequestTabProps> = ({ 
  employeeId, 
  employeeName 
}) => {
  const [requests, setRequests] = useState<TimeEditRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<TimeEditRequest | null>(null)
  const [filterStatus, setFilterStatus] = useState<TimeEditRequest['status'] | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    requestType: 'correction' as TimeEditRequest['requestType'],
    targetDate: '',
    reason: '',
    description: '',
    clockIn: { original: '', requested: '', reason: '' },
    clockOut: { original: '', requested: '', reason: '' },
    justification: { requested: '' }
  })

  useEffect(() => {
    loadRequests()
  }, [employeeId, filterStatus])

  const loadRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = filterStatus !== 'all' ? { status: [filterStatus] } : undefined
      const data = await timeEditRequestService.getUserRequests(employeeId, filters)
      setRequests(data)
    } catch (err) {
      setError('Erro ao carregar solicitações')
      console.error('Erro ao carregar solicitações:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const requestedChanges: TimeEditChanges = {}
      
      if (formData.requestType === 'correction' || formData.requestType === 'addition') {
        if (formData.clockIn.requested) {
          requestedChanges.clockIn = formData.clockIn
        }
        if (formData.clockOut.requested) {
          requestedChanges.clockOut = formData.clockOut
        }
      }
      
      if (formData.requestType === 'justification') {
        requestedChanges.justification = formData.justification
      }

      const newRequest = await timeEditRequestService.createRequest({
        employeeId,
        employeeName,
        requestType: formData.requestType,
        targetDate: formData.targetDate,
        requestedChanges,
        reason: formData.reason,
        description: formData.description,
        attachments: [],
        priority: 'medium',
        approvalFlow: [
          {
            id: 'step_1',
            stepNumber: 1,
            approverRole: 'supervisor',
            status: 'pending',
            isRequired: true
          }
        ],
        currentApprovalStep: 0
      })

      setRequests([newRequest, ...requests])
      setShowCreateForm(false)
      resetForm()
    } catch (err) {
      setError('Erro ao criar solicitação')
      console.error('Erro ao criar solicitação:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      requestType: 'correction',
      targetDate: '',
      reason: '',
      description: '',
      clockIn: { original: '', requested: '', reason: '' },
      clockOut: { original: '', requested: '', reason: '' },
      justification: { requested: '' }
    })
  }

  const handleCancelRequest = async (requestId: string) => {
    try {
      await timeEditRequestService.cancelRequest(requestId, employeeId)
      await loadRequests()
    } catch (err) {
      setError('Erro ao cancelar solicitação')
      console.error('Erro ao cancelar solicitação:', err)
    }
  }

  const getStatusIcon = (status: TimeEditRequest['status'] | 'skipped') => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
      case 'under_review':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />
      case 'skipped':
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: TimeEditRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'under_review':
        return 'Em Análise'
      case 'approved':
        return 'Aprovado'
      case 'rejected':
        return 'Rejeitado'
      case 'cancelled':
        return 'Cancelado'
    }
  }

  const getRequestTypeText = (type: TimeEditRequest['requestType']) => {
    switch (type) {
      case 'correction':
        return 'Correção'
      case 'addition':
        return 'Adição'
      case 'removal':
        return 'Remoção'
      case 'justification':
        return 'Justificativa'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando solicitações...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Edit3 className="w-5 h-5 mr-2" />
          Solicitações de Edição de Ponto
        </h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Solicitação
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por motivo ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TimeEditRequest['status'] | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="under_review">Em Análise</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de solicitações */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {requests.length === 0 
                ? 'Nenhuma solicitação encontrada' 
                : 'Nenhuma solicitação corresponde aos filtros aplicados'
              }
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(request.status)}
                    <span className="font-medium text-gray-900">
                      {getRequestTypeText(request.requestType)} - {formatDate(request.targetDate)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      request.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-2">{request.reason}</h4>
                  <p className="text-gray-600 text-sm mb-3">{request.description}</p>
                  
                  {/* Mudanças solicitadas */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h5 className="font-medium text-gray-900 mb-2">Alterações Solicitadas:</h5>
                    <div className="space-y-1 text-sm">
                      {request.requestedChanges.clockIn && (
                        <div>
                          <span className="font-medium">Entrada:</span> 
                          {request.requestedChanges.clockIn.original && (
                            <span className="text-gray-500"> {request.requestedChanges.clockIn.original} →</span>
                          )}
                          <span className="text-blue-600"> {request.requestedChanges.clockIn.requested}</span>
                        </div>
                      )}
                      {request.requestedChanges.clockOut && (
                        <div>
                          <span className="font-medium">Saída:</span>
                          {request.requestedChanges.clockOut.original && (
                            <span className="text-gray-500"> {request.requestedChanges.clockOut.original} →</span>
                          )}
                          <span className="text-blue-600"> {request.requestedChanges.clockOut.requested}</span>
                        </div>
                      )}
                      {request.requestedChanges.justification && (
                        <div>
                          <span className="font-medium">Justificativa:</span>
                          <span className="text-blue-600"> {request.requestedChanges.justification.requested}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span>Enviado em {formatDate(request.submittedAt)} às {formatTime(request.submittedAt)}</span>
                    {request.attachments.length > 0 && (
                      <span className="flex items-center">
                        <Paperclip className="w-3 h-3 mr-1" />
                        {request.attachments.length} anexo(s)
                      </span>
                    )}
                    {request.comments.length > 0 && (
                      <span className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {request.comments.length} comentário(s)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver Detalhes
                  </button>
                  
                  {(request.status === 'pending' || request.status === 'under_review') && (
                    <button
                      onClick={() => handleCancelRequest(request.id)}
                      className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de criação de solicitação */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Nova Solicitação de Edição</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Solicitação
                    </label>
                    <select
                      value={formData.requestType}
                      onChange={(e) => setFormData({
                        ...formData,
                        requestType: e.target.value as TimeEditRequest['requestType']
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="correction">Correção</option>
                      <option value="addition">Adição</option>
                      <option value="removal">Remoção</option>
                      <option value="justification">Justificativa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data do Registro
                    </label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {(formData.requestType === 'correction' || formData.requestType === 'addition') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Horário de Entrada Original
                        </label>
                        <input
                          type="time"
                          value={formData.clockIn.original}
                          onChange={(e) => setFormData({
                            ...formData,
                            clockIn: { ...formData.clockIn, original: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Horário de Entrada Solicitado
                        </label>
                        <input
                          type="time"
                          value={formData.clockIn.requested}
                          onChange={(e) => setFormData({
                            ...formData,
                            clockIn: { ...formData.clockIn, requested: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Horário de Saída Original
                        </label>
                        <input
                          type="time"
                          value={formData.clockOut.original}
                          onChange={(e) => setFormData({
                            ...formData,
                            clockOut: { ...formData.clockOut, original: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Horário de Saída Solicitado
                        </label>
                        <input
                          type="time"
                          value={formData.clockOut.requested}
                          onChange={(e) => setFormData({
                            ...formData,
                            clockOut: { ...formData.clockOut, requested: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.requestType === 'justification' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Justificativa
                    </label>
                    <textarea
                      value={formData.justification.requested}
                      onChange={(e) => setFormData({
                        ...formData,
                        justification: { requested: e.target.value }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Digite a justificativa para o registro..."
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo da Solicitação
                  </label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Esqueci de bater o ponto, Problema técnico, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição Detalhada
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descreva detalhadamente o motivo da solicitação..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Solicitação
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes da solicitação */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes da Solicitação
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <p className="mt-1 text-gray-900">{getRequestTypeText(selectedRequest.requestType)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data do Registro</label>
                    <p className="mt-1 text-gray-900">{formatDate(selectedRequest.targetDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1 flex items-center">
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-2 text-gray-900">{getStatusText(selectedRequest.status)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                    <p className="mt-1 text-gray-900 capitalize">{selectedRequest.priority}</p>
                  </div>
                </div>

                {/* Alterações solicitadas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alterações Solicitadas</label>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {selectedRequest.requestedChanges.clockIn && (
                      <div>
                        <span className="font-medium">Entrada:</span>
                        {selectedRequest.requestedChanges.clockIn.original && (
                          <span className="text-gray-500"> {selectedRequest.requestedChanges.clockIn.original} →</span>
                        )}
                        <span className="text-blue-600"> {selectedRequest.requestedChanges.clockIn.requested}</span>
                      </div>
                    )}
                    {selectedRequest.requestedChanges.clockOut && (
                      <div>
                        <span className="font-medium">Saída:</span>
                        {selectedRequest.requestedChanges.clockOut.original && (
                          <span className="text-gray-500"> {selectedRequest.requestedChanges.clockOut.original} →</span>
                        )}
                        <span className="text-blue-600"> {selectedRequest.requestedChanges.clockOut.requested}</span>
                      </div>
                    )}
                    {selectedRequest.requestedChanges.justification && (
                      <div>
                        <span className="font-medium">Justificativa:</span>
                        <p className="text-blue-600 mt-1">{selectedRequest.requestedChanges.justification.requested}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Motivo e descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Motivo</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.reason}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.description}</p>
                </div>

                {/* Fluxo de aprovação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fluxo de Aprovação</label>
                  <div className="space-y-2">
                    {selectedRequest.approvalFlow.map((step) => (
                      <div key={step.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getStatusIcon(step.status)}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {step.approverName || step.approverRole}
                          </p>
                          {step.comments && (
                            <p className="text-sm text-gray-600">{step.comments}</p>
                          )}
                          {step.decidedAt && (
                            <p className="text-xs text-gray-500">
                              {formatDate(step.decidedAt)} às {formatTime(step.decidedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Histórico de status */}
                {selectedRequest.statusHistory.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Histórico</label>
                    <div className="space-y-2">
                      {selectedRequest.statusHistory.map((change) => (
                        <div key={change.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-900">
                            Status alterado de <span className="font-medium">{getStatusText(change.fromStatus)}</span> para{' '}
                            <span className="font-medium">{getStatusText(change.toStatus)}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Por {change.changedByName} em {formatDate(change.timestamp)} às {formatTime(change.timestamp)}
                          </p>
                          {change.reason && (
                            <p className="text-sm text-gray-600 mt-1">{change.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dispensar
          </button>
        </div>
      )}
    </div>
  )
}

export default TimeEditRequestTab