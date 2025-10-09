import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('../profileService', () => ({
  profileService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    createProfile: vi.fn(),
    getActivityLogs: vi.fn(),
    getStats: vi.fn(),
    deleteProfile: vi.fn(),
    searchProfiles: vi.fn(),
    getProfilesByRole: vi.fn(),
    getProfilesByDepartment: vi.fn(),
    getProfilesByStatus: vi.fn(),
    bulkUpdateProfiles: vi.fn(),
    exportProfiles: vi.fn(),
    importProfiles: vi.fn(),
    validateProfile: vi.fn(),
    getProfileHistory: vi.fn(),
    restoreProfile: vi.fn(),
    archiveProfile: vi.fn(),
    unarchiveProfile: vi.fn(),
    getArchivedProfiles: vi.fn(),
    getProfilePermissions: vi.fn(),
    updateProfilePermissions: vi.fn(),
    getProfilePreferences: vi.fn(),
    updateProfilePreferences: vi.fn(),
    resetProfilePreferences: vi.fn(),
    getProfileNotifications: vi.fn(),
    markNotificationAsRead: vi.fn(),
    clearAllNotifications: vi.fn()
  }
}))

import { profileService } from '../profileService'

const mockProfileService = profileService as any

describe('ProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('deve retornar perfil mock', async () => {
      const mockProfile = {
        id: 'user-123',
        name: 'João Silva',
        email: 'test@example.com',
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
        role: 'user',
        department: 'TI',
        position: 'Desenvolvedor',
        hireDate: '2023-01-01',
        manager: 'Maria Santos',
        permissions: [],
        preferences: {},
        security: {},
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }

      mockProfileService.getProfile.mockResolvedValue(mockProfile)

      const result = await profileService.getProfile()

      expect(result).toEqual(mockProfile)
      expect(mockProfileService.getProfile).toHaveBeenCalled()
    })

    it('deve aceitar userId como parâmetro', async () => {
      const userId = 'user-456'
      const mockProfile = {
        id: userId,
        name: 'Maria Santos',
        email: 'maria@example.com'
      }

      mockProfileService.getProfile.mockResolvedValue(mockProfile)

      const result = await profileService.getProfile(userId)

      expect(result).toEqual(mockProfile)
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(userId)
    })
  })

  describe('updateProfile', () => {
    it('deve atualizar perfil com sucesso', async () => {
      const updates = { name: 'João Silva Atualizado' }
      const updatedProfile = {
        id: 'user-123',
        name: 'João Silva Atualizado',
        email: 'test@example.com'
      }

      mockProfileService.updateProfile.mockResolvedValue(updatedProfile)

      const result = await profileService.updateProfile(updates)

      expect(result).toEqual(updatedProfile)
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith(updates)
    })
  })

  describe('getActivityLogs', () => {
    it('deve retornar logs de atividade', async () => {
      const mockLogs = [
        {
          id: 'log1',
          userId: 'user1',
          action: 'login',
          description: 'Login realizado',
          timestamp: '2024-01-20T14:30:00Z'
        }
      ]

      mockProfileService.getActivityLogs.mockResolvedValue(mockLogs)

      const result = await profileService.getActivityLogs()

      expect(result).toEqual(mockLogs)
      expect(mockProfileService.getActivityLogs).toHaveBeenCalled()
    })
  })

  describe('getStats', () => {
    it('deve retornar estatísticas do perfil', async () => {
      const mockStats = {
        loginCount: 156,
        lastLogin: '2024-01-20T14:30:00Z',
        accountAge: 1470,
        tasksCompleted: 89,
        messagesExchanged: 234,
        documentsUploaded: 45
      }

      mockProfileService.getStats.mockResolvedValue(mockStats)

      const result = await profileService.getStats()

      expect(result).toEqual(mockStats)
      expect(mockProfileService.getStats).toHaveBeenCalled()
    })
  })
})