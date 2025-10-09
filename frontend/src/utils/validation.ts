import { z } from 'zod'

// Esquemas de validação para formulários administrativos

// Validação para membros do time interno
export const employeeSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  
  position: z.string()
    .min(2, 'Cargo deve ter pelo menos 2 caracteres')
    .max(100, 'Cargo deve ter no máximo 100 caracteres'),
  
  department: z.string()
    .min(1, 'Departamento é obrigatório'),
  
  role: z.enum(['super_admin', 'hr_manager', 'hr_analyst', 'manager', 'employee', 'intern'], {
    message: 'Role inválido'
  }),
  
  phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (11) 99999-9999')
    .optional(),
  
  startDate: z.string()
    .refine((date) => {
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime()) && parsedDate <= new Date()
    }, 'Data de início inválida ou futura'),
  
  status: z.enum(['active', 'inactive', 'on_leave'], {
    message: 'Status inválido'
  }),
  
  manager: z.string().optional(),
  
  permissions: z.array(z.string()).min(1, 'Pelo menos uma permissão deve ser selecionada'),
  
  workScheduleId: z.string().optional(),
  
  location: z.object({
    office: z.string().min(1, 'Escritório é obrigatório'),
    address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
    isRemote: z.boolean()
  }).optional()
})

// Validação para departamentos
export const departmentSchema = z.object({
  name: z.string()
    .min(2, 'Nome do departamento deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do departamento deve ter no máximo 100 caracteres'),
  
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  
  manager: z.string()
    .min(1, 'Gerente é obrigatório'),
  
  parentDepartment: z.string().optional(),
  
  budget: z.number()
    .positive('Orçamento deve ser positivo')
    .optional(),
  
  location: z.string()
    .min(2, 'Localização deve ter pelo menos 2 caracteres')
    .optional()
})

// Validação para horários de trabalho
export const workScheduleSchema = z.object({
  name: z.string()
    .min(2, 'Nome do horário deve ter pelo menos 2 caracteres')
    .max(50, 'Nome do horário deve ter no máximo 50 caracteres'),
  
  startTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário de início inválido (formato: HH:MM)'),
  
  endTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário de fim inválido (formato: HH:MM)'),
  
  workDays: z.array(z.number().min(0).max(6))
    .min(1, 'Pelo menos um dia de trabalho deve ser selecionado')
    .max(7, 'Máximo de 7 dias de trabalho'),
  
  breakTime: z.number()
    .min(0, 'Tempo de intervalo não pode ser negativo')
    .max(480, 'Tempo de intervalo não pode exceder 8 horas')
    .optional(),
  
  isFlexible: z.boolean().optional(),
  
  description: z.string()
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .optional()
}).refine((data) => {
  const start = new Date(`1970-01-01T${data.startTime}:00`)
  const end = new Date(`1970-01-01T${data.endTime}:00`)
  return start < end
}, {
  message: 'Horário de início deve ser anterior ao horário de fim',
  path: ['endTime']
})

// Validação para registros de ponto
export const timeEntrySchema = z.object({
  employeeId: z.string()
    .min(1, 'ID do membro do time interno é obrigatório'),
  
  type: z.enum(['clock_in', 'clock_out', 'break_start', 'break_end'], {
    message: 'Tipo de registro inválido'
  }),
  
  timestamp: z.string()
    .refine((date) => {
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime())
    }, 'Data/hora inválida'),
  
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional()
  }).optional(),
  
  notes: z.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
  
  isManual: z.boolean().optional(),
  
  approvedBy: z.string().optional()
})

// Validação para login
export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido'),
  
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
})

// Validação para alteração de senha
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Senha atual é obrigatória'),
  
  newPassword: z.string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),
  
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Confirmação de senha não confere',
  path: ['confirmPassword']
})

// Tipos TypeScript derivados dos esquemas
export type EmployeeFormData = z.infer<typeof employeeSchema>
export type DepartmentFormData = z.infer<typeof departmentSchema>
export type WorkScheduleFormData = z.infer<typeof workScheduleSchema>
export type TimeEntryFormData = z.infer<typeof timeEntrySchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// Utilitários de validação
export class ValidationUtils {
  // Validar CPF
  static validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, '')
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false
    }
    
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.charAt(9))) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    
    return remainder === parseInt(cpf.charAt(10))
  }
  
  // Validar CNPJ
  static validateCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]/g, '')
    
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
      return false
    }
    
    let length = cnpj.length - 2
    let numbers = cnpj.substring(0, length)
    let digits = cnpj.substring(length)
    let sum = 0
    let pos = length - 7
    
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--
      if (pos < 2) pos = 9
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11
    if (result !== parseInt(digits.charAt(0))) return false
    
    length = length + 1
    numbers = cnpj.substring(0, length)
    sum = 0
    pos = length - 7
    
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--
      if (pos < 2) pos = 9
    }
    
    result = sum % 11 < 2 ? 0 : 11 - sum % 11
    return result === parseInt(digits.charAt(1))
  }
  
  // Sanitizar entrada de texto
  static sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/[<>]/g, '') // Remove caracteres HTML básicos
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
  }
  
  // Validar força da senha
  static validatePasswordStrength(password: string): {
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0
    
    if (password.length >= 8) score += 1
    else feedback.push('Use pelo menos 8 caracteres')
    
    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Inclua pelo menos uma letra minúscula')
    
    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Inclua pelo menos uma letra maiúscula')
    
    if (/\d/.test(password)) score += 1
    else feedback.push('Inclua pelo menos um número')
    
    if (/[@$!%*?&]/.test(password)) score += 1
    else feedback.push('Inclua pelo menos um caractere especial (@$!%*?&)')
    
    return { score, feedback }
  }
  
  // Validar horário de trabalho
  static validateWorkHours(startTime: string, endTime: string): boolean {
    const start = new Date(`1970-01-01T${startTime}:00`)
    const end = new Date(`1970-01-01T${endTime}:00`)
    
    return start < end && (end.getTime() - start.getTime()) >= 3600000 // Mínimo 1 hora
  }
  
  // Validar se é dia útil
  static isWorkDay(date: Date, workDays: number[]): boolean {
    const dayOfWeek = date.getDay()
    return workDays.includes(dayOfWeek)
  }
}

// Middleware de validação para formulários
export function createFormValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): { success: boolean; data?: T; errors?: Record<string, string> } => {
    try {
      const validatedData = schema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.issues.forEach((err) => {
          const path = err.path.join('.')
          errors[path] = err.message
        })
        return { success: false, errors }
      }
      return { success: false, errors: { general: 'Erro de validação desconhecido' } }
    }
  }
}

// Validadores específicos para uso nos componentes
export const validateEmployee = createFormValidator(employeeSchema)
export const validateDepartment = createFormValidator(departmentSchema)
export const validateWorkSchedule = createFormValidator(workScheduleSchema)
export const validateTimeEntry = createFormValidator(timeEntrySchema)
export const validateLogin = createFormValidator(loginSchema)
export const validateChangePassword = createFormValidator(changePasswordSchema)