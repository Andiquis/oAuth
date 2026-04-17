import {
  Controller,
  Post,
  Body,
  Ip,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterAdminResponseDto } from './dto/register-admin-response.dto';
import { VerifyAdminEmailDto } from './dto/verify-admin-email.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar solicitud de administrador',
    description:
      'Crea una nueva solicitud de administrador con usuario inactivo. Se envía un código de verificación de 6 dígitos al email proporcionado. El código expira en 10 minutos.',
  })
  @ApiResponse({
    status: 201,
    description: 'Solicitud creada exitosamente y código enviado',
    type: RegisterAdminResponseDto,
  })
  async register(
    @Body() registerAdminDto: RegisterAdminDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<RegisterAdminResponseDto> {
    return this.adminService.registerAdmin(registerAdminDto, ip, userAgent);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar email y notificar a superadmins',
    description:
      'Verifica el código de 6 dígitos enviado al email. Si es válido, marca el email como verificado y envía notificación de aprobación a todos los superadministradores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verificado y superadmins notificados',
  })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyAdminEmailDto,
  ): Promise<{ message: string; verified: boolean }> {
    return this.adminService.verifyAdminEmail(verifyEmailDto);
  }

  @Post('resend-approval-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reenviar notificación de solicitud',
    description:
      'Reenvía el email de aprobación a todos los superadmins. Solo funciona si la solicitud está pendiente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificación reenviada exitosamente',
  })
  async resendApprovalRequest(
    @Body() body: { email: string },
  ): Promise<{ message: string }> {
    return this.adminService.resendApprovalRequest(body.email);
  }
}
