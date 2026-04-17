import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { AdminApprovalRequest } from '../admin/entities/admin-approval-request.entity';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(AdminApprovalRequest)
    private readonly adminApprovalRepository: Repository<AdminApprovalRequest>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Aprobar una solicitud de administrador (solo superadmin)
   */
  async approveAdminRequest(
    token: string,
    approvedById: string,
  ): Promise<{ message: string }> {
    const solicitud = await this.adminApprovalRepository.findOne({
      where: { tokenAprobacion: token },
      relations: ['usuario'],
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.estado !== 'pendiente') {
      throw new BadRequestException(`La solicitud ya fue ${solicitud.estado}`);
    }

    const expirationDays = this.configService.get<number>(
      'ADMIN_APPROVAL_EXPIRATION_DAYS',
      7,
    );
    const expirationDate = new Date(solicitud.fechaSolicitud);
    expirationDate.setDate(expirationDate.getDate() + expirationDays);

    if (new Date() > expirationDate) {
      throw new BadRequestException('La solicitud ha expirado');
    }

    solicitud.estado = 'aprobado';
    solicitud.fechaRespuesta = new Date();
    solicitud.aprobadoPor = approvedById;

    await this.adminApprovalRepository.save(solicitud);

    const user = solicitud.usuario;
    user.activo = true;
    user.emailVerificado = true;

    await this.usersRepository.save(user);

    return {
      message: `Solicitud aprobada exitosamente. El usuario ${user.email} ahora tiene acceso como administrador.`,
    };
  }

  /**
   * Rechazar una solicitud de administrador (solo superadmin)
   */
  async rejectAdminRequest(
    token: string,
    rejectedById: string,
    motivoRechazo?: string,
  ): Promise<{ message: string }> {
    const solicitud = await this.adminApprovalRepository.findOne({
      where: { tokenAprobacion: token },
      relations: ['usuario'],
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.estado !== 'pendiente') {
      throw new BadRequestException(`La solicitud ya fue ${solicitud.estado}`);
    }

    solicitud.estado = 'rechazado';
    solicitud.fechaRespuesta = new Date();
    solicitud.aprobadoPor = rejectedById;
    solicitud.motivoRechazo = motivoRechazo || 'No se especificó motivo';

    await this.adminApprovalRepository.save(solicitud);

    const user = solicitud.usuario;
    await this.usersRepository.remove(user);

    return {
      message: `Solicitud rechazada. El usuario ${user.email} ha sido notificado.`,
    };
  }

  /**
   * Obtener todas las solicitudes pendientes (solo superadmin)
   */
  async getPendingAdminRequests(): Promise<AdminApprovalRequest[]> {
    return this.adminApprovalRepository.find({
      where: { estado: 'pendiente' },
      relations: ['usuario'],
      order: { fechaSolicitud: 'ASC' },
    });
  }

  /**
   * Obtener solicitud por ID (solo superadmin)
   */
  async getAdminRequestById(id: string): Promise<AdminApprovalRequest> {
    const solicitud = await this.adminApprovalRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return solicitud;
  }

  /**
   * Obtener solicitud por token de aprobación
   */
  async getRequestByToken(token: string): Promise<AdminApprovalRequest> {
    const solicitud = await this.adminApprovalRepository.findOne({
      where: { tokenAprobacion: token },
      relations: ['usuario'],
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return solicitud;
  }

  /**
   * Promover un admin a superadmin (solo superadmin)
   */
  async promoteToSuperAdmin(
    userId: string,
    codigoVerificacion: string,
    promotedById: string,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.activo) {
      throw new BadRequestException('El usuario no está activo');
    }

    const isAdmin = user.roles?.some(
      (role) => role.nombre === 'admin' || role.nombre === 'administrador',
    );

    if (!isAdmin) {
      throw new BadRequestException(
        'El usuario debe ser administrador para ser promovido',
      );
    }

    const isSuperAdmin = user.roles?.some(
      (role) => role.nombre === 'superadmin' || role.nombre === 'super_admin',
    );

    if (isSuperAdmin) {
      throw new BadRequestException('El usuario ya es superadministrador');
    }

    const VERIFICATION_CODE = this.configService.get<string>(
      'SUPERADMIN_VERIFICATION_CODE',
      '123456',
    );

    if (codigoVerificacion !== VERIFICATION_CODE) {
      throw new BadRequestException('Código de verificación inválido');
    }

    console.log(
      `Usuario ${user.email} promovido a superadmin por ${promotedById}`,
    );

    return {
      message: `Usuario ${user.email} promovido exitosamente a superadministrador`,
    };
  }

  /**
   * Listar todos los administradores
   */
  async listAdmins(): Promise<User[]> {
    const users = await this.usersRepository.find({
      relations: ['roles'],
      where: { activo: true },
    });

    return users.filter((user) =>
      user.roles?.some(
        (role) =>
          role.nombre === 'admin' ||
          role.nombre === 'administrador' ||
          role.nombre === 'superadmin' ||
          role.nombre === 'super_admin',
      ),
    );
  }

  /**
   * Listar todos los superadministradores
   */
  async listSuperAdmins(): Promise<User[]> {
    const users = await this.usersRepository.find({
      relations: ['roles'],
      where: { activo: true },
    });

    return users.filter((user) =>
      user.roles?.some(
        (role) => role.nombre === 'superadmin' || role.nombre === 'super_admin',
      ),
    );
  }

  /**
   * Listar todos los administradores con sus solicitudes
   */
  async listAdminsWithRequests(): Promise<any[]> {
    console.log('🔍 [listAdminsWithRequests] Iniciando consulta...');

    // Obtener todas las solicitudes primero (para encontrar usuarios pendientes)
    const allRequests = await this.adminApprovalRepository.find({
      relations: ['usuario', 'usuario.roles'],
      order: { fechaSolicitud: 'DESC' },
    });
    console.log(`📨 Total solicitudes encontradas: ${allRequests.length}`);

    // Obtener IDs únicos de usuarios que tienen solicitudes
    const userIdsWithRequests = new Set(allRequests.map((r) => r.usuario.id));
    console.log(`👥 Usuarios con solicitudes: ${userIdsWithRequests.size}`);

    // Obtener todos los usuarios con rol admin o superadmin
    const users = await this.usersRepository.find({
      relations: ['roles'],
      select: [
        'id',
        'email',
        'nombre',
        'activo',
        'emailVerificado',
        'fechaCreacion',
        'ultimoLogin',
      ],
    });
    console.log(`👥 Total usuarios encontrados: ${users.length}`);

    // Filtrar usuarios que son admins O tienen solicitudes (incluso si aún no tienen rol)
    const admins = users.filter((user) => {
      const hasAdminRole = user.roles?.some(
        (role) =>
          role.nombre === 'admin' ||
          role.nombre === 'administrador' ||
          role.nombre === 'superadmin' ||
          role.nombre === 'super_admin',
      );
      const hasRequest = userIdsWithRequests.has(user.id);
      return hasAdminRole || hasRequest;
    });
    console.log(`👨‍💼 Total admins (con rol o solicitud): ${admins.length}`);
    console.log(
      '📋 Admins incluidos:',
      admins.map((a) => ({
        email: a.email,
        roles: a.roles.map((r) => r.nombre),
        tieneRol: a.roles.length > 0,
      })),
    );

    console.log(
      '📊 Estados de solicitudes:',
      allRequests.map((r) => ({
        email: r.usuario.email,
        estado: r.estado,
        userId: r.usuario.id,
      })),
    );

    // Mapear solicitudes por usuario
    const requestsByUser = new Map<string, AdminApprovalRequest[]>();
    allRequests.forEach((request) => {
      const userId = request.usuario.id;
      if (!requestsByUser.has(userId)) {
        requestsByUser.set(userId, []);
      }
      const userRequestArray = requestsByUser.get(userId);
      if (userRequestArray) {
        userRequestArray.push(request);
      }
    });

    // Combinar información
    const result = admins.map((admin) => {
      const userRequests = requestsByUser.get(admin.id) || [];
      const lastRequest = userRequests[0]; // La más reciente

      return {
        id: admin.id,
        email: admin.email,
        nombre: admin.nombre,
        activo: admin.activo,
        emailVerificado: admin.emailVerificado,
        fechaCreacion: admin.fechaCreacion,
        ultimoLogin: admin.ultimoLogin,
        roles: admin.roles.map((r) => r.nombre),
        solicitudes: {
          total: userRequests.length,
          pendientes: userRequests.filter((r) => r.estado === 'pendiente')
            .length,
          aprobadas: userRequests.filter((r) => r.estado === 'aprobado').length,
          rechazadas: userRequests.filter((r) => r.estado === 'rechazado')
            .length,
          ultima: lastRequest
            ? {
                id: lastRequest.id,
                token: lastRequest.tokenAprobacion,
                estado: lastRequest.estado,
                fechaSolicitud: lastRequest.fechaSolicitud,
                fechaRespuesta: lastRequest.fechaRespuesta,
                motivoRechazo: lastRequest.motivoRechazo,
              }
            : null,
        },
      };
    });

    console.log('✅ Resultado final:');
    result.forEach((admin) => {
      console.log(
        `  - ${admin.email}: ${admin.solicitudes.pendientes} pendientes, ${admin.solicitudes.aprobadas} aprobadas, ${admin.solicitudes.rechazadas} rechazadas`,
      );
    });

    return result;
  }

  /**
   * Obtener todas las solicitudes (pendientes, aprobadas, rechazadas)
   */
  async getAllAdminRequests(): Promise<AdminApprovalRequest[]> {
    return this.adminApprovalRepository.find({
      relations: ['usuario'],
      order: { fechaSolicitud: 'DESC' },
    });
  }
}
