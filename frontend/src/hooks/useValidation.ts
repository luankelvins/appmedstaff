import { useState, useCallback, useMemo } from 'react'

// ==================== INTERFACES ====================

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
  phone?: boolean
  cpf?: boolean
  cnpj?: boolean
  custom?: (value: any) => string | null
  min?: number
  max?: number
  integer?: boolean
  positive?: boolean
}

export interface ValidationSchema {
  [field: string]: ValidationRule
}

export interface ValidationErrors {
  [field: string]: string[]
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationErrors
  hasError: (field: string) => boolean
  getError: (field: string) => string | null
  getErrors: (field: string) => string[]
}

// ==================== UTILITÁRIOS DE VALIDAÇÃO ====================

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '')
  
  if (cleanCPF.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false

  return true
}

const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, '')
  
  if (cleanCNPJ.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i]
  }
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder

  if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false

  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i]
  }
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder

  return digit2 === parseInt(cleanCNPJ.charAt(13))
}

// ==================== FUNÇÃO DE VALIDAÇÃO ====================

const validateFieldValue = (value: any, rule: ValidationRule): string[] => {
  const errors: string[] = []

  // Verificar se é obrigatório
  if (rule.required && (value === null || value === undefined || value === '')) {
    errors.push('Este campo é obrigatório')
    return errors // Se é obrigatório e está vazio, não precisa validar outras regras
  }

  // Se não é obrigatório e está vazio, não validar outras regras
  if (!rule.required && (value === null || value === undefined || value === '')) {
    return errors
  }

  const stringValue = String(value)

  // Validar comprimento mínimo
  if (rule.minLength && stringValue.length < rule.minLength) {
    errors.push(`Deve ter pelo menos ${rule.minLength} caracteres`)
  }

  // Validar comprimento máximo
  if (rule.maxLength && stringValue.length > rule.maxLength) {
    errors.push(`Deve ter no máximo ${rule.maxLength} caracteres`)
  }

  // Validar padrão regex
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    errors.push('Formato inválido')
  }

  // Validar email
  if (rule.email && !validateEmail(stringValue)) {
    errors.push('Email inválido')
  }

  // Validar telefone
  if (rule.phone && !validatePhone(stringValue)) {
    errors.push('Telefone inválido')
  }

  // Validar CPF
  if (rule.cpf && !validateCPF(stringValue)) {
    errors.push('CPF inválido')
  }

  // Validar CNPJ
  if (rule.cnpj && !validateCNPJ(stringValue)) {
    errors.push('CNPJ inválido')
  }

  // Validações numéricas
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const numValue = Number(value)

    if (rule.min !== undefined && numValue < rule.min) {
      errors.push(`Deve ser maior ou igual a ${rule.min}`)
    }

    if (rule.max !== undefined && numValue > rule.max) {
      errors.push(`Deve ser menor ou igual a ${rule.max}`)
    }

    if (rule.integer && !Number.isInteger(numValue)) {
      errors.push('Deve ser um número inteiro')
    }

    if (rule.positive && numValue <= 0) {
      errors.push('Deve ser um número positivo')
    }
  }

  // Validação customizada
  if (rule.custom) {
    const customError = rule.custom(value)
    if (customError) {
      errors.push(customError)
    }
  }

  return errors
}

// ==================== HOOK DE VALIDAÇÃO ====================

export const useValidation = (schema: ValidationSchema) => {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validate = useCallback((data: Record<string, any>): ValidationResult => {
    const newErrors: ValidationErrors = {}

    // Validar cada campo do schema
    Object.keys(schema).forEach(field => {
      const rule = schema[field]
      const value = data[field]
      const fieldErrors = validateFieldValue(value, rule)

      if (fieldErrors.length > 0) {
        newErrors[field] = fieldErrors
      }
    })

    setErrors(newErrors)

    const isValid = Object.keys(newErrors).length === 0

    return {
      isValid,
      errors: newErrors,
      hasError: (field: string) => Boolean(newErrors[field]?.length),
      getError: (field: string) => newErrors[field]?.[0] || null,
      getErrors: (field: string) => newErrors[field] || []
    }
  }, [schema])

  const validateSingleField = useCallback((field: string, value: any): ValidationResult => {
    const rule = schema[field]
    if (!rule) {
      return {
        isValid: true,
        errors: {},
        hasError: () => false,
        getError: () => null,
        getErrors: () => []
      }
    }

    const fieldErrors = validateFieldValue(value, rule)
    const newErrors = { ...errors }

    if (fieldErrors.length > 0) {
      newErrors[field] = fieldErrors
    } else {
      delete newErrors[field]
    }

    setErrors(newErrors)

    return {
      isValid: fieldErrors.length === 0,
      errors: newErrors,
      hasError: (f: string) => Boolean(newErrors[f]?.length),
      getError: (f: string) => newErrors[f]?.[0] || null,
      getErrors: (f: string) => newErrors[f] || []
    }
  }, [schema, errors])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const currentResult = useMemo((): ValidationResult => ({
    isValid: Object.keys(errors).length === 0,
    errors,
    hasError: (field: string) => Boolean(errors[field]?.length),
    getError: (field: string) => errors[field]?.[0] || null,
    getErrors: (field: string) => errors[field] || []
  }), [errors])

  return {
    validate,
    validateField: validateSingleField,
    clearErrors,
    clearFieldError,
    ...currentResult
  }
}

// ==================== SCHEMAS PRÉ-DEFINIDOS ====================

export const authSchemas = {
  login: {
    email: { required: true, email: true },
    password: { required: true, minLength: 6 }
  },
  register: {
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { required: true, email: true },
    password: { required: true, minLength: 8, maxLength: 128 },
    confirmPassword: { required: true }
  }
}

export const profileSchemas = {
  updateProfile: {
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { required: true, email: true },
    phone: { phone: true }
  }
}

export default useValidation