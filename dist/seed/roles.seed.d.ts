import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
export declare class RolesSeed {
    private roleRepository;
    private permissionRepository;
    constructor(roleRepository: Repository<Role>, permissionRepository: Repository<Permission>);
    seed(): Promise<void>;
    private createPermissions;
    private createRoles;
}
