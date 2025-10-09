import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  LogIn, 
  LogOut, 
  MapPin, 
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Coffee,
  Play,
  Pause,
  Timer,
  TrendingUp
} from 'lucide-react'
import { 
  TimeEntry, 
  ClockRecord, 
  EmployeeTimeStatus, 
  GeoLocation,
  TimeClockSession,
  TimeClockDashboard,
  QuickClockAction
} from '../../types/timeTracking'
import { timeTrackingService } from '../../utils/timeTrackingService'

interface TimeClockWidgetProps {
  employeeId: string
  className?: string
}

const TimeClockWidget: React.FC<TimeClockWidgetProps> = ({ 
  employeeId, 
  className = '' 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dashboard, setDashboard] = useState<TimeClockDashboard | null>(null)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<GeoLocation | null>(null)
  const [showJustification, setShowJustification] = useState(false)
  const [justification, setJustification] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    loadDashboard()
    getCurrentLocation()

    return () => clearInterval(timer)
  }, [employeeId])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const dashboardData = await timeTrackingService.getTimeClockDashboard(employeeId)
      setDashboard(dashboardData)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          console.warn('Erro ao obter localização:', error)
        }
      )
    }
  }

  const handleQuickAction = async (action: QuickClockAction) => {
    try {
      setActionLoading(action.type)
      
      switch (action.type) {
        case 'clock_in':
          await timeTrackingService.clockIn({
            employeeId,
            timestamp: new Date().toISOString(),
            location: location || undefined,
            notes: justification || undefined
          })
          break
          
        case 'clock_out':
          await timeTrackingService.clockOut({
            employeeId,
            timestamp: new Date().toISOString(),
            location: location || undefined,
            notes: justification || undefined
          })
          break
          
        case 'start_break':
          await timeTrackingService.startBreak(employeeId, 'coffee')
          break
          
        case 'end_break':
          await timeTrackingService.endBreak(employeeId)
          break
      }
      
      // Recarregar dashboard
      await loadDashboard()
      
      setJustification('')
      setShowJustification(false)
      
    } catch (error) {
      console.error(`Erro ao executar ação ${action.type}:`, error)
      alert(`Erro ao executar ação. Tente novamente.`)
    } finally {
      setActionLoading(null)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatMinutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'clock_in': return LogIn
      case 'clock_out': return LogOut
      case 'start_break': return Pause
      case 'end_break': return Play
      default: return Clock
    }
  }

  const getActionColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-600 hover:bg-green-700 text-white'
      case 'red': return 'bg-red-600 hover:bg-red-700 text-white'
      case 'yellow': return 'bg-yellow-600 hover:bg-yellow-700 text-white'
      case 'blue': return 'bg-blue-600 hover:bg-blue-700 text-white'
      default: return 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  }

  const getCurrentStatus = () => {
    if (!dashboard?.currentSession) return 'Não iniciado'
    
    const session = dashboard.currentSession
    if (session.status === 'completed') return 'Expediente finalizado'
    
    const hasActiveBreak = session.breaks.some(b => !b.isComplete)
    if (hasActiveBreak) return 'Em intervalo'
    
    return 'Trabalhando'
  }

  const getStatusColor = () => {
    if (!dashboard?.currentSession) return 'text-gray-600 bg-gray-100'
    
    const session = dashboard.currentSession
    if (session.status === 'completed') return 'text-blue-600 bg-blue-100'
    
    const hasActiveBreak = session.breaks.some(b => !b.isComplete)
    if (hasActiveBreak) return 'text-yellow-600 bg-yellow-100'
    
    return 'text-green-600 bg-green-100'
  }

  if (loading && !dashboard) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Registro de Ponto</h2>
              <p className="text-sm text-gray-600">{formatDate(currentTime)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-gray-900">
              {formatTime(currentTime)}
            </div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getCurrentStatus()}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Trabalhado Hoje</span>
            </div>
            <div className="text-xl font-bold text-blue-900">
              {dashboard ? formatMinutesToTime(dashboard.todayStats.workedMinutes) : '00:00'}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Meta Diária</span>
            </div>
            <div className="text-xl font-bold text-green-900">
              {dashboard ? formatMinutesToTime(dashboard.todayStats.expectedMinutes) : '08:00'}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Intervalos</span>
            </div>
            <div className="text-xl font-bold text-purple-900">
              {dashboard ? formatMinutesToTime(dashboard.todayStats.breakMinutes) : '00:00'}
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Semana</span>
            </div>
            <div className="text-xl font-bold text-orange-900">
              {dashboard ? `${dashboard.weekStats.totalWorkedHours}h` : '0h'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6">
        {dashboard?.quickActions && dashboard.quickActions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {dashboard.quickActions.map((action, index) => {
              const IconComponent = getActionIcon(action.type)
              const isLoading = actionLoading === action.type
              
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-3 p-4 rounded-lg font-medium transition-colors ${
                    isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : getActionColor(action.color)
                  }`}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                  {action.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Session Info */}
        {dashboard?.currentSession && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Sessão Atual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Entrada</div>
                <div className="font-medium">
                  {new Date(dashboard.currentSession.clockIn.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                {dashboard.currentSession.isLate && (
                  <div className="text-xs text-red-600">
                    Atraso: {dashboard.currentSession.minutesLate} min
                  </div>
                )}
              </div>
              
              {dashboard.currentSession.clockOut && (
                <div>
                  <div className="text-sm text-gray-600">Saída</div>
                  <div className="font-medium">
                    {new Date(dashboard.currentSession.clockOut.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Justification */}
        {(dashboard?.currentSession?.isLate || showJustification) && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {dashboard?.currentSession?.isLate ? 'Justificativa para atraso (obrigatória)' : 'Justificativa (opcional)'}
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite a justificativa..."
            />
          </div>
        )}

        {!showJustification && !dashboard?.currentSession?.isLate && (
          <button
            onClick={() => setShowJustification(true)}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 mb-4"
          >
            <AlertCircle className="w-4 h-4" />
            Adicionar justificativa
          </button>
        )}

        {/* Alerts */}
        {dashboard?.currentSession?.isLate && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Atraso detectado. Justificativa obrigatória.
              </span>
            </div>
          </div>
        )}

        {!location && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Localização não detectada. Alguns recursos podem estar limitados.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimeClockWidget