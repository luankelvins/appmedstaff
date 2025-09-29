import React from 'react'
import { MessageSquare, Users, Send } from 'lucide-react'
import DashboardWidget from '../DashboardWidget'

interface BaseWidgetProps {
  onRefresh?: () => void
  onConfigure?: () => void
  className?: string
}

const ChatWidget: React.FC<BaseWidgetProps> = ({ onRefresh, onConfigure, className }) => {
  return (
    <DashboardWidget
      id="chat"
      title="Chat Interno"
      subtitle="3 conversas ativas"
      size="medium"
      refreshable
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      className={className}
    >
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Ana Silva</p>
            <p className="text-xs text-gray-500">Sobre a proposta comercial...</p>
          </div>
          <span className="text-xs text-gray-400">2min</span>
        </div>
        <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">C</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Carlos Santos</p>
            <p className="text-xs text-gray-500">Documentos prontos</p>
          </div>
          <span className="text-xs text-gray-400">15min</span>
        </div>
        <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Equipe Comercial</p>
            <p className="text-xs text-gray-500">Maria: Novo lead cadastrado</p>
          </div>
          <span className="text-xs text-gray-400">1h</span>
        </div>
      </div>
    </DashboardWidget>
  )
}

export default ChatWidget