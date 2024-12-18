import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../user/entities/user.entity';

// 권한 데코레이터
// 데코레이터는 컨트롤러나 메소드에 추가 기능 부여
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
