import { ApiProperty } from '@nestjs/swagger';

export class UserLoginResponse {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'Juan Pérez García' })
  nombre: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  email: string;

  @ApiProperty({
    example: 'admin',
    description: 'El rol con el que el usuario inició sesión',
  })
  rol_activo: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'Login exitoso' })
  message: string;

  @ApiProperty({ type: UserLoginResponse })
  user: UserLoginResponse;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access token JWT válido por 15 minutos',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token JWT válido por 7 días',
  })
  refreshToken: string;

  @ApiProperty({ example: '15m' })
  expiresIn: string;
}
