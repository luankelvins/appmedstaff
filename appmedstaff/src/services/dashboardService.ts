import { taskService } from './taskService'
import projectService from './projectService'
import { ActivityItem } from '../components/Dashboard/RecentActivity'
import { TaskStats } from '../types/task'
import { Project, ProjectStatus } from '../types/project'

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
  // Mock data para desenvolvimento
  private mockStats: DashboardStats = {
    totalClients: 1234,
    totalTasks: 89,
    completedTasks: 67,
    pendingTasks: 22,
    monthlyRevenue: 45200,
    activeProjects: 8,
    teamMembers: 15,
    overdueTasks: 5
  }

  private mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'task_completed',
      title: 'Análise de cliente PJ',
      description: 'completou a tarefa',
      user: { name: 'João Silva' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      metadata: { taskId: '1' }
    },
    {
      id: '2',
      type: 'task_created',
      title: 'Novo lead captado',
      description: 'criou um novo lead',
      user: { name: 'Maria Santos' },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
      metadata: { taskId: '2' }
    },
    {
      id: '3',
      type: 'document_uploaded',
      title: 'Contrato assinado',
      description: 'fez upload de um documento',
      user: { name: 'Pedro Costa' },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
      metadata: { documentName: 'contrato-cliente-xyz.pdf' }
    },
    {
      id: '4',
      type: 'status_changed',
      title: 'Projeto MedStaff Platform',
      description: 'alterou o status do projeto',
      user: { name: 'Ana Oliveira' },
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 horas atrás
      metadata: { projectId: '1', oldStatus: 'planning', newStatus: 'active' }
    },
    {
      id: '5',
      type: 'comment_added',
      title: 'Implementar autenticação',
      description: 'comentou na tarefa',
      user: { name: 'Carlos Silva' },
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
      metadata: { taskId: '1' }
    },
    {
      id: '6',
      type: 'milestone_reached',
      title: 'Meta mensal atingida',
      description: 'atingiu uma meta importante',
      user: { name: 'Equipe Comercial' },
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
    },
    {
      id: '7',
      type: 'user_joined',
      title: 'Novo membro da equipe',
      description: 'entrou na equipe',
      user: { name: 'Lucas Ferreira' },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    }
  ]

  async getDashboardData(): Promise<DashboardData> {
    console.log('📊 DashboardService - getDashboardData chamado (MOCK ESTÁTICO)')
    
    // Retorno imediato com dados mockados para debug
    return {
      stats: this.mockStats,
      recentActivities: this.mockActivities,
      taskStats: {
        total: 89,
        byStatus: {
          todo: 22,
          in_progress: 15,
          in_review: 5,
          done: 67,
          cancelled: 2
        },
        byPriority: {
          low: 20,
          medium: 45,
          high: 20,
          urgent: 4
        },
        overdue: 5,
        dueToday: 3,
        dueThisWeek: 12
      },
      projectStats: {
        total: 8,
        active: 5,
        completed: 2,
        onHold: 1
      }
    }
  }

  async getRecentActivities(limit: number = 10): Promise<ActivityItem[]> {
    // Em uma implementação real, isso buscaria de um log de auditoria
    return this.mockActivities.slice(0, limit)
  }

  async getStatsWithTrends(): Promise<DashboardStats & { trends: Record<string, { value: number; isPositive: boolean }> }> {
    const stats = await this.getDashboardData()
    
    // Mock trends - em uma implementação real, isso compararia com períodos anteriores
    const trends = {
      totalClients: { value: 12.5, isPositive: true },
      completedTasks: { value: 8.3, isPositive: true },
      monthlyRevenue: { value: 15.7, isPositive: true },
      activeProjects: { value: -2.1, isPositive: false }
    }

    return {
      ...stats.stats,
      trends
    }
  }

  // Método para simular dados em tempo real
  async getRealtimeUpdates(): Promise<Partial<DashboardStats>> {
    // Simula pequenas variações nos dados
    const randomVariation = () => Math.floor(Math.random() * 3) - 1 // -1, 0, ou 1
    
    return {
      pendingTasks: Math.max(0, this.mockStats.pendingTasks + randomVariation()),
      completedTasks: Math.max(0, this.mockStats.completedTasks + randomVariation())
    }
  }
}

export const dashboardService = new DashboardService()
export default dashboardService