import { useForm, UseFormProps, FieldValues, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'

interface UseFormValidationProps<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: z.ZodType<T>
  onSubmit: (data: T) => Promise<void> | void
  onError?: (errors: any) => void
  showToastOnError?: boolean
}

export function useFormValidation<T extends FieldValues>({
  schema,
  onSubmit,
  onError,
  showToastOnError = true,
  ...formProps
}: UseFormValidationProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema as any),
    mode: 'onChange',
    ...formProps
  })

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
    setError,
    clearErrors,
    reset,
    watch,
    setValue,
    getValues
  } = form

  const onSubmitHandler = handleSubmit(
    async (data) => {
      try {
        await onSubmit(data)
        toast.success('Dados salvos com sucesso!')
      } catch (error: any) {
        console.error('Erro ao salvar:', error)
        
        // Se o erro contém informações de validação do servidor
        if (error.response?.data?.errors) {
          const serverErrors = error.response.data.errors
          Object.keys(serverErrors).forEach((field) => {
            setError(field as Path<T>, {
              type: 'server',
              message: serverErrors[field]
            })
          })
        } else {
          if (showToastOnError) {
            toast.error(error.message || 'Erro ao salvar dados')
          }
        }
        
        if (onError) {
          onError(error)
        }
      }
    },
    (errors) => {
      console.error('Erros de validação:', errors)
      if (showToastOnError) {
        toast.error('Por favor, corrija os erros no formulário')
      }
      if (onError) {
        onError(errors)
      }
    }
  )

  // Função para validar um campo específico
  const validateField = (fieldName: Path<T>, value: any) => {
    try {
      // Validação simplificada - apenas verifica se o valor é válido
      schema.parse({ ...getValues(), [fieldName]: value } as T)
      clearErrors(fieldName)
      return true
    } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.issues.find((err: any) => 
            err.path.includes(fieldName as string)
          )
          if (fieldError) {
            setError(fieldName, {
              type: 'validation',
              message: fieldError.message || 'Valor inválido'
            })
          }
        }
        return false
      }
  }

  // Função para obter erro de um campo específico
  const getFieldError = (fieldName: Path<T>) => {
    return errors[fieldName]?.message
  }

  // Função para verificar se um campo tem erro
  const hasFieldError = (fieldName: Path<T>) => {
    return !!errors[fieldName]
  }

  // Função para resetar o formulário com novos dados
  const resetWithData = (data: T) => {
    reset(data)
    clearErrors()
  }

  return {
    // Métodos do react-hook-form
    ...form,
    
    // Handlers customizados
    onSubmit: onSubmitHandler,
    
    // Estados derivados
    isSubmitting,
    isValid,
    isDirty,
    hasErrors: Object.keys(errors).length > 0,
    
    // Funções utilitárias
    validateField,
    getFieldError,
    hasFieldError,
    resetWithData,
    
    // Valores observados
    watchedValues: watch(),
    
    // Função para definir múltiplos valores
    setValues: (values: Partial<T>) => {
      Object.entries(values).forEach(([key, value]) => {
        setValue(key as Path<T>, value, { shouldValidate: true, shouldDirty: true })
      })
    }
  }
}

// Hook específico para validação de senha
export function usePasswordValidation() {
  const validatePasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[@$!%*?&]/.test(password)
    }

    const score = Object.values(checks).filter(Boolean).length
    
    let strength: 'weak' | 'fair' | 'good' | 'strong'
    if (score < 3) strength = 'weak'
    else if (score < 4) strength = 'fair'
    else if (score < 5) strength = 'good'
    else strength = 'strong'

    return {
      checks,
      score,
      strength,
      isValid: score >= 4
    }
  }

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'text-red-600'
      case 'fair': return 'text-orange-600'
      case 'good': return 'text-yellow-600'
      case 'strong': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getPasswordStrengthText = (strength: string) => {
    switch (strength) {
      case 'weak': return 'Fraca'
      case 'fair': return 'Regular'
      case 'good': return 'Boa'
      case 'strong': return 'Forte'
      default: return ''
    }
  }

  return {
    validatePasswordStrength,
    getPasswordStrengthColor,
    getPasswordStrengthText
  }
}

// Hook para validação de CPF/CNPJ
export function useDocumentValidation() {
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  return {
    formatCPF,
    formatCNPJ,
    formatPhone,
    formatCEP
  }
}