import { IsOptional, IsPhoneNumber, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(5, { message: '닉네임은 최대 5글자' })
  nickname?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsPhoneNumber('KR')
  phone?: string;
}
