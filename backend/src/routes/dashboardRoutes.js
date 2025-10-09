import express from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Rotas do dashboard
router.get('/quick-stats', DashboardController.getQuickStats);
router.get('/tasks-metrics', DashboardController.getTasksMetrics);
router.get('/leads-metrics', DashboardController.getLeadsMetrics);
router.get('/financial-metrics', DashboardController.getFinancialMetrics);
router.get('/system-metrics', DashboardController.getSystemMetrics);
router.get('/notifications', DashboardController.getNotifications);

export default router;