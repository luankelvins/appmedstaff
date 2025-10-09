import { lazy } from 'react'

// Lazy loading dos componentes para melhor performance
export const SecurityChart = lazy(() => import('./SecurityChart'))
export const SecurityFilters = lazy(() => import('./SecurityFilters'))
export const SecurityHistory = lazy(() => import('./SecurityHistory'))

// Componente principal não é lazy pois é sempre necessário
export { default as SecurityDashboard } from '../SecurityDashboard'