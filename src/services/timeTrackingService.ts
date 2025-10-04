import { 
  WorkSchedule, 
  TimeEntry, 
  ClockRecord, 
  ClockInRequest, 
  ClockOutRequest,
  ManualTimeEntryRequest,
  ScheduleAssignment,
  TimeReport,
  TimeEntryFilter,
  TimeDashboardStats,
  EmployeeTimeStatus,
  TimeTrackingSettings,
  AllowedLocation,
  GeoLocation,
  DeviceInfo,
  ValidationRule,
  TimeValidationResult,
  TimeClockSession,
  TimeClockDashboard,
  QuickClockAction,
  ScheduleTemplate,
  BulkScheduleAssignment
} from '../types/timeTracking'

class TimeTrackingService {
  private baseUrl = '/api/time-tracking'

  // ==================== GESTÃO DE HORÁRIOS ====================
  
  /**
   * Busca todos os horários de trabalho
   */
  async getWorkSchedules(): Promise<WorkSchedule[]> {
    try {
      // Simulação de dados para desenvolvimento
      return this.getMockWorkSchedules()
    } catch (error) {
      console.error('Erro ao buscar horários:', error)
      throw error
    }
  }

  /**
   * Busca um horário específico por ID
   */
  async getWorkScheduleById(id: string): Promise<WorkSchedule | null> {
    try {
      const schedules = await this.getWorkSchedules()
      return schedules.find(s => s.id === id) || null
    } catch (error) {
      console.error('Erro ao buscar horário:', error)
      throw error
    }
  }

