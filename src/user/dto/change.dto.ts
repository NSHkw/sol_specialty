import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class ChangeDto {
  @IsEmail()
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  email: string;

  // UserRole enum에 있는 값만 허용
  @IsEnum(UserRole)
  @IsNotEmpty({ message: '직업을 입력해주세요.' })
  role: UserRole;
}
