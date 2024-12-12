import { IsString, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { OrderMethod } from '../entities/order.entity';

export class DirectOrderDto {
  // 주문할 주소
  @IsString()
  @IsNotEmpty()
  order_address: string;

  // 주문 방법
  @IsNotEmpty()
  @IsEnum(OrderMethod)
  order_method: OrderMethod;

  @IsNumber()
  @IsNotEmpty()
  store_product_id: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
