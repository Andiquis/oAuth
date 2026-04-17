# Sistema de Roles y Tablas Secundarias - OAuth Database

## Resumen General

Este sistema de base de datos está diseñado para manejar autenticación OAuth, gestión de usuarios multinivel, control de personal y auditoría completa. Utiliza un enfoque modular con tablas especializadas para diferentes tipos de usuarios.

## Estructura Principal

### 1. Tabla de Roles (t_roles)

**Propósito**: Catálogo estático de roles del sistema organizados por categorías.

#### Categorías de Roles Implementadas:

**Gestión General**

- `superadmin`: Acceso total al sistema
- `admin`: Gestión administrativa sin configuraciones críticas
- `auditor`: Solo lectura para reportes y logs
- `soporte_tecnico`: Gestión de incidencias
- `consultor`: Acceso limitado a dashboards
- `usuario`: Persona registrada sin actividad comercial
- `cliente`: Usuario con historial de compras

**Finanzas y Caja**

- `cajero`, `jefe_caja`, `tesorero`, `contador`, `facturador`

**Inventario y Almacén**

- `almacenero`, `jefe_almacen`, `comprador`, `recepcionista_inventario`, `control_calidad`

**Operaciones y Ventas**

- `vendedor`, `jefe_ventas`, `teleoperador`, `asistente_comercial`, `community_manager`

**Gastronomía/Restobar**

- `mozo`, `bartender`, `chef`, `cocinero_auxiliar`, `hostess`, `delivery`

**Logística**

- `repartidor`, `coordinador_ruta`, `operador_logistico`, `jefe_logistica`

**Turismo/Hotelería**

- `guia_turistico`, `recepcionista`, `conserje`, `agente_reservas`, `chofer`

**Tecnología**

- `desarrollador`, `devops`, `seguridad_informatica`, `analista_datos`, `arquitecto_software`, `qa_tester`, `product_owner`, `scrum_master`

**Legal y RRHH**

- `abogado`, `recursos_humanos`, `reclutador`, `jefe_rrhh`

### 2. Sistema de Usuarios (t_usuarios)

**Características principales**:

- Soporte para OAuth (Google, Facebook, Apple)
- Control de intentos de login fallidos
- Bloqueo temporal de cuentas
- Tokens de recuperación de contraseña
- Verificación de email
- Auditoría completa de actividad

### 3. Asignación Multirol (t_usuario_roles)

**Funcionalidades**:

- Un usuario puede tener múltiples roles
- Historial de asignaciones y revocaciones
- No se eliminan registros, solo se marcan como inactivos
- Trazabilidad completa de cambios de permisos

## Tablas Especializadas por Tipo de Usuario

### 4. Superadministradores (t_superadmin)

- Almacena información biométrica para login facial
- Control de verificación en dos capas
- Configuración de auditoría extendida

### 5. Personal/Empleados (t_personal)

**Información contractual**:

- Código de empleado único
- Datos salariales y comisiones
- Turnos y días laborales programados
- Horarios base y tolerancias

**Formato de días laborales**: Números separados por comas

- `1,2,3,4,5` = Lunes a viernes
- `1,2,3,4,5,6` = Lunes a sábado
- `2,4,6` = Martes, jueves y sábado

### 6. Control de Asistencia (t_asistencia)

**Características avanzadas**:

- Registro de horarios programados vs. reales
- Cálculo automático de tardanzas
- Tipos de eventos: asistencia, ausencia, vacación, permiso, incapacidad, feriado
- Estados: programado, presente, tardanza, falta, justificado
- Justificaciones y observaciones

### 7. Clientes (t_clientes)

- Sistema de puntos y membresías
- Historial de compras
- Niveles: normal, VIP, gold

### 8. Auditoría (t_auditoria_log)

- Registro completo de cambios en todas las tablas
- Almacenamiento de datos anteriores y nuevos en JSON
- Trazabilidad por usuario y dirección IP
- Índices optimizados para consultas de auditoría

## Características Técnicas

### Seguridad y Integridad

- Motor InnoDB para transacciones ACID
- Claves foráneas con CASCADE para consistencia
- Índices optimizados para rendimiento
- Charset utf8mb4 para soporte completo de caracteres

### Funcionalidades de Control de Personal

**Verificación de días laborales**:

```sql
-- Verificar si un empleado debe asistir hoy
SELECT * FROM t_personal
WHERE FIND_IN_SET(DAYOFWEEK(CURDATE()), dias_laborales);
```

**Cálculo automático de tardanzas**:

```sql
-- Actualizar minutos de tardanza
UPDATE t_asistencia
SET minutos_tardanza = GREATEST(0, TIME_TO_SEC(TIMEDIFF(hora_entrada_real, ADDTIME(hora_entrada_programada, '00:15:00'))) / 60)
WHERE fecha = CURDATE() AND hora_entrada_real IS NOT NULL;
```

### Flujos de Trabajo Soportados

1. **Registro de usuarios**: Manual o vía OAuth
2. **Asignación de roles**: Múltiples roles por usuario con historial
3. **Control de asistencia**: Automatizado con cálculo de infracciones
4. **Sistema de puntos**: Para clientes con diferentes niveles
5. **Auditoría completa**: Trazabilidad de todos los cambios
6. **Gestión de horarios**: Flexible y personalizable por empleado

## Escalabilidad y Mantenimiento

- Roles inactivos por defecto para activación gradual
- Estructura modular permite agregar nuevas categorías
- Índices estratégicos para consultas frecuentes
- Compatibilidad con sistemas de gestión empresarial (ERP/CRM)

## Casos de Uso Recomendados

- **Empresas multi-sucursal** con diferentes tipos de empleados
- **Sistemas SaaS** con usuarios y clientes diferenciados
- **Plataformas de comercio** con roles operativos complejos
- **Aplicaciones que requieren** auditoría y trazabilidad completa
- **Organizaciones** con necesidades de control de asistencia automatizado
