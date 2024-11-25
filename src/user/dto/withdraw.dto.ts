import { IsNotEmpty, IsString } from 'class-validator';

export class WithdrawDto {
  @IsString()
  @IsNotEmpty({ message: '현재 비밀번호를 입력해주세요' })
  currentPassword: string;
}
