import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { In, Repository } from 'typeorm';
import { StoreProduct } from '../store-product/entities/store-product.entity';
import { AuthUtils } from '../common/utils/auth.utils';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItemResponse, DeleteOptions, DeleteResult } from './types/cart-item.type';
import { CartItemInterface } from './interfaces/cart-item.interface';

@Injectable()
export class CartItemService implements CartItemInterface {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(StoreProduct)
    private readonly storeProductRepository: Repository<StoreProduct>,
  ) {}

  async putInCart(user: User, store_id: number, createCartItemDto: CreateCartItemDto) {
    const { store_product_id, quantity } = createCartItemDto;

    await this.validateStoreProduct(store_product_id, store_id, quantity);

    // 이미 장바구니에 있는 상품인지 확인
    const existingCartItem = await this.findExistingCartItem(user.id, store_product_id);

    if (existingCartItem) {
      return this.updateExistingCartItem(existingCartItem, quantity);
    }

    return this.createNewCartItem(user.id, store_product_id, quantity);
  }

  async findAll(user: User): Promise<CartItem[]> {
    AuthUtils.validateLogin(user);

    return this.cartItemRepository.find({
      where: { user_id: user.id },
      relations: ['store_product', 'store_product.store'],
    });
  }

  async update(user: User, id: number, updateCartItemDto: UpdateCartItemDto): Promise<CartItem> {
    AuthUtils.validateLogin(user);

    const cartItem = await this.findOne(user, id);

    // 상품 재고 확인
    await this.validateProductStock(cartItem.store_product_id, updateCartItemDto.quantity);

    // 수량 업데이트
    cartItem.quantity = updateCartItemDto.quantity;

    return await this.cartItemRepository.save(cartItem);
  }

  async remove(user: User, cart_item_id: number): Promise<CartItemResponse> {
    AuthUtils.validateLogin(user);

    const cartItem = await this.findOne(user, cart_item_id);
    await this.deleteCartItems({ user_id: user.id, cart_item_id: cartItem.id });

    return { message: '장바구니 상품 삭제 완료', cartItem };
  }

  async removeAll(user_id: number): Promise<CartItemResponse> {
    await this.deleteCartItems({ user_id });

    return { message: '장바구니를 비웠습니다.' };
  }

  async removeByStoreProductIds(
    user_id: number,
    store_product_ids: number[],
  ): Promise<CartItemResponse> {
    await this.deleteCartItems({
      user_id,
      store_product_ids,
    });

    return { message: '선택한 장바구니 상품들을 삭제했습니다.' };
  }

  private async findOne(user: User, id: number): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id, user_id: user.id },
      relations: ['store_product', 'store_product.store'],
    });

    if (!cartItem) {
      throw new NotFoundException('장바구니 아이템을 찾을 수 없습니다.');
    }

    return cartItem;
  }

  private async validateStoreProduct(
    store_product_id: number,
    store_id: number,
    quantity: number,
  ): Promise<StoreProduct> {
    const storeProduct = await this.storeProductRepository.findOne({
      where: {
        id: store_product_id,
        store_id: store_id,
      },
    });

    if (!storeProduct) {
      throw new NotFoundException('해당 상점에서 상품을 찾을 수 없습니다.');
    }

    if (storeProduct.stock < quantity) {
      throw new BadRequestException('재고가 부족합니다.');
    }

    return storeProduct;
  }

  private async findExistingCartItem(user_id: number, store_product_id: number): Promise<CartItem> {
    return this.cartItemRepository.findOne({ where: { user_id, store_product_id } });
  }

  private async updateExistingCartItem(cartItem: CartItem, quantity: number): Promise<CartItem> {
    cartItem.quantity += quantity;
    return this.cartItemRepository.save(cartItem);
  }

  private async createNewCartItem(
    user_id: number,
    store_product_id: number,
    quantity: number,
  ): Promise<CartItem> {
    const cartItem = this.cartItemRepository.create({
      user_id,
      store_product_id,
      quantity,
    });

    return this.cartItemRepository.save(cartItem);
  }

  private async validateProductStock(
    store_product_id: number,
    quantity: number,
  ): Promise<StoreProduct> {
    const storeProduct = await this.storeProductRepository.findOne({
      where: { id: store_product_id },
    });

    if (!storeProduct) {
      throw new NotFoundException('상품 찾을 수 없음');
    }

    if (storeProduct.stock < quantity) {
      throw new BadRequestException('재고 부족');
    }

    return storeProduct;
  }

  private async deleteCartItems(options: DeleteOptions): Promise<void> {
    const { user_id, cart_item_id, store_product_ids } = options;
    let deleteConditions: any = { user_id };

    if (cart_item_id) {
      deleteConditions = { ...deleteConditions, cart_item_id };
    }

    if (store_product_ids) {
      deleteConditions = { ...deleteConditions, store_product_id: In(store_product_ids) };
    }

    const result = await this.cartItemRepository.delete(deleteConditions);
    this.validateDeleteResult(result, options);
  }

  private validateDeleteResult(result: DeleteResult, options: DeleteOptions): void {
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
