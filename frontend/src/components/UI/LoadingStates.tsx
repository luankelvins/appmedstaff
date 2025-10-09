import React from 'react'
import { Loader2, RefreshCw, Database, FileText, Users, DollarSign, Calendar, CheckCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  className?: string
}

export function LoadingCard({ 
  title = 'Carregando...', 
  description = 'Aguarde enquanto processamos sua solicitação',
  icon,
  className 
}: LoadingCardProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-gray-200',
      className
    )}>
      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
        {icon || <LoadingSpinner size="lg" className="text-blue-600" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 text-center max-w-sm">{description}</p>
    </div>
  )
}

interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

export function LoadingSkeleton({ lines = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'bg-gray-200 rounded h-4 mb-2',
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="bg-gray-200 rounded h-4 flex-1" />
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="bg-gray-200 rounded h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadingFormProps {
  fields?: number
  className?: string
}

export function LoadingForm({ fields = 6, className }: LoadingFormProps) {
  return (
    <div className={cn('animate-pulse space-y-6', className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="bg-gray-200 rounded h-4 w-1/4" />
          <div className="bg-gray-200 rounded h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-4 pt-4">
        <div className="bg-gray-200 rounded h-10 w-24" />
        <div className="bg-gray-200 rounded h-10 w-24" />
      </div>
    </div>
  )
}

interface LoadingWidgetProps {
  type?: 'chart' | 'table' | 'list' | 'metric'
  className?: string
}

export function LoadingWidget({ type = 'chart', className }: LoadingWidgetProps) {
  const getIcon = () => {
    switch (type) {
      case 'chart':
        return <Database className="w-6 h-6 text-blue-600" />
      case 'table':
        return <FileText className="w-6 h-6 text-green-600" />
      case 'list':
        return <Users className="w-6 h-6 text-purple-600" />
      case 'metric':
        return <DollarSign className="w-6 h-6 text-orange-600" />
      default:
        return <Database className="w-6 h-6 text-blue-600" />
    }
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-gray-200',
      className
    )}>
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
        {getIcon()}
      </div>
      <div className="space-y-2 w-full">
        <div className="bg-gray-200 rounded h-4 w-3/4 mx-auto" />
        <div className="bg-gray-200 rounded h-3 w-1/2 mx-auto" />
      </div>
    </div>
  )
}

interface LoadingButtonProps {
  loading?: boolean
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
}

export function LoadingButton({ 
  loading = false, 
  children, 
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  }
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 text-lg'
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  )
}

interface LoadingOverlayProps {
  loading: boolean
  children: React.ReactNode
  message?: string
  className?: string
}

export function LoadingOverlay({ 
  loading, 
  children, 
  message = 'Carregando...',
  className 
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface LoadingProgressProps {
  progress: number
  message?: string
  className?: string
}

export function LoadingProgress({ 
  progress, 
  message = 'Processando...',
  className 
}: LoadingProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{message}</span>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}

interface LoadingStepsProps {
  currentStep: number
  totalSteps: number
  steps: string[]
  className?: string
}

export function LoadingSteps({ 
  currentStep, 
  totalSteps, 
  steps,
  className 
}: LoadingStepsProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">
          Passo {currentStep} de {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              index < currentStep 
                ? 'bg-green-500 text-white' 
                : index === currentStep 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            )}>
              {index < currentStep ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < totalSteps - 1 && (
              <div className={cn(
                'w-8 h-0.5',
                index < currentStep ? 'bg-green-500' : 'bg-gray-200'
              )} />
            )}
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-600">
        {steps[currentStep - 1] || 'Processando...'}
      </div>
    </div>
  )
}

// Hook para gerenciar estados de loading
export function useLoadingState(initialState = false) {
  const [loading, setLoading] = React.useState(initialState)
  const [error, setError] = React.useState<string | null>(null)

  const startLoading = React.useCallback(() => {
    setLoading(true)
    setError(null)
  }, [])

  const stopLoading = React.useCallback(() => {
    setLoading(false)
  }, [])

  const setErrorState = React.useCallback((errorMessage: string) => {
    setLoading(false)
    setError(errorMessage)
  }, [])

  const reset = React.useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setErrorState,
    reset
  }
}
