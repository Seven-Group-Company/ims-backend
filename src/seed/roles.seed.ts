// src/seed/roles.seed.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class RolesSeed {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async seed() {
    const permissions = await this.createPermissions();
    await this.createRoles(permissions);
  }

  private async createPermissions() {
    const permissions = [
      'manage_inventory',
      'view_reports', 
      'manage_users',
      'manage_roles'
    ];

    return Promise.all(
      permissions.map(name => 
        this.permissionRepository.save({ name })
      )
    );
  }

  private async createRoles(permissions: Permission[]) {
    const roles = [
      {
        name: 'Admin',
        permissions: permissions
      },
      {
        name: 'Manager',
        permissions: permissions.filter(p => 
          p.name !== 'manage_roles'
        )
      }
    ];

    await Promise.all(
      roles.map(role => 
        this.roleRepository.save({
          name: role.name,
          permissions: role.permissions
        })
      )
    );
  }
}