import React from 'react'
import { Navigate } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { PermissionSlug } from '../../types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  permission?: PermissionSlug
  permissions?: PermissionSlug[]
  requireAll?: boolean
  fallback?: React.ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback,
  redirectTo = '/dashboard'
}) => {
  const { hasPermission, hasAnyPermission } = usePermissions()

  // Verifica permissão única
  if (permission && !hasPermission(permission)) {
    return fallback ? <>{fallback}</> : <Navigate to={redirectTo} replace />
  }

  // Verifica múltiplas permissões
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? permissions.every(p => hasPermission(p))
      : hasAnyPermission(permissions)
    
    if (!hasAccess) {
      return fallback ? <>{fallback}</> : <Navigate to={redirectTo} replace />
    }
  }

  return <>{children}</>
}

// Componente para mostrar conteúdo baseado em permissões
interface ConditionalRenderProps {
  children: React.ReactNode
  permission?: PermissionSlug
  permissions?: PermissionSlug[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null
}) => {
  const { hasPermission, hasAnyPermission } = usePermissions()

  // Verifica permissão única
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>
  }

  // Verifica múltiplas permissões
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? permissions.every(p => hasPermission(p))
      : hasAnyPermission(permissions)
    
    if (!hasAccess) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

// HOC para proteger componentes
export const withPermission = (
  Component: React.ComponentType<any>,
  permission: PermissionSlug | PermissionSlug[],
  requireAll = false
) => {
  return (props: any) => {
    const permissions = Array.isArray(permission) ? permission : [permission]
    
    return (
      <ProtectedRoute permissions={permissions} requireAll={requireAll}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}