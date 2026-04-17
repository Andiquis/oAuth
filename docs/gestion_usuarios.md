# 📑 Documentación de Gestión de Usuarios

## Tabla: t_usuarios

- Almacena la identidad y credenciales de todos los usuarios del sistema.
- Soporta registro manual y por OAuth (Google, Facebook, Apple, Microsoft).
- Los datos entregados por OAuth (nombre, email, foto, etc.) se guardan automáticamente al primer registro y pueden ser actualizados manualmente por el usuario.
- Controla acceso, recuperación de cuenta, bloqueo por intentos fallidos y estado activo/inactivo.
- Incluye campos de auditoría para trazabilidad de creación y modificaciones.
- No almacena roles ni permisos (ver tabla t_usuario_roles).

### Flujos cubiertos

- Registro de usuario (manual o por OAuth)
- Inicio de sesión y control de acceso
- Recuperación de cuenta y bloqueo
- Actualización de datos personales
- Auditoría de cambios

---

## Relación con roles

- La asignación de roles y permisos se gestiona en la tabla `t_usuario_roles`.
- Un usuario puede tener múltiples roles activos o históricos.

---

## Buenas prácticas

- Al registrar por OAuth, guardar todos los datos disponibles y permitir edición posterior.
- Validar y auditar cambios en datos sensibles.
- Mantener el campo `activo` para suspender cuentas sin borrarlas.
