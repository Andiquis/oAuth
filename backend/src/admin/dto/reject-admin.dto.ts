import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectAdminDto {
  @ApiProperty({
    description: 'Token de aprobación de la solicitud',
    example: 'abc123xyz789...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiPropertyOptional({
    description: 'Motivo del rechazo (opcional)',
    example: 'No cumple con los requisitos necesarios',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivoRechazo?: string;
}
