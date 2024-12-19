// src/order/types/order.type.ts
import { Order, OrderMethod } from '../entities/order.entity';

export type OrderResponse<T = void> = {
  message: string;
  data?: T;
};

export type OrderItem = {
  store_product_id: number;
  quantity: number;
};

export type OrderBase = {
  order_address: string;
  order_method: OrderMethod;
};

export type ProcessOrderResult = {
  savedOrder: Order;
  total_cash: number;
  orderItems: OrderItem[];
};
