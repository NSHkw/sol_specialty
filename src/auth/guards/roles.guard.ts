import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

// 권한 검사 가드
// Guard는 특정 라우트에 대한 접근을 제어하는 역할
@Injectable()
export class RolesGuard extends AuthGuard('jwt') implements CanActivate {
  @InjectRepository(User) private readonly userRepository: Repository<User>;
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authenticated = await super.canActivate(context);
    if (!authenticated) {
      return false;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
