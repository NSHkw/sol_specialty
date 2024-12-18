import { CartItem } from '../entities/cart-item.entity';
import { CreateCartItemDto } from '../dto/create-cart-item.dto';
import { User } from '../../user/entities/user.entity';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartItemResponse } from '../types/cart-item.service.type';

export interface CartItemServiceInterface {
  create(user: User, store_id: number, createCartItemDto: CreateCartItemDto): Promise<CartItem>;
  findAll(user: User): Promise<CartItem[]>;
  update(user: User, cart_item_id: number, updateCartItemDto: UpdateCartItemDto): Promise<CartItem>;
  remove(user: User, cart_item_id: number): Promise<CartItemResponse>;
  removeAll(user_id: number): Promise<CartItemResponse>;
  removeByStoreProductIds(user_id: number, store_product_ids: number[]): Promise<CartItemResponse>;
}
