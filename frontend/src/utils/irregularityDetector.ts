import {
  TimeRecord,
  TimeIrregularity,
  ValidationRule,
  EmployeeSchedule
} from '../types/timeValidation'

// Configurações padrão para detecção de irregularidades
export const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'missing_clock_in',
    name: 'Entrada não registrada',
    description: 'Detecta quando não há registro de entrada',
    type: 'hours',
    enabled: true,
    parameters: {},
    severity: 'high',
    autoCorrect: false,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'missing_clock_out',
    name: 'Saída não registrada',
    description: 'Detecta quando não há registro de saída',
    type: 'hours',
    enabled: true,
    parameters: {},
    severity: 'high',
    autoCorrect: false,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'excessive_break',
    name: 'Intervalo excessivo',
    description: 'Detecta intervalos superiores ao permitido',
    type: 'break',
    enabled: true,
    parameters: {
      maxBreakMinutes: 90, // 1h30min
      standardBreakMinutes: 60 // 1h
    },
    severity: 'medium',
    autoCorrect: true,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'insufficient_hours',
    name: 'Horas insuficientes',
    description: 'Detecta jornadas abaixo do esperado',
    type: 'hours',
    enabled: true,
    parameters: {
      toleranceMinutes: 15 // Tolerância de 15 minutos
    },
    severity: 'medium',
    autoCorrect: false,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'excessive_overtime',
    name: 'Hora extra excessiva',
    description: 'Detecta horas extras acima do limite',
    type: 'overtime',
    enabled: true,
    parameters: {
      maxOvertimeHours: 2, // Máximo 2h extras por dia
      requiresApproval: true
    },
    severity: 'medium',
    autoCorrect: false,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'late_arrival',
    name: 'Chegada atrasada',
    description: 'Detecta atrasos na chegada',
    type: 'schedule',
    enabled: true,
    parameters: {
      toleranceMinutes: 10 // Tolerância de 10 minutos
    },
    severity: 'low',
    autoCorrect: true,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'early_departure',
    name: 'Saída antecipada',
    description: 'Detecta saídas antes do horário',
    type: 'schedule',
    enabled: true,
    parameters: {
      toleranceMinutes: 10 // Tolerância de 10 minutos
    },
    severity: 'low',
    autoCorrect: true,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'weekend_work',
    name: 'Trabalho em fim de semana',
    description: 'Detecta trabalho em sábados e domingos',
    type: 'schedule',
    enabled: true,
    parameters: {
      requiresApproval: true
    },
    severity: 'medium',
    autoCorrect: false,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'holiday_work',
    name: 'Trabalho em feriado',
    description: 'Detecta trabalho em feriados',
    type: 'schedule',
    enabled: true,
    parameters: {
      requiresApproval: true
    },
    severity: 'high',
    autoCorrect: false,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Horários padrão dos funcionários (mockado)
const DEFAULT_SCHEDULES: EmployeeSchedule[] = [
  // Segunda a sexta - horário padrão
  { employeeId: 'emp1', dayOfWeek: 1, startTime: '08:00', endTime: '17:00', breakDuration: 60, expectedHours: 8, isWorkDay: true },
  { employeeId: 'emp1', dayOfWeek: 2, startTime: '08:00', endTime: '17:00', breakDuration: 60, expectedHours: 8, isWorkDay: true },
  { employeeId: 'emp1', dayOfWeek: 3, startTime: '08:00', endTime: '17:00', breakDuration: 60, expectedHours: 8, isWorkDay: true },
  { employeeId: 'emp1', dayOfWeek: 4, startTime: '08:00', endTime: '17:00', breakDuration: 60, expectedHours: 8, isWorkDay: true },
  { employeeId: 'emp1', dayOfWeek: 5, startTime: '08:00', endTime: '17:00', breakDuration: 60, expectedHours: 8, isWorkDay: true },
  // Fim de semana
  { employeeId: 'emp1', dayOfWeek: 0, startTime: '', endTime: '', breakDuration: 0, expectedHours: 0, isWorkDay: false },
  { employeeId: 'emp1', dayOfWeek: 6, startTime: '', endTime: '', breakDuration: 0, expectedHours: 0, isWorkDay: false }
]

// Lista de feriados (mockado)
const HOLIDAYS = [
  '2024-01-01', // Ano Novo
  '2024-04-21', // Tiradentes
  '2024-05-01', // Dia do Trabalho
  '2024-09-07', // Independência
  '2024-10-12', // Nossa Senhora Aparecida
  '2024-11-02', // Finados
  '2024-11-15', // Proclamação da República
  '2024-12-25'  // Natal
]

