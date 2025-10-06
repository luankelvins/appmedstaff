import { taskService } from './taskService'
import projectService from './projectService'
import { ActivityItem } from '../components/Dashboard/RecentActivity'
import { TaskStats } from '../types/task'
import { Project, ProjectStatus } from '../types/project'
import { supabase } from '../config/supabase'

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
      // Contar clientes (leads + clientes_pf + clientes_pj)
      const [leadsCount, clientesPFCount, clientesPJCount] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('clientes_pf').select('id', { count: 'exact', head: true }),
        supabase.from('clientes_pj').select('id', { count: 'exact', head: true })
      ])

      const totalClients = (leadsCount.count || 0) + (clientesPFCount.count || 0) + (clientesPJCount.count || 0)

      // Buscar estatísticas de tarefas
      const { tasks: allTasks } = await taskService.getTasks()
      const completedTasks = allTasks.filter(t => t.status === 'done').length
      const pendingTasks = allTasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length
      const overdueTasks = allTasks.filter(t => {
        if (!t.dueDate) return false
        return new Date(t.dueDate) < new Date() && t.status !== 'done'
      }).length

      // Buscar receita do mês atual (tabela revenues)
      let monthlyRevenue = 0
      try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        
        const { data: revenues, error: revenuesError } = await supabase
          .from('revenues')
          .select('amount')
          .gte('date', startOfMonth.toISOString().split('T')[0])
          .lte('date', endOfMonth.toISOString().split('T')[0])

        if (!revenuesError && revenues) {
          monthlyRevenue = revenues.reduce((sum, r) => sum + (r.amount || 0), 0)
        }
      } catch (err) {
        console.log('Tabela revenues não encontrada, usando 0')
        monthlyRevenue = 0
      }

      // Contar projetos ativos
      const { count: activeProjectsCount } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'in_progress')

      // Contar membros da equipe
      const { count: teamMembersCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })

      return {
        totalClients,
        totalTasks: allTasks.length,
        completedTasks,
        pendingTasks,
        monthlyRevenue,
        activeProjects: activeProjectsCount || 0,
        teamMembers: teamMembersCount || 0,
        overdueTasks
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas reais:', error)
      // Retornar zeros em caso de erro
      return {
        totalClients: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        monthlyRevenue: 0,
        activeProjects: 0,
        teamMembers: 0,
        overdueTasks: 0
      }
    }
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
    console.log('📊 DashboardService - getDashboardData chamado (DADOS REAIS)')
    
    // Buscar estatísticas reais do banco
    const stats = await this.getRealStats()
    
    // Buscar atividades reais do audit_logs
    const recentActivities = await this.getRecentActivities(7)
    
    // Buscar estatísticas de tarefas
    const { tasks: allTasks } = await taskService.getTasks()
    const taskStats: TaskStats = {
      total: allTasks.length,
      byStatus: {
        todo: allTasks.filter(t => t.status === 'todo').length,
        in_progress: allTasks.filter(t => t.status === 'in_progress').length,
        in_review: allTasks.filter(t => t.status === 'in_review').length,
        done: allTasks.filter(t => t.status === 'done').length,
        cancelled: allTasks.filter(t => t.status === 'cancelled').length
      },
      byPriority: {
        low: allTasks.filter(t => t.priority === 'low').length,
        medium: allTasks.filter(t => t.priority === 'medium').length,
        high: allTasks.filter(t => t.priority === 'high').length,
        urgent: allTasks.filter(t => t.priority === 'urgent').length
      },
      overdue: stats.overdueTasks,
      dueToday: allTasks.filter(t => {
        if (!t.dueDate) return false
        const today = new Date().toDateString()
        return new Date(t.dueDate).toDateString() === today
      }).length,
      dueThisWeek: allTasks.filter(t => {
        if (!t.dueDate) return false
        const now = new Date()
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        const dueDate = new Date(t.dueDate)
        return dueDate >= now && dueDate <= weekFromNow
      }).length
    }
    
    return {
      stats,
      recentActivities,
      taskStats,
      projectStats: {
        total: stats.activeProjects,
        active: stats.activeProjects,
        completed: 0, // TODO: implementar quando tivermos tabela de projetos
        onHold: 0 // TODO: implementar quando tivermos tabela de projetos
      }
    }
  }

  async getRecentActivities(limit: number = 10): Promise<ActivityItem[]> {
    try {
      // Buscar do audit_logs (se existir)
      const { data: auditLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      // Se a tabela não existir, retornar array vazio
      if (error) {
        console.log('Tabela audit_logs não encontrada ou erro:', error.message)
        return []
      }

      if (!auditLogs || auditLogs.length === 0) {
        return []
      }

      return auditLogs.map(log => ({
        id: log.id,
        type: log.action as any,
        title: log.table_name || 'Ação do sistema',
        description: log.action || 'realizou uma ação',
        user: { name: log.user_email || 'Usuário' },
        timestamp: new Date(log.created_at),
        metadata: log.details || {}
      }))
    } catch (error) {
      console.log('Erro ao buscar atividades recentes (tabela não existe):', error)
      return []
    }
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