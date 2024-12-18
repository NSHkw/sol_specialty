import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateDto {
  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsPhoneNumber('KR')
  @IsOptional()
  phone?: string;
}
