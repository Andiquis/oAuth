import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para respuesta cuando la cuenta ya existe y está verificada
 */
export class ExistingVerifiedAccountDto {
  @ApiProperty({
    example: 'Ya tienes una cuenta. Por favor, inicia sesión.',
    description: 'Mensaje informativo',
  })
  message: string;

  @ApiProperty({
    example: true,
    description: 'Indica que el usuario debe ir al login',
  })
  requiresLogin: boolean;

  @ApiProperty({
    example: 'manual',
    description: 'Tipo de cuenta: manual u oauth',
    enum: ['manual', 'oauth'],
  })
  accountType: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email de la cuenta existente',
  })
  email: string;
}

/**
 * DTO para respuesta cuando la cuenta existe pero no está verificada
 */
export class ExistingUnverifiedAccountDto {
  @ApiProperty({
    example: 'Cuenta existente no verificada. Se reenvió el código.',
    description: 'Mensaje informativo',
  })
  message: string;

  @ApiProperty({
    example: true,
    description: 'Indica que requiere verificación de email',
  })
  requiresVerification: boolean;

  @ApiProperty({
    example: '123',
    description: 'ID del usuario',
  })
  userId: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email al que se envió el código',
  })
  email: string;

  @ApiProperty({
    example: true,
    description: 'Indica que se reenvió un código automáticamente',
  })
  codeResent: boolean;

  @ApiProperty({
    example: 1,
    description: 'Número de intentos de reenvío realizados',
  })
  reenviosRealizados: number;

  @ApiProperty({
    example: 2,
    description: 'Intentos de reenvío restantes antes del bloqueo',
  })
  reenviosRestantes: number;
}

/**
 * DTO para respuesta cuando la cuenta OAuth existe
 */
export class ExistingOAuthAccountDto {
  @ApiProperty({
    example: 'Ya tienes cuenta con Google. ¿Deseas actualizar a manual?',
    description: 'Mensaje informativo',
  })
  message: string;

  @ApiProperty({
    example: 'oauth',
    description: 'Tipo de cuenta',
  })
  accountType: string;

  @ApiProperty({
    example: 'google',
    description: 'Proveedor OAuth',
    enum: ['google', 'facebook', 'apple'],
  })
  proveedor: string;

  @ApiProperty({
    example: true,
    description: 'Indica si puede convertirse a cuenta manual',
  })
  canUpgrade: boolean;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email de la cuenta existente',
  })
  email: string;
}

/**
 * DTO para respuesta de bloqueo por demasiados intentos de reenvío
 */
export class ReenvioBlockedDto {
  @ApiProperty({
    example: 'Demasiados intentos. Cuenta bloqueada temporalmente.',
    description: 'Mensaje de error',
  })
  message: string;

  @ApiProperty({
    example: true,
    description: 'Indica que la cuenta está bloqueada',
  })
  blocked: boolean;

  @ApiProperty({
    example: '2025-11-20T15:30:00Z',
    description: 'Fecha hasta la cual está bloqueada',
  })
  blockedUntil: Date;

  @ApiProperty({
    example: 23,
    description: 'Horas restantes de bloqueo',
  })
  hoursRemaining: number;

  @ApiProperty({
    example:
      'Por seguridad, tu cuenta ha sido bloqueada. Intenta nuevamente en 23 horas.',
    description: 'Explicación detallada',
  })
  explanation: string;
}
