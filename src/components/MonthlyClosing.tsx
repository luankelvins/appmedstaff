import React, { useState, useEffect } from 'react'
import { Calendar, CheckCircle, XCircle, AlertTriangle, Lock, Unlock, Download, Clock, Users, FileText, TrendingUp } from 'lucide-react'
import { MonthlyClosing as MonthlyClosingType } from '../types/timeValidation'

interface ValidationStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  description: string
  severity: 'low' | 'medium' | 'high'
}

interface MonthlyStats {
  totalEmployees: number
  totalRecords: number
  totalHours: number
  totalOvertime: number
  pendingRecords: number
  irregularitiesCount: number
}

const MonthlyClosing: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2024-03')
  const [closingStatus, setClosingStatus] = useState<'idle' | 'validating' | 'closing' | 'completed'>('idle')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showReopenModal, setShowReopenModal] = useState(false)
  const [validationSteps, setValidationSteps] = useState<ValidationStep[]>([])
  const [closingSteps, setClosingSteps] = useState<ValidationStep[]>([])
  const [closedMonths, setClosedMonths] = useState<MonthlyClosingType[]>([])

  // Dados mockados de meses fechados
  useEffect(() => {
    const mockClosedMonths: MonthlyClosingType[] = [
      {
        id: 'closing_2024_01',
        month: 1,
        year: 2024,
        status: 'closed',
        totalEmployees: 25,
        totalRecords: 450,
        totalHours: 4200,
        totalOvertime: 180,
        irregularitiesResolved: 12,
        pendingIrregularities: 0,
        closedBy: 'admin',
        closedAt: '2024-02-05T10:30:00Z',
        approvedBy: 'manager',
        approvedAt: '2024-02-05T14:20:00Z'
      },
      {
        id: 'closing_2024_02',
        month: 2,
        year: 2024,
        status: 'closed',
        totalEmployees: 24,
        totalRecords: 420,
        totalHours: 3950,
        totalOvertime: 165,
        irregularitiesResolved: 8,
        pendingIrregularities: 0,
        closedBy: 'admin',
        closedAt: '2024-03-03T09:15:00Z',
        approvedBy: 'manager',
        approvedAt: '2024-03-03T11:45:00Z'
      }
    ]
    setClosedMonths(mockClosedMonths)
  }, [])

  // Funções auxiliares para conversão de formato
  const getMonthYearFromClosing = (closing: MonthlyClosingType): string => {
    return `${closing.year}-${closing.month.toString().padStart(2, '0')}`
  }

  const parseSelectedMonth = (monthYear: string): { month: number; year: number } => {
    const [year, month] = monthYear.split('-').map(Number)
    return { month, year }
  }

  // Verificar se o mês já está fechado
  const isMonthClosed = closedMonths.some(closing => getMonthYearFromClosing(closing) === selectedMonth)
  const closedMonthData = closedMonths.find(closing => getMonthYearFromClosing(closing) === selectedMonth)

  // Calcular estatísticas do mês
  const calculateMonthlyStats = (): MonthlyStats => {
    return {
      totalEmployees: 25,
      totalRecords: 480,
      totalHours: 4320,
      totalOvertime: 120,
      pendingRecords: isMonthClosed ? 0 : 15,
      irregularitiesCount: isMonthClosed ? 0 : 3
    }
  }

  const monthlyStats = calculateMonthlyStats()

  // Executar validações de fechamento
  const runClosingValidations = async (): Promise<ValidationStep[]> => {
    const validations: ValidationStep[] = [
      {
        id: 'pending_records',
        name: 'Registros pendentes',
        status: monthlyStats.pendingRecords === 0 ? 'completed' : 'failed',
        description: monthlyStats.pendingRecords === 0 
          ? 'Todos os registros foram validados'
          : `${monthlyStats.pendingRecords} registros ainda pendentes`,
        severity: monthlyStats.pendingRecords > 0 ? 'high' : 'low'
      },
      {
        id: 'irregularities',
        name: 'Irregularidades',
        status: monthlyStats.irregularitiesCount === 0 ? 'completed' : 'failed',
        description: monthlyStats.irregularitiesCount === 0
          ? 'Todas as irregularidades foram resolvidas'
          : `${monthlyStats.irregularitiesCount} irregularidades não resolvidas`,
        severity: monthlyStats.irregularitiesCount > 0 ? 'high' : 'low'
      },
      {
        id: 'backup',
        name: 'Backup dos dados',
        status: 'completed',
        description: 'Backup dos dados realizado com sucesso',
        severity: 'low'
      }
    ]

    return validations
  }

  // Executar processo de fechamento
  const executeClosing = async () => {
    setClosingStatus('validating')
    
    // Executar validações
    const validations = await runClosingValidations()
    setValidationSteps(validations)

    // Verificar se todas as validações passaram
    const hasFailedValidations = validations.some(v => v.status === 'failed')
    
    if (hasFailedValidations) {
      setClosingStatus('idle')
      return
    }

    // Executar etapas de fechamento
    setClosingStatus('closing')
    
    const steps: ValidationStep[] = [
      {
        id: 'calculate_totals',
        name: 'Calcular totais',
        status: 'pending',
        description: 'Calculando totais de horas e overtime',
        severity: 'low'
      },
      {
        id: 'generate_reports',
        name: 'Gerar relatórios',
        status: 'pending',
        description: 'Gerando relatórios consolidados',
        severity: 'low'
      },
      {
        id: 'lock_records',
        name: 'Bloquear registros',
        status: 'pending',
        description: 'Bloqueando registros para edição',
        severity: 'low'
      },
      {
        id: 'finalize',
        name: 'Finalizar fechamento',
        status: 'pending',
        description: 'Finalizando processo de fechamento',
        severity: 'low'
      }
    ]

    setClosingSteps(steps)

    // Simular execução das etapas
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setClosingSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'completed' }
          : index < i 
            ? step 
            : { ...step, status: index === i + 1 ? 'running' : 'pending' }
      ))
    }

    // Adicionar mês fechado
    const { month, year } = parseSelectedMonth(selectedMonth)
    const newClosing: MonthlyClosingType = {
      id: `closing_${year}_${month.toString().padStart(2, '0')}`,
      month,
      year,
      status: 'closed',
      totalEmployees: monthlyStats.totalEmployees,
      totalRecords: monthlyStats.totalRecords,
      totalHours: monthlyStats.totalHours,
      totalOvertime: monthlyStats.totalOvertime,
      irregularitiesResolved: 3,
      pendingIrregularities: 0,
      closedBy: 'admin',
      closedAt: new Date().toISOString(),
      approvedBy: 'manager',
      approvedAt: new Date().toISOString()
    }

    setClosedMonths(prev => [...prev, newClosing])
    setClosingStatus('completed')
    setShowConfirmModal(false)
  }

  // Reabrir mês
  const reopenMonth = () => {
    setClosedMonths(prev => prev.filter(closing => getMonthYearFromClosing(closing) !== selectedMonth))
    setShowReopenModal(false)
  }

  const getStatusIcon = (status: ValidationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getSeverityColor = (severity: ValidationStep['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fechamento Mensal</h2>
          <p className="text-gray-600">Gerencie o fechamento dos registros de ponto mensais</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Status do Mês */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Status do Mês: {selectedMonth}
          </h3>
          
          {isMonthClosed ? (
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-green-500" />
              <span className="text-green-600 font-medium">Fechado</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Unlock className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-600 font-medium">Aberto</span>
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-blue-600">Funcionários</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{monthlyStats.totalEmployees}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600">Registros</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{monthlyStats.totalRecords}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-purple-600">Horas Totais</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{monthlyStats.totalHours}h</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-orange-600">Overtime</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">{monthlyStats.totalOvertime}h</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            {!isMonthClosed ? (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={closingStatus !== 'idle'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>Fechar Mês</span>
              </button>
            ) : (
              <button
                onClick={() => setShowReopenModal(true)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Reabrir Mês</span>
              </button>
            )}
            
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exportar Relatório</span>
            </button>
          </div>

          {monthlyStats.pendingRecords > 0 && (
            <div className="flex items-center space-x-2 text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">{monthlyStats.pendingRecords} registros pendentes</span>
            </div>
          )}
        </div>
      </div>

      {/* Validações de Fechamento */}
      {validationSteps.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Validações de Fechamento</h3>
          
          <div className="space-y-3">
            {validationSteps.map((step) => (
              <div key={step.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(step.status)}
                  <div>
                    <p className="font-medium text-gray-900">{step.name}</p>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(step.severity)}`}>
                  {step.severity === 'high' ? 'Alta' : step.severity === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Etapas de Fechamento */}
      {closingSteps.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso do Fechamento</h3>
          
          <div className="space-y-3">
            {closingSteps.map((step) => (
              <div key={step.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200">
                {getStatusIcon(step.status)}
                <div>
                  <p className="font-medium text-gray-900">{step.name}</p>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de Fechamentos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Fechamentos</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funcionários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas Totais
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechado por
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {closedMonths.map((closing) => (
                <tr key={closing.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getMonthYearFromClosing(closing)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Lock className="w-3 h-3 mr-1" />
                      Fechado
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {closing.totalEmployees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {closing.totalHours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {closing.closedAt ? new Date(closing.closedAt).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {closing.closedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação de Fechamento */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Fechamento</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja fechar o mês {selectedMonth}? Esta ação não pode ser desfeita facilmente.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={executeClosing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmar Fechamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Reabertura */}
      {showReopenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Reabertura</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja reabrir o mês {selectedMonth}? Os registros voltarão a ficar editáveis.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={reopenMonth}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Confirmar Reabertura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MonthlyClosing