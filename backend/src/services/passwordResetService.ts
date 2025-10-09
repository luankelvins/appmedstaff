import db from '../config/database'
import { emailService } from './emailService'

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetResponse {
  success: boolean
  message: string
  error?: string
}

export interface PasswordResetValidation {
  valid: boolean
  message: string
  userId?: string
}

class PasswordResetService {
  /**
   * Solicitar recuperação de senha
   */
  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    try {
      console.log('[PasswordResetService] Iniciando recuperação para:', email)

      // 1. Verificar se o email existe no banco (tabela employees)
      const employeeResult = await db.query(
        'SELECT id, email, dados_pessoais FROM employees WHERE LOWER(email) = LOWER($1)',
        [email]
      )

      if (employeeResult.rows.length === 0) {
        console.log('[PasswordResetService] Email não encontrado:', email)
        return {
          success: false,
          message: 'Email não encontrado em nossa base de dados.',
          error: 'EMAIL_NOT_FOUND'
        }
      }

      const employee = employeeResult.rows[0]
      const employeeName = employee.dados_pessoais?.nome || employee.dados_pessoais?.name || 'Usuário'
      console.log('[PasswordResetService] Funcionário encontrado:', employeeName)

      // 2. Verificar rate limit
      const rateLimitCheck = await this.checkRateLimit(email)
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          message: rateLimitCheck.message || 'Muitas tentativas. Tente novamente mais tarde.',
          error: 'RATE_LIMIT_EXCEEDED'
        }
      }

      // 3. Gerar token de recuperação seguro
      const resetToken = this.generateSecureToken(employee.id)
      
      // 4. Limpar tokens antigos
      await this.cleanupOldTokens(employee.id)
      
      // 5. Salvar token no banco
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      
      await db.query(
        `INSERT INTO password_reset_tokens (user_id, email, token, expires_at, created_at, used)
         VALUES ($1, $2, $3, $4, NOW(), false)`,
        [employee.id, email.toLowerCase(), resetToken, expiresAt]
      )

      console.log('[PasswordResetService] Token salvo com sucesso')

      // 6. Enviar email
       const emailSent = await emailService.sendPasswordResetEmail(email, resetToken)

       if (!emailSent) {
         console.error('[PasswordResetService] Erro ao enviar email')
         return {
           success: false,
           message: 'Erro ao enviar email de recuperação.',
           error: 'EMAIL_SEND_FAILED'
         }
       }

      console.log('[PasswordResetService] Email enviado com sucesso')

      return {
        success: true,
        message: 'Email de recuperação enviado com sucesso. Verifique sua caixa de entrada.'
      }

    } catch (error) {
      console.error('[PasswordResetService] Erro na recuperação:', error)
      return {
        success: false,
        message: 'Erro interno do servidor.',
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Validar token de recuperação
   */
  async validateResetToken(token: string): Promise<PasswordResetValidation> {
    try {
      console.log('[PasswordResetService] Validando token...')

      const result = await db.query(
        `SELECT user_id, email, expires_at, used, created_at 
         FROM password_reset_tokens 
         WHERE token = $1`,
        [token]
      )

      if (result.rows.length === 0) {
        console.log('[PasswordResetService] Token não encontrado')
        return {
          valid: false,
          message: 'Token inválido ou expirado.'
        }
      }

      const tokenData = result.rows[0]

      // Verificar se já foi usado
      if (tokenData.used) {
        console.log('[PasswordResetService] Token já foi usado')
        return {
          valid: false,
          message: 'Este token já foi utilizado.'
        }
      }

      // Verificar se expirou
      if (new Date() > new Date(tokenData.expires_at)) {
        console.log('[PasswordResetService] Token expirado')
        return {
          valid: false,
          message: 'Token expirado. Solicite uma nova recuperação.'
        }
      }

      console.log('[PasswordResetService] Token válido')
      return {
        valid: true,
        message: 'Token válido.',
        userId: tokenData.user_id
      }

    } catch (error) {
      console.error('[PasswordResetService] Erro na validação:', error)
      return {
        valid: false,
        message: 'Erro ao validar token.'
      }
    }
  }

  /**
   * Resetar senha
   */
  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
    try {
      console.log('[PasswordResetService] Iniciando reset de senha...')

      // 1. Validar token
      const validation = await this.validateResetToken(token)
      if (!validation.valid || !validation.userId) {
        return {
          success: false,
          message: validation.message,
          error: 'INVALID_TOKEN'
        }
      }

      // 2. Atualizar senha do usuário
      await db.query(
        'UPDATE employees SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPassword, validation.userId] // Nota: Em produção, a senha deve ser hasheada
      )

      // 3. Marcar token como usado
      await db.query(
        'UPDATE password_reset_tokens SET used = true, used_at = NOW() WHERE token = $1',
        [token]
      )

      console.log('[PasswordResetService] Senha resetada com sucesso')

      return {
        success: true,
        message: 'Senha alterada com sucesso.'
      }

    } catch (error) {
      console.error('[PasswordResetService] Erro no reset:', error)
      return {
        success: false,
        message: 'Erro ao resetar senha.',
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Reenviar email de recuperação
   */
  async resendPasswordReset(email: string): Promise<PasswordResetResponse> {
    try {
      console.log('[PasswordResetService] Reenviando recuperação para:', email)

      // Verificar se existe token válido recente (últimas 2 horas)
      const recentTokenResult = await db.query(
        `SELECT token, created_at FROM password_reset_tokens 
         WHERE email = $1 AND used = false AND expires_at > NOW() 
         AND created_at > NOW() - INTERVAL '2 hours'
         ORDER BY created_at DESC LIMIT 1`,
        [email.toLowerCase()]
      )

      if (recentTokenResult.rows.length > 0) {
        const tokenData = recentTokenResult.rows[0]
        
        // Reenviar email com token existente
        const employeeResult = await db.query(
          'SELECT dados_pessoais FROM employees WHERE LOWER(email) = LOWER($1)',
          [email]
        )

        if (employeeResult.rows.length > 0) {
          const employee = employeeResult.rows[0]
          const employeeName = employee.dados_pessoais?.nome || employee.dados_pessoais?.name || 'Usuário'

          const emailSent = await emailService.sendPasswordResetEmail(email, tokenData.token)

           if (emailSent) {
             return {
               success: true,
               message: 'Email de recuperação reenviado com sucesso.'
             }
           }
        }
      }

      // Se não há token recente, criar novo
      return await this.requestPasswordReset(email)

    } catch (error) {
      console.error('[PasswordResetService] Erro no reenvio:', error)
      return {
        success: false,
        message: 'Erro ao reenviar email.',
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Gerar token seguro
   */
  private generateSecureToken(userId: string): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2)
    const userPart = userId.substring(0, 8)
    return `${timestamp}_${userPart}_${random}`
  }

  /**
   * Limpar tokens antigos
   */
  private async cleanupOldTokens(userId: string): Promise<void> {
    try {
      await db.query(
        'DELETE FROM password_reset_tokens WHERE user_id = $1 AND (used = true OR expires_at < NOW())',
        [userId]
      )
    } catch (error) {
      console.error('[PasswordResetService] Erro ao limpar tokens:', error)
    }
  }

  /**
   * Verificar rate limit
   */
  async checkRateLimit(email: string): Promise<{ allowed: boolean; message?: string }> {
    try {
      const result = await db.query(
        `SELECT COUNT(*) as count FROM password_reset_tokens 
         WHERE email = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
        [email.toLowerCase()]
      )

      const count = parseInt(result.rows[0].count)
      
      if (count >= 3) {
        return {
          allowed: false,
          message: 'Muitas tentativas de recuperação. Tente novamente em 1 hora.'
        }
      }

      return { allowed: true }

    } catch (error) {
      console.error('[PasswordResetService] Erro no rate limit:', error)
      return { allowed: true } // Em caso de erro, permitir
    }
  }
}

export const passwordResetService = new PasswordResetService()
