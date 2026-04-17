import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('🔐 [JwtAuthGuard] Verificando autenticación...');
    console.log('🔐 [JwtAuthGuard] URL:', request.url);
    console.log('🔐 [JwtAuthGuard] Method:', request.method);
    console.log(
      '🔐 [JwtAuthGuard] Authorization header:',
      request.headers.authorization ? 'EXISTS' : 'MISSING',
    );

    // Verificar si la ruta es pública
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      console.log('✅ [JwtAuthGuard] Ruta pública, acceso permitido');
      return true;
    }

    console.log('🔐 [JwtAuthGuard] Delegando a Passport JWT...');
    return super.canActivate(context);
  }
}
