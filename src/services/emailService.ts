import { Resend } from 'resend'

// Configuração do Resend
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY)

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  /**
   * Enviar email de recuperação de senha
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
      const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`
      
      const emailData: EmailTemplate = {
        to: email,
        subject: '🔐 Recuperação de Senha - MedStaff',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperação de Senha</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
              .button:hover { background: #5a6fd8; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Recuperação de Senha</h1>
                <p>MedStaff - Sistema de Gestão</p>
              </div>
              <div class="content">
                <h2>Olá!</h2>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no MedStaff.</p>
                
                <p>Para criar uma nova senha, clique no botão abaixo:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Redefinir Minha Senha</a>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Importante:</strong>
                  <ul>
                    <li>Este link expira em 1 hora</li>
                    <li>Se você não solicitou esta recuperação, ignore este email</li>
                    <li>Não compartilhe este link com ninguém</li>
                  </ul>
                </div>
                
                <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
                <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">${resetUrl}</p>
              </div>
              <div class="footer">
                <p>Este é um email automático, não responda.</p>
                <p>© 2024 MedStaff. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Recuperação de Senha - MedStaff
          
          Olá!
          
          Recebemos uma solicitação para redefinir a senha da sua conta no MedStaff.
          
          Para criar uma nova senha, acesse: ${resetUrl}
          
          IMPORTANTE:
          - Este link expira em 1 hora
          - Se você não solicitou esta recuperação, ignore este email
          - Não compartilhe este link com ninguém
          
          © 2024 MedStaff. Todos os direitos reservados.
        `
      }

      const { data, error } = await resend.emails.send({
        from: 'MedStaff <onboarding@resend.dev>',
        to: [email],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      })

      if (error) {
        console.error('Erro ao enviar email de recuperação:', error)
        return false
      }

      console.log('Email de recuperação enviado:', data)
      return true
    } catch (error) {
      console.error('Erro no serviço de email:', error)
      return false
    }
  }

  /**
   * Enviar email de boas-vindas
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const emailData: EmailTemplate = {
        to: email,
        subject: '🎉 Bem-vindo ao MedStaff!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bem-vindo ao MedStaff</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
              .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
              .feature { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Bem-vindo ao MedStaff!</h1>
                <p>Sistema de Gestão Empresarial</p>
              </div>
              <div class="content">
                <h2>Olá, ${name}!</h2>
                <p>Sua conta foi criada com sucesso no MedStaff. Estamos muito felizes em tê-lo conosco!</p>
                
                <div class="features">
                  <div class="feature">
                    <h3>📊 Dashboard</h3>
                    <p>Acompanhe métricas e indicadores em tempo real</p>
                  </div>
                  <div class="feature">
                    <h3>📋 Tarefas</h3>
                    <p>Gerencie projetos e atividades da equipe</p>
                  </div>
                  <div class="feature">
                    <h3>👥 CRM</h3>
                    <p>Gerencie relacionamento com clientes</p>
                  </div>
                  <div class="feature">
                    <h3>💰 Financeiro</h3>
                    <p>Controle receitas, despesas e relatórios</p>
                  </div>
                </div>
                
                <div style="text-align: center;">
                  <a href="${window.location.origin}/dashboard" class="button">Acessar Dashboard</a>
                </div>
                
                <p>Se você tiver alguma dúvida, nossa equipe de suporte está sempre disponível para ajudar.</p>
              </div>
              <div class="footer">
                <p>Este é um email automático, não responda.</p>
                <p>© 2024 MedStaff. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `
      }

      const { data, error } = await resend.emails.send({
        from: 'MedStaff <onboarding@resend.dev>',
        to: [email],
        subject: emailData.subject,
        html: emailData.html
      })

      if (error) {
        console.error('Erro ao enviar email de boas-vindas:', error)
        return false
      }

      console.log('Email de boas-vindas enviado:', data)
      return true
    } catch (error) {
      console.error('Erro no serviço de email:', error)
      return false
    }
  }

  /**
   * Enviar email de notificação
   */
  async sendNotificationEmail(email: string, title: string, message: string, actionUrl?: string): Promise<boolean> {
    try {
      const emailData: EmailTemplate = {
        to: email,
        subject: `🔔 ${title} - MedStaff`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Notificação - MedStaff</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 Notificação</h1>
                <p>MedStaff - Sistema de Gestão</p>
              </div>
              <div class="content">
                <h2>${title}</h2>
                <p>${message}</p>
                
                ${actionUrl ? `
                  <div style="text-align: center;">
                    <a href="${actionUrl}" class="button">Ver Detalhes</a>
                  </div>
                ` : ''}
              </div>
              <div class="footer">
                <p>Este é um email automático, não responda.</p>
                <p>© 2024 MedStaff. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `
      }

      const { data, error } = await resend.emails.send({
        from: 'MedStaff <onboarding@resend.dev>',
        to: [email],
        subject: emailData.subject,
        html: emailData.html
      })

      if (error) {
        console.error('Erro ao enviar email de notificação:', error)
        return false
      }

      console.log('Email de notificação enviado:', data)
      return true
    } catch (error) {
      console.error('Erro no serviço de email:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
