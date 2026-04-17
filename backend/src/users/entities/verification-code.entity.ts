import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('t_verification_codes')
@Index('idx_user_code', ['userId', 'code'])
@Index('idx_expiration', ['expiresAt'])
export class VerificationCode {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'code', type: 'varchar', length: 6 })
  code: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: ['registro', 'recuperacion'],
    default: 'registro',
  })
  type: string;

  @Column({ name: 'usado', type: 'boolean', default: false })
  usado: boolean;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
