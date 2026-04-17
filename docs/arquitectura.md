# Documentación de Arquitectura - OAuth Backend

Esta documentación mapea la implementación real del sistema backend OAuth. Ha sido diseñada sin redundancias, enfocada en la estructura modular, las entidades de base de datos y los flujos de negocio clave (Especialmente la separación entre Users, Admins y SuperAdmins).

## 1. Visión General del Sistema (Overview)
El sistema es una aplicación desarrollada en **NestJS** que actúa como un proveedor central de identidad y autenticación (OAuth Backend). Implementa un control de acceso estricto basado en roles (RBAC) con separación de responsabilidades:
- **Usuarios Regulares**: Se registran y verifican su correo electrónico a través de un código (OTP).
- **Administradores**: Pasan por un doble proceso: primero validan su correo electrónico, y luego requieren de una aprobación explícita (Audit) generada por un nivel superior.
- **SuperAdministradores**: Gestionan todo el ciclo de vida de los administradores y custodian la entrada total al sistema.

## 2. Tecnologías Principales
- **Framework**: NestJS (v11)
- **Base de Datos**: MySQL (manejado vía TypeORM)
- **Autenticación**: JWT (Vía `@nestjs/passport` y `passport-jwt`), contraseñas encriptadas con `bcrypt`.
- **Mailing**: Nodemailer (Para correos transaccionales y de verificación).
- **Tareas Periódicas/Procesos en Segundo Plano**: `@nestjs/schedule` y comandos `cron`.

## 3. Modelo de Dominio (Entidades Críticas)
El dominio reposa en 4 entidades clave alojadas en el sistema:

- **`t_usuarios` (UserEntity)**: Almacena de manera centralizada las cuentas (credentials, status normalizado, estado de verificación y su asociación de Rol).
- **`t_roles` (RolEntity)**: Catálogo base centralizado de roles del sistema (Ej. USER, ADMIN, SUPERADMIN). 
- **`t_verification_codes`**: Entidad temporal/transaccional que resguarda los códigos OTP (One-Time-Password) numéricos o alfanuméricos de confirmación de correos.
- **`t_solicitudes_admin` (AdminApprovalRequest)**: Bitácora del proceso de aprobación de ingresos administrativos. Almacena el token de aprobación, el estado de la solicitud (PENDING, APPROVED, REJECTED) y vincula quién originó la solicitud de ingreso como admin.

## 4. Distribución de Módulos (Capa de Aplicación)

El patrón arquitectónico aísla las responsabilidades en los siguientes módulos inyectables:

### 4.1. CoreModule & MailModule
- **Responsabilidad**: Orquestar infraestructura subyacente.
- **Detalle**: Provee Seeders (Población inicial crítica de roles y el primer SuperAdmin si es necesario), inyectores de bases de datos, y manejo de JWT global. El `MailModule` administra las plantillas y el despacho transaccional unificado.

