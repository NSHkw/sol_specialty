import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

// 권한 검사 가드
// Guard는 특정 라우트에 대한 접근을 제어하는 역할
// Nestjs 애플리케이션에서 역할 기반 접근 제어를 구현하는 가드
// AuthGuard는 인증 가드로, 특정 라우트에 대한 접근을 제어하는 역할, JWT 토큰을 통한 인증을 포함하는 가드(JWT 토큰을 사용해 사용자가 유효한 유저인지 확인)
@Injectable()
export class RolesGuard extends AuthGuard('jwt') implements CanActivate {
  @InjectRepository(User) private readonly userRepository: Repository<User>;
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. JWT 인증을 확인 (여기는 authguard와 관련된 부분으로 유저의 역할과는 관련이 없다)
    const authenticated = await super.canActivate(context); // authguard의 canActivate 메소드 호출하는 것으로 JWT 토큰 검증 수행 후 토큰 유효 시 true 반환, request.user에 사용자의 정보를 저장
    if (!authenticated) {
      return false;
    }

    // 2. 필요한 역할 가져오기
    // reflector는 데코레이터를 통해 추가된 메타데이터를 읽는 데 사용되는 객체(클래스)
    // 1단계에서 인증 성공 후, reflector를 사용해 @Roles 데코레이터에 설정된 역할을 확인한다
    // ROLES_KEY는 가져올 메타데이터의 키 값, 뒤에 배열은 메타데이터를 찾을 대상들의 배열
    // <UserRole[]>은 반환될 메타데이터의 타입
    // 메타데이터를 찾으면 즉시 반환 후 검색 중단
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // 메소드 레벨 데코레이터 (post, get 등의 기능)- 메소드 레벨 데코레이터가 우선순위를 가진다
      context.getClass(), // 클래스 레벨 데코레이터 (controller 자체)
    ]);

    // 3. 역할이 없으면 접근 허용
    if (!requiredRoles) {
      return true;
    }

    // 4. 사용자의 역할이 필요한 역할에 포함이 되는지 확인을 한다
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// reflector의 동작 과정
// 1. 데코레이터에서 메타 데이터를 설정한다 (export const Roles)- role.decorator.ts
// 2. 컨트롤러에서 데코레이터 사용 (@Roles(UserRole.ADMIN)) - controller.ts
// 3. 가드에서 메타 데이터를 읽기 (getAllAndOverride) - roles.guard.ts

// 인증만 필요한 경우 jwt-auth.guard.ts, 인증과 인가(역할에 대한 권한)가 필요한 경우 roles.guard.ts (실제 roles.guard의 super는 jwt-auth.guard에서도 사용한다)
