import { useState, useCallback, useMemo } from 'react'
import { z } from 'zod'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings?: Record<string, string>
}

export interface UseFormValidationOptions {
  validationRules: FieldValidation
  validateOnChange?: boolean
  validateOnBlur?: boolean
  debounceMs?: number
}

export function useFormValidation<T extends Record<string, any>>({
  validationRules,
  validateOnChange = true,
  validateOnBlur = true,
  debounceMs = 300
}: UseFormValidationOptions) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Debounce function
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }, [])

  // Validate single field
  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const rules = validationRules[fieldName]
    if (!rules) return null

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${fieldName} é obrigatório`
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null
    }

    // Min length validation
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      return `${fieldName} deve ter pelo menos ${rules.minLength} caracteres`
    }

    // Max length validation
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      return `${fieldName} deve ter no máximo ${rules.maxLength} caracteres`
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return `${fieldName} tem formato inválido`
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value)
    }

    return null
  }, [validationRules])

  // Validate all fields
  const validateAll = useCallback((data: T): ValidationResult => {
    setIsValidating(true)
    const newErrors: Record<string, string> = {}
    const newWarnings: Record<string, string> = {}

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, data[fieldName])
      if (error) {
        newErrors[fieldName] = error
      }
    })

    setErrors(newErrors)
    setWarnings(newWarnings)
    setIsValidating(false)

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
      warnings: newWarnings
    }
  }, [validationRules, validateField])

  // Validate single field with debounce
  const debouncedValidateField = useMemo(
    () => debounce((fieldName: string, value: any) => {
      const error = validateField(fieldName, value)
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || ''
      }))
    }, debounceMs),
    [validateField, debounce, debounceMs]
  )

  // Handle field change
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    if (validateOnChange) {
      debouncedValidateField(fieldName, value)
    }
  }, [validateOnChange, debouncedValidateField])

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName: string, value: any) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    
    if (validateOnBlur) {
      const error = validateField(fieldName, value)
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || ''
      }))
    }
  }, [validateOnBlur, validateField])

  // Clear field error
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }, [])

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors({})
    setWarnings({})
  }, [])

  // Reset validation state
  const resetValidation = useCallback(() => {
    setErrors({})
    setWarnings({})
    setTouched({})
  }, [])

  // Check if field has error
  const hasError = useCallback((fieldName: string) => {
    return !!errors[fieldName]
  }, [errors])

  // Check if field was touched
  const wasTouched = useCallback((fieldName: string) => {
    return !!touched[fieldName]
  }, [touched])

  // Get field error
  const getFieldError = useCallback((fieldName: string) => {
    return errors[fieldName] || ''
  }, [errors])

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return Object.keys(errors).length === 0
  }, [errors])

  return {
    errors,
    warnings,
    touched,
    isValidating,
    isFormValid,
    validateAll,
    validateField,
    handleFieldChange,
    handleFieldBlur,
    clearFieldError,
    clearAllErrors,
    resetValidation,
    hasError,
    wasTouched,
    getFieldError
  }
}

// Hook específico para validação de CPF
export function useCPFValidation() {
  const validateCPF = useCallback((cpf: string): string | null => {
    if (!cpf) return null

    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '')

    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) {
      return 'CPF deve ter 11 dígitos'
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      return 'CPF inválido'
    }

    // Validação do algoritmo do CPF
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
    }
    let remainder = 11 - (sum % 11)
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(9))) {
      return 'CPF inválido'
    }

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
    }
    remainder = 11 - (sum % 11)
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(10))) {
      return 'CPF inválido'
    }

    return null
  }, [])

  return { validateCPF }
}

// Hook específico para validação de CNPJ
export function useCNPJValidation() {
  const validateCNPJ = useCallback((cnpj: string): string | null => {
    if (!cnpj) return null

    // Remove caracteres não numéricos
    const cleanCNPJ = cnpj.replace(/\D/g, '')

    // Verifica se tem 14 dígitos
    if (cleanCNPJ.length !== 14) {
      return 'CNPJ deve ter 14 dígitos'
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
      return 'CNPJ inválido'
    }

    // Validação do algoritmo do CNPJ
    let sum = 0
    let weight = 2
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weight
      weight = weight === 9 ? 2 : weight + 1
    }
    let remainder = sum % 11
    const firstDigit = remainder < 2 ? 0 : 11 - remainder
    if (firstDigit !== parseInt(cleanCNPJ.charAt(12))) {
      return 'CNPJ inválido'
    }

    sum = 0
    weight = 2
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weight
      weight = weight === 9 ? 2 : weight + 1
    }
    remainder = sum % 11
    const secondDigit = remainder < 2 ? 0 : 11 - remainder
    if (secondDigit !== parseInt(cleanCNPJ.charAt(13))) {
      return 'CNPJ inválido'
    }

    return null
  }, [])

  return { validateCNPJ }
}

// Hook específico para validação de email
export function useEmailValidation() {
  const validateEmail = useCallback((email: string): string | null => {
    if (!email) return null

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'Email inválido'
    }

    return null
  }, [])

  return { validateEmail }
}

// Hook específico para validação de telefone
export function usePhoneValidation() {
  const validatePhone = useCallback((phone: string): string | null => {
    if (!phone) return null

    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '')

    // Verifica se tem 10 ou 11 dígitos (com DDD)
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return 'Telefone deve ter 10 ou 11 dígitos'
    }

    return null
  }, [])

  const formatPhone = useCallback((phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '')
    
    if (cleanPhone.length <= 2) {
      return cleanPhone
    } else if (cleanPhone.length <= 6) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2)}`
    } else if (cleanPhone.length <= 10) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6, 10)}`
    } else {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7, 11)}`
    }
  }, [])

  return { validatePhone, formatPhone }
}

