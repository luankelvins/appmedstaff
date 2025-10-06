import React, { useState } from 'react'
import { Bell, Menu, User, LogOut, Settings, MessageSquare, Play, Square } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import NotificationDropdown from '../Notifications/NotificationDropdown'
import DirectorNotificationDropdown from '../Notifications/DirectorNotificationDropdown'
import { ChatNotificationButton } from '../ChatNotificationButton'
import { QuickTimeClockButtons } from '../TimeTracking/QuickTimeClockButtons'

interface HeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showChatNotifications, setShowChatNotifications] = useState(false)
  const [showDirectorNotifications, setShowDirectorNotifications] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Menu toggle for mobile */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center space-x-2">
            <img 
              src="/medstaff-logo.svg" 
              alt="MedStaff" 
              className="h-8 w-auto"
            />
            <span className="text-medstaff-primary font-semibold text-lg">MedStaff</span>
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          {/* Director Notifications */}
          <div className="hidden sm:block">
            <DirectorNotificationDropdown />
          </div>
          
          {/* Chat Notifications */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowChatNotifications(!showChatNotifications)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md relative transition-colors"
              aria-label="Notificações de chat"
            >
              <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6" />
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center">
                7
              </span>
            </button>
          </div>
          
          {/* Regular Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md relative transition-colors"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5 lg:h-6 lg:w-6" />
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center">
                12
              </span>
            </button>

            {showNotifications && (
               <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                 <div className="p-4">
                   <h3 className="text-sm font-medium text-gray-900 mb-2">Notificações</h3>
                   <p className="text-sm text-gray-500">Nenhuma notificação no momento.</p>
                 </div>
               </div>
             )}
          </div>

          {/* Quick Time Clock Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              aria-label="Bater ponto - Entrada"
            >
              <Play className="h-4 w-4" />
              <span className="hidden lg:inline">Entrada</span>
            </button>
            <button
              className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
              aria-label="Bater ponto - Saída"
            >
              <Square className="h-4 w-4" />
              <span className="hidden lg:inline">Saída</span>
            </button>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-medstaff-primary rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <Link
                    to="/perfil"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>Meu Perfil</span>
                  </Link>
                  <Link
                    to="/configuracoes"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}