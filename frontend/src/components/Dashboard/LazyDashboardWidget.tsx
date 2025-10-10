import React, { Suspense, lazy, memo, useCallback, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, Loader2 } from 'lucide-react';

// Lazy loading dos componentes de widgets
const QuickStatsWidget = lazy(() => import('./QuickStatsWidget'));
const TaskMetricsWidget = lazy(() => import('./TaskMetricsWidget'));
const LeadMetricsWidget = lazy(() => import('./LeadMetricsWidget'));
const FinancialMetricsWidget = lazy(() => import('./FinancialMetricsWidget'));
const SystemMetricsWidget = lazy(() => import('./SystemMetricsWidget'));
const NotificationsWidget = lazy(() => import('./NotificationsWidget'));

interface LazyWidgetProps {
  type: 'quickStats' | 'taskMetrics' | 'leadMetrics' | 'financialMetrics' | 'systemMetrics' | 'notifications';
  data: any;
  loading?: boolean;
  error?: string | null;
  priority?: 'high' | 'medium' | 'low';
  className?: string;
  onRefresh?: () => void;
}

// Componente de loading otimizado
const WidgetSkeleton: React.FC<{ type: string }> = memo(({ type }) => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 bg-gray-200 rounded w-32"></div>
      <div className="h-8 w-8 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-3">
      <div className="h-8 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-48"></div>
      {type === 'quickStats' && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      )}
      {(type === 'taskMetrics' || type === 'leadMetrics') && (
        <div className="h-32 bg-gray-200 rounded mt-4"></div>
      )}
    </div>
  </div>
));

WidgetSkeleton.displayName = 'WidgetSkeleton';

// Componente de erro otimizado
const WidgetError: React.FC<{ 
  error: Error; 
  resetErrorBoundary: () => void;
  type: string;
}> = memo(({ error, resetErrorBoundary, type }) => (
  <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
    <div className="flex items-center mb-4">
      <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
      <h3 className="text-lg font-semibold text-gray-900">
        Erro ao carregar {type}
      </h3>
    </div>
    <p className="text-gray-600 mb-4 text-sm">
      {error.message || 'Ocorreu um erro inesperado'}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
    >
      Tentar novamente
    </button>
  </div>
));

WidgetError.displayName = 'WidgetError';

// Componente de loading com spinner
const LoadingSpinner: React.FC = memo(() => (
  <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      <p className="text-gray-600 text-sm">Carregando dados...</p>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Hook para intersection observer (lazy loading baseado em visibilidade)
const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
};

// Componente principal do widget lazy
const LazyDashboardWidget: React.FC<LazyWidgetProps> = memo(({
  type,
  data,
  loading = false,
  error = null,
  priority = 'medium',
  className = '',
  onRefresh
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { hasIntersected } = useIntersectionObserver(containerRef, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Memoiza o componente baseado no tipo
  const WidgetComponent = useMemo(() => {
    switch (type) {
      case 'quickStats':
        return QuickStatsWidget;
      case 'taskMetrics':
        return TaskMetricsWidget;
      case 'leadMetrics':
        return LeadMetricsWidget;
      case 'financialMetrics':
        return FinancialMetricsWidget;
      case 'systemMetrics':
        return SystemMetricsWidget;
      case 'notifications':
        return NotificationsWidget;
      default:
        return null;
    }
  }, [type]);

  // Callback para reset do error boundary
  const handleErrorReset = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  // Renderiza skeleton se ainda não intersectou
  if (!hasIntersected) {
    return (
      <div ref={containerRef} className={className}>
        <WidgetSkeleton type={type} />
      </div>
    );
  }

  // Renderiza loading se estiver carregando
  if (loading) {
    return (
      <div ref={containerRef} className={className}>
        <LoadingSpinner />
      </div>
    );
  }

  // Renderiza erro se houver erro
  if (error) {
    return (
      <div ref={containerRef} className={className}>
        <WidgetError 
          error={new Error(error)} 
          resetErrorBoundary={handleErrorReset}
          type={type}
        />
      </div>
    );
  }

  // Renderiza o componente com error boundary
  return (
    <div ref={containerRef} className={className}>
      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }) => (
          <WidgetError 
            error={error} 
            resetErrorBoundary={resetErrorBoundary}
            type={type}
          />
        )}
        onReset={handleErrorReset}
        resetKeys={[data, type]}
      >
        <Suspense fallback={<LoadingSpinner />}>
          {WidgetComponent && (
            <WidgetComponent 
              data={data} 
              loading={loading}
              onRefresh={onRefresh}
              priority={priority}
            />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
});

LazyDashboardWidget.displayName = 'LazyDashboardWidget';

export default LazyDashboardWidget;

// Hook para otimização de re-renders
export const useMemoizedData = (data: any, dependencies: any[] = []) => {
  return useMemo(() => data, dependencies);
};