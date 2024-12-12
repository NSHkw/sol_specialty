import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OrderMethod } from '../entities/order.entity';

export class CartOrderDto {
  // 주문할 주소
  @IsString()
  @IsNotEmpty()
  order_address: string;

  // 주문 방법
  @IsNotEmpty()
  @IsEnum(OrderMethod)
  order_method: OrderMethod;

  @IsArray()
  @IsNotEmpty()
  order_items: {
    store_product_id: number;
    quantity: number;
  }[];
}
