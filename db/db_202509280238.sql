-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS db_oauth
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Seleccionar la base de datos
USE db_oauth;



-- ==========================================
-- CONFIGURACIÓN DE BASE DE DATOS
-- ==========================================
SET NAMES utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;























-- ==========================================
-- 1. ROLES DEL SISTEMA
--    - Define el catálogo estático de roles.
--    - No se modifica en operacio    id_notificacion_masiva BIGINT AUTO_INCREMENT PRIMARY KEY,
nes comunes.
--    - Ejemplos: superadmin, admin, cajero, mesero, cliente.
-- ==========================================
CREATE TABLE t_roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL,
    estado_rol ENUM('activo','inactivo') DEFAULT 'activo',
    descripcion_rol TEXT,
    INDEX idx_nombre_rol (nombre_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- Roles de Gestión General
-- ==========================================
INSERT INTO t_roles (nombre_rol, descripcion_rol, estado_rol) VALUES
('superadmin', 'Acceso total al sistema, incluyendo funciones críticas, auditoría y mantenimiento', 'activo'),
('admin', 'Gestión administrativa del sistema, sin acceso a configuraciones críticas', 'activo'),
('auditor', 'Acceso de solo lectura a reportes, logs y trazabilidad', 'inactivo'),
('soporte_tecnico', 'Gestión de incidencias, tickets y mantenimiento técnico', 'inactivo'),
('consultor', 'Acceso limitado a reportes y dashboards de análisis', 'inactivo'),
('usuario', 'Persona registrada en el sistema, aún sin interacción comercial o compra', 'activo'),
('cliente', 'Usuario que ya realizó al menos una compra o interacción comercial con la empresa', 'activo');

-- ==========================================
-- Roles de Finanzas y Caja
-- ==========================================
INSERT INTO t_roles (nombre_rol, descripcion_rol, estado_rol) VALUES
('cajero', 'Registro de ventas, cobros y emisión de comprobantes', 'inactivo'),
('jefe_caja', 'Supervisión de caja, arqueos y cierres de turno', 'inactivo'),
('tesorero', 'Gestión de fondos, transferencias y conciliaciones bancarias', 'inactivo'),
('contador', 'Registros contables, balances y reportes financieros', 'inactivo'),
('facturador', 'Emisión de facturas y boletas electrónicas', 'inactivo');

-- ==========================================
-- Roles de Inventario y Almacén
-- ==========================================
INSERT INTO t_roles (nombre_rol, descripcion_rol, estado_rol) VALUES
('almacenero', 'Gestión de entradas y salidas de inventario', 'inactivo'),
('jefe_almacen', 'Supervisión de inventarios y reposiciones', 'inactivo'),
('comprador', 'Solicita y gestiona compras a proveedores', 'inactivo'),
('recepcionista_inventario', 'Valida entregas de insumos y productos', 'inactivo'),
('control_calidad', 'Inspección de calidad de insumos o productos recibidos', 'inactivo');

-- ==========================================
-- Roles de Operaciones y Ventas
-- ==========================================
INSERT INTO t_roles (nombre_rol, descripcion_rol, estado_rol) VALUES
('vendedor', 'Atiende clientes y procesa ventas directas', 'inactivo'),
('jefe_ventas', 'Supervisión de metas, comisiones y desempeño de ventas', 'inactivo'),
('teleoperador', 'Atiende llamadas, cotizaciones y seguimiento', 'inactivo'),
('asistente_comercial', 'Apoyo en gestión de clientes y prospectos', 'inactivo'),
('community_manager', 'Gestión de redes sociales y publicaciones', 'inactivo');

-- ==========================================
-- Roles en Gastronomía / Restobar
-- ==========================================
INSERT INTO t_roles (nombre_rol, descripcion_rol, estado_rol) VALUES
('mozo', 'Atiende mesas y toma pedidos de clientes', 'inactivo'),
('bartender', 'Preparación y servicio de bebidas', 'inactivo'),
('chef', 'Responsable de la cocina principal', 'inactivo'),
('cocinero_auxiliar', 'Apoyo en preparación y mise en place', 'inactivo'),
('hostess', 'Recibe clientes y asigna mesas', 'inactivo'),
('delivery', 'Entrega pedidos a domicilio', 'inactivo');

-- ==========================================
-- Roles de Logística y Delivery
-- ==========================================
INSERT INTO t_roles (nombre_rol, descripcion_rol, estado_rol) VALUES
('repartidor', 'Distribución de pedidos a clientes', 'inactivo'),
('coordinador_ruta', 'Asigna pedidos y planifica rutas de entrega', 'inactivo'),
('operador_logistico', 'Monitorea flota y control de entregas', 'inactivo'),
('jefe_logistica', 'Planificación y supervisión de logística', 'inactivo');

-- ==========================================
-- Roles en Turismo / Hotelería
-- ==========================================
INSERT INTO t_roles (nombre_rol, descripcion_rol, estado_rol) VALUES
('guia_turistico', 'Atiende grupos y realiza recorridos', 'inactivo'),
('recepcionista', 'Check-in, check-out y atención de huéspedes', 'inactivo'),
('conserje', 'Asistencia a huéspedes con servicios varios', 'inactivo'),
('agente_reservas', 'Gestión de reservas y paquetes turísticos', 'inactivo'),
('chofer', 'Conduce y transporta clientes', 'inactivo');

-- ==========================================
-- Roles de TI
-- ==========================================
INSERT INTO t_roles (nombre_rol, descripcion_rol, estado_rol) VALUES
('desarrollador', 'Implementación y mantenimiento de software', 'inactivo'),
('devops', 'Gestión de despliegues y servidores', 'inactivo'),
('seguridad_informatica', 'Monitoreo de accesos y ciberseguridad', 'inactivo'),
('analista_datos', 'Minería de datos, BI y reportes analíticos', 'inactivo'),
('arquitecto_software', 'Define la arquitectura y buenas prácticas técnicas', 'inactivo'),
('qa_tester', 'Pruebas de calidad, automatización y reporte de bugs', 'inactivo'),
('product_owner', 'Define requerimientos y prioridades del producto', 'inactivo'),
('scrum_master', 'Facilita la metodología ágil y remueve impedimentos', 'inactivo');

-- ==========================================
-- Roles Legales y Recursos Humanos
-- ==========================================
INSERT INTO t_roles (nombre_rol, descripcion_rol, estado_rol) VALUES
('abogado', 'Gestión legal, contratos y asesoría jurídica', 'inactivo'),
('recursos_humanos', 'Gestión de personal, nómina y procesos de RRHH', 'inactivo'),
('reclutador', 'Selección y contratación de personal', 'inactivo'),
('jefe_rrhh', 'Supervisión general del área de recursos humanos', 'inactivo');

















-- ==========================================
-- 2. USUARIOS (Tabla principal de identidad)
-- ==========================================
-- ==========================================
-- Tabla: t_usuarios
-- Propósito: Almacena la identidad y credenciales de todos los usuarios del sistema.
-- Flujos cubiertos:
--   - Registro de usuario (manual o por OAuth)
--   - Inicio de sesión y control de acceso
--   - Recuperación de cuenta y bloqueo por intentos fallidos
--   - Auditoría de creación y modificaciones
--   - Soporte para login con Google, Facebook, Apple (proveedor_oauth, sub_oauth)
--   - Estado activo/inactivo del usuario
--
-- No almacena roles ni permisos (ver t_usuario_roles)
-- ==========================================
CREATE TABLE t_usuarios (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Identidad
    nombre_user VARCHAR(200) NOT NULL,
    dni_user VARCHAR(20) UNIQUE DEFAULT NULL,
    email_user VARCHAR(255) UNIQUE NOT NULL,
    telefono_user VARCHAR(20) DEFAULT NULL,
    direccion_user TEXT DEFAULT NULL,
    foto_url_user VARCHAR(500) DEFAULT NULL,

    -- Seguridad
    password_user VARCHAR(255) NOT NULL,
    email_verificado BOOLEAN DEFAULT FALSE,
    intentos_login_fallidos INT DEFAULT 0,
    bloqueado_hasta TIMESTAMP DEFAULT NULL,
    ultimo_login TIMESTAMP DEFAULT NULL,

    -- Recuperación de cuenta
    token_recuperacion VARCHAR(100) DEFAULT NULL,
    token_expiracion TIMESTAMP DEFAULT NULL,

    -- OAuth
    proveedor_oauth ENUM('google', 'facebook', 'apple') DEFAULT NULL,
    sub_oauth VARCHAR(100) UNIQUE DEFAULT NULL,

    -- Estado global
    activo BOOLEAN DEFAULT TRUE,

    -- Auditoría
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Índices
    INDEX idx_email_user (email_user),
    INDEX idx_dni_user (dni_user),
    INDEX idx_ultimo_login (ultimo_login),
    INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;













-- ==========================================
-- 3. RELACIÓN USUARIO-ROL (Multirol + Historial simple)
--    - Permite asignar varios roles a un mismo usuario.
--    - No se borra una relación, solo se marca como 'inactivo'.
--    - El historial se conserva con:
--        fecha_asignacion → cuándo se otorgó el rol.
--        fecha_revocacion → cuándo se revocó (NULL si sigue activo).
--
--    FLUJO QUE CUBRE:
--    a) Asignación inicial: INSERT con estado 'activo' y fecha_asignacion = NOW().
--    b) Revocación: UPDATE → estado 'inactivo' + fecha_revocacion = NOW().
--    c) Reasignación: UPDATE → estado 'activo' + fecha_revocacion = NULL.
--    d) Auditoría: permite ver roles vigentes y también cuáles se tuvieron antes.
-- ==========================================

