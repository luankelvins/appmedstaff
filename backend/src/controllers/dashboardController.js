import pool from '../config/database.js';

export class DashboardController {
  static async getQuickStats(req, res) {
    try {
      // Buscar estatísticas gerais
      const [
        totalEmployees,
        totalTasks,
        completedTasks,
        totalLeads,
        convertedLeads,
        totalContracts,
        activeContracts
      ] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM employees WHERE status = $1', ['ativo']),
        pool.query('SELECT COUNT(*) as count FROM tasks'),
        pool.query('SELECT COUNT(*) as count FROM tasks WHERE status = $1', ['completed']),
        pool.query('SELECT COUNT(*) as count FROM leads'),
        pool.query('SELECT COUNT(*) as count FROM leads WHERE status = $1', ['ganho']),
        pool.query('SELECT COUNT(*) as count FROM contratos'),
        pool.query('SELECT COUNT(*) as count FROM contratos WHERE status = $1', ['ativo'])
      ]);

      // Calcular métricas
      const totalTasksCount = totalTasks[0]?.count || 0;
      const completedTasksCount = completedTasks[0]?.count || 0;
      const taskCompletionRate = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

      const totalLeadsCount = totalLeads[0]?.count || 0;
      const convertedLeadsCount = convertedLeads[0]?.count || 0;
      const conversionRate = totalLeadsCount > 0 ? (convertedLeadsCount / totalLeadsCount) * 100 : 0;

