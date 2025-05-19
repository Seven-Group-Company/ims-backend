import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permission.entity';

@Entity()
export class Role {
  @Column({ primary: true, generated: 'uuid' })
  id: string;

  @Column({ unique: true })
  name: string; // 'Admin', 'Manager', 'User'

  @ManyToMany(() => Permission)
  @JoinTable()
  permissions: Permission[];
}