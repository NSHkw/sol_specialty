// src/cart-item/cart-item.validator.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CartItemRepository } from './cart-item.repository';
import { StoreProductRepository } from '../store-product/store-product.repository';
import { CartItem } from './entities/cart-item.entity';
import { StoreProduct } from 'src/store-product/entities/store-product.entity';
import { DeleteOptions, DeleteResult } from './types/cart-item.type';

@Injectable()
export class CartItemValidator {
  constructor(
    private readonly cartItemRepository: CartItemRepository,
    private readonly storeProductRepository: StoreProductRepository,
  ) {}

  async validateCartItem(user_id: number, cart_item_id: number): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findById(cart_item_id, user_id);

    if (!cartItem) {
      throw new NotFoundException('장바구니 아이템 찾을 수 없음');
    }

    return cartItem;
  }

  async validateStoreProduct(
    store_product_id: number,
    store_id: number,
    quantity: number,
  ): Promise<StoreProduct> {
    const storeProduct = await this.storeProductRepository.findOne(store_product_id, store_id);

    if (!storeProduct) {
      throw new NotFoundException('해당 상점 상품 찾을 수 없음');
    }

    if (storeProduct.stock < quantity) {
      throw new BadRequestException('재고 부족');
    }

    return storeProduct;
  }

  validateDeleteResult(result: DeleteResult, options: DeleteOptions): void {
    if (result.affected === 0) {
      if (options.cart_item_id) {
        throw new NotFoundException('장바구니 아이템 삭제 실패');
      }
      if (options.store_product_ids) {
        throw new NotFoundException('삭제할 아이템 X');
      }
      throw new NotFoundException('장바구니 비어있음');
    }
  }
}
