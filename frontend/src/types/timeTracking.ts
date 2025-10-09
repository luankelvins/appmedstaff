// Tipos para Sistema de Controle de Ponto e Gestão de Horários

export interface WorkSchedule {
  id: string
  name: string
  description?: string
  type: 'fixed' | 'flexible' | 'shift' | 'remote'
  isActive: boolean
  
  // Configurações de horário
  workDays: WorkDay[]
  
  // Configurações de tolerância
  tolerance: {
    entryMinutes: number // Tolerância para entrada (ex: 10 minutos)
    exitMinutes: number  // Tolerância para saída (ex: 10 minutos)
    lunchMinutes: number // Tolerância para almoço (ex: 15 minutos)
  }
  
  // Configurações de intervalo
  breaks: BreakConfig[]
  
  // Configurações especiais
  allowOvertime: boolean
  requireJustification: boolean // Se requer justificativa para atrasos/faltas
  
  // Metadados
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface WorkDay {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Domingo, 1 = Segunda, etc.
  isWorkDay: boolean
  shifts: WorkShift[]
}

export interface WorkShift {
  id: string
  name: string
  startTime: string // HH:mm format
  endTime: string   // HH:mm format
  isFlexible: boolean
  flexibilityMinutes?: number // Flexibilidade em minutos
}

export interface BreakConfig {
  id: string
  name: string
  startTime: string
  endTime: string
  isPaid: boolean
  isRequired: boolean
  minimumDuration: number // em minutos
  maximumDuration: number // em minutos
}

// Registro de Ponto
export interface TimeEntry {
  id: string
  employeeId: string
  employeeName: string
  date: string // YYYY-MM-DD
  scheduleId: string
  
  // Registros de entrada/saída
  clockIn?: ClockRecord
  clockOut?: ClockRecord
  
  // Registros de intervalo
  breaks: BreakRecord[]
  
  // Status e validações
  status: 'complete' | 'incomplete' | 'pending_approval' | 'approved' | 'rejected'
  totalWorkedMinutes: number
  expectedWorkedMinutes: number
  overtimeMinutes: number
  
  // Justificativas e observações
  justification?: string
  managerNotes?: string
  
  // Aprovação
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  
  // Metadados
  createdAt: string
  updatedAt: string
}

export interface ClockRecord {
  id: string
  timestamp: string // ISO string
  type: 'clock_in' | 'clock_out'
  location?: GeoLocation
  device?: DeviceInfo
  photo?: string // URL da foto (se configurado)
  ipAddress: string
  isManual: boolean // Se foi registrado manualmente pelo RH
  manualReason?: string
  registeredBy?: string // ID do usuário que fez o registro manual
}

export interface BreakRecord {
  id: string
  breakConfigId: string
  startTime: string
  endTime?: string
  duration?: number // em minutos
  type: 'lunch' | 'coffee' | 'personal' | 'other'
  isComplete: boolean
}

export interface GeoLocation {
  latitude: number
  longitude: number
  accuracy: number
  address?: string
}

export interface DeviceInfo {
  userAgent: string
  platform: string
  isMobile: boolean
  browser?: string
}

// Relatórios e Estatísticas
export interface TimeReport {
  employeeId: string
  employeeName: string
  period: {
    start: string
    end: string
  }
  
  // Estatísticas gerais
  totalDays: number
  workedDays: number
  absentDays: number
  lateDays: number
  earlyLeaveDays: number
  
  // Horas
  totalWorkedHours: number
  expectedWorkedHours: number
  overtimeHours: number
  underTimeHours: number
  
  // Detalhes por dia
  dailyEntries: TimeEntry[]
  
  // Resumo de faltas e atrasos
  absences: AbsenceRecord[]
  lateArrivals: LateArrivalRecord[]
}

export interface AbsenceRecord {
  date: string
  type: 'unjustified' | 'justified' | 'medical' | 'vacation' | 'personal'
  reason?: string
  documentation?: string[]
  approvedBy?: string
}

export interface LateArrivalRecord {
  date: string
  minutesLate: number
  reason?: string
  isJustified: boolean
  justification?: string
}

// Configurações do Sistema
export interface TimeTrackingSettings {
  id: string
  companyId: string
  
  // Configurações gerais
  requirePhoto: boolean
  requireLocation: boolean
  allowMobileClocking: boolean
  allowWebClocking: boolean
  
  // Configurações de localização
  allowedLocations: AllowedLocation[]
  locationRadius: number // em metros
  
  // Configurações de horário
  defaultScheduleId: string
  autoClockOut: boolean
  autoClockOutTime: string // HH:mm
  
  // Configurações de aprovação
  requireManagerApproval: boolean
  autoApproveThreshold: number // minutos de diferença para auto-aprovação
  
  // Notificações
  notifyLateArrival: boolean
  notifyMissedClockOut: boolean
  notifyOvertime: boolean
  
  // Integração
  exportFormat: 'csv' | 'excel' | 'pdf'
  integrationSettings: Record<string, any>
  
