import {
  CanActivate,
  ExecutionContext,
  // ForbiddenException, // COMENTADO: Facturación deshabilitada temporalmente
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import { BloqueoService } from '../../facturacion/services/bloqueo.service'; // COMENTADO

export const IGNORAR_BLOQUEO_KEY = 'ignorarBloqueoFacturacion';

@Injectable()
export class BillingLockGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    // private readonly bloqueoService: BloqueoService, // COMENTADO: Facturación deshabilitada
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ========================================================
    // FACTURACIÓN DESHABILITADA TEMPORALMENTE
    // TODO: Descomentar cuando se integre Culqi
    // ========================================================
    return true; // Siempre permitir acceso

    /* CÓDIGO ORIGINAL COMENTADO:
    const ignoreBillingLock = this.reflector.getAllAndOverride<boolean>(
      IGNORAR_BLOQUEO_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (ignoreBillingLock) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const empresa = request.empresa;

    if (!empresa || !empresa.id_empresa) {
      return true;
    }

    const estaBloqueada = await this.bloqueoService.empresaEstaBloqueada(
      empresa.id_empresa,
    );

    if (estaBloqueada) {
      throw new ForbiddenException(
        'Su cuenta está bloqueada. Debe pagar su recibo para continuar.',
      );
    }

    return true;
    */
  }
}
