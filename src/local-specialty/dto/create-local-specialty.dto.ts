import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Region } from '../types/region.type';

export class CreateLocalSpecialtyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  season_info: string;

  @IsNotEmpty()
  @IsEnum(Region)
  region: Region;
}
