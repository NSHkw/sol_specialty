import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

// JWT 전략
// 전략은 어떤 방식으로 사용자를 인증할 지 정의 (여기서는 JWT 토큰 방식)

/**
 * jwtFromRequest: 토큰을 헤더에서 추출하는 방법
 * ignoreExpiration: 토큰이 만료되었는 지 확인
 * secretOrKey: 토큰 검증 시 사용할 비밀 키
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      // 1. JWT 토큰 추출 방법을 설정한다 (헤더에 있는 Bearer 토큰에서 추출), super이기 때문에, passportStrategy에서 아래 3개의 옵션이 내부적으로 사용됨
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // HTTP 요청 헤더의 Authorization에서 'Bearer' 제외한 나머지 JWT 토큰을 추출
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // 토큰 유효 시 이 메소드 실행, user 객체를 request 객체에 추가
  // 여기서 payload는 passportStrategy에서 토큰을 검증하고 디코딩해서 얻은 페이로드 객체
  // 디코딩된 payload를 전달해 실행
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
