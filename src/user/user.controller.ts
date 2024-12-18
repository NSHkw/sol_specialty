import { Body, Controller, Get, Post, UseGuards, Patch, Param, Delete } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateDto } from './dto/update.dto';
import { DeleteDto } from './dto/delete.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangeDto } from './dto/change.dto';
import { CashDto } from './dto/cash.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginSuccessResponse, UserResponse } from './types/user.type';
import { GetUser } from '../common/decorators/get-user.decorator';

//주소/user
@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('user')
//사용자와 관련된 HTTP 요청을 처리하는 역할
export class UserController {
  //UserService 실제 사용자 인증과 관련된 비즈니스 로직을 수행
  constructor(private readonly userService: UserService) {}

  //사용자 회원 가입
  @Post('sign-up')
  //loginDto에서 이메일과 비밀번호를 받아 사용자 등록
  async register(@Body() registerDto: RegisterDto): Promise<UserResponse<Partial<User>>> {
    return await this.userService.register(registerDto), { message: '회원가입이 완료되었습니다.' };
  }

  //로그인에 성공하면 토큰을 반환
  @Post('sign-in')
  async login(@Body() loginDto: LoginDto): Promise<LoginSuccessResponse> {
    return await this.userService.login(loginDto);
  }

  //JwtAuthGuard는 요청 헤더에서 JWT 토큰을 추출하고, 토큰이 유효한지 확인한 후 해당 사용자의 정보를 요청 핸들러에 주입
  @UseGuards(JwtAuthGuard)
  //인증된 사용자 반환
  @Get('userinfo')
  getUserInfo(@GetUser() user: User): UserResponse<Partial<User>> {
    const { password, ...filteredUser } = user;
    return {
      message: '사용자 정보 조회 성공',
      data: filteredUser,
    };
  }

  //역할변경
  @Patch('seller')
  @UseGuards(JwtAuthGuard)
  async changeRole(@Body() changeDto: ChangeDto): Promise<UserResponse> {
    return this.userService.changeUserRole(changeDto);
  }

  // 캐시 충전
  @Patch('cash')
  @UseGuards(JwtAuthGuard)
  async cash(@GetUser() user: User, @Body() cashDto: CashDto): Promise<UserResponse> {
    return this.userService.cash(user, cashDto);
  }

  // 사용자 정보 업데이트
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateInfo(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() updateDto: UpdateDto,
  ): Promise<UserResponse<Partial<User>>> {
    return this.userService.updateInfo(id, updateDto);
  }

  // 회원탈퇴
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteInfo(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() deleteDto: DeleteDto,
  ): Promise<UserResponse> {
    return this.userService.deleteInfo(id, deleteDto);
  }
}
