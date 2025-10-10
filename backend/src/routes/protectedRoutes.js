import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { 
  requirePermission, 
  requireOwnershipOrPermission,
  requireWritePermission,
  requireDeletePermission,
  auditAccess,
  PERMISSIONS 
} from '../middlewares/permissionMiddleware.js';

// Importar todos os controllers
import employeeController from '../controllers/employeeController.js';
import taskController from '../controllers/taskController.js';
import leadController from '../controllers/leadController.js';
import clientePFController from '../controllers/clientePFController.js';
import clientePJController from '../controllers/clientePJController.js';
import notificationController from '../controllers/notificationController.js';
import expenseController from '../controllers/expenseController.js';

const router = express.Router();

// Aplicar autenticação a todas as rotas protegidas
router.use(authenticateToken);

// ==================== ROTAS DE FUNCIONÁRIOS ====================

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Listar todos os funcionários
 *     description: Retorna uma lista paginada de todos os funcionários
 *     tags: [Funcionários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca
 *     responses:
 *       200:
 *         description: Lista de funcionários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *                 pagination:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/employees', 
  requirePermission(PERMISSIONS.EMPLOYEES_READ),
  auditAccess('employees', 'list'),
  employeeController.getAll
);

/**
 * @swagger
 * /api/employees/stats:
 *   get:
 *     summary: Obter estatísticas dos funcionários
 *     description: Retorna estatísticas gerais dos funcionários
 *     tags: [Funcionários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     ativos:
 *                       type: integer
 *                     inativos:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/employees/stats',
  requirePermission(PERMISSIONS.EMPLOYEES_READ),
  auditAccess('employees', 'stats'),
  employeeController.getStats
);

/**
 * @swagger
 * /api/employees/search:
 *   get:
 *     summary: Buscar funcionários
 *     description: Busca funcionários por termo específico
 *     tags: [Funcionários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de busca
 *     responses:
 *       200:
 *         description: Resultados da busca retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/employees/search',
  requirePermission(PERMISSIONS.EMPLOYEES_READ),
  auditAccess('employees', 'search'),
  employeeController.search
);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Obter funcionário por ID
 *     description: Retorna os detalhes de um funcionário específico
 *     tags: [Funcionários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do funcionário
 *     responses:
 *       200:
 *         description: Funcionário encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/employees/:id',
  requirePermission(PERMISSIONS.EMPLOYEES_READ),
  auditAccess('employees', 'view'),
  employeeController.getById
);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Criar novo funcionário
 *     description: Cria um novo funcionário no sistema
 *     tags: [Funcionários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - cargo
 *               - departamento
 *               - salario
 *               - dataAdmissao
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do funcionário
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do funcionário
 *               telefone:
 *                 type: string
 *                 description: Telefone do funcionário
 *               cargo:
 *                 type: string
 *                 description: Cargo do funcionário
 *               departamento:
 *                 type: string
 *                 description: Departamento do funcionário
 *               salario:
 *                 type: number
 *                 description: Salário do funcionário
 *               dataAdmissao:
 *                 type: string
 *                 format: date
 *                 description: Data de admissão
 *     responses:
 *       201:
 *         description: Funcionário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/employees',
  requireWritePermission(PERMISSIONS.EMPLOYEES_WRITE),
  auditAccess('employees', 'create'),
  employeeController.create
);

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Atualizar funcionário
 *     description: Atualiza os dados de um funcionário existente
 *     tags: [Funcionários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do funcionário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               telefone:
 *                 type: string
 *               cargo:
 *                 type: string
 *               departamento:
 *                 type: string
 *               salario:
 *                 type: number
 *               dataAdmissao:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Funcionário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/employees/:id',
  requireWritePermission(PERMISSIONS.EMPLOYEES_WRITE),
  auditAccess('employees', 'update'),
  employeeController.update
);

/**
 * @swagger
 * /api/employees/{id}/status:
 *   patch:
 *     summary: Atualizar status do funcionário
 *     description: Atualiza apenas o status de um funcionário
 *     tags: [Funcionários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do funcionário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo, suspenso]
 *                 description: Novo status do funcionário
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/employees/:id/status',
  requireWritePermission(PERMISSIONS.EMPLOYEES_WRITE),
  auditAccess('employees', 'status_update'),
  employeeController.updateStatus
);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Excluir funcionário
 *     description: Remove um funcionário do sistema
 *     tags: [Funcionários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do funcionário
 *     responses:
 *       200:
 *         description: Funcionário excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/employees/:id',
  requireDeletePermission(PERMISSIONS.EMPLOYEES_DELETE),
  auditAccess('employees', 'delete'),
  employeeController.delete
);

// ==================== ROTAS DE TAREFAS ====================

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Listar todas as tarefas
 *     description: Retorna uma lista paginada de todas as tarefas
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, em_andamento, concluida, cancelada]
 *         description: Filtrar por status
 *       - in: query
 *         name: prioridade
 *         schema:
 *           type: string
 *           enum: [baixa, media, alta, urgente]
 *         description: Filtrar por prioridade
 *     responses:
 *       200:
 *         description: Lista de tarefas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/tasks',
  requirePermission(PERMISSIONS.TASKS_VIEW),
  auditAccess('tasks', 'list'),
  taskController.getAll
);

/**
 * @swagger
 * /api/tasks/stats:
 *   get:
 *     summary: Obter estatísticas das tarefas
 *     description: Retorna estatísticas gerais das tarefas
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pendentes:
 *                       type: integer
 *                     em_andamento:
 *                       type: integer
 *                     concluidas:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/tasks/stats',
  requirePermission(PERMISSIONS.TASKS_VIEW),
  auditAccess('tasks', 'stats'),
  taskController.getStats
);

/**
 * @swagger
 * /api/tasks/user/{userId}:
 *   get:
 *     summary: Listar tarefas por usuário
 *     description: Retorna tarefas criadas por um usuário específico
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Tarefas do usuário retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/tasks/user/:userId',
  requireOwnershipOrPermission('userId', PERMISSIONS.TASKS_VIEW),
  auditAccess('tasks', 'list_by_user'),
  taskController.getByUser
);

/**
 * @swagger
 * /api/tasks/assigned/{userId}:
 *   get:
 *     summary: Listar tarefas atribuídas a um usuário
 *     description: Retorna tarefas atribuídas a um usuário específico
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Tarefas atribuídas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/tasks/assigned/:userId',
  requireOwnershipOrPermission('userId', PERMISSIONS.TASKS_VIEW),
  auditAccess('tasks', 'list_assigned'),
  taskController.getAssignedTo
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obter tarefa por ID
 *     description: Retorna os detalhes de uma tarefa específica
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Tarefa encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/tasks/:id',
  requirePermission(PERMISSIONS.TASKS_VIEW),
  auditAccess('tasks', 'view'),
  taskController.getById
);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Criar nova tarefa
 *     description: Cria uma nova tarefa no sistema
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - descricao
 *               - prioridade
 *               - dataVencimento
 *               - responsavelId
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título da tarefa
 *               descricao:
 *                 type: string
 *                 description: Descrição da tarefa
 *               prioridade:
 *                 type: string
 *                 enum: [baixa, media, alta, urgente]
 *                 description: Prioridade da tarefa
 *               dataVencimento:
 *                 type: string
 *                 format: date-time
 *                 description: Data de vencimento
 *               responsavelId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do responsável
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/tasks',
  requirePermission(PERMISSIONS.TASKS_CREATE),
  auditAccess('tasks', 'create'),
  taskController.create
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Atualizar uma task
 *     description: Atualiza uma task existente com novos dados
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título da task
 *               descricao:
 *                 type: string
 *                 description: Descrição da task
 *               prioridade:
 *                 type: string
 *                 enum: [baixa, media, alta, urgente]
 *                 description: Prioridade da task
 *               status:
 *                 type: string
 *                 enum: [pendente, em_andamento, concluida, cancelada]
 *                 description: Status da task
 *               data_vencimento:
 *                 type: string
 *                 format: date
 *                 description: Data de vencimento da task
 *               usuario_responsavel:
 *                 type: integer
 *                 description: ID do usuário responsável
 *               usuario_atribuido:
 *                 type: integer
 *                 description: ID do usuário atribuído
 *     responses:
 *       200:
 *         description: Task atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Task não encontrada
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/tasks/:id',
  requirePermission(PERMISSIONS.TASKS_UPDATE),
  auditAccess('tasks', 'update'),
  taskController.update
);

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Atualizar status de uma task
 *     description: Atualiza apenas o status de uma task específica
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendente, em_andamento, concluida, cancelada]
 *                 description: Novo status da task
 *     responses:
 *       200:
 *         description: Status da task atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Task não encontrada
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/tasks/:id/status',
  requirePermission(PERMISSIONS.TASKS_UPDATE),
  auditAccess('tasks', 'status_update'),
  taskController.updateStatus
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Deletar uma task
 *     description: Remove uma task do sistema permanentemente
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da task a ser deletada
 *     responses:
 *       200:
 *         description: Task deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Task não encontrada
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/tasks/:id',
  requirePermission(PERMISSIONS.TASKS_DELETE),
  auditAccess('tasks', 'delete'),
  taskController.delete
);

// ==================== ROTAS DE LEADS ====================

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Listar todos os leads
 *     description: Retorna uma lista paginada de todos os leads
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [novo, contato_inicial, qualificado, proposta, negociacao, fechado, perdido]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de leads retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lead'
 *                 pagination:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/leads',
  requirePermission(PERMISSIONS.LEADS_READ),
  auditAccess('leads', 'list'),
  leadController.getAll
);

/**
 * @swagger
 * /api/leads/stats:
 *   get:
 *     summary: Obter estatísticas dos leads
 *     description: Retorna estatísticas gerais dos leads
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     novos:
 *                       type: integer
 *                     qualificados:
 *                       type: integer
 *                     fechados:
 *                       type: integer
 *                     perdidos:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/leads/stats',
  requirePermission(PERMISSIONS.LEADS_READ),
  auditAccess('leads', 'stats'),
  leadController.getStats
);

/**
 * @swagger
 * /api/leads/follow-up:
 *   get:
 *     summary: Listar leads para follow-up
 *     description: Retorna leads que precisam de acompanhamento
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leads para follow-up retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lead'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/leads/follow-up',
  requirePermission(PERMISSIONS.LEADS_READ),
  auditAccess('leads', 'follow_up'),
  leadController.getFollowUp
);

/**
 * @swagger
 * /api/leads/responsible/{responsavelId}:
 *   get:
 *     summary: Listar leads por responsável
 *     description: Retorna leads atribuídos a um responsável específico
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responsavelId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do responsável
 *     responses:
 *       200:
 *         description: Leads do responsável retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lead'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/leads/responsible/:responsavelId',
  requireOwnershipOrPermission('responsavelId', PERMISSIONS.LEADS_READ),
  auditAccess('leads', 'list_by_responsible'),
  leadController.getByResponsavel
);

/**
 * @swagger
 * /api/leads/status/{status}:
 *   get:
 *     summary: Listar leads por status
 *     description: Retorna leads filtrados por status específico
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [novo, contato_inicial, qualificado, proposta, negociacao, fechado, perdido]
 *         description: Status do lead
 *     responses:
 *       200:
 *         description: Leads por status retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lead'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/leads/status/:status',
  requirePermission(PERMISSIONS.LEADS_READ),
  auditAccess('leads', 'list_by_status'),
  leadController.getByStatus
);

/**
 * @swagger
 * /api/leads/{id}:
 *   get:
 *     summary: Obter lead por ID
 *     description: Retorna os detalhes de um lead específico
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do lead
 *     responses:
 *       200:
 *         description: Lead encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Lead'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/leads/:id',
  requirePermission(PERMISSIONS.LEADS_READ),
  auditAccess('leads', 'view'),
  leadController.getById
);

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Criar novo lead
 *     description: Cria um novo lead no sistema
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - telefone
 *               - origem
 *               - responsavelId
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do lead
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do lead
 *               telefone:
 *                 type: string
 *                 description: Telefone do lead
 *               empresa:
 *                 type: string
 *                 description: Empresa do lead
 *               origem:
 *                 type: string
 *                 description: Origem do lead
 *               responsavelId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do responsável
 *               observacoes:
 *                 type: string
 *                 description: Observações sobre o lead
 *     responses:
 *       201:
 *         description: Lead criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Lead'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/leads',
  requireWritePermission(PERMISSIONS.LEADS_WRITE),
  auditAccess('leads', 'create'),
  leadController.create
);

/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     summary: Atualizar um lead
 *     description: Atualiza um lead existente com novos dados
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do lead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do lead
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do lead
 *               telefone:
 *                 type: string
 *                 description: Telefone do lead
 *               empresa:
 *                 type: string
 *                 description: Empresa do lead
 *               cargo:
 *                 type: string
 *                 description: Cargo do lead
 *               origem:
 *                 type: string
 *                 description: Origem do lead
 *               status:
 *                 type: string
 *                 enum: [novo, contato_inicial, qualificado, proposta, negociacao, fechado, perdido]
 *                 description: Status do lead
 *               observacoes:
 *                 type: string
 *                 description: Observações sobre o lead
 *               responsavel_id:
 *                 type: integer
 *                 description: ID do responsável pelo lead
 *               valor_estimado:
 *                 type: number
 *                 format: decimal
 *                 description: Valor estimado do negócio
 *               data_contato:
 *                 type: string
 *                 format: date
 *                 description: Data do próximo contato
 *     responses:
 *       200:
 *         description: Lead atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Lead'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Lead não encontrado
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/leads/:id',
  requireWritePermission(PERMISSIONS.LEADS_WRITE),
  auditAccess('leads', 'update'),
  leadController.update
);

/**
 * @swagger
 * /api/leads/{id}/status:
 *   patch:
 *     summary: Atualizar status de um lead
 *     description: Atualiza apenas o status de um lead específico
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do lead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [novo, contato_inicial, qualificado, proposta, negociacao, fechado, perdido]
 *                 description: Novo status do lead
 *     responses:
 *       200:
 *         description: Status do lead atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Lead'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Lead não encontrado
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/leads/:id/status',
  requireWritePermission(PERMISSIONS.LEADS_WRITE),
  auditAccess('leads', 'status_update'),
  leadController.updateStatus
);

/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     summary: Deletar um lead
 *     description: Remove permanentemente um lead do sistema
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do lead a ser deletado
 *     responses:
 *       200:
 *         description: Lead deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Lead deletado com sucesso"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Lead não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Lead não encontrado"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/leads/:id',
  requireWritePermission(PERMISSIONS.LEADS_DELETE),
  auditAccess('leads', 'delete'),
  leadController.delete
);

// ==================== ROTAS DE CLIENTES PF ====================
router.get('/clientes-pf',
  requirePermission(PERMISSIONS.CONTACTS_READ),
  auditAccess('clientes_pf', 'list'),
  clientePFController.getAll
);

router.get('/clientes-pf/stats',
  requirePermission(PERMISSIONS.CONTACTS_READ),
  auditAccess('clientes_pf', 'stats'),
  clientePFController.getStats
);

router.get('/clientes-pf/cpf/:cpf',
  requirePermission(PERMISSIONS.CONTACTS_READ),
  auditAccess('clientes_pf', 'search_by_cpf'),
  clientePFController.getByCPF
);

router.get('/clientes-pf/responsible/:responsavelId',
  requireOwnershipOrPermission('responsavelId', PERMISSIONS.CONTACTS_READ),
  auditAccess('clientes_pf', 'list_by_responsible'),
  clientePFController.getByResponsavel
);

router.get('/clientes-pf/:id',
  requirePermission(PERMISSIONS.CONTACTS_READ),
  auditAccess('clientes_pf', 'view'),
  clientePFController.getById
);

router.post('/clientes-pf',
  requirePermission(PERMISSIONS.CONTACTS_CREATE),
  auditAccess('clientes_pf', 'create'),
  clientePFController.create
);

router.put('/clientes-pf/:id',
  requirePermission(PERMISSIONS.CONTACTS_UPDATE),
  auditAccess('clientes_pf', 'update'),
  clientePFController.update
);

router.patch('/clientes-pf/:id/status',
  requirePermission(PERMISSIONS.CONTACTS_UPDATE),
  auditAccess('clientes_pf', 'status_update'),
  clientePFController.updateStatus
);

router.post('/clientes-pf/:id/documentos',
  requirePermission(PERMISSIONS.CONTACTS_UPDATE),
  auditAccess('clientes_pf', 'add_document'),
  clientePFController.addDocumento
);

router.delete('/clientes-pf/:id',
  requirePermission(PERMISSIONS.CONTACTS_DELETE),
  auditAccess('clientes_pf', 'delete'),
  clientePFController.delete
);

// ==================== ROTAS DE CLIENTES PJ ====================
router.get('/clientes-pj',
  requirePermission(PERMISSIONS.CONTACTS_READ),
  auditAccess('clientes_pj', 'list'),
  clientePJController.getAll
);

router.get('/clientes-pj/stats',
  requirePermission(PERMISSIONS.CONTACTS_READ),
  auditAccess('clientes_pj', 'stats'),
  clientePJController.getStats
);

router.get('/clientes-pj/cnpj/:cnpj',
  requirePermission(PERMISSIONS.CONTACTS_READ),
  auditAccess('clientes_pj', 'search_by_cnpj'),
  clientePJController.getByCNPJ
);

router.get('/clientes-pj/:id',
  requirePermission(PERMISSIONS.CONTACTS_READ),
  auditAccess('clientes_pj', 'view'),
  clientePJController.getById
);

router.post('/clientes-pj',
  requirePermission(PERMISSIONS.CONTACTS_CREATE),
  auditAccess('clientes_pj', 'create'),
  clientePJController.create
);

router.put('/clientes-pj/:id',
  requirePermission(PERMISSIONS.CONTACTS_UPDATE),
  auditAccess('clientes_pj', 'update'),
  clientePJController.update
);

router.patch('/clientes-pj/:id/status',
  requirePermission(PERMISSIONS.CONTACTS_UPDATE),
  auditAccess('clientes_pj', 'status_update'),
  clientePJController.updateStatus
);

router.patch('/clientes-pj/:id/certificado-digital',
  requirePermission(PERMISSIONS.CONTACTS_UPDATE),
  auditAccess('clientes_pj', 'update_certificate'),
  clientePJController.updateCertificadoDigital
);

router.delete('/clientes-pj/:id',
  requirePermission(PERMISSIONS.CONTACTS_DELETE),
  auditAccess('clientes_pj', 'delete'),
  clientePJController.delete
);

// ==================== ROTAS DE NOTIFICAÇÕES ====================

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Listar todas as notificações
 *     description: Retorna uma lista paginada de todas as notificações
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de itens por página
 *     responses:
 *       200:
 *         description: Lista de notificações retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/notifications',
  requirePermission(PERMISSIONS.DASHBOARD_VIEW),
  auditAccess('notifications', 'list'),
  notificationController.getAll
);

/**
 * @swagger
 * /api/notifications/user/{userId}:
 *   get:
 *     summary: Listar notificações por usuário
 *     description: Retorna notificações de um usuário específico
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Notificações do usuário retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/notifications/user/:userId',
  requireOwnershipOrPermission('userId', PERMISSIONS.DASHBOARD_VIEW),
  auditAccess('notifications', 'list_by_user'),
  notificationController.getByUser
);

/**
 * @swagger
 * /api/notifications/user/{userId}/unread:
 *   get:
 *     summary: Listar notificações não lidas
 *     description: Retorna notificações não lidas de um usuário específico
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Notificações não lidas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/notifications/user/:userId/unread',
  requireOwnershipOrPermission('userId', PERMISSIONS.DASHBOARD_VIEW),
  auditAccess('notifications', 'unread'),
  notificationController.getUnreadByUser
);

/**
 * @swagger
 * /api/notifications/user/{userId}/unread/count:
 *   get:
 *     summary: Contar notificações não lidas
 *     description: Retorna o número de notificações não lidas de um usuário
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Contagem de notificações não lidas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/notifications/user/:userId/unread/count',
  requireOwnershipOrPermission('userId', PERMISSIONS.DASHBOARD_VIEW),
  auditAccess('notifications', 'unread_count'),
  notificationController.getUnreadCount
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Obter notificação por ID
 *     description: Retorna os detalhes de uma notificação específica
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Notificação encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/notifications/:id',
  requirePermission(PERMISSIONS.DASHBOARD_VIEW),
  auditAccess('notifications', 'view'),
  notificationController.getById
);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Criar nova notificação
 *     description: Cria uma nova notificação no sistema
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - mensagem
 *               - tipo
 *               - usuarioId
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título da notificação
 *               mensagem:
 *                 type: string
 *                 description: Mensagem da notificação
 *               tipo:
 *                 type: string
 *                 enum: [info, warning, error, success]
 *                 description: Tipo da notificação
 *               usuarioId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do usuário destinatário
 *     responses:
 *       201:
 *         description: Notificação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/notifications',
  requirePermission(PERMISSIONS.ADMIN_ACCESS),
  auditAccess('notifications', 'create'),
  notificationController.create
);

router.post('/notifications/bulk',
  requirePermission(PERMISSIONS.ADMIN_ACCESS),
  auditAccess('notifications', 'bulk_create'),
  notificationController.createBulk
);

router.patch('/notifications/:id/read',
  requirePermission(PERMISSIONS.DASHBOARD_VIEW),
  auditAccess('notifications', 'mark_read'),
  notificationController.markAsRead
);

router.patch('/notifications/user/:userId/read-all',
  requireOwnershipOrPermission('userId', PERMISSIONS.DASHBOARD_VIEW),
  auditAccess('notifications', 'mark_all_read'),
  notificationController.markAllAsRead
);

router.patch('/notifications/read-multiple',
  requirePermission(PERMISSIONS.DASHBOARD_VIEW),
  auditAccess('notifications', 'mark_multiple_read'),
  notificationController.markMultipleAsRead
);

router.delete('/notifications/cleanup',
  requirePermission(PERMISSIONS.ADMIN_ACCESS),
  auditAccess('notifications', 'cleanup'),
  notificationController.cleanup
);

router.delete('/notifications/:id',
  requirePermission(PERMISSIONS.ADMIN_ACCESS),
  auditAccess('notifications', 'delete'),
  notificationController.delete
);

// ==================== ROTAS DE DESPESAS ====================

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Listar todas as despesas
 *     description: Retorna uma lista paginada de todas as despesas
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, pago, vencido, cancelado]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de despesas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *                 pagination:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/expenses',
  requirePermission(PERMISSIONS.FINANCE_EXPENSES_VIEW),
  auditAccess('expenses', 'list'),
  expenseController.getAll
);

/**
 * @swagger
 * /api/expenses/overdue:
 *   get:
 *     summary: Listar despesas vencidas
 *     description: Retorna despesas que estão vencidas
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Despesas vencidas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/expenses/overdue',
  requirePermission(PERMISSIONS.FINANCE_EXPENSES_VIEW),
  auditAccess('expenses', 'overdue'),
  expenseController.getOverdue
);

/**
 * @swagger
 * /api/expenses/due-soon:
 *   get:
 *     summary: Listar despesas com vencimento próximo
 *     description: Retorna despesas que vencem em breve
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Despesas com vencimento próximo retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/expenses/due-soon',
  requirePermission(PERMISSIONS.FINANCE_EXPENSES_VIEW),
  auditAccess('expenses', 'due_soon'),
  expenseController.getDueSoon
);

/**
 * @swagger
 * /api/expenses/total/{period}:
 *   get:
 *     summary: Obter total de despesas por período
 *     description: Retorna o total de despesas para um período específico
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *           enum: [month, quarter, year]
 *         description: Período para cálculo
 *     responses:
 *       200:
 *         description: Total de despesas retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     period:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/expenses/total/:period',
  requirePermission(PERMISSIONS.FINANCE_EXPENSES_VIEW),
  auditAccess('expenses', 'total_by_period'),
  expenseController.getTotalByPeriod
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Obter despesa por ID
 *     description: Retorna os detalhes de uma despesa específica
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da despesa
 *     responses:
 *       200:
 *         description: Despesa encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/expenses/:id',
  requirePermission(PERMISSIONS.FINANCE_EXPENSES_VIEW),
  auditAccess('expenses', 'view'),
  expenseController.getById
);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Criar nova despesa
 *     description: Cria uma nova despesa no sistema
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descricao
 *               - valor
 *               - dataVencimento
 *               - categoria
 *             properties:
 *               descricao:
 *                 type: string
 *                 description: Descrição da despesa
 *               valor:
 *                 type: number
 *                 description: Valor da despesa
 *               dataVencimento:
 *                 type: string
 *                 format: date
 *                 description: Data de vencimento
 *               categoria:
 *                 type: string
 *                 description: Categoria da despesa
 *               observacoes:
 *                 type: string
 *                 description: Observações sobre a despesa
 *     responses:
 *       201:
 *         description: Despesa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/expenses',
  requirePermission(PERMISSIONS.FINANCE_EXPENSES_CREATE),
  auditAccess('expenses', 'create'),
  expenseController.create
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Atualizar despesa
 *     description: Atualiza uma despesa existente
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da despesa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descricao:
 *                 type: string
 *                 description: Descrição da despesa
 *               valor:
 *                 type: number
 *                 description: Valor da despesa
 *               dataVencimento:
 *                 type: string
 *                 format: date
 *                 description: Data de vencimento
 *               categoria:
 *                 type: string
 *                 description: Categoria da despesa
 *               observacoes:
 *                 type: string
 *                 description: Observações sobre a despesa
 *     responses:
 *       200:
 *         description: Despesa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/expenses/:id',
  requirePermission(PERMISSIONS.FINANCE_EXPENSES_CREATE),
  auditAccess('expenses', 'update'),
  expenseController.update
);

/**
 * @swagger
 * /api/expenses/{id}/pay:
 *   patch:
 *     summary: Marcar despesa como paga
 *     description: Marca uma despesa como paga
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da despesa
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dataPagamento:
 *                 type: string
 *                 format: date
 *                 description: Data do pagamento (opcional, padrão é hoje)
 *               observacoesPagamento:
 *                 type: string
 *                 description: Observações sobre o pagamento
 *     responses:
 *       200:
 *         description: Despesa marcada como paga com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/expenses/:id/pay',
  requirePermission(PERMISSIONS.FINANCE_EXPENSES_APPROVE),
  auditAccess('expenses', 'mark_paid'),
  expenseController.markAsPaid
);

/**
 * @swagger
 * /api/expenses/{id}/cancel:
 *   patch:
 *     summary: Cancelar despesa
 *     description: Cancela uma despesa
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da despesa
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivoCancelamento:
 *                 type: string
 *                 description: Motivo do cancelamento
 *     responses:
 *       200:
 *         description: Despesa cancelada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/expenses/:id/cancel',
  requirePermission(PERMISSIONS.FINANCE_EXPENSES_APPROVE),
  auditAccess('expenses', 'cancel'),
  expenseController.cancel
);

/**
 * @swagger
 * /api/expenses/{id}/anexos:
 *   post:
 *     summary: Adicionar anexo à despesa
 *     description: Adiciona um anexo (arquivo) a uma despesa
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da despesa
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - arquivo
 *             properties:
 *               arquivo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo a ser anexado
 *               descricao:
 *                 type: string
 *                 description: Descrição do anexo
 *     responses:
 *       201:
 *         description: Anexo adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     nomeArquivo:
 *                       type: string
 *                     descricao:
 *                       type: string
 *                     tamanho:
 *                       type: number
 *                     tipo:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/expenses/:id/anexos',
  requirePermission(PERMISSIONS.FINANCE_EXPENSES_CREATE),
  auditAccess('expenses', 'add_attachment'),
  expenseController.addAnexo
);

/**
 * @swagger
 * /api/expenses/{id}/anexos/{anexoId}:
 *   delete:
 *     summary: Remover anexo da despesa
 *     description: Remove um anexo específico de uma despesa
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da despesa
 *       - in: path
 *         name: anexoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do anexo
 *     responses:
 *       200:
 *         description: Anexo removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/expenses/:id/anexos/:anexoId',
  requirePermission(PERMISSIONS.FINANCE_EXPENSES_CREATE),
  auditAccess('expenses', 'remove_attachment'),
  expenseController.removeAnexo
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Excluir despesa
 *     description: Exclui uma despesa do sistema
 *     tags: [Financeiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da despesa
 *     responses:
 *       200:
 *         description: Despesa excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/expenses/:id',
  requirePermission(PERMISSIONS.FINANCE_EXPENSES_APPROVE),
  auditAccess('expenses', 'delete'),
  expenseController.delete
);

// ==================== MIDDLEWARE DE TRATAMENTO DE ERROS ====================
router.use((error, req, res, next) => {
  console.error('Erro nas rotas protegidas:', error);
  
  // Log de segurança para tentativas de acesso não autorizado
  if (error.status === 403 || error.status === 401) {
    console.log(`[SECURITY] Unauthorized access attempt: ${req.method} ${req.path} by user ${req.user?.userId || 'unknown'}`);
  }
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export default router;