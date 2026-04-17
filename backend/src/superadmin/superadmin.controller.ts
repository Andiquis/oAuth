import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SuperAdminService } from './superadmin.service';
import { PromoteToSuperAdminDto } from './dto/promote-to-superadmin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/superadmin.guard';

@ApiTags('SuperAdmin')
@Controller('superadmin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@ApiBearerAuth('access-token')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('admin-requests/pending')
  @ApiOperation({
    summary: '(SUPERADMIN) Obtener solicitudes pendientes de administrador',
    description:
      '🔸 **Acceso:** SuperAdministrador\n\n' +
      'Obtiene todas las solicitudes de administrador que están en estado pendiente, ' +
      'esperando aprobación o rechazo. Solo accesible por superadministradores.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de solicitudes pendientes con información del solicitante',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado. Token JWT inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado. Solo los superadministradores pueden acceder',
  })
  async getPendingAdminRequests() {
    return this.superAdminService.getPendingAdminRequests();
  }

  @Public()
  @Get('approve-link/:token')
  @ApiOperation({
    summary: '(PÚBLICO) Redirección para aprobar solicitud desde correo',
    description:
      'Endpoint público invocado por el botón del correo electrónico que redirige al frontend.',
  })
  async approveLink(@Param('token') token: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    return res.redirect(`${frontendUrl}/auth/solicitud/aprobar?token=${token}`);
  }

  @Public()
  @Get('reject-link/:token')
  @ApiOperation({
    summary: '(PÚBLICO) Redirección para rechazar solicitud desde correo',
    description:
      'Endpoint público invocado por el botón del correo electrónico que redirige al frontend.',
  })
  async rejectLink(@Param('token') token: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    return res.redirect(
      `${frontendUrl}/auth/solicitud/rechazar?token=${token}`,
    );
  }

  @Public()
  @Get('request/:token')
  @ApiOperation({
    summary: '(PÚBLICO) Obtener solicitud por token',
    description:
      'Retorna los datos de una solicitud de administrador utilizando el token, usado en la pantalla pública/login de decisión.',
  })
  async getRequestByToken(@Param('token') token: string) {
    return this.superAdminService.getRequestByToken(token);
  }

  @Get('admin-requests/:id')
  @ApiOperation({
    summary: '(SUPERADMIN) Obtener solicitud de administrador por ID',
    description:
      '🔸 **Acceso:** SuperAdministrador\n\n' +
      'Obtiene los detalles completos de una solicitud de administrador específica mediante su ID único. ' +
      'Útil para revisar información detallada antes de aprobar o rechazar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud encontrada con información completa',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado. Token JWT inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado. Solo los superadministradores pueden acceder',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  async getAdminRequestById(@Param('id') id: string) {
    return this.superAdminService.getAdminRequestById(id);
  }

  @Post('admin-requests/approve/:token')
  @ApiOperation({
    summary: '(SUPERADMIN) Aprobar solicitud de administrador',
    description:
      '🔸 **Acceso:** SuperAdministrador\n\n' +
      'Aprueba una solicitud de administrador mediante su token único. ' +
      'Al aprobar, el usuario solicitante obtiene permisos de administrador. ' +
      'La solicitud debe estar en estado pendiente y no haber expirado.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Solicitud aprobada exitosamente. Usuario promovido a administrador',
  })
  @ApiResponse({
    status: 400,
    description: 'La solicitud ya fue procesada o el token ha expirado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado. Token JWT inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description:
      'No autorizado. Solo los superadministradores pueden aprobar solicitudes',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  async approveAdminRequest(
    @Param('token') token: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.superAdminService.approveAdminRequest(token, req.user.id);
  }

  @Post('admin-requests/reject/:token')
  @ApiOperation({
    summary: '(SUPERADMIN) Rechazar solicitud de administrador',
    description:
      '🔸 **Acceso:** SuperAdministrador\n\n' +
      'Rechaza una solicitud de administrador mediante su token único. ' +
      'Se debe proporcionar un motivo de rechazo que será visible para el solicitante. ' +
      'La solicitud quedará marcada como rechazada.',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud rechazada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'La solicitud ya fue procesada o faltan datos requeridos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado. Token JWT inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description:
      'No autorizado. Solo los superadministradores pueden rechazar solicitudes',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  async rejectAdminRequest(
    @Param('token') token: string,
    @Body('motivo') motivo: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.superAdminService.rejectAdminRequest(
      token,
      req.user.id,
      motivo,
    );
  }

  @Post('promote-admin')
  @ApiOperation({
    summary: '(SUPERADMIN) Promover un administrador a superadministrador',
    description:
      '🔸 **Acceso:** SuperAdministrador\n\n' +
      'Promueve un administrador existente al rol de superadministrador. ' +
      'Requiere el ID del usuario y un código de verificación especial de 6 dígitos. ' +
      'Solo otros superadministradores pueden realizar esta acción.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario promovido exitosamente a superadministrador',
  })
  @ApiResponse({
    status: 400,
    description:
      'El usuario no cumple los requisitos para ser promovido o código de verificación inválido',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado. Token JWT inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description:
      'No autorizado. Solo los superadministradores pueden promover usuarios',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async promoteToSuperAdmin(
    @Body() promoteDto: PromoteToSuperAdminDto,
    @Request() req: any,
  ): Promise<{ message: string }> {
    return this.superAdminService.promoteToSuperAdmin(
      promoteDto.userId,
      promoteDto.codigoVerificacion,
      req.user.id,
    );
  }

  @Get('admins')
  @ApiOperation({
    summary: '(SUPERADMIN) Listar todos los administradores',
    description:
      '🔸 **Acceso:** SuperAdministrador\n\n' +
      'Obtiene una lista completa de todos los usuarios con rol de administrador en el sistema. ' +
      'Incluye información básica de cada administrador.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de administradores con información de perfil',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado. Token JWT inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description:
      'No autorizado. Solo los superadministradores pueden listar administradores',
  })
  async listAdmins() {
    return this.superAdminService.listAdmins();
  }

  @Get('superadmins')
  @ApiOperation({
    summary: '(SUPERADMIN) Listar todos los superadministradores',
    description:
      '🔸 **Acceso:** SuperAdministrador\n\n' +
      'Obtiene una lista completa de todos los usuarios con rol de superadministrador en el sistema. ' +
      'Útil para gestión y auditoría de usuarios con máximos privilegios.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de superadministradores con información de perfil',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado. Token JWT inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description:
      'No autorizado. Solo los superadministradores pueden listar superadministradores',
  })
  async listSuperAdmins() {
    return this.superAdminService.listSuperAdmins();
  }

  @Get('admins-with-requests')
  @ApiOperation({
    summary: '(SUPERADMIN) Listar administradores con sus solicitudes',
    description:
      '🔸 **Acceso:** SuperAdministrador\n\n' +
      'Obtiene una lista de todos los administradores junto con información de sus solicitudes históricas. ' +
      'Proporciona una vista completa del proceso de aprobación de cada administrador.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de administradores con información de solicitudes asociadas',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado. Token JWT inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description:
      'No autorizado. Solo los superadministradores pueden acceder a esta información',
  })
  async listAdminsWithRequests() {
    return this.superAdminService.listAdminsWithRequests();
  }

  @Get('admin-requests/all')
  @ApiOperation({
    summary: '(SUPERADMIN) Obtener todas las solicitudes de administrador',
    description:
      '🔸 **Acceso:** SuperAdministrador\n\n' +
      'Obtiene un listado completo de todas las solicitudes de administrador del sistema. ' +
      'Incluye solicitudes pendientes, aprobadas y rechazadas. ' +
      'Útil para auditoría y seguimiento de solicitudes.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista completa de todas las solicitudes (pendientes, aprobadas, rechazadas)',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado. Token JWT inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description:
      'No autorizado. Solo los superadministradores pueden ver todas las solicitudes',
  })
  async getAllAdminRequests() {
    return this.superAdminService.getAllAdminRequests();
  }
}
