import { useState, useEffect, useCallback } from 'react'
import { 
  UserProfile, 
  ProfileUpdateRequest, 
  PasswordChangeRequest,
  AvatarUploadResponse,
  ActivityLog,
  ProfileStats,
  TrustedDevice
} from '../types/profile'

// Mock data para demonstração
const mockProfile: UserProfile = {
  id: 'user1',
  name: 'João Silva',
  email: 'joao.silva@medstaff.com.br',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  phone: '+55 11 99999-9999',
  document: '123.456.789-00',
  birthDate: '1985-03-15',
  address: {
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    country: 'Brasil'
  },
  role: 'Gerente Comercial',
  department: 'Comercial',
  position: 'Gerente',
  hireDate: '2020-01-15',
  manager: 'Maria Santos',
  permissions: [
    'dashboard.view',
    'contacts.read',
    'contacts.create',
    'contacts.update',
    'activities.commercial.view',
    'activities.commercial.create',
    'chat.view',
    'chat.send',
    'notifications.view'
  ],
  preferences: {
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    notifications: {
      email: {
        enabled: true,
        frequency: 'immediate',
        types: {
          tasks: true,
          mentions: true,
          updates: true,
          security: true,
          marketing: false
        }
      },
      push: {
        enabled: true,
        types: {
          tasks: true,
          mentions: true,
          chat: true,
          updates: false
        }
      },
      inApp: {
        enabled: true,
        sound: true,
        desktop: true,
        types: {
          tasks: true,
          mentions: true,
          chat: true,
          updates: true,
          system: true
        }
      }
    },
    dashboard: {
      layout: 'grid',
      widgets: [
        { id: 'tasks', enabled: true, position: 1, size: 'medium' },
        { id: 'notifications', enabled: true, position: 2, size: 'small' },
        { id: 'calendar', enabled: true, position: 3, size: 'large' },
        { id: 'stats', enabled: false, position: 4, size: 'medium' }
      ],
      defaultView: 'dashboard',
      autoRefresh: true,
      refreshInterval: 300
    },
    privacy: {
      profileVisibility: 'team',
      showEmail: true,
      showPhone: false,
      showBirthDate: false,
      showAddress: false,
      allowDirectMessages: true,
      allowMentions: true,
      shareActivityStatus: true
    }
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: '2024-01-15T10:30:00Z',
    sessionTimeout: 480, // 8 horas
    loginNotifications: true,
    deviceTrust: {
      enabled: true,
      trustedDevices: [
        {
          id: 'device1',
          name: 'MacBook Pro',
          type: 'desktop',
          browser: 'Chrome',
          os: 'macOS',
          lastUsed: '2024-01-20T14:30:00Z',
          trusted: true
        },
        {
          id: 'device2',
          name: 'iPhone 15',
          type: 'mobile',
          browser: 'Safari',
          os: 'iOS',
          lastUsed: '2024-01-19T09:15:00Z',
          trusted: true
        }
      ]
    }
  },
  createdAt: '2020-01-15T08:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z'
}

const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log1',
    userId: 'user1',
    action: 'login',
    description: 'Login realizado com sucesso',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'São Paulo, SP',
    timestamp: '2024-01-20T14:30:00Z'
  },
  {
    id: 'log2',
    userId: 'user1',
    action: 'profile_update',
    description: 'Perfil atualizado',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'São Paulo, SP',
    timestamp: '2024-01-20T10:15:00Z'
  },
  {
    id: 'log3',
    userId: 'user1',
    action: 'password_change',
    description: 'Senha alterada',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'São Paulo, SP',
    timestamp: '2024-01-15T10:30:00Z'
  }
]

const mockStats: ProfileStats = {
  loginCount: 156,
  lastLogin: '2024-01-20T14:30:00Z',
  accountAge: 1470, // dias desde a criação
  tasksCompleted: 89,
  messagesExchanged: 234,
  documentsUploaded: 45
}

