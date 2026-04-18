# 📑 Sistema de Roles y Tablas Secundarias - OAuth Database

Este documento detalla la estructura, flujos y arquitectura de la base de datos para manejar la autenticación OAuth, gestión de usuarios multinivel, control de personal y auditoría completa en el sistema.

## 📋 Índice
1. [Resumen General]bien(#1--resumen-general)
2. [Problema Inicial](#2--problema-inicial)
3. [Estructura Principal](#3--estructura-principal)
   - [Sistema de Usuarios (`t_usuarios`)](#31-sistema-de-usuarios-t_usuarios)
   - [Tabla de Roles (`t_roles`)](#32-tabla-de-roles-t_roles)
   - [Asignación Multirol (`t_usuario_roles`)](#33-asignación-multirol-t_usuario_roles)
4. [Tablas Especializadas por Tipo de Usuario](#4--tablas-especializadas-por-tipo-de-usuario)
   - [Superadministradores](#41-superadministradores-t_superadmin)
   - [Personal / Empleados](#42-personalempleados-t_personal)
   - [Control de Asistencia](#43-control-de-asistencia-t_asistencia)
   - [Clientes versus Usuarios](#44-clientes-t_clientes-versus-usuarios)
   - [Auditoría](#45-auditoría-t_auditoria_log)
5. [Casos Especiales y Flujos de Roles](#5--casos-especiales-y-flujos-de-roles)
   - [Admin con roles menores y Flujo de Cajero](#51-admin-con-roles-menores-y-flujo-operativo)
6. [Sistema de Login con Roles y Contexto](#6--sistema-de-login-con-roles-y-contexto)
7. [Características Técnicas](#7--características-técnicas)
8. [Flujos de Trabajo Soportados](#8--flujos-de-trabajo-soportados)
9. [Escalabilidad y Mantenimiento](#9--escalabilidad-y-mantenimiento)
10. [Casos de Uso Recomendados](#10--casos-de-uso-recomendados)

---

## 1. 📌 Resumen General
Este sistema de base de datos está diseñado para manejar autenticación OAuth, gestión de usuarios multinivel, control de personal y auditoría completa. Utiliza un enfoque modular con tablas especializadas para diferentes tipos de usuarios.

---

## 2. 📌 Problema Inicial
**¿Cómo manejar los roles del sistema y su relación con los usuarios?**

### 🔍 Preguntas planteadas
- **¿Superadmin es igual a root?**
  - *Root* es el nivel más alto, técnico y absoluto.
  - *Superadmin* puede ser un rol de gestión avanzada, pero está por debajo de root.
- **¿Accesos por rol o por nivel numérico?**
  - Mejor por roles, no por jerarquías numéricas.
  - Un rol superior (admin) no debe heredar funciones de roles inferiores (cajero, mesero).
- **¿Por qué el admin no puede hacer el trabajo del cajero?**
  - Cada rol tiene funciones separadas y auditablemente delimitadas.
  - Si el admin alterara registros de caja sin rol de cajero, se perdería trazabilidad.

---

## 3. 📌 Estructura Principal

### 3.1. Sistema de Usuarios (`t_usuarios`)
**Características principales:**
- Soporte para OAuth (Google, Facebook, Apple).
- Control de intentos de login fallidos y bloqueo temporal de cuentas.
- Tokens de recuperación de contraseña y verificación de email.
- Auditoría completa de actividad.

### 3.2. Tabla de Roles (`t_roles`)
**Propósito:** Catálogo estático de roles del sistema organizados por categorías. No se modifica dinámicamente salvo para habilitar/inactivar un rol.

```sql
CREATE TABLE t_roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL,
    estado_rol ENUM('activo','inactivo') DEFAULT 'activo',
    descripcion_rol TEXT,
    INDEX idx_nombre_rol (nombre_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Categorías de Roles Implementadas:**
- **Gestión General:** `superadmin` (Acceso total al sistema), `admin` (Gestión sin configs críticas), `auditor` (Solo lectura/logs), `soporte_tecnico` (Incidencias), `consultor` (Dashboards limitados), `usuario` (Registrado sin actividad), `cliente` (Con compras).
- **Finanzas y Caja:** `cajero`, `jefe_caja`, `tesorero`, `contador`, `facturador`.
- **Inventario y Almacén:** `almacenero`, `jefe_almacen`, `comprador`, `recepcionista_inventario`, `control_calidad`.
- **Operaciones y Ventas:** `vendedor`, `jefe_ventas`, `teleoperador`, `asistente_comercial`, `community_manager`.
- **Gastronomía/Restobar:** `mozo`, `bartender`, `chef`, `cocinero_auxiliar`, `hostess`, `delivery`.
- **Logística:** `repartidor`, `coordinador_ruta`, `operador_logistico`, `jefe_logistica`.
- **Turismo/Hotelería:** `guia_turistico`, `recepcionista`, `conserje`, `agente_reservas`, `chofer`.
- **Tecnología:** `desarrollador`, `devops`, `seguridad_informatica`, `analista_datos`, `arquitecto_software`, `qa_tester`, `product_owner`, `scrum_master`.
- **Legal y RRHH:** `abogado`, `recursos_humanos`, `reclutador`, `jefe_rrhh`.

### 3.3. Asignación Multirol (`t_usuario_roles`)
Soporta que un usuario tenga múltiples roles y mantiene una trazabilidad completa de cambios de permisos. Las relaciones no se borran, se inhabilitan con `estado_asignacion`.

```sql
CREATE TABLE t_usuario_roles (
    id_usuario BIGINT NOT NULL,
    id_rol INT NOT NULL,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_revocacion DATETIME DEFAULT NULL,
    estado_asignacion ENUM('activo','inactivo') DEFAULT 'activo',

    PRIMARY KEY (id_usuario, id_rol),
    CONSTRAINT fk_ur_usuario FOREIGN KEY (id_usuario) REFERENCES t_usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_ur_rol FOREIGN KEY (id_rol) REFERENCES t_roles(id_rol) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Flujos Cubiertos:**
- **Asignación inicial:** Se inserta relación con estado activo. Ejemplo: un usuario obtiene el rol de cajero.
- **Revocación de rol:** Se actualiza `estado_asignacion = inactivo` y `fecha_revocacion = NOW()`. Se conserva historial.
- **Reasignación:** Reactivar rol existente (`UPDATE estado_asignacion = activo...`) o insertar nuevo registro.
- **Auditoría Multirol:** Siempre se puede saber qué rol tuvo un usuario, en qué periodo de tiempo y cuáles roles estuvieron activos en paralelo.

---

## 4. 📌 Tablas Especializadas por Tipo de Usuario

### 4.1. Superadministradores (`t_superadmin`)
- Almacena información biométrica para login facial.
- Control de verificación en dos capas.
- Configuración de auditoría extendida.

### 4.2. Personal/Empleados (`t_personal`)
**Información contractual:**
- Código de empleado único.
- Datos salariales y comisiones.
- Turnos, horarios base, días laborales programados y tolerancias.
- **Formato de días laborales:** Números separados por comas. (ej. `1,2,3,4,5` = Lunes a viernes; `2,4,6` = Martes, jueves y sábado).

### 4.3. Control de Asistencia (`t_asistencia`)
**Características avanzadas:**
- Registro de horarios programados vs. reales.
- Cálculo automático de tardanzas.
- Tipos de eventos: asistencia, ausencia, vacación, permiso, incapacidad, feriado.
- Estados: programado, presente, tardanza, falta, justificado.
- Justificaciones y observaciones.

### 4.4. Clientes (`t_clientes`) versus Usuarios
- **Usuario:** Persona que se registra en el sistema (por ejemplo, landing page, app) pero aún no ha realizado compras ni interacción comercial relevante. Es el perfil base tras el registro.
- **Cliente:** Usuario que ya realizó al menos una compra o interacción comercial con la empresa. Al convertirse en cliente, puede acceder a beneficios, historial de compras, servicios exclusivos. El sistema puede asignar automáticamente este rol al detectar la interacción.
- **Características `t_clientes`:** Sistema de puntos y membresías, historial de compras, niveles (normal, VIP, gold). Esta distinción permite segmentar permisos, flujos y reportes según el nivel de relación con la empresa.

### 4.5. Auditoría (`t_auditoria_log`)
- Registro completo de cambios en todas las tablas.
- Almacenamiento de datos anteriores y nuevos en formato JSON.
- Trazabilidad por usuario y dirección IP.
- Índices optimizados para consultas de auditoría.

---

## 5. 📌 Casos Especiales y Flujos de Roles

### 5.1. Admin con roles menores y Flujo Operativo
**El Problema:** El admin no puede realizar tareas de cajero o mesero porque su rol no tiene esas acciones. Sin embargo, en casos de emergencia, el admin debe poder actuar operativamente y que quede registrado como tal.

**La Solución:** Permitir roles redundantes de forma temporal.
- Claridad en la auditoría. Flexibilidad controlada.
- Jerarquía respetada: solo admins pueden asumir roles menores, nunca al revés.

**Flujo de Admin con rol de Cajero:**
1. **Asignación temporal:**
   ```sql
   INSERT INTO t_usuario_roles (id_usuario, id_rol, estado_asignacion)
   VALUES (123, (SELECT id_rol FROM t_roles WHERE nombre_rol = 'cajero'), 'activo');
   ```
2. **Operación:** Opera como cajero (abre caja, registra ventas). Todo queda registrado bajo su rol cajero.
3. **Revocación:** Se revoca rol temporal.
   ```sql
   UPDATE t_usuario_roles
   SET estado_asignacion = 'inactivo', fecha_revocacion = NOW()
   WHERE id_usuario = 123 AND id_rol = (SELECT id_rol FROM t_roles WHERE nombre_rol = 'cajero');
   ```

---

## 6. 📘 Sistema de Login con Roles y Contexto

Se definen dos modalidades de login, ambas válidas dependiendo de la arquitectura del frontend. El contexto no define permisos, **solo define dónde empieza la experiencia del usuario.**

### 🧭 Modalidad 1: Login con Contexto Explícito
*(Por solicitud del frontend)*

**📌 Idea:** El frontend ya sabe a qué sistema está entrando (admin, caja, cocina) y lo envía como contexto en el login.

**🔄 Flujo:**
1. **Login:** Envía credenciales + `"context": "cashier"`.
2. **Backend valida:** `if (!user.roles.includes(context)) throw new Error();`
3. **Respuesta:** Token JWT + `"activeRole": "cashier"`.

**🎯 Cuándo usarlo y Resultados:**
- Entra directo al módulo solicitado. No hay selección de rol y el frontend ya define el “mundo”.
- Ideal para **múltiples aplicaciones separadas** (`admin-app`, `cashier-app`, `kitchen-app`) donde cada frontend tiene una identidad clara.

### 🧭 Modalidad 2: Login sin Contexto (Selección Post-login)

**📌 Idea:** El usuario entra sin definir contexto y el sistema le devuelve todos sus roles activos para que el usuario o frontend decida.

**🔄 Flujo:**
1. **Login:** Envía solo credenciales.
2. **Backend responde:** Envía Token JWT + Todos los roles posibles (`["admin", "cajero"]`).
3. **Frontend decide:**
   - *1 rol:* Auto-redirige al módulo correspondiente.
   - *Múltiples roles:* Muestra UI de selección (`¿Con qué rol deseas ingresar? [ Admin ] [ Cajero ]`).
4. **Switch de contexto:** Envía al backend `/auth/switch-role` con el rol seleccionado. Permite que el backend asigne el contexto de sesión y cargue el módulo (Caja, admin, etc.).

**🎯 Cuándo usarlo y Resultados:**
- Ideal para un **sistema unificado** (ej. una sola app en Angular/React), POS o ERP combinados, con usuarios multirol frecuentes.

### 🧠 Tabla Comparativa: Mod. 1 vs Mod. 2

| Concepto | Modalidad 1 (con contexto) | Modalidad 2 (sin contexto) |
| :--- | :--- | :--- |
| **Quién define entrada** | Frontend | Usuario + sistema |
| **Login original** | Incluye contexto | Solo credenciales |
| **UX** | Directo | Interactivo |
| **Ideal para** | Apps separadas | Apps unificadas |
| **Selección de rol UI** | No existe | Opcional |

> 🔐 **Regla inmutable:** El backend **siempre** valida credenciales, roles del usuario asignados, contexto solicitado y accesos a endpoints.  
> ⚡ **Frase Final:** *"Un sistema multirol no pregunta ‘quién eres’, pregunta ‘a qué mundo entras’… solo cuando el mundo no está ya definido."*

---

## 7. ⚙️ Características Técnicas

### 7.1. Seguridad e Integridad
- **Motor InnoDB** para transacciones ACID.
- **Claves foráneas** con CASCADE para consistencia relacional.
- **Índices optimizados** para rendimiento y búsquedas rápidas.
- **Charset utf8mb4** para soporte completo de caracteres (ej. Emojis, caracteres especiales).

### 7.2. Funcionalidades de Control de Personal

**Verificación de días laborales:**
```sql
-- Verificar si un empleado debe asistir hoy
SELECT * FROM t_personal
WHERE FIND_IN_SET(DAYOFWEEK(CURDATE()), dias_laborales);
```

**Cálculo automático de tardanzas:**
```sql
-- Actualizar minutos de tardanza
UPDATE t_asistencia
SET minutos_tardanza = GREATEST(0, TIME_TO_SEC(TIMEDIFF(hora_entrada_real, ADDTIME(hora_entrada_programada, '00:15:00'))) / 60)
WHERE fecha = CURDATE() AND hora_entrada_real IS NOT NULL;
```

---

## 8. 🔄 Flujos de Trabajo Soportados

1. **Registro de usuarios:** Manual o vía OAuth.
2. **Asignación de roles:** Múltiples roles por usuario gestionando su historial e inactivación.
3. **Control de asistencia:** Automatizado con validación de horarios y cálculo de infracciones/tardanzas.
4. **Sistema de puntos:** Programas de lealtad para clientes distribuidos por niveles (normal, VIP, gold).
5. **Auditoría completa:** Trazabilidad absoluta de todos los cambios de base de datos a través de JSON temporal.
6. **Gestión de horarios:** Flexible y personalizable asignado independientemente a cada empleado.

---

## 9. 🚀 Escalabilidad y Mantenimiento

- **Roles inactivos por defecto** para su activación o despliegue gradual.
- **Estructura totalmente modular**, lo que permite agregar nuevas categorías, tablas especializadas o dominios según vaya siendo necesario.
- **Índices estratégicos** para hacer frente al crecimiento gradual y mantener las consultas principales a una latencia reducida.
- **Compatibilidad con sistemas de gestión empresarial (ERP/CRM)** de terceros a través de arquitecturas API basadas en estos roles.

---

## 10. 🎯 Casos de Uso Recomendados

- **Empresas multi-sucursal** con diferentes tipos de empleados y estructuras jerárquicas complejas.
- **Sistemas SaaS** que requieren dividir a usuarios base de clientes comerciales diferenciados y estructurados.
- **Plataformas de comercio** con roles operativos complejos (inventario, ventas, cajas, despachos).
- **Aplicaciones que exigen altos estándares de auditoría** y trazabilidad de los administradores.
- **Organizaciones** orientadas a recursos humanos y control de asistencia sistematizado y automático.
