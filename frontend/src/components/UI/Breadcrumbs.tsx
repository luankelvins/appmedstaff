import React from 'react'
import { ChevronRight, Home, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
  showBackButton?: boolean
  onBack?: () => void
  separator?: React.ReactNode
  maxItems?: number
}

export function Breadcrumbs({
  items,
  className,
  showHome = true,
  showBackButton = false,
  onBack,
  separator = <ChevronRight className="w-4 h-4" />,
  maxItems = 5
}: BreadcrumbsProps) {
  const displayItems = React.useMemo(() => {
    if (items.length <= maxItems) return items

    // Se temos muitos itens, mostramos o primeiro, alguns do meio e o último
    const firstItem = items[0]
    const lastItem = items[items.length - 1]
    const middleItems = items.slice(1, -1)
    
    if (middleItems.length <= 2) {
      return items
    }

    // Mostramos o primeiro, "..." e o último
    return [
      firstItem,
      { label: '...', href: undefined, current: false },
      lastItem
    ]
  }, [items, maxItems])

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)} aria-label="Breadcrumb">
      {showBackButton && (
        <button
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors mr-2"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}

      {showHome && (
        <>
          <Link
            to="/"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Página inicial"
          >
            <Home className="w-4 h-4" />
          </Link>
          {displayItems.length > 0 && (
            <span className="text-gray-400 mx-1">
              {separator}
            </span>
          )}
        </>
      )}

      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1
        const isCurrent = item.current || isLast

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-gray-400 mx-1">
                {separator}
              </span>
            )}

            {item.href && !isCurrent ? (
              <Link
                to={item.href}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'flex items-center',
                  isCurrent
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500'
                )}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

// Hook para gerenciar breadcrumbs dinamicamente
export function useBreadcrumbs(initialItems: BreadcrumbItem[] = []) {
  const [items, setItems] = React.useState<BreadcrumbItem[]>(initialItems)

  const addItem = React.useCallback((item: BreadcrumbItem) => {
    setItems(prev => [...prev, item])
  }, [])

  const removeItem = React.useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updateItem = React.useCallback((index: number, item: BreadcrumbItem) => {
    setItems(prev => prev.map((existingItem, i) => 
      i === index ? item : existingItem
    ))
  }, [])

  const clearItems = React.useCallback(() => {
    setItems([])
  }, [])

  const setItems = React.useCallback((newItems: BreadcrumbItem[]) => {
    setItems(newItems)
  }, [])

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    setItems
  }
}

// Componente de breadcrumb específico para formulários
export function FormBreadcrumbs({
  steps,
  currentStep,
  onStepClick,
  className
}: {
  steps: Array<{ id: string; label: string; completed?: boolean }>
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  className?: string
}) {
  return (
    <nav className={cn('flex items-center space-x-2', className)} aria-label="Form steps">
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = step.completed || index < currentStep
        const isClickable = onStepClick && (isCompleted || isActive)

        return (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}

            <button
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={cn(
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : isCompleted
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              )}
            >
              <span className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2',
                isActive
                  ? 'bg-blue-600 text-white'
                  : isCompleted
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500'
              )}>
                {isCompleted ? '✓' : index + 1}
              </span>
              {step.label}
            </button>
          </React.Fragment>
        )
      })}
    </nav>
  )
}

// Componente de breadcrumb para dashboard
export function DashboardBreadcrumbs({
  section,
  subsection,
  action,
  className
}: {
  section?: string
  subsection?: string
  action?: string
  className?: string
}) {
  const items: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    ...(section ? [{ label: section, href: `/dashboard/${section.toLowerCase()}` }] : []),
    ...(subsection ? [{ label: subsection, href: `/dashboard/${section?.toLowerCase()}/${subsection.toLowerCase()}` }] : []),
    ...(action ? [{ label: action, current: true }] : [])
  ]

  return <Breadcrumbs items={items} className={className} />
}

// Componente de breadcrumb para CRM
export function CRMBreadcrumbs({
  module,
  action,
  recordId,
  className
}: {
  module?: 'leads' | 'clients' | 'contracts' | 'pipelines'
  action?: 'list' | 'create' | 'edit' | 'view'
  recordId?: string
  className?: string
}) {
  const moduleLabels = {
    leads: 'Leads',
    clients: 'Clientes',
    contracts: 'Contratos',
    pipelines: 'Pipelines'
  }

  const actionLabels = {
    list: 'Lista',
    create: 'Novo',
    edit: 'Editar',
    view: 'Visualizar'
  }

  const items: BreadcrumbItem[] = [
    { label: 'CRM', href: '/crm' },
    ...(module ? [{ label: moduleLabels[module], href: `/crm/${module}` }] : []),
    ...(action ? [{ 
      label: actionLabels[action], 
      href: recordId ? `/crm/${module}/${action}/${recordId}` : undefined,
      current: true 
    }] : [])
  ]

  return <Breadcrumbs items={items} className={className} />
}
