import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCartItemDto {
  @IsNumber()
  @IsNotEmpty()
  store_product_id: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