  /**
   * Cria um novo horário de trabalho
   */
  async createWorkSchedule(schedule: Omit<WorkSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkSchedule> {
    try {
      const newSchedule: WorkSchedule = {
        ...schedule,
        id: `schedule_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Aqui seria feita a chamada para a API
      console.log('Criando horário:', newSchedule)
      return newSchedule
    } catch (error) {
      console.error('Erro ao criar horário:', error)
      throw error
    }
  }

  /**
   * Atualiza um horário de trabalho
   */
  async updateWorkSchedule(id: string, updates: Partial<WorkSchedule>): Promise<WorkSchedule> {
    try {
      const schedule = await this.getWorkScheduleById(id)
      if (!schedule) {
        throw new Error('Horário não encontrado')
      }

      const updatedSchedule: WorkSchedule = {
        ...schedule,
        ...updates,
        updatedAt: new Date().toISOString()
      }

      console.log('Atualizando horário:', updatedSchedule)
      return updatedSchedule
    } catch (error) {
      console.error('Erro ao atualizar horário:', error)
      throw error
    }
  }

  /**
   * Remove um horário de trabalho
   */
  async deleteWorkSchedule(id: string): Promise<void> {
    try {
      console.log('Removendo horário:', id)
      // Aqui seria feita a chamada para a API
    } catch (error) {
      console.error('Erro ao remover horário:', error)
      throw error
    }
  }

  // ==================== ATRIBUIÇÃO DE HORÁRIOS ====================

  /**
   * Atribui um horário a um membro do time interno
   */
  async assignScheduleToEmployee(assignment: Omit<ScheduleAssignment, 'id' | 'assignedAt'>): Promise<ScheduleAssignment> {
    try {
      const newAssignment: ScheduleAssignment = {
        ...assignment,
        id: `assignment_${Date.now()}`,
        assignedAt: new Date().toISOString()
      }

      console.log('Atribuindo horário:', newAssignment)
      return newAssignment
    } catch (error) {
      console.error('Erro ao atribuir horário:', error)
      throw error
    }
  }

  /**
   * Busca atribuições de horário por membro do time interno
   */
  async getEmployeeScheduleAssignments(employeeId: string): Promise<ScheduleAssignment[]> {
    try {
      // Simulação de dados
      return this.getMockScheduleAssignments().filter(a => a.employeeId === employeeId)
    } catch (error) {
      console.error('Erro ao buscar atribuições:', error)
      throw error
    }
  }

  // ==================== REGISTRO DE PONTO ====================

  /**
   * Registra entrada do membro do time interno
   */
  async clockIn(request: ClockInRequest): Promise<ClockRecord> {
    try {
      // Validações
      const validation = await this.validateClockAction('clock_in', request.employeeId, request.location)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      const clockRecord: ClockRecord = {
        id: `clock_${Date.now()}`,
        timestamp: request.timestamp || new Date().toISOString(),
        type: 'clock_in',
        location: request.location,
        device: this.getDeviceInfo(),
        ipAddress: await this.getClientIP(),
        isManual: false
      }

      // Criar ou atualizar entrada do dia
      await this.createOrUpdateTimeEntry(request.employeeId, clockRecord)

      console.log('Entrada registrada:', clockRecord)
      return clockRecord
    } catch (error) {
      console.error('Erro ao registrar entrada:', error)
      throw error
    }
  }

  /**
   * Registra saída do membro do time interno
   */
  async clockOut(request: ClockOutRequest): Promise<ClockRecord> {
    try {
      // Validações
      const validation = await this.validateClockAction('clock_out', request.employeeId, request.location)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      const clockRecord: ClockRecord = {
        id: `clock_${Date.now()}`,
        timestamp: request.timestamp || new Date().toISOString(),
        type: 'clock_out',
        location: request.location,
        device: this.getDeviceInfo(),
        ipAddress: await this.getClientIP(),
        isManual: false
      }

      // Atualizar entrada do dia
      await this.updateTimeEntryWithClockOut(request.employeeId, clockRecord)

      console.log('Saída registrada:', clockRecord)
      return clockRecord
    } catch (error) {
      console.error('Erro ao registrar saída:', error)
      throw error
    }
  }

  /**
   * Registra ponto manual (apenas RH)
   */
  async createManualTimeEntry(request: ManualTimeEntryRequest, registeredBy: string): Promise<TimeEntry> {
    try {
      const timeEntry: TimeEntry = {
        id: `entry_${Date.now()}`,
        employeeId: request.employeeId,
        employeeName: await this.getEmployeeName(request.employeeId),
        date: request.date,
        scheduleId: await this.getEmployeeScheduleId(request.employeeId),
        clockIn: {
          id: `clock_${Date.now()}_in`,
          timestamp: `${request.date}T${request.clockIn}:00`,
          type: 'clock_in',
          ipAddress: await this.getClientIP(),
          isManual: true,
          manualReason: request.reason,
          registeredBy
        },
        clockOut: {
          id: `clock_${Date.now()}_out`,
          timestamp: `${request.date}T${request.clockOut}:00`,
          type: 'clock_out',
          ipAddress: await this.getClientIP(),
          isManual: true,
          manualReason: request.reason,
          registeredBy
        },
        breaks: request.breaks.map((b, index) => ({
          id: `break_${Date.now()}_${index}`,
          breakConfigId: 'manual',
          startTime: `${request.date}T${b.start}:00`,
          endTime: `${request.date}T${b.end}:00`,
          duration: this.calculateMinutesBetween(b.start, b.end),
          type: b.type as any,
          isComplete: true
        })),
        status: 'pending_approval',
        totalWorkedMinutes: this.calculateWorkedMinutes(request.clockIn, request.clockOut, request.breaks),
        expectedWorkedMinutes: 480, // 8 horas padrão
        overtimeMinutes: 0,
        justification: request.justification,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('Entrada manual criada:', timeEntry)
      return timeEntry
    } catch (error) {
      console.error('Erro ao criar entrada manual:', error)
      throw error
    }
  }

  // ==================== CONSULTAS E RELATÓRIOS ====================

  /**
   * Busca entradas de ponto com filtros
   */
  async getTimeEntries(filter: TimeEntryFilter): Promise<TimeEntry[]> {
    try {
      // Simulação de dados
      return this.getMockTimeEntries().filter(entry => {
        if (filter.employeeIds && !filter.employeeIds.includes(entry.employeeId)) return false
        if (filter.dateFrom && entry.date < filter.dateFrom) return false
        if (filter.dateTo && entry.date > filter.dateTo) return false
        if (filter.status && !filter.status.includes(entry.status)) return false
        return true
      })
    } catch (error) {
      console.error('Erro ao buscar entradas:', error)
      throw error
    }
  }

  /**
   * Gera relatório de ponto para um membro do time interno
   */
  async generateTimeReport(employeeId: string, startDate: string, endDate: string): Promise<TimeReport> {
    try {
      const entries = await this.getTimeEntries({
        employeeIds: [employeeId],
        dateFrom: startDate,
        dateTo: endDate
      })

      const report: TimeReport = {
        employeeId,
        employeeName: await this.getEmployeeName(employeeId),
        period: { start: startDate, end: endDate },
        totalDays: this.calculateDaysBetween(startDate, endDate),
        workedDays: entries.filter(e => e.status === 'approved').length,
        absentDays: 0, // Calcular baseado nos dias esperados vs trabalhados
        lateDays: entries.filter(e => this.isLateEntry(e)).length,
        earlyLeaveDays: entries.filter(e => this.isEarlyLeave(e)).length,
        totalWorkedHours: entries.reduce((sum, e) => sum + (e.totalWorkedMinutes / 60), 0),
        expectedWorkedHours: entries.reduce((sum, e) => sum + (e.expectedWorkedMinutes / 60), 0),
        overtimeHours: entries.reduce((sum, e) => sum + (e.overtimeMinutes / 60), 0),
        underTimeHours: 0, // Calcular
        dailyEntries: entries,
        absences: [], // Implementar
        lateArrivals: [] // Implementar
      }

      return report
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      throw error
    }
  }

  /**
   * Busca estatísticas do dashboard
   */
  async getDashboardStats(): Promise<TimeDashboardStats> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const todayEntries = await this.getTimeEntries({
        dateFrom: today,
        dateTo: today
      })

      return {
        today: {
          totalEmployees: 50, // Mock
          presentEmployees: todayEntries.filter(e => e.clockIn).length,
          lateEmployees: todayEntries.filter(e => this.isLateEntry(e)).length,
          absentEmployees: 5, // Mock
          onBreakEmployees: 3 // Mock
        },
        thisWeek: {
          totalWorkedHours: 1800,
          averageWorkedHours: 36,
          overtimeHours: 45,
          absentDays: 8
        },
        thisMonth: {
          totalWorkedHours: 7200,
          averageWorkedHours: 144,
          overtimeHours: 180,
          absentDays: 25,
          productivityScore: 85
        }
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  }

  /**
   * Busca status atual dos membros do time interno
   */
  async getEmployeesCurrentStatus(): Promise<EmployeeTimeStatus[]> {
    try {
      // Simulação de dados
      return this.getMockEmployeeStatuses()
    } catch (error) {
      console.error('Erro ao buscar status dos membros do time interno:', error)
      throw error
    }
  }

  // ==================== CONFIGURAÇÕES ====================

  /**
   * Busca configurações do sistema
   */
  async getTimeTrackingSettings(): Promise<TimeTrackingSettings> {
    try {
      return this.getMockSettings()
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
      throw error
    }
  }

  /**
   * Atualiza configurações do sistema
   */
  async updateTimeTrackingSettings(settings: Partial<TimeTrackingSettings>): Promise<TimeTrackingSettings> {
    try {
      const currentSettings = await this.getTimeTrackingSettings()
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        updatedAt: new Date().toISOString()
      }

      console.log('Atualizando configurações:', updatedSettings)
      return updatedSettings
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      throw error
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  private async validateClockAction(
    action: 'clock_in' | 'clock_out', 
    employeeId: string, 
    location?: GeoLocation
  ): Promise<TimeValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validar localização se necessário
    if (location) {
      const settings = await this.getTimeTrackingSettings()
      if (settings.requireLocation) {
        const isValidLocation = await this.validateLocation(location, settings.allowedLocations)
        if (!isValidLocation) {
          errors.push('Localização não autorizada para registro de ponto')
        }
      }
    }

    // Validar horário
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    // Aqui você pode adicionar mais validações baseadas no horário de trabalho do membro do time interno

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      autoCorrections: []
    }
  }

  private async validateLocation(location: GeoLocation, allowedLocations: AllowedLocation[]): Promise<boolean> {
    for (const allowed of allowedLocations) {
      if (!allowed.isActive) continue
      
      const distance = this.calculateDistance(
        location.latitude, 
        location.longitude,
        allowed.latitude,
        allowed.longitude
      )
      
      if (distance <= allowed.radius) {
        return true
      }
    }
    return false
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // Raio da Terra em metros
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lon2-lon1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      browser: this.getBrowserName()
    }
  }

  private getBrowserName(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private async getClientIP(): Promise<string> {
    try {
      // Em produção, isso seria obtido do servidor
      return '192.168.1.100'
    } catch {
      return 'unknown'
    }
  }

  private async createOrUpdateTimeEntry(employeeId: string, clockRecord: ClockRecord): Promise<void> {
    // Implementar lógica para criar ou atualizar entrada do dia
    console.log('Criando/atualizando entrada:', { employeeId, clockRecord })
  }

  private async updateTimeEntryWithClockOut(employeeId: string, clockRecord: ClockRecord): Promise<void> {
    // Implementar lógica para atualizar entrada com saída
    console.log('Atualizando entrada com saída:', { employeeId, clockRecord })
  }

  private async getEmployeeName(employeeId: string): Promise<string> {
    // Buscar nome do membro do time interno
    return `Membro do Time Interno ${employeeId}`
  }

  private async getEmployeeScheduleId(employeeId: string): Promise<string> {
    // Buscar horários do membro do time interno
    return 'schedule_default'
  }

  private calculateMinutesBetween(startTime: string, endTime: string): number {
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    return Math.abs(end.getTime() - start.getTime()) / (1000 * 60)
  }

  private calculateWorkedMinutes(clockIn: string, clockOut: string, breaks: any[]): number {
    const totalMinutes = this.calculateMinutesBetween(clockIn, clockOut)
    const breakMinutes = breaks.reduce((sum, b) => sum + this.calculateMinutesBetween(b.start, b.end), 0)
    return totalMinutes - breakMinutes
  }

  private calculateDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  private isEarlyLeave(entry: TimeEntry): boolean {
    // Implementar lógica para verificar saída antecipada
    return false
  }

  // ==================== DADOS MOCK ====================

  private getMockWorkSchedules(): WorkSchedule[] {
    return [
      {
        id: 'schedule_1',
        name: 'Horário Comercial Padrão',
        description: 'Segunda a sexta, 8h às 18h com 1h de almoço',
        type: 'fixed',
        isActive: true,
        workDays: [
          { dayOfWeek: 1, isWorkDay: true, shifts: [{ id: 'shift_1', name: 'Manhã/Tarde', startTime: '08:00', endTime: '18:00', isFlexible: false }] },
          { dayOfWeek: 2, isWorkDay: true, shifts: [{ id: 'shift_1', name: 'Manhã/Tarde', startTime: '08:00', endTime: '18:00', isFlexible: false }] },
          { dayOfWeek: 3, isWorkDay: true, shifts: [{ id: 'shift_1', name: 'Manhã/Tarde', startTime: '08:00', endTime: '18:00', isFlexible: false }] },
          { dayOfWeek: 4, isWorkDay: true, shifts: [{ id: 'shift_1', name: 'Manhã/Tarde', startTime: '08:00', endTime: '18:00', isFlexible: false }] },
          { dayOfWeek: 5, isWorkDay: true, shifts: [{ id: 'shift_1', name: 'Manhã/Tarde', startTime: '08:00', endTime: '18:00', isFlexible: false }] },
          { dayOfWeek: 6, isWorkDay: false, shifts: [] },
          { dayOfWeek: 0, isWorkDay: false, shifts: [] }
        ],
        tolerance: { entryMinutes: 10, exitMinutes: 10, lunchMinutes: 15 },
        breaks: [
          { id: 'lunch', name: 'Almoço', startTime: '12:00', endTime: '13:00', isPaid: false, isRequired: true, minimumDuration: 60, maximumDuration: 90 }
        ],
        allowOvertime: true,
        requireJustification: true,
        createdBy: 'admin',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'schedule_2',
        name: 'Horário Flexível',
        description: 'Entrada flexível entre 7h e 10h, 8h de trabalho',
        type: 'flexible',
        isActive: true,
        workDays: [
          { dayOfWeek: 1, isWorkDay: true, shifts: [{ id: 'shift_flex', name: 'Flexível', startTime: '07:00', endTime: '19:00', isFlexible: true, flexibilityMinutes: 180 }] },
          { dayOfWeek: 2, isWorkDay: true, shifts: [{ id: 'shift_flex', name: 'Flexível', startTime: '07:00', endTime: '19:00', isFlexible: true, flexibilityMinutes: 180 }] },
          { dayOfWeek: 3, isWorkDay: true, shifts: [{ id: 'shift_flex', name: 'Flexível', startTime: '07:00', endTime: '19:00', isFlexible: true, flexibilityMinutes: 180 }] },
          { dayOfWeek: 4, isWorkDay: true, shifts: [{ id: 'shift_flex', name: 'Flexível', startTime: '07:00', endTime: '19:00', isFlexible: true, flexibilityMinutes: 180 }] },
          { dayOfWeek: 5, isWorkDay: true, shifts: [{ id: 'shift_flex', name: 'Flexível', startTime: '07:00', endTime: '19:00', isFlexible: true, flexibilityMinutes: 180 }] },
          { dayOfWeek: 6, isWorkDay: false, shifts: [] },
          { dayOfWeek: 0, isWorkDay: false, shifts: [] }
        ],
        tolerance: { entryMinutes: 15, exitMinutes: 15, lunchMinutes: 30 },
        breaks: [
          { id: 'lunch_flex', name: 'Almoço Flexível', startTime: '11:30', endTime: '14:30', isPaid: false, isRequired: true, minimumDuration: 60, maximumDuration: 120 }
        ],
        allowOvertime: true,
        requireJustification: false,
        createdBy: 'admin',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  }

  private getMockScheduleAssignments(): ScheduleAssignment[] {
    return [
      {
        id: 'assignment_1',
        employeeId: 'emp_1',
        scheduleId: 'schedule_1',
        startDate: '2024-01-01',
        isActive: true,
        assignedBy: 'admin',
        assignedAt: '2024-01-01T00:00:00Z'
      }
    ]
  }

  private getMockTimeEntries(): TimeEntry[] {
    const today = new Date().toISOString().split('T')[0]
    return [
      {
        id: 'entry_1',
        employeeId: 'emp_1',
        employeeName: 'João Silva',
        date: today,
        scheduleId: 'schedule_1',
        clockIn: {
          id: 'clock_in_1',
          timestamp: `${today}T08:05:00Z`,
          type: 'clock_in',
          ipAddress: '192.168.1.100',
          isManual: false
        },
        clockOut: {
          id: 'clock_out_1',
          timestamp: `${today}T18:10:00Z`,
          type: 'clock_out',
          ipAddress: '192.168.1.100',
          isManual: false
        },
        breaks: [
          {
            id: 'break_1',
            breakConfigId: 'lunch',
            startTime: `${today}T12:00:00Z`,
            endTime: `${today}T13:00:00Z`,
            duration: 60,
            type: 'lunch',
            isComplete: true
          }
        ],
        status: 'approved',
        totalWorkedMinutes: 485,
        expectedWorkedMinutes: 480,
        overtimeMinutes: 5,
        createdAt: `${today}T08:05:00Z`,
        updatedAt: `${today}T18:10:00Z`
      }
    ]
  }

  private getMockEmployeeStatuses(): EmployeeTimeStatus[] {
    return [
      {
        employeeId: 'emp_1',
        employeeName: 'João Silva',
        department: 'Desenvolvimento',
        currentStatus: 'working',
        lastClockIn: '08:05',
        todayWorkedMinutes: 240,
        expectedMinutes: 480,
        isLate: true,
        minutesLate: 5
      },
      {
        employeeId: 'emp_2',
        employeeName: 'Maria Santos',
        department: 'RH',
        currentStatus: 'on_break',
        lastClockIn: '08:00',
        todayWorkedMinutes: 180,
        expectedMinutes: 480,
        isLate: false
      }
    ]
  }

  private getMockSettings(): TimeTrackingSettings {
    return {
      id: 'settings_1',
      companyId: 'company_1',
      requirePhoto: false,
      requireLocation: false, // Desabilitado para desenvolvimento
      allowMobileClocking: true,
      allowWebClocking: true,
      allowedLocations: [
        {
          id: 'location_1',
          name: 'Escritório Principal',
          address: 'Rua das Flores, 123',
          latitude: -23.5505,
          longitude: -46.6333,
          radius: 100,
          isActive: true
        }
      ],
      locationRadius: 100,
      defaultScheduleId: 'schedule_1',
      autoClockOut: true,
      autoClockOutTime: '20:00',
      requireManagerApproval: false,
      autoApproveThreshold: 15,
      notifyLateArrival: true,
      notifyMissedClockOut: true,
      notifyOvertime: true,
      exportFormat: 'excel',
      integrationSettings: {},
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  }

  // ==================== MÉTODOS AVANÇADOS ====================

  /**
   * Obtém dashboard de controle de ponto para um membro do time interno
   */
  async getTimeClockDashboard(employeeId: string): Promise<TimeClockDashboard> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const currentSession = await this.getCurrentSession(employeeId)
      const todayEntries = await this.getTimeEntries({
        employeeIds: [employeeId],
        dateFrom: today,
        dateTo: today
      })

      const todayStats = this.calculateTodayStats(todayEntries)
      const weekStats = await this.calculateWeekStats(employeeId)
      const quickActions = this.getQuickActions(currentSession)

      return {
        currentSession,
        todayStats,
        weekStats,
        quickActions
      }
    } catch (error) {
      console.error('Erro ao obter dashboard:', error)
      throw error
    }
  }

  /**
   * Obtém sessão atual de ponto do membro do time interno
   */
  async getCurrentSession(employeeId: string): Promise<TimeClockSession | undefined> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const entries = await this.getTimeEntries({
        employeeIds: [employeeId],
        dateFrom: today,
        dateTo: today
      })

      const todayEntry = entries[0]
      if (!todayEntry) return undefined

      const session: TimeClockSession = {
        id: `session_${todayEntry.id}`,
        employeeId,
        date: today,
        status: todayEntry.clockOut ? 'completed' : 'active',
        clockIn: todayEntry.clockIn!,
        clockOut: todayEntry.clockOut,
        breaks: todayEntry.breaks,
        totalWorkedMinutes: todayEntry.totalWorkedMinutes,
        expectedMinutes: todayEntry.expectedWorkedMinutes,
        isLate: this.isLateEntry(todayEntry),
        minutesLate: this.calculateLateMinutes(todayEntry),
        createdAt: todayEntry.createdAt,
        updatedAt: todayEntry.updatedAt
      }

      return session
    } catch (error) {
      console.error('Erro ao obter sessão atual:', error)
      return undefined
    }
  }

  /**
   * Inicia intervalo/pausa
   */
  async startBreak(employeeId: string, breakType: 'lunch' | 'coffee' | 'personal' | 'other'): Promise<void> {
    try {
      const session = await this.getCurrentSession(employeeId)
      if (!session || session.status !== 'active') {
        throw new Error('Não há sessão ativa para iniciar intervalo')
      }

      // Verificar se já há um intervalo em andamento
      const activeBreak = session.breaks.find(b => !b.isComplete)
      if (activeBreak) {
        throw new Error('Já existe um intervalo em andamento')
      }

      // Simular início de intervalo
      console.log(`Iniciando intervalo ${breakType} para membro do time interno ${employeeId}`)
    } catch (error) {
      console.error('Erro ao iniciar intervalo:', error)
      throw error
    }
  }

  /**
   * Finaliza intervalo/pausa
   */
  async endBreak(employeeId: string): Promise<void> {
    try {
      const session = await this.getCurrentSession(employeeId)
      if (!session || session.status !== 'active') {
        throw new Error('Não há sessão ativa para finalizar intervalo')
      }

      const activeBreak = session.breaks.find(b => !b.isComplete)
      if (!activeBreak) {
        throw new Error('Não há intervalo em andamento')
      }

      // Simular fim de intervalo
      console.log(`Finalizando intervalo para membro do time interno ${employeeId}`)
    } catch (error) {
      console.error('Erro ao finalizar intervalo:', error)
      throw error
    }
  }

  /**
   * Obtém templates de horário disponíveis
   */
  async getScheduleTemplates(): Promise<ScheduleTemplate[]> {
    try {
      return this.getMockScheduleTemplates()
    } catch (error) {
      console.error('Erro ao buscar templates:', error)
      throw error
    }
  }

  /**
   * Atribuição em lote de horários
   */
  async bulkAssignSchedule(assignment: BulkScheduleAssignment): Promise<ScheduleAssignment[]> {
    try {
      const assignments: ScheduleAssignment[] = []
      
      for (const employeeId of assignment.employeeIds) {
        const newAssignment: ScheduleAssignment = {
          id: `assignment_${Date.now()}_${employeeId}`,
          employeeId,
          scheduleId: assignment.scheduleId,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          isActive: true,
          assignedBy: 'admin', // Em produção, pegar do contexto de autenticação
          assignedAt: new Date().toISOString(),
          notes: assignment.notes
        }
        assignments.push(newAssignment)
      }

      console.log('Atribuições em lote criadas:', assignments)
      return assignments
    } catch (error) {
      console.error('Erro na atribuição em lote:', error)
      throw error
    }
  }

  // ==================== MÉTODOS AUXILIARES AVANÇADOS ====================

  private calculateTodayStats(entries: TimeEntry[]) {
    const entry = entries[0]
    if (!entry) {
      return {
        workedMinutes: 0,
        expectedMinutes: 480, // 8 horas padrão
        breakMinutes: 0,
        remainingMinutes: 480,
        overtimeMinutes: 0
      }
    }

    const breakMinutes = entry.breaks.reduce((total, b) => total + (b.duration || 0), 0)
    const remainingMinutes = Math.max(0, entry.expectedWorkedMinutes - entry.totalWorkedMinutes)

    return {
      workedMinutes: entry.totalWorkedMinutes,
      expectedMinutes: entry.expectedWorkedMinutes,
      breakMinutes,
      remainingMinutes,
      overtimeMinutes: entry.overtimeMinutes
    }
  }

  private async calculateWeekStats(employeeId: string) {
    // Simular cálculo da semana
    return {
      totalWorkedHours: 32.5,
      expectedWorkedHours: 40,
      averageDailyHours: 8.1,
      daysWorked: 4
    }
  }

  private getQuickActions(session?: TimeClockSession): QuickClockAction[] {
    const actions: QuickClockAction[] = []

    if (!session) {
      actions.push({
        type: 'clock_in',
        label: 'Registrar Entrada',
        icon: 'LogIn',
        color: 'green',
        requiresConfirmation: false
      })
    } else if (session.status === 'active') {
      const hasActiveBreak = session.breaks.some(b => !b.isComplete)
      
      if (hasActiveBreak) {
        actions.push({
          type: 'end_break',
          label: 'Finalizar Intervalo',
          icon: 'Play',
          color: 'blue',
          requiresConfirmation: false
        })
      } else {
        actions.push({
          type: 'start_break',
          label: 'Iniciar Intervalo',
          icon: 'Pause',
          color: 'yellow',
          requiresConfirmation: false
        })
      }

      actions.push({
        type: 'clock_out',
        label: 'Registrar Saída',
        icon: 'LogOut',
        color: 'red',
        requiresConfirmation: true
      })
    }

    return actions
  }

  private isLateEntry(entry: TimeEntry): boolean {
    if (!entry.clockIn) return false
    
    // Simular verificação de atraso baseada no horário esperado
    const clockInTime = new Date(entry.clockIn.timestamp)
    const expectedStartTime = new Date(entry.clockIn.timestamp)
    expectedStartTime.setHours(9, 0, 0, 0) // 9:00 AM como padrão
    
    return clockInTime > expectedStartTime
  }

  private calculateLateMinutes(entry: TimeEntry): number | undefined {
    if (!this.isLateEntry(entry) || !entry.clockIn) return undefined
    
    const clockInTime = new Date(entry.clockIn.timestamp)
    const expectedStartTime = new Date(entry.clockIn.timestamp)
    expectedStartTime.setHours(9, 0, 0, 0)
    
    return Math.max(0, Math.floor((clockInTime.getTime() - expectedStartTime.getTime()) / (1000 * 60)))
  }

  private getMockScheduleTemplates(): ScheduleTemplate[] {
    return [
      {
        id: 'template_1',
        name: 'Horário Comercial Padrão',
        description: 'Segunda a sexta, 9h às 18h com 1h de almoço',
        category: 'standard',
        isDefault: true,
        workSchedule: {
          id: 'schedule_1',
          name: 'Comercial Padrão',
          type: 'fixed',
          isActive: true,
          workDays: [],
          tolerance: { entryMinutes: 10, exitMinutes: 10, lunchMinutes: 15 },
          breaks: [],
          allowOvertime: true,
          requireJustification: false,
          createdBy: 'system',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        applicableRoles: ['admin', 'manager', 'employee'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'template_2',
        name: 'Horário Flexível',
        description: 'Entrada flexível entre 7h e 10h, 8h de trabalho',
        category: 'flexible',
        isDefault: false,
        workSchedule: {
          id: 'schedule_2',
          name: 'Flexível',
          type: 'flexible',
          isActive: true,
          workDays: [],
          tolerance: { entryMinutes: 15, exitMinutes: 15, lunchMinutes: 30 },
          breaks: [],
          allowOvertime: true,
          requireJustification: false,
          createdBy: 'system',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        applicableRoles: ['senior', 'manager'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  }
}

export const timeTrackingService = new TimeTrackingService()