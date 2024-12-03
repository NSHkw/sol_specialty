import { IsEnum, IsNumber } from 'class-validator';

import { UserRole } from '../entities/user.entity';

export const ALLOWED_ROLES = [UserRole.CUSTOMER, UserRole.SELLER] as const;

export class UpdateRoleDto {
  @IsNumber()
  userId: number;

  @IsEnum(ALLOWED_ROLES)
  role: UserRole.CUSTOMER | UserRole.SELLER;
}
