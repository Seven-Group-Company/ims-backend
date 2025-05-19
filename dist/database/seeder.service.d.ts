import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
export declare class SeederService implements OnModuleInit {
    private readonly roleRepository;
    private readonly permissionRepository;
    constructor(roleRepository: Repository<Role>, permissionRepository: Repository<Permission>);
    onModuleInit(): Promise<void>;
    seed(): Promise<void>;
    private seedPermissions;
    private seedRoles;
}
