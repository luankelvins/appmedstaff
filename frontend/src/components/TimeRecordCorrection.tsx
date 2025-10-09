import React, { useState, useEffect } from 'react'
import {
  X,
  Clock,
  Save,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Calendar,
  User,
  Building,
  History,
  MessageSquare,
  FileText
} from 'lucide-react'
import {
  TimeRecord,
  TimeCorrection,
  TimeIrregularity,
  VALIDATION_STATUS_COLORS,
  SEVERITY_COLORS
} from '../types/timeValidation'

interface TimeRecordCorrectionProps {
  record: TimeRecord
  onSave: (correctedRecord: TimeRecord, corrections: TimeCorrection[]) => void
  onCancel: () => void
  isOpen: boolean
}

interface CorrectionForm {
  clockIn: string
  clockOut: string
  breakStart: string
  breakEnd: string
  reason: string
  notes: string
}

const TimeRecordCorrection: React.FC<TimeRecordCorrectionProps> = ({
  record,
  onSave,
  onCancel,
  isOpen
}) => {
  const [correctionForm, setCorrectionForm] = useState<CorrectionForm>({
    clockIn: record.clockIn || '',
    clockOut: record.clockOut || '',
    breakStart: record.breakStart || '',
    breakEnd: record.breakEnd || '',
    reason: '',
    notes: record.notes || ''
  })

  const [selectedIrregularities, setSelectedIrregularities] = useState<string[]>([])
  const [autoCorrections, setAutoCorrections] = useState<TimeCorrection[]>([])
  const [manualCorrections, setManualCorrections] = useState<TimeCorrection[]>([])
  const [calculatedHours, setCalculatedHours] = useState({
    totalHours: 0,
    overtime: 0,
    breakDuration: 0
  })

  // Calcular horas automaticamente quando os horários mudarem
  useEffect(() => {
    calculateHours()
  }, [correctionForm.clockIn, correctionForm.clockOut, correctionForm.breakStart, correctionForm.breakEnd])

  // Inicializar correções automáticas
  useEffect(() => {
    generateAutoCorrections()
  }, [record])

  const calculateHours = () => {
    const { clockIn, clockOut, breakStart, breakEnd } = correctionForm
    
    if (!clockIn || !clockOut) {
      setCalculatedHours({ totalHours: 0, overtime: 0, breakDuration: 0 })
      return
    }

    const startMinutes = timeToMinutes(clockIn)
    const endMinutes = timeToMinutes(clockOut)
    let totalMinutes = endMinutes - startMinutes

    // Calcular duração do intervalo
    let breakMinutes = 0
    if (breakStart && breakEnd) {
      breakMinutes = timeToMinutes(breakEnd) - timeToMinutes(breakStart)
    }

    // Subtrair intervalo do total
    totalMinutes -= breakMinutes

    const totalHours = totalMinutes / 60
    const overtime = Math.max(0, totalHours - record.expectedHours)

    setCalculatedHours({
      totalHours: Math.max(0, totalHours),
      overtime,
      breakDuration: breakMinutes
    })
  }

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const generateAutoCorrections = () => {
    const corrections: TimeCorrection[] = []
    
    record.irregularities.forEach(irregularity => {
      if (irregularity.autoCorrectible && !irregularity.resolved) {
        let correction: Partial<TimeCorrection> = {
          id: `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timeRecordId: record.id,
          reason: `Correção automática: ${irregularity.description}`,
          correctedBy: 'system',
          correctedAt: new Date().toISOString(),
          approved: false
        }

        switch (irregularity.type) {
          case 'excessive_break':
            if (record.breakStart && record.breakEnd) {
              const breakStart = timeToMinutes(record.breakStart)
              const standardBreak = 60 // 1 hora padrão
              const correctedEnd = minutesToTime(breakStart + standardBreak)
              
              correction = {
                ...correction,
                field: 'breakEnd',
                originalValue: record.breakEnd,
                correctedValue: correctedEnd
              }
            }
            break

          case 'late_arrival':
            if (record.clockIn) {
              // Sugerir horário padrão de entrada
              correction = {
                ...correction,
                field: 'clockIn',
                originalValue: record.clockIn,
                correctedValue: '08:00'
              }
            }
            break

          case 'early_departure':
            if (record.clockOut) {
              // Sugerir horário padrão de saída
              correction = {
                ...correction,
                field: 'clockOut',
                originalValue: record.clockOut,
                correctedValue: '17:00'
              }
            }
            break
        }

        if (correction.field) {
          corrections.push(correction as TimeCorrection)
        }
      }
    })

    setAutoCorrections(corrections)
  }

  const applyAutoCorrection = (correction: TimeCorrection) => {
    setCorrectionForm(prev => ({
      ...prev,
      [correction.field]: correction.correctedValue,
      reason: prev.reason ? `${prev.reason}; ${correction.reason}` : correction.reason
    }))

    // Mover para correções manuais para aprovação
    setManualCorrections(prev => [...prev, { ...correction, approved: true }])
    setAutoCorrections(prev => prev.filter(c => c.id !== correction.id))
  }

  const handleInputChange = (field: keyof CorrectionForm, value: string) => {
    setCorrectionForm(prev => ({ ...prev, [field]: value }))

    // Se for uma mudança manual de horário, criar correção
    if (['clockIn', 'clockOut', 'breakStart', 'breakEnd'].includes(field)) {
      const originalValue = record[field as keyof TimeRecord] as string
      if (originalValue && originalValue !== value && value) {
        const existingCorrection = manualCorrections.find(c => c.field === field)
        
        if (existingCorrection) {
          // Atualizar correção existente
          setManualCorrections(prev => prev.map(c => 
            c.field === field 
              ? { ...c, correctedValue: value, correctedAt: new Date().toISOString() }
              : c
          ))
        } else {
          // Criar nova correção
          const newCorrection: TimeCorrection = {
            id: `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timeRecordId: record.id,
            field: field as any,
            originalValue,
            correctedValue: value,
            reason: correctionForm.reason || 'Correção manual',
            correctedBy: 'admin',
            correctedAt: new Date().toISOString(),
            approved: true
          }
          setManualCorrections(prev => [...prev, newCorrection])
        }
      }
    }
  }

  const toggleIrregularityResolution = (irregularityId: string) => {
    setSelectedIrregularities(prev => 
      prev.includes(irregularityId)
        ? prev.filter(id => id !== irregularityId)
        : [...prev, irregularityId]
    )
  }

  const handleSave = () => {
    // Criar registro corrigido
    const correctedRecord: TimeRecord = {
      ...record,
      clockIn: correctionForm.clockIn || undefined,
      clockOut: correctionForm.clockOut || undefined,
      breakStart: correctionForm.breakStart || undefined,
      breakEnd: correctionForm.breakEnd || undefined,
      totalHours: calculatedHours.totalHours,
      overtime: calculatedHours.overtime,
      status: 'corrected',
      notes: correctionForm.notes,
      irregularities: record.irregularities.map(irr => ({
        ...irr,
        resolved: selectedIrregularities.includes(irr.id),
        resolvedBy: selectedIrregularities.includes(irr.id) ? 'admin' : undefined,
        resolvedAt: selectedIrregularities.includes(irr.id) ? new Date().toISOString() : undefined,
        resolution: selectedIrregularities.includes(irr.id) ? correctionForm.reason : undefined
      })),
      corrections: [...record.corrections, ...manualCorrections],
      updatedAt: new Date().toISOString()
    }

    onSave(correctedRecord, manualCorrections)
  }

  const getSeverityIcon = (severity: TimeIrregularity['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCancel} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center">
              <Edit3 className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <h2 className="text-lg font-medium text-gray-900">Correção de Registro</h2>
                <p className="text-sm text-gray-500">
                  {record.employeeName} • {new Date(record.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="rounded-md p-2 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Informações do Funcionário */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Informações do Funcionário
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nome:</span>
                    <span className="font-medium">{record.employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">CPF:</span>
                    <span className="font-medium">{record.employeeCpf}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Departamento:</span>
                    <span className="font-medium">{record.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cargo:</span>
                    <span className="font-medium">{record.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data:</span>
                    <span className="font-medium">{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Resumo de Horas */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Resumo de Horas
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Horas Esperadas:</span>
                    <span className="font-medium">{record.expectedHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Horas Calculadas:</span>
                    <span className="font-medium text-blue-600">{calculatedHours.totalHours.toFixed(2)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hora Extra:</span>
                    <span className={`font-medium ${calculatedHours.overtime > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {calculatedHours.overtime.toFixed(2)}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Intervalo:</span>
                    <span className="font-medium">{Math.floor(calculatedHours.breakDuration / 60)}h {calculatedHours.breakDuration % 60}min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário de Correção */}
            <div className="px-6 pb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Horários</h3>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entrada
                    </label>
                    <input
                      type="time"
                      value={correctionForm.clockIn}
                      onChange={(e) => handleInputChange('clockIn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {record.clockIn !== correctionForm.clockIn && record.clockIn && (
                      <p className="text-xs text-gray-500 mt-1">Original: {record.clockIn}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Saída
                    </label>
                    <input
                      type="time"
                      value={correctionForm.clockOut}
                      onChange={(e) => handleInputChange('clockOut', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {record.clockOut !== correctionForm.clockOut && record.clockOut && (
                      <p className="text-xs text-gray-500 mt-1">Original: {record.clockOut}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Início Intervalo
                    </label>
                    <input
                      type="time"
                      value={correctionForm.breakStart}
                      onChange={(e) => handleInputChange('breakStart', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {record.breakStart !== correctionForm.breakStart && record.breakStart && (
                      <p className="text-xs text-gray-500 mt-1">Original: {record.breakStart}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fim Intervalo
                    </label>
                    <input
                      type="time"
                      value={correctionForm.breakEnd}
                      onChange={(e) => handleInputChange('breakEnd', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {record.breakEnd !== correctionForm.breakEnd && record.breakEnd && (
                      <p className="text-xs text-gray-500 mt-1">Original: {record.breakEnd}</p>
                    )}
                  </div>
                </div>

                {/* Motivo da Correção */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo da Correção
                  </label>
                  <input
                    type="text"
                    value={correctionForm.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    placeholder="Descreva o motivo da correção..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Observações */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={correctionForm.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Observações adicionais..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Irregularidades */}
              {record.irregularities.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                    Irregularidades Detectadas
                  </h3>
                  
                  <div className="space-y-3">
                    {record.irregularities.map((irregularity) => (
                      <div key={irregularity.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getSeverityIcon(irregularity.severity)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${SEVERITY_COLORS[irregularity.severity]}`}>
                                  {irregularity.severity.toUpperCase()}
                                </span>
                                {irregularity.autoCorrectible && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    AUTO-CORRIGÍVEL
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                {irregularity.description}
                              </p>
                              <p className="text-sm text-gray-600">
                                {irregularity.suggestedAction}
                              </p>
                            </div>
                          </div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedIrregularities.includes(irregularity.id)}
                              onChange={() => toggleIrregularityResolution(irregularity.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Resolvido</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Correções Automáticas Sugeridas */}
              {autoCorrections.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Correções Automáticas Sugeridas
                  </h3>
                  
                  <div className="space-y-3">
                    {autoCorrections.map((correction) => (
                      <div key={correction.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {correction.field === 'clockIn' && 'Entrada'}
                              {correction.field === 'clockOut' && 'Saída'}
                              {correction.field === 'breakStart' && 'Início do Intervalo'}
                              {correction.field === 'breakEnd' && 'Fim do Intervalo'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {correction.originalValue} → {correction.correctedValue}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {correction.reason}
                            </p>
                          </div>
                          <button
                            onClick={() => applyAutoCorrection(correction)}
                            className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200"
                          >
                            Aplicar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rodapé */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Correções
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeRecordCorrection