import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { usePermissions } from './usePermissions'
import { menuConfig } from '../config/menuConfig'
import { MenuItem, MenuSection } from '../types/menu'

export const useMenu = () => {
  const location = useLocation()
  const { hasPermission } = usePermissions()

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => {
        // Se o item tem permissão definida, verifica se o usuário tem essa permissão
        if (item.permission && !hasPermission(item.permission)) {
          return false
        }
        return true
      })
      .map(item => ({
        ...item,
        isActive: item.path === location.pathname,
        children: item.children ? filterMenuItems(item.children) : undefined
      }))
      .filter(item => {
        // Remove itens que não têm filhos após a filtragem (se eram apenas containers)
        if (item.children && item.children.length === 0 && !item.path) {
          return false
        }
        return true
      })
  }

  const filteredMenu = useMemo(() => {
    return menuConfig
      .map(section => ({
        ...section,
        items: filterMenuItems(section.items)
      }))
      .filter(section => {
        // Remove seções vazias ou sem permissão
        if (section.permission && !hasPermission(section.permission)) {
          return false
        }
        return section.items.length > 0
      })
  }, [location.pathname, hasPermission])

  const findActiveMenuItem = (items: MenuItem[]): MenuItem | null => {
    for (const item of items) {
      if (item.path === location.pathname) {
        return item
      }
      if (item.children) {
        const activeChild = findActiveMenuItem(item.children)
        if (activeChild) {
          return activeChild
        }
      }
    }
    return null
  }

  const activeMenuItem = useMemo(() => {
    for (const section of filteredMenu) {
      const activeItem = findActiveMenuItem(section.items)
      if (activeItem) {
        return activeItem
      }
    }
    return null
  }, [filteredMenu])

  const getBreadcrumbs = () => {
    const breadcrumbs: { label: string; path?: string }[] = []
    
    for (const section of filteredMenu) {
      const findPath = (items: MenuItem[], path: string[]): boolean => {
        for (const item of items) {
          const currentPath = [...path, item.label]
          
          if (item.path === location.pathname) {
            breadcrumbs.push(...currentPath.map((label, index) => ({
              label,
              path: index === currentPath.length - 1 ? item.path : undefined
            })))
            return true
          }
          
          if (item.children && findPath(item.children, currentPath)) {
            return true
          }
        }
        return false
      }
      
      if (findPath(section.items, [])) {
        break
      }
    }
    
    return breadcrumbs
  }

  return {
    menu: filteredMenu,
    activeMenuItem,
    breadcrumbs: getBreadcrumbs()
  }
}