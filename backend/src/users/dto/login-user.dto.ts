import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@example.com',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'MiPassword123!',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  password: string;

  @ApiProperty({
    description:
      'Tipo de usuario con el que desea iniciar sesión (debe coincidir con uno de sus roles asignados)',
    example: 'admin',
    examples: {
      usuario: {
        value: 'usuario',
        description: 'Usuario regular del sistema',
      },
      admin: {
        value: 'admin',
        description: 'Administrador',
      },
      superadmin: {
        value: 'superadmin',
        description: 'Superadministrador',
      },
    },
  })
  @IsNotEmpty({ message: 'El tipo de usuario es requerido' })
  @IsString()
  @MaxLength(50, {
    message: 'El tipo de usuario no puede exceder 50 caracteres',
  })
  tipo_usuario: string;
}