// Serviços de API
export const profileService = {
  async getProfile(): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { ...mockProfile }
  },

  async updateProfile(data: ProfileUpdateRequest): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const updatedProfile: UserProfile = {
      ...mockProfile,
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.phone && { phone: data.phone }),
      ...(data.birthDate && { birthDate: data.birthDate }),
      ...(data.avatar && { avatar: data.avatar }),
      address: data.address ? { ...mockProfile.address!, ...data.address } : mockProfile.address,
      preferences: data.preferences ? { ...mockProfile.preferences, ...data.preferences } : mockProfile.preferences,
      security: data.security ? { ...mockProfile.security, ...data.security } : mockProfile.security,
      updatedAt: new Date().toISOString()
    }

    // Simular atualização dos dados mock
    Object.assign(mockProfile, updatedProfile)
    
    return updatedProfile
  },

  async changePassword(data: PasswordChangeRequest): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Validações básicas
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('As senhas não coincidem')
    }
    
    if (data.newPassword.length < 8) {
      throw new Error('A senha deve ter pelo menos 8 caracteres')
    }

    // Simular verificação da senha atual
    if (data.currentPassword !== 'senha123') {
      throw new Error('Senha atual incorreta')
    }

    // Atualizar data da última mudança de senha
    mockProfile.security.lastPasswordChange = new Date().toISOString()
  },

  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simular upload
    const url = URL.createObjectURL(file)
    
    // Atualizar avatar no perfil mock
    mockProfile.avatar = url
    mockProfile.updatedAt = new Date().toISOString()
    
    return {
      url,
      thumbnailUrl: url
    }
  },

  async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...mockActivityLogs].slice(0, limit)
  },

  async getStats(): Promise<ProfileStats> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { ...mockStats }
  },

  async enableTwoFactor(method: 'sms' | 'email' | 'app'): Promise<{ qrCode?: string; backupCodes?: string[] }> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    mockProfile.security.twoFactorEnabled = true
    mockProfile.updatedAt = new Date().toISOString()
    
    if (method === 'app') {
      return {
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        backupCodes: ['123456', '789012', '345678', '901234', '567890']
      }
    }
    
    return {}
  },

  async disableTwoFactor(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    mockProfile.security.twoFactorEnabled = false
    mockProfile.updatedAt = new Date().toISOString()
  },

  async addTrustedDevice(device: Omit<TrustedDevice, 'id' | 'lastUsed' | 'trusted'>): Promise<TrustedDevice> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const newDevice: TrustedDevice = {
      ...device,
      id: Date.now().toString(),
      lastUsed: new Date().toISOString(),
      trusted: true
    }
    
    mockProfile.security.deviceTrust.trustedDevices.push(newDevice)
    mockProfile.updatedAt = new Date().toISOString()
    
    return newDevice
  },

  async removeTrustedDevice(deviceId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    mockProfile.security.deviceTrust.trustedDevices = 
      mockProfile.security.deviceTrust.trustedDevices.filter(d => d.id !== deviceId)
    mockProfile.updatedAt = new Date().toISOString()
  },

  async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    mockProfile.preferences = {
      ...mockProfile.preferences,
      ...preferences
    }
    mockProfile.updatedAt = new Date().toISOString()
    
    return { ...mockProfile }
  },

  async deleteAccount(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Em uma implementação real, isso faria a exclusão da conta
    throw new Error('Funcionalidade não implementada')
  },

  async exportActivity(): Promise<void> {
    // Simular exportação de atividade
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Criar e baixar arquivo CSV
    const csvContent = mockActivityLogs.map(log => 
      `${log.timestamp},${log.action},${log.description},${log.ip}`
    ).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `atividade-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
}

// Hook para gerenciar perfil
export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await profileService.getProfile()
      setProfile(data)
      
      const logs = await profileService.getActivityLogs()
      setActivityLogs(logs)
      
      const profileStats = await profileService.getStats()
      setStats(profileStats)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      setError('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: ProfileUpdateRequest) => {
    setUpdating(true)
    try {
      const updatedProfile = await profileService.updateProfile(data)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    } finally {
      setUpdating(false)
    }
  }, [])

  const changePassword = useCallback(async (data: PasswordChangeRequest) => {
    setUpdating(true)
    try {
      await profileService.changePassword(data)
      // Recarregar perfil para atualizar data da última mudança
      await loadProfile()
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      throw error
    } finally {
      setUpdating(false)
    }
  }, [loadProfile])

  const uploadAvatar = useCallback(async (file: File) => {
    setUpdating(true)
    try {
      const result = await profileService.uploadAvatar(file)
      await loadProfile() // Recarregar para atualizar avatar
      return result
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error)
      throw error
    } finally {
      setUpdating(false)
    }
  }, [loadProfile])

  const loadActivityLogs = useCallback(async (limit?: number) => {
    try {
      const logs = await profileService.getActivityLogs(limit)
      setActivityLogs(logs)
    } catch (error) {
      console.error('Erro ao carregar logs de atividade:', error)
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const data = await profileService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }, [])

  const updatePreferences = useCallback(async (preferences: Partial<UserProfile['preferences']>) => {
    setUpdating(true)
    try {
      const updatedProfile = await profileService.updatePreferences(preferences)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error)
      throw error
    } finally {
      setUpdating(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const exportActivity = async () => {
    try {
      await profileService.exportActivity()
    } catch (error) {
      console.error('Erro ao exportar atividade:', error)
      throw error
    }
  }

  return {
    profile,
    activityLogs,
    stats,
    loading,
    updating,
    error,
    updateProfile,
    changePassword,
    uploadAvatar,
    exportActivity,
    getActivityLogs: loadActivityLogs,
    getStats: loadStats,
    updatePreferences,
    enableTwoFactor: profileService.enableTwoFactor,
    disableTwoFactor: profileService.disableTwoFactor,
    addTrustedDevice: profileService.addTrustedDevice,
    removeTrustedDevice: profileService.removeTrustedDevice
  }
}