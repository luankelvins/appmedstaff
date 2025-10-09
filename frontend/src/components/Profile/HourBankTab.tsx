import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar,
  History,
  Plus,
  Minus,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { 
  HourBankSummary, 
  HourBankTransaction, 
  HourBankAlert,
  CompensationPeriod 
} from '../../types/timeTracking'
import { hourBankService } from '../../utils/hourBankService'

interface HourBankTabProps {
  employeeId: string
}

export const HourBankTab: React.FC<HourBankTabProps> = ({ employeeId }) => {
  const [summary, setSummary] = useState<HourBankSummary | null>(null)
  const [transactions, setTransactions] = useState<HourBankTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [showTransactionHistory, setShowTransactionHistory] = useState(false)

  useEffect(() => {
    loadHourBankData()
  }, [employeeId, selectedPeriod])

  const loadHourBankData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [summaryData, transactionData] = await Promise.all([
        hourBankService.getHourBankSummary(employeeId),
        hourBankService.getTransactionHistory(employeeId, {
          startDate: getStartDateForPeriod(selectedPeriod),
          endDate: new Date().toISOString().split('T')[0]
        })
      ])

      setSummary(summaryData)
      setTransactions(transactionData)
    } catch (err) {
      setError('Erro ao carregar dados do banco de horas')
      console.error('Erro ao carregar banco de horas:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStartDateForPeriod = (period: 'month' | 'quarter' | 'year'): string => {
    const now = new Date()
    const start = new Date(now)
    
    switch (period) {
      case 'month':
        start.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        start.setMonth(now.getMonth() - 3)
        break
      case 'year':
        start.setFullYear(now.getFullYear() - 1)
        break
    }
    
    return start.toISOString().split('T')[0]
  }

  const getAlertIcon = (severity: HourBankAlert['severity']) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getTransactionIcon = (type: HourBankTransaction['type']) => {
    switch (type) {
      case 'credit':
        return <Plus className="w-4 h-4 text-green-500" />
      case 'debit':
        return <Minus className="w-4 h-4 text-red-500" />
      case 'compensation':
        return <Calendar className="w-4 h-4 text-blue-500" />
      case 'adjustment':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusIcon = (status: HourBankTransaction['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando banco de horas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
        <button
          onClick={loadHourBankData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nenhum dado de banco de horas encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Saldo Atual */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Saldo Atual do Banco de Horas
          </h3>
          <div className="flex items-center space-x-2">
            {summary.currentBalance > 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : summary.currentBalance < 0 ? (
              <TrendingDown className="w-5 h-5 text-red-500" />
            ) : (
              <Clock className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              summary.currentBalance > 0 ? 'text-green-600' : 
              summary.currentBalance < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {summary.balanceInHours}
            </div>
            <p className="text-sm text-gray-600 mt-1">Saldo Total</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">
              {hourBankService.formatMinutesToHours(summary.periodStats.totalCredits)}
            </div>
            <p className="text-sm text-gray-600 mt-1">Créditos ({summary.periodStats.period})</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-semibold text-red-600">
              {hourBankService.formatMinutesToHours(summary.periodStats.totalDebits)}
            </div>
            <p className="text-sm text-gray-600 mt-1">Débitos ({summary.periodStats.period})</p>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {summary.alerts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Alertas e Notificações
          </h3>
          <div className="space-y-3">
            {summary.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'error' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start">
                  {getAlertIcon(alert.severity)}
                  <div className="ml-3 flex-1">
                    <p className={`font-medium ${
                      alert.severity === 'error' ? 'text-red-800' :
                      alert.severity === 'warning' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {alert.message}
                    </p>
                    {alert.dueDate && (
                      <p className="text-sm text-gray-600 mt-1">
                        Prazo: {formatDate(alert.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Períodos de Compensação */}
      {summary.upcomingCompensations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Períodos de Compensação
          </h3>
          <div className="space-y-3">
            {summary.upcomingCompensations.map((period) => (
              <div key={period.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Meta: {hourBankService.formatMinutesToHours(period.targetBalance)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {hourBankService.formatMinutesToHours(period.currentBalance)}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      period.status === 'active' ? 'bg-green-100 text-green-800' :
                      period.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {period.status === 'active' ? 'Ativo' :
                       period.status === 'completed' ? 'Concluído' : 'Expirado'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de Transações */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <History className="w-5 h-5 mr-2" />
            Histórico de Movimentações
          </h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'month' | 'quarter' | 'year')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="month">Último mês</option>
              <option value="quarter">Últimos 3 meses</option>
              <option value="year">Último ano</option>
            </select>
            <button
              onClick={() => setShowTransactionHistory(!showTransactionHistory)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showTransactionHistory ? 'Ocultar' : 'Ver Detalhes'}
            </button>
          </div>
        </div>

        {showTransactionHistory && (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                Nenhuma movimentação encontrada no período selecionado
              </p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.reason}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {transaction.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(transaction.date)} às {formatTime(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}
                          {hourBankService.formatMinutesToHours(transaction.amount)}
                        </span>
                        {getStatusIcon(transaction.status)}
                      </div>
                      {transaction.status === 'approved' && transaction.approvedBy && (
                        <p className="text-xs text-gray-500 mt-1">
                          Aprovado em {formatDate(transaction.approvedAt!)}
                        </p>
                      )}
                      {transaction.status === 'rejected' && transaction.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Rejeitado: {transaction.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default HourBankTab