### 4.2. AuthModule
- **Endpoints Explotables**: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/profile`.
- **Responsabilidad**: Proveer las guardias operativas (Guard JWT) y emitir el par Access/Refresh tokens luego de verificar la contraseña y estado de aprobación de cuenta del usuario (en `t_usuarios`).

### 4.3. UsersModule
- **Endpoints Explotables**: `/users/register`, `/users/verify-email`, `/users/resend-verification`.
- **Responsabilidad**: Interacción de nivel B2C/usuario genérico. Registra cuentas básicas con rol de USER, validando únicamente la propiedad del email por código OTP.

### 4.4. AdminModule
- **Endpoints Explotables**: `/admin/register`, `/admin/verify-email`, `/admin/resend-approval-request`.
- **Responsabilidad**: Actuar como antesala de acceso administrativo (Onboarding B2B). Registra interesados, verifica si los correos corporativos son legítimos, y detiene el flujo traspasándolo al dominio de los SuperAdmins. Ningún Admin obtiene acceso legítimo en esta etapa ni se auto-promueve.

### 4.5. SuperAdminModule
- **Endpoints Explotables**: 
  - Vistas / Consumo: `/superadmin/admin-requests/pending`, `/superadmin/admins-with-requests`, `/superadmin/admins`.
  - Resolución Mágica: `GET /superadmin/approve-link/:token`, `GET /superadmin/reject-link/:token`.
  - Acción Explícita: `POST /superadmin/admin-requests/approve/:token`, `POST /superadmin/admin-requests/reject/:token`.
- **Responsabilidad**: Actúa como el tribunal de entrada definitivo. Resuelve qué solicitudes del `t_solicitudes_admin` prosperan promoviendo la cuenta correspondiente a ADMIN en `t_usuarios`.

## 5. Casos de Uso y Flujos Críticos de Negocio (Business Flows)

### Flujo A: Registro y Verificación de Usuario Estándar
1. **Petición**: El Cliente efectúa POST a `/users/register`.
2. **Creación Inactiva**: El Sistema graba a la persona en `t_usuarios` atado al rol `USER` con un estado indicando inactividad/falta de validación.
3. **Distribución de OTP**: Se despacha la llave en `t_verification_codes` y viaja por correo.
4. **Activación**: El Cliente suministra el código en `POST /users/verify-email`.
5. **Acreditación Final**: El estado en la entidad del usuario se rectifica, abriendo las puertas a `/auth/login`.

### Flujo B: Onboarding Restringido para Administradores
1. **Iniciativa**: Un Admin candidato deposita su correo en `POST /admin/register`.
2. **Barrera de Email**: Recibe un código para probar la titularidad. Hasta que no haga `POST /admin/verify-email`, su inscripción es un borrador mudo.
3. **Disparador de Solicitud (Trigger)**: Inmediatamente después de corroborar el email, el sistema levanta internamente una bandera y emite una nueva fila en `t_solicitudes_admin` en estado PENDIENTE. Automáticamente, orquesta el envío masivo o directo de un correo a los buzones de los SuperAdministradores.
4. **Resolución Mágica**: Los mandatarios SuperAdmins reciben un enlace firmado (ej. `/superadmin/approve-link/xxx`). Al invocarlo (o hacer un POST a la vía REST), se altera retroactivamente `t_solicitudes_admin` clausurándolo como "APPROVED".
5. **Mutación de Rol**: El sistema ubica subyacentemente al Admin Candidato en `t_usuarios`, y le consolida e inyecta el verdadero rol "ADMIN". 
6. **Consumación**: El nuevo Admin ahora puede ejecutar inicio de sesión vía Auth.

### Flujo C: Secuencia de Autorización Guardada
1. En toda ruta sensible, la guardia principal (`JwtAuthGuard`) verifica la validez temporal del Token Bearer.
2. Un interceptor secundario de dominio (Ej. `@Roles('ADMIN')`) acude a contrastar el string expuesto contra el Claim empaquetado en el token, dictando el paso por jerarquía o rechazando automáticamente.

## 6. Revisión Crítica y Preguntas Abiertas

Las siguientes preguntas están diseñadas para evaluar la madurez de la aplicación y prever posibles vulnerabilidades o cuellos de botella:

### 6.1. Seguridad y Autenticación
- **OAuth Verdadero vs JWT API**: El proyecto se llama "oAuth", pero la arquitectura actual refleja una API REST tradicional basada en JWT. ¿Consideras en el futuro emitir *Authorization Codes* y seguir el protocolo OAuth2 estricto (como Auth0 o Google) para que aplicaciones de terceros puedan integrarse?
- **Invalidación de Sesión Limitada**: Actualmente se emiten Access y Refresh tokens. Si un token se roba, ¿cómo forzamos el cierre de sesión de todas partes? Falta un esquema de lista negra (Blacklisting) o vinculación a una base de datos temporal en memoria (ej. Redis).
- **Límites de Tiempo en las Aprobaciones**: El enlace mágico enviado a los SuperAdmins para aprobar `t_solicitudes_admin` ¿expira? Debería tener un TTL (Time-To-Live) estricto (ej. 24 a 48 horas) para evitar vulnerabilidades si un email es comprometido tiempo después.
- **MFA para Jerarquías Altas**: El sistema protege la entrada con contraseñas y correos, pero para los SuperAdmins (que tienen poder absoluto) ¿no haría falta una autenticación de Dos Factores (2FA/Authy) obligatoria?

### 6.2. Ciclo de Vida y Roles
- **Recuperación y Reseteo**: ¿Qué pasa si un usuario olvida su contraseña? Hay un hueco arquitectónico evidente en la falta de un flujo completo de `/auth/forgot-password` y `/auth/reset-password`.
- **"Soft Deletes" o Bajas Lógicas**: Si un empleado (ADMIN) deja la empresa, no existe actualmente un flujo claro para revocar sus permisos de forma permanente sin eliminar físicamente el registro del sistema (lo cual rompería historiales). Se requiere de un estado `isActive` explícito o una columna de base de datos como `deletedAt`.
- **Degradación de Permisos**: Así como existe `POST /superadmin/promote-admin`, ¿existe o se contempla un proceso para rebajar y revocar a un Admin devolviéndolo a Usuario regular?

## 7. Recomendaciones para una Arquitectura Limpia (Clean Architecture)

Para que el proyecto pueda escalar y ser mantenido a largo plazo sin dolores de cabeza técnicos, considera aplicar estos patrones:

1. **Desacoplamiento con Repositorios**: Evita que NestJS o TypeORM contaminen tus reglas de negocio; implementa un "Pattern Repository" (Data Access Object o DAOs), aislando el framework de lo que la empresa realmente requiere que pase. Tus Services no deberían escribir sentencias directas de MySQL.
2. **DTOs Blindados (Data Transfer Objects)**: Asegúrate de que las entidades (`t_usuarios`) **jamás** sean retornadas directamente a la red web en JSON para no ventilar la contraseña encriptada accidentalmente. Desacopla esto forzando siempre Serialización usando `class-transformer` (e.g., ignorar campos sensibles con `@Exclude`).
3. **Manejo Centralizado y Estandarizado de Errores**: Para tener un backend prolijo, implementa un interceptor o filtro global (`GlobalExceptionFilter`) que capture cualquier caída natural. Así, tu backend SIEMPRE contestará con una misma máscara (ej. `{"status": 404, "error": "Not Found", "message": "..."}`).
4. **Inversión de Dependencias en Integraciones Externas**: Hoy se usa NodeMailer. Mañana podría ser AWS SES o SendGrid. Lo ideal para Clean Architecture es inyectar una "interfaz abstracta de envíos `IMailProvider`" en lugar de un paquete concreto. Así, cambiar de proveedor afectará solo a 1 archivo, no a toda tu configuración.

## 8. Funcionalidades Faltantes Detectadas (Missing Features)

Si tuviéramos que empaquetar esto listos para su versión de Producción, falta lo siguiente:

* **[CRÍTICO]** Flujo de recuperación (Lost/Reset Password) vía correo o OTP.
* **[URGENTE]** Eliminación, Desactivación temporal y bloqueo permanente de cuentas por mala praxis o cese de relación (Hard Vs. Soft Delete).
* **[IMPORTANTE]** Trazabilidad Auditada: Añadir una columna / tabla que obligue a almacenar *¿Qué SuperAdmin autorizó a este modelo específico y a qué hora precisa lo hizo?* (Logs de Auditoría inmutables).
* **[MEJORA UX]** Endpoint para "Reeviar el Enlace de Aprobación" diseñado para uso del Admin cuando indica que los SuperAdmins de turno perdieron el correo, caducó el Token original o nunca llegó.
