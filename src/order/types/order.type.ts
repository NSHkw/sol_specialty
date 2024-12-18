// src/order/types/order.type.ts

export type OrderResponse<T = void> = {
  message: string;
  data?: T;
};
