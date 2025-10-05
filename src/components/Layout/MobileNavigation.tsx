import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight,
  Home,
  Users,
  Building,
  FileText,
  Settings,
  User
} from 'lucide-react'
import { useMenu } from '../../hooks/useMenu'
import { MenuItem } from '../../types/menu'
import { cn } from '../../utils/cn'

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
}

// Mapeamento de ícones para mobile
const mobileIconMap: { [key: string]: React.ComponentType<any> } = {
  LayoutDashboard: Home,
  Users,
  Building,
  FileText,
  Settings,
  User
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const { menu } = useMenu()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const renderMobileMenuItem = (item: MenuItem, level: number = 0) => {
    const Icon = item.icon ? mobileIconMap[item.icon] || Home : Home
    const isExpanded = expandedItems.includes(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id} className="border-b border-gray-100 last:border-b-0">
        {hasChildren ? (
          <div>
            <button
              onClick={() => toggleExpanded(item.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-1 text-xs bg-medstaff-primary text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {isExpanded && (
              <div className="bg-gray-50">
                {item.children?.map((child) => (
                  <Link
                    key={child.id}
                    to={child.path!}
                    onClick={onClose}
                    className={cn(
                      "flex items-center space-x-3 p-4 pl-12 text-sm transition-colors",
                      child.isActive
                        ? "bg-medstaff-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span>{child.label}</span>
                    {child.badge && (
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        child.isActive 
                          ? "bg-white text-medstaff-primary" 
                          : "bg-medstaff-primary text-white"
                      )}>
                        {child.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Link
            to={item.path!}
            onClick={onClose}
            className={cn(
              "flex items-center space-x-3 p-4 transition-colors",
              item.isActive
                ? "bg-medstaff-primary text-white"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className={cn(
                "ml-auto px-2 py-1 text-xs rounded-full",
                item.isActive 
                  ? "bg-white text-medstaff-primary" 
                  : "bg-medstaff-primary text-white"
              )}>
                {item.badge}
              </span>
            )}
          </Link>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Mobile Navigation Panel */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-[90vw] bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-medstaff-primary">
          <div className="flex items-center space-x-3">
            <img 
              src="/medstaff-logo.svg" 
              alt="MedStaff" 
              className="h-8 w-auto"
            />
            <span className="text-white font-semibold text-lg">MedStaff</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-white hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="py-2">
          {menu.map((section) => (
            <div key={section.id}>
              {section.title && (
                <div className="px-4 py-2 bg-gray-50">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              <div>
                {section.items.map((item) => renderMobileMenuItem(item))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            © 2024 MedStaff. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </>
  )
}

export default MobileNavigation