  createdAt: string
  updatedAt: string
}

export interface AllowedLocation {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number // em metros
  isActive: boolean
}

// Formulários e Requests
export interface ClockInRequest {
  employeeId: string
  timestamp?: string // Se não fornecido, usa timestamp atual
  location?: GeoLocation
  photo?: File
  notes?: string
}

export interface ClockOutRequest {
  employeeId: string
  timestamp?: string
  location?: GeoLocation
  notes?: string
}

export interface ManualTimeEntryRequest {
  employeeId: string
  date: string
  clockIn: string
  clockOut: string
  breaks: {
    start: string
    end: string
    type: string
  }[]
  reason: string
  justification: string
}

export interface ScheduleAssignment {
  id: string
  employeeId: string
  scheduleId: string
  startDate: string
  endDate?: string
  isActive: boolean
  assignedBy: string
  assignedAt: string
  notes?: string
}

// Filtros e Consultas
export interface TimeEntryFilter {
  employeeIds?: string[]
  dateFrom?: string
  dateTo?: string
  status?: TimeEntry['status'][]
  scheduleIds?: string[]
  hasJustification?: boolean
  isOvertime?: boolean
  isLate?: boolean
}

export interface TimeReportFilter {
  employeeIds?: string[]
  departments?: string[]
  period: {
    start: string
    end: string
  }
  includeAbsences?: boolean
  includeOvertime?: boolean
  groupBy?: 'employee' | 'department' | 'schedule'
}

// Dashboard e Estatísticas
export interface TimeDashboardStats {
  today: {
    totalEmployees: number
    presentEmployees: number
    lateEmployees: number
    absentEmployees: number
    onBreakEmployees: number
  }
  
  thisWeek: {
    totalWorkedHours: number
    averageWorkedHours: number
    overtimeHours: number
    absentDays: number
  }
  
  thisMonth: {
    totalWorkedHours: number
    averageWorkedHours: number
    overtimeHours: number
    absentDays: number
    productivityScore: number
  }
}

export interface EmployeeTimeStatus {
  employeeId: string
  employeeName: string
  department: string
  currentStatus: 'not_started' | 'working' | 'on_break' | 'finished' | 'absent'
  lastClockIn?: string
  lastClockOut?: string
  currentBreak?: BreakRecord
  todayWorkedMinutes: number
  expectedMinutes: number
  isLate: boolean
  minutesLate?: number
}

// Tipos para validação e regras de negócio
export interface ValidationRule {
  id: string
  name: string
  type: 'time_limit' | 'location_check' | 'device_check' | 'photo_required'
  parameters: Record<string, any>
  isActive: boolean
  errorMessage: string
}

export interface TimeValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  autoCorrections: string[]
}

// Tipos adicionais para controle de ponto avançado
export interface TimeClockSession {
  id: string
  employeeId: string
  date: string
  status: 'active' | 'completed' | 'interrupted'
  clockIn: ClockRecord
  clockOut?: ClockRecord
  breaks: BreakRecord[]
  totalWorkedMinutes: number
  expectedMinutes: number
  isLate: boolean
  minutesLate?: number
  createdAt: string
  updatedAt: string
}

export interface QuickClockAction {
  type: 'clock_in' | 'clock_out' | 'start_break' | 'end_break'
  label: string
  icon: string
  color: string
  requiresConfirmation: boolean
}

export interface TimeClockDashboard {
  currentSession?: TimeClockSession
  todayStats: {
    workedMinutes: number
    expectedMinutes: number
    breakMinutes: number
    remainingMinutes: number
    overtimeMinutes: number
  }
  weekStats: {
    totalWorkedHours: number
    expectedWorkedHours: number
    averageDailyHours: number
    daysWorked: number
  }
  quickActions: QuickClockAction[]
}

export interface ScheduleTemplate {
  id: string
  name: string
  description: string
  category: 'standard' | 'flexible' | 'shift' | 'remote' | 'custom'
  isDefault: boolean
  workSchedule: WorkSchedule
  applicableRoles: string[]
  createdAt: string
  updatedAt: string
}

export interface BulkScheduleAssignment {
  scheduleId: string
  employeeIds: string[]
  startDate: string
  endDate?: string
  replaceExisting: boolean
  notes?: string
}

// Tipos para Banco de Horas
export interface HourBank {
  id: string
  employeeId: string
  employeeName: string
  currentBalance: number // em minutos (pode ser negativo)
  
  // Histórico de movimentações
  transactions: HourBankTransaction[]
  
  // Configurações
  maxPositiveBalance: number // limite máximo de horas positivas
  maxNegativeBalance: number // limite máximo de horas negativas (valor positivo)
  
  // Períodos de compensação
  compensationPeriods: CompensationPeriod[]
  
  // Metadados
  lastCalculatedAt: string
  createdAt: string
  updatedAt: string
}

export interface HourBankTransaction {
  id: string
  employeeId: string
  date: string
  type: 'credit' | 'debit' | 'compensation' | 'adjustment'
  amount: number // em minutos (positivo para crédito, negativo para débito)
  reason: string
  description?: string
  
