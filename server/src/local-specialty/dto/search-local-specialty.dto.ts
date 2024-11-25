import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Region } from '../types/region.type';

export class SearchLocalSpecialtyDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(Region)
  region?: Region;
}
