import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  Users,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { WorkSchedule, WorkDay, WorkShift, BreakConfig } from '../types/timeTracking'
import { timeTrackingService } from '../utils/timeTrackingService'

const WorkScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null)
  const [formData, setFormData] = useState<Partial<WorkSchedule>>({})

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      const data = await timeTrackingService.getWorkSchedules()
      setSchedules(data)
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchedule = () => {
    setEditingSchedule(null)
    setFormData({
      name: '',
      description: '',
      type: 'fixed',
      isActive: true,
      workDays: getDefaultWorkDays(),
      tolerance: { entryMinutes: 10, exitMinutes: 10, lunchMinutes: 15 },
      breaks: [],
      allowOvertime: true,
      requireJustification: true
    })
    setShowForm(true)
  }

  const handleEditSchedule = (schedule: WorkSchedule) => {
    setEditingSchedule(schedule)
    setFormData(schedule)
    setShowForm(true)
  }

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este horário?')) {
      try {
        await timeTrackingService.deleteWorkSchedule(id)
        await loadSchedules()
      } catch (error) {
        console.error('Erro ao excluir horário:', error)
      }
    }
  }

  const handleSaveSchedule = async () => {
    try {
      if (editingSchedule) {
        await timeTrackingService.updateWorkSchedule(editingSchedule.id, formData)
      } else {
        await timeTrackingService.createWorkSchedule(formData as Omit<WorkSchedule, 'id' | 'createdAt' | 'updatedAt'>)
      }
      setShowForm(false)
      await loadSchedules()
    } catch (error) {
      console.error('Erro ao salvar horário:', error)
    }
  }

  const getDefaultWorkDays = (): WorkDay[] => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return days.map((_, index) => ({
      dayOfWeek: index as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      isWorkDay: index >= 1 && index <= 5, // Segunda a sexta
      shifts: index >= 1 && index <= 5 ? [{
        id: `shift_${index}`,
        name: 'Horário Padrão',
        startTime: '08:00',
        endTime: '18:00',
        isFlexible: false
      }] : []
    }))
  }

  const updateWorkDay = (dayIndex: number, updates: Partial<WorkDay>) => {
    const newWorkDays = [...(formData.workDays || [])]
    newWorkDays[dayIndex] = { ...newWorkDays[dayIndex], ...updates }
    setFormData({ ...formData, workDays: newWorkDays })
  }

  const addShiftToDay = (dayIndex: number) => {
    const newWorkDays = [...(formData.workDays || [])]
    const newShift: WorkShift = {
      id: `shift_${Date.now()}`,
      name: 'Novo Turno',
      startTime: '08:00',
      endTime: '17:00',
      isFlexible: false
    }
    newWorkDays[dayIndex].shifts.push(newShift)
    setFormData({ ...formData, workDays: newWorkDays })
  }

  const updateShift = (dayIndex: number, shiftIndex: number, updates: Partial<WorkShift>) => {
    const newWorkDays = [...(formData.workDays || [])]
    newWorkDays[dayIndex].shifts[shiftIndex] = { 
      ...newWorkDays[dayIndex].shifts[shiftIndex], 
      ...updates 
    }
    setFormData({ ...formData, workDays: newWorkDays })
  }

  const removeShift = (dayIndex: number, shiftIndex: number) => {
    const newWorkDays = [...(formData.workDays || [])]
    newWorkDays[dayIndex].shifts.splice(shiftIndex, 1)
    setFormData({ ...formData, workDays: newWorkDays })
  }

  const addBreak = () => {
    const newBreak: BreakConfig = {
      id: `break_${Date.now()}`,
      name: 'Novo Intervalo',
      startTime: '12:00',
      endTime: '13:00',
      isPaid: false,
      isRequired: true,
      minimumDuration: 60,
      maximumDuration: 90
    }
    setFormData({ 
      ...formData, 
      breaks: [...(formData.breaks || []), newBreak] 
    })
  }

  const updateBreak = (index: number, updates: Partial<BreakConfig>) => {
    const newBreaks = [...(formData.breaks || [])]
    newBreaks[index] = { ...newBreaks[index], ...updates }
    setFormData({ ...formData, breaks: newBreaks })
  }

  const removeBreak = (index: number) => {
    const newBreaks = [...(formData.breaks || [])]
    newBreaks.splice(index, 1)
    setFormData({ ...formData, breaks: newBreaks })
  }

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Horários de Trabalho</h1>
          <p className="text-gray-600">Configure os horários de trabalho para diferentes equipes e membros do time interno</p>
        </div>
        <button
          onClick={handleCreateSchedule}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Horário
        </button>
      </div>

      {/* Lista de Horários */}
      <div className="grid gap-6 mb-8">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{schedule.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    schedule.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {schedule.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    schedule.type === 'fixed' ? 'bg-blue-100 text-blue-800' :
                    schedule.type === 'flexible' ? 'bg-purple-100 text-purple-800' :
                    schedule.type === 'shift' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {schedule.type === 'fixed' ? 'Fixo' :
                     schedule.type === 'flexible' ? 'Flexível' :
                     schedule.type === 'shift' ? 'Turnos' : 'Remoto'}
                  </span>
                </div>
                {schedule.description && (
                  <p className="text-gray-600 text-sm">{schedule.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditSchedule(schedule)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Resumo dos Dias de Trabalho */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {schedule.workDays.map((day, index) => (
                <div
                  key={index}
                  className={`text-center p-2 rounded-lg text-sm ${
                    day.isWorkDay 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <div className="font-medium">{dayNames[index]}</div>
                  {day.isWorkDay && day.shifts.length > 0 && (
                    <div className="text-xs mt-1">
                      {day.shifts[0].startTime} - {day.shifts[0].endTime}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Configurações de Tolerância */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Entrada: ±{schedule.tolerance.entryMinutes}min
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Saída: ±{schedule.tolerance.exitMinutes}min
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Intervalos: {schedule.breaks.length}
              </div>
              {schedule.allowOvertime && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Hora extra permitida
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSchedule ? 'Editar Horário' : 'Novo Horário'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Horário *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Horário Comercial"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Horário
                  </label>
                  <select
                    value={formData.type || 'fixed'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="fixed">Fixo</option>
                    <option value="flexible">Flexível</option>
                    <option value="shift">Turnos</option>
                    <option value="remote">Remoto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva as características deste horário..."
                />
              </div>

              {/* Configurações de Tolerância */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tolerâncias</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entrada (minutos)
                    </label>
                    <input
                      type="number"
                      value={formData.tolerance?.entryMinutes || 10}
                      onChange={(e) => setFormData({
                        ...formData,
                        tolerance: {
                          ...formData.tolerance!,
                          entryMinutes: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Saída (minutos)
                    </label>
                    <input
                      type="number"
                      value={formData.tolerance?.exitMinutes || 10}
                      onChange={(e) => setFormData({
                        ...formData,
                        tolerance: {
                          ...formData.tolerance!,
                          exitMinutes: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Almoço (minutos)
                    </label>
                    <input
                      type="number"
                      value={formData.tolerance?.lunchMinutes || 15}
                      onChange={(e) => setFormData({
                        ...formData,
                        tolerance: {
                          ...formData.tolerance!,
                          lunchMinutes: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dias da Semana */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dias de Trabalho</h3>
                <div className="space-y-4">
                  {formData.workDays?.map((day, dayIndex) => (
                    <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900 w-16">
                            {dayNames[dayIndex]}
                          </span>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={day.isWorkDay}
                              onChange={(e) => updateWorkDay(dayIndex, { 
                                isWorkDay: e.target.checked,
                                shifts: e.target.checked ? day.shifts.length > 0 ? day.shifts : [{
                                  id: `shift_${dayIndex}`,
                                  name: 'Horário Padrão',
                                  startTime: '08:00',
                                  endTime: '18:00',
                                  isFlexible: false
                                }] : []
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">Dia de trabalho</span>
                          </label>
                        </div>
                        {day.isWorkDay && (
                          <button
                            onClick={() => addShiftToDay(dayIndex)}
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar Turno
                          </button>
                        )}
                      </div>

                      {day.isWorkDay && (
                        <div className="space-y-3">
                          {day.shifts.map((shift, shiftIndex) => (
                            <div key={shift.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Nome do Turno
                                  </label>
                                  <input
                                    type="text"
                                    value={shift.name}
                                    onChange={(e) => updateShift(dayIndex, shiftIndex, { name: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Início
                                  </label>
                                  <input
                                    type="time"
                                    value={shift.startTime}
                                    onChange={(e) => updateShift(dayIndex, shiftIndex, { startTime: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Fim
                                  </label>
                                  <input
                                    type="time"
                                    value={shift.endTime}
                                    onChange={(e) => updateShift(dayIndex, shiftIndex, { endTime: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="flex items-center gap-1">
                                    <input
                                      type="checkbox"
                                      checked={shift.isFlexible}
                                      onChange={(e) => updateShift(dayIndex, shiftIndex, { isFlexible: e.target.checked })}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs text-gray-600">Flexível</span>
                                  </label>
                                  {day.shifts.length > 1 && (
                                    <button
                                      onClick={() => removeShift(dayIndex, shiftIndex)}
                                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Intervalos */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Intervalos</h3>
                  <button
                    onClick={addBreak}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Intervalo
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.breaks?.map((breakConfig, index) => (
                    <div key={breakConfig.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={breakConfig.name}
                            onChange={(e) => updateBreak(index, { name: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Início
                          </label>
                          <input
                            type="time"
                            value={breakConfig.startTime}
                            onChange={(e) => updateBreak(index, { startTime: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fim
                          </label>
                          <input
                            type="time"
                            value={breakConfig.endTime}
                            onChange={(e) => updateBreak(index, { endTime: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min. (min)
                          </label>
                          <input
                            type="number"
                            value={breakConfig.minimumDuration}
                            onChange={(e) => updateBreak(index, { minimumDuration: parseInt(e.target.value) })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Máx. (min)
                          </label>
                          <input
                            type="number"
                            value={breakConfig.maximumDuration}
                            onChange={(e) => updateBreak(index, { maximumDuration: parseInt(e.target.value) })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={breakConfig.isPaid}
                              onChange={(e) => updateBreak(index, { isPaid: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-600">Pago</span>
                          </label>
                          <button
                            onClick={() => removeBreak(index)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configurações Adicionais */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações Adicionais</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.allowOvertime || false}
                      onChange={(e) => setFormData({ ...formData, allowOvertime: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Permitir horas extras</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.requireJustification || false}
                      onChange={(e) => setFormData({ ...formData, requireJustification: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Exigir justificativa para atrasos/faltas</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isActive || false}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Horário ativo</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkScheduleManagement