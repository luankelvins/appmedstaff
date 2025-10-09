import express from 'express';
import twoFactorController, { twoFactorValidations } from '../controllers/twoFactorController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { validationResult } from 'express-validator';

// Middleware simples para processar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados de entrada inválidos',
      details: errors.array()
    });
  }
  next();
};
import { 
  apiLimiter, 
  twoFactorVerifyLimiter, 
  twoFactorSetupLimiter, 
  twoFactorBackupLimiter 
} from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * /api/2fa/status:
 *   get:
 *     summary: Verificar status do 2FA
 *     description: Retorna o status atual da autenticação de dois fatores para o usuário
 *     tags: [Autenticação 2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status do 2FA obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TwoFactorStatus'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/status', 
  authenticateToken,
  apiLimiter,
  twoFactorController.getStatus
);

/**
 * @swagger
 * /api/2fa/generate-secret:
 *   post:
 *     summary: Configurar 2FA
 *     description: Gera um novo segredo para configuração do 2FA
 *     tags: [Autenticação 2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Segredo 2FA gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 secret:
 *                   type: string
 *                   description: Segredo base32 para configuração no app autenticador
 *                 qrCode:
 *                   type: string
 *                   description: URL do QR Code para configuração
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/generate-secret',
  authenticateToken,
  twoFactorSetupLimiter,
  twoFactorController.generateSecret
);

/**
 * @route POST /api/2fa/enable
 * @desc Habilita 2FA para o usuário
 * @access Private
 */
router.post('/enable',
  authenticateToken,
  twoFactorSetupLimiter,
  twoFactorValidations.enableTwoFactor,
  handleValidationErrors,
  twoFactorController.enableTwoFactor
);

/**
 * @route POST /api/2fa/disable
 * @desc Desabilita 2FA para o usuário
 * @access Private
 */
router.post('/disable',
  authenticateToken,
  twoFactorSetupLimiter,
  twoFactorValidations.disableTwoFactor,
  handleValidationErrors,
  twoFactorController.disableTwoFactor
);

/**
 * @route POST /api/2fa/regenerate-backup-codes
 * @desc Regenera códigos de backup para 2FA
 * @access Private
 */
router.post('/regenerate-backup-codes',
  authenticateToken,
  twoFactorSetupLimiter,
  twoFactorValidations.regenerateBackupCodes,
  handleValidationErrors,
  twoFactorController.regenerateBackupCodes
);

/**
 * @route POST /api/2fa/verify
 * @desc Verifica token 2FA para login
 * @access Public
 */
router.post('/verify',
  twoFactorVerifyLimiter,
  twoFactorValidations.verifyToken,
  handleValidationErrors,
  twoFactorController.verifyToken
);

export default router;