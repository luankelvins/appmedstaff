import React, { useState, useEffect, useMemo } from 'react'
import { 
  Clock, 
  Calendar, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Download, 
  Lock, 
  Users, 
  TrendingUp,
  Search,
  RefreshCw,
  FileText,
  Settings,
  Eye,
  MoreHorizontal
} from 'lucide-react'
import {
  TimeRecord,
  TimeIrregularity,
  ValidationFilter,
  ValidationStats,
  MonthlyClosing,
  IRREGULARITY_TYPES,
  VALIDATION_STATUS_COLORS,
  SEVERITY_COLORS
} from '../types/timeValidation'

interface TimeValidationDashboardProps {
  onClose?: () => void
}

const TimeValidationDashboard: React.FC<TimeValidationDashboardProps> = ({ onClose }) => {
  // Estados principais
  const [currentView, setCurrentView] = useState<'overview' | 'validation' | 'reports' | 'closing'>('overview')
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<TimeRecord[]>([])
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Estados de filtros
  const [filters, setFilters] = useState<ValidationFilter>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    departments: [],
    employees: [],
    status: [],
    irregularityTypes: [],
    showOnlyWithIrregularities: false
  })

  // Estados de modais e painéis
  const [showFilters, setShowFilters] = useState(false)
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null)
  const [showClosingModal, setShowClosingModal] = useState(false)

  // Dados mockados para demonstração
  const mockTimeRecords: TimeRecord[] = [
    {
      id: '1',
      employeeId: 'emp1',
      employeeName: 'João Silva',
      employeeCpf: '123.456.789-00',
      department: 'Tecnologia',
      position: 'Desenvolvedor',
      date: '2024-01-15',
      clockIn: '08:00',
      clockOut: '17:30',
      breakStart: '12:00',
      breakEnd: '13:00',
      totalHours: 8.5,
      expectedHours: 8,
      overtime: 0.5,
      status: 'pending',
      irregularities: [
        {
          id: 'irr1',
          type: 'excessive_overtime',
          severity: 'medium',
          description: 'Hora extra de 30 minutos sem aprovação prévia',
          suggestedAction: 'Solicitar aprovação ou ajustar horário',
          autoCorrectible: false,
          resolved: false
        }
      ],
      corrections: [],
      createdAt: '2024-01-15T17:30:00Z',
      updatedAt: '2024-01-15T17:30:00Z'
    },
    {
      id: '2',
      employeeId: 'emp2',
      employeeName: 'Maria Santos',
      employeeCpf: '987.654.321-00',
      department: 'Recursos Humanos',
      position: 'Analista',
      date: '2024-01-15',
      clockIn: '08:15',
      clockOut: '17:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      totalHours: 7.75,
      expectedHours: 8,
      overtime: 0,
      status: 'pending',
      irregularities: [
        {
          id: 'irr2',
          type: 'late_arrival',
          severity: 'low',
          description: 'Chegada 15 minutos atrasada',
          suggestedAction: 'Verificar justificativa',
          autoCorrectible: true,
          resolved: false
        },
        {
          id: 'irr3',
          type: 'insufficient_hours',
          severity: 'medium',
          description: 'Jornada 15 minutos abaixo do esperado',
          suggestedAction: 'Compensar horas ou justificar',
          autoCorrectible: false,
          resolved: false
        }
      ],
      corrections: [],
      createdAt: '2024-01-15T17:00:00Z',
      updatedAt: '2024-01-15T17:00:00Z'
    },
    {
      id: '3',
      employeeId: 'emp3',
      employeeName: 'Carlos Oliveira',
      employeeCpf: '456.789.123-00',
      department: 'Vendas',
      position: 'Consultor',
      date: '2024-01-15',
      clockIn: '08:00',
      clockOut: '17:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      totalHours: 8,
      expectedHours: 8,
      overtime: 0,
      status: 'approved',
      irregularities: [],
      corrections: [],
      createdAt: '2024-01-15T17:00:00Z',
      updatedAt: '2024-01-15T18:00:00Z',
      validatedBy: 'admin',
      validatedAt: '2024-01-15T18:00:00Z'
    }
  ]

  // Estatísticas calculadas
  const stats: ValidationStats = useMemo(() => {
    const records = filteredRecords.length > 0 ? filteredRecords : timeRecords
    return {
      totalRecords: records.length,
      pendingValidation: records.filter(r => r.status === 'pending').length,
      approved: records.filter(r => r.status === 'approved').length,
      rejected: records.filter(r => r.status === 'rejected').length,
      withIrregularities: records.filter(r => r.irregularities.length > 0).length,
      totalHours: records.reduce((sum, r) => sum + r.totalHours, 0),
      totalOvertime: records.reduce((sum, r) => sum + r.overtime, 0),
      averageHoursPerEmployee: records.length > 0 ? records.reduce((sum, r) => sum + r.totalHours, 0) / records.length : 0,
      departmentStats: records.reduce((acc, record) => {
        if (!acc[record.department]) {
          acc[record.department] = { totalRecords: 0, totalHours: 0, irregularities: 0 }
        }
        acc[record.department].totalRecords++
        acc[record.department].totalHours += record.totalHours
        acc[record.department].irregularities += record.irregularities.length
        return acc
      }, {} as Record<string, { totalRecords: number; totalHours: number; irregularities: number }>)
    }
  }, [timeRecords, filteredRecords])

  // Inicialização dos dados
  useEffect(() => {
    setLoading(true)
    // Simular carregamento de dados
    setTimeout(() => {
      setTimeRecords(mockTimeRecords)
      setLoading(false)
    }, 1000)
  }, [])

  // Aplicar filtros
  useEffect(() => {
    let filtered = timeRecords

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeCpf.includes(searchTerm) ||
        record.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por data
    filtered = filtered.filter(record => {
      const recordDate = new Date(record.date)
      const startDate = new Date(filters.startDate)
      const endDate = new Date(filters.endDate)
      return recordDate >= startDate && recordDate <= endDate
    })

    // Filtro por departamento
    if (filters.departments.length > 0) {
      filtered = filtered.filter(record => filters.departments.includes(record.department))
    }

    // Filtro por funcionário
    if (filters.employees.length > 0) {
      filtered = filtered.filter(record => filters.employees.includes(record.employeeId))
    }

    // Filtro por status
    if (filters.status.length > 0) {
      filtered = filtered.filter(record => filters.status.includes(record.status))
    }

    // Filtro por tipo de irregularidade
    if (filters.irregularityTypes.length > 0) {
      filtered = filtered.filter(record => 
        record.irregularities.some(irr => filters.irregularityTypes.includes(irr.type))
      )
    }

    // Filtro apenas com irregularidades
    if (filters.showOnlyWithIrregularities) {
      filtered = filtered.filter(record => record.irregularities.length > 0)
    }

    setFilteredRecords(filtered)
  }, [timeRecords, filters, searchTerm])

  // Funções de ação
  const handleApproveRecord = (recordId: string) => {
    setTimeRecords(prev => prev.map(record => 
      record.id === recordId 
        ? { ...record, status: 'approved' as const, validatedBy: 'admin', validatedAt: new Date().toISOString() }
        : record
    ))
  }

  const handleRejectRecord = (recordId: string, reason?: string) => {
    setTimeRecords(prev => prev.map(record => 
      record.id === recordId 
        ? { ...record, status: 'rejected' as const, validatedBy: 'admin', validatedAt: new Date().toISOString(), notes: reason }
        : record
    ))
  }

  const handleBulkApprove = () => {
    setTimeRecords(prev => prev.map(record => 
      selectedRecords.includes(record.id)
        ? { ...record, status: 'approved' as const, validatedBy: 'admin', validatedAt: new Date().toISOString() }
        : record
    ))
    setSelectedRecords([])
  }

  const handleBulkReject = () => {
    setTimeRecords(prev => prev.map(record => 
      selectedRecords.includes(record.id)
        ? { ...record, status: 'rejected' as const, validatedBy: 'admin', validatedAt: new Date().toISOString() }
        : record
    ))
    setSelectedRecords([])
  }

  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    )
  }

  const selectAllRecords = () => {
    const pendingRecords = filteredRecords.filter(r => r.status === 'pending').map(r => r.id)
    setSelectedRecords(pendingRecords)
  }

  const clearSelection = () => {
    setSelectedRecords([])
  }

  // Renderização do cabeçalho
  const renderHeader = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Clock className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Validação de Pontos</h1>
            <p className="text-sm text-gray-500">Gerencie e valide os registros de ponto dos funcionários</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
          <button
            onClick={() => setLoading(true)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  )

  // Renderização da navegação
  const renderNavigation = () => (
    <div className="bg-white border-b border-gray-200 px-6">
      <nav className="flex space-x-8">
        {[
          { key: 'overview', label: 'Visão Geral', icon: TrendingUp },
          { key: 'validation', label: 'Validação', icon: CheckCircle },
          { key: 'reports', label: 'Relatórios', icon: FileText },
          { key: 'closing', label: 'Fechamento', icon: Lock }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setCurrentView(key as any)}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              currentView === key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )

  // Renderização das estatísticas
  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total de Registros</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalRecords}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pendentes</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.pendingValidation}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Com Irregularidades</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.withIrregularities}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Horas Extras</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalOvertime.toFixed(1)}h</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados de validação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      {renderNavigation()}
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderStats()}
        
        {/* Conteúdo principal será implementado nas próximas etapas */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentView === 'overview' && 'Visão Geral do Sistema'}
              {currentView === 'validation' && 'Interface de Validação'}
              {currentView === 'reports' && 'Geração de Relatórios'}
              {currentView === 'closing' && 'Fechamento Mensal'}
            </h3>
            <p className="text-gray-500">
              Esta seção será implementada nas próximas etapas do desenvolvimento.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeValidationDashboard