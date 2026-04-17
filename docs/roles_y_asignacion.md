# 📑 Documentación de Manejo de Roles y Asignación de Roles

## 1. 📌 Problema inicial

**¿Cómo manejar los roles del sistema y su relación con los usuarios?**

### 🔍 Preguntas planteadas

- **¿Superadmin es igual a root?**

  - _Root_ es el nivel más alto, técnico y absoluto.
  - _Superadmin_ puede ser un rol de gestión avanzada, pero está por debajo de root.

- **¿Accesos por rol o por nivel numérico?**

  - Mejor por roles, no por jerarquías numéricas.
  - Un rol superior (admin) no debe heredar funciones de roles inferiores (cajero, mesero).

- **¿Por qué el admin no puede hacer el trabajo del cajero?**
  - Cada rol tiene funciones separadas y auditablemente delimitadas.
  - Si el admin alterara registros de caja sin rol de cajero, se perdería trazabilidad.

---

## 2. 📌 Tabla de Roles (`t_roles`)

- Tabla estática, define los roles disponibles en el sistema.
- No se modifica dinámicamente salvo para habilitar/inactivar un rol.

```sql
CREATE TABLE t_roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL,
    estado_rol ENUM('activo','inactivo') DEFAULT 'activo',
    descripcion_rol TEXT,
    INDEX idx_nombre_rol (nombre_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. 📌 Relación Usuario-Rol (`t_usuario_roles`)

- Soporta multirol (un usuario puede tener varios roles).
- Las relaciones no se borran, se inhabilitan con `estado_asignacion`.
- Mantiene auditoría temporal (fechas de asignación y revocación).

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

---

## 4. 📌 Flujos Cubiertos

### 🔹 a) Asignación inicial

- Se inserta relación con estado activo.
- Ejemplo: un usuario obtiene el rol de cajero.

### 🔹 b) Revocación de rol

- Se actualiza `estado_asignacion = inactivo` y `fecha_revocacion = NOW()`.
- Se conserva historial, no se pierde auditoría.

### 🔹 c) Reasignación

- Dos opciones:
  1. Reactivar rol existente (`UPDATE estado_asignacion = activo, fecha_revocacion = NULL`).
  2. Insertar nuevo registro con nueva fecha de asignación.

### 🔹 d) Auditoría

- Siempre se puede saber:
  - Qué rol tuvo un usuario.
  - Desde cuándo y hasta cuándo.
  - Qué roles estuvieron activos en paralelo.

---

## 5. 📌 Caso especial: Admin con roles menores

### 🔍 Problema planteado

- El admin no puede realizar tareas de cajero o mesero, porque su rol no tiene esas acciones.
- En casos de emergencia, el admin debe poder actuar operativamente y que quede registrado como tal.

### ✅ Solución

- Permitir roles redundantes (ej. Admin + Cajero).
- El sistema reconoce el rol de cajero al operar caja → registro auditable.

**Beneficios:**

- Claridad en la auditoría.
- Flexibilidad controlada.
- Jerarquía respetada: solo admins pueden asumir roles menores, nunca al revés.

---

## 6. 📌 Flujo de Admin con rol de Cajero

1. El admin se asigna temporalmente el rol cajero:

```sql
INSERT INTO t_usuario_roles (id_usuario, id_rol, estado_asignacion)
VALUES (123, (SELECT id_rol FROM t_roles WHERE nombre_rol = 'cajero'), 'activo');
```

2. Opera como cajero (abre caja, registra ventas). Todo queda registrado bajo su rol cajero.

3. Se revoca rol temporal:

```sql
UPDATE t_usuario_roles
SET estado_asignacion = 'inactivo', fecha_revocacion = NOW()
WHERE id_usuario = 123 AND id_rol = (SELECT id_rol FROM t_roles WHERE nombre_rol = 'cajero');
```

---

## 📌 Conclusión

- El sistema maneja roles de manera clara, auditable y flexible.
- Los roles no se heredan por jerarquía numérica, se asignan explícitamente.
- El admin puede asumir roles menores como redundancia, pero siempre de forma explícita y auditable.

---

## 7. 📌 Diferencia entre Usuario y Cliente

- **usuario**: Persona que se registra en el sistema (por ejemplo, desde la landing page, app, etc.), pero que aún no ha realizado ninguna compra ni interacción comercial relevante. Es el perfil base tras el registro.
- **cliente**: Es un usuario que ya realizó al menos una compra o interacción comercial con la empresa. Al convertirse en cliente, puede acceder a beneficios, historial de compras, servicios exclusivos, etc.

Esta distinción permite segmentar permisos, flujos y reportes según el nivel de relación con la empresa. El sistema puede asignar automáticamente el rol de cliente cuando detecta la primera compra o interacción relevante.
