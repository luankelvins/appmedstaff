import {
  TimeEditRequest,
  TimeEditRequestFilter,
  TimeEditRequestSummary,
  TimeEditChanges,
  RequestAttachment,
  ApprovalStep,
  RequestComment,
  StatusChange
} from '../types/timeTracking'

class TimeEditRequestService {
  private readonly API_BASE = '/api/time-edit-requests'

  // Criar nova solicitação de edição
  async createRequest(request: Omit<TimeEditRequest, 'id' | 'status' | 'statusHistory' | 'comments' | 'submittedAt' | 'createdAt' | 'updatedAt'>): Promise<TimeEditRequest> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          status: 'pending',
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar solicitação')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao criar solicitação:', error)
      // Retorna dados mock para desenvolvimento
      return this.getMockRequest(request.employeeId)
    }
  }

  // Obter solicitações do usuário
  async getUserRequests(employeeId: string, filters?: TimeEditRequestFilter): Promise<TimeEditRequest[]> {
    try {
      const params = new URLSearchParams()
      params.append('employeeId', employeeId)
      
      if (filters?.status) {
        params.append('status', filters.status.join(','))
      }
      if (filters?.requestType) {
        params.append('requestType', filters.requestType.join(','))
      }
      if (filters?.dateFrom) {
        params.append('dateFrom', filters.dateFrom)
      }
      if (filters?.dateTo) {
        params.append('dateTo', filters.dateTo)
      }

      const response = await fetch(`${this.API_BASE}?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar solicitações')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error)
      return this.getMockUserRequests(employeeId)
    }
  }

  // Obter solicitação específica
  async getRequest(requestId: string): Promise<TimeEditRequest> {
    try {
      const response = await fetch(`${this.API_BASE}/${requestId}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar solicitação')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao buscar solicitação:', error)
      throw error
    }
  }

  // Atualizar status da solicitação
  async updateRequestStatus(
    requestId: string, 
    newStatus: TimeEditRequest['status'], 
    comments?: string,
    userId?: string
  ): Promise<TimeEditRequest> {
    try {
      const response = await fetch(`${this.API_BASE}/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          comments,
          updatedBy: userId,
          updatedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }
  }

  // Adicionar comentário à solicitação
  async addComment(
    requestId: string,
    comment: Omit<RequestComment, 'id' | 'createdAt'>
  ): Promise<RequestComment> {
    try {
      const response = await fetch(`${this.API_BASE}/${requestId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...comment,
          createdAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao adicionar comentário')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      throw error
    }
  }

  // Upload de anexo
  async uploadAttachment(file: File, requestId: string): Promise<RequestAttachment> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('requestId', requestId)

      const response = await fetch(`${this.API_BASE}/${requestId}/attachments`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do anexo')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      throw error
    }
  }

  // Obter resumo das solicitações (para dashboard admin)
  async getRequestsSummary(filters?: TimeEditRequestFilter): Promise<TimeEditRequestSummary> {
    try {
      const params = new URLSearchParams()
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.append('dateTo', filters.dateTo)

      const response = await fetch(`${this.API_BASE}/summary?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar resumo')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao buscar resumo:', error)
      return this.getMockSummary()
    }
  }

  // Aprovar solicitação
  async approveRequest(
    requestId: string, 
    approverId: string, 
    comments?: string
  ): Promise<TimeEditRequest> {
    return this.updateRequestStatus(requestId, 'approved', comments, approverId)
  }

  // Rejeitar solicitação
  async rejectRequest(
    requestId: string, 
    approverId: string, 
    reason: string
  ): Promise<TimeEditRequest> {
    return this.updateRequestStatus(requestId, 'rejected', reason, approverId)
  }

  // Cancelar solicitação (pelo próprio usuário)
  async cancelRequest(requestId: string, userId: string): Promise<TimeEditRequest> {
    return this.updateRequestStatus(requestId, 'cancelled', 'Cancelado pelo usuário', userId)
  }

  // Obter solicitações pendentes de aprovação para um aprovador
  async getPendingApprovals(approverId: string): Promise<TimeEditRequest[]> {
    try {
      const response = await fetch(`${this.API_BASE}/pending-approvals/${approverId}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar aprovações pendentes')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao buscar aprovações pendentes:', error)
      return []
    }
  }

  // Validar dados da solicitação
  validateRequest(request: Partial<TimeEditRequest>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!request.targetDate) {
      errors.push('Data do registro é obrigatória')
    }

    if (!request.reason || request.reason.trim().length < 10) {
      errors.push('Motivo deve ter pelo menos 10 caracteres')
    }

    if (!request.requestedChanges) {
      errors.push('Alterações solicitadas são obrigatórias')
    }

    if (request.requestType === 'correction' && !request.originalEntry) {
      errors.push('Registro original é obrigatório para correções')
    }

    // Validar horários
    if (request.requestedChanges?.clockIn && request.requestedChanges?.clockOut) {
      const clockIn = new Date(`${request.targetDate}T${request.requestedChanges.clockIn.requested}`)
      const clockOut = new Date(`${request.targetDate}T${request.requestedChanges.clockOut.requested}`)
      
      if (clockOut <= clockIn) {
        errors.push('Horário de saída deve ser posterior ao de entrada')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Calcular impacto no banco de horas
  calculateHourBankImpact(request: TimeEditRequest): number {
    if (!request.requestedChanges.clockIn || !request.requestedChanges.clockOut) {
      return 0
    }

    const clockIn = new Date(`${request.targetDate}T${request.requestedChanges.clockIn.requested}`)
    const clockOut = new Date(`${request.targetDate}T${request.requestedChanges.clockOut.requested}`)
    
    const workedMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60)
    const expectedMinutes = 8 * 60 // 8 horas padrão
    
    return workedMinutes - expectedMinutes
  }

  // Métodos auxiliares para dados mock
  private getMockRequest(employeeId: string): TimeEditRequest {
    return {
      id: `req_${Date.now()}`,
      employeeId,
      employeeName: 'João Silva',
      requestType: 'correction',
      targetDate: new Date().toISOString().split('T')[0],
      requestedChanges: {
        clockIn: {
          original: '08:30',
          requested: '08:00',
          reason: 'Esqueci de bater o ponto na hora correta'
        }
      },
      reason: 'Correção de horário de entrada',
      description: 'Esqueci de bater o ponto no horário correto devido a reunião urgente',
      attachments: [],
      status: 'pending',
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
      currentApprovalStep: 0,
      statusHistory: [],
      comments: [],
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  private getMockUserRequests(employeeId: string): TimeEditRequest[] {
    return [
      {
        id: 'req_1',
        employeeId,
        employeeName: 'João Silva',
        requestType: 'correction',
        targetDate: '2024-01-15',
        requestedChanges: {
          clockOut: {
            original: '17:00',
            requested: '18:30',
            reason: 'Trabalho extra não registrado'
          }
        },
        reason: 'Hora extra não registrada',
        description: 'Trabalhei até mais tarde para finalizar projeto urgente',
        attachments: [],
        status: 'approved',
        priority: 'medium',
        approvalFlow: [
          {
            id: 'step_1',
            stepNumber: 1,
            approverRole: 'supervisor',
            approverId: 'sup_1',
            approverName: 'Maria Santos',
            status: 'approved',
            decision: 'approve',
            comments: 'Aprovado conforme justificativa',
            decidedAt: '2024-01-16T09:00:00Z',
            isRequired: true
          }
        ],
        currentApprovalStep: 1,
        statusHistory: [
          {
            id: 'sh_1',
            fromStatus: 'pending',
            toStatus: 'approved',
            changedBy: 'sup_1',
            changedByName: 'Maria Santos',
            timestamp: '2024-01-16T09:00:00Z'
          }
        ],
        comments: [],
        submittedAt: '2024-01-15T18:30:00Z',
        reviewedAt: '2024-01-16T09:00:00Z',
        resolvedAt: '2024-01-16T09:00:00Z',
        createdAt: '2024-01-15T18:30:00Z',
        updatedAt: '2024-01-16T09:00:00Z'
      },
      {
        id: 'req_2',
        employeeId,
        employeeName: 'João Silva',
        requestType: 'justification',
        targetDate: '2024-01-20',
        requestedChanges: {
          justification: {
            requested: 'Atraso devido a problema no transporte público'
          }
        },
        reason: 'Justificativa de atraso',
        description: 'Houve greve no metrô que causou atraso significativo',
        attachments: [],
        status: 'pending',
        priority: 'low',
        approvalFlow: [
          {
            id: 'step_1',
            stepNumber: 1,
            approverRole: 'supervisor',
            status: 'pending',
            isRequired: true
          }
        ],
        currentApprovalStep: 0,
        statusHistory: [],
        comments: [],
        submittedAt: '2024-01-20T09:30:00Z',
        createdAt: '2024-01-20T09:30:00Z',
        updatedAt: '2024-01-20T09:30:00Z'
      }
    ]
  }

  private getMockSummary(): TimeEditRequestSummary {
    return {
      totalRequests: 45,
      pendingRequests: 8,
      approvedRequests: 32,
      rejectedRequests: 5,
      averageResolutionTime: 24,
      byType: {
        correction: 25,
        addition: 8,
        removal: 5,
        justification: 7
      },
      byStatus: {
        pending: 8,
        under_review: 3,
        approved: 32,
        rejected: 5,
        cancelled: 2
      },
      trends: [
        {
          period: 'Janeiro 2024',
          requestCount: 15,
          approvalRate: 0.87
        },
        {
          period: 'Dezembro 2023',
          requestCount: 12,
          approvalRate: 0.92
        }
      ]
    }
  }
}

export const timeEditRequestService = new TimeEditRequestService()
export default timeEditRequestService