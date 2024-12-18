import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 유저 정보 데코레이터
// 현재 로그인한 사용자의 정보를 쉽게 가져오기 위한 커스텀 데코레이터
/**
 * executionContext: 현재 실행 중인 컨텍스트 정보를 제공하는 객체
 * switchToHttp()는 HTTP 특정 컨텍스트로 전환하는 메소드
 */
export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  // JwtStrategy의 validate()에서 반환한 user 객체
  const request = ctx.switchToHttp().getRequest();
  return request.user ? request.user : null;
});