// Utilitários para manipulação de tempo
export const timeUtils = {
  // Converter string de tempo para minutos
  timeToMinutes: (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  },

  // Converter minutos para string de tempo
  minutesToTime: (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  },

  // Calcular diferença entre dois horários em minutos
  timeDifference: (startTime: string, endTime: string): number => {
    return timeUtils.timeToMinutes(endTime) - timeUtils.timeToMinutes(startTime)
  },

  // Verificar se uma data é fim de semana
  isWeekend: (date: string): boolean => {
    const dayOfWeek = new Date(date).getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // Domingo ou Sábado
  },

  // Verificar se uma data é feriado
  isHoliday: (date: string): boolean => {
    return HOLIDAYS.includes(date)
  },

  // Obter dia da semana (0 = domingo, 1 = segunda, etc.)
  getDayOfWeek: (date: string): number => {
    return new Date(date).getDay()
  }
}

// Classe principal para detecção de irregularidades
export class IrregularityDetector {
  private rules: ValidationRule[]
  private schedules: EmployeeSchedule[]

  constructor(rules: ValidationRule[] = DEFAULT_VALIDATION_RULES, schedules: EmployeeSchedule[] = DEFAULT_SCHEDULES) {
    this.rules = rules.filter(rule => rule.enabled)
    this.schedules = schedules
  }

  // Detectar todas as irregularidades em um registro
  detectIrregularities(record: TimeRecord): TimeIrregularity[] {
    const irregularities: TimeIrregularity[] = []
    const dayOfWeek = timeUtils.getDayOfWeek(record.date)
    const schedule = this.getEmployeeSchedule(record.employeeId, dayOfWeek)

    // Verificar cada regra ativa
    for (const rule of this.rules) {
      const irregularity = this.checkRule(rule, record, schedule)
      if (irregularity) {
        irregularities.push(irregularity)
      }
    }

    return irregularities
  }

  // Verificar uma regra específica
  private checkRule(rule: ValidationRule, record: TimeRecord, schedule?: EmployeeSchedule): TimeIrregularity | null {
    switch (rule.id) {
      case 'missing_clock_in':
        return this.checkMissingClockIn(rule, record)
      
      case 'missing_clock_out':
        return this.checkMissingClockOut(rule, record)
      
      case 'excessive_break':
        return this.checkExcessiveBreak(rule, record)
      
      case 'insufficient_hours':
        return this.checkInsufficientHours(rule, record, schedule)
      
      case 'excessive_overtime':
        return this.checkExcessiveOvertime(rule, record)
      
      case 'late_arrival':
        return this.checkLateArrival(rule, record, schedule)
      
      case 'early_departure':
        return this.checkEarlyDeparture(rule, record, schedule)
      
      case 'weekend_work':
        return this.checkWeekendWork(rule, record)
      
      case 'holiday_work':
        return this.checkHolidayWork(rule, record)
      
      default:
        return null
    }
  }

  // Implementações específicas de cada verificação
  private checkMissingClockIn(rule: ValidationRule, record: TimeRecord): TimeIrregularity | null {
    if (!record.clockIn) {
      return {
        id: `irr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'missing_clock_in',
        severity: rule.severity,
        description: 'Registro de entrada não encontrado',
        suggestedAction: 'Adicionar horário de entrada manualmente',
        autoCorrectible: rule.autoCorrect,
        resolved: false
      }
    }
    return null
  }

  private checkMissingClockOut(rule: ValidationRule, record: TimeRecord): TimeIrregularity | null {
    if (!record.clockOut) {
      return {
        id: `irr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'missing_clock_out',
        severity: rule.severity,
        description: 'Registro de saída não encontrado',
        suggestedAction: 'Adicionar horário de saída manualmente',
        autoCorrectible: rule.autoCorrect,
        resolved: false
      }
    }
    return null
  }

