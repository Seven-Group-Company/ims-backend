import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    await this.seedPermissions();
    await this.seedRoles();
  }

  private async seedPermissions() {
    const permissions = [
      'manage_inventory',
      'view_reports',
      'manage_users',
      'manage_roles',
    ];

    for (const name of permissions) {
      const exists = await this.permissionRepository.findOne({ where: { name } });
      if (!exists) {
        await this.permissionRepository.save({ name });
      }
    }
  }

  private async seedRoles() {
    const adminRole = await this.roleRepository.findOne({ 
      where: { name: 'Admin' },
      relations: ['permissions']
    });

    if (!adminRole) {
      const allPermissions = await this.permissionRepository.find();
      await this.roleRepository.save({
        name: 'Admin',
        permissions: allPermissions,
      });
    }
  }
}