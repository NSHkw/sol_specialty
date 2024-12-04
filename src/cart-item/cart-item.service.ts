import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { In, Repository } from 'typeorm';
import { StoreProduct } from 'src/store-product/entities/store-product.entity';
import { AuthUtils } from 'src/common/utils/auth.utils';
import { DataSource } from 'typeorm';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartItemService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(StoreProduct)
    private readonly storeProductRepository: Repository<StoreProduct>,
    private readonly dataSource: DataSource,
  ) {}

  async create(user: User, store_id: number, createCartItemDto: CreateCartItemDto) {
    // 재고 확인 및 감소 + 장바구니에 상품 추가(트랜잭션 필요)
    return await this.dataSource.transaction(async (manager) => {
      const { store_product_id, quantity } = createCartItemDto;

      // 상품 조회 시 해당 상점의 상품인지도 확인
      const storeProduct = await manager.findOne(StoreProduct, {
        where: {
          id: store_product_id,
          store_id: store_id, // 상점 ID 검증 추가
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!storeProduct) {
        throw new NotFoundException('해당 상점에서 상품을 찾을 수 없습니다.');
      }

      // 재고 확인 및 감소
      if (storeProduct.stock < quantity) {
        throw new BadRequestException('재고가 부족합니다.');
      }
      storeProduct.stock -= quantity;
      await manager.save(storeProduct);

      // 장바구니 아이템 생성 또는 수정
      const existingCartItem = await manager.findOne(CartItem, {
        where: {
          user_id: user.id,
          store_product_id: store_product_id,
        },
      });

      if (existingCartItem) {
        existingCartItem.quantity += quantity;
        return await manager.save(existingCartItem);
      }

      const cartItem = manager.create(CartItem, {
        user_id: user.id,
        store_product_id,
        quantity,
      });

      return await manager.save(cartItem);
    });
  }

  async findAll(user: User) {
    AuthUtils.validateLogin(user);

    return this.cartItemRepository.find({
      where: { user_id: user.id },
      relations: ['store_product', 'store_product.store'],
    });
  }

  async update(user: User, id: number, updateCartItemDto: UpdateCartItemDto) {
    AuthUtils.validateLogin(user);

    const cartItem = await this.findOne(user, id);

    // 상품 재고 확인
    const storeProduct = await this.storeProductRepository.findOne({
      where: { id: cartItem.store_product_id },
    });

    if (!storeProduct) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    if (storeProduct.stock < updateCartItemDto.quantity) {
      throw new BadRequestException('재고가 부족합니다.');
    }

    // 수량 업데이트
    cartItem.quantity = updateCartItemDto.quantity;

    return await this.cartItemRepository.save(cartItem);
  }

  async remove(user: User, id: number) {
    AuthUtils.validateLogin(user);

    const cartItem = await this.findOne(user, id);
    if (!cartItem) {
      throw new NotFoundException('장바구니 아이템을 찾을 수 없습니다.');
    }

    const result = await this.cartItemRepository.delete({ id: cartItem.id, user_id: user.id });
    if (result.affected === 0) {
      throw new NotFoundException('장바구니 아이템 삭제에 실패했습니다.');
    }

    return { message: '장바구니 상품 삭제 완료', cartItem };
  }

  async removeByStoreProductIds(user_id: number, store_product_ids: number[]) {
    await this.cartItemRepository.delete({ user_id, store_product_id: In(store_product_ids) });
  }

  private async findOne(user: User, id: number) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id, user_id: user.id },
      relations: ['store_product', 'store_product.store'],
    });

    if (!cartItem) {
      throw new NotFoundException('장바구니 아이템을 찾을 수 없습니다.');
    }

    return cartItem;
  }
}
