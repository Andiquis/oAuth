import {
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para asignación de sucursal dentro de CreateEmpleadoDto
export class SucursalAsignacionDto {
  @IsNumber()
  id_sucursal: number;

  @IsOptional()
  @IsBoolean()
  es_responsable?: boolean;
}

export class CreateEmpleadoDto {
  @IsNumber()
  id_usuario: number;

  // === Información Laboral ===
  @IsString()
  cargo: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsString()
  tipo_contrato: string; // indefinido, plazo_fijo, locacion, practicas

  @Type(() => Date)
  @IsDate()
  fecha_contratacion: Date;

  // === Remuneración ===
  @IsOptional()
  @IsNumber()
  salario?: number;

  @IsOptional()
  @IsString()
  moneda?: string; // PEN, USD, EUR

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  comision_porcentaje?: number;

  // === Horario ===
  @IsOptional()
  @IsString()
  turno?: string; // mañana, tarde, noche, rotativo

  @IsOptional()
  @IsString()
  dias_laborales?: string; // "1,2,3,4,5" formato

  @IsOptional()
  @IsString()
  hora_entrada_programada?: string; // "09:00"

  @IsOptional()
  @IsString()
  hora_salida_programada?: string; // "18:00"

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  minutos_tolerancia?: number;

  @IsOptional()
  @IsString()
  horario_general?: string;

  // === Asignaciones a Sucursales (múltiples) ===
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SucursalAsignacionDto)
  sucursales?: SucursalAsignacionDto[];
}

export class UpdateEmpleadoDto {
  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsOptional()
  @IsNumber()
  salario?: number;

  @IsOptional()
  @IsString()
  moneda?: string;

  @IsOptional()
  @IsNumber()
  comision_porcentaje?: number;

  @IsOptional()
  @IsString()
  turno?: string;

  @IsOptional()
  @IsString()
  dias_laborales?: string;

  @IsOptional()
  @IsString()
  hora_entrada_programada?: string;

  @IsOptional()
  @IsString()
  hora_salida_programada?: string;

  @IsOptional()
  @IsNumber()
  minutos_tolerancia?: number;

  @IsOptional()
  @IsString()
  tipo_contrato?: string;

  @IsOptional()
  @IsString()
  estado_personal?: string;
}

export class AsignarSucursalDto {
  @IsNumber()
  id_sucursal: number;

  @IsOptional()
  @IsBoolean()
  es_responsable?: boolean;
}
