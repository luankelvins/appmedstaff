import React, { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import MobileNavigation from './MobileNavigation'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar} 
        />
        
        {/* Mobile Navigation */}
        <MobileNavigation 
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Header */}
          <Header 
            onToggleSidebar={toggleSidebar} 
            isSidebarOpen={isSidebarOpen} 
          />
          
          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 lg:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout