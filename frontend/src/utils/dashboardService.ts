import { taskService } from './taskService'
import projectService from './projectService'
import { ActivityItem } from '../components/Dashboard/RecentActivity'
import { TaskStats } from '../types/task'
import { Project, ProjectStatus } from '../types/project'
import db from '../config/database'

export interface DashboardStats {
  totalClients: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  monthlyRevenue: number
  activeProjects: number
  teamMembers: number
  overdueTasks: number
}

export interface DashboardData {
  stats: DashboardStats
  recentActivities: ActivityItem[]
  taskStats: TaskStats
  projectStats: {
    total: number
    active: number
    completed: number
    onHold: number
  }
}

class DashboardService {
  // Buscar estatísticas reais do banco
  private async getRealStats(): Promise<DashboardStats> {
    try {
      // Contar clientes
      let totalClients = 0
      
      // Contar leads
      try {
        const leadsResult = await db.query('SELECT COUNT(*) as count FROM leads')
        totalClients += parseInt(leadsResult.rows[0]?.count || '0')
      } catch (error) {
        console.warn('Erro ao contar leads:', error)
      }
      
      // Contar clientes PF
      try {
        const clientesPFResult = await db.query('SELECT COUNT(*) as count FROM clientes_pf')
        totalClients += parseInt(clientesPFResult.rows[0]?.count || '0')
      } catch (error) {
        console.warn('Erro ao contar clientes PF:', error)
      }
      
      // Contar clientes PJ
      try {
        const clientesPJResult = await db.query('SELECT COUNT(*) as count FROM clientes_pj')
        totalClients += parseInt(clientesPJResult.rows[0]?.count || '0')
      } catch (error) {
        console.warn('Erro ao contar clientes PJ:', error)
      }

      // Buscar estatísticas de tarefas
      const taskStats = await taskService.getTaskStats()
      
      // Contar projetos ativos
      let activeProjects = 0
      try {
        const projectsResult = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'active'")
        activeProjects = parseInt(projectsResult.rows[0]?.count || '0')
      } catch (error) {
        console.warn('Erro ao contar projetos:', error)
      }

      // Contar membros da equipe
      let teamMembers = 0
      try {
        const teamResult = await db.query("SELECT COUNT(*) as count FROM employees WHERE status = 'ativo'")
        teamMembers = parseInt(teamResult.rows[0]?.count || '0')
      } catch (error) {
        console.warn('Erro ao contar membros da equipe:', error)
      }

      // Calcular receita mensal (mock por enquanto)
      const monthlyRevenue = 150000

      return {
         totalClients,
         totalTasks: taskStats.total,
         completedTasks: taskStats.byStatus.done || 0,
         pendingTasks: (taskStats.byStatus.todo || 0) + (taskStats.byStatus.in_progress || 0),
         monthlyRevenue,
         activeProjects,
         teamMembers,
         overdueTasks: taskStats.overdue
       }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      // Retornar dados mock em caso de erro
      return this.getMockStats()
    }
  }

  private getMockStats(): DashboardStats {
    return {
      totalClients: 245,
      totalTasks: 89,
      completedTasks: 67,
      pendingTasks: 22,
      monthlyRevenue: 150000,
      activeProjects: 12,
      teamMembers: 8,
      overdueTasks: 5
    }
  }

