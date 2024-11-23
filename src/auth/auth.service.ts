import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 로그인 시 토큰 발급 (JWT 액세스 토큰)
   * @param user
   * @returns
   */
  private async generatedToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
    });

    return { accessToken, user };
  }

  /**
   * 회원가입 API
   * @param signUpDto
   * @returns
   * adminCode를 올바르게 쓰면 role이 admin인 상태로 회원가입
   */
  async signUp(signUpDto: SignUpDto) {
    const { email, password, passwordConfirm, nickname, address, phone, adminCode } = signUpDto;
    const isPasswordMatched = password === passwordConfirm;

    if (!isPasswordMatched) {
      throw new BadRequestException('비밀번호 일치X');
    }

    const existedEmail = await this.userRepository.findOneBy({ email });

    if (existedEmail) {
      throw new ConflictException('이미 존재하는 이메일');
    }

    let role = UserRole.CUSTOMER;

    if (adminCode) {
      const envAdminCode = this.configService.get<string>('ADMIN_SECRET_CODE');

      // 입력한 adminCode가 env에 있는 AdminCode와 다를 경우 오류 처리
      if (adminCode !== envAdminCode) {
        throw new BadRequestException('관리자 코드가 일치하지 않습니다');
      }

      role = UserRole.ADMIN;
    }

    const hashRound = this.configService.get<number>('PASSWORD_HASH_ROUND');

    const hashedPassword = await bcrypt.hash(password, hashRound);

    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
      nickname,
      address,
      phone,
      role,
    });

    const { password: _, ...result } = user;
    return result;
  }

  /**
   * 로그인 API
   * @param signInDto
   * @returns
   * 로그인 성공 시 토큰 발급
   */
  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });

    if (!user) {
      throw new BadRequestException('존재하지 않는 이메일입니다');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('비밀번호가 잘못되었다');
    }

    return this.generatedToken(user);
  }
}
