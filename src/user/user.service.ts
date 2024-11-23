import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import * as bcrypt from 'bcrypt';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // 관리자가 모든 유저 조회
  async findAll() {
    return await this.userRepository.find();
  }

  // 현재 로그인 한 유저 자신의 프로필 수정
  // 수정 가능한 정보: 닉네임, 주소, 전화번호
  async updateProfile(user: User, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(user.id, updateUserDto);
    return { message: '프로필 수정 완료' };
  }

  // 현재 로그인 한 유저 자신의 비밀번호 수정
  async updatePassword(user: User, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, password, passwordConfirm } = updatePasswordDto;

    if (password !== passwordConfirm) {
      throw new BadRequestException('비밀번호와 비밀번호 확인이 일치하지 않음');
    }

    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordMatch) {
      throw new BadRequestException('현재 비밀번호가 일치 하지 않음');
    }

    const hashRound = this.configService.get<number>('PASSWORD_HASH_ROUND');

    const hashedPassword = await bcrypt.hash(password, hashRound);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
    });

    return { message: '비밀번호 수정 완료' };
  }

  // 관리자가 유저 권한 수정
  async updateRole(updateRoleDto: UpdateRoleDto) {
    const user = await this.userRepository.findOne({
      where: { id: updateRoleDto.userId },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없음');
    }

    user.role = updateRoleDto.role;

    await this.userRepository.save(user);

    return { message: `권한 ${updateRoleDto.role}으로 수정 완료` };
  }

  // 유저 cash 충전하기
  async updateUserCash(user: User, amount: number) {
    user.cash += amount;

    await this.userRepository.save(user);

    return { message: `cash 충전 완료` };
  }

  // 회원 탈퇴
  async withdraw(user: User, withdrawDto: WithdrawDto) {
    const { currentPassword } = withdrawDto;

    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordMatch) {
      throw new BadRequestException('현재 비밀번호가 일치 하지 않음');
    }

    await this.userRepository.softDelete({ id: user.id });

    return { message: '회원 탈퇴 완료' };
  }
}
