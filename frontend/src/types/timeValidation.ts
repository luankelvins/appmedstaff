// Tipos para Sistema de Validação e Fechamento de Pontos

export interface TimeRecord {
  id: string
  employeeId: string
  employeeName: string
  employeeCpf: string
  department: string
  position: string
  date: string
  clockIn?: string
  clockOut?: string
  breakStart?: string
  breakEnd?: string
  totalHours: number
  expectedHours: number
  overtime: number
  status: 'pending' | 'approved' | 'rejected' | 'corrected'
  irregularities: TimeIrregularity[]
  corrections: TimeCorrection[]
  createdAt: string
  updatedAt: string
  validatedBy?: string
  validatedAt?: string
  notes?: string
}

export interface TimeIrregularity {
  id: string
  type: 'missing_clock_in' | 'missing_clock_out' | 'excessive_break' | 'insufficient_hours' | 'excessive_overtime' | 'weekend_work' | 'holiday_work' | 'late_arrival' | 'early_departure'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  suggestedAction: string
  autoCorrectible: boolean
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: string
  resolution?: string
}

export interface TimeCorrection {
  id: string
  timeRecordId: string
  field: 'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd'
  originalValue: string
  correctedValue: string
  reason: string
  correctedBy: string
  correctedAt: string
  approved: boolean
  approvedBy?: string
  approvedAt?: string
}

export interface ValidationFilter {
  startDate: string
  endDate: string
  departments: string[]
  employees: string[]
  status: TimeRecord['status'][]
  irregularityTypes: TimeIrregularity['type'][]
  showOnlyWithIrregularities: boolean
}

export interface ValidationStats {
  totalRecords: number
  pendingValidation: number
  approved: number
  rejected: number
  withIrregularities: number
  totalHours: number
  totalOvertime: number
  averageHoursPerEmployee: number
  departmentStats: Record<string, {
    totalRecords: number
    totalHours: number
    irregularities: number
  }>
}

export interface MonthlyClosing {
  id: string
  month: number
  year: number
  department?: string
  status: 'open' | 'pending_approval' | 'closed' | 'reopened'
  totalEmployees: number
  totalRecords: number
  totalHours: number
  totalOvertime: number
  irregularitiesResolved: number
  pendingIrregularities: number
  closedBy?: string
  closedAt?: string
  approvedBy?: string
  approvedAt?: string
  reopenedBy?: string
  reopenedAt?: string
  reopenReason?: string
  notes?: string
}

export interface TimeValidationReport {
  id: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  title: string
  period: {
    startDate: string
    endDate: string
  }
  filters: ValidationFilter
  stats: ValidationStats
  records: TimeRecord[]
  irregularities: TimeIrregularity[]
  corrections: TimeCorrection[]
  generatedBy: string
  generatedAt: string
  format: 'pdf' | 'excel' | 'csv'
  downloadUrl?: string
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  type: 'hours' | 'break' | 'overtime' | 'schedule'
  enabled: boolean
  parameters: Record<string, any>
  severity: TimeIrregularity['severity']
  autoCorrect: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface EmployeeSchedule {
  employeeId: string
  dayOfWeek: number // 0-6 (domingo-sábado)
  startTime: string
  endTime: string
  breakDuration: number // em minutos
  expectedHours: number
  isWorkDay: boolean
}

export interface ValidationAction {
  type: 'approve' | 'reject' | 'correct' | 'bulk_approve' | 'bulk_reject'
  recordIds: string[]
  reason?: string
  corrections?: Partial<TimeCorrection>[]
  performedBy: string
  performedAt: string
}

export interface ValidationNotification {
  id: string
  type: 'irregularity_detected' | 'validation_required' | 'closing_pending' | 'correction_needed'
  title: string
  message: string
  severity: 'info' | 'warning' | 'error'
  targetUsers: string[]
  relatedRecordId?: string
  read: boolean
  createdAt: string
  expiresAt?: string
}

// Constantes para configuração
export const IRREGULARITY_TYPES = {
  missing_clock_in: 'Entrada não registrada',
  missing_clock_out: 'Saída não registrada',
  excessive_break: 'Intervalo excessivo',
  insufficient_hours: 'Horas insuficientes',
  excessive_overtime: 'Hora extra excessiva',
  weekend_work: 'Trabalho em fim de semana',
  holiday_work: 'Trabalho em feriado',
  late_arrival: 'Chegada atrasada',
  early_departure: 'Saída antecipada'
} as const

export const VALIDATION_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  corrected: 'bg-blue-100 text-blue-800'
} as const

export const SEVERITY_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
} as const