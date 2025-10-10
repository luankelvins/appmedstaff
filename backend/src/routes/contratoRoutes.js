import express from 'express';
import ContratoController from '../controllers/contratoController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Rotas de leitura (GET)
router.get('/', ContratoController.getAll);
router.get('/stats', ContratoController.getStats);
router.get('/search', ContratoController.search);
router.get('/vencendo', ContratoController.getVencendo);
router.get('/numero/:numero', ContratoController.getByNumero);
router.get('/cliente/:cliente_id', ContratoController.getByCliente);
router.get('/responsavel/:responsavel_id', ContratoController.getByResponsavel);
router.get('/:id', ContratoController.getById);

// Rotas de criação e atualização (POST/PUT/PATCH)
router.post('/', ContratoController.getValidationRules(), ContratoController.create);
router.put('/:id', ContratoController.getValidationRules(), ContratoController.update);
router.patch('/:id/status', ContratoController.updateStatus);

// Rotas de exclusão (DELETE)
router.delete('/:id', ContratoController.delete);

export default router;