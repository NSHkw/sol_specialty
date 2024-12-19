// src/order/interfaces/order.interface.ts
import { User } from 'src/user/entities/user.entity';
import { DirectOrderDto } from '../dto/direct-order.dto';
import { Order } from '../entities/order.entity';
import { CartOrderDto } from '../dto/cart-order.dto';
import { OrderResponse } from '../types/order.type';

export interface OrderInterface {
  createDirectOrder(user: User, createOrderDto: DirectOrderDto): Promise<OrderResponse<Order>>;

  createCartOrder(user: User, createOrderDto: CartOrderDto): Promise<OrderResponse<Order>>;

  pay(user: User, order_id: number): Promise<OrderResponse<Order>>;

  findAllOrder(user: User): Promise<Order[]>;

  findOneDetailOrder(user: User, order_id: number): Promise<Order>;

  getOrderStatus(user: User, order_id: number): Promise<Order['status']>;

  cancelOrder(user: User, order_id: number): Promise<OrderResponse<Order>>;
}
