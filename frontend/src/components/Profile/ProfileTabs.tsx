import React from 'react'
import { User, Settings, Shield, Activity, Bell, Clock, Edit } from 'lucide-react'

export type ProfileTab = 'personal' | 'preferences' | 'security' | 'activity' | 'notifications' | 'hour-bank' | 'time-edit-requests'

interface ProfileTabsProps {
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
}

const tabs = [
  {
    id: 'personal' as ProfileTab,
    label: 'Informações Pessoais',
    icon: User,
    description: 'Dados pessoais e informações de contato'
  },
  {
    id: 'preferences' as ProfileTab,
    label: 'Preferências',
    icon: Settings,
    description: 'Configurações de notificações e dashboard'
  },
  {
    id: 'security' as ProfileTab,
    label: 'Segurança',
    icon: Shield,
    description: 'Senha, autenticação e dispositivos'
  },
  {
    id: 'activity' as ProfileTab,
    label: 'Atividade',
    icon: Activity,
    description: 'Histórico de ações e logs'
  },
  {
    id: 'notifications' as ProfileTab,
    label: 'Notificações',
    icon: Bell,
    description: 'Configurações de alertas e avisos'
  },
  {
    id: 'hour-bank' as ProfileTab,
    label: 'Banco de Horas',
    icon: Clock,
    description: 'Saldo de horas e histórico de transações'
  },
  {
    id: 'time-edit-requests' as ProfileTab,
    label: 'Edições de Ponto',
    icon: Edit,
    description: 'Solicitações de correção de registros'
  }
]

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon
                  className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            )
          })}
        </nav>
      </div>
      
      {/* Tab descriptions for mobile */}
      <div className="sm:hidden px-6 py-3 bg-gray-50">
        {tabs.map((tab) => {
          if (activeTab !== tab.id) return null
          
          return (
            <p key={tab.id} className="text-sm text-gray-600">
              {tab.description}
            </p>
          )
        })}
      </div>
    </div>
  )
}