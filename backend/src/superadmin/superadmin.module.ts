import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SuperAdminService } from './superadmin.service';
import { SuperAdminController } from './superadmin.controller';
import { User } from '../users/entities/user.entity';
import { AdminApprovalRequest } from '../admin/entities/admin-approval-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AdminApprovalRequest]),
    ConfigModule,
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
