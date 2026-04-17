import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// 🔥 Core
import { CoreModule } from './core/core.module';

// Módulos
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { SuperAdminModule } from './superadmin/superadmin.module';
import { RolesModule } from './roles/roles.module';

// Configs
import databaseConfig from './core/config/database.config';
import mailConfig from './core/config/mail.config';
import jwtConfig from './core/config/jwt.config';

@Module({
  imports: [
    // 🌍 Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, mailConfig, jwtConfig],
      envFilePath: '.env',
    }),

    // 🗄️ Base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        autoLoadEntities: true,
        synchronize: true, // TODO: set to false in production
      }),
    }),

    // 🛡️ Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    // ⏱️ Tareas programadas
    ScheduleModule.forRoot(),

    // 🔥 CORE
    CoreModule,

    // 📦 Módulos
    RolesModule,
    UsersModule,
    MailModule,
    AuthModule,
    AdminModule,
    SuperAdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
