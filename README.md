# 🌐 RosaNegra oAuth API

## 📋 Descripción General

El proyecto **RosaNegra oAuth API** es un sistema centralizado de identidad y autenticación diseñado para gestionar usuarios, roles y permisos en aplicaciones distribuidas. Este backend está construido con **NestJS**, utilizando **TypeORM** para la gestión de bases de datos y **JWT** para la autenticación segura.

<p align="center">
  <img src="assets/model_oauth.png" alt="Modelo de OAuth" width="400" style="border-radius:15px;">
</p>

---

## 📑 Índice

- [Descripción General](#-descripción-general)
- [Características](#-características)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Estructura de Archivos](#-estructura-de-archivos)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Documentación Swagger](#-documentación-swagger)
- [Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [Licencia](#-licencia)

---

## ✨ Características

### Funcionalidades Principales

| Característica          | Descripción                                                                |
| ----------------------- | -------------------------------------------------------------------------- |
| **Autenticación JWT**   | Generación y validación de tokens JWT para sesiones seguras.               |
| **Gestión de Usuarios** | CRUD completo para usuarios, incluyendo roles y permisos.                  |
| **Roles Jerárquicos**   | Soporte para roles como `Admin`, `SuperAdmin`, y usuarios regulares.       |
| **Validaciones**        | Validación de datos con `class-validator` y `ValidationPipe`.              |
| **Swagger UI**          | Documentación interactiva generada automáticamente.                        |
| **CORS**                | Configuración de CORS para permitir solicitudes desde diferentes orígenes. |

---

## 🏗 Arquitectura del Proyecto

```
backend/
├── src/
│   ├── admin/                     # Módulo de administración
│   │   ├── dto/                   # DTOs para validaciones
│   │   ├── admin.service.ts       # Lógica de negocio
│   │   └── admin.controller.ts    # Controladores REST
│   ├── auth/                      # Módulo de autenticación
│   ├── users/                     # Módulo de usuarios
│   ├── main.ts                    # Punto de entrada principal
│   └── app.module.ts              # Módulo raíz
├── package.json                   # Dependencias y scripts
├── tsconfig.json                  # Configuración de TypeScript
└── nest-cli.json                  # Configuración de NestJS CLI
```

---

## 📂 Estructura de Archivos

### Módulos Principales

- **Admin:** Gestión de solicitudes de administrador y promoción a superadmin.
- **Auth:** Autenticación y generación de tokens JWT.
- **Users:** CRUD de usuarios y gestión de roles.

---

## 🔐 Flujo de Autenticación con JWT

<p align="center">
  <img src="assets/vscode_captura.png" alt="Captura de VSCode" width="400" style="border-radius:15px;">
</p>

### 1. Login Básico

1. El usuario envía sus credenciales al backend.
2. El backend valida las credenciales y genera un **Access Token**.
3. El token se envía al cliente y se usa para acceder a rutas protegidas.

### 2. Access y Refresh Tokens

- **Access Token:** Token de corta duración para acceder a recursos.
- **Refresh Token:** Token de larga duración para renovar el Access Token.

---

## ⚙️ Requisitos Previos

- Node.js >= 18.x
- npm o pnpm
- Base de datos MySQL

---

## 🚀 Instalación y Ejecución

1. Clonar el repositorio:

   ```bash
   git clone <URL del repositorio>
   cd backend
   ```

2. Instalar dependencias:

   ```bash
   pnpm install
   ```

3. Configurar variables de entorno:
   Crear un archivo `.env` basado en `.env.example` y configurar las credenciales de la base de datos.

4. Ejecutar el servidor en modo desarrollo:

   ```bash
   pnpm start:dev
   ```

5. Acceder a la documentación Swagger:
   Visita `http://localhost:3000/api` para explorar los endpoints.

<p align="center">
  <img src="assets/swager_captura.png" alt="Captura de Swagger" width="400" style="border-radius:15px;">
</p>

---

## 📜 Documentación Swagger

La API incluye documentación interactiva generada automáticamente con Swagger. Para acceder:

- URL: `http://localhost:3000/api`
- Tags disponibles:
  - **auth**: Autenticación con JWT
  - **users**: Gestión de usuarios
  - **admin**: Gestión de solicitudes de administrador
  - **superadmin**: Funciones exclusivas de superadministradores

---

## 🛠️ Tecnologías Utilizadas

| Tecnología   | Versión | Propósito                              |
| ------------ | ------- | -------------------------------------- |
| **NestJS**   | ^11.0.1 | Framework backend                      |
| **TypeORM**  | ^0.3.28 | ORM para bases de datos relacionales   |
| **JWT**      | ^11.0.2 | Autenticación basada en tokens         |
| **MySQL**    | ^3.22.1 | Base de datos relacional               |
| **Swagger**  | ^11.3.0 | Generación de documentación automática |
| **Prettier** | ^3.2.0  | Formateo de código                     |
| **ESLint**   | ^9.18.0 | Linter para mantener calidad de código |

---

## 📄 Licencia

Este proyecto está bajo la licencia **UNLICENSED**. Para más detalles, consulta el archivo `LICENSE`.
