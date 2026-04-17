import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email del usuario a verificar',
    example: 'juan.perez@example.com',
  })
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @ApiProperty({
    description: 'Código de verificación de 6 dígitos recibido por email',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty({ message: 'El código de verificación es requerido' })
  @IsString()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 caracteres' })
  code: string;
}
