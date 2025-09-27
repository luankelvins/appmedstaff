import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ChevronDown,
  ChevronRight,
  X,
  LayoutDashboard,
  Rss,
  CheckSquare,
  Bell,
  MessageCircle,
  Target,
  User,
  Building,
  Briefcase,
  Users,
  FileText,
  TrendingUp,
  Settings,
  Heart,
  BarChart3,
  Network,
  FolderOpen,
  DollarSign,
  UserCircle,
  Utensils,
  Home,
  Building2,
  Calculator,
  PiggyBank,
  Receipt,
  Shield,
  Users2
} from 'lucide-react'
import { useMenu } from '../../hooks/useMenu'
import { MenuItem } from '../../types/menu'
import { cn } from '../../utils/cn'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Mapeamento de ícones
const iconMap: { [key: string]: React.ComponentType<any> } = {
  LayoutDashboard,
  Rss,
  CheckSquare,
  Bell,
  MessageCircle,
  Target,
  User,
  Building,
  Briefcase,
  Users,
  FileText,
  TrendingUp,
  Settings,
  Heart,
  Network,
  FolderOpen,
  DollarSign,
  UserCircle,
  Utensils,
  Home,
  Building2,
  BarChart3,
  Calculator,
  PiggyBank,
  Receipt,
  Shield,
  Users2
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { menu } = useMenu()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const Icon = item.icon ? iconMap[item.icon] : null
    const isExpanded = expandedItems.includes(item.id)
    const hasChildren = item.children && item.children.length > 0
    const paddingLeft = level * 16 + 12

    return (
      <li key={item.id}>
        {hasChildren ? (
          <div>
            <button
              onClick={() => toggleExpanded(item.id)}
              className={cn(
                "w-full flex items-center justify-between py-2 rounded-md text-sm font-medium transition-colors",
                "hover:bg-gray-100 text-gray-700"
              )}
              style={{ paddingLeft }}
            >
              <div className="flex items-center">
                {Icon && <Icon className="w-5 h-5 mr-3" />}
                {item.label}
                {item.badge && (
                  <span className="ml-2 px-2 py-1 text-xs bg-medstaff-primary text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 mr-3" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-3" />
              )}
            </button>
            
            {isExpanded && (
              <ul className="mt-1 space-y-1">
                {item.children?.map((child) => renderMenuItem(child, level + 1))}
              </ul>
            )}
          </div>
        ) : (
          <Link
            to={item.path!}
            onClick={onClose}
            className={cn(
              "flex items-center py-2 rounded-md text-sm font-medium transition-colors",
              item.isActive
                ? "bg-medstaff-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            )}
            style={{ paddingLeft }}
          >
            {Icon && <Icon className="w-5 h-5 mr-3" />}
            {item.label}
            {item.badge && (
              <span className={cn(
                "ml-auto mr-3 px-2 py-1 text-xs rounded-full",
                item.isActive 
                  ? "bg-white text-medstaff-primary" 
                  : "bg-medstaff-primary text-white"
              )}>
                {item.badge}
              </span>
            )}
          </Link>
        )}
      </li>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}>
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-2">
          {menu.map((section) => (
            <div key={section.id} className="mb-6">
              {section.title && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => renderMenuItem(item))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}