      const stats = {
        totalUsers: totalEmployees[0]?.count || 0,
        activeUsers: totalEmployees[0]?.count || 0, // Simplificado - todos ativos
        totalTasks: totalTasksCount,
        completedTasks: completedTasksCount,
        taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
        totalLeads: totalLeadsCount,
        convertedLeads: convertedLeadsCount,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalContracts: totalContracts[0]?.count || 0,
        activeContracts: activeContracts[0]?.count || 0
      };

      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas rápidas:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar estatísticas',
        error: error.message 
      });
    }
  }

  static async getTasksMetrics(req, res) {
    try {
      // Buscar métricas de tarefas
      const [
        tasksByStatus,
        tasksByPriority,
        recentTasks,
        overdueTasks
      ] = await Promise.all([
        pool.query(`
          SELECT status, COUNT(*) as count 
          FROM tasks 
          GROUP BY status
        `),
        pool.query(`
          SELECT priority, COUNT(*) as count 
          FROM tasks 
          GROUP BY priority
        `),
        pool.query(`
          SELECT id, title, status, priority, due_date, created_at
          FROM tasks 
          ORDER BY created_at DESC 
          LIMIT 10
        `),
        pool.query(`
          SELECT COUNT(*) as count 
          FROM tasks 
          WHERE due_date < NOW() AND status NOT IN ('completed', 'cancelled')
        `)
      ]);

      const metrics = {
        byStatus: tasksByStatus,
        byPriority: tasksByPriority,
        recent: recentTasks,
        overdueCount: overdueTasks[0]?.count || 0
      };

      res.json(metrics);
    } catch (error) {
      console.error('Erro ao buscar métricas de tarefas:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar métricas de tarefas',
        error: error.message 
      });
    }
  }

  static async getLeadsMetrics(req, res) {
    try {
      // Buscar métricas de leads
      const [
        leadsByStatus,
        leadsByOrigin,
        recentLeads,
        conversionFunnel
      ] = await Promise.all([
        pool.query(`
          SELECT status, COUNT(*) as count 
          FROM leads 
          GROUP BY status
        `),
        pool.query(`
          SELECT origem, COUNT(*) as count 
          FROM leads 
          GROUP BY origem
        `),
        pool.query(`
          SELECT id, nome, empresa, status, origem, created_at
          FROM leads 
          ORDER BY created_at DESC 
          LIMIT 10
        `),
        pool.query(`
          SELECT 
            status,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
          FROM leads 
          GROUP BY status
          ORDER BY 
            CASE status
              WHEN 'novo' THEN 1
              WHEN 'contatado' THEN 2
              WHEN 'qualificado' THEN 3
              WHEN 'proposta' THEN 4
              WHEN 'negociacao' THEN 5
              WHEN 'ganho' THEN 6
              WHEN 'perdido' THEN 7
            END
        `)
      ]);

      const metrics = {
        byStatus: leadsByStatus,
        byOrigin: leadsByOrigin,
        recent: recentLeads,
        funnel: conversionFunnel
      };

      res.json(metrics);
    } catch (error) {
      console.error('Erro ao buscar métricas de leads:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar métricas de leads',
        error: error.message 
      });
    }
  }

  static async getFinancialMetrics(req, res) {
    try {
      // Buscar métricas financeiras baseadas em contratos
      const [
        contractsByStatus,
        monthlyRevenue,
        recentContracts
      ] = await Promise.all([
        pool.query(`
          SELECT status, COUNT(*) as count 
          FROM contratos 
          GROUP BY status
        `),
        pool.query(`
          SELECT 
            DATE_TRUNC('month', data_inicio) as month,
            COUNT(*) as contracts_count,
            SUM((condicoes_comerciais->>'valor_mensal')::numeric) as revenue
          FROM contratos 
          WHERE status = 'ativo'
          GROUP BY DATE_TRUNC('month', data_inicio)
          ORDER BY month DESC
          LIMIT 12
        `),
        pool.query(`
          SELECT id, numero_contrato, cliente_nome, status, data_inicio, condicoes_comerciais
          FROM contratos 
          ORDER BY created_at DESC 
          LIMIT 10
        `)
      ]);

      const metrics = {
        contractsByStatus: contractsByStatus,
        monthlyRevenue: monthlyRevenue,
        recent: recentContracts
      };

      res.json(metrics);
    } catch (error) {
      console.error('Erro ao buscar métricas financeiras:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar métricas financeiras',
        error: error.message 
      });
    }
  }

  static async getSystemMetrics(req, res) {
    try {
      // Buscar métricas do sistema
      const [
        userActivity,
        documentStats,
        systemHealth
      ] = await Promise.all([
        pool.query(`
          SELECT 
            COUNT(*) as total_employees,
            COUNT(CASE WHEN status = 'ativo' THEN 1 END) as active_employees,
            COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_employees_month
          FROM employees
        `),
        pool.query(`
          SELECT 
            categoria,
            COUNT(*) as count,
            COUNT(CASE WHEN status = 'ativo' THEN 1 END) as active_count
          FROM admin_documents 
          GROUP BY categoria
        `),
        pool.query(`
          SELECT 
            'database' as service,
            'online' as status,
            NOW() as last_check
        `)
      ]);

      const metrics = {
        userActivity: userActivity[0] || {},
        documentStats: documentStats,
        systemHealth: systemHealth
      };

      res.json(metrics);
    } catch (error) {
      console.error('Erro ao buscar métricas do sistema:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar métricas do sistema',
        error: error.message 
      });
    }
  }

  static async getNotifications(req, res) {
    try {
      // Buscar notificações baseadas em dados reais
      const [
        overdueTasks,
        newLeads
      ] = await Promise.all([
        pool.query(`
          SELECT id, title, due_date
          FROM tasks 
          WHERE due_date < NOW() AND status NOT IN ('completed', 'cancelled')
          ORDER BY due_date ASC
          LIMIT 5
        `),
        pool.query(`
          SELECT id, nome, empresa, created_at
          FROM leads 
          WHERE status = 'novo' AND created_at > NOW() - INTERVAL '24 hours'
          ORDER BY created_at DESC
          LIMIT 5
        `)
      ]);

      const notifications = [];

      // Adicionar notificações de tarefas atrasadas
      overdueTasks.rows.forEach(task => {
        notifications.push({
          id: `task-${task.id}`,
          type: 'warning',
          priority: 'high',
          title: 'Tarefa Atrasada',
          message: `"${task.title}" está atrasada`,
          timestamp: task.due_date
        });
      });

      // Adicionar notificações de novos leads
      newLeads.rows.forEach(lead => {
        notifications.push({
          id: `lead-${lead.id}`,
          type: 'info',
          priority: 'medium',
          title: 'Novo Lead',
          message: `${lead.nome} ${lead.empresa ? `(${lead.empresa})` : ''} entrou em contato`,
          timestamp: lead.created_at
        });
      });



      // Ordenar por prioridade e timestamp
      notifications.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      res.json(notifications.slice(0, 10)); // Limitar a 10 notificações
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar notificações',
        error: error.message 
      });
    }
  }
}