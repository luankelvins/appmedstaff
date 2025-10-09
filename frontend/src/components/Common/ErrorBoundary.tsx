import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

// ==================== INTERFACES ====================

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
  enableRetry?: boolean
}

// ==================== COMPONENTE PRINCIPAL ====================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      errorInfo
    })

    // Log do erro
    console.error('ErrorBoundary capturou um erro:', error, errorInfo)

    // Callback personalizado
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Enviar erro para serviço de monitoramento (ex: Sentry)
    this.reportError(error, errorInfo)
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Exemplo de envio para API de logs
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorReport)
    }).catch(err => {
      console.error('Falha ao reportar erro:', err)
    })
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Usar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Renderizar UI de erro padrão
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-4 text-lg font-medium text-gray-900">
                  Ops! Algo deu errado
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Ocorreu um erro inesperado. Nossa equipe foi notificada.
                </p>
                
                {this.props.showDetails && this.state.error && (
                  <div className="mt-4 p-3 bg-red-50 rounded-md text-left">
                    <h3 className="text-sm font-medium text-red-800 mb-2">
                      Detalhes do erro:
                    </h3>
                    <p className="text-xs text-red-700 font-mono">
                      {this.state.error.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {this.state.errorId}
                    </p>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  {this.props.enableRetry && (
                    <button
                      onClick={this.handleRetry}
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Tentar novamente
                    </button>
                  )}
                  
                  <button
                    onClick={this.handleReload}
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recarregar página
                  </button>
                  
                  <button
                    onClick={this.handleGoHome}
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Ir para início
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    Se o problema persistir, entre em contato com o suporte.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ==================== COMPONENTE DE ERRO SIMPLES ====================

interface ErrorDisplayProps {
  error: Error | string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  variant?: 'inline' | 'toast' | 'banner'
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
  variant = 'inline'
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message

  const baseClasses = {
    inline: 'p-4 rounded-md bg-red-50 border border-red-200',
    toast: 'p-4 rounded-lg bg-red-500 text-white shadow-lg',
    banner: 'p-3 bg-red-600 text-white'
  }

  const textClasses = {
    inline: 'text-red-800',
    toast: 'text-white',
    banner: 'text-white'
  }

  return (
    <div className={`${baseClasses[variant]} ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className={`w-5 h-5 ${textClasses[variant]} mt-0.5 mr-3 flex-shrink-0`} />
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${textClasses[variant]}`}>
            Erro
          </h3>
          <p className={`text-sm ${textClasses[variant]} mt-1`}>
            {errorMessage}
          </p>
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`text-sm font-medium ${
                    variant === 'inline' 
                      ? 'text-red-800 hover:text-red-900' 
                      : 'text-white hover:text-gray-200'
                  } underline`}
                >
                  Tentar novamente
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`text-sm font-medium ${
                    variant === 'inline' 
                      ? 'text-red-800 hover:text-red-900' 
                      : 'text-white hover:text-gray-200'
                  } underline`}
                >
                  Dispensar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== HOOK PARA CAPTURA DE ERROS ====================

export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const captureError = React.useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    setError(errorObj)
    console.error('Erro capturado:', errorObj)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    captureError,
    clearError,
    hasError: !!error
  }
}

export default ErrorBoundary