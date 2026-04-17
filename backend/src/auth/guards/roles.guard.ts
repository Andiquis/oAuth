import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * Guard para proteger endpoints según roles específicos
 *
 * Valida que el usuario autenticado tenga el rol_activo requerido
 *
 * @example
 * // Proteger con un solo rol
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin')
 * async adminEndpoint() { ... }
 *
 * @example
 * // Proteger con múltiples roles (el usuario necesita tener AL MENOS UNO)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin', 'superadmin')
 * async multiRoleEndpoint() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Obtener los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('🛡️ [RolesGuard] Validando acceso...');
    console.log('🛡️ [RolesGuard] Roles requeridos:', requiredRoles);
    console.log('🛡️ [RolesGuard] Usuario:', user ? 'EXISTS' : 'NULL');
    console.log('🛡️ [RolesGuard] User object:', JSON.stringify(user, null, 2));

    // Verificar que el usuario esté autenticado
    if (!user) {
      console.log('❌ [RolesGuard] Usuario no autenticado');
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Obtener el rol_activo del JWT (viene del payload)
    const rolActivo = user.rol_activo;

    console.log('🛡️ [RolesGuard] rol_activo:', rolActivo);

    if (!rolActivo) {
      console.log('❌ [RolesGuard] No se pudo determinar el rol activo');
      throw new ForbiddenException(
        'No se pudo determinar el rol activo del usuario',
      );
    }

    // Normalizar para comparación case-insensitive
    const rolActivoNormalizado = rolActivo.toLowerCase();
    const rolesNormalizados = requiredRoles.map((r) => r.toLowerCase());

    // Verificar si el rol_activo está en la lista de roles permitidos
    const hasRequiredRole = rolesNormalizados.includes(rolActivoNormalizado);

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de estos roles: [${requiredRoles.join(', ')}]. Tu rol activo es: '${rolActivo}'`,
      );
    }

    return true;
  }
}
