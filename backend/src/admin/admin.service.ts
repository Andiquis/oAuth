import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from '../users/entities/user.entity';
import { VerificationCode } from '../users/entities/verification-code.entity';
import { AdminApprovalRequest } from './entities/admin-approval-request.entity';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterAdminResponseDto } from './dto/register-admin-response.dto';
import { VerifyAdminEmailDto } from './dto/verify-admin-email.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(AdminApprovalRequest)
    private readonly adminApprovalRepository: Repository<AdminApprovalRequest>,
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Paso 1: Registrar solicitud de administrador
   * - Crea usuario inactivo
   * - Crea solicitud pendiente
   * - Genera y envía código de verificación al email del solicitante
   */
  async registerAdmin(
    registerAdminDto: RegisterAdminDto,
    ip?: string,
    userAgent?: string,
  ): Promise<RegisterAdminResponseDto> {
    const { email, password, nombre, telefono, fotoUrl, mensaje } =
      registerAdminDto;

    // Verificar si el email ya existe
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado en el sistema');
    }

    // Hash del password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario inactivo (activo = false) usando Object.assign
    const user = Object.assign(new User(), {
      nombre: nombre,
      email: email,
      password: hashedPassword,
      telefono: telefono || null,
      fotoUrl: fotoUrl || null,
      activo: false, // Usuario inactivo hasta que se apruebe
      emailVerificado: false, // Email no verificado aún
      ipRegistro: ip || null,
      userAgent: userAgent || null,
    });

    let savedUser: User;
    try {
      savedUser = await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Error al crear el usuario');
    }

    // Crear token de aprobación único
    const tokenAprobacion = randomUUID();

    // Crear solicitud de aprobación
    const queryRunner =
      this.adminApprovalRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.manager.query(
        `INSERT INTO t_solicitudes_admin 
        (id_usuario, token_aprobacion, mensaje_solicitante, estado, ip_solicitud, user_agent) 
        VALUES (?, ?, ?, 'pendiente', ?, ?)`,
        [
          savedUser.id,
          tokenAprobacion,
          mensaje || null,
          ip || null,
          userAgent || null,
        ],
      );

      await queryRunner.commitTransaction();

      const solicitudId = result.insertId.toString();

      // Generar código de verificación de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Calcular tiempo de expiración (10 minutos)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Eliminar códigos anteriores para este email
      await this.verificationCodeRepository.delete({ email });

      // Crear nuevo código de verificación
      const verificationCode = this.verificationCodeRepository.create({
        email,
        code,
        expiresAt,
        userId: savedUser.id,
      });

      await this.verificationCodeRepository.save(verificationCode);

      // Enviar código de verificación al solicitante
      try {
        await this.mailService.sendVerificationEmail(email, nombre, code);
      } catch (error) {
        console.error('Error al enviar email de verificación:', error);
        // No lanzar excepción, la solicitud ya está creada
      }

      // Retornar respuesta
      return {
        message:
          'Solicitud de administrador creada exitosamente. Se ha enviado un código de verificación a tu email.',
        solicitudId: solicitudId,
        email: savedUser.email,
        estado: 'pendiente',
        fechaSolicitud: new Date(),
        diasExpiracion: 7,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // Eliminar usuario si falla la solicitud
      await this.usersRepository.remove(savedUser);
      throw new InternalServerErrorException(
        'Error al crear la solicitud de aprobación',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Paso 2: Verificar email y notificar a superadmins
   * - Verifica el código enviado al email
   * - Marca el email como verificado
   * - Notifica a todos los superadmins para aprobación
   */
  async verifyAdminEmail(
    dto: VerifyAdminEmailDto,
  ): Promise<{ message: string; verified: boolean }> {
    const { email, code } = dto;

    // Buscar código de verificación
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: { email, code },
    });

    if (!verificationCode) {
      throw new BadRequestException('Código de verificación inválido');
    }

    // Verificar que no haya expirado
    const now = new Date();
    const expiresAt = new Date(verificationCode.expiresAt);

    if (now > expiresAt) {
      await this.verificationCodeRepository.delete({ email });
      throw new BadRequestException(
        'El código de verificación ha expirado. Por favor, registra tu solicitud nuevamente.',
      );
    }

    // Buscar usuario por email
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado. Por favor, registra tu solicitud nuevamente.',
      );
    }

    // Marcar email como verificado
    user.emailVerificado = true;
    await this.usersRepository.save(user);

    // Eliminar código usado
    await this.verificationCodeRepository.delete({ email });

    // Buscar solicitud del usuario
    const solicitud = await this.adminApprovalRepository.findOne({
      where: { userId: user.id },
      relations: ['usuario'],
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    // Obtener todos los superadministradores
    const allUsers = await this.usersRepository.find({
      relations: ['roles'],
      where: { activo: true },
    });

    const superAdmins = allUsers.filter((u) =>
      u.roles?.some(
        (role) => role.nombre === 'superadmin' || role.nombre === 'super_admin',
      ),
    );

    // Enviar email a todos los superadministradores
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3001',
    );

    let emailsSent = 0;

    for (const superAdmin of superAdmins) {
      try {
        await this.mailService.sendAdminApprovalRequest(
          superAdmin.email,
          {
            nombre: user.nombre,
            email: user.email,
            telefono: user.telefono,
            mensaje: solicitud.mensajeSolicitante,
            fechaSolicitud: solicitud.fechaSolicitud,
          },
          solicitud.tokenAprobacion,
          frontendUrl,
        );
        emailsSent++;
      } catch (error) {
        console.error(
          `Error al enviar email a superadmin ${superAdmin.email}:`,
          error,
        );
        // No lanzar excepción, continuar con el siguiente
      }
    }

    if (superAdmins.length === 0) {
      console.warn(
        'No se encontraron superadministradores para notificar la solicitud',
      );
    }

    return {
      message:
        emailsSent > 0
          ? `Email verificado exitosamente. Se ha enviado una notificación a ${emailsSent} superadministrador(es) para su aprobación.`
          : 'Email verificado exitosamente. Tu solicitud está pendiente de aprobación.',
      verified: true,
    };
  }

  /**
   * Reenviar notificación de solicitud pendiente a superadmins
   */
  async resendApprovalRequest(email: string): Promise<{ message: string }> {
    // Buscar usuario por email
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(
        'No se encontró ninguna cuenta con este email',
      );
    }

    // Buscar solicitud pendiente del usuario
    const solicitud = await this.adminApprovalRepository.findOne({
      where: {
        usuario: { id: user.id },
        estado: 'pendiente',
      },
      relations: ['usuario'],
    });

    if (!solicitud) {
      throw new NotFoundException(
        'No hay ninguna solicitud pendiente para este email',
      );
    }

    // Verificar que no haya expirado
    const expirationDays = parseInt(
      this.configService.get<string>('ADMIN_APPROVAL_EXPIRATION_DAYS', '7'),
      10,
    );
    const daysSinceRequest = Math.floor(
      (Date.now() - solicitud.fechaSolicitud.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceRequest >= expirationDays) {
      throw new BadRequestException(
        `La solicitud ha expirado. Por favor, registra una nueva solicitud.`,
      );
    }

    // Reenviar emails a todos los superadmins
    const superadmins = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.nombre = :roleName', { roleName: 'superadmin' })
      .andWhere('user.activo = :activo', { activo: true })
      .andWhere('user.emailVerificado = :verificado', { verificado: true })
      .getMany();

    if (superadmins.length === 0) {
      throw new NotFoundException(
        'No hay superadministradores disponibles para procesar la solicitud',
      );
    }

    // Enviar emails
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:4200',
    );

    const emailPromises = superadmins.map((superadmin) =>
      this.mailService.sendAdminApprovalRequest(
        superadmin.email,
        {
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono,
          mensaje: solicitud.mensajeSolicitante,
          fechaSolicitud: solicitud.fechaSolicitud,
        },
        solicitud.tokenAprobacion,
        frontendUrl,
      ),
    );

    await Promise.all(emailPromises);

    return {
      message: `Se ha reenviado la notificación a ${superadmins.length} superadministrador(es). Tu solicitud sigue pendiente de aprobación.`,
    };
  }

  /**
   * Eliminar solicitudes expiradas (más de 7 días sin respuesta)
   * Este método será llamado por un cron job
   */
  async cleanupExpiredRequests(): Promise<{ deletedCount: number }> {
    const expirationDays = this.configService.get<number>(
      'ADMIN_APPROVAL_EXPIRATION_DAYS',
      7,
    );
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - expirationDays);

    // Buscar solicitudes pendientes expiradas
    const expiredRequests = await this.adminApprovalRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.usuario', 'usuario')
      .where('solicitud.estado = :estado', { estado: 'pendiente' })
      .andWhere('solicitud.fecha_solicitud < :expirationDate', {
        expirationDate,
      })
      .getMany();

    let deletedCount = 0;

    for (const solicitud of expiredRequests) {
      try {
        // Eliminar usuario asociado
        await this.usersRepository.remove(solicitud.usuario);

        // La solicitud se eliminará automáticamente por CASCADE
        deletedCount++;
      } catch (error) {
        console.error(`Error al eliminar solicitud ${solicitud.id}:`, error);
      }
    }

    return { deletedCount };
  }
}
