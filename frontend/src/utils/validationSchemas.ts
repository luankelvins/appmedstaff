import { z } from 'zod'

// Schema para informações pessoais
export const personalInfoSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      // Regex para telefone brasileiro: (11) 99999-9999 ou 11999999999
      return /^(\(\d{2}\)\s?)?\d{4,5}-?\d{4}$/.test(val.replace(/\s/g, ''))
    }, 'Telefone deve estar no formato (11) 99999-9999'),
  
  birthDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      const date = new Date(val)
      const now = new Date()
      const age = now.getFullYear() - date.getFullYear()
      return age >= 16 && age <= 100
    }, 'Data de nascimento deve ser válida (idade entre 16 e 100 anos)'),
  
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true
        // CEP brasileiro: 12345-678 ou 12345678
        return /^\d{5}-?\d{3}$/.test(val)
      }, 'CEP deve estar no formato 12345-678'),
    country: z.string().default('Brasil')
  })
})

// Schema para alteração de senha
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Senha atual é obrigatória'),
  
  newPassword: z
    .string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .max(128, 'Nova senha deve ter no máximo 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 símbolo'),
  
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Confirmação de senha não confere',
  path: ['confirmPassword']
})

// Schema para preferências do usuário
export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    message: 'Tema deve ser light, dark ou system'
  }),
  
  language: z.enum(['pt-BR', 'en-US'], {
    message: 'Idioma deve ser pt-BR ou en-US'
  }),
  
  timezone: z.string().min(1, 'Fuso horário é obrigatório'),
  
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], {
    message: 'Formato de data inválido'
  }),
  
  timeFormat: z.enum(['12h', '24h'], {
    message: 'Formato de hora deve ser 12h ou 24h'
  }),
  
  notifications: z.object({
    email: z.object({
      enabled: z.boolean(),
      frequency: z.enum(['immediate', 'daily', 'weekly'], {
        message: 'Frequência deve ser immediate, daily ou weekly'
      }),
      types: z.object({
        tasks: z.boolean(),
        mentions: z.boolean(),
        updates: z.boolean(),
        security: z.boolean(),
        marketing: z.boolean()
      })
    }),
    push: z.object({
      enabled: z.boolean(),
      types: z.object({
        tasks: z.boolean(),
        mentions: z.boolean(),
        chat: z.boolean(),
        updates: z.boolean()
      })
    }),
    inApp: z.object({
      enabled: z.boolean(),
      sound: z.boolean(),
      desktop: z.boolean(),
      types: z.object({
        tasks: z.boolean(),
        mentions: z.boolean(),
        chat: z.boolean(),
        updates: z.boolean(),
        system: z.boolean()
      })
    })
  }),
  
  dashboard: z.object({
    layout: z.enum(['grid', 'list'], {
      message: 'Layout deve ser grid ou list'
    }),
    widgets: z.array(z.object({
      id: z.string(),
      enabled: z.boolean(),
      position: z.number().optional(),
      size: z.enum(['small', 'medium', 'large']).optional()
    })),
    defaultView: z.string(),
    autoRefresh: z.boolean(),
    refreshInterval: z.number().min(5).max(300, 'Intervalo deve ser entre 5 e 300 segundos')
  }),
  
  privacy: z.object({
    profileVisibility: z.enum(['public', 'team', 'private'], {
      message: 'Visibilidade deve ser public, team ou private'
    }),
    showEmail: z.boolean(),
    showPhone: z.boolean(),
    showBirthDate: z.boolean(),
    showAddress: z.boolean(),
    allowDirectMessages: z.boolean(),
    allowMentions: z.boolean(),
    shareActivityStatus: z.boolean()
  })
})

// Schema para configurações de segurança
export const securitySettingsSchema = z.object({
  sessionTimeout: z
    .number()
    .min(5, 'Timeout deve ser pelo menos 5 minutos')
    .max(480, 'Timeout deve ser no máximo 8 horas'),
  
  loginNotifications: z.boolean(),
  
  deviceTrust: z.object({
    enabled: z.boolean(),
    trustedDevices: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['desktop', 'mobile', 'tablet']),
      lastUsed: z.string(),
      trusted: z.boolean()
    }))
  })
})

// Tipos TypeScript derivados dos schemas
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>
export type PreferencesFormData = z.infer<typeof preferencesSchema>
export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>

// Função utilitária para formatar erros de validação
export const formatValidationErrors = (errors: z.ZodError) => {
  return errors.issues.reduce((acc: Record<string, string>, error: z.ZodIssue) => {
    const path = error.path.join('.')
    acc[path] = error.message
    return acc
  }, {} as Record<string, string>)
}

// Validações customizadas
export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '')
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false
  
  // Validação do algoritmo do CPF
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

export const validateCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '')
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false
  
  // Validação do algoritmo do CNPJ
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