import { IsOptional, IsString, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';
import { Region } from '../types/region.type';

export class UpdateLocalSpecialtyDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  image_url?: string;

  @IsOptional()
  @IsEnum(Region)
  @MaxLength(100)
  region?: Region;

  @IsOptional()
  @IsString()
  season_info?: string;
}
