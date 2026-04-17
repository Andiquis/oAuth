import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez García',
    minLength: 3,
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario (debe ser único)',
    example: 'juan.perez@example.com',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  email: string;

  @ApiProperty({
    description:
      'Contraseña (mínimo 8 caracteres, debe incluir mayúscula, minúscula y número/símbolo)',
    example: 'MiPassword123!',
    minLength: 8,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número o carácter especial',
  })
  password: string;

  @ApiProperty({
    description: 'Número de teléfono (opcional)',
    example: '+51 987654321',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  @Matches(/^\+?[0-9\s\-()]+$/, {
    message:
      'El teléfono debe contener solo números, espacios, guiones, paréntesis o símbolo +',
  })
  telefono?: string;

  @ApiProperty({
    description: 'URL de la foto de perfil (opcional)',
    example: 'https://ui-avatars.com/api/?name=Juan+Perez',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la foto debe ser válida' })
  @MaxLength(500, {
    message: 'La URL de la foto no puede exceder 500 caracteres',
  })
  fotoUrl?: string;

  @ApiProperty({
    description: 'Código de invitación de la empresa (opcional)',
    example: 'EMP-ABC123',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message: 'El código de invitación no puede exceder 50 caracteres',
  })
  codigoInvitacion?: string;
}
