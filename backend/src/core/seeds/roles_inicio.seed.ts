import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../../roles/rol.entity';

// 🔥 Tipo alineado con la ENTITY (no con la BD)
type RolSeed = {
  nombre: string;
  descripcion: string;
  estado: 'activo' | 'inactivo';
};

@Injectable()
export class RolesInicioSeed implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async onApplicationBootstrap() {
    console.log('🌱 Verificando roles iniciales...');

    const rolesData: RolSeed[] = [
      {
        nombre: 'superadmin',
        descripcion:
          'Acceso total al sistema, incluyendo funciones críticas, auditoría y mantenimiento',
        estado: 'activo',
      },
      {
        nombre: 'admin',
        descripcion:
          'Gestión administrativa del sistema, sin acceso a configuraciones críticas',
        estado: 'activo',
      },
      {
        nombre: 'usuario',
        descripcion:
          'Persona registrada en el sistema, aún sin interacción comercial o compra',
        estado: 'activo',
      },
      {
        nombre: 'cliente',
        descripcion:
          'Usuario que ya realizó al menos una compra o interacción comercial con la empresa',
        estado: 'activo',
      },
      {
        nombre: 'cajero',
        descripcion: 'Registro de ventas, cobros y emisión de comprobantes',
        estado: 'inactivo',
      },
      {
        nombre: 'jefe_caja',
        descripcion: 'Supervisión de caja, arqueos y cierres de turno',
        estado: 'inactivo',
      },
      {
        nombre: 'tesorero',
        descripcion:
          'Gestión de fondos, transferencias y conciliaciones bancarias',
        estado: 'inactivo',
      },
      {
        nombre: 'contador',
        descripcion: 'Registros contables, balances y reportes financieros',
        estado: 'inactivo',
      },
      {
        nombre: 'facturador',
        descripcion: 'Emisión de facturas y boletas electrónicas',
        estado: 'inactivo',
      },
      {
        nombre: 'almacenero',
        descripcion: 'Gestión de entradas y salidas de inventario',
        estado: 'inactivo',
      },
      {
        nombre: 'jefe_almacen',
        descripcion: 'Supervisión de inventarios y reposiciones',
        estado: 'inactivo',
      },
      {
        nombre: 'comprador',
        descripcion: 'Solicita y gestiona compras a proveedores',
        estado: 'inactivo',
      },
      {
        nombre: 'recepcionista_inventario',
        descripcion: 'Valida entregas de insumos y productos',
        estado: 'inactivo',
      },
      {
        nombre: 'control_calidad',
        descripcion: 'Inspección de calidad de insumos o productos recibidos',
        estado: 'inactivo',
      },
      {
        nombre: 'vendedor',
        descripcion: 'Atiende clientes y procesa ventas directas',
        estado: 'inactivo',
      },
      {
        nombre: 'jefe_ventas',
        descripcion: 'Supervisión de metas, comisiones y desempeño de ventas',
        estado: 'inactivo',
      },
      {
        nombre: 'teleoperador',
        descripcion: 'Atiende llamadas, cotizaciones y seguimiento',
        estado: 'inactivo',
      },
      {
        nombre: 'asistente_comercial',
        descripcion: 'Apoyo en gestión de clientes y prospectos',
        estado: 'inactivo',
      },
      {
        nombre: 'community_manager',
        descripcion: 'Gestión de redes sociales y publicaciones',
        estado: 'inactivo',
      },
      {
        nombre: 'mozo',
        descripcion: 'Atiende mesas y toma pedidos de clientes',
        estado: 'inactivo',
      },
      {
        nombre: 'bartender',
        descripcion: 'Preparación y servicio de bebidas',
        estado: 'inactivo',
      },
      {
        nombre: 'chef',
        descripcion: 'Responsable de la cocina principal',
        estado: 'inactivo',
      },
      {
        nombre: 'cocinero_auxiliar',
        descripcion: 'Apoyo en preparación y mise en place',
        estado: 'inactivo',
      },
      {
        nombre: 'hostess',
        descripcion: 'Recibe clientes y asigna mesas',
        estado: 'inactivo',
      },
      {
        nombre: 'delivery',
        descripcion: 'Entrega pedidos a domicilio',
        estado: 'inactivo',
      },
      {
        nombre: 'repartidor',
        descripcion: 'Distribución de pedidos a clientes',
        estado: 'inactivo',
      },
      {
        nombre: 'coordinador_ruta',
        descripcion: 'Asigna pedidos y planifica rutas de entrega',
        estado: 'inactivo',
      },
      {
        nombre: 'operador_logistico',
        descripcion: 'Monitorea flota y control de entregas',
        estado: 'inactivo',
      },
      {
        nombre: 'jefe_logistica',
        descripcion: 'Planificación y supervisión de logística',
        estado: 'inactivo',
      },
      {
        nombre: 'guia_turistico',
        descripcion: 'Atiende grupos y realiza recorridos',
        estado: 'inactivo',
      },
      {
        nombre: 'recepcionista',
        descripcion: 'Check-in, check-out y atención de huéspedes',
        estado: 'inactivo',
      },
      {
        nombre: 'conserje',
        descripcion: 'Asistencia a huéspedes con servicios varios',
        estado: 'inactivo',
      },
      {
        nombre: 'agente_reservas',
        descripcion: 'Gestión de reservas y paquetes turísticos',
        estado: 'inactivo',
      },
      {
        nombre: 'chofer',
        descripcion: 'Conduce y transporta clientes',
        estado: 'inactivo',
      },
      {
        nombre: 'desarrollador',
        descripcion: 'Implementación y mantenimiento de software',
        estado: 'inactivo',
      },
      {
        nombre: 'devops',
        descripcion: 'Gestión de despliegues y servidores',
        estado: 'inactivo',
      },
      {
        nombre: 'seguridad_informatica',
        descripcion: 'Monitoreo de accesos y ciberseguridad',
        estado: 'inactivo',
      },
      {
        nombre: 'analista_datos',
        descripcion: 'Minería de datos, BI y reportes analíticos',
        estado: 'inactivo',
      },
      {
        nombre: 'arquitecto_software',
        descripcion: 'Define la arquitectura y buenas prácticas técnicas',
        estado: 'inactivo',
      },
      {
        nombre: 'qa_tester',
        descripcion: 'Pruebas de calidad, automatización y reporte de bugs',
        estado: 'inactivo',
      },
      {
        nombre: 'product_owner',
        descripcion: 'Define requerimientos y prioridades del producto',
        estado: 'inactivo',
      },
      {
        nombre: 'scrum_master',
        descripcion: 'Facilita la metodología ágil y remueve impedimentos',
        estado: 'inactivo',
      },
      {
        nombre: 'abogado',
        descripcion: 'Gestión legal, contratos y asesoría jurídica',
        estado: 'inactivo',
      },
      {
        nombre: 'recursos_humanos',
        descripcion: 'Gestión de personal, nómina y procesos de RRHH',
        estado: 'inactivo',
      },
      {
        nombre: 'reclutador',
        descripcion: 'Selección y contratación de personal',
        estado: 'inactivo',
      },
      {
        nombre: 'jefe_rrhh',
        descripcion: 'Supervisión general del área de recursos humanos',
        estado: 'inactivo',
      },
    ];

    // 🔥 Obtener existentes
    const existentes = await this.rolRepository.find({
      select: ['nombre'],
    });

    const nombresExistentes = existentes.map((r) => r.nombre);

    // 🔥 Filtrar nuevos
    const nuevosRoles = rolesData.filter(
      (rol) => !nombresExistentes.includes(rol.nombre),
    );

    if (nuevosRoles.length > 0) {
      const entidades = this.rolRepository.create(nuevosRoles);
      await this.rolRepository.save(entidades);

      console.log(`✅ ${nuevosRoles.length} roles insertados`);
    } else {
      console.log('⚡ Todos los roles ya existen');
    }

    console.log('🌱 Seed de roles completado');
  }
}
