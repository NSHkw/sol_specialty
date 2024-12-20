// src/cart-item/types/cart-item.type.ts
import { CartItem } from '../entities/cart-item.entity';

export type CartItemResponse = {
  message: string;
  cartItem?: CartItem;
};

export type DeleteOptions = {
  user_id: number;
  cart_item_id?: number;
  store_product_ids?: number[];
};

// 삭제의 영향(affected), 삭제의 결과값(raw)
export type DeleteResult = {
  affected?: number;
  raw?: any;
};
