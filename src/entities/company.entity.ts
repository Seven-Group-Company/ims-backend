import { Entity, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Company {
  @Column({ primary: true, generated: 'uuid' })
  id: string;

  @Column()
  name: string;

  @OneToMany(() => User, user => user.company)
  users: User[];
}