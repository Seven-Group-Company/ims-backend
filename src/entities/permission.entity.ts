import { Entity, Column} from 'typeorm';

@Entity()
export class Permission {
@Column({ primary: true, type: 'uuid', generated: 'uuid' })
id: string;

  @Column({ unique: true })
  name: string; // 'manage_inventory', 'view_reports', 'manage_users'
}