  private mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'task_completed',
      title: 'Análise de cliente PJ',
      description: 'completou a tarefa',
      user: { name: 'João Silva' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      metadata: { taskId: '1' }
    },
    {
      id: '2',
      type: 'task_created',
      title: 'Novo lead captado',
      description: 'criou um novo lead',
      user: { name: 'Maria Santos' },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      metadata: { taskId: '2' }
    },
    {
      id: '3',
      type: 'document_uploaded',
      title: 'Contrato assinado',
      description: 'fez upload de um documento',
      user: { name: 'Pedro Costa' },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      metadata: { documentName: 'contrato-cliente-xyz.pdf' }
    },
    {
      id: '4',
      type: 'status_changed',
      title: 'Projeto MedStaff Platform',
      description: 'alterou o status do projeto',
      user: { name: 'Ana Oliveira' },
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      metadata: { projectId: '1', oldStatus: 'planning', newStatus: 'active' }
    },
    {
      id: '5',
      type: 'comment_added',
      title: 'Implementar autenticação',
      description: 'comentou na tarefa',
      user: { name: 'Carlos Silva' },
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      metadata: { taskId: '1' }
    }
  ]

  async getDashboardData(): Promise<DashboardData> {
    try {
      const [stats, taskStats] = await Promise.all([
        this.getRealStats(),
        taskService.getTaskStats()
      ])

      // Buscar estatísticas de projetos
      let projectStats = {
        total: 0,
        active: 0,
        completed: 0,
        onHold: 0
      }

      try {
        const projectStatsResult = await db.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
            COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold
          FROM projects
        `)
        
        if (projectStatsResult.rows[0]) {
          const row = projectStatsResult.rows[0]
          projectStats = {
            total: parseInt(row.total || '0'),
            active: parseInt(row.active || '0'),
            completed: parseInt(row.completed || '0'),
            onHold: parseInt(row.on_hold || '0')
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar estatísticas de projetos:', error)
      }

      return {
        stats,
        recentActivities: this.mockActivities.slice(0, 10),
        taskStats,
        projectStats
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      
      // Retornar dados mock em caso de erro
      return {
        stats: this.getMockStats(),
        recentActivities: this.mockActivities.slice(0, 10),
        taskStats: {
           total: 89,
           byStatus: {
             todo: 22,
             in_progress: 15,
             in_review: 5,
             done: 67,
             cancelled: 0
           },
           byPriority: {
             low: 20,
             medium: 35,
             high: 25,
             urgent: 9
           },
           overdue: 5,
           dueToday: 3,
           dueThisWeek: 8
         },
        projectStats: {
          total: 12,
          active: 8,
          completed: 3,
          onHold: 1
        }
      }
    }
  }

  async getRecentActivities(limit: number = 10): Promise<ActivityItem[]> {
    try {
      // Por enquanto retornamos atividades mock
      // No futuro, isso pode ser implementado com um sistema de auditoria
      return this.mockActivities.slice(0, limit)
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error)
      return this.mockActivities.slice(0, limit)
    }
  }

  async getStatsWithTrends(): Promise<DashboardStats & { trends: Record<string, { value: number; isPositive: boolean }> }> {
    try {
      const stats = await this.getRealStats()
      
      // Mock de tendências - no futuro implementar com dados históricos
      const trends = {
        totalClients: { value: 12, isPositive: true },
        totalTasks: { value: 8, isPositive: true },
        completedTasks: { value: 15, isPositive: true },
        monthlyRevenue: { value: 5.2, isPositive: true },
        activeProjects: { value: 2, isPositive: false },
        overdueTasks: { value: 3, isPositive: false }
      }

      return { ...stats, trends }
    } catch (error) {
      console.error('Erro ao buscar estatísticas com tendências:', error)
      const mockStats = this.getMockStats()
      const trends = {
        totalClients: { value: 12, isPositive: true },
        totalTasks: { value: 8, isPositive: true },
        completedTasks: { value: 15, isPositive: true },
        monthlyRevenue: { value: 5.2, isPositive: true },
        activeProjects: { value: 2, isPositive: false },
        overdueTasks: { value: 3, isPositive: false }
      }
      return { ...mockStats, trends }
    }
  }

  async getRealtimeUpdates(): Promise<Partial<DashboardStats>> {
    try {
      // Buscar apenas estatísticas que mudam frequentemente
      const taskStats = await taskService.getTaskStats()
      
      return {
         totalTasks: taskStats.total,
         completedTasks: taskStats.byStatus.done || 0,
         pendingTasks: (taskStats.byStatus.todo || 0) + (taskStats.byStatus.in_progress || 0),
         overdueTasks: taskStats.overdue
       }
    } catch (error) {
      console.error('Erro ao buscar atualizações em tempo real:', error)
      return {}
    }
  }
}

export const dashboardService = new DashboardService()
export default dashboardService