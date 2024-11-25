import { OmitType } from '@nestjs/mapped-types';
import { CreateStoreDto } from './create-store.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStoreDto extends OmitType(CreateStoreDto, ['name', 'description']) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
