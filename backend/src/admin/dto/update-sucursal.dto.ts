import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSucursalDto } from './create-sucursal.dto';

export class UpdateSucursalDto extends PartialType(
  OmitType(CreateSucursalDto, ['password_sucursal', 'id_empresa'] as const),
) {}
