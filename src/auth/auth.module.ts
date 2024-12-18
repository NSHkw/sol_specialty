//JWT를 검증하는 jwt.strategy를 적용하기 위해 모듈 작성
//https://velog.io/@wkddudghks81/jwt-%EA%B2%80%EC%A6%9D%ED%95%98%EB%8A%94-auth.modules.ts
import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { StoreModule } from '../store/store.module';
import { RolesGuard } from './guards/roles.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    // ConfigModule.forRoot(),
    //Passport:Node.js의 인증 미들웨어로, 다양한 인증 전략을 지원하는 라이브러리, jwt전략을 사용하며 세션은 비활성화
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      //useFactory는 JWT 설정을 반환하는 팩토리 함수
      //config는 ConfigService의 인스턴스
      //ConfigService는 NestJS의 (데이터베이스 URL, API 키, JWT 비밀 키) 관리 모듈로,.env 파일과 같은 외부 설정 파일에서 값을 로드하고, 코드 내에서 쉽게 접근할 수 있도록 도움
      useFactory: (config: ConfigService) => ({
        //configService를 통해 환경 설정에서 JWT_SECRET_KEY 값을 가져옴
        //.get<string>() 메서드는 JWT_SECRET_KEY라는 환경 변수 또는 설정값을 문자열로 가져옴
        //JWT는 서명된 토큰이며, 이 서명은 비밀 키(secret)를 사용하여 생성
        //secret은 JWT의 서명 생성 및 검증에 사용되는 비밀 키
        //헤더, 페이로드 - 인코딩 -> (헤더+페이로드) + secret 서명 = jwt 생성
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
      //inject는 useFactory에 의존성을 주입하는 방법
      inject: [ConfigService],
      // imports: [ConfigModule],
    }),
    forwardRef(() => UserModule), // 추가!
    forwardRef(() => StoreModule),
    TypeOrmModule.forFeature([User]),
  ],
  //JwtStrategy를 애플리케이션의 의존성 주입 시스템에 등록하는 부분
  providers: [RolesGuard, JwtStrategy],
})
export class AuthModule {}
