/**
 * Índice Centralizado dos Serviços
 * 
 * Este arquivo centraliza todas as exportações dos serviços,
 * facilitando a importação e uso em componentes e páginas.
 */

// ==================== SERVIÇOS PRINCIPAIS ====================

// Serviços principais
import authService from './authService'
import employeesService from './employeesService'
import tasksService from './tasksService'
import leadsService from './leadsService'
import notificationsService from './notificationsService'
import expensesService from './expensesService'
import { contractsService } from './contractsService'

// Re-exportar serviços
export { authService, employeesService, tasksService, leadsService, notificationsService, expensesService, contractsService }

// ==================== CLIENTE HTTP ====================

// Cliente HTTP base
export { httpClient } from './httpClient'
export type { ApiResponse } from './httpClient'

// ==================== CONFIGURAÇÕES ====================

// Configurações da API
export {
  API_ENDPOINTS,
  API_CONFIG,
  buildQueryString
} from '../config/api'
export type {
  PaginationParams,
  SearchParams
} from '../config/api'

// ==================== UTILITÁRIOS COMPARTILHADOS ====================

/**
 * Utilitários para formatação de dados
 */
export const formatUtils = {
  /**
   * Formata valor monetário
   */
  currency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  },

  /**
   * Formata data
   */
  date: (date: Date | string): string => {
    return new Date(date).toLocaleDateString('pt-BR')
  },

  /**
   * Formata data e hora
   */
  datetime: (date: Date | string): string => {
    return new Date(date).toLocaleString('pt-BR')
  },

  /**
   * Formata número com separadores
   */
  number: (value: number): string => {
    return new Intl.NumberFormat('pt-BR').format(value)
  },

  /**
   * Formata porcentagem
   */
  percentage: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }).format(value / 100)
  },

  /**
   * Formata telefone brasileiro
   */
  phone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return phone
  },

  /**
   * Formata CPF
   */
  cpf: (cpf: string): string => {
    const cleaned = cpf.replace(/\D/g, '')
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  },

  /**
   * Formata CNPJ
   */
  cnpj: (cnpj: string): string => {
    const cleaned = cnpj.replace(/\D/g, '')
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
}

/**
 * Utilitários para validação de dados
 */
export const validationUtils = {
  /**
   * Valida email
   */
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Valida CPF
   */
  cpf: (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '')
    
    if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
      return false
    }

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleaned.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleaned.charAt(10))) return false

    return true
  },

  /**
   * Valida CNPJ
   */
  cnpj: (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, '')
    
    if (cleaned.length !== 14 || /^(\d)\1{13}$/.test(cleaned)) {
      return false
    }

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights1[i]
    }
    let remainder = sum % 11
    const digit1 = remainder < 2 ? 0 : 11 - remainder

    sum = 0
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights2[i]
    }
    remainder = sum % 11
    const digit2 = remainder < 2 ? 0 : 11 - remainder

    return digit1 === parseInt(cleaned.charAt(12)) && digit2 === parseInt(cleaned.charAt(13))
  },

  /**
   * Valida telefone brasileiro
   */
  phone: (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length === 10 || cleaned.length === 11
  },

  /**
   * Valida senha forte
   */
  strongPassword: (password: string): boolean => {
    // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return strongPasswordRegex.test(password)
  },

  /**
   * Valida URL
   */
  url: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Utilitários para manipulação de arrays e objetos
 */
export const dataUtils = {
  /**
   * Remove duplicatas de array
   */
  removeDuplicates: <T>(array: T[], key?: keyof T): T[] => {
    if (!key) {
      return [...new Set(array)]
    }
    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  },

  /**
   * Agrupa array por propriedade
   */
  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key])
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>)
  },

  /**
   * Ordena array por propriedade
   */
  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aValue = a[key]
      const bValue = b[key]
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })
  },

  /**
   * Filtra array por múltiplos critérios
   */
  filterBy: <T>(array: T[], filters: Partial<T>): T[] => {
    return array.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return true
        }
        return item[key as keyof T] === value
      })
    })
  },

  /**
   * Busca em array por termo
   */
  searchIn: <T>(array: T[], searchTerm: string, searchKeys: (keyof T)[]): T[] => {
    if (!searchTerm.trim()) return array
    
    const term = searchTerm.toLowerCase()
    return array.filter(item => {
      return searchKeys.some(key => {
        const value = String(item[key]).toLowerCase()
        return value.includes(term)
      })
    })
  }
}

/**
 * Utilitários para localStorage
 */
export const storageUtils = {
  /**
   * Salva item no localStorage
   */
  setItem: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error)
    }
  },

  /**
   * Obtém item do localStorage
   */
  getItem: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error)
      return defaultValue || null
    }
  },

  /**
   * Remove item do localStorage
   */
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error)
    }
  },

  /**
   * Limpa localStorage
   */
  clear: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error)
    }
  }
}

// ==================== EXPORTAÇÃO PADRÃO ====================

/**
 * Objeto com todos os serviços para importação conveniente
 */
export const services = {
  auth: authService,
  employees: employeesService,
  tasks: tasksService,
  leads: leadsService,
  notifications: notificationsService,
  expenses: expensesService,
  contracts: contractsService
}

export default services