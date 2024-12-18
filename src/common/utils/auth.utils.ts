// src/common/utils/auth.util.ts
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';

export class AuthUtils {
  /**
   * 로그인 여부 확인
   * @param user 유저 객체
   * @throws UnauthorizedException 로그인하지 않은 경우
   */
  static validateLogin(user: User): void {
    if (!user) {
      throw new UnauthorizedException('로그인이 필요한 서비스입니다.');
    }
  }

  /**
   * 특정 유저의 리소스 접근 권한 확인
   * @param resourceUserId 리소스 소유자 ID
   * @param currentUser 현재 로그인한 유저
   * @throws UnauthorizedException 권한이 없는 경우
   */
  static validateResourceOwner(resourceUserId: number, currentUser: User): void {
    if (resourceUserId !== currentUser.id) {
      throw new UnauthorizedException('해당 리소스에 대한 권한이 없습니다.');
    }
  }
}
