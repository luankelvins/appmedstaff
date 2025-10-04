import React, { useState } from 'react'
import { Bell, Menu, User, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
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
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu Toggle */}
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-3">
          {/* Director Notifications */}
          <DirectorNotificationDropdown />
          
          {/* Chat Notifications */}
          <ChatNotificationButton />
          
          {/* Regular Notifications */}
          <NotificationDropdown />

          {/* Quick Time Clock Buttons */}
          <QuickTimeClockButtons />

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
                <p className="text-xs text-gray-500">{user?.role.name}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>Meu Perfil</span>
                  </button>
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </button>
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