// src/cart-item/cart-item.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { In, Repository } from 'typeorm';
import { DeleteOptions, DeleteResult } from './types/cart-item.type';

@Injectable()
export class CartItemRepository {
  constructor(
    @InjectRepository(CartItem) private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async create(cartItemData: Partial<CartItem>): Promise<CartItem> {
    const cartItem = this.cartItemRepository.create(cartItemData);
    return this.cartItemRepository.save(cartItem);
  }

  async update(cartItem: CartItem): Promise<CartItem> {
    return this.cartItemRepository.save(cartItem);
  }

  async delete(conditions: DeleteOptions): Promise<DeleteResult> {
    let whereCondition: any = { user_id: conditions.user_id };

    if (conditions.cart_item_id) {
      whereCondition.id = conditions.cart_item_id;
    }
    if (conditions.store_product_ids) {
      whereCondition.store_product_id = In(conditions.store_product_ids);
    }

    return this.cartItemRepository.delete(whereCondition);
  }

  async findById(id: number, user_id: number): Promise<CartItem | null> {
    return this.cartItemRepository.findOne({
      where: { id, user_id },
      relations: ['store_product', 'store_product.store'],
    });
  }

  async findByUserAndProduct(user_id: number, store_product_id: number): Promise<CartItem | null> {
    return this.cartItemRepository.findOne({
      where: { user_id, store_product_id },
    });
  }

  async findAllByUser(user_id: number): Promise<CartItem[]> {
    return this.cartItemRepository.find({
      where: { user_id },
      relations: ['store_product', 'store_product.store'],
    });
  }
}
