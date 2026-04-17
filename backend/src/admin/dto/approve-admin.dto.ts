import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveAdminDto {
  @ApiProperty({
    description: 'Token de aprobación de la solicitud',
    example: 'abc123xyz789...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
