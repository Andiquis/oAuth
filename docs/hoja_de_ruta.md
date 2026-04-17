# 🛠️ Hoja de Ruta: Módulo de Auth en NestJS

## 1️⃣ Preparación del proyecto

1. Crear proyecto NestJS:

   ```bash
   pnpm create nest-app backend
   cd backend
   pnpm install
   ```
2. Configurar TypeScript y estructura base.
3. Instalar dependencias de Auth y seguridad:

   ```bash
   pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt class-validator class-transformer
   ```
4. Configurar `.env` para secretos y variables sensibles:

   ```env
   JWT_SECRET=tu_super_secreto
   JWT_EXPIRATION=3600s
   ```

---

## 2️⃣ Crear módulo de Auth

```bash
pnpm nest generate module auth
pnpm nest generate controller auth
pnpm nest generate service auth
```

**Objetivo:** Mantener todo el Auth **aislado**, sin mezclar lógica de usuarios ni roles.

---

## 3️⃣ Crear módulo de Usuarios

* Separado del Auth, para mantener responsabilidades claras.

```bash
pnpm nest generate module users
pnpm nest generate service users
pnpm nest generate controller users
```

* Aquí se define la **tabla de usuarios** con campos base:  `id`, `email`, `password`, `roles`, `fecha_creacion`, etc.
* Opcional: agregar más columnas a medida que escalas.

---

## 4️⃣ Configurar modelo/entidad

Ejemplo con Prisma:

```ts
model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  password  String
  roles     String[]
  createdAt DateTime @default(now())
}
```

* Puedes usar otros ORMs si quieres (TypeORM, Sequelize).

---

## 5️⃣ Registro de usuario

1. DTO de entrada: `RegisterUserDto`

   * Validaciones: email, password mínimo 8 caracteres.
2. Servicio de Auth:

   * Hashear contraseña con `bcrypt`.
   * Crear usuario en DB.
3. Controlador Auth:

   * Endpoint: `POST /auth/register`
   * Respuesta: `201 Created` + mensaje de éxito (sin enviar password).

---

## 6️⃣ Login de usuario

1. DTO de entrada: `LoginDto`

   * email + password
2. Servicio de Auth:

   * Buscar usuario en DB.
   * Validar contraseña con bcrypt.
   * Generar JWT:

     ```ts
     this.jwtService.sign({ sub: user.id, email: user.email, roles: user.roles })
     ```
3. Controlador Auth:

   * Endpoint: `POST /auth/login`
   * Respuesta: `{ accessToken: "JWT" }`

---

## 7️⃣ Protección de rutas (Guards)

* Crear `JwtAuthGuard` para endpoints protegidos:

  ```ts
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
  ```
* Este guard valida el JWT en cada petición protegida.

---

## 8️⃣ Roles y permisos (opcional pero recomendado)

* Crear `RolesGuard` + decorator `@Roles()`.
* Definir roles en DB o en constante.
* Filtrar acceso según roles (ej: admin, user, cajero).

---

## 9️⃣ Recuperación de contraseña

1. Endpoint: `POST /auth/forgot-password` → generar token temporal + enviar email.
2. Endpoint: `POST /auth/reset-password` → recibir token + nueva contraseña.

* Se recomienda guardar token temporal con caducidad (DB o Redis).

---

## 🔟 OAuth / Login social (fase avanzada)

* Integrar `@nestjs/passport` + estrategias OAuth (Google, Facebook, etc.).
* Separar lógica de login social de login tradicional para claridad.

---

## 11️⃣ Mejoras futuras

* Implementar **Refresh Token** + Access Token.
* Auditoría de sesiones: guardar tokens revocados (`revoke list`).
* Temporizadores y control de expiración desde frontend.
* Logging y monitoreo de intentos fallidos (seguridad).

---

### ✅ Resumen conceptual

1. Crear proyecto NestJS + módulos Auth y Users separados.
2. Configurar JWT y encriptación de passwords.
3. Endpoints base: `register`, `login`, `profile`.
4. Guards y roles para proteger rutas.
5. Funciones avanzadas: recuperación de contraseña, OAuth, refresh token.
