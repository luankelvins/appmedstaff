import React, { useState } from 'react'
import {
  FileText,
  Download,
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Filter,
  RefreshCw,
  Mail,
  Eye
} from 'lucide-react'
import {
  TimeRecord,
  ValidationStats,
  VALIDATION_STATUS_COLORS
} from '../types/timeValidation'

interface TimeValidationReportsProps {
  records: TimeRecord[]
  onGenerateReport: (config: ReportConfig) => void
  onExportReport: (format: 'pdf' | 'excel' | 'csv') => void
}

interface ReportConfig {
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  startDate: string
  endDate: string
  departments: string[]
  employees: string[]
  includeCharts: boolean
  includeDetails: boolean
}

interface GeneratedReport {
  id: string
  title: string
  type: ReportConfig['type']
  period: { startDate: string; endDate: string }
  stats: ValidationStats
  generatedAt: string
  status: 'completed' | 'processing'
}

const TimeValidationReports: React.FC<TimeValidationReportsProps> = ({
  records,
  onGenerateReport,
  onExportReport
}) => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'monthly',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    departments: [],
    employees: [],
    includeCharts: true,
    includeDetails: true
  })

  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([])
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Dados únicos para filtros
  const uniqueDepartments = [...new Set(records.map(r => r.department))]
  const uniqueEmployees = [...new Set(records.map(r => r.employeeName))]

  // Calcular estatísticas do período selecionado
  const calculatePeriodStats = (): ValidationStats => {
    const filteredRecords = records.filter(record => {
      const recordDate = new Date(record.date)
      const startDate = new Date(reportConfig.startDate)
      const endDate = new Date(reportConfig.endDate)
      
      return recordDate >= startDate && recordDate <= endDate
    })

    const totalRecords = filteredRecords.length
    const pendingValidation = filteredRecords.filter(r => r.status === 'pending').length
    const approved = filteredRecords.filter(r => r.status === 'approved').length
    const rejected = filteredRecords.filter(r => r.status === 'rejected').length
    const withIrregularities = filteredRecords.filter(r => r.irregularities.length > 0).length

    const totalHours = filteredRecords.reduce((sum, r) => sum + r.totalHours, 0)
    const totalOvertime = filteredRecords.reduce((sum, r) => sum + r.overtime, 0)
    const averageHoursPerEmployee = totalRecords > 0 ? totalHours / uniqueEmployees.length : 0

    // Calcular estatísticas por departamento
    const departmentStats: Record<string, { totalRecords: number; totalHours: number; irregularities: number }> = {}
    uniqueDepartments.forEach(dept => {
      const deptRecords = filteredRecords.filter(r => r.department === dept)
      departmentStats[dept] = {
        totalRecords: deptRecords.length,
        totalHours: deptRecords.reduce((sum, r) => sum + r.totalHours, 0),
        irregularities: deptRecords.reduce((sum, r) => sum + r.irregularities.length, 0)
      }
    })

    return {
      totalRecords,
      pendingValidation,
      approved,
      rejected,
      withIrregularities,
      totalHours,
      totalOvertime,
      averageHoursPerEmployee,
      departmentStats
    }
  }

  const stats = calculatePeriodStats()

  const generateReport = async () => {
    setIsGenerating(true)
    
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newReport: GeneratedReport = {
        id: `report_${Date.now()}`,
        title: getReportTitle(),
        type: reportConfig.type,
        period: {
          startDate: reportConfig.startDate,
          endDate: reportConfig.endDate
        },
        stats,
        generatedAt: new Date().toISOString(),
        status: 'completed'
      }

      setGeneratedReports(prev => [newReport, ...prev])
      setSelectedReport(newReport)
      onGenerateReport(reportConfig)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getReportTitle = (): string => {
    const typeNames = {
      daily: 'Relatório Diário',
      weekly: 'Relatório Semanal',
      monthly: 'Relatório Mensal',
      custom: 'Relatório Personalizado'
    }

    const startDate = new Date(reportConfig.startDate).toLocaleDateString('pt-BR')
    const endDate = new Date(reportConfig.endDate).toLocaleDateString('pt-BR')
    
    return `${typeNames[reportConfig.type]} - ${startDate} a ${endDate}`
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    onExportReport(format)
  }

  const complianceRate = stats.totalRecords > 0 ? ((stats.approved / stats.totalRecords) * 100) : 0
  const irregularityRate = stats.totalRecords > 0 ? ((stats.withIrregularities / stats.totalRecords) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios de Validação</h2>
          <p className="text-gray-600">Gere relatórios consolidados dos registros de ponto</p>
        </div>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Eye className="h-4 w-4 mr-2" />
          {previewMode ? 'Ocultar Preview' : 'Mostrar Preview'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuração do Relatório */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações do Relatório</h3>
            
            <div className="space-y-4">
              {/* Tipo de Relatório */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Relatório
                </label>
                <select
                  value={reportConfig.type}
                  onChange={(e) => setReportConfig(prev => ({ 
                    ...prev, 
                    type: e.target.value as ReportConfig['type'] 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Relatório Diário</option>
                  <option value="weekly">Relatório Semanal</option>
                  <option value="monthly">Relatório Mensal</option>
                  <option value="custom">Relatório Personalizado</option>
                </select>
              </div>

              {/* Período */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={reportConfig.startDate}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      startDate: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={reportConfig.endDate}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      endDate: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamentos
                </label>
                <select
                  multiple
                  value={reportConfig.departments}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    departments: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size={3}
                >
                  {uniqueDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Mantenha Ctrl pressionado para selecionar múltiplos</p>
              </div>

              {/* Opções */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeCharts}
                    onChange={(e) => setReportConfig(prev => ({ 
                      ...prev, 
                      includeCharts: e.target.checked 
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Incluir Gráficos</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeDetails}
                    onChange={(e) => setReportConfig(prev => ({ 
                      ...prev, 
                      includeDetails: e.target.checked 
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Incluir Detalhes</span>
                </label>
              </div>

              {/* Botão Gerar */}
              <button
                onClick={generateReport}
                disabled={isGenerating}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas do Período */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Estatísticas do Período</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total de Registros</span>
                <span className="text-lg font-semibold text-gray-900">{stats.totalRecords}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taxa de Conformidade</span>
                <span className="text-lg font-semibold text-green-600">
                  {complianceRate.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Com Irregularidades</span>
                <span className="text-lg font-semibold text-orange-600">{stats.withIrregularities}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Horas Extras</span>
                <span className="text-lg font-semibold text-blue-600">
                  {stats.totalOvertime.toFixed(1)}h
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Funcionários</span>
                <span className="text-lg font-semibold text-gray-900">{uniqueEmployees.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Departamentos</span>
                <span className="text-lg font-semibold text-gray-900">{uniqueDepartments.length}</span>
              </div>
            </div>
          </div>

          {/* Relatórios Gerados */}
          {generatedReports.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Relatórios Recentes</h3>
              
              <div className="space-y-3">
                {generatedReports.slice(0, 5).map((report) => (
                  <div
                    key={report.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedReport?.id === report.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{report.title}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        report.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status === 'completed' ? 'Concluído' : 'Processando'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(report.generatedAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview do Relatório */}
      {previewMode && selectedReport && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Preview do Relatório</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </button>
            </div>
          </div>

          {/* Conteúdo do Preview */}
          <div className="space-y-6">
            {/* Cabeçalho do Relatório */}
            <div className="text-center border-b border-gray-200 pb-4">
              <h1 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h1>
              <p className="text-gray-600 mt-2">
                Período: {new Date(selectedReport.period.startDate).toLocaleDateString('pt-BR')} a{' '}
                {new Date(selectedReport.period.endDate).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Gerado em {new Date(selectedReport.generatedAt).toLocaleString('pt-BR')}
              </p>
            </div>

            {/* Resumo Executivo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{selectedReport.stats.totalRecords}</div>
                <div className="text-sm text-gray-600">Total de Registros</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {complianceRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Taxa de Conformidade</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {selectedReport.stats.withIrregularities}
                </div>
                <div className="text-sm text-gray-600">Com Irregularidades</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedReport.stats.totalOvertime.toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600">Horas Extras</div>
              </div>
            </div>

            {/* Estatísticas por Departamento */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Estatísticas por Departamento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedReport.stats.departmentStats).map(([dept, stats]) => (
                  <div key={dept} className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">{dept}</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registros:</span>
                        <span className="font-medium">{stats.totalRecords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Horas:</span>
                        <span className="font-medium">{stats.totalHours.toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Irregularidades:</span>
                        <span className="font-medium text-orange-600">{stats.irregularities}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeValidationReports