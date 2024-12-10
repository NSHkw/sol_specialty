import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty({ message: '현재 비밀번호를 입력해주세요' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호 확인을 입력해주세요' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  passwordConfirm: string;
}
