// src/store-product/dto/update-store-product.dto.ts
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStoreProductDto {
  @IsString()
  @IsOptional()
  product_name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