  // Referências
  timeEntryId?: string // Se relacionado a um registro de ponto
  compensationId?: string // Se é uma compensação
  adjustmentRequestId?: string // Se é resultado de uma solicitação
  
  // Aprovação
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  
  // Metadados
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CompensationPeriod {
  id: string
  employeeId: string
  startDate: string
  endDate: string
  targetBalance: number // saldo que deve ser atingido no período
  currentBalance: number
  status: 'active' | 'completed' | 'expired'
  createdAt: string
}

export interface HourBankSummary {
  employeeId: string
  employeeName: string
  currentBalance: number
  balanceInHours: string // formatado como "2h 30min" ou "-1h 15min"
  
  // Estatísticas do período
  periodStats: {
    period: string // "Este mês", "Últimos 30 dias", etc.
    totalCredits: number
    totalDebits: number
    netBalance: number
  }
  
  // Próximas compensações
  upcomingCompensations: CompensationPeriod[]
  
  // Alertas
  alerts: HourBankAlert[]
}

export interface HourBankAlert {
  type: 'approaching_limit' | 'exceeded_limit' | 'compensation_due' | 'negative_balance'
  severity: 'info' | 'warning' | 'error'
  message: string
  actionRequired: boolean
  dueDate?: string
}

// Tipos para Solicitações de Edição de Ponto
export interface TimeEditRequest {
  id: string
  employeeId: string
  employeeName: string
  requestType: 'correction' | 'addition' | 'removal' | 'justification'
  
  // Dados da solicitação
  targetDate: string
  originalEntry?: TimeEntry // entrada original (se existir)
  requestedChanges: TimeEditChanges
  
  // Justificativa
  reason: string
  description: string
  attachments: RequestAttachment[]
  
  // Status e aprovação
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Fluxo de aprovação
  approvalFlow: ApprovalStep[]
  currentApprovalStep: number
  
  // Histórico
  statusHistory: StatusChange[]
  comments: RequestComment[]
  
  // Metadados
  submittedAt: string
  reviewedAt?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TimeEditChanges {
  clockIn?: {
    original?: string
    requested: string
    reason: string
  }
  clockOut?: {
    original?: string
    requested: string
    reason: string
  }
  breaks?: {
    original: BreakRecord[]
    requested: BreakRecord[]
    reason: string
  }
  justification?: {
    original?: string
    requested: string
  }
  location?: {
    original?: GeoLocation
    requested?: GeoLocation
    reason: string
  }
}

export interface RequestAttachment {
  id: string
  name: string
  type: 'image' | 'document' | 'medical_certificate' | 'other'
  url: string
  size: number
  uploadedAt: string
}

export interface ApprovalStep {
  id: string
  stepNumber: number
  approverRole: string
  approverId?: string
  approverName?: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  decision?: 'approve' | 'reject' | 'request_changes'
  comments?: string
  decidedAt?: string
  isRequired: boolean
}

export interface StatusChange {
  id: string
  fromStatus: TimeEditRequest['status']
  toStatus: TimeEditRequest['status']
  changedBy: string
  changedByName: string
  reason?: string
  timestamp: string
}

export interface RequestComment {
  id: string
  authorId: string
  authorName: string
  authorRole: string
  content: string
  isInternal: boolean // se é visível apenas para aprovadores
  createdAt: string
}

export interface TimeEditRequestFilter {
  employeeIds?: string[]
  status?: TimeEditRequest['status'][]
  requestType?: TimeEditRequest['requestType'][]
  priority?: TimeEditRequest['priority'][]
  dateFrom?: string
  dateTo?: string
  submittedFrom?: string
  submittedTo?: string
  pendingApprovalBy?: string
}

export interface TimeEditRequestSummary {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  averageResolutionTime: number // em horas
  
  // Por tipo
  byType: Record<TimeEditRequest['requestType'], number>
  
  // Por status
  byStatus: Record<TimeEditRequest['status'], number>
  
  // Tendências
  trends: {
    period: string
    requestCount: number
    approvalRate: number
  }[]
}

// Tipos para Dashboard do Usuário
export interface UserTimeTrackingDashboard {
  // Banco de horas
  hourBank: HourBankSummary
  
  // Registros recentes
  recentEntries: TimeEntry[]
  
  // Solicitações pendentes
  pendingRequests: TimeEditRequest[]
  
  // Estatísticas do período
  periodStats: {
    workedHours: number
    expectedHours: number
    overtimeHours: number
    absenceHours: number
    punctualityScore: number
  }
  
  // Próximos eventos
  upcomingEvents: {
    type: 'compensation_due' | 'schedule_change' | 'holiday' | 'vacation'
    date: string
    description: string
  }[]
  
  // Alertas e notificações
  alerts: UserTimeAlert[]
}

export interface UserTimeAlert {
  id: string
  type: 'hour_bank_limit' | 'pending_request' | 'schedule_change' | 'missing_clockout'
  severity: 'info' | 'warning' | 'error'
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
  createdAt: string
  isRead: boolean
}