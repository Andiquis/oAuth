import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
  Matches,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAdminDto {
  @ApiProperty({
    description: 'Nombre completo del administrador',
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
    description: 'Correo electrónico del administrador (debe ser único)',
    example: 'admin@empresa.com',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  email: string;

  @ApiProperty({
    description:
      'Contraseña (mínimo 8 caracteres, debe incluir mayúscula, minúscula y número/símbolo)',
    example: 'AdminPass123!',
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
    description: 'Número de teléfono del administrador (opcional)',
    example: '+51999999999',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, {
    message: 'El teléfono no puede exceder 20 caracteres',
  })
  telefono?: string;

  @ApiProperty({
    description: 'URL de la foto de perfil del administrador (opcional)',
    example: 'https://example.com/photo.jpg',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la foto debe ser válida' })
  @MaxLength(255, { message: 'La URL no puede exceder 255 caracteres' })
  fotoUrl?: string;

  @ApiProperty({
    description:
      'Mensaje opcional explicando por qué desea ser administrador (máx. 500 caracteres)',
    example:
      'Tengo 5 años de experiencia en gestión de sistemas y deseo colaborar en la administración de la plataforma.',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'El mensaje no puede exceder 500 caracteres',
  })
  mensaje?: string;
}
