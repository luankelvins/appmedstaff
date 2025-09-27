export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  document?: string // CPF
  birthDate?: string
  address?: UserAddress
  role: string
  department: string
  position: string
  hireDate: string
  manager?: string
  permissions: string[]
  preferences: UserPreferences
  security: SecuritySettings
  createdAt: string
  updatedAt: string
}

export interface UserAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'pt-BR' | 'en-US'
  timezone: string
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'
  notifications: NotificationPreferences
  dashboard: DashboardPreferences
  privacy: PrivacySettings
}

export interface NotificationPreferences {
  email: {
    enabled: boolean
    frequency: 'immediate' | 'daily' | 'weekly'
    types: {
      tasks: boolean
      mentions: boolean
      updates: boolean
      security: boolean
      marketing: boolean
    }
  }
  push: {
    enabled: boolean
    types: {
      tasks: boolean
      mentions: boolean
      chat: boolean
      updates: boolean
    }
  }
  inApp: {
    enabled: boolean
    sound: boolean
    desktop: boolean
    types: {
      tasks: boolean
      mentions: boolean
      chat: boolean
      updates: boolean
      system: boolean
    }
  }
}

export interface DashboardPreferences {
  layout: 'grid' | 'list'
  widgets: {
    id: string
    enabled: boolean
    position: number
    size: 'small' | 'medium' | 'large'
  }[]
  defaultView: 'dashboard' | 'tasks' | 'feed'
  autoRefresh: boolean
  refreshInterval: number // em segundos
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private'
  showEmail: boolean
  showPhone: boolean
  showBirthDate: boolean
  showAddress: boolean
  allowDirectMessages: boolean
  allowMentions: boolean
  shareActivityStatus: boolean
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  lastPasswordChange: string
  sessionTimeout: number // em minutos
  allowedIPs?: string[]
  loginNotifications: boolean
  deviceTrust: {
    enabled: boolean
    trustedDevices: TrustedDevice[]
  }
}

export interface TrustedDevice {
  id: string
  name: string
  type: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  lastUsed: string
  trusted: boolean
}

export interface ProfileUpdateRequest {
  name?: string
  email?: string
  phone?: string
  birthDate?: string
  avatar?: string
  address?: Partial<UserAddress>
  preferences?: Partial<UserPreferences>
  security?: Partial<SecuritySettings>
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AvatarUploadResponse {
  url: string
  thumbnailUrl?: string
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  description: string
  ip: string
  userAgent: string
  location?: string
  timestamp: string
}

export interface ProfileStats {
  loginCount: number
  lastLogin: string
  accountAge: number // em dias
  tasksCompleted: number
  messagesExchanged: number
  documentsUploaded: number
}

// Tipos para formulários
export interface ProfileFormData {
  personalInfo: {
    name: string
    email: string
    phone: string
    birthDate: string
  }
  address: UserAddress
  workInfo: {
    position: string
    department: string
    hireDate: string
  }
}

export interface PreferencesFormData {
  appearance: {
    theme: 'light' | 'dark' | 'system'
    language: 'pt-BR' | 'en-US'
  }
  regional: {
    timezone: string
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
    timeFormat: '12h' | '24h'
  }
  notifications: NotificationPreferences
  privacy: PrivacySettings
}

export interface SecurityFormData {
  password: {
    current: string
    new: string
    confirm: string
  }
  twoFactor: {
    enabled: boolean
    method: 'sms' | 'email' | 'app'
  }
  session: {
    timeout: number
    loginNotifications: boolean
  }
}