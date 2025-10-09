import express from 'express';
import { AuthController } from '../controllers/authController.js';

const router = express.Router();

// Rotas de autenticação
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/verify', AuthController.verify);
router.get('/user/:userId', AuthController.getUser);
router.put('/update-password', AuthController.updatePassword);

export default router;