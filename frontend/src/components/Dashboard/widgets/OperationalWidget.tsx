import React from 'react'
import { FileText, CheckCircle, Clock } from 'lucide-react'
import DashboardWidget from '../DashboardWidget'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

const OperationalWidget: React.FC<BaseWidgetProps> = ({ onRefresh, onConfigure, className }) => {
  return (
    <DashboardWidget
      id="operational"
      title="Operacional"
      subtitle="Status das operações"
      size="medium"
      refreshable
      configurable
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">NFs Emitidas</span>
          </div>
          <span className="text-lg font-bold text-green-700">23</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium">Pendentes</span>
          </div>
          <span className="text-lg font-bold text-yellow-700">8</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Documentos</span>
          </div>
          <span className="text-lg font-bold text-blue-700">156</span>
        </div>
      </div>
    </DashboardWidget>
  )
}

export default OperationalWidget