CREATE TABLE t_usuario_roles (
    id_usuario BIGINT NOT NULL,
    id_rol INT NOT NULL,
    fecha_asignacion_rol DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_revocacion_rol DATETIME DEFAULT NULL, -- opcional: cuándo se deshabilitó
    estado_asignacion_rol ENUM('activo','inactivo') DEFAULT 'activo',

    PRIMARY KEY (id_usuario, id_rol),
    CONSTRAINT fk_ur_usuario FOREIGN KEY (id_usuario) REFERENCES t_usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_ur_rol FOREIGN KEY (id_rol) REFERENCES t_roles(id_rol) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;















-- ==========================================
-- 3. SUPERADMIN
--    esta tabla es de informacion complementaria a la tabla de usuarios en caso de que el usuario sea de rol superadmin
-- ==========================================
CREATE TABLE t_superadmin (
    id_superadmin INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    login_facial LONGBLOB DEFAULT NULL,
    verificacion_segunda_capa BOOLEAN DEFAULT FALSE,
    auditoria_extendida BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_root_usuario FOREIGN KEY (id_usuario) REFERENCES t_usuarios(id_usuario) ON DELETE CASCADE,

    INDEX idx_id_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;









-- ==========================================
-- 4. PERSONAL (admin, cajero, etc.)
--    Información laboral y contractual de empleados. Contiene datos generales y fijos del personal.
--    Para control detallado de horarios y asistencia, ver tabla t_asistencia.
-- ==========================================
CREATE TABLE t_personal (
    id_personal INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    codigo_empleado VARCHAR(20) UNIQUE,
    cargo VARCHAR(100),
    salario DECIMAL(10,2),
    comision_porcentaje DECIMAL(5,2) DEFAULT 0.00,
    turno ENUM('mañana','tarde','noche','rotativo') DEFAULT 'mañana',
    dias_laborales VARCHAR(20) DEFAULT '1,2,3,4,5', -- Días de la semana: 1=Lunes, 2=Martes, ... 7=Domingo
    hora_entrada_programada TIME DEFAULT '09:00:00',
    hora_salida_programada TIME DEFAULT '18:00:00',
    minutos_tolerancia INT DEFAULT 15, -- Tolerancia para no ser marcado como tardanza
    horario_general VARCHAR(100), -- Descripción general: "Lunes a viernes 9:00-18:00"
    fecha_contratacion DATE,
    fecha_cese DATE,

    CONSTRAINT fk_personal_usuario FOREIGN KEY (id_usuario) REFERENCES t_usuarios(id_usuario) ON DELETE CASCADE,

    INDEX idx_id_usuario (id_usuario),
    INDEX idx_codigo_empleado (codigo_empleado),
    INDEX idx_cargo (cargo),
    INDEX idx_fecha_contratacion (fecha_contratacion),
    INDEX idx_turno (turno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4.1 ASISTENCIA Y HORARIOS
--     Control detallado de horarios, asistencias, ausencias y eventos laborales del personal.
--     Permite registrar entrada/salida diaria, justificaciones, vacaciones, permisos, etc.
--     El sistema puede calcular automáticamente tardanzas comparando hora_entrada con hora_entrada_programada + minutos_tolerancia.
-- ==========================================
CREATE TABLE t_asistencia (
    id_asistencia BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_personal INT NOT NULL,
    fecha DATE NOT NULL,
    tipo_evento ENUM('asistencia','ausencia','vacacion','permiso','incapacidad','feriado') DEFAULT 'asistencia',
    hora_entrada_programada TIME DEFAULT NULL, -- Copiada de t_personal al momento del registro
    hora_salida_programada TIME DEFAULT NULL,  -- Copiada de t_personal al momento del registro
    hora_entrada_real TIME DEFAULT NULL,       -- Hora real de entrada registrada
    hora_salida_real TIME DEFAULT NULL,        -- Hora real de salida registrada
    minutos_tardanza INT DEFAULT 0,            -- Calculado automáticamente
    horas_trabajadas DECIMAL(4,2) DEFAULT NULL,
    justificacion TEXT DEFAULT NULL,
    observaciones TEXT DEFAULT NULL,
    estado ENUM('programado','presente','tardanza','falta','justificado') DEFAULT 'programado',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_asistencia_personal FOREIGN KEY (id_personal) REFERENCES t_personal(id_personal) ON DELETE CASCADE,

    INDEX idx_id_personal (id_personal),
    INDEX idx_fecha (fecha),
    INDEX idx_tipo_evento (tipo_evento),
    INDEX idx_estado (estado),
    INDEX idx_fecha_personal (fecha, id_personal),
    INDEX idx_tardanza (minutos_tardanza)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;











-- ==========================================
-- 5. CLIENTES
-- ==========================================
CREATE TABLE t_clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    puntos_acumulados INT DEFAULT 0,
    total_compras DECIMAL(10,2) DEFAULT 0.00,
    nivel_membresia ENUM('normal', 'vip', 'gold') DEFAULT 'normal',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cliente_usuario FOREIGN KEY (id_usuario) REFERENCES t_usuarios(id_usuario) ON DELETE CASCADE,

    INDEX idx_id_usuario (id_usuario),
    INDEX idx_nivel_membresia (nivel_membresia),
    INDEX idx_total_compras (total_compras)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. LOG DE AUDITORÍA
-- ==========================================
CREATE TABLE t_auditoria_log (
    id_log BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT,
    tabla_afectada VARCHAR(100) NOT NULL,
    accion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    registro_id BIGINT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (id_usuario) REFERENCES t_usuarios(id_usuario) ON DELETE SET NULL,

    INDEX idx_id_usuario (id_usuario),
    INDEX idx_tabla_accion (tabla_afectada, accion),
    INDEX idx_fecha_accion (fecha_accion),
    INDEX idx_registro_id (registro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- NOTAS TÉCNICAS Y CONSIDERACIONES
-- ==========================================
-- 1. Todas las tablas usan InnoDB para garantizar integridad referencial y transacciones ACID.
-- 2. utf8mb4 permite caracteres especiales y emojis.
-- 3. Los índices están optimizados para consultas frecuentes (búsquedas por email, fecha, estado).
-- 4. Las claves foráneas incluyen CASCADE para mantener consistencia al eliminar registros.
-- 5. La tabla t_auditoria_log registra cambios para trazabilidad y seguridad.
-- 6. El sistema multirol permite asignar varios roles a un mismo usuario.
-- 7. Para horarios complejos, usar t_asistencia junto con los campos programados en t_personal.

-- ==========================================
-- CONSULTAS ÚTILES PARA CONTROL DE ASISTENCIA
-- ==========================================

-- Verificar si un empleado debe asistir hoy:
-- SELECT * FROM t_personal WHERE FIND_IN_SET(DAYOFWEEK(CURDATE()), dias_laborales);

-- Calcular tardanza automáticamente:
-- UPDATE t_asistencia SET minutos_tardanza = GREATEST(0, TIME_TO_SEC(TIMEDIFF(hora_entrada_real, ADDTIME(hora_entrada_programada, '00:15:00'))) / 60)
-- WHERE fecha = CURDATE() AND hora_entrada_real IS NOT NULL;


