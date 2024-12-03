import { IsString, IsNotEmpty, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { OrderMethod, OrderType } from '../entities/order.entity';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  // 주문할 주소
  @IsString()
  @IsNotEmpty()
  order_address: string;

  // 주문 방법
  @IsNotEmpty()
  @IsEnum(OrderMethod)
  order_method: OrderMethod;

  // 주문할 상품들
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  order_items: CreateOrderItemDto[];

  // 장바구니 주문 여부
  @IsEnum(OrderType)
  @IsNotEmpty()
  order_type: OrderType;
}
