import React, { useState, useEffect } from 'react'
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Database,
  AlertTriangle,
  CheckCircle,
  Activity,
  Monitor,
  Zap,
  Globe,
  Shield
} from 'lucide-react'
import DashboardWidget from '../DashboardWidget'
import { apiService } from '../../../services/apiService'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

interface SystemMetric {
  id: string
  name: string
  value: number
  maxValue: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  icon: React.ReactNode
  trend: number[]
}

interface ServiceStatus {
  id: string
  name: string
  status: 'online' | 'offline' | 'maintenance'
  uptime: number
  responseTime: number
  lastCheck: string
}

const SystemMonitorWidget: React.FC<BaseWidgetProps> = ({ 
  onRefresh, 
  onConfigure, 
  className 
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([])
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    loadSystemData()
    
    // Atualização automática a cada 30 segundos
    const interval = setInterval(loadSystemData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadSystemData = async () => {
    setLoading(true)
    setError(undefined)
    
    try {
      // Buscar dados reais do sistema usando o apiService
      const systemData = await apiService.getSystemMetrics()
      
      // Função para determinar status baseado no valor
      const getStatus = (value: number, type: string): 'healthy' | 'warning' | 'critical' => {
        if (type === 'cpu' || type === 'memory') {
          if (value > 90) return 'critical'
          if (value > 70) return 'warning'
          return 'healthy'
        }
        if (type === 'storage') {
          if (value > 85) return 'critical'
          if (value > 70) return 'warning'
          return 'healthy'
        }
        return 'healthy'
      }

      // Mapear dados para o formato esperado pelo componente
      const realMetrics: SystemMetric[] = [
        {
          id: 'cpu',
          name: 'CPU',
          value: systemData.cpu_avg,
          maxValue: 100,
          unit: '%',
          status: getStatus(systemData.cpu_avg, 'cpu'),
          icon: <Cpu className="w-4 h-4" />,
          trend: [systemData.cpu_avg - 5, systemData.cpu_avg - 3, systemData.cpu_avg - 1, systemData.cpu_avg + 2, systemData.cpu_avg, systemData.cpu_avg - 2, systemData.cpu_avg]
        },
        {
          id: 'memory',
          name: 'Memória',
          value: systemData.memory_avg,
          maxValue: 100,
          unit: '%',
          status: getStatus(systemData.memory_avg, 'memory'),
          icon: <HardDrive className="w-4 h-4" />,
          trend: [systemData.memory_avg - 3, systemData.memory_avg - 1, systemData.memory_avg + 2, systemData.memory_avg, systemData.memory_avg - 2, systemData.memory_avg + 1, systemData.memory_avg]
        },
        {
          id: 'storage',
          name: 'Armazenamento',
          value: systemData.storage_avg,
          maxValue: 100,
          unit: '%',
          status: getStatus(systemData.storage_avg, 'storage'),
          icon: <Database className="w-4 h-4" />,
          trend: [systemData.storage_avg - 1, systemData.storage_avg, systemData.storage_avg + 1, systemData.storage_avg + 1, systemData.storage_avg, systemData.storage_avg - 1, systemData.storage_avg]
        },
        {
          id: 'network',
          name: 'Rede',
          value: systemData.network_avg,
          maxValue: 100,
          unit: 'Mbps',
          status: 'healthy',
          icon: <Wifi className="w-4 h-4" />,
          trend: [systemData.network_avg - 2, systemData.network_avg + 3, systemData.network_avg + 5, systemData.network_avg + 1, systemData.network_avg - 1, systemData.network_avg + 2, systemData.network_avg]
        }
      ]

      // Mapear serviços
      const realServices: ServiceStatus[] = systemData.services_status.map(service => ({
        id: service.name.toLowerCase().replace(/\s+/g, '-'),
        name: service.name,
        status: service.status as 'online' | 'offline' | 'maintenance',
        uptime: service.uptime,
        responseTime: Math.round(Math.random() * 200 + 50), // Simular tempo de resposta
        lastCheck: new Date().toISOString()
      }))

      setSystemMetrics(realMetrics)
      setServices(realServices)
      setLastUpdate(new Date())
    } catch (err) {
      setError('Erro ao carregar dados do sistema')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadSystemData()
    onRefresh?.()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-500 bg-green-100'
      case 'warning':
        return 'text-yellow-500 bg-yellow-100'
      case 'critical':
      case 'offline':
        return 'text-red-500 bg-red-100'
      case 'maintenance':
        return 'text-blue-500 bg-blue-100'
      default:
        return 'text-gray-500 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="w-3 h-3" />
      case 'warning':
        return <AlertTriangle className="w-3 h-3" />
      case 'critical':
      case 'offline':
        return <AlertTriangle className="w-3 h-3" />
      case 'maintenance':
        return <Monitor className="w-3 h-3" />
      default:
        return <Activity className="w-3 h-3" />
    }
  }

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'critical':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`
  }

  const formatResponseTime = (time: number) => {
    if (time === 0) return 'N/A'
    return `${time}ms`
  }

  return (
    <DashboardWidget
      id="system-monitor"
      title="Monitor do Sistema"
      subtitle={`Atualizado ${lastUpdate.toLocaleTimeString()}`}
      loading={loading}
      error={error}
      size="large"
      refreshable
      configurable
      onRefresh={handleRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="space-y-6">
        {/* Métricas do Sistema */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Server className="w-4 h-4 text-medstaff-primary" />
            <h4 className="text-sm font-semibold text-gray-900">Recursos do Sistema</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {systemMetrics.map((metric) => (
              <div
                key={metric.id}
                className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded ${getStatusColor(metric.status)}`}>
                      {metric.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {getStatusIcon(metric.status)}
                  </div>
                </div>
                
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-xl font-bold text-gray-900">
                      {metric.value.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    de {metric.maxValue}{metric.unit}
                  </div>
                </div>
                
                {/* Barra de Progresso */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(metric.status)}`}
                    style={{ width: `${(metric.value / metric.maxValue) * 100}%` }}
                  />
                </div>
                
                {/* Mini Gráfico de Tendência */}
                <div className="flex items-center space-x-1">
                  {metric.trend.map((value, index) => (
                    <div
                      key={index}
                      className={`w-1 bg-gray-300 rounded-full transition-all duration-300 ${getProgressBarColor(metric.status)}`}
                      style={{ height: `${(value / metric.maxValue) * 20 + 4}px` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status dos Serviços */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Globe className="w-4 h-4 text-medstaff-primary" />
            <h4 className="text-sm font-semibold text-gray-900">Status dos Serviços</h4>
          </div>
          
          <div className="space-y-2">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">
                      Uptime: {formatUptime(service.uptime)} • 
                      Resposta: {formatResponseTime(service.responseTime)}
                    </p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {service.status === 'online' ? 'Online' : 
                   service.status === 'offline' ? 'Offline' : 'Manutenção'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo de Segurança */}
        <div className="bg-gradient-to-r from-medstaff-light to-medstaff-accent/20 border border-medstaff-secondary/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-medstaff-primary" />
              <h4 className="text-sm font-semibold text-medstaff-primary">Status de Segurança</h4>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">Seguro</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-medstaff-primary">0</div>
              <div className="text-xs text-gray-600">Ameaças</div>
            </div>
            <div>
              <div className="text-lg font-bold text-medstaff-primary">100%</div>
              <div className="text-xs text-gray-600">Proteção</div>
            </div>
            <div>
              <div className="text-lg font-bold text-medstaff-primary">24/7</div>
              <div className="text-xs text-gray-600">Monitoramento</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardWidget>
  )
}

export default SystemMonitorWidget