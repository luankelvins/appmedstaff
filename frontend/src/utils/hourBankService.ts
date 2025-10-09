import { 
  HourBank, 
  HourBankTransaction, 
  HourBankSummary, 
  HourBankAlert,
  CompensationPeriod,
  TimeEntry,
  UserTimeTrackingDashboard 
} from '../types/timeTracking'

class HourBankService {
  private readonly API_BASE = '/api/hour-bank'

  // Obter banco de horas do usuário
  async getUserHourBank(employeeId: string): Promise<HourBank> {
    try {
      const response = await fetch(`${this.API_BASE}/${employeeId}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar banco de horas')
      }
      return await response.json()
    } catch (error) {
      console.error('Erro ao buscar banco de horas:', error)
      // Retorna dados mock para desenvolvimento
      return this.getMockHourBank(employeeId)
    }
  }

  // Obter resumo do banco de horas
  async getHourBankSummary(employeeId: string): Promise<HourBankSummary> {
    try {
      const response = await fetch(`${this.API_BASE}/${employeeId}/summary`)
      if (!response.ok) {
        throw new Error('Erro ao buscar resumo do banco de horas')
      }
      return await response.json()
    } catch (error) {
      console.error('Erro ao buscar resumo do banco de horas:', error)
      // Retorna dados mock para desenvolvimento
      return this.getMockHourBankSummary(employeeId)
    }
  }

  // Calcular saldo atual baseado nas transações
  calculateCurrentBalance(transactions: HourBankTransaction[]): number {
    return transactions
      .filter(t => t.status === 'approved')
      .reduce((total, transaction) => total + transaction.amount, 0)
  }

  // Formatar minutos em formato legível (ex: "2h 30min")
  formatMinutesToHours(minutes: number): string {
    const isNegative = minutes < 0
    const absMinutes = Math.abs(minutes)
    const hours = Math.floor(absMinutes / 60)
    const remainingMinutes = absMinutes % 60

    let formatted = ''
    if (hours > 0) {
      formatted += `${hours}h`
    }
    if (remainingMinutes > 0) {
      formatted += `${formatted ? ' ' : ''}${remainingMinutes}min`
    }
    if (formatted === '') {
      formatted = '0min'
    }

    return isNegative ? `-${formatted}` : formatted
  }

  // Converter horas para minutos
  hoursToMinutes(hours: number): number {
    return Math.round(hours * 60)
  }

  // Converter minutos para horas
  minutesToHours(minutes: number): number {
    return minutes / 60
  }

  // Gerar alertas baseados no saldo atual
  generateAlerts(hourBank: HourBank): HourBankAlert[] {
    const alerts: HourBankAlert[] = []
    const { currentBalance, maxPositiveBalance, maxNegativeBalance } = hourBank

    // Alerta de limite positivo
    if (currentBalance > maxPositiveBalance * 0.8) {
      alerts.push({
        type: currentBalance > maxPositiveBalance ? 'exceeded_limit' : 'approaching_limit',
        severity: currentBalance > maxPositiveBalance ? 'error' : 'warning',
        message: currentBalance > maxPositiveBalance 
          ? `Limite de banco de horas excedido (${this.formatMinutesToHours(currentBalance)})`
          : `Aproximando do limite de banco de horas (${this.formatMinutesToHours(currentBalance)})`,
        actionRequired: currentBalance > maxPositiveBalance,
        dueDate: this.getNextCompensationDate(hourBank.compensationPeriods)
      })
    }

    // Alerta de saldo negativo
    if (currentBalance < 0) {
      const negativeLimit = -maxNegativeBalance
      alerts.push({
        type: currentBalance < negativeLimit ? 'exceeded_limit' : 'negative_balance',
        severity: currentBalance < negativeLimit ? 'error' : 'warning',
        message: currentBalance < negativeLimit
          ? `Limite negativo de banco de horas excedido (${this.formatMinutesToHours(currentBalance)})`
          : `Saldo negativo no banco de horas (${this.formatMinutesToHours(currentBalance)})`,
        actionRequired: true,
        dueDate: this.getNextCompensationDate(hourBank.compensationPeriods)
      })
    }

    // Alertas de compensação
    const activeCompensations = hourBank.compensationPeriods.filter(p => p.status === 'active')
    activeCompensations.forEach(period => {
      const daysUntilEnd = this.getDaysUntilDate(period.endDate)
      if (daysUntilEnd <= 7) {
        alerts.push({
          type: 'compensation_due',
          severity: daysUntilEnd <= 3 ? 'error' : 'warning',
          message: `Período de compensação termina em ${daysUntilEnd} dias`,
          actionRequired: true,
          dueDate: period.endDate
        })
      }
    })

    return alerts
  }

  // Criar nova transação no banco de horas
  async createTransaction(transaction: Omit<HourBankTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<HourBankTransaction> {
    try {
      const response = await fetch(`${this.API_BASE}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction)
      })
      
