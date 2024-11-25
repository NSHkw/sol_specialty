import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@ApiTags('User')
@ApiBearerAuth('access-token')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 모든 유저 조회, 로그인 한 유저 프로필 조회, 프로필 수정, 비밀번호 수정, 권한 수정, cash 충전, 회원 탈퇴

  /**
   * 관리자가 모든 유저 조회
   * @returns 모든 유저 정보
   */
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    return this.userService.findAll();
  }

  /**
   * 현재 로그인 한 유저 자신의 프로필 조회
   * @returns 현재 로그인 한 유저 정보
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getUserProfile(@GetUser() user: User) {
    return user;
  }

  /**
   * 현재 로그인 한 유저 자신의 프로필 수정
   * @param updateUserDto 수정할 유저 정보
   * @returns 수정된 유저 정보
   */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  updateUserProfile(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateProfile(user, updateUserDto);
  }

  /**
   * 현재 로그인 한 유저 자신의 비밀번호 수정
   * @param updatePasswordDto 수정할 비밀번호 정보
   * @returns 수정된 비밀번호 정보
   */
  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateUserPassword(@GetUser() user: User, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.userService.updatePassword(user, updatePasswordDto);
  }

  /**
   * 관리자가 유저 권한 수정
   * @param user 수정할 유저
   * @returns 수정된 유저
   */
  @Patch('role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateRole(@Body() updateRoleDto: UpdateRoleDto) {
    return this.userService.updateRole(updateRoleDto);
  }

  /**
   * 유저 cash 충전하기
   * @param user 충전할 유저
   * @param amount 충전할 금액
   * @returns 충전 완료 메시지
   */
  @Patch('cash')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateUserCash(@GetUser() user: User, @Body('amount') amount: number) {
    return this.userService.updateUserCash(user, amount);
  }

  /**
   * 회원 탈퇴
   * @param user 탈퇴할 유저
   * @returns 탈퇴 완료 메시지
   */
  @Delete('withdraw')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async withdraw(@GetUser() user: User, @Body() withdrawDto: WithdrawDto) {
    return this.userService.withdraw(user, withdrawDto);
  }
}
