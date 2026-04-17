import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  roles: string[]; // TODOS los roles del usuario
  rol_activo: string; // El rol con el que inició sesión
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('jwt.secret') ||
        'your-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    console.log('🔑 [JwtStrategy] Validando JWT...');
    console.log('🔑 [JwtStrategy] Payload:', JSON.stringify(payload, null, 2));

    const user = await this.usersService.findById(payload.sub);

    console.log('🔑 [JwtStrategy] Usuario encontrado:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('❌ [JwtStrategy] Usuario no encontrado');
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.activo) {
      console.log('❌ [JwtStrategy] Usuario inactivo');
      throw new UnauthorizedException('Usuario inactivo');
    }

    if (!user.emailVerificado) {
      console.log('❌ [JwtStrategy] Email no verificado');
      throw new UnauthorizedException('Email no verificado');
    }

    console.log(
      '✅ [JwtStrategy] Validación exitosa, rol_activo:',
      payload.rol_activo,
    );

    // Retornar el usuario CON el rol_activo del JWT
    // Esto estará disponible en req.user
    return {
      ...user,
      rol_activo: payload.rol_activo, // Del JWT
      roles_disponibles: payload.roles, // Todos los roles del JWT
    };
  }
}
