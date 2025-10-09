import React, { useState } from 'react'
import { 
  MoreVertical, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Settings,
  X,
  Eye,
  EyeOff
} from 'lucide-react'

interface WidgetAction {
  id: string
  label: string
  icon: React.ElementType
  onClick: () => void
  disabled?: boolean
}

interface DashboardWidgetProps {
  id: string
  title: string
  subtitle?: string
  children: React.ReactNode
  loading?: boolean
  error?: string
  size?: 'small' | 'medium' | 'large' | 'full'
  refreshable?: boolean
  configurable?: boolean
  collapsible?: boolean
  removable?: boolean
  customActions?: WidgetAction[]
  onRefresh?: () => void
  onConfigure?: () => void
  onRemove?: () => void
  onToggleVisibility?: () => void
  onResize?: (size: 'small' | 'medium' | 'large' | 'full') => void
  className?: string
}

const sizeClasses = {
  small: 'col-span-1 row-span-1',
  medium: 'col-span-2 row-span-1',
  large: 'col-span-2 row-span-2',
  full: 'col-span-full row-span-2'
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  title,
  subtitle,
  children,
  loading = false,
  error,
  size = 'medium',
  refreshable = true,
  configurable = false,
  collapsible = true,
  removable = false,
  customActions = [],
  onRefresh,
  onConfigure,
  onRemove,
  onToggleVisibility,
  onResize,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleRefresh = () => {
    if (onRefresh && !loading) {
      onRefresh()
    }
  }

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    if (onToggleVisibility) {
      onToggleVisibility()
    }
  }

  const handleExpand = () => {
    setIsExpanded(!isExpanded)
    if (onResize) {
      onResize(isExpanded ? size : 'full')
    }
  }

  const defaultActions: WidgetAction[] = [
    ...(refreshable ? [{
      id: 'refresh',
      label: 'Atualizar',
      icon: RefreshCw,
      onClick: handleRefresh,
      disabled: loading
    }] : []),
    ...(configurable ? [{
      id: 'configure',
      label: 'Configurar',
      icon: Settings,
      onClick: () => onConfigure?.()
    }] : []),
    ...(collapsible ? [{
      id: 'toggle',
      label: isCollapsed ? 'Mostrar' : 'Ocultar',
      icon: isCollapsed ? Eye : EyeOff,
      onClick: handleToggleCollapse
    }] : []),
    {
      id: 'expand',
      label: isExpanded ? 'Minimizar' : 'Expandir',
      icon: isExpanded ? Minimize2 : Maximize2,
      onClick: handleExpand
    },
    ...(removable ? [{
      id: 'remove',
      label: 'Remover',
      icon: X,
      onClick: () => onRemove?.()
    }] : [])
  ]

  const allActions = [...customActions, ...defaultActions]

  return (
    <div 
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 
        transition-all duration-200 hover:shadow-md
        ${sizeClasses[isExpanded ? 'full' : size]}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 truncate mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {loading && (
            <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 z-10 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[120px]">
                {allActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        action.onClick()
                        setShowActions(false)
                      }}
                      disabled={action.disabled}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {action.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4">
          {error ? (
            <div className="flex items-center justify-center h-32 text-red-500">
              <div className="text-center">
                <X className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-spin" />
                <p className="text-sm text-gray-500">Carregando...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      )}
      
      {/* Click outside handler */}
      {showActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  )
}

export default DashboardWidget