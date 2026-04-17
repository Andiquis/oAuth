
# 🔐 Flujo de Autenticación con JWT, Access Token y Refresh Token

## 1️⃣ Autenticación básica con JWT

Cuando un usuario inicia sesión con su **correo y contraseña**, ocurre esto:

1. **El frontend envía** las credenciales al endpoint del backend (`POST /auth/login`).
2. **El backend valida** los datos contra la base de datos (usuario existente, contraseña correcta, estado activo, etc.).
3. Si todo es correcto, **el backend genera un JWT** (JSON Web Token) con información mínima del usuario, como:
   ```json
   {
     "sub": 12,
     "email": "usuario@dominio.com",
     "role": "admin"
   }
   ```
   Este token se **firma** con una clave secreta (`JWT_SECRET`).

4. El JWT se envía al **frontend**, que lo guarda (usualmente en `localStorage`, `sessionStorage` o cookies seguras).
5. En cada petición a rutas protegidas, el frontend **envía el token** en el encabezado:
   ```
   Authorization: Bearer <JWT>
   ```
6. El backend **verifica la firma del token**. Si es válido, extrae los datos del usuario y permite el acceso.

🟢 **Ventaja:** simple y eficiente.  
🔴 **Desventaja:** el token expira y no puede renovarse sin volver a iniciar sesión.


## 2️⃣ Evolución: Access Token + Refresh Token

Para mejorar la seguridad, se agregan **dos capas**:

### 💡 Access Token
- Es el **token de acceso temporal**.  
- Dura poco (ej. 15 minutos).  
- Se usa para hacer peticiones al backend.

### 💡 Refresh Token
- Es un **token de larga duración** (ej. 7 días o 30 días).  
- Sirve **solo** para obtener un nuevo Access Token cuando este caduca.  
- No se usa directamente para acceder a recursos.


## 3️⃣ Flujo completo paso a paso

1. **Login:**
   - El usuario envía correo y contraseña.
   - El backend genera:
     - Un **Access Token** (vida corta).
     - Un **Refresh Token** (vida larga).
   - Ambos se devuelven al frontend.

2. **Almacenamiento:**
   - El **Access Token** se guarda en `memory` o `localStorage`.
   - El **Refresh Token** se guarda **en una cookie HTTPOnly**, para que no pueda ser leído por JavaScript.

3. **Peticiones normales:**
   - El frontend usa el **Access Token** en cada petición:
     ```
     Authorization: Bearer <AccessToken>
     ```
   - El backend valida la firma y permite el acceso.

4. **Cuando el Access Token expira:**
   - El backend devuelve `401 Unauthorized`.
   - El frontend detecta el error y **envía el Refresh Token** a `/auth/refresh`.
   - El backend verifica el Refresh Token:
     - Si es válido → genera un **nuevo Access Token**.
     - Si no lo es → fuerza al usuario a iniciar sesión de nuevo.

5. **Renovación automática (opcional):**
   - El frontend puede usar un **timer** o **interceptor** que detecte el tiempo restante del token y lo renueve antes de que caduque.


## 4️⃣ Seguridad general del sistema

| Capa | Responsabilidad | Nivel de riesgo | Recomendación |
|------|------------------|-----------------|----------------|
| **Access Token** | Acceso directo a recursos | Medio | Vida corta (5–15 min) |
| **Refresh Token** | Renovar sesión | Alto | Guardar en cookie HTTPOnly |
| **JWT Secret** | Firma del token | Crítico | No exponer nunca |
| **HTTPS** | Transporte de datos | Muy bajo | Siempre activo |
| **Revocación (revoke)** | Invalida tokens comprometidos | Bajo | Implementar en etapa futura |


## 5️⃣ Beneficios del modelo doble

- ✅ No es necesario reautenticar con contraseña cada vez.  
- ✅ Si se roba el Access Token, solo sirve por minutos.  
- ✅ El Refresh Token permite sesiones largas sin riesgo alto.  
- ✅ Escalable: ideal para apps web, móviles y desktop (APK, EXE).


## 6️⃣ Comparativa rápida

| Modelo | Descripción | Seguridad | Complejidad |
|--------|--------------|------------|--------------|
| **Solo JWT** | Token único con tiempo largo | Media | Baja |
| **JWT + Access + Refresh** | Tokens separados y controlados | Alta | Media–Alta |