import { User } from '../types/auth';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department?: string;
  position?: string;
  isActive: boolean;
}

class UserService {
  // Mock data para desenvolvimento - em produção viria do banco de dados
  private users: UserSummary[] = [
    {
      id: 'user1',
      name: 'João Silva',
      email: 'joao.silva@medstaff.com.br',
      avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=3b82f6&color=fff',
      role: 'Analista Comercial',
      department: 'Comercial',
      position: 'Analista',
      isActive: true
    },
    {
      id: 'user2',
      name: 'Maria Santos',
      email: 'maria.santos@medstaff.com.br',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=10b981&color=fff',
      role: 'Gerente Comercial',
      department: 'Comercial',
      position: 'Gerente',
      isActive: true
    },
    {
      id: 'user3',
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@medstaff.com.br',
      avatar: 'https://ui-avatars.com/api/?name=Pedro+Oliveira&background=f59e0b&color=fff',
      role: 'Analista Comercial',
      department: 'Comercial',
      position: 'Analista',
      isActive: true
    },
    {
      id: 'user4',
      name: 'Ana Costa',
      email: 'ana.costa@medstaff.com.br',
      avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=ef4444&color=fff',
      role: 'Coordenadora Comercial',
      department: 'Comercial',
      position: 'Coordenadora',
      isActive: true
    },
    {
      id: 'admin',
      name: 'Super Administrador',
      email: 'admin@medstaff.com.br',
      avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=6366f1&color=fff',
      role: 'Super Admin',
      department: 'TI',
      position: 'Administrador',
      isActive: true
    }
  ];

  /**
   * Busca todos os usuários ativos
   */
  async getActiveUsers(): Promise<UserSummary[]> {
    return this.users.filter(user => user.isActive);
  }

  /**
   * Busca usuários por departamento
   */
  async getUsersByDepartment(department: string): Promise<UserSummary[]> {
    return this.users.filter(user => 
      user.isActive && 
      user.department?.toLowerCase() === department.toLowerCase()
    );
  }

  /**
   * Busca usuários comerciais (para atribuição de leads)
   */
  async getCommercialUsers(): Promise<UserSummary[]> {
    return this.getUsersByDepartment('Comercial');
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(userId: string): Promise<UserSummary | null> {
    return this.users.find(user => user.id === userId) || null;
  }

  /**
   * Busca usuários por role/cargo
   */
  async getUsersByRole(role: string): Promise<UserSummary[]> {
    return this.users.filter(user => 
      user.isActive && 
      user.role.toLowerCase().includes(role.toLowerCase())
    );
  }

  /**
   * Busca usuários disponíveis para atribuição de tarefas
   * (exclui o usuário atual se fornecido)
   */
  async getAvailableUsersForAssignment(excludeUserId?: string): Promise<UserSummary[]> {
    return this.users.filter(user => 
      user.isActive && 
      user.id !== excludeUserId
    );
  }

  /**
   * Verifica se um usuário existe e está ativo
   */
  async isUserActive(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user?.isActive || false;
  }

  /**
   * Busca usuários por nome (para autocomplete)
   */
  async searchUsersByName(query: string): Promise<UserSummary[]> {
    const searchTerm = query.toLowerCase();
    return this.users.filter(user => 
      user.isActive && 
      (user.name.toLowerCase().includes(searchTerm) ||
       user.email.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Obtém estatísticas de usuários por departamento
   */
  async getUserStatsByDepartment(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    
    this.users
      .filter(user => user.isActive)
      .forEach(user => {
        const dept = user.department || 'Sem Departamento';
        stats[dept] = (stats[dept] || 0) + 1;
      });
    
    return stats;
  }
}

export const userService = new UserService();
export default userService;