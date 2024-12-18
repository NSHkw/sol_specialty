import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  nickname: string;

  @IsString()
  @IsNotEmpty({ message: '주소를 입력해주세요.' })
  address: string;

  @IsPhoneNumber('KR')
  @IsNotEmpty({ message: '전화번호를 입력해주세요.' })
  phone: string;

  @IsString()
  @IsOptional()
  admincode?: string;
}
