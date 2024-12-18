import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserValidator {
  constructor(private readonly userRepository: UserRepository) {}

  async validateNewUser(email: string, nickname: string): Promise<void> {
    const [existingEmail, existingNickname] = await Promise.all([
      this.userRepository.findByEmail(email),
      this.userRepository.findByNickname(nickname),
    ]);

    if (existingEmail) {
      throw new ConflictException('존재하는 이메일 가입자');
    }

    if (existingNickname) {
      throw new ConflictException('이미 존재하는 닉네임');
    }
  }

  async validateUserInfo(id: number, password: string): Promise<User> {
    const user = await this.userRepository.findById(id, true);

    if (!user) {
      throw new NotFoundException('데이터를 찾을 수 없거나 수정/삭제할 권한이 없습니다.');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return user;
  }
}
