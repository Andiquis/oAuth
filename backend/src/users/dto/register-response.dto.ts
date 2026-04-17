import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    example:
      'Usuario registrado exitosamente. Revisa tu email para el código de verificación.',
    description: 'Mensaje de confirmación del registro',
  })
  message: string;

  @ApiProperty({
    example: '1',
    description: 'ID del usuario registrado',
  })
  userId: string;

  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email del usuario registrado',
  })
  email: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario debe verificar su email',
  })
  requiresVerification: boolean;
}
