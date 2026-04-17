import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AdminApprovalRequest } from '../admin/entities/admin-approval-request.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt.strategy';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private tokenBlacklist: Set<string> = new Set();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(AdminApprovalRequest)
    private adminApprovalRepository: Repository<AdminApprovalRequest>,
  ) {}

  async login(
    email: string,
    password: string,
    tipoUsuario: string,
    ip?: string,
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 🔒 Usuario bloqueado
    if (user.bloqueadoHasta && new Date() < new Date(user.bloqueadoHasta)) {
      throw new BadRequestException(
        `Usuario bloqueado hasta ${new Date(user.bloqueadoHasta).toLocaleString()}`,
      );
    }

    // 📧 Email no verificado
    if (!user.emailVerificado) {
      throw new BadRequestException(
        'Debes verificar tu email antes de iniciar sesión',
      );
    }

    // 🚫 Usuario inactivo
    if (!user.activo) {
      if (tipoUsuario.toLowerCase() === 'admin') {
        const pendingRequest = await this.adminApprovalRepository.findOne({
          where: {
            usuario: { id: user.id },
            estado: 'pendiente',
          },
        });

        if (pendingRequest) {
          throw new ForbiddenException(
            'Tu solicitud de administrador está pendiente de aprobación.',
          );
        }
      }

      throw new BadRequestException('Usuario inactivo');
    }

    // 🔑 Verificar password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await this.usersService.incrementFailedAttempts(user.id);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 🎭 Roles del usuario
    const userRoles = user.roles.map((role) => role.nombre);

    const tipoUsuarioNormalizado = tipoUsuario.toLowerCase().trim();

    const hasRole = userRoles.some(
      (roleName) => roleName.toLowerCase() === tipoUsuarioNormalizado,
    );

    if (!hasRole) {
      this.logger.warn(
        `Login inválido: ${email} intentó '${tipoUsuario}' sin permiso`,
      );
      throw new BadRequestException(
        `No tienes permisos para iniciar sesión como '${tipoUsuario}'`,
      );
    }

    // ✅ Login exitoso
    await this.usersService.updateLoginSuccess(user.id, ip, userAgent);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: userRoles,
      rol_activo: tipoUsuarioNormalizado,
    };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    this.logger.log(`Login OK: ${email} como '${tipoUsuarioNormalizado}'`);

    return {
      message: 'Login exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol_activo: tipoUsuarioNormalizado,
      },
      accessToken,
      refreshToken,
      expiresIn: '30m',
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>('jwt.secret'),
        },
      );

      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.activo || !user.emailVerificado) {
        throw new UnauthorizedException('Usuario no válido');
      }

      const userRoles = user.roles.map((role) => role.nombre.toLowerCase());

      const hasActiveRole = userRoles.includes(
        payload.rol_activo.toLowerCase(),
      );

      if (!hasActiveRole) {
        throw new UnauthorizedException('El usuario ya no tiene el rol activo');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        roles: user.roles.map((role) => role.nombre),
        rol_activo: payload.rol_activo,
      };

      const accessToken = await this.generateAccessToken(newPayload);

      return {
        accessToken,
        expiresIn: this.configService.get<string>('jwt.accessTokenExpiration'),
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.activo || !user.emailVerificado) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return user;
  }

  async logout(
    accessToken: string,
    refreshToken?: string,
  ): Promise<{ message: string }> {
    if (accessToken) {
      this.tokenBlacklist.add(accessToken);
    }

    if (refreshToken) {
      this.tokenBlacklist.add(refreshToken);
    }

    return {
      message: 'Sesión cerrada exitosamente',
    };
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  clearBlacklist(): void {
    this.tokenBlacklist.clear();
    this.logger.log('Blacklist limpiada');
  }

  getBlacklistSize(): number {
    return this.tokenBlacklist.size;
  }
}
