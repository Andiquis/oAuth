import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para especificar qué roles pueden acceder a un endpoint
 *
 * Debe usarse junto con RolesGuard
 *
 * @param roles - Uno o más roles permitidos. El usuario necesita tener AL MENOS UNO
 *
 * @example
 * // Solo administradores
 * @Roles('admin')
 * async adminEndpoint() { ... }
 *
 * @example
 * // Administradores O superadministradores
 * @Roles('admin', 'superadmin')
 * async multiRoleEndpoint() { ... }
 *
 * @example
 * // Cualquier usuario autenticado (si se usa sin RolesGuard)
 * @UseGuards(JwtAuthGuard)
 * async publicForAuthUsers() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