// Hook específico para validação de senha
export function usePasswordValidation() {
  const validatePassword = useCallback((password: string): string | null => {
    if (!password) return null

    // Mínimo 8 caracteres
    if (password.length < 8) {
      return 'Senha deve ter pelo menos 8 caracteres'
    }

    // Pelo menos uma letra maiúscula
    if (!/[A-Z]/.test(password)) {
      return 'Senha deve conter pelo menos uma letra maiúscula'
    }

    // Pelo menos uma letra minúscula
    if (!/[a-z]/.test(password)) {
      return 'Senha deve conter pelo menos uma letra minúscula'
    }

    // Pelo menos um número
    if (!/[0-9]/.test(password)) {
      return 'Senha deve conter pelo menos um número'
    }

    // Pelo menos um caractere especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Senha deve conter pelo menos um caractere especial'
    }

    return null
  }, [])

  const validatePasswordConfirmation = useCallback((password: string, confirmation: string): string | null => {
    if (!confirmation) return null

    if (password !== confirmation) {
      return 'As senhas não coincidem'
    }

    return null
  }, [])

  const getPasswordStrength = useCallback((password: string): { strength: 'weak' | 'medium' | 'strong' | 'very-strong'; score: number } => {
    if (!password) return { strength: 'weak', score: 0 }

    let score = 0

    // Comprimento
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1

    // Complexidade
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1

    // Diversidade de caracteres
    const uniqueChars = new Set(password.split('')).size
    if (uniqueChars >= 8) score += 1

    if (score <= 3) return { strength: 'weak', score }
    if (score <= 5) return { strength: 'medium', score }
    if (score <= 7) return { strength: 'strong', score }
    return { strength: 'very-strong', score }
  }, [])

  return { 
    validatePassword, 
    validatePasswordConfirmation,
    getPasswordStrength 
  }
}

// Hook específico para validação de documentos
export function useDocumentValidation() {
  const validateFile = useCallback(
    (
      file?: File | null,
      options: {
        maxSizeMB?: number
        allowedTypes?: string[]
        required?: boolean
      } = {}
    ): string | null => {
      const { maxSizeMB = 10, allowedTypes = [], required = false } = options

      if (!file) {
        return required ? 'Documento obrigatório' : null
      }

      // Tamanho máximo
      const maxBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxBytes) {
        return `Arquivo excede o limite de ${maxSizeMB}MB`
      }

      // Tipos permitidos (MIME ou extensão)
      if (allowedTypes.length > 0) {
        const lowerName = file.name.toLowerCase()
        const isAllowedByMime = allowedTypes.includes(file.type)
        const isAllowedByExt = allowedTypes.some(t => lowerName.endsWith(t.toLowerCase()))
        if (!isAllowedByMime && !isAllowedByExt) {
          return `Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}`
        }
      }

      return null
    },
    []
  )

  const validateRequiredDocuments = useCallback(
    (
      documents: Array<{ id?: string; type?: string; file?: File | null; url?: string; required?: boolean }> = [],
      options: {
        requiredTypes?: string[]
      } = {}
    ): Record<string, string> => {
      const { requiredTypes = [] } = options
      const errors: Record<string, string> = {}

      // Verifica obrigatórios por tipo
      requiredTypes.forEach((reqType) => {
        const found = documents.some(d => d.type === reqType && (d.file || d.url))
        if (!found) {
          errors[reqType] = 'Documento obrigatório não enviado'
        }
      })

      // Verifica flag required em cada documento
      documents.forEach((doc, index) => {
        if (doc.required && !doc.file && !doc.url) {
          const key = doc.type || `doc_${index}`
          errors[key] = 'Documento obrigatório não enviado'
        }
      })

      return errors
    },
    []
  )

  return { validateFile, validateRequiredDocuments }
}

// Hook específico para validação de CEP
export function useCEPValidation() {
  const validateCEP = useCallback((cep: string): string | null => {
    if (!cep) return null

    // Remove caracteres não numéricos
    const cleanCEP = cep.replace(/\D/g, '')

    // Verifica se tem 8 dígitos
    if (cleanCEP.length !== 8) {
      return 'CEP deve ter 8 dígitos'
    }

    return null
  }, [])

  const formatCEP = useCallback((cep: string): string => {
    const cleanCEP = cep.replace(/\D/g, '')
    if (cleanCEP.length <= 5) {
      return cleanCEP
    }
    return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5, 8)}`
  }, [])

  return { validateCEP, formatCEP }
}

// Hook específico para validação de data
export function useDateValidation() {
  const validateDate = useCallback((date: string, options: {
    minAge?: number
    maxAge?: number
    minDate?: Date
    maxDate?: Date
  } = {}): string | null => {
    if (!date) return null

    const inputDate = new Date(date)
    const today = new Date()

    // Verifica se é uma data válida
    if (isNaN(inputDate.getTime())) {
      return 'Data inválida'
    }

    // Data mínima
    if (options.minDate && inputDate < options.minDate) {
      return `Data deve ser posterior a ${options.minDate.toLocaleDateString()}`
    }

    // Data máxima
    if (options.maxDate && inputDate > options.maxDate) {
      return `Data deve ser anterior a ${options.maxDate.toLocaleDateString()}`
    }

    // Idade mínima
    if (options.minAge) {
      const age = Math.floor((today.getTime() - inputDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      if (age < options.minAge) {
        return `Idade mínima: ${options.minAge} anos`
      }
    }

    // Idade máxima
    if (options.maxAge) {
      const age = Math.floor((today.getTime() - inputDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      if (age > options.maxAge) {
        return `Idade máxima: ${options.maxAge} anos`
      }
    }

    return null
  }, [])

  const calculateAge = useCallback((birthDate: string): number => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }, [])

  return { validateDate, calculateAge }
}