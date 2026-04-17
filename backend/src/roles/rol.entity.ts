import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity('t_roles')
export class Rol {
  @PrimaryGeneratedColumn({ name: 'id_rol' })
  id_rol: number;

  @Column({
    name: 'nombre_rol',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  nombre: string; // 🔥 USAS "nombre" EN CÓDIGO

  @Column({
    name: 'estado_rol',
    type: 'enum',
    enum: ['activo', 'inactivo'],
    default: 'activo',
  })
  estado: 'activo' | 'inactivo'; // 🔥 MÁS LIMPIO

  @Column({
    name: 'descripcion_rol',
    type: 'text',
    nullable: true,
  })
  descripcion: string;

  @CreateDateColumn({
    name: 'fecha_creacion',
    type: 'datetime',
  })
  fechaCreacion: Date;

  @UpdateDateColumn({
    name: 'fecha_modificacion',
    type: 'datetime',
  })
  fechaModificacion: Date;

  @ManyToMany(() => User, (user) => user.roles)
  usuarios: User[];
}
