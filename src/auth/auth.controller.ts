import { UserService } from 'src/user/user.service';
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /**
   * 회원가입
   * @param signUpDto
   * @returns
   */
  @HttpCode(HttpStatus.CREATED)
  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    const data = await this.authService.signUp(signUpDto);

    return { statusCode: HttpStatus.CREATED, message: '회원가입 성공', data };
  }

  /**
   * 로그인
   * @param signInDto
   * @returns
   */
  @HttpCode(HttpStatus.OK)
  @Post('/sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    const data = await this.authService.signIn(signInDto);

    return { statusCode: HttpStatus.OK, message: '로그인 성공', data };
  }
}
