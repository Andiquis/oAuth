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
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Throttle } from '@nestjs/throttler';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint: POST /auth/login
   * Descripción: Inicia sesión y retorna tokens JWT
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Login con JWT y rol específico',
    description:
      'Autentica al usuario con un rol específico y retorna tokens JWT. El usuario debe tener el rol solicitado en su lista de roles asignados.',
  })
  @ApiBody({
    type: LoginUserDto,
    examples: {
      admin: {
        summary: 'Login como admin',
        value: {
          email: 'admin@example.com',
          password: 'Password123!',
          tipo_usuario: 'admin',
        },
      },
      usuario: {
        summary: 'Login como usuario',
        value: {
          email: 'user@example.com',
          password: 'Password123!',
          tipo_usuario: 'usuario',
        },
      },
      superadmin: {
        summary: 'Login como superadmin',
        value: {
          email: 'superadmin@example.com',
          password: 'Password123!',
          tipo_usuario: 'superadmin',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Login exitoso - Retorna tokens JWT con el rol activo especificado. Para obtener la lista completa de roles del usuario, use el endpoint /auth/profile',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Usuario bloqueado, inactivo, email no verificado o no tiene el rol solicitado',
    schema: {
      examples: {
        emailNoVerificado: {
          summary: 'Email no verificado',
          value: {
            statusCode: 400,
            message: 'Debes verificar tu email antes de iniciar sesión',
            error: 'Bad Request',
          },
        },
        rolNoAsignado: {
          summary: 'Usuario no tiene el rol solicitado',
          value: {
            statusCode: 400,
            message:
              "El usuario no tiene permisos para iniciar sesión como 'admin'",
            error: 'Bad Request',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Credenciales inválidas',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiados intentos de login',
  })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string = 'Unknown',
  ): Promise<LoginResponseDto> {
    return await this.authService.login(
      loginUserDto.email,
      loginUserDto.password,
      loginUserDto.tipo_usuario,
      ip,
      userAgent,
    );
  }

  /**
   * Endpoint: POST /auth/refresh
   * Descripción: Renueva el access token usando el refresh token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Renovar access token',
    description: 'Usa el refresh token para obtener un nuevo access token.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Access token renovado',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: '30m',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return await this.authService.refreshAccessToken(refreshToken);
  }

  /**
   * Endpoint: POST /auth/logout
   * Descripción: Cierra la sesión del usuario e invalida los tokens
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Invalida el access token y opcionalmente el refresh token, cerrando la sesión del usuario.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'Refresh token a invalidar (opcional)',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
    schema: {
      example: {
        message: 'Sesión cerrada exitosamente',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido',
  })
  async logout(
    @Headers('authorization') authorization: string,
    @Body('refreshToken') refreshToken?: string,
  ): Promise<{ message: string }> {
    // Extraer el access token del header Authorization
    const accessToken = authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return { message: 'No se proporcionó token' };
    }

    return await this.authService.logout(accessToken, refreshToken);
  }

  /**
   * Endpoint: GET /auth/profile
   * Descripción: Obtiene el perfil del usuario autenticado
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Retorna los datos del usuario basándose en el token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    schema: {
      example: {
        id: '1',
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '+51999999999',
        emailVerificado: true,
        activo: true,
        roles: ['usuario'],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  async getProfile(@CurrentUser() user: User) {
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      roles: user.roles.map((role) => role.nombre),
    };
  }
}
