import { supabase } from '../config/supabase'
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
  // Gerenciamento de Permissões
  async getAllPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  async createPermission(permission: Omit<Permission, 'id' | 'created_at' | 'updated_at'>): Promise<Permission> {
    const { data, error } = await supabase
      .from('permissions')
      .insert(permission)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updatePermission(id: string, updates: Partial<Permission>): Promise<Permission> {
    const { data, error } = await supabase
      .from('permissions')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deletePermission(id: string): Promise<void> {
    const { error } = await supabase
      .from('permissions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Gerenciamento de Roles
  async getAllRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions (
          permission:permissions (*)
        )
      `)
      .order('level', { ascending: true })

    if (error) throw error
    
    return data?.map(role => ({
      ...role,
      permissions: role.role_permissions?.map((rp: any) => rp.permission) || []
    })) || []
  }

  async createRole(role: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .insert({
        name: role.name,
        description: role.description,
        level: role.level,
        is_system_role: role.is_system_role
      })
      .select()
      .single()

    if (error) throw error

    // Associar permissões ao role
    if (role.permissions.length > 0) {
      await this.updateRolePermissions(data.id, role.permissions.map(p => p.id))
    }

    return { ...data, permissions: role.permissions }
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .update({
        name: updates.name,
        description: updates.description,
        level: updates.level,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Atualizar permissões se fornecidas
    if (updates.permissions) {
      await this.updateRolePermissions(id, updates.permissions.map(p => p.id))
    }

    // Buscar role atualizado com permissões
    return this.getRoleById(id)
  }

  async deleteRole(id: string): Promise<void> {
    // Verificar se o role não está sendo usado
    const { data: users } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role_id', id)
      .limit(1)

    if (users && users.length > 0) {
      throw new Error('Não é possível excluir um role que está sendo usado por usuários')
    }

    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async getRoleById(id: string): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions (
          permission:permissions (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      ...data,
      permissions: data.role_permissions?.map((rp: any) => rp.permission) || []
    }
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    // Remover permissões existentes
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)

    // Adicionar novas permissões
    if (permissionIds.length > 0) {
      const { error } = await supabase
        .from('role_permissions')
        .insert(
          permissionIds.map(permissionId => ({
            role_id: roleId,
            permission_id: permissionId
          }))
        )

      if (error) throw error
    }
  }

  // Gerenciamento de Permissões de Usuário
  async getUserPermissions(userId: string): Promise<UserPermissions> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        role:roles (
          *,
          role_permissions (
            permission:permissions (*)
          )
        ),
        user_additional_permissions (
          permission:permissions (*)
        ),
        user_restricted_permissions (
          permission:permissions (*)
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error) throw error

    const role = {
      ...data.role,
      permissions: data.role.role_permissions?.map((rp: any) => rp.permission) || []
    }

    const additionalPermissions = data.user_additional_permissions?.map((uap: any) => uap.permission) || []
    const restrictedPermissions = data.user_restricted_permissions?.map((urp: any) => urp.permission) || []

    // Calcular permissões efetivas
    const effectivePermissions = this.calculateEffectivePermissions(
      role.permissions,
      additionalPermissions,
      restrictedPermissions
    )

    return {
      user_id: userId,
      role,
      additional_permissions: additionalPermissions,
      restricted_permissions: restrictedPermissions,
      effective_permissions: effectivePermissions,
      last_updated: data.updated_at
    }
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role_id: roleId,
        updated_at: new Date()
      })

    if (error) throw error
  }

  async addUserPermission(userId: string, permissionId: string): Promise<void> {
    const { error } = await supabase
      .from('user_additional_permissions')
      .insert({
        user_id: userId,
        permission_id: permissionId
      })

    if (error) throw error
  }

  async removeUserPermission(userId: string, permissionId: string): Promise<void> {
    const { error } = await supabase
      .from('user_additional_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission_id', permissionId)

    if (error) throw error
  }

  async restrictUserPermission(userId: string, permissionId: string): Promise<void> {
    const { error } = await supabase
      .from('user_restricted_permissions')
      .insert({
        user_id: userId,
        permission_id: permissionId
      })

    if (error) throw error
  }

  async unrestrictUserPermission(userId: string, permissionId: string): Promise<void> {
    const { error } = await supabase
      .from('user_restricted_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission_id', permissionId)

    if (error) throw error
  }

  // Verificação de Permissões
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId)
    return userPermissions.effective_permissions.some(p => 
      `${p.resource}.${p.action}` === permission
    )
  }

  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId)
    const userPermissionStrings = userPermissions.effective_permissions.map(p => 
      `${p.resource}.${p.action}`
    )
    
    return permissions.some(permission => userPermissionStrings.includes(permission))
  }

  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId)
    const userPermissionStrings = userPermissions.effective_permissions.map(p => 
      `${p.resource}.${p.action}`
    )
    
    return permissions.every(permission => userPermissionStrings.includes(permission))
  }

  // Templates de Permissão
  async getPermissionTemplates(): Promise<PermissionTemplate[]> {
    const { data, error } = await supabase
      .from('permission_templates')
      .select('*')
      .order('role_level', { ascending: true })

    if (error) throw error
    return data || []
  }

  async applyTemplate(userId: string, templateId: string): Promise<void> {
    const { data: template, error } = await supabase
      .from('permission_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error) throw error

    // Encontrar ou criar role baseado no template
    let { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('name', template.name)
      .single()

    if (!role) {
      const { data: newRole } = await supabase
        .from('roles')
        .insert({
          name: template.name,
          description: template.description,
          level: template.role_level,
          is_system_role: false
        })
        .select()
        .single()

      if (!newRole) throw new Error('Falha ao criar role')
      role = newRole
      
      // Associar permissões do template ao role
      await this.updateRolePermissions(role.id, template.permissions)
    }

    // Atribuir role ao usuário
    await this.assignRoleToUser(userId, role.id)
  }

  // Auditoria de Permissões
  async logPermissionChange(
    userId: string,
    action: 'grant' | 'revoke' | 'modify',
    permissionId: string,
    reason: string,
    approvedBy?: string,
    previousValue?: any,
    newValue?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('permission_audit_logs')
      .insert({
        user_id: userId,
        action,
        permission_id: permissionId,
        previous_value: previousValue,
        new_value: newValue,
        reason,
        approved_by: approvedBy,
        timestamp: new Date()
      })

    if (error) throw error
  }

  async getPermissionAuditLogs(userId?: string, limit = 100): Promise<PermissionAuditLog[]> {
    let query = supabase
      .from('permission_audit_logs')
      .select(`
        *,
        permission:permissions (name),
        user:users (name),
        approver:users!approved_by (name)
      `)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Utilitários
  private calculateEffectivePermissions(
    rolePermissions: Permission[],
    additionalPermissions: Permission[],
    restrictedPermissions: Permission[]
  ): Permission[] {
    const restrictedIds = new Set(restrictedPermissions.map(p => p.id))
    
    // Combinar permissões do role e adicionais
    const allPermissions = [...rolePermissions, ...additionalPermissions]
    
    // Remover duplicatas e permissões restritas
    const uniquePermissions = allPermissions.filter((permission, index, self) => 
      !restrictedIds.has(permission.id) &&
      self.findIndex(p => p.id === permission.id) === index
    )

    return uniquePermissions
  }

  // Inicialização do Sistema
  async initializeSystemPermissions(): Promise<void> {
    // Verificar se as permissões do sistema já existem
    const { data: existingPermissions } = await supabase
      .from('permissions')
      .select('resource, action')

    const existingPermissionKeys = new Set(
      existingPermissions?.map(p => `${p.resource}.${p.action}`) || []
    )

    // Criar permissões que não existem
    const permissionsToCreate = Object.entries(SYSTEM_PERMISSIONS)
      .filter(([_, value]) => !existingPermissionKeys.has(value))
      .map(([key, value]) => {
        const [resource, action] = value.split('.')
        return {
          name: key.replace(/_/g, ' ').toLowerCase(),
          description: `Permissão para ${action} em ${resource}`,
          category: this.getCategoryFromResource(resource),
          resource,
          action
        }
      })

    if (permissionsToCreate.length > 0) {
      const { error } = await supabase
        .from('permissions')
        .insert(permissionsToCreate)

      if (error) throw error
    }

    // Criar roles padrão se não existirem
    await this.createDefaultRoles()
  }

  private async createDefaultRoles(): Promise<void> {
    for (const [level, template] of Object.entries(ROLE_TEMPLATES)) {
      const { data: existingRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', template.name)
        .single()

      if (!existingRole) {
        // Buscar IDs das permissões
        const { data: permissions } = await supabase
          .from('permissions')
          .select('id, resource, action')
          .in('resource', template.permissions.map(p => p.split('.')[0]))

        const permissionIds = template.permissions
          .map(perm => {
            const [resource, action] = perm.split('.')
            return permissions?.find(p => p.resource === resource && p.action === action)?.id
          })
          .filter(Boolean) as string[]

        const { data: newRole } = await supabase
          .from('roles')
          .insert({
            name: template.name,
            description: `Role padrão: ${template.name}`,
            level: level.toLowerCase(),
            is_system_role: true
          })
          .select()
          .single()

        if (newRole && permissionIds.length > 0) {
          await this.updateRolePermissions(newRole.id, permissionIds)
        }
      }
    }
  }

  private getCategoryFromResource(resource: string): string {
    const categoryMap: Record<string, string> = {
      financial: 'financial',
      hr: 'hr',
      admin: 'administrative',
      security: 'security',
      reports: 'reports',
      system: 'system'
    }

    return categoryMap[resource] || 'system'
  }
}

export const permissionService = new PermissionService()