import { registerAs } from '@nestjs/config';

export interface FacturacionConfig {
  montoActivacionEmpresa: number;
  montoMensualSucursal: number;
  diasGracia: number;
  diaBloqueo: number;
}

export default registerAs(
  'facturacion',
  (): FacturacionConfig => ({
    montoActivacionEmpresa: parseFloat(
      process.env.FACTURACION_MONTO_ACTIVACION_EMPRESA || '50',
    ),
    montoMensualSucursal: parseFloat(
      process.env.FACTURACION_MONTO_MENSUAL_SUCURSAL || '20',
    ),
    diasGracia: parseInt(process.env.FACTURACION_DIAS_GRACIA || '3', 10),
    diaBloqueo: parseInt(process.env.FACTURACION_DIA_BLOQUEO || '4', 10),
  }),
);
