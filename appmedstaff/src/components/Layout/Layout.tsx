import React, { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

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
      {/* Header */}
      <Header 
        onToggleSidebar={toggleSidebar} 
        isSidebarOpen={isSidebarOpen} 
      />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
      />
      
      {/* Main content */}
      <main className="lg:ml-64 transition-all duration-300 ease-in-out">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout