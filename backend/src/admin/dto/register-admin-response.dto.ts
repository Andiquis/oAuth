import { ApiProperty } from '@nestjs/swagger';

export class RegisterAdminResponseDto {
  @ApiProperty({
    example:
      'Solicitud de administrador enviada. Recibirás una notificación cuando sea aprobada.',
    description: 'Mensaje de confirmación',
  })
  message: string;

  @ApiProperty({
    example: '1',
    description: 'ID de la solicitud creada',
  })
  solicitudId: string;

  @ApiProperty({
    example: 'admin@empresa.com',
    description: 'Email del solicitante',
  })
  email: string;

  @ApiProperty({
    example: 'pendiente',
    description: 'Estado inicial de la solicitud',
  })
  estado: string;

  @ApiProperty({
    example: '2025-11-13T10:30:00.000Z',
    description: 'Fecha de la solicitud',
  })
  fechaSolicitud: Date;

  @ApiProperty({
    example: 7,
    description: 'Días hasta que expire la solicitud si no es aprobada',
  })
  diasExpiracion: number;
}
