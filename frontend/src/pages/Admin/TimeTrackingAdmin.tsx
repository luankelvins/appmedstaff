import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  Users, 
  Calendar, 
  BarChart3, 
  Download, 
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  FileText,
  Settings
} from 'lucide-react'
import { timeTrackingService } from '../../utils/timeTrackingService'
import { 
  TimeEntry, 
  TimeDashboardStats, 
  EmployeeTimeStatus, 
  TimeReportFilter,
  TimeReport 
} from '../../types/timeTracking'

const TimeTrackingAdmin: React.FC = () => {
  const [stats, setStats] = useState<TimeDashboardStats | null>(null)
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeTimeStatus[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [reports, setReports] = useState<TimeReport[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'entries' | 'reports'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [dashboardStats, employeeStatusList] = await Promise.all([
        timeTrackingService.getDashboardStats(),
        timeTrackingService.getEmployeeStatuses(['emp1', 'emp2', 'emp3']) // Mock employee IDs
      ])
      
      setStats(dashboardStats)
      setEmployeeStatuses(employeeStatusList)
      
      // Carregar entradas de tempo do dia atual
      const today = new Date().toISOString().split('T')[0]
      const entries = await timeTrackingService.getTimeEntries({
        dateFrom: today,
        dateTo: today
      })
      setTimeEntries(entries)
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReports = async () => {
    try {
      const reportFilter: TimeReportFilter = {
        period: {
          start: dateFilter.dateFrom,
          end: dateFilter.dateTo
        },
        includeAbsences: true,
        includeOvertime: true,
        groupBy: 'employee'
      }
      const reportData = await timeTrackingService.generateTimeReport(reportFilter, ['emp1', 'emp2', 'emp3'])
      setReports([reportData])
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const reportFilter: TimeReportFilter = {
        period: {
          start: dateFilter.dateFrom,
          end: dateFilter.dateTo
        },
        includeAbsences: true,
        includeOvertime: true,
        groupBy: 'employee'
      }
      // Simular exportação
      console.log(`Exportando relatório em formato ${format}`, reportFilter)
      alert(`Relatório ${format.toUpperCase()} será baixado em breve`)
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'on_break':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'finished':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'working':
        return 'Trabalhando'
      case 'on_break':
        return 'Em Intervalo'
      case 'finished':
        return 'Finalizado'
      case 'absent':
        return 'Ausente'
      case 'not_started':
        return 'Não Iniciado'
      default:
        return 'Desconhecido'
    }
  }

  const filteredEmployees = employeeStatuses.filter(employee =>
    employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEntries = timeEntries.filter(entry =>
    entry.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administração de Pontos</h1>
          <p className="text-gray-600">Gerencie registros de ponto e horários de trabalho</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => loadReports()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <BarChart3 className="w-4 h-4" />
            Gerar Relatório
          </button>
          <button
            onClick={() => exportReport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'employees', label: 'Time Interno', icon: Users },
            { id: 'entries', label: 'Registros', icon: Clock },
            { id: 'reports', label: 'Relatórios', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total do Time Interno</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.today.totalEmployees}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Presentes Hoje</p>
                  <p className="text-2xl font-bold text-green-600">{stats.today.presentEmployees}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ausentes Hoje</p>
                  <p className="text-2xl font-bold text-red-600">{stats.today.absentEmployees}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Atrasos Hoje</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.today.lateEmployees}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Atividade Recente</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {timeEntries.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Membro {entry.employeeId}</p>
                        <p className="text-sm text-gray-600">
                          Entrada: {entry.clockIn?.timestamp ? new Date(entry.clockIn.timestamp).toLocaleTimeString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.clockIn?.location && <MapPin className="w-4 h-4 text-gray-400" />}
                      {getStatusIcon(entry.status || 'not_started')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar membros do time interno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {/* Employees List */}
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membro do Time Interno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horas Trabalhadas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Atraso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.employeeName}</div>
                            <div className="text-sm text-gray-500">ID: {employee.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(employee.currentStatus)}
                          <span className="text-sm text-gray-900">{getStatusText(employee.currentStatus)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.floor(employee.todayWorkedMinutes / 60)}h {employee.todayWorkedMinutes % 60}m
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee.isLate ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {employee.minutesLate}min
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            No prazo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Ver Detalhes</button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Settings className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Entries Tab */}
      {activeTab === 'entries' && (
        <div className="space-y-6">
          {/* Date Filter */}
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
              <input
                type="date"
                value={dateFilter.dateFrom}
                onChange={(e) => setDateFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
              <input
                type="date"
                value={dateFilter.dateTo}
                onChange={(e) => setDateFilter(prev => ({ ...prev, dateTo: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Filtrar
            </button>
          </div>

          {/* Entries List */}
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membro do Time Interno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entrada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saída
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localização
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.employeeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.clockIn?.timestamp ? new Date(entry.clockIn.timestamp).toLocaleTimeString('pt-BR') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.clockOut?.timestamp ? new Date(entry.clockOut.timestamp).toLocaleTimeString('pt-BR') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.totalWorkedMinutes ? `${Math.floor(entry.totalWorkedMinutes / 60)}h ${entry.totalWorkedMinutes % 60}m` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(entry.clockIn?.location || entry.clockOut?.location) ? (
                          <MapPin className="w-4 h-4 text-green-600" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gerar Relatórios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => exportReport('excel')}
                className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-5 h-5 text-green-600" />
                <span>Relatório Excel</span>
              </button>
              <button
                onClick={() => exportReport('pdf')}
                className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FileText className="w-5 h-5 text-red-600" />
                <span>Relatório PDF</span>
              </button>
              <button
                onClick={loadReports}
                className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Análise Detalhada</span>
              </button>
            </div>
          </div>

          {reports.length > 0 && (
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Últimos Relatórios</h3>
              <div className="space-y-4">
                {reports.map((report, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">Relatório de Ponto - {report.employeeName}</h4>
                        <p className="text-sm text-gray-600">
                          Período: {report.period.start} até {report.period.end}
                        </p>
                        <p className="text-sm text-gray-600">
                          Dias trabalhados: {report.workedDays} de {report.totalDays}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Visualizar
                        </button>
                        <button className="text-green-600 hover:text-green-800 text-sm">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TimeTrackingAdmin