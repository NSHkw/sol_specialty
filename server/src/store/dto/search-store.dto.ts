import { Type } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';

import { IsOptional } from 'class-validator';

export class SearchStoreDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  limit?: number = 10;
}
