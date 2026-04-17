import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiateAdminRegistrationDto {
  @ApiProperty({
    description: 'Correo electrónico para verificar',
    example: 'admin@empresa.com',
  })
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  email: string;
}
