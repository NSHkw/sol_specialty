import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ALLOWED_ROLES, UpdateRoleDto } from './dto/update-role.dto';
import * as bcrypt from 'bcrypt';
import { WithdrawDto } from './dto/withdraw.dto';
import { AuthUtils } from 'src/common/utils/auth.utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // 모든 유저 조회, 로그인 한 유저 프로필 조회, 프로필 수정, 비밀번호 수정, 권한 수정, cash 충전, 회원 탈퇴

  // 관리자가 모든 유저 조회
  async findAll() {
    return await this.userRepository.find();
  }

  // 현재 로그인 한 유저 자신의 프로필 조회
  async getUserProfile(user: User) {
    AuthUtils.validateLogin(user);

    return await this.userRepository.findOne({ where: { id: user.id } });
  }

  // 현재 로그인 한 유저 자신의 프로필 수정
  // 수정 가능한 정보: 닉네임, 주소, 전화번호
  async updateProfile(user: User, updateUserDto: UpdateUserDto) {
    AuthUtils.validateLogin(user);

    const { nickname, address, phone } = updateUserDto;

    if (nickname) {
      const existedNickname = await this.userRepository.findOne({ where: { nickname } });

      if (existedNickname) {
        throw new BadRequestException('이미 존재하는 닉네임');
      }
    }

    await this.userRepository.update(user.id, updateUserDto);
    return { message: '프로필 수정 완료' };
  }

  // 현재 로그인 한 유저 자신의 비밀번호 수정
  async updatePassword(user: User, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, password, passwordConfirm } = updatePasswordDto;

    if (currentPassword === password) {
      throw new BadRequestException('기존 비밀번호와 동일합니다');
    } else if (password !== passwordConfirm) {
      throw new BadRequestException('비밀번호와 비밀번호 확인이 일치하지 않음');
    }

    await this.passwordCheck(user, currentPassword);
    const hashRound = this.configService.get<number>('PASSWORD_HASH_ROUND');

    const hashedPassword = await bcrypt.hash(password, hashRound);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
    });

    return { message: '비밀번호 수정 완료' };
  }

  // 관리자가 유저 권한 수정
  async updateRole(adminUser: User, updateRoleDto: UpdateRoleDto) {
    if (adminUser.id === updateRoleDto.userId) {
      throw new BadRequestException('자신의 권한은 수정할 수 없습니다');
    }

    const user = await this.userRepository.findOne({
      where: { id: updateRoleDto.userId },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없음');
    }

    if (user.role === updateRoleDto.role) {
      throw new BadRequestException('이미 해당 권한입니다');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('관리자는 권한을 수정할 수 없습니다');
    }

    if (!ALLOWED_ROLES.includes(updateRoleDto.role)) {
      throw new BadRequestException('올바른 권한을 입력해주세요');
    }

    user.role = updateRoleDto.role;

    await this.userRepository.save(user);

    return { message: `권한 ${updateRoleDto.role}으로 수정 완료` };
  }

  // 유저 cash 충전하기
  async updateUserCash(user: User, amount: number) {
    AuthUtils.validateLogin(user);

    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException('유효하지 않은 금액입니다');
    }

    const currentUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!currentUser) {
      throw new BadRequestException('사용자를 찾을 수 없음');
    }

    currentUser.cash += amount;

    await this.userRepository.save(currentUser);

    return { message: `cash ${amount}원 충전 완료` };
  }

  // 회원 탈퇴
  async withdraw(user: User, withdrawDto: WithdrawDto) {
    AuthUtils.validateLogin(user);

    await this.passwordCheck(user, withdrawDto.currentPassword);

    await this.userRepository.softDelete({ id: user.id });

    return { message: '회원 탈퇴 완료' };
  }

  private async passwordCheck(user: User, currentPassword: string) {
    const currentUser = await this.userRepository.findOne({
      where: { id: user.id },
      select: { password: true },
    });

    if (!currentUser) {
      throw new BadRequestException('사용자를 찾을 수 없음');
    }

    const isPasswordMatch = await bcrypt.compare(currentPassword, currentUser.password);

    if (!isPasswordMatch) {
      throw new BadRequestException('현재 비밀번호가 일치 하지 않음');
    }
  }
}
