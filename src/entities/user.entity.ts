import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Company } from './company.entity';
import { Role } from './role.entity';

@Entity()
export class User {
  @Column({ primary: true, generated: 'uuid' })
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @ManyToOne(() => Company, company => company.users)
  company: Company;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];
}