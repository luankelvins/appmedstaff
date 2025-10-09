import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../UI/Card'
import { Button } from '../UI/Button'
import { Input } from '../UI/Input'
import { Badge } from '../UI/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../UI/Tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../UI/Dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../UI/Select'
import { Checkbox } from '../UI/Checkbox'
import { 
  Users, 
  Shield, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react'
import { 
  Permission, 
  Role, 
  UserPermissions,
  PermissionCategory,
  RoleLevel,
  SYSTEM_PERMISSIONS,
  ROLE_TEMPLATES
} from '../../types/permissions'
import { permissionService } from '../../utils/permissionService'
import { useEnhancedAuditLogger } from '../../hooks/useEnhancedAuditLogger'

interface PermissionManagementProps {
  currentUserId: string
}

export function PermissionManagement({ currentUserId }: PermissionManagementProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<PermissionCategory | 'all'>('all')
  const [activeTab, setActiveTab] = useState('users')
  
  const { logSecurityAction, logAdministrativeAction } = useEnhancedAuditLogger()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [permissionsData, rolesData, usersData] = await Promise.all([
        permissionService.getAllPermissions(),
        permissionService.getAllRoles(),
        // Assumindo que existe um serviço para buscar usuários
        fetch('/api/users').then(res => res.json()).catch(() => [])
      ])
      
      setPermissions(permissionsData)
      setRoles(rolesData)
      setUsers(usersData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserPermissions = async (userId: string) => {
    if (!userId) return
    
    try {
      const userPerms = await permissionService.getUserPermissions(userId)
      setUserPermissions(userPerms)
    } catch (error) {
      console.error('Erro ao carregar permissões do usuário:', error)
    }
  }

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId)
    loadUserPermissions(userId)
  }

  const handleRoleAssignment = async (userId: string, roleId: string) => {
    try {
      await permissionService.assignRoleToUser(userId, roleId)
      await loadUserPermissions(userId)
      
      await logSecurityAction('role_assignment', 'user', {
        target_user_id: userId,
        role_id: roleId
      })
      
      // Mostrar notificação de sucesso
    } catch (error) {
      console.error('Erro ao atribuir role:', error)
    }
  }

  const handlePermissionToggle = async (userId: string, permissionId: string, grant: boolean) => {
    try {
      if (grant) {
        await permissionService.addUserPermission(userId, permissionId)
      } else {
        await permissionService.removeUserPermission(userId, permissionId)
      }
      
      await loadUserPermissions(userId)
      
      await logSecurityAction(
        grant ? 'permission_granted' : 'permission_revoked', 
        'permission', 
        {
          target_user_id: userId,
          permission_id: permissionId
        }
      )
    } catch (error) {
      console.error('Erro ao alterar permissão:', error)
    }
  }

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || permission.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: PermissionCategory) => {
    const colors = {
      financial: 'bg-green-100 text-green-800',
      hr: 'bg-blue-100 text-blue-800',
      administrative: 'bg-purple-100 text-purple-800',
      security: 'bg-red-100 text-red-800',
      compliance: 'bg-orange-100 text-orange-800',
      system: 'bg-gray-100 text-gray-800',
      reports: 'bg-yellow-100 text-yellow-800',
      contacts: 'bg-pink-100 text-pink-800',
      activities: 'bg-indigo-100 text-indigo-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getRoleLevelColor = (level: RoleLevel) => {
    const colors = {
      user: 'bg-gray-100 text-gray-800',
      supervisor: 'bg-blue-100 text-blue-800',
      manager: 'bg-green-100 text-green-800',
      admin: 'bg-orange-100 text-orange-800',
      superadmin: 'bg-red-100 text-red-800'
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Permissões</h1>
          <p className="text-gray-600">
            Gerencie roles, permissões e acesso de usuários de forma granular
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <Settings className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        {/* Aba de Usuários */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lista de Usuários */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedUser === user.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleUserSelect(user.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {user.role && (
                              <Badge className={getRoleLevelColor(user.role.level)}>
                                {user.role.name}
                              </Badge>
                            )}
                            <UserCheck className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detalhes do Usuário Selecionado */}
                <div className="space-y-4">
                  {selectedUser && userPermissions ? (
                    <>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Atribuição de Role</h3>
                        <Select
                          value={userPermissions.role.id}
                          onValueChange={(roleId) => handleRoleAssignment(selectedUser, roleId)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                <div className="flex items-center gap-2">
                                  <Badge className={getRoleLevelColor(role.level)}>
                                    {role.name}
                                  </Badge>
                                  <span>{role.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Permissões Efetivas</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {userPermissions.effective_permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div>
                                <p className="text-sm font-medium">{permission.name}</p>
                                <p className="text-xs text-gray-600">{permission.description}</p>
                              </div>
                              <Badge className={getCategoryColor(permission.category)}>
                                {permission.category}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Permissões Adicionais</h3>
                        <div className="space-y-2">
                          {filteredPermissions.map((permission) => {
                            const hasPermission = userPermissions.additional_permissions.some(
                              p => p.id === permission.id
                            )
                            const isRestricted = userPermissions.restricted_permissions.some(
                              p => p.id === permission.id
                            )
                            
                            return (
                              <div
                                key={permission.id}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={hasPermission}
                                    onCheckedChange={(checked) => 
                                      handlePermissionToggle(selectedUser, permission.id, !!checked)
                                    }
                                    disabled={isRestricted}
                                  />
                                  <div>
                                    <p className="text-sm font-medium">{permission.name}</p>
                                    <p className="text-xs text-gray-600">{permission.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={getCategoryColor(permission.category)}>
                                    {permission.category}
                                  </Badge>
                                  {isRestricted && (
                                    <Badge variant="destructive">
                                      <EyeOff className="w-3 h-3 mr-1" />
                                      Restrita
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Selecione um usuário para gerenciar suas permissões
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Roles */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gerenciamento de Roles</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Role</DialogTitle>
                    </DialogHeader>
                    <RoleForm onSave={loadData} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <Card key={role.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <Badge className={getRoleLevelColor(role.level)}>
                          {role.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Permissões ({role.permissions.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((permission) => (
                              <Badge
                                key={permission.id}
                                variant="outline"
                                className="text-xs"
                              >
                                {permission.name}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 3} mais
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          {!role.is_system_role && (
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Permissões */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Catálogo de Permissões</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterCategory} onValueChange={(value: any) => setFilterCategory(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      <SelectItem value="financial">Financeiro</SelectItem>
                      <SelectItem value="hr">RH</SelectItem>
                      <SelectItem value="administrative">Administrativo</SelectItem>
                      <SelectItem value="security">Segurança</SelectItem>
                      <SelectItem value="compliance">Conformidade</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="reports">Relatórios</SelectItem>
                      <SelectItem value="contacts">Contatos</SelectItem>
                      <SelectItem value="activities">Atividades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar permissões..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPermissions.map((permission) => (
                    <Card key={permission.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{permission.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {permission.description}
                              </p>
                            </div>
                            <Badge className={getCategoryColor(permission.category)}>
                              {permission.category}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{permission.resource}.{permission.action}</span>
                          </div>
                          
                          {permission.conditions && permission.conditions.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-700">Condições:</p>
                              {permission.conditions.map((condition, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {condition.type}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Auditoria */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Log de Auditoria de Permissões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Funcionalidade de auditoria em desenvolvimento</p>
                <p className="text-sm">
                  Aqui serão exibidos logs de alterações de permissões e roles
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componente auxiliar para formulário de role
function RoleForm({ onSave }: { onSave: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'user' as RoleLevel,
    permissions: [] as string[]
  })

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome do Role</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Analista Financeiro"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Descrição</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição do role e suas responsabilidades"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Nível</label>
        <Select value={formData.level} onValueChange={(value: RoleLevel) => setFormData({ ...formData, level: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Usuário</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="manager">Gerente</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancelar</Button>
        <Button onClick={onSave}>Criar Role</Button>
      </div>
    </div>
  )
}