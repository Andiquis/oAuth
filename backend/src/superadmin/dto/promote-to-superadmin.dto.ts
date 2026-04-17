import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PromoteToSuperAdminDto {
  @ApiProperty({
    description: 'ID del usuario administrador a promover',
    example: '5',
  })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Código de verificación de 6 dígitos',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty({ message: 'El código de verificación es requerido' })
  @IsString()
  codigoVerificacion: string;
}
