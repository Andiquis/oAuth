import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Endpoint: POST /users/register
   * Descripción: Registra un nuevo usuario con detección inteligente de cuentas existentes
   * Body: { nombre, email, password, telefono?, fotoUrl? }
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Registra un nuevo usuario en el sistema con rol "usuario" por defecto. ' +
      'Detecta cuentas existentes y maneja automáticamente: ' +
      '1) Cuentas verificadas (redirige a login), ' +
      '2) Cuentas no verificadas (reenvía código), ' +
      '3) Cuentas OAuth (ofrece migración a manual).',
  })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: 201,
    description:
      'Usuario registrado exitosamente. Se envió código de verificación al email.',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 200,
    description:
      'Cuenta existente detectada (verificada, no verificada, u OAuth)',
    schema: {
      examples: {
        cuentaVerificada: {
          summary: 'Cuenta manual verificada',
          value: {
            message: 'Ya tienes una cuenta. Por favor, inicia sesión.',
            requiresLogin: true,
            accountType: 'manual',
            email: 'user@example.com',
          },
        },
        cuentaNoVerificada: {
          summary: 'Cuenta no verificada (código reenviado)',
          value: {
            message: 'Cuenta existente no verificada. Se reenvió el código.',
            requiresVerification: true,
            userId: '123',
            email: 'user@example.com',
            codeResent: true,
            reenviosRealizados: 1,
            reenviosRestantes: 2,
          },
        },
        cuentaOAuth: {
          summary: 'Cuenta OAuth existente',
          value: {
            message:
              'Ya tienes cuenta con google. ¿Deseas actualizar a manual?',
            accountType: 'oauth',
            proveedor: 'google',
            canUpgrade: true,
            email: 'user@example.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o cuenta bloqueada por intentos',
    schema: {
      examples: {
        bloqueoPorIntentos: {
          summary: 'Bloqueado por intentos de reenvío',
          value: {
            message: 'Límite de reenvíos alcanzado. Cuenta bloqueada 24 horas.',
            blocked: true,
            blockedUntil: '2025-11-20T15:30:00Z',
            hoursRemaining: 23,
            explanation:
              'Has excedido el límite de intentos. Intenta en 23 horas.',
          },
        },
        datosInvalidos: {
          summary: 'Datos de entrada inválidos',
          value: {
            statusCode: 400,
            message: [
              'La contraseña debe tener al menos 8 caracteres',
              'El email debe ser válido',
            ],
            error: 'Bad Request',
          },
        },
      },
    },
  })
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ): Promise<any> {
    return await this.usersService.register(
      registerUserDto,
      ip,
      userAgent || 'Unknown',
    );
  }

  /**
   * Endpoint: POST /users/verify-email
   * Descripción: Verifica el email del usuario con el código enviado
   * Body: { email, code }
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 intentos por minuto
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Verificar email',
    description:
      'Verifica el email del usuario usando el código de 6 dígitos enviado por correo.',
  })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Email verificado exitosamente',
    schema: {
      example: {
        message: '¡Email verificado exitosamente! Ya puedes iniciar sesión.',
        emailVerificado: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Código inválido o expirado',
    schema: {
      example: {
        statusCode: 400,
        message: 'Código de verificación inválido',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuario no encontrado',
        error: 'Not Found',
      },
    },
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.usersService.verifyEmail(verifyEmailDto);
  }

  /**
   * Endpoint: POST /users/resend-verification
   * Descripción: Reenvía el código de verificación con control de intentos
   * Body: { email }
   */
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 intentos por minuto
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Reenviar código de verificación',
    description:
      'Reenvía un nuevo código de verificación al email del usuario. ' +
      'Los códigos anteriores se invalidan. ' +
      'Máximo 3 intentos de reenvío, después se bloquea la cuenta por 24 horas.',
  })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse({
    status: 200,
    description: 'Código reenviado exitosamente con información de intentos',
    schema: {
      example: {
        message:
          'Código de verificación reenviado exitosamente. Revisa tu email.',
        reenviosRealizados: 1,
        reenviosRestantes: 2,
        warning: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuario no encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email verificado o cuenta bloqueada por intentos',
    schema: {
      examples: {
        emailVerificado: {
          summary: 'Email ya verificado',
          value: {
            statusCode: 400,
            message: 'El email ya ha sido verificado',
            error: 'Bad Request',
          },
        },
        bloqueoPorIntentos: {
          summary: 'Bloqueado por exceder límite de reenvíos',
          value: {
            message: 'Límite de reenvíos alcanzado. Cuenta bloqueada 24 horas.',
            blocked: true,
            blockedUntil: '2025-11-20T15:30:00Z',
            hoursRemaining: 24,
            explanation:
              'Has excedido el límite de intentos. Intenta en 24 horas.',
          },
        },
      },
    },
  })
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto,
  ) {
    return await this.usersService.resendVerificationCode(
      resendVerificationDto.email,
    );
  }
}
