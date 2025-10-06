import { supabase } from '../config/supabase'
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

      // 1. Verificar se o email existe no banco
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name, role')
        .eq('email', email.toLowerCase())
        .single()

      if (profileError || !profile) {
        console.log('[PasswordResetService] Email não encontrado:', email)
        return {
          success: false,
          message: 'Email não encontrado em nossa base de dados.',
          error: 'EMAIL_NOT_FOUND'
        }
      }

      console.log('[PasswordResetService] Perfil encontrado:', profile.name)

      // 2. Gerar token de recuperação seguro
      const resetToken = this.generateSecureToken(profile.id)
      
      // 3. Salvar token no banco (tabela password_reset_tokens)
      const { error: tokenError } = await supabase
        .from('password_reset_tokens')
        .upsert({
          user_id: profile.id,
          token: resetToken,
          email: email.toLowerCase(),
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
          used: false,
          created_at: new Date().toISOString()
        })

      if (tokenError) {
        console.error('[PasswordResetService] Erro ao salvar token:', tokenError)
        return {
          success: false,
          message: 'Erro interno. Tente novamente.',
          error: 'TOKEN_SAVE_ERROR'
        }
      }

      // 4. Enviar email de recuperação
      const emailSent = await emailService.sendPasswordResetEmail(email, resetToken)
      
      if (!emailSent) {
        console.error('[PasswordResetService] Erro ao enviar email')
        return {
          success: false,
          message: 'Erro ao enviar email. Tente novamente.',
          error: 'EMAIL_SEND_ERROR'
        }
      }

      console.log('[PasswordResetService] Email enviado com sucesso para:', email)
      
      return {
        success: true,
        message: 'Email de recuperação enviado! Verifique sua caixa de entrada.'
      }

    } catch (error) {
      console.error('[PasswordResetService] Erro geral:', error)
      return {
        success: false,
        message: 'Erro interno. Tente novamente.',
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Validar token de recuperação
   */
  async validateResetToken(token: string): Promise<PasswordResetValidation> {
    try {
      console.log('[PasswordResetService] Validando token:', token.substring(0, 10) + '...')

      // Buscar token no banco
      const { data: tokenData, error } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single()

      if (error || !tokenData) {
        console.log('[PasswordResetService] Token não encontrado ou já usado')
        return {
          valid: false,
          message: 'Token inválido ou já utilizado.'
        }
      }

      // Verificar se não expirou
      const now = new Date()
      const expiresAt = new Date(tokenData.expires_at)
      
      if (now > expiresAt) {
        console.log('[PasswordResetService] Token expirado')
        return {
          valid: false,
          message: 'Token expirado. Solicite um novo link de recuperação.'
        }
      }

      console.log('[PasswordResetService] Token válido para usuário:', tokenData.user_id)
      
      return {
        valid: true,
        message: 'Token válido.',
        userId: tokenData.user_id
      }

    } catch (error) {
      console.error('[PasswordResetService] Erro ao validar token:', error)
      return {
        valid: false,
        message: 'Erro ao validar token.'
      }
    }
  }

  /**
   * Redefinir senha com token
   */
  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
    try {
      console.log('[PasswordResetService] Iniciando redefinição de senha')

      // 1. Validar token
      const validation = await this.validateResetToken(token)
      if (!validation.valid || !validation.userId) {
        return {
          success: false,
          message: validation.message,
          error: 'INVALID_TOKEN'
        }
      }

      // 2. Atualizar senha no Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        console.error('[PasswordResetService] Erro ao atualizar senha:', updateError)
        return {
          success: false,
          message: 'Erro ao redefinir senha. Tente novamente.',
          error: 'PASSWORD_UPDATE_ERROR'
        }
      }

      // 3. Marcar token como usado
      const { error: markUsedError } = await supabase
        .from('password_reset_tokens')
        .update({ 
          used: true,
          used_at: new Date().toISOString()
        })
        .eq('token', token)

      if (markUsedError) {
        console.error('[PasswordResetService] Erro ao marcar token como usado:', markUsedError)
        // Não falhar por isso, a senha já foi alterada
      }

      // 4. Limpar tokens antigos do usuário
      await this.cleanupOldTokens(validation.userId)

      console.log('[PasswordResetService] Senha redefinida com sucesso')
      
      return {
        success: true,
        message: 'Senha redefinida com sucesso!'
      }

    } catch (error) {
      console.error('[PasswordResetService] Erro ao redefinir senha:', error)
      return {
        success: false,
        message: 'Erro interno. Tente novamente.',
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Reenviar email de recuperação
   */
  async resendPasswordReset(email: string): Promise<PasswordResetResponse> {
    try {
      console.log('[PasswordResetService] Reenviando email para:', email)

      // Verificar se o email existe
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name')
        .eq('email', email.toLowerCase())
        .single()

      if (profileError || !profile) {
        return {
          success: false,
          message: 'Email não encontrado em nossa base de dados.',
          error: 'EMAIL_NOT_FOUND'
        }
      }

      // Invalidar tokens antigos
      await this.cleanupOldTokens(profile.id)

      // Gerar novo token
      const resetToken = this.generateSecureToken(profile.id)
      
      // Salvar novo token
      const { error: tokenError } = await supabase
        .from('password_reset_tokens')
        .upsert({
          user_id: profile.id,
          token: resetToken,
          email: email.toLowerCase(),
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          used: false,
          created_at: new Date().toISOString()
        })

      if (tokenError) {
        return {
          success: false,
          message: 'Erro interno. Tente novamente.',
          error: 'TOKEN_SAVE_ERROR'
        }
      }

      // Enviar email
      const emailSent = await emailService.sendPasswordResetEmail(email, resetToken)
      
      if (!emailSent) {
        return {
          success: false,
          message: 'Erro ao enviar email. Tente novamente.',
          error: 'EMAIL_SEND_ERROR'
        }
      }

      return {
        success: true,
        message: 'Email reenviado com sucesso!'
      }

    } catch (error) {
      console.error('[PasswordResetService] Erro ao reenviar email:', error)
      return {
        success: false,
        message: 'Erro interno. Tente novamente.',
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Gerar token seguro
   */
  private generateSecureToken(userId: string): string {
    const timestamp = Date.now()
    const randomBytes = crypto.getRandomValues(new Uint8Array(16))
    const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
    return btoa(`${userId}-${timestamp}-${randomString}`)
  }

  /**
   * Limpar tokens antigos do usuário
   */
  private async cleanupOldTokens(userId: string): Promise<void> {
    try {
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('user_id', userId)
        .eq('used', false)
    } catch (error) {
      console.error('[PasswordResetService] Erro ao limpar tokens antigos:', error)
    }
  }

  /**
   * Verificar se há tentativas excessivas (rate limiting)
   */
  async checkRateLimit(email: string): Promise<{ allowed: boolean; message?: string }> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      
      const { count } = await supabase
        .from('password_reset_tokens')
        .select('*', { count: 'exact', head: true })
        .eq('email', email.toLowerCase())
        .gte('created_at', oneHourAgo)

      // Máximo 3 tentativas por hora
      if (count && count >= 3) {
        return {
          allowed: false,
          message: 'Muitas tentativas. Aguarde 1 hora antes de tentar novamente.'
        }
      }

      return { allowed: true }
    } catch (error) {
      console.error('[PasswordResetService] Erro ao verificar rate limit:', error)
      return { allowed: true } // Em caso de erro, permitir
    }
  }
}

export const passwordResetService = new PasswordResetService()
