import { authService } from '../services/authService.js';
import pool from '../config/database.js';

/**
 * Middleware para verificar permissões específicas
 * @param {string|string[]} requiredPermissions - Permissão(ões) necessária(s)
 * @param {Object} options - Opções adicionais
 */
export const requirePermission = (requiredPermissions, options = {}) => {
  return async (req, res, next) => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      // Buscar dados completos do usuário incluindo role
      const userQuery = `
        SELECT id, email, role, status, dados_pessoais->>'nome' as nome
        FROM employees 
        WHERE id = $1 AND status = 'ativo'
      `;
      
      const userResult = await pool.query(userQuery, [req.user.userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado ou inativo'
        });
      }

      const user = userResult.rows[0];
      const userRole = user.role || 'user';
      
      // Obter permissões do usuário baseadas no role
      const userPermissions = authService.getRolePermissions(userRole);
      
      // Normalizar permissões requeridas para array
      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      // Verificar se o usuário tem pelo menos uma das permissões necessárias
      const hasPermission = permissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado - Permissões insuficientes',
          required: permissions,
          userRole: userRole
        });
      }

      // Adicionar informações do usuário ao request
      req.user = {
        ...req.user,
        role: userRole,
        permissions: userPermissions,
        nome: user.nome
      };

      next();
    } catch (error) {
      console.error('Erro no middleware de permissões:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

/**
 * Middleware para verificar se o usuário pode acessar recursos de outro usuário
 * @param {string} userIdParam - Nome do parâmetro que contém o ID do usuário
 */
export const requireOwnershipOrPermission = (userIdParam = 'userId', permission = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const targetUserId = req.params[userIdParam] || req.body[userIdParam];
      const currentUserId = req.user.userId;

      // Se é o próprio usuário, permitir acesso
      if (targetUserId && targetUserId.toString() === currentUserId.toString()) {
        return next();
      }

      // Se tem permissão específica, permitir acesso
      if (permission && req.user.permissions && req.user.permissions.includes(permission)) {
        return next();
      }

      // Se é admin ou superadmin, permitir acesso
      if (req.user.role === 'superadmin' || req.user.role === 'admin') {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Acesso negado - Você só pode acessar seus próprios recursos'
      });
    } catch (error) {
      console.error('Erro no middleware de ownership:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

/**
 * Middleware para verificar se o usuário pode acessar dados de um departamento específico
 * @param {string} departmentParam - Nome do parâmetro que contém o departamento
 */
export const requireDepartmentAccess = (departmentParam = 'departamento') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      // Superadmin e admin têm acesso a todos os departamentos
      if (req.user.role === 'superadmin' || req.user.role === 'admin') {
        return next();
      }

      const targetDepartment = req.params[departmentParam] || req.body[departmentParam];
      
      // Buscar departamento do usuário atual
      const userQuery = `
        SELECT dados_profissionais->>'departamento' as departamento
        FROM employees 
        WHERE id = $1
      `;
      
      const userResult = await pool.query(userQuery, [req.user.userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const userDepartment = userResult.rows[0].departamento;

      // Verificar se o usuário pertence ao departamento ou se é gerente
      if (targetDepartment && targetDepartment !== userDepartment) {
        // Verificar se é gerente do departamento
        const isManager = req.user.role && req.user.role.includes('gerente');
        
        if (!isManager) {
          return res.status(403).json({
            success: false,
            message: 'Acesso negado - Você só pode acessar dados do seu departamento'
          });
        }
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de departamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

/**
 * Middleware para verificar se o usuário pode modificar dados (não apenas visualizar)
 * @param {string|string[]} writePermissions - Permissões de escrita necessárias
 */
export const requireWritePermission = (writePermissions) => {
  return requirePermission(writePermissions, { action: 'write' });
};

/**
 * Middleware para verificar se o usuário pode deletar recursos
 * @param {string|string[]} deletePermissions - Permissões de deleção necessárias
 */
export const requireDeletePermission = (deletePermissions) => {
  return requirePermission(deletePermissions, { action: 'delete' });
};

/**
 * Middleware para verificar se o usuário pode aprovar/rejeitar recursos
 * @param {string|string[]} approvalPermissions - Permissões de aprovação necessárias
 */
export const requireApprovalPermission = (approvalPermissions) => {
  return requirePermission(approvalPermissions, { action: 'approve' });
};

/**
 * Middleware para logs de auditoria de acesso
 */
export const auditAccess = (resource, action = 'access') => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        // Log de auditoria (pode ser expandido para salvar no banco)
        console.log(`[AUDIT] User ${req.user.userId} (${req.user.role}) ${action} ${resource} at ${new Date().toISOString()}`);
        
        // Aqui você pode adicionar lógica para salvar no banco de dados
        // await auditService.logAccess({
        //   userId: req.user.userId,
        //   resource,
        //   action,
        //   ip: req.ip,
        //   userAgent: req.get('User-Agent'),
        //   timestamp: new Date()
        // });
      }
      
      next();
    } catch (error) {
      console.error('Erro no middleware de auditoria:', error);
      // Não bloquear a requisição por erro de auditoria
      next();
    }
  };
};

// Permissões pré-definidas para facilitar o uso
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  
  // Funcionários
  EMPLOYEES_READ: 'employees.read',
  EMPLOYEES_WRITE: 'employees.write',
  EMPLOYEES_DELETE: 'employees.delete',
  
  // Tarefas
  TASKS_VIEW: 'tasks.view',
  TASKS_CREATE: 'tasks.create',
  TASKS_UPDATE: 'tasks.update',
  TASKS_DELETE: 'tasks.delete',
  
  // Leads
  LEADS_READ: 'leads.read',
  LEADS_WRITE: 'leads.write',
  LEADS_DELETE: 'leads.delete',
  
  // Contatos
  CONTACTS_READ: 'contacts.read',
  CONTACTS_CREATE: 'contacts.create',
  CONTACTS_UPDATE: 'contacts.update',
  CONTACTS_DELETE: 'contacts.delete',
  
  // Finanças
  FINANCE_EXPENSES_VIEW: 'finance.expenses.view',
  FINANCE_EXPENSES_CREATE: 'finance.expenses.create',
  FINANCE_EXPENSES_APPROVE: 'finance.expenses.approve',
  
  // Administração
  ADMIN_ACCESS: 'admin.access',
  ADMIN_USERS: 'admin.users',
  ADMIN_SETTINGS: 'admin.settings',
  
  // Relatórios
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  
  // Sistema
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_RESTORE: 'system.restore',
  SYSTEM_MAINTENANCE: 'system.maintenance'
};

export default {
  requirePermission,
  requireOwnershipOrPermission,
  requireDepartmentAccess,
  requireWritePermission,
  requireDeletePermission,
  requireApprovalPermission,
  auditAccess,
  PERMISSIONS
};