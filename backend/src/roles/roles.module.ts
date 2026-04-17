import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rol])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class RolesModule {}
