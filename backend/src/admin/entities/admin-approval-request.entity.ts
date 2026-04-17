import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('t_solicitudes_admin')
@Index('idx_usuario', ['userId'])
@Index('idx_token', ['tokenAprobacion'])
@Index('idx_estado', ['estado'])
@Index('idx_fecha_solicitud', ['fechaSolicitud'])
export class AdminApprovalRequest {
  @PrimaryGeneratedColumn({ name: 'id_solicitud', type: 'bigint' })
  id: string;

  @Column({ name: 'id_usuario', type: 'bigint' })
  userId: string;

  @Column({
    name: 'token_aprobacion',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  tokenAprobacion: string;

  @Column({ name: 'mensaje_solicitante', type: 'text', nullable: true })
  mensajeSolicitante: string | null;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente',
  })
  estado: string;

  @CreateDateColumn({ name: 'fecha_solicitud' })
  fechaSolicitud: Date;

  @Column({ name: 'fecha_respuesta', type: 'timestamp', nullable: true })
  fechaRespuesta: Date | null;

  @Column({ name: 'aprobado_por', type: 'bigint', nullable: true })
  aprobadoPor: string | null;

  @Column({ name: 'motivo_rechazo', type: 'text', nullable: true })
  motivoRechazo: string | null;

  @Column({ name: 'ip_solicitud', type: 'varchar', length: 45, nullable: true })
  ipSolicitud: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_usuario' })
  usuario: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'aprobado_por' })
  aprobador: User | null;
}
