import { IsEnum, IsNotEmpty, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Region } from '../types/region.type';
import { SpecialtySeason } from '../types/season.type';

export class CreateLocalSpecialtyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(SpecialtySeason, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  season_info: SpecialtySeason[];

  @IsNotEmpty()
  @IsEnum(Region)
  region: Region;
}
