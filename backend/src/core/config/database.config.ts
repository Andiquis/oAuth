import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_oauth',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // ¡IMPORTANTE! Usar migraciones en producción
    logging: process.env.NODE_ENV === 'development',
    charset: 'utf8mb4',
    timezone: '-05:00', // Hora de Perú
  }),
);
