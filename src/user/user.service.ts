import _ from 'lodash';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from './entities/user.entity';
import { UpdateDto } from './dto/update.dto';
import { DeleteDto } from './dto/delete.dto';
import { ChangeDto } from './dto/change.dto';
import { CashDto } from './dto/cash.dto';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginSuccessResponse, UserResponse } from './types/user.type';
import { UserRepository } from './user.repository';
import { UserValidator } from './user.validator';
import { UserInterface } from './interfaces/user.interface';

@Injectable()
export class UserService implements UserInterface {
  constructor(
    //TypeORM의 @InjectRepository 데코레이터는 특정 엔티티(User)의 데이터베이스 작업을 처리하는 Repository를 주입하는 데 사용
    //Repository 데이터베이스에서 특정 엔티티(User)를 관리하기 위한 메서드들이 포함
    private readonly userRepository: UserRepository,
    private readonly userValidator: UserValidator,
    //JWT 토큰을 생성하고 검증하는 데 사용
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  //회원가입
  async register(registerDto: RegisterDto): Promise<UserResponse<Partial<User>>> {
    const { email, password, nickname, address, phone, admincode } = registerDto;

    await this.userValidator.validateNewUser(email, nickname);

    const role = this.determineAdminCode(admincode);
    const hashRound = this.config.get<number>('PASSWORD_HASH_ROUND');

    //비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, hashRound);

    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      nickname,
      address,
      phone,
      role,
    });

    return {
      message: '회원가입 완료',
      data: this.excludePasswordInUserData(user),
    };
  }

  async login(loginDto: LoginDto): Promise<LoginSuccessResponse> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findByEmail(email, true);

    //이메일칸이 비어있다면
    if (!user) {
      throw new UnauthorizedException('이메일을 확인해주세요.');
    }

    //비밀번호가 틀리다면
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }

    //로그인 성공, jwt 토큰 반환
    const payload = { email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user_id: user.id,
    };
  }

  async changeUserRole(changeDto: ChangeDto): Promise<UserResponse> {
    const { email, role } = changeDto;

    // 사용자 찾기
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    this.validateRoleChange(role);

    await this.userRepository.update(user.id, { role: role as UserRole });

    return { message: `${user.nickname}의 역할이 ${user.role}로 변경되었다` };
  }

  async cash(user: User, cashDto: CashDto): Promise<UserResponse> {
    const { cash } = cashDto;

    // 유효성 검사 기능
    if (cash <= 0) {
      throw new BadRequestException('충전할 캐쉬는 0보다 커야 합니다.');
    }

    // 사용자 정보 업데이트
    user.cash += cash;
    await this.userRepository.update(user.id, { cash: user.cash });

    return { message: `${user.nickname}의 캐시가 ${cash}만큼 충전되어 ${user.cash}가 됨` };
  }

  async updateInfo(id: number, updateDto: UpdateDto): Promise<UserResponse<Partial<User>>> {
    await this.userValidator.validateUserInfo(id, updateDto.password);

    const { nickname, address, phone } = updateDto;

    await this.userRepository.update(id, { nickname, address, phone });

    return { message: `사용자 정보 변경`, data: { nickname, address, phone } };
  }

  async deleteInfo(id: number, deleteDto: DeleteDto): Promise<UserResponse> {
    await this.userValidator.validateUserInfo(id, deleteDto.password);

    await this.userRepository.delete(id);

    return { message: '회원 탈퇴 완료' };
  }

  private determineAdminCode(admincode?: string): UserRole {
    const configAdminCode = this.config.get<string>('ADMIN_CODE');
    return admincode === configAdminCode ? UserRole.ADMIN : UserRole.CUSTOMER;
  }

  private excludePasswordInUserData(user: User): Partial<User> {
    const { password, ...filteredUser } = user;
    return filteredUser;
  }

  private validateRoleChange(role: UserRole): void {
    // 유효한 역할인지 확인
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new BadRequestException('유효하지 않은 역할입니다.');
    }

    if (role === 'ADMIN') {
      throw new BadRequestException('유효하지 않은 역할입니다.');
    }
  }
}
