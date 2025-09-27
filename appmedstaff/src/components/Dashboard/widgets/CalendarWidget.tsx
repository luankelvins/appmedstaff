import React from 'react'
import { Calendar, Clock, Users } from 'lucide-react'
import DashboardWidget from '../DashboardWidget'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

const CalendarWidget: React.FC<BaseWidgetProps> = ({ onRefresh, onConfigure, className }) => {
  return (
    <DashboardWidget
      id="calendar"
      title="Próximos Eventos"
      subtitle="Agenda da semana"
      size="medium"
      refreshable
      configurable
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="space-y-3">
        <div className="flex items-start space-x-3 p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
          <Calendar className="w-4 h-4 text-blue-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Reunião Comercial</p>
            <p className="text-xs text-gray-600">Apresentação para novo cliente</p>
            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Hoje, 14:00</span>
            </div>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
          <Users className="w-4 h-4 text-green-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Treinamento Equipe</p>
            <p className="text-xs text-gray-600">Novos processos operacionais</p>
            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Amanhã, 09:00</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardWidget>
  )
}

export default CalendarWidget