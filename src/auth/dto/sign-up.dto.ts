import { PickType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class SignUpDto extends PickType(User, [
  'email',
  'password',
  'nickname',
  'address',
  'phone',
]) {
  @IsEmail()
  @IsNotEmpty({ message: '이메일은 반드시 입력하세요' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    // 비밀번호의 강도를 검증 (비밀번호에 강력한 유효성 검사)
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5, { message: '닉네임은 최대 5글자' })
  nickname: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsPhoneNumber('KR')
  // 전화번호 유효성 검사로 한국 전화번호 형식을 사용('-'없이 총 11자리, 010으로 시작)
  phone?: string;

  @IsNotEmpty({ message: '비밀번호 확인을 입력' })
  @IsStrongPassword(
    {},
    {
      message: '비밀번호는 영문 대소문자, 숫자, 특수문자',
    },
  )
  passwordConfirm: string;

  @IsOptional()
  @IsString()
  adminCode?: string;
}
