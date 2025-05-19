import { Entity, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Company {
@Column({ primary: true, type: 'uuid', generated: 'uuid' })
id: string;

  @Column()
  name: string;

  @OneToMany(() => User, user => user.company)
  users: User[];
}