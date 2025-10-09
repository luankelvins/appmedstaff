import { 
  Permission, 
  Role, 
  UserPermissions, 
  PermissionTemplate,
  PermissionAuditLog,
  SYSTEM_PERMISSIONS,
  ROLE_TEMPLATES
} from '../types/permissions'

export class PermissionService {
  // Mock implementation - todas as operações retornam dados simulados
  
  async getAllPermissions(): Promise<Permission[]> {
    return []
  }

  async createPermission(permission: Omit<Permission, 'id' | 'created_at' | 'updated_at'>): Promise<Permission> {
    return {
      ...permission,
      id: Math.random().toString(36),
      created_at: new Date(),
      updated_at: new Date()
    } as Permission
  }

  async updatePermission(id: string, updates: Partial<Permission>): Promise<Permission> {
    return {
      id,
      name: 'mock_permission',
      description: 'Mock permission',
      category: 'system' as any,
      resource: 'mock',
      action: 'read',
      created_at: new Date(),
      updated_at: new Date(),
      ...updates
    } as Permission
  }

  async deletePermission(id: string): Promise<void> {
    // Mock - não faz nada
  }

  async getAllRoles(): Promise<Role[]> {
    return []
  }

  async createRole(role: any): Promise<Role> {
    return {
      ...role,
      id: Math.random().toString(36),
      created_at: new Date(),
      updated_at: new Date()
    } as Role
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<Role> {
    return {
      id,
      name: 'mock_role',
      description: 'Mock role',
      created_at: new Date(),
      updated_at: new Date(),
      ...updates
    } as Role
  }

  async deleteRole(id: string): Promise<void> {
    // Mock - não faz nada
  }

  async getRoleById(id: string): Promise<Role> {
    return {
      id,
      name: 'mock_role',
      description: 'Mock role',
      created_at: new Date(),
      updated_at: new Date()
    } as Role
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    // Mock - não faz nada
  }

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    return {
      user_id: userId,
      role: {
        id: 'mock-role',
        name: 'Mock Role',
        description: 'Mock role for testing',
        level: 'user',
        permissions: [],
        is_system_role: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      additional_permissions: [],
      restricted_permissions: [],
      effective_permissions: [],
      last_updated: new Date()
    }
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    // Mock - não faz nada
  }

  async addUserPermission(userId: string, permissionId: string): Promise<void> {
    // Mock - não faz nada
  }

  async removeUserPermission(userId: string, permissionId: string): Promise<void> {
    // Mock - não faz nada
  }

  async restrictUserPermission(userId: string, permissionId: string): Promise<void> {
    // Mock - não faz nada
  }

  async unrestrictUserPermission(userId: string, permissionId: string): Promise<void> {
    // Mock - não faz nada
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    return true // Mock - sempre retorna true
  }

  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    return true // Mock - sempre retorna true
  }

  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    return true // Mock - sempre retorna true
  }

  async getPermissionTemplates(): Promise<PermissionTemplate[]> {
    return []
  }

  async applyTemplate(userId: string, templateId: string): Promise<void> {
    // Mock - não faz nada
  }

  async logPermissionChange(
    userId: string,
    action: 'grant' | 'revoke' | 'modify',
    permissionId: string,
    reason: string,
    approvedBy?: string,
    previousValue?: any,
    newValue?: any
  ): Promise<void> {
    // Mock - não faz nada
  }

  async getPermissionAuditLogs(userId?: string, limit = 100): Promise<PermissionAuditLog[]> {
    return []
  }

  private calculateEffectivePermissions(
    rolePermissions: Permission[],
    additionalPermissions: Permission[],
    restrictedPermissions: Permission[]
  ): Permission[] {
    return []
  }

  async initializeSystemPermissions(): Promise<void> {
    // Mock - não faz nada
  }

  private async createDefaultRoles(): Promise<void> {
    // Mock - não faz nada
  }

  private getCategoryFromResource(resource: string): string {
    return 'system'
  }
}

export const permissionService = new PermissionService()