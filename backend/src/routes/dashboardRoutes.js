import express from 'express';
import DashboardController from '../controllers/dashboardController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @swagger
 * /api/dashboard/quick-stats:
 *   get:
 *     summary: Estatísticas rápidas do dashboard
 *     description: Retorna estatísticas resumidas do sistema para o dashboard principal
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Rotas do dashboard
router.get('/quick-stats', DashboardController.getQuickStats);
router.get('/tasks-metrics', DashboardController.getTasksMetrics);
router.get('/leads-metrics', DashboardController.getLeadsMetrics);
router.get('/financial-metrics', DashboardController.getFinancialMetrics);
router.get('/system-metrics', DashboardController.getSystemMetrics);
router.get('/notifications', DashboardController.getNotifications);

export default router;