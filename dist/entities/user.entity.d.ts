import { Company } from './company.entity';
import { Role } from './role.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    fullName: string;
    company: Company;
    roles: Role[];
}