      if (!response.ok) {
        throw new Error('Erro ao criar transação')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Erro ao criar transação:', error)
      throw error
    }
  }

  // Obter histórico de transações
  async getTransactionHistory(
    employeeId: string, 
    filters?: {
      startDate?: string
      endDate?: string
      type?: HourBankTransaction['type'][]
      status?: HourBankTransaction['status'][]
    }
  ): Promise<HourBankTransaction[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.type) params.append('type', filters.type.join(','))
      if (filters?.status) params.append('status', filters.status.join(','))

      const response = await fetch(`${this.API_BASE}/${employeeId}/transactions?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar histórico de transações')
      }
      return await response.json()
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
      return this.getMockTransactions(employeeId)
    }
  }

  // Calcular estatísticas do período
  calculatePeriodStats(transactions: HourBankTransaction[], startDate: string, endDate: string) {
    const periodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate)
    })

    const totalCredits = periodTransactions
      .filter(t => t.amount > 0 && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalDebits = Math.abs(periodTransactions
      .filter(t => t.amount < 0 && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0))

    return {
      period: this.formatPeriod(startDate, endDate),
      totalCredits,
      totalDebits,
      netBalance: totalCredits - totalDebits
    }
  }

  // Métodos auxiliares privados
  private getNextCompensationDate(periods: CompensationPeriod[]): string | undefined {
    const activePeriods = periods.filter(p => p.status === 'active')
    if (activePeriods.length === 0) return undefined
    
    return activePeriods
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())[0]
      .endDate
  }

  private getDaysUntilDate(dateString: string): number {
    const targetDate = new Date(dateString)
    const today = new Date()
    const diffTime = targetDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  private formatPeriod(startDate: string, endDate: string): string {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()
    
    // Se é o mês atual
    if (start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear()) {
      return 'Este mês'
    }
    
    // Se são os últimos 30 dias
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    if (start <= thirtyDaysAgo && end >= now) {
      return 'Últimos 30 dias'
    }
    
    return `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`
  }

  // Dados mock para desenvolvimento
  private getMockHourBank(employeeId: string): HourBank {
    const transactions = this.getMockTransactions(employeeId)
    const currentBalance = this.calculateCurrentBalance(transactions)
    
    return {
      id: `hb_${employeeId}`,
      employeeId,
      employeeName: 'João Silva',
      currentBalance,
      transactions,
      maxPositiveBalance: this.hoursToMinutes(40), // 40 horas
      maxNegativeBalance: this.hoursToMinutes(10), // 10 horas
      compensationPeriods: [
        {
          id: 'cp_1',
          employeeId,
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          targetBalance: 0,
          currentBalance,
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ],
      lastCalculatedAt: new Date().toISOString(),
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  }

  private getMockHourBankSummary(employeeId: string): HourBankSummary {
    const hourBank = this.getMockHourBank(employeeId)
    const periodStats = this.calculatePeriodStats(
      hourBank.transactions,
      '2024-01-01',
      new Date().toISOString().split('T')[0]
    )

    return {
      employeeId,
      employeeName: 'João Silva',
      currentBalance: hourBank.currentBalance,
      balanceInHours: this.formatMinutesToHours(hourBank.currentBalance),
      periodStats,
      upcomingCompensations: hourBank.compensationPeriods.filter(p => p.status === 'active'),
      alerts: this.generateAlerts(hourBank)
    }
  }

  private getMockTransactions(employeeId: string): HourBankTransaction[] {
    return [
      {
        id: 'tx_1',
        employeeId,
        date: '2024-01-15',
        type: 'credit',
        amount: 120, // 2 horas
        reason: 'Hora extra aprovada',
        description: 'Trabalho em projeto urgente',
        status: 'approved',
        approvedBy: 'manager_1',
        approvedAt: '2024-01-16T09:00:00Z',
        createdBy: 'system',
        createdAt: '2024-01-15T18:00:00Z',
        updatedAt: '2024-01-16T09:00:00Z'
      },
      {
        id: 'tx_2',
        employeeId,
        date: '2024-01-20',
        type: 'debit',
        amount: -60, // -1 hora
        reason: 'Saída antecipada',
        description: 'Consulta médica',
        status: 'approved',
        approvedBy: 'manager_1',
        approvedAt: '2024-01-20T14:00:00Z',
        createdBy: employeeId,
        createdAt: '2024-01-20T13:00:00Z',
        updatedAt: '2024-01-20T14:00:00Z'
      },
      {
        id: 'tx_3',
        employeeId,
        date: '2024-01-25',
        type: 'credit',
        amount: 90, // 1.5 horas
        reason: 'Compensação de feriado',
        description: 'Trabalho no feriado nacional',
        status: 'approved',
        approvedBy: 'hr_1',
        approvedAt: '2024-01-26T08:00:00Z',
        createdBy: 'system',
        createdAt: '2024-01-25T17:30:00Z',
        updatedAt: '2024-01-26T08:00:00Z'
      }
    ]
  }
}

export const hourBankService = new HourBankService()
export default hourBankService