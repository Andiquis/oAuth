import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Verificar el ROL ACTIVO con el que se logueó el usuario
    const rolActivo = user.rol_activo?.toLowerCase();

    if (!rolActivo) {
      throw new ForbiddenException('No se encontró un rol activo en el token');
    }

    // El rol activo debe ser superadmin
    const isSuperAdmin =
      rolActivo === 'superadmin' || rolActivo === 'super_admin';

    if (!isSuperAdmin) {
      throw new ForbiddenException(
        'Solo los superadministradores pueden realizar esta acción. ' +
          `Tu rol actual es: ${user.rol_activo}`,
      );
    }

    return true;
  }
}
