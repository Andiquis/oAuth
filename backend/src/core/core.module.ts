import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from '../roles/rol.entity';
import { RolesInicioSeed } from './seeds/roles_inicio.seed';

@Module({
  imports: [TypeOrmModule.forFeature([Rol])],
  providers: [RolesInicioSeed],
})
export class CoreModule {}
