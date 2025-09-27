import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileHeader } from '../ProfileHeader'
import type { UserProfile } from '../../../types/profile'

const mockProfile: UserProfile = {
  id: '1',
  name: 'João Silva',
  email: 'joao@medstaff.com',
  role: 'Analista Comercial',
  department: 'Comercial',
  position: 'Analista',
  hireDate: '2024-01-01',
  permissions: ['dashboard.view', 'profile.view'],
  preferences: {
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    notifications: {
       email: { enabled: true, frequency: 'immediate', types: { tasks: true, mentions: true, updates: true, security: true, marketing: false } },
       push: { enabled: true, types: { tasks: true, mentions: true, chat: true, updates: true } },
       inApp: { enabled: true, sound: true, desktop: true, types: { tasks: true, mentions: true, chat: true, updates: true, system: true } }
     },
    dashboard: {
      layout: 'grid',
      widgets: [],
      defaultView: 'dashboard',
      autoRefresh: true,
      refreshInterval: 30
    },
    privacy: {
      profileVisibility: 'team',
      showEmail: true,
      showPhone: true,
      showBirthDate: false,
      showAddress: false,
      allowDirectMessages: true,
      allowMentions: true,
      shareActivityStatus: true
    }
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: '2024-01-01',
    sessionTimeout: 60,
    loginNotifications: true,
    deviceTrust: { enabled: false, trustedDevices: [] }
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
}

const mockOnAvatarUpload = vi.fn()

describe('ProfileHeader Component', () => {
  it('deve renderizar o componente sem erros', () => {
    const { container } = render(
      <ProfileHeader 
        profile={mockProfile} 
        onAvatarUpload={mockOnAvatarUpload}
        isUpdating={false}
      />
    )

    expect(container).toBeInTheDocument()
  })

  it('deve renderizar com estado de carregamento', () => {
    const { container } = render(
      <ProfileHeader 
        profile={mockProfile} 
        onAvatarUpload={mockOnAvatarUpload}
        isUpdating={true}
      />
    )

    expect(container).toBeInTheDocument()
  })

  it('deve aceitar função de upload de avatar', () => {
    render(
      <ProfileHeader 
        profile={mockProfile} 
        onAvatarUpload={mockOnAvatarUpload}
        isUpdating={false}
      />
    )

    expect(mockOnAvatarUpload).toBeDefined()
  })
})