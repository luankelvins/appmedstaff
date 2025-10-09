export interface MenuItem {
  id: string
  label: string
  icon?: string
  path?: string
  permission?: string
  children?: MenuItem[]
  badge?: string | number
  isActive?: boolean
  isExpanded?: boolean
}

export interface MenuSection {
  id: string
  title: string
  items: MenuItem[]
  permission?: string
}

export type MenuStructure = MenuSection[]