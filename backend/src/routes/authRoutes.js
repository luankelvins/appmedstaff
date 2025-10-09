import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { 
  loginLimiter, 
  registerLimiter, 
  passwordResetLimiter, 
  refreshTokenLimiter,
  apiLimiter 
} from '../middleware/rateLimiter.js';
import {
  validateLogin,
  validateRegister,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateId
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realizar login no sistema
 *     description: Autentica um usuário com email e senha, retornando um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Credenciais inválidas'
 *               message: 'Email ou senha incorretos'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/login', 
  loginLimiter, 
  validateLogin, 
  AuthController.login
);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: 'Usuário registrado com sucesso'
 *               data:
 *                 user:
 *                   id: '123e4567-e89b-12d3-a456-426614174000'
 *                   email: 'novo@medstaff.com'
 *                   name: 'João Silva'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email já está em uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'Email já existe'
 *               message: 'Este email já está sendo usado por outro usuário'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/register', 
  registerLimiter, 
  validateRegister, 
  AuthController.register
);

router.post('/verify', 
  apiLimiter,
  AuthController.verify
);

router.post('/forgot-password',
  passwordResetLimiter,
  validateForgotPassword,
  AuthController.forgotPassword
);

router.post('/reset-password',
  passwordResetLimiter,
  validateResetPassword,
  AuthController.resetPassword
);

router.get('/user/:userId', 
  authenticateToken,
  apiLimiter,
  validateId,
  AuthController.getUser
);

router.put('/update-password', 
  authenticateToken,
  apiLimiter,
  validateChangePassword,
  AuthController.updatePassword
);

router.post('/logout',
  authenticateToken,
  AuthController.logout
);

router.post('/refresh-token',
  refreshTokenLimiter,
  AuthController.refreshToken
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obter dados do usuário atual
 *     description: Retorna os dados do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/me',
  authenticateToken,
  apiLimiter,
  AuthController.getCurrentUser
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Realizar logout
 *     description: Invalida o token do usuário e realiza logout
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: 'Logout realizado com sucesso'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/logout',
  authenticateToken,
  AuthController.logout
);

export default router;