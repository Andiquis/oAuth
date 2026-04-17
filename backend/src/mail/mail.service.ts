import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: this.configService.get<boolean>('mail.secure'),
      auth: {
        user: this.configService.get<string>('mail.auth.user'),
        pass: this.configService.get<string>('mail.auth.pass'),
      },
    });
  }

  async sendVerificationEmail(email: string, nombre: string, code: string) {
    try {
      const mailOptions = {
        from: this.configService.get<string>('mail.from'),
        to: email,
        subject: '🔐 Código de Verificación - RosaNegra',
        html: this.getVerificationEmailTemplate(nombre, code),
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de verificación enviado a ${email}`);
      return result;
    } catch (error) {
      this.logger.error(`Error al enviar email a ${email}:`, error);
      throw new Error('Error al enviar email de verificación');
    }
  }

  private getVerificationEmailTemplate(nombre: string, code: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Email</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .content h2 {
            color: #333;
            margin-bottom: 20px;
          }
          .content p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .code-box {
            background-color: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
          }
          .code {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .expiration {
            color: #e74c3c;
            font-size: 14px;
            margin-top: 20px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌹 RosaNegra</h1>
            <p style="margin: 10px 0 0 0;">Sistema de Asistencia</p>
          </div>
          <div class="content">
            <h2>¡Hola ${nombre}! 👋</h2>
            <p>
              Gracias por registrarte en <strong>RosaNegra</strong>.<br>
              Para completar tu registro, utiliza el siguiente código de verificación:
            </p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p class="expiration">
              ⏰ Este código expirará en <strong>10 minutos</strong>
            </p>
            <p style="font-size: 14px; color: #999; margin-top: 30px;">
              Si no solicitaste este registro, puedes ignorar este correo.
            </p>
          </div>
          <div class="footer">
            <p>
              © ${new Date().getFullYear()} RosaNegra. Todos los derechos reservados.<br>
              <a href="${this.configService.get<string>('FRONTEND_URL')}">Visitar sitio web</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(email: string, nombre: string) {
    try {
      const mailOptions = {
        from: this.configService.get<string>('mail.from'),
        to: email,
        subject: '🎉 ¡Bienvenido a RosaNegra!',
        html: this.getWelcomeEmailTemplate(nombre),
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de bienvenida enviado a ${email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error al enviar email de bienvenida a ${email}:`,
        error,
      );
      // No lanzamos error aquí para no interrumpir el flujo principal
    }
  }

  private getWelcomeEmailTemplate(nombre: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            padding: 30px;
            text-align: center;
            color: white;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .content h2 {
            color: #333;
          }
          .content p {
            color: #666;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            padding: 15px 40px;
            background-color: #11998e;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Bienvenido a RosaNegra!</h1>
          </div>
          <div class="content">
            <h2>¡Hola ${nombre}!</h2>
            <p>
              Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todas las funcionalidades del sistema.
            </p>
            <p>
              Estamos emocionados de tenerte con nosotros. 🚀
            </p>
            <a href="${this.configService.get<string>('FRONTEND_URL')}/login" class="button">
              Iniciar Sesión
            </a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} RosaNegra. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Enviar email de solicitud de administrador a superadmin
   */
  async sendAdminApprovalRequest(
    superAdminEmail: string,
    solicitante: {
      nombre: string;
      email: string;
      telefono: string | null;
      mensaje: string | null;
      fechaSolicitud: Date;
    },
    tokenAprobacion: string,
    frontendUrl: string,
  ) {
    try {
      const mailOptions = {
        from: this.configService.get<string>('mail.from'),
        to: superAdminEmail,
        subject: '🔔 Nueva Solicitud de Administrador - RosaNegra',
        html: this.getAdminApprovalRequestTemplate(
          solicitante,
          tokenAprobacion,
          frontendUrl,
        ),
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email de solicitud de admin enviado a ${superAdminEmail}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error al enviar email de solicitud a ${superAdminEmail}:`,
        error,
      );
      throw new Error('Error al enviar email de solicitud de administrador');
    }
  }

  private getAdminApprovalRequestTemplate(
    solicitante: {
      nombre: string;
      email: string;
      telefono: string | null;
      mensaje: string | null;
      fechaSolicitud: Date;
    },
    tokenAprobacion: string,
    frontendUrl: string,
  ): string {
    // Usar los endpoints públicos del backend que redirigen al frontend con validación de sesión
    const backendUrl = this.configService.get<string>(
      'BACKEND_URL',
      'http://localhost:3000',
    );
    const approveUrl = `${backendUrl}/admin/approve-link/${tokenAprobacion}`;
    const rejectUrl = `${backendUrl}/admin/reject-link/${tokenAprobacion}`;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Solicitud de Administrador</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #333;
            margin-bottom: 20px;
          }
          .content p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
          }
          .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #f5576c;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-box .label {
            font-weight: bold;
            color: #333;
            display: inline-block;
            min-width: 100px;
          }
          .info-box .value {
            color: #666;
          }
          .message-box {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
          }
          .message-box .label {
            font-weight: bold;
            color: #856404;
            margin-bottom: 10px;
          }
          .message-box .text {
            color: #856404;
            font-style: italic;
          }
          .buttons {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            margin: 10px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
          }
          .button-approve {
            background-color: #28a745;
            color: white;
          }
          .button-approve:hover {
            background-color: #218838;
          }
          .button-reject {
            background-color: #dc3545;
            color: white;
          }
          .button-reject:hover {
            background-color: #c82333;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
            font-size: 14px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Nueva Solicitud de Administrador</h1>
          </div>
          <div class="content">
            <h2>Solicitud Pendiente de Aprobación</h2>
            <p>
              Se ha recibido una nueva solicitud para convertirse en administrador del sistema.
              Por favor, revisa la información y toma una decisión.
            </p>

            <div class="info-box">
              <div><span class="label">Nombre:</span> <span class="value">${solicitante.nombre}</span></div>
              <div><span class="label">Email:</span> <span class="value">${solicitante.email}</span></div>
              <div><span class="label">Teléfono:</span> <span class="value">${solicitante.telefono || 'No proporcionado'}</span></div>
              <div><span class="label">Fecha:</span> <span class="value">${new Date(solicitante.fechaSolicitud).toLocaleString('es-PE')}</span></div>
            </div>

            ${
              solicitante.mensaje
                ? `
            <div class="message-box">
              <div class="label">📝 Mensaje del solicitante:</div>
              <div class="text">${solicitante.mensaje}</div>
            </div>
            `
                : ''
            }

            <div class="buttons">
              <a href="${approveUrl}" class="button button-approve">✅ Aprobar Solicitud</a>
              <a href="${rejectUrl}" class="button button-reject">❌ Rechazar Solicitud</a>
            </div>

            <div class="warning">
              ⚠️ <strong>Importante:</strong> Esta solicitud expirará en 7 días si no se toma una decisión.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} RosaNegra. Todos los derechos reservados.</p>
            <p>Este es un email automático, por favor no responder.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
