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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // 토큰 유효 시 이 메소드 실행, user 객체를 request 객체에 추가
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
