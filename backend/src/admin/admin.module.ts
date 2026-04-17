import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminApprovalRequest } from './entities/admin-approval-request.entity';
import { User } from '../users/entities/user.entity';
import { VerificationCode } from '../users/entities/verification-code.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminApprovalRequest, User, VerificationCode]),
    ConfigModule,
    MailModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
