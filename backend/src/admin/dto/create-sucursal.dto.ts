import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  Length,
  Matches,
  IsNumber,
  IsDecimal,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EstadoSucursal {
  ACTIVA = 'activa',
  INACTIVA = 'inactiva',
  BLOQUEADA = 'bloqueada',
}

export class CreateSucursalDto {
  @ApiProperty({
    description: 'ID de la empresa a la que pertenece la sucursal',
    example: 1,
  })
  @IsNumber()
  id_empresa: number;

  @ApiPropertyOptional({
    description:
      'Código único de la sucursal (se genera automáticamente si no se proporciona)',
    example: 'SUC-001',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(3, 20, { message: 'El código debe tener entre 3 y 20 caracteres' })
  codigo_sucursal?: string;

  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sucursal Centro',
    maxLength: 150,
  })
  @IsString()
  @Length(3, 150, { message: 'El nombre debe tener entre 3 y 150 caracteres' })
  nombre_sucursal: string;

  @ApiProperty({
    description: 'Contraseña de acceso de la sucursal',
    example: 'Sucursal123!',
    minLength: 8,
  })
  @IsString()
  @Length(8, 100, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password_sucursal: string;

  @ApiPropertyOptional({
    description: 'Dirección física de la sucursal',
    example: 'Av. Comercial 456, Miraflores',
  })
  @IsOptional()
  @IsString()
  direccion_sucursal?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+51 912345678',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(7, 20)
  telefono_sucursal?: string;

  @ApiPropertyOptional({
    description: 'Email de la sucursal',
    example: 'centro@rosanegra.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email_sucursal?: string;

  @ApiPropertyOptional({
    description: 'Ciudad donde se ubica',
    example: 'Lima',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  ciudad_sucursal?: string;

  @ApiPropertyOptional({
    description: 'Departamento/Región',
    example: 'Lima',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  departamento_sucursal?: string;

  @ApiPropertyOptional({
    description: 'País',
    example: 'Perú',
    default: 'Perú',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  pais_sucursal?: string;

  @ApiPropertyOptional({
    description: 'Latitud de la ubicación',
    example: -12.046374,
  })
  @IsOptional()
  @IsNumber()
  latitud?: number;

  @ApiPropertyOptional({
    description: 'Longitud de la ubicación',
    example: -77.042793,
  })
  @IsOptional()
  @IsNumber()
  longitud?: number;

  @ApiPropertyOptional({
    description: 'Indica si es la sucursal matriz',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  es_matriz?: boolean;

  @ApiPropertyOptional({
    description: 'Estado de la sucursal',
    enum: EstadoSucursal,
    default: EstadoSucursal.ACTIVA,
  })
  @IsOptional()
  @IsEnum(EstadoSucursal, { message: 'Estado de sucursal inválido' })
  estado_sucursal?: EstadoSucursal;

  @ApiPropertyOptional({
    description: 'ID del usuario que crea la sucursal',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  creado_por?: number;
}
