import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Rol } from '../../roles/rol.entity'; // 🔥 IMPORT CORRECTO

@Entity('t_usuarios')
@Index('idx_email_user', ['email'])
@Index('idx_dni_user', ['dni'])
@Index('idx_activo_email', ['activo', 'email'])
@Index('idx_codigo_invitacion', ['codigoInvitacion'])
export class User {
  @PrimaryGeneratedColumn({ name: 'id_usuario', type: 'bigint' })
  id: string;

  @Column({ name: 'nombre_user', type: 'varchar', length: 200 })
  nombre: string;

  @Column({
    name: 'dni_user',
    type: 'varchar',
    length: 20,
    nullable: true,
    unique: true,
  })
  dni: string;

  @Column({ name: 'email_user', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({
    name: 'telefono_user',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  telefono: string;

  @Column({ name: 'direccion_user', type: 'text', nullable: true })
  direccion: string;

  @Column({
    name: 'foto_url_user',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  fotoUrl: string;

  @Exclude()
  @Column({ name: 'password_user', type: 'varchar', length: 255 })
  password: string;

  @Column({
    name: 'must_change_password',
    type: 'boolean',
    default: false,
  })
  mustChangePassword: boolean;

  @Column({
    name: 'email_verificado',
    type: 'boolean',
    default: false,
  })
  emailVerificado: boolean;

  @Column({
    name: 'intentos_login_fallidos',
    type: 'int',
    default: 0,
  })
  intentosLoginFallidos: number;

  @Column({
    name: 'bloqueado_hasta',
    type: 'timestamp',
    nullable: true,
  })
  bloqueadoHasta: Date | null;

  @Column({
    name: 'ultimo_login',
    type: 'timestamp',
    nullable: true,
  })
  ultimoLogin: Date;

  @Column({
    name: 'intentos_reenvio_verificacion',
    type: 'int',
    default: 0,
  })
  intentosReenvioVerificacion: number;

  @Column({
    name: 'ultimo_reenvio_verificacion',
    type: 'timestamp',
    nullable: true,
  })
  ultimoReenvioVerificacion: Date | null;

  @Column({
    name: 'bloqueado_reenvio_hasta',
    type: 'timestamp',
    nullable: true,
  })
  bloqueadoReenvioHasta: Date | null;

  @Column({
    name: 'token_recuperacion',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  tokenRecuperacion: string;

  @Column({
    name: 'token_expiracion',
    type: 'timestamp',
    nullable: true,
  })
  tokenExpiracion: Date;

  @Column({
    name: 'proveedor_oauth',
    type: 'enum',
    enum: ['google', 'facebook', 'apple'],
    nullable: true,
  })
  proveedorOauth: string;

  @Column({
    name: 'sub_oauth',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  subOauth: string;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @Column({ name: 'ip_registro', type: 'varchar', length: 45, nullable: true })
  ipRegistro: string;

  @Column({
    name: 'user_agent',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  userAgent: string;

  @Column({
    name: 'codigo_de_invitacion',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  codigoInvitacion: string;

  // 🔥 RELACIÓN CORREGIDA
  @ManyToMany(() => Rol, { eager: true })
  @JoinTable({
    name: 't_usuario_roles',
    joinColumn: {
      name: 'id_usuario',
      referencedColumnName: 'id', // ✔️ correcto
    },
    inverseJoinColumn: {
      name: 'id_rol',
      referencedColumnName: 'id_rol', // 🔥 FIX CLAVE
    },
  })
  roles: Rol[];
}
