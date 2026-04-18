# 📘 Documentación Maestra - OAuth Backend (Identity Provider)

Este documento centraliza toda la arquitectura, flujos técnicos de autenticación, diseño de base de datos relacional y las reglas de negocio del proyecto. Sintetiza los requerimientos de seguridad para crear una fuente de verdad única para el desarrollo, integrando los conceptos de RBAC (Role-Based Access Control) multirol, flujos JWT y auditoría.

---

## 📋 Índice
1. [Visión General y Tecnologías](#1-visión-general-y-tecnologías)
2. [Arquitectura de Módulos (Capa de Aplicación)](#2-arquitectura-de-módulos-capa-de-aplicación)
3. [Modelo de Dominio y Base de Datos (SQL)](#3-modelo-de-dominio-y-base-de-datos-sql)
4. [Gestión de Usuarios, Clientes y Roles (RBAC Multirol)](#4-gestión-de-usuarios-clientes-y-roles-rbac-multirol)
5. [Autenticación: Flujos JWT, AT/RT y Contextos de Login](#5-autenticación-flujos-jwt-atrt-y-contextos-de-login)
6. [Flujos Críticos de Negocio y Aprobaciones](#6-flujos-críticos-de-negocio-y-aprobaciones)
7. [Buenas Prácticas Técnicas e Integridad](#7-buenas-prácticas-técnicas-e-integridad)
8. [⚠️ Análisis, Mejoras e Interrogantes (Backlog de Arquitectura)](#8-análisis-mejoras-e-interrogantes-backlog-de-arquitectura)

---

## 1. Visión General y Tecnologías

El sistema actúa como un **Proveedor Central de Identidad y Autenticación** a través de una API REST. Implementa un control de acceso estricto basado en roles (RBAC) con una sofisticada separación de responsabilidades para usuarios base, personal operativo, administradores y superadministradores.

**Stack Tecnológico:**
- **Framework Core:** NestJS (v11) bajo TypeScript.
- **Base de Datos:** MySQL (con motor InnoDB para transacciones ACID), interactuando a través de un ORM (TypeORM / Prisma).
- **Seguridad y Auth:** `@nestjs/passport`, `passport-jwt`, `bcrypt` (para hasheo de contraseñas). Doble sistema de token (Access Token temporal + Refresh Token prolongado).
- **Procesos en Segundo Plano:** `@nestjs/schedule` (para Tareas Cron) y `Nodemailer` para Mailing transaccional (OTP y aprobaciones).

---

## 2. Arquitectura de Módulos (Capa de Aplicación)

El patrón arquitectónico aísla las responsabilidades para mantener el código base íntegro e independiente:

- **CoreModule & MailModule:** Orquesta infraestructura subyacente. Provee *Seeders* (para popular roles iniciales y el primer superadmin), conexión a la base de datos y un despachador unificado para plantillas de correo.
- **AuthModule:** Centro de control de autenticación. Gestiona endpoints como `/auth/login` y `/auth/refresh`. Emite los JWT (Access y Refresh tokens) al contrastar contra base de datos. Aloja las guardias operativas (`JwtAuthGuard`).
- **UsersModule:** Interacción B2C. Registra cuentas básicas con rol de `usuario`. Valida correos vía código OTP (`/users/verify-email`). Soporta OAuth Social (Google, Facebook, Apple).
- **AdminModule:** Antesala B2B. Los prospectos a administradores se postulan aquí. El módulo detiene el acceso: no otorga permisos efectivos, solo registra el interés y verifica la propiedad del correo.
- **SuperAdminModule:** Tribunal definitivo. Expone endpoints de lectura de solicitudes (`/superadmin/admin-requests/pending`) y ejecución (`POST /superadmin/admin-requests/approve/:token`), resolviendo si la cuenta asciende finalmente a `admin`.

---

## 3. Modelo de Dominio y Base de Datos (SQL)

El dominio reposa en un esquema fuertemente relacional de 4 entidades clave, acompañado de tablas auxiliares operativas.

### 3.1. Tablas Nucleares (Estructura Principal)

#### `t_usuarios` (User Entity)
Almacena de manera centralizada la identidad, credenciales y data OAuth entregada por terceros (nombre, foto). Controla estado de acceso (actividad, bloqueos). **Importante:** *No guarda esquemas de texto plano con los roles.*

#### `t_roles` (Catálogo de Roles)
Tabla inmutable dinámicamente salvo para habilitar/deshabilitar.

```sql
CREATE TABLE t_roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL,
    estado_rol ENUM('activo','inactivo') DEFAULT 'activo',
    descripcion_rol TEXT,
    INDEX idx_nombre_rol (nombre_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
*Categorías soportadas:* Gestión General (superadmin, admin, usuario, cliente), Finanzas (cajero, contador), Gastronomía (chef, mozo), Logística, Tecnología (desarrollador, devops), RRHH, etc.

#### `t_usuario_roles` (Asignación Multirol)
Soporta que un usuario posea roles concurrentes. Registra la trazabilidad y línea de tiempo (auditoría). **No se borran registros, cambian de estado.**

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

#### `t_solicitudes_admin` y `t_verification_codes`
Tablas de estado temporal. Almacenan los códigos OTP numéricos para correos y tokens alfanuméricos en forma de "magic link" para aprobaciones exclusivas del superadmin.

### 3.2. Tablas Secundarias de Módulos (Operaciones)
- **`t_superadmin`:** Almacena validadores biométricos (Face ID) y registros obligatorios de autenticación en múltiples capas.
- **`t_personal`:** Información contractual, rangos salariales y tolerancias. Su principal funcionalidad es guardar los *días laborales* programados en formato de strings separados por comas (ej. `1,2,3,4,5` para Lunes a Viernes).
- **`t_asistencia`:** Sistema automatizado que compara la hora de entrada real (`hora_entrada_real`) usando funciones automáticas de SQL (`TIMEDIFF`, `GREATEST`) para sacar minutos de tardanza y justificaciones.
- **`t_clientes`:** Almacena historial de compras comerciales, programas de puntos y niveles (Normal, VIP, Gold). Un individuo ingresa como "*Usuario*" en `t_usuarios`, pero se inserta paralelamente como "*Cliente*" tras su primera transacción.
- **`t_auditoria_log`:** Bitácora inmutable en formato JSON de las entidades previas vs. nuevas a la mutación.

---

## 4. Gestión de Usuarios, Clientes y Roles (RBAC Multirol)

### 4.1. Filosofía de Separación
- **Accesos por Rol, no Numéricos:** Un rol superior (Admin) no debe heredar las funciones operacionales de un rol inferior (Cajero/Mesero), pues arruina la trazabilidad contable y delimitada.
- **El caso del Admin con roles menores:** En emergencias, el Admin debe poder facturar en caja, *pero usando el traje de cajero temporalmente*.

### 4.2. Flujo Operativo Auditado: Admin ➔ Cajero
1. **Asignación temporal explicita:** (El admin obtiene el rol en la interfaz)
   ```sql
   INSERT INTO t_usuario_roles (id_usuario, id_rol, estado_asignacion)
   VALUES (123, (SELECT id_rol FROM t_roles WHERE nombre_rol = 'cajero'), 'activo');
   ```
2. **Operación Pura:** Procede a cobrar e inferir datos. Todo acto quedará timbrado y auditado bajo "*Cajero Usuario_123*".
3. **Revocación Voluntaria:** Se devuelve su estado sin perder el rastro del historial.
   ```sql
   UPDATE t_usuario_roles
   SET estado_asignacion = 'inactivo', fecha_revocacion = NOW()
   WHERE id_usuario = 123 AND id_rol = (SELECT id_rol FROM t_roles WHERE nombre_rol = 'cajero');
   ```

---

## 5. Autenticación: Flujos JWT, AT/RT y Contextos de Login

### 5.1 Evolución de Seguridad Doble: Access & Refresh Tokens
El sistema no puede depender de un `"token"` único ya que si se expone, el daño dura por horas.

- **Access Token (Corta duración - e.g. 15min):** Carga la data principal (`sub`, `email`, y el rol). Se guarda en **Memoria** o en localStorage y se despacha siempre en el header `Authorization: Bearer <JWT>`.
- **Refresh Token (Larga duración - e.g. 30 días):** Token inofensivo en llamadas recurrentes, su única función es visitar el endpoint `/auth/refresh` cuando el Access Token muere `(Error 401: Unauthorized)`. Se despacha incrustado idealmente en **Cookies HTTPOnly**, blindando el token ante ataques JavaScript (XSS).

**Flujo en Cascada:** Access Token Falla ➔ Frontend detecta (Interceptor Axios) ➔ Pide Refresh Token secreto ➔ Backend emite Nuevo Access Token validando ➔ Última petición Front se reanuda transparente al usuario.

### 5.2. Modalidades Avanzadas de Login (Determinando el Contexto)

Dado que un usuario puede gozar de *Roles concurrentes y activos*, debe existir un dictámen inicial.

#### Modalidad 1: Login con Contexto Explícito
*Idea:* Separación estructural. Aplicaciones nativas distintas para mundos distintos (`caja-app.web.app` vs `admin-office.web.app`).

1. **El Frontend envía el contexto a priori:**
   ```json
   POST /auth/login
   { "email": "usr@ok.com", "password": "xxx", "context": "cashier" }
   ```
2. **El Backend valida que el usuario posea dicho rol.**
3. **Responde:** Token que ya está quemado internamente con el mundo `"activeRole": "cashier"`.

#### Modalidad 2: Login Sin Contexto (Selección Post-login interactiva)
*Idea:* Plataforma Monolítica (Un solo macro-dashboard unificado tipo ERP).

1. **Login tradicional ciego:**
   ```json
   POST /auth/login
   { "email": "usr@mail.com", "password": "123" }
   ```
2. **Backend informa opciones disponibles:**
   ```json
   { "roles": ["admin", "cajero"], "token": "jwt" }
   ```
3. El frontend le muestra una UI Modal al usuario: *"¿Con qué rol deseas ingresar?" [ Admin ] [ Cajero ]*.
4. **Switch del usuario:** (Petición de Switch).
   ```json
   POST /auth/switch-role
   { "role": "cajero" }
   ```

> ⚡ **Frase Final del Modelo:** "Un sistema multirol no pregunta ‘quién eres’, pregunta ‘a qué mundo entras’… solo cuando el mundo no está ya definido."

---

## 6. Flujos Críticos de Negocio y Aprobaciones

### 6.1. Registro Básico y Verificación (Usuarios Estándar B2C)
1. **Petición:** Cliente efectúa `POST /users/register`.
2. **Creación Inactiva:** Se graba en `t_usuarios` con estado bloqueado o inactivo. No puede acceder a login regular.
3. **Distribución de OTP:** Se hospeda un código `123456` temporalmente en `t_verification_codes` y Nodemailer lo viaja a la bandeja del usuario.
4. **Activación:** Cliente ingresa el código numérico a `POST /users/verify-email`. Se rectifica su inactividad en la base de datos y se le abren las consolas de `/auth/login`.

### 6.2. Onboarding Burocrático y Restringido (Administradores B2B)
Ningún postulante B2B ejerce permisos corporativos por sí mismos y sus ingresos están supeditados.
1. **Iniciativa y Barrera:** Admin candidato envía `POST /admin/register` y el correspondiente código a su correo corporativo. Hasta verificar mail, la cuenta es un borrador mudo.
2. **El Disparador (Trigger):** Al comprobar el correo, el sistema crea en modo estricto una `t_solicitudes_admin` indicando el estado *PENDIENTE*.
3. **Notificación C-Level:** Se le avisa formalmente al núcleo `SuperAdmin` vía email transaccional automatizado.
4. **La Resolución Mágica:** Los SuperAdmins usan un enlace seguro firmado (`/superadmin/approve-link/{token}`). Al apretar el botón en su correo o interceptar desde un panel, el sistema dictamina internamente sobre la solicitud, retrocediendo hacia el borrador del usuario para *ahora sí asignarle de manera oficial y validada el registro en su `t_usuario_roles` como Admin operable*.

---

## 7. Buenas Prácticas Técnicas e Integridad

### 7.1. Blindaje con Clean Architecture
- **Inversión de Endpoints vía DTOs:** Bajo la biblioteca `class-transformer` de NestJS, atributos críticos como contraseñas u orientaciones puras de Mapeadores cruzan con `@Exclude` para jamás emitir datos indeseados en el response HTTP en el caso de devolver una Entidad o variable natural.
- **Filtro Global de Errores (Global Exception Filter):** Una aplicación corporativa limpia jamás responde con mensajes variados devueltos por librerías sueltas, ni stack-traces colapsados que exponen variables. Se responde con un esqueleto canónico siempre: `{"status": <codigo>, "message": "<texto al humano>", "error": "<tipo>"}`.
- **Inversión de Integraciones y Patrón Repositorio:** Aislar TypesORM/Prisma en DAOs (Data Access Object) y abstraer el proveedor de envíos (Interfaces de tipo `IMailProvider`) para separar lógicas subyacentes masivas sin alterar los servicios medulares del registro.

### 7.2 Funcionalidades a bajo nivel (SQL Control de Personal)
```sql
-- Función SQL Automática para verificar y contar absentismo/tardanzas en masa
UPDATE t_asistencia
SET minutos_tardanza = GREATEST(0, TIME_TO_SEC(TIMEDIFF(hora_entrada_real, ADDTIME(hora_entrada_programada, '00:15:00'))) / 60)
WHERE fecha = CURDATE() AND hora_entrada_real IS NOT NULL;
```
*(Permite procesar demoras y salarios masivamente mediante el motor SQL, sin llegar a delegar el conteo pesado de Arrays al procesador backend de Node.js)*.

---

## 8. ⚠️ Análisis, Mejoras e Interrogantes (Backlog de Arquitectura)

*El sistema presenta cimientos de altísima calidad en su ideación documentada, pero actualmente subsisten riesgos filosóficos, requerimientos bloqueantes faltantes, y deudas conceptuales a solventar previo escalado o paso a Producción.*

### 8.1. Integridad de Rol Dinámico dentro del JWT
- **Interrogante:** Si el modelo de Base de datos soporta multirol absoluto, y el login real se divide en "Petición directa de Modalidad 1" o "Switch de Rol dinámico de Modalidad 2"... *¿El payload JWT guardado admitirá un JSON entero con el arreglo de los 5 roles del empleado, o solo viajará en él el `activeRole` predominante del momento?*
- **Revisión y Respuesta Teórica:** Incorporar el `"activeRole"` validado y en solitario dentro del Access Token empuja al usuario a "reiniciar o permutar" su Token via ruta Switch, evitando brechas cruzadas. Hay que validar fuertemente a nivel `@Guard` que un Access Token conteniendo el Claim de `"activeRole": "Cajero"` solo disponga de los menús atados a ese universo a pesar del usuario superdotado de atrás.

### 8.2. Resurrección y Olvido de Identidad: `/forgot-password` Faltante
- **Interrogante:** La `hoja_de_ruta.md` enlista pasivamente los procesos de reparación y reset de password; sin embargo `arquitectura.md` acusa la carencia absoluta actual de los endpoints en ejecución de esto.
- **Mejora Urgente a Implementar:** Configurar transacciones de email con códigos o magic links de tiempo corto de vida estricta y un limitador fuerte de IP (Rate Limiting) para resarcir la carencia crítica de recuperación de un negocio vivo.

### 8.3. Mecanismos de Fin de Relación: "Hard Delete" vs "Soft Delete"
- **Interrogante:** ¿Qué ruta ocurre si un gerente general de sucursal (ADMIN) es separado de su cargo intempestivamente? Si se borra su perfil primario de manera drástica desde la base (`t_usuarios`), las uniones hacia reportes trimestrales (o compras en `t_clientes`), rompen constreñimientos de llave foránea o arrastran registros importantes.
- **Mecanismo:** Institucionalizar radicalmente la columna de tipo booleano `isActive: Boolean` (Baja general por app) y combinarla con `estado_asignacion: 'inactivo'` individual en `t_usuario_roles` para inutilizar cuenta y sus tokens pero reteniendo perennemente las bitácoras forenses.

### 8.4. Expiración Abrupta vs Tokens Vivos
- **Interrogante:** Al ejecutar un baneo o rebaja intempestiva (Quitarle Rol a un Admin a cajero hoy a las 11:00 am), su terminal o computadora personal poseerá en la caché un `Access Token` vivo con derechos ADMIN por 14 minutos restantes, permitiéndole descargar datos al disco pese a estar bloqueado.
- **Mecanismo Evaluativo:** Opciones aplicables inmediatas:
  1. Utilizar capa *in-memory* (Redis) que guarde AccessTokens temporalmente como "Revocados" en tiempo real (Blacklista cacheada para validación AuthGuard forzosa).
  2. Forzar un paso extra al End-User en peticiones altamente destructivas a contrastar su contraseña real (`Sudo mode / Auth Recheck`).

### 8.5. ¿OAuth Identity o Rest CRUD clásico? El debate del Naming
- **Interrogante:** El proyecto y repositorio cargan unívocamente el nombre `"oAuth"`. Si bien en planes mediatos se incluye Login Social o Auth Providers externos, arquitectónicamente y técnicamente, todo el esqueleto construido equivale a un poderoso **Identity Provider IAM** de alto nivel local, pero no necesariamente emite verdaderos *Authorization Codes OAuth2* para compartir o enlazar bases de datos a software ajeno y desconocido de 3rd-party.
- **Reflexión:** Confirmar mental y comercialmente la ambición real del producto. Reajustar nomenclature comunicativa con el equipo de frontendas para que entiendan la misión estricta particular de ser un Provider IAM corporativo (Identity and Access Management) y no esperar endpoints Oauth Server públicos por defecto.
