import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: '*',
    credentials: false,
  });

  // Pipes globales para validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefijo global para API (excepto controladores con skipGlobalPrefix)
  app.setGlobalPrefix('api/v1', {
    exclude: [
      'superadmin/approve-link/:token',
      'superadmin/reject-link/:token',
      'superadmin/request/:token',
    ],
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('RosaNegra oAuth API')
    .setDescription(
      'Sistema Central de Identidad y Autenticación - API Documentation',
    )
    .setVersion('1.0')
    .addTag('auth', 'Autenticación con JWT')
    .addTag('users', 'Gestión de usuarios y registro')
    .addTag('Admin', 'Gestión de solicitudes de administrador público')
    .addTag(
      'SuperAdmin',
      'Gestión exclusiva de superadministradores. Aprueban/rechazan solicitudes de admins y promocionan usuarios',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Token JWT para usuarios, admins y superadmins',
        in: 'header',
      },
      'access-token', // Default bearer auth
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'RosaNegra API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
  console.log(`📝 API disponible en: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger Docs: http://localhost:${port}/api/docs`);
}
bootstrap();
