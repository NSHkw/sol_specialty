// src/cart-item/cart-item.service.ts
import { Injectable } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { User } from '../user/entities/user.entity';
import { CartItem } from './entities/cart-item.entity';
import { StoreProduct } from '../store-product/entities/store-product.entity';
import { AuthUtils } from '../common/utils/auth.utils';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItemResponse } from './types/cart-item.type';
import { CartItemInterface } from './interfaces/cart-item.interface';
import { CartItemRepository } from './cart-item.repository';
import { CartItemValidator } from './cart-item.validator';

@Injectable()
export class CartItemService implements CartItemInterface {
  constructor(
    private readonly cartItemRepository: CartItemRepository,
    private readonly cartItemValidator: CartItemValidator,
  ) {}

  async putInCart(
    user: User,
    store_id: number,
    createCartItemDto: CreateCartItemDto,
  ): Promise<CartItem> {
    const { store_product_id, quantity } = createCartItemDto;

    await this.cartItemValidator.validateStoreProduct(store_product_id, store_id, quantity);

    // 이미 장바구니에 있는 상품인지 확인
    const existingCartItem = await this.cartItemRepository.findByUserAndProduct(
      user.id,
      store_product_id,
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      return this.cartItemRepository.update(existingCartItem);
    }

    return this.cartItemRepository.create({
      user_id: user.id,
      store_product_id,
      quantity,
    });
  }

  async findAll(user: User): Promise<CartItem[]> {
    AuthUtils.validateLogin(user);

    return this.cartItemRepository.findAllByUser(user.id);
  }

  async update(
    user: User,
    cart_item_id: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    AuthUtils.validateLogin(user);

    const cartItem = await this.cartItemValidator.validateCartItem(user.id, cart_item_id);

    await this.cartItemValidator.validateStoreProduct(
      cartItem.store_product_id,
      cartItem.store_product.store_id,
      updateCartItemDto.quantity,
    );

    cartItem.quantity = updateCartItemDto.quantity;

    return await this.cartItemRepository.update(cartItem);
  }

  async remove(user: User, cart_item_id: number): Promise<CartItemResponse> {
    AuthUtils.validateLogin(user);

    const cartItem = await this.cartItemValidator.validateCartItem(user.id, cart_item_id);
    const result = await this.cartItemRepository.delete({
      user_id: user.id,
      cart_item_id,
    });

    this.cartItemValidator.validateDeleteResult(result, { user_id: user.id, cart_item_id });

    return { message: '장바구니 상품 삭제 완료', cartItem };
  }

  async removeAll(user_id: number): Promise<CartItemResponse> {
    const result = await this.cartItemRepository.delete({ user_id });
    this.cartItemValidator.validateDeleteResult(result, { user_id });

    return { message: '장바구니를 비웠습니다.' };
  }

  async removeByStoreProductIds(
    user_id: number,
    store_product_ids: number[],
  ): Promise<CartItemResponse> {
    const result = await this.cartItemRepository.delete({
      user_id,
      store_product_ids,
    });

    this.cartItemValidator.validateDeleteResult(result, { user_id, store_product_ids });

    return { message: '선택한 장바구니 상품들을 삭제했습니다.' };
  }
}
