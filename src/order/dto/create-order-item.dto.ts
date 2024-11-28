import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateOrderItemDto {
  // 상품 id
  @IsNumber()
  @IsNotEmpty()
  store_product_id: number;

  // 수량
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