  private checkExcessiveBreak(rule: ValidationRule, record: TimeRecord): TimeIrregularity | null {
    if (record.breakStart && record.breakEnd) {
      const breakDuration = timeUtils.timeDifference(record.breakStart, record.breakEnd)
      const maxBreak = rule.parameters.maxBreakMinutes || 90
      
      if (breakDuration > maxBreak) {
        const excessMinutes = breakDuration - maxBreak
        return {
          id: `irr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'excessive_break',
          severity: rule.severity,
          description: `Intervalo de ${breakDuration} minutos excede o limite de ${maxBreak} minutos em ${excessMinutes} minutos`,
          suggestedAction: `Ajustar intervalo para ${maxBreak} minutos ou justificar`,
          autoCorrectible: rule.autoCorrect,
          resolved: false
        }
      }
    }
    return null
  }

  private checkInsufficientHours(rule: ValidationRule, record: TimeRecord, schedule?: EmployeeSchedule): TimeIrregularity | null {
    const expectedHours = schedule?.expectedHours || record.expectedHours
    const tolerance = (rule.parameters.toleranceMinutes || 15) / 60 // Converter para horas
    
    if (record.totalHours < (expectedHours - tolerance)) {
      const shortfall = expectedHours - record.totalHours
      return {
        id: `irr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'insufficient_hours',
        severity: rule.severity,
        description: `Jornada de ${record.totalHours}h está ${shortfall.toFixed(2)}h abaixo do esperado (${expectedHours}h)`,
        suggestedAction: 'Compensar horas faltantes ou justificar',
        autoCorrectible: rule.autoCorrect,
        resolved: false
      }
    }
    return null
  }

  private checkExcessiveOvertime(rule: ValidationRule, record: TimeRecord): TimeIrregularity | null {
    const maxOvertime = rule.parameters.maxOvertimeHours || 2
    
    if (record.overtime > maxOvertime) {
      const excess = record.overtime - maxOvertime
      return {
        id: `irr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'excessive_overtime',
        severity: rule.severity,
        description: `Hora extra de ${record.overtime}h excede o limite de ${maxOvertime}h em ${excess.toFixed(2)}h`,
        suggestedAction: rule.parameters.requiresApproval ? 'Solicitar aprovação para hora extra' : 'Ajustar horário',
        autoCorrectible: rule.autoCorrect,
        resolved: false
      }
    }
    return null
  }

  private checkLateArrival(rule: ValidationRule, record: TimeRecord, schedule?: EmployeeSchedule): TimeIrregularity | null {
    if (!record.clockIn || !schedule?.startTime) return null
    
    const tolerance = rule.parameters.toleranceMinutes || 10
    const expectedStart = timeUtils.timeToMinutes(schedule.startTime)
    const actualStart = timeUtils.timeToMinutes(record.clockIn)
    
    if (actualStart > (expectedStart + tolerance)) {
      const delayMinutes = actualStart - expectedStart
      return {
        id: `irr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'late_arrival',
        severity: rule.severity,
        description: `Chegada às ${record.clockIn} está ${delayMinutes} minutos atrasada (esperado: ${schedule.startTime})`,
        suggestedAction: 'Verificar justificativa para atraso',
        autoCorrectible: rule.autoCorrect,
        resolved: false
      }
    }
    return null
  }

  private checkEarlyDeparture(rule: ValidationRule, record: TimeRecord, schedule?: EmployeeSchedule): TimeIrregularity | null {
    if (!record.clockOut || !schedule?.endTime) return null
    
    const tolerance = rule.parameters.toleranceMinutes || 10
    const expectedEnd = timeUtils.timeToMinutes(schedule.endTime)
    const actualEnd = timeUtils.timeToMinutes(record.clockOut)
    
    if (actualEnd < (expectedEnd - tolerance)) {
      const earlyMinutes = expectedEnd - actualEnd
      return {
        id: `irr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'early_departure',
        severity: rule.severity,
        description: `Saída às ${record.clockOut} está ${earlyMinutes} minutos antecipada (esperado: ${schedule.endTime})`,
        suggestedAction: 'Verificar justificativa para saída antecipada',
        autoCorrectible: rule.autoCorrect,
        resolved: false
      }
    }
    return null
  }

  private checkWeekendWork(rule: ValidationRule, record: TimeRecord): TimeIrregularity | null {
    if (timeUtils.isWeekend(record.date) && record.totalHours > 0) {
      return {
        id: `irr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'weekend_work',
        severity: rule.severity,
        description: `Trabalho em fim de semana (${record.totalHours}h trabalhadas)`,
        suggestedAction: rule.parameters.requiresApproval ? 'Verificar aprovação para trabalho em fim de semana' : 'Confirmar necessidade',
        autoCorrectible: rule.autoCorrect,
        resolved: false
      }
    }
    return null
  }

  private checkHolidayWork(rule: ValidationRule, record: TimeRecord): TimeIrregularity | null {
    if (timeUtils.isHoliday(record.date) && record.totalHours > 0) {
      return {
        id: `irr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'holiday_work',
        severity: rule.severity,
        description: `Trabalho em feriado (${record.totalHours}h trabalhadas)`,
        suggestedAction: rule.parameters.requiresApproval ? 'Verificar aprovação para trabalho em feriado' : 'Confirmar necessidade',
        autoCorrectible: rule.autoCorrect,
        resolved: false
      }
    }
    return null
  }

  // Obter horário do funcionário para um dia específico
  private getEmployeeSchedule(employeeId: string, dayOfWeek: number): EmployeeSchedule | undefined {
    return this.schedules.find(s => s.employeeId === employeeId && s.dayOfWeek === dayOfWeek)
  }

  // Processar lote de registros
  processRecords(records: TimeRecord[]): TimeRecord[] {
    return records.map(record => ({
      ...record,
      irregularities: this.detectIrregularities(record)
    }))
  }

  // Obter estatísticas de irregularidades
  getIrregularityStats(records: TimeRecord[]) {
    const stats = {
      total: 0,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      autoCorrectible: 0,
      resolved: 0
    }

    records.forEach(record => {
      record.irregularities.forEach(irregularity => {
        stats.total++
        stats.byType[irregularity.type] = (stats.byType[irregularity.type] || 0) + 1
        stats.bySeverity[irregularity.severity] = (stats.bySeverity[irregularity.severity] || 0) + 1
        
        if (irregularity.autoCorrectible) stats.autoCorrectible++
        if (irregularity.resolved) stats.resolved++
      })
    })

    return stats
  }
}

// Instância padrão do detector
export const irregularityDetector = new IrregularityDetector()