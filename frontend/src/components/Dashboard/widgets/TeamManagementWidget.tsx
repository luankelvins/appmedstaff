import React, { useState, useEffect } from 'react'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Calendar,
  TrendingUp,
  Heart,
  Award,
  Coffee,
  AlertCircle,
  CheckCircle,
  Star,
  Target
} from 'lucide-react'
import DashboardWidget from '../DashboardWidget'
import { widgetDataService } from '../../../utils/widgetDataService'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

interface TeamMetric {
  id: string
  name: string
  value: number
  total: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
}

interface TeamMember {
  id: string
  name: string
  avatar: string
  role: string
  status: 'online' | 'offline' | 'away' | 'busy'
  hoursToday: number
  productivity: number
  satisfaction: number
  lastActivity: string
}

interface TeamAlert {
  id: string
  type: 'birthday' | 'anniversary' | 'vacation' | 'overtime' | 'performance'
  message: string
  priority: 'low' | 'medium' | 'high'
  date: string
}

const TeamManagementWidget: React.FC<BaseWidgetProps> = ({ 
  onRefresh, 
  onConfigure, 
  className 
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)
  const [teamMetrics, setTeamMetrics] = useState<TeamMetric[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [alerts, setAlerts] = useState<TeamAlert[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'alerts'>('overview')

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    setLoading(true)
    setError(undefined)
    
    try {
      // Buscar dados reais do Supabase
      const [teamPerformanceData, hrMetricsData, teamAttendanceData, teamWellbeingData] = await Promise.all([
        widgetDataService.getTeamPerformance(),
        widgetDataService.getHRMetrics(),
        widgetDataService.getTeamAttendance(),
        widgetDataService.getTeamWellbeing()
      ])

      // Calcular taxa de presença baseada nos dados de attendance
      const attendanceRate = teamAttendanceData.length > 0 
        ? (teamAttendanceData.filter(a => a.status === 'present' || a.status === 'remote').length / teamAttendanceData.length) * 100
        : 95 // Valor padrão

      // Calcular horas extras totais
      const totalOvertimeHours = teamAttendanceData.reduce((acc, attendance) => acc + attendance.overtime_hours, 0)

      // Processar métricas da equipe
      const processedMetrics: TeamMetric[] = [
        {
          id: 'attendance',
          name: 'Presença',
          value: attendanceRate,
          total: 100,
          percentage: attendanceRate,
          trend: attendanceRate >= 90 ? 'up' : attendanceRate >= 80 ? 'stable' : 'down',
          status: attendanceRate >= 90 ? 'good' : attendanceRate >= 80 ? 'warning' : 'critical'
        },
        {
          id: 'productivity',
          name: 'Produtividade',
          value: teamPerformanceData.length > 0 ? teamPerformanceData.reduce((acc, member) => acc + member.efficiency_avg, 0) / teamPerformanceData.length : 85,
          total: 100,
          percentage: teamPerformanceData.length > 0 ? teamPerformanceData.reduce((acc, member) => acc + member.efficiency_avg, 0) / teamPerformanceData.length : 85,
          trend: 'up',
          status: 'good'
        },
        {
          id: 'satisfaction',
          name: 'Satisfação',
          value: hrMetricsData?.satisfaction_avg || 8.0,
          total: 10,
          percentage: ((hrMetricsData?.satisfaction_avg || 8.0) / 10) * 100,
          trend: (hrMetricsData?.satisfaction_avg || 8.0) >= 8 ? 'up' : (hrMetricsData?.satisfaction_avg || 8.0) >= 6 ? 'stable' : 'down',
          status: (hrMetricsData?.satisfaction_avg || 8.0) >= 8 ? 'good' : (hrMetricsData?.satisfaction_avg || 8.0) >= 6 ? 'warning' : 'critical'
        },
        {
          id: 'overtime',
          name: 'Horas Extras',
          value: totalOvertimeHours,
          total: (hrMetricsData?.total_employees || 25) * 40, // Assumindo 40h semanais por funcionário
          percentage: (totalOvertimeHours / ((hrMetricsData?.total_employees || 25) * 40)) * 100,
          trend: 'down',
          status: totalOvertimeHours > 100 ? 'critical' : totalOvertimeHours > 50 ? 'warning' : 'good'
        }
      ]

      // Processar membros da equipe (simulados baseados nos dados reais)
      const processedMembers: TeamMember[] = teamPerformanceData.slice(0, 8).map((member, index) => {
        const names = ['Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Costa', 'Fernanda Lima', 'Pedro Alves', 'Juliana Rocha', 'Rafael Mendes']
        const roles = ['Desenvolvedora Senior', 'Designer UX/UI', 'Product Manager', 'Desenvolvedor', 'QA Analyst', 'DevOps Engineer', 'Scrum Master', 'Tech Lead']
        const statuses: ('online' | 'offline' | 'away' | 'busy')[] = ['online', 'busy', 'away', 'online', 'offline', 'online', 'busy', 'away']
        
        const name = names[index] || `Membro ${index + 1}`
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
        const lastActivityHours = Math.floor(Math.random() * 24)
        const getActivityText = (hours: number) => {
          if (hours < 1) return `${Math.floor(hours * 60)} min atrás`
          if (hours < 24) return `${hours}h atrás`
          return `${Math.floor(hours / 24)} dias atrás`
        }

        // Buscar dados de wellbeing para este membro
        const wellbeingData = teamWellbeingData.find(w => w.user_id === member.id)
        const attendanceData = teamAttendanceData.find(a => a.user_id === member.id)

        return {
          id: member.id,
          name: name,
          avatar: initials,
          role: roles[index] || 'Desenvolvedor',
          status: statuses[index] || 'online',
          hoursToday: attendanceData?.hours_worked || 7.5,
          productivity: member.efficiency_avg,
          satisfaction: wellbeingData?.satisfaction_score || member.satisfaction_avg,
          lastActivity: getActivityText(lastActivityHours)
        }
      })

      // Processar alertas (simulados baseados nos dados reais)
      const processedAlerts: TeamAlert[] = []
      
      // Adicionar alerta de horas extras se necessário
      if (totalOvertimeHours > 50) {
        processedAlerts.push({
          id: 'overtime-alert',
          type: 'overtime',
          message: `${Math.floor(totalOvertimeHours / 8)} membros com horas extras esta semana`,
          priority: totalOvertimeHours > 100 ? 'high' : 'medium',
          date: 'esta semana'
        })
      }

      // Adicionar alerta de baixa satisfação se necessário
      if ((hrMetricsData?.satisfaction_avg || 8.0) < 7) {
        processedAlerts.push({
          id: 'satisfaction-alert',
          type: 'performance',
          message: `Satisfação da equipe abaixo do esperado (${(hrMetricsData?.satisfaction_avg || 8.0).toFixed(1)}/10)`,
          priority: 'high',
          date: 'atual'
        })
      }

      // Adicionar alerta de presença se necessário
      if (attendanceRate < 85) {
        processedAlerts.push({
          id: 'attendance-alert',
          type: 'performance',
          message: `Taxa de presença baixa (${attendanceRate.toFixed(1)}%)`,
          priority: 'medium',
          date: 'esta semana'
        })
      }

      setTeamMetrics(processedMetrics)
      setTeamMembers(processedMembers)
      setAlerts(processedAlerts)
    } catch (err) {
      console.error('Erro ao carregar dados da equipe:', err)
      setError('Erro ao carregar dados da equipe')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadTeamData()
    onRefresh?.()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'busy':
        return 'bg-red-500'
      case 'away':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'critical':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return <Calendar className="w-4 h-4 text-pink-500" />
      case 'anniversary':
        return <Award className="w-4 h-4 text-purple-500" />
      case 'vacation':
        return <Coffee className="w-4 h-4 text-blue-500" />
      case 'overtime':
        return <Clock className="w-4 h-4 text-orange-500" />
      case 'performance':
        return <Target className="w-4 h-4 text-green-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getAlertPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  return (
    <DashboardWidget
      id="team-management"
      title="Gestão de Equipe"
      subtitle={`${teamMembers.filter(m => m.status === 'online').length} online de ${teamMembers.length}`}
      loading={loading}
      error={error}
      size="large"
      refreshable
      configurable
      onRefresh={handleRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Visão Geral', icon: Users },
            { key: 'members', label: 'Membros', icon: UserCheck },
            { key: 'alerts', label: 'Alertas', icon: AlertCircle }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1 justify-center ${
                activeTab === key
                  ? 'bg-white text-medstaff-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Métricas da Equipe */}
            <div className="grid grid-cols-2 gap-3">
              {teamMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">{metric.name}</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(metric.trend)}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMetricStatusColor(metric.status)}`}>
                        {metric.status === 'good' ? 'Bom' : metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <span className="text-xl font-bold text-gray-900">
                        {metric.id === 'satisfaction' ? metric.value.toFixed(1) : metric.value}
                      </span>
                      {metric.id !== 'satisfaction' && metric.id !== 'overtime' && (
                        <span className="text-sm text-gray-500 ml-1">/{metric.total}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-medstaff-primary">
                        {metric.percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Barra de Progresso */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        metric.status === 'good' ? 'bg-green-500' : 
                        metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metric.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo de Bem-estar */}
            <div className="bg-gradient-to-r from-medstaff-light to-medstaff-accent/20 border border-medstaff-secondary/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Heart className="w-4 h-4 text-medstaff-primary" />
                <h4 className="text-sm font-semibold text-medstaff-primary">Bem-estar da Equipe</h4>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-medstaff-primary">8.4</div>
                  <div className="text-xs text-gray-600">Satisfação Média</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-medstaff-primary">7.6h</div>
                  <div className="text-xs text-gray-600">Horas Médias/Dia</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-medstaff-primary">92%</div>
                  <div className="text-xs text-gray-600">Presença</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-medstaff-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{member.avatar}</span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                    <p className="text-xs text-gray-400">{member.lastActivity}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-medium">{member.hoursToday}h</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-gray-600">{member.satisfaction.toFixed(1)}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start space-x-3 p-3 border-l-4 rounded-r-lg ${getAlertPriorityColor(alert.priority)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.date}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  alert.priority === 'high' ? 'bg-red-100 text-red-600' :
                  alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Média' : 'Baixa'}
                </div>
              </div>
            ))}
            
            {alerts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm">Nenhum alerta no momento</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardWidget>
  )
}

export default TeamManagementWidget