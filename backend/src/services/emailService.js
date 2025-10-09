import nodemailer from 'nodemailer';
import { config, isDevelopment } from '../config/environment.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Inicializa o transportador de email
   */
  initializeTransporter() {
    try {
      // Configuração do transportador baseada no serviço
      const transportConfig = {
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure, // true para 465, false para outras portas
        auth: {
          user: config.email.user,
          pass: config.email.password
        }
      };

      // Se for Gmail, usar configuração específica
      if (config.email.service === 'gmail') {
        transportConfig.service = 'gmail';
      }

      this.transporter = nodemailer.createTransport(transportConfig);

      // Verificar conexão apenas em desenvolvimento
      if (isDevelopment()) {
        this.verifyConnection();
      }
    } catch (error) {
      console.error('Erro ao inicializar serviço de email:', error);
      throw new Error('Falha na configuração do serviço de email');
    }
  }

  /**
   * Verifica a conexão com o servidor de email
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Conexão com servidor de email verificada com sucesso');
    } catch (error) {
      console.error('❌ Erro na verificação da conexão de email:', error);
      if (isDevelopment()) {
        console.warn('⚠️ Continuando em modo desenvolvimento sem email');
      }
    }
  }

  /**
   * Envia email de reset de senha
   * @param {string} email - Email do destinatário
   * @param {string} resetToken - Token de reset
   * @param {string} userName - Nome do usuário
   */
  async sendPasswordResetEmail(email, resetToken, userName = '') {
    try {
      const resetUrl = `${config.frontend.passwordResetUrl}?token=${resetToken}`;
      
      const mailOptions = {
        from: {
          name: config.email.fromName,
          address: config.email.fromAddress
        },
        to: email,
        subject: 'Reset de Senha - AppMedStaff',
        html: this.generatePasswordResetTemplate(resetUrl, userName),
        text: this.generatePasswordResetTextTemplate(resetUrl, userName)
      };

      // Em desenvolvimento, apenas log o email
      if (isDevelopment() && !this.transporter) {
        console.log('📧 [DEV] Email de reset de senha:');
        console.log(`Para: ${email}`);
        console.log(`URL de reset: ${resetUrl}`);
        console.log(`Token: ${resetToken}`);
        return { success: true, messageId: 'dev-mode' };
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de reset enviado para ${email}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Erro ao enviar email de reset:', error);
      throw new Error('Falha ao enviar email de reset de senha');
    }
  }

  /**
   * Envia email de boas-vindas
   * @param {string} email - Email do destinatário
   * @param {string} userName - Nome do usuário
   * @param {string} userRole - Papel do usuário
   */
  async sendWelcomeEmail(email, userName, userRole) {
    try {
      const mailOptions = {
        from: {
          name: config.email.fromName,
          address: config.email.fromAddress
        },
        to: email,
        subject: 'Bem-vindo ao AppMedStaff!',
        html: this.generateWelcomeTemplate(userName, userRole),
        text: this.generateWelcomeTextTemplate(userName, userRole)
      };

      // Em desenvolvimento, apenas log o email
      if (isDevelopment() && !this.transporter) {
        console.log('📧 [DEV] Email de boas-vindas:');
        console.log(`Para: ${email}`);
        console.log(`Nome: ${userName}`);
        console.log(`Papel: ${userRole}`);
        return { success: true, messageId: 'dev-mode' };
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de boas-vindas enviado para ${email}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      // Não falha o registro se o email não for enviado
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envia notificação de login suspeito
   * @param {string} email - Email do destinatário
   * @param {string} userName - Nome do usuário
   * @param {Object} loginInfo - Informações do login
   */
  async sendSuspiciousLoginNotification(email, userName, loginInfo) {
    try {
      const mailOptions = {
        from: {
          name: config.email.fromName,
          address: config.email.fromAddress
        },
        to: email,
        subject: 'Alerta de Segurança - AppMedStaff',
        html: this.generateSuspiciousLoginTemplate(userName, loginInfo),
        text: this.generateSuspiciousLoginTextTemplate(userName, loginInfo)
      };

      // Em desenvolvimento, apenas log o email
      if (isDevelopment() && !this.transporter) {
        console.log('📧 [DEV] Notificação de login suspeito:');
        console.log(`Para: ${email}`);
        console.log(`Info:`, loginInfo);
        return { success: true, messageId: 'dev-mode' };
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Notificação de segurança enviada para ${email}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Erro ao enviar notificação de segurança:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Template HTML para reset de senha
   */
  generatePasswordResetTemplate(resetUrl, userName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset de Senha - AppMedStaff</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AppMedStaff</h1>
          <p>Reset de Senha</p>
        </div>
        <div class="content">
          <h2>Olá${userName ? `, ${userName}` : ''}!</h2>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no AppMedStaff.</p>
          <p>Para criar uma nova senha, clique no botão abaixo:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Redefinir Senha</a>
          </p>
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Este link expira em 1 hora</li>
              <li>Se você não solicitou este reset, ignore este email</li>
              <li>Nunca compartilhe este link com outras pessoas</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>Este é um email automático, não responda.</p>
          <p>© 2024 AppMedStaff. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Template texto para reset de senha
   */
  generatePasswordResetTextTemplate(resetUrl, userName) {
    return `
AppMedStaff - Reset de Senha

Olá${userName ? `, ${userName}` : ''}!

Recebemos uma solicitação para redefinir a senha da sua conta no AppMedStaff.

Para criar uma nova senha, acesse o link abaixo:
${resetUrl}

IMPORTANTE:
- Este link expira em 1 hora
- Se você não solicitou este reset, ignore este email
- Nunca compartilhe este link com outras pessoas

Este é um email automático, não responda.
© 2024 AppMedStaff. Todos os direitos reservados.
    `;
  }

  /**
   * Template HTML para boas-vindas
   */
  generateWelcomeTemplate(userName, userRole) {
    const roleNames = {
      medico: 'Médico',
      enfermeiro: 'Enfermeiro',
      admin: 'Administrador',
      recepcionista: 'Recepcionista'
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo ao AppMedStaff</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Bem-vindo ao AppMedStaff!</h1>
        </div>
        <div class="content">
          <h2>Olá, ${userName}!</h2>
          <p>É um prazer tê-lo(a) conosco como <strong>${roleNames[userRole] || userRole}</strong>.</p>
          <p>Sua conta foi criada com sucesso e você já pode começar a usar todas as funcionalidades do AppMedStaff.</p>
          
          <div class="features">
            <h3>🚀 Próximos passos:</h3>
            <ul>
              <li>Complete seu perfil com informações adicionais</li>
              <li>Explore o painel de controle</li>
              <li>Configure suas preferências</li>
              <li>Entre em contato com nossa equipe se precisar de ajuda</li>
            </ul>
          </div>

          <p style="text-align: center;">
            <a href="${config.frontend.url}" class="button">Acessar AppMedStaff</a>
          </p>
        </div>
        <div class="footer">
          <p>Se você tiver dúvidas, nossa equipe está aqui para ajudar!</p>
          <p>© 2024 AppMedStaff. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Template texto para boas-vindas
   */
  generateWelcomeTextTemplate(userName, userRole) {
    const roleNames = {
      medico: 'Médico',
      enfermeiro: 'Enfermeiro',
      admin: 'Administrador',
      recepcionista: 'Recepcionista'
    };

    return `
AppMedStaff - Bem-vindo!

Olá, ${userName}!

É um prazer tê-lo(a) conosco como ${roleNames[userRole] || userRole}.

Sua conta foi criada com sucesso e você já pode começar a usar todas as funcionalidades do AppMedStaff.

Próximos passos:
- Complete seu perfil com informações adicionais
- Explore o painel de controle
- Configure suas preferências
- Entre em contato com nossa equipe se precisar de ajuda

Acesse: ${config.frontend.url}

Se você tiver dúvidas, nossa equipe está aqui para ajudar!
© 2024 AppMedStaff. Todos os direitos reservados.
    `;
  }

  /**
   * Template HTML para login suspeito
   */
  generateSuspiciousLoginTemplate(userName, loginInfo) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Alerta de Segurança - AppMedStaff</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9fafb; }
        .alert { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .info { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Alerta de Segurança</h1>
          <p>AppMedStaff</p>
        </div>
        <div class="content">
          <h2>Olá, ${userName}!</h2>
          <p>Detectamos uma atividade de login suspeita em sua conta.</p>
          
          <div class="info">
            <h3>📍 Detalhes do Login:</h3>
            <ul>
              <li><strong>Data/Hora:</strong> ${loginInfo.timestamp || 'Não disponível'}</li>
              <li><strong>IP:</strong> ${loginInfo.ip || 'Não disponível'}</li>
              <li><strong>Localização:</strong> ${loginInfo.location || 'Não disponível'}</li>
              <li><strong>Dispositivo:</strong> ${loginInfo.userAgent || 'Não disponível'}</li>
            </ul>
          </div>

          <div class="alert">
            <h3>🔒 Se não foi você:</h3>
            <ul>
              <li>Altere sua senha imediatamente</li>
              <li>Verifique se há atividades suspeitas em sua conta</li>
              <li>Entre em contato com nossa equipe de suporte</li>
              <li>Considere ativar autenticação de dois fatores</li>
            </ul>
          </div>

          <p>Se você reconhece esta atividade, pode ignorar este email.</p>
        </div>
        <div class="footer">
          <p>Este é um email automático de segurança.</p>
          <p>© 2024 AppMedStaff. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Template texto para login suspeito
   */
  generateSuspiciousLoginTextTemplate(userName, loginInfo) {
    return `
AppMedStaff - Alerta de Segurança

Olá, ${userName}!

Detectamos uma atividade de login suspeita em sua conta.

Detalhes do Login:
- Data/Hora: ${loginInfo.timestamp || 'Não disponível'}
- IP: ${loginInfo.ip || 'Não disponível'}
- Localização: ${loginInfo.location || 'Não disponível'}
- Dispositivo: ${loginInfo.userAgent || 'Não disponível'}

Se não foi você:
- Altere sua senha imediatamente
- Verifique se há atividades suspeitas em sua conta
- Entre em contato com nossa equipe de suporte
- Considere ativar autenticação de dois fatores

Se você reconhece esta atividade, pode ignorar este email.

Este é um email automático de segurança.
© 2024 AppMedStaff. Todos os direitos reservados.
    `;
  }

  /**
   * Envia email de confirmação quando 2FA é habilitado
   */
  async sendTwoFactorEnabledEmail(email, userName, backupCodes) {
    try {
      const subject = 'Autenticação de Dois Fatores Habilitada - AppMedStaff';
      const htmlContent = this.generateTwoFactorEnabledTemplate(userName, backupCodes);
      const textContent = this.generateTwoFactorEnabledTextTemplate(userName, backupCodes);

      const mailOptions = {
        from: {
          name: config.email.fromName,
          address: config.email.fromAddress
        },
        to: email,
        subject: subject,
        html: htmlContent,
        text: textContent
      };

      // Em desenvolvimento, apenas log o email
      if (isDevelopment() && !this.transporter) {
        console.log('📧 [DEV] Email de 2FA habilitado:');
        console.log(`Para: ${email}`);
        console.log(`Códigos de backup: ${backupCodes.length} códigos`);
        return { success: true, messageId: 'dev-mode' };
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de 2FA habilitado enviado para ${email}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Erro ao enviar email de 2FA habilitado:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envia email de confirmação quando 2FA é desabilitado
   */
  async sendTwoFactorDisabledEmail(email, userName) {
    try {
      const subject = 'Autenticação de Dois Fatores Desabilitada - AppMedStaff';
      const htmlContent = this.generateTwoFactorDisabledTemplate(userName);
      const textContent = this.generateTwoFactorDisabledTextTemplate(userName);

      const mailOptions = {
        from: {
          name: config.email.fromName,
          address: config.email.fromAddress
        },
        to: email,
        subject: subject,
        html: htmlContent,
        text: textContent
      };

      // Em desenvolvimento, apenas log o email
      if (isDevelopment() && !this.transporter) {
        console.log('📧 [DEV] Email de 2FA desabilitado:');
        console.log(`Para: ${email}`);
        return { success: true, messageId: 'dev-mode' };
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de 2FA desabilitado enviado para ${email}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Erro ao enviar email de 2FA desabilitado:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Template HTML para 2FA habilitado
   */
  generateTwoFactorEnabledTemplate(userName, backupCodes) {
    const backupCodesHtml = backupCodes.map(code => `<li><code>${code}</code></li>`).join('');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>2FA Habilitado - AppMedStaff</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9fafb; }
        .success { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .backup-codes { background: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .backup-codes ul { list-style: none; padding: 0; }
        .backup-codes li { margin: 5px 0; }
        .backup-codes code { background: #e5e7eb; padding: 5px 10px; border-radius: 3px; font-family: monospace; }
        .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 AppMedStaff</h1>
          <p>Autenticação de Dois Fatores</p>
        </div>
        <div class="content">
          <h2>Olá${userName ? `, ${userName}` : ''}!</h2>
          <div class="success">
            <strong>✅ Sucesso!</strong> A autenticação de dois fatores foi habilitada na sua conta.
          </div>
          <p>Sua conta agora está mais segura com uma camada adicional de proteção.</p>
          
          <h3>📱 Códigos de Backup</h3>
          <p>Guarde estes códigos de backup em um local seguro. Você pode usá-los para acessar sua conta caso perca acesso ao seu aplicativo autenticador:</p>
          
          <div class="backup-codes">
            <ul>
              ${backupCodesHtml}
            </ul>
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Cada código só pode ser usado uma vez</li>
              <li>Guarde-os em um local seguro e offline</li>
              <li>Não compartilhe estes códigos com ninguém</li>
              <li>Você pode gerar novos códigos a qualquer momento nas configurações</li>
            </ul>
          </div>
          
          <h3>🔒 Próximos Passos</h3>
          <p>A partir de agora, você precisará inserir um código do seu aplicativo autenticador sempre que fizer login.</p>
        </div>
        <div class="footer">
          <p>Este é um email automático, não responda.</p>
          <p>© 2024 AppMedStaff. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Template texto para 2FA habilitado
   */
  generateTwoFactorEnabledTextTemplate(userName, backupCodes) {
    const backupCodesText = backupCodes.map(code => `- ${code}`).join('\n');
    
    return `
AppMedStaff - Autenticação de Dois Fatores Habilitada

Olá${userName ? `, ${userName}` : ''}!

✅ Sucesso! A autenticação de dois fatores foi habilitada na sua conta.

Sua conta agora está mais segura com uma camada adicional de proteção.

📱 CÓDIGOS DE BACKUP
Guarde estes códigos em um local seguro:

${backupCodesText}

⚠️ IMPORTANTE:
- Cada código só pode ser usado uma vez
- Guarde-os em um local seguro e offline
- Não compartilhe estes códigos com ninguém
- Você pode gerar novos códigos a qualquer momento

🔒 PRÓXIMOS PASSOS
A partir de agora, você precisará inserir um código do seu aplicativo autenticador sempre que fizer login.

Este é um email automático, não responda.
© 2024 AppMedStaff. Todos os direitos reservados.
    `;
  }

  /**
   * Template HTML para 2FA desabilitado
   */
  generateTwoFactorDisabledTemplate(userName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>2FA Desabilitado - AppMedStaff</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9fafb; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔓 AppMedStaff</h1>
          <p>Autenticação de Dois Fatores</p>
        </div>
        <div class="content">
          <h2>Olá${userName ? `, ${userName}` : ''}!</h2>
          <div class="warning">
            <strong>⚠️ Atenção!</strong> A autenticação de dois fatores foi desabilitada na sua conta.
          </div>
          <p>Sua conta agora usa apenas senha para autenticação.</p>
          
          <h3>🔒 Recomendações de Segurança</h3>
          <ul>
            <li>Considere reabilitar o 2FA para maior segurança</li>
            <li>Use uma senha forte e única</li>
            <li>Monitore sua conta regularmente</li>
            <li>Entre em contato conosco se não foi você quem desabilitou o 2FA</li>
          </ul>
          
          <p>Se você não fez esta alteração, entre em contato conosco imediatamente.</p>
        </div>
        <div class="footer">
          <p>Este é um email automático, não responda.</p>
          <p>© 2024 AppMedStaff. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Template texto para 2FA desabilitado
   */
  generateTwoFactorDisabledTextTemplate(userName) {
    return `
AppMedStaff - Autenticação de Dois Fatores Desabilitada

Olá${userName ? `, ${userName}` : ''}!

⚠️ ATENÇÃO! A autenticação de dois fatores foi desabilitada na sua conta.

Sua conta agora usa apenas senha para autenticação.

🔒 RECOMENDAÇÕES DE SEGURANÇA:
- Considere reabilitar o 2FA para maior segurança
- Use uma senha forte e única
- Monitore sua conta regularmente
- Entre em contato conosco se não foi você quem desabilitou o 2FA

Se você não fez esta alteração, entre em contato conosco imediatamente.

Este é um email automático, não responda.
© 2024 AppMedStaff. Todos os direitos reservados.
    `;
  }

  /**
   * Envia alerta de segurança para administradores
   * @param {string} email - Email do destinatário
   * @param {string} subject - Assunto do email
   * @param {string} message - Mensagem do alerta
   * @param {Object} alertData - Dados do alerta
   */
  async sendSecurityAlert(email, subject, message, alertData) {
    try {
      const mailOptions = {
        from: {
          name: config.email.fromName,
          address: config.email.fromAddress
        },
        to: email,
        subject: subject,
        html: this.generateSecurityAlertTemplate(message, alertData),
        text: this.generateSecurityAlertTextTemplate(message, alertData)
      };

      // Em desenvolvimento, apenas log o email
      if (isDevelopment() && !this.transporter) {
        console.log('📧 [DEV] Alerta de segurança:');
        console.log(`Para: ${email}`);
        console.log(`Assunto: ${subject}`);
        console.log(`Tipo: ${alertData.type}`);
        console.log(`Severidade: ${alertData.severity}`);
        return { success: true, messageId: 'dev-mode' };
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Alerta de segurança enviado para ${email}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Erro ao enviar alerta de segurança:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Template HTML para alertas de segurança
   */
  generateSecurityAlertTemplate(message, alertData) {
    const severityColors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };

    const severityIcons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Alerta de Segurança - AppMedStaff</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .alert-box { background: #f8f9fa; border-left: 5px solid ${severityColors[alertData.severity]}; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .severity { display: inline-block; background: ${severityColors[alertData.severity]}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .details h3 { margin-top: 0; color: #495057; }
        .details ul { margin: 0; padding-left: 20px; }
        .details li { margin: 5px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        .timestamp { color: #6c757d; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Alerta de Segurança</h1>
          <p>AppMedStaff - Sistema de Monitoramento</p>
        </div>
        <div class="content">
          <div class="alert-box">
            <h2>${severityIcons[alertData.severity]} ${alertData.type}</h2>
            <span class="severity">${alertData.severity}</span>
            <p class="timestamp">Detectado em: ${new Date(alertData.timestamp).toLocaleString('pt-BR')}</p>
          </div>
          
          <div class="details">
            <h3>📋 Detalhes do Alerta</h3>
            <p>${message}</p>
            
            ${alertData.endpoint ? `<p><strong>Endpoint:</strong> ${alertData.endpoint}</p>` : ''}
            ${alertData.ip ? `<p><strong>IP:</strong> ${alertData.ip}</p>` : ''}
            ${alertData.userAgent ? `<p><strong>User Agent:</strong> ${alertData.userAgent}</p>` : ''}
            ${alertData.userId ? `<p><strong>Usuário ID:</strong> ${alertData.userId}</p>` : ''}
            ${alertData.count ? `<p><strong>Ocorrências:</strong> ${alertData.count}</p>` : ''}
            ${alertData.duration ? `<p><strong>Duração:</strong> ${alertData.duration}ms</p>` : ''}
          </div>

          <div class="details">
            <h3>🔧 Ações Recomendadas</h3>
            <ul>
              <li>Verifique os logs do sistema para mais detalhes</li>
              <li>Analise o padrão de atividade suspeita</li>
              <li>Considere implementar medidas de segurança adicionais</li>
              <li>Monitore a situação nas próximas horas</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>Este é um alerta automático do sistema de monitoramento.</p>
          <p>© 2024 AppMedStaff. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Template texto para alertas de segurança
   */
  generateSecurityAlertTextTemplate(message, alertData) {
    return `
AppMedStaff - Alerta de Segurança

🚨 ALERTA DE SEGURANÇA DETECTADO

Tipo: ${alertData.type}
Severidade: ${alertData.severity.toUpperCase()}
Detectado em: ${new Date(alertData.timestamp).toLocaleString('pt-BR')}

DETALHES:
${message}

${alertData.endpoint ? `Endpoint: ${alertData.endpoint}` : ''}
${alertData.ip ? `IP: ${alertData.ip}` : ''}
${alertData.userAgent ? `User Agent: ${alertData.userAgent}` : ''}
${alertData.userId ? `Usuário ID: ${alertData.userId}` : ''}
${alertData.count ? `Ocorrências: ${alertData.count}` : ''}
${alertData.duration ? `Duração: ${alertData.duration}ms` : ''}

AÇÕES RECOMENDADAS:
- Verifique os logs do sistema para mais detalhes
- Analise o padrão de atividade suspeita
- Considere implementar medidas de segurança adicionais
- Monitore a situação nas próximas horas

Este é um alerta automático do sistema de monitoramento.
© 2024 AppMedStaff. Todos os direitos reservados.
    `;
  }
}

// Instância singleton
const emailService = new EmailService();

export default emailService;