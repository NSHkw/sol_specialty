import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 유저 정보 데코레이터
// 현재 로그인한 사용자의 정보를 쉽게 가져오기 위한 커스텀 데코레이터
/**
 * executionContext: 현재 실행 중인 컨텍스트 정보를 제공하는 객체
 * switchToHttp()는 HTTP 특정 컨텍스트로 전환하는 메소드
 */
export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  // JwtStrategy의 validate()에서 반환한 user 객체
  const request = ctx.switchToHttp().getRequest(); // 현재 http 요청 객체를 가져온다
  return request.user; //JWT 전략에서 검증 후 설정한 사용자 정보를 반환한다
});

// executionContext를 통해 현재 HTTP 요청 객체를 가져오고(request), 그 요청 객체에서 user 정보를 추출해 반환 (user 정보는 JWT 인증 과정에서 설정된 것)
// request.user를 user:User에 저장시킨다

// setMetaData: 메타데이터를 클래스나 메소드에 추가하는 데코레이터 생성 (클래스나 메소드 위에)- 인증/인가 목적으로 메타데이터를 저장하는 용도
// createParamDecorator: 매개변수 데코레이터 생성 (메소드의 매개변수에)- 매개변수로 데이터를 전달에 요청 데이터를 추출하는 용도
