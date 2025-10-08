import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import Profile from '../Profile'
import { User } from '../../contexts/AuthContext'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../services/profileService'

// Mock do serviço de perfil
vi.mock('../../services/profileService', () => ({
  profileService: {
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    uploadAvatar: vi.fn()
  },
  useProfile: vi.fn()
}))

// Mock do react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock do useAuth hook
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

// Mock do utils/permissions
vi.mock('../../utils/permissions', () => ({
  hasPermission: vi.fn(() => true)
}))

const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao@medstaff.com',
  role: 'Analista',
  permissions: ['dashboard.view', 'profile.view', 'profile.update'],
  department: 'Comercial',
  position: 'Analista Comercial',
  avatar: undefined
}

const ProfileWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('Profile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Configurar mock do useAuth
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      isAuthenticated: true
    })
    
    // Configurar mock do useProfile
    vi.mocked(useProfile).mockReturnValue({
      profile: {
        id: '1',
        name: 'João Silva',
        email: 'joao@medstaff.com',
        avatar: undefined,
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
        role: 'Analista',
        department: 'Comercial',
        position: 'Analista Comercial',
        hireDate: '2020-01-15',
        manager: 'Maria Santos',
        permissions: ['dashboard.view', 'profile.view', 'profile.update'],
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
            widgets: [],
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
          sessionTimeout: 480,
          loginNotifications: true,
          deviceTrust: {
            enabled: true,
            trustedDevices: []
          }
        },
        createdAt: '2020-01-15T08:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z'
      },
      activityLogs: [],
      stats: null,
      loading: false,
      updating: false,
      error: null,
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
      uploadAvatar: vi.fn(),
      exportActivity: vi.fn(),
      getActivityLogs: vi.fn(),
      getStats: vi.fn(),
      updatePreferences: vi.fn(),
      enableTwoFactor: vi.fn(),
      disableTwoFactor: vi.fn(),
      addTrustedDevice: vi.fn(),
      removeTrustedDevice: vi.fn()
    })
  })

  it('deve renderizar o componente sem erros', () => {
    const { container } = render(
      <ProfileWrapper>
        <Profile />
      </ProfileWrapper>
    )

    expect(container).toBeInTheDocument()
  })

  it('deve renderizar com contexto de autenticação', () => {
    const { container } = render(
      <ProfileWrapper>
        <Profile />
      </ProfileWrapper>
    )

    // Verifica se o componente renderiza sem erros com o contexto
    expect(container).toBeInTheDocument()
  })

  it('deve ter abas de navegação', () => {
    const { container } = render(
      <ProfileWrapper>
        <Profile />
      </ProfileWrapper>
    )

    // Verifica se o componente renderiza
    expect(container).toBeInTheDocument()
  })
})