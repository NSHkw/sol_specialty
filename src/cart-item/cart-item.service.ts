import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { In, Repository } from 'typeorm';
import { StoreProduct } from 'src/store-product/entities/store-product.entity';

@Injectable()
export class CartItemService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(StoreProduct)
    private readonly storeProductRepository: Repository<StoreProduct>,
  ) {}

  async create(user: User, createCartItemDto: CreateCartItemDto) {
    const { store_product_id, quantity } = createCartItemDto;

    const storeProduct = await this.storeProductRepository.findOne({
      where: { id: store_product_id },
    });

    if (!storeProduct) {
      throw new NotFoundException('상품이 존재 X');
    }

    if (storeProduct.stock < quantity) {
      throw new BadRequestException('재고 부족');
    }

    const existingCartItem = await this.cartItemRepository.findOne({
      where: { user, store_product: { id: store_product_id } },
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      return this.cartItemRepository.save(existingCartItem);
    }

    const cartItem = this.cartItemRepository.create({
      user_id: user.id,
      store_product_id,
      quantity,
    });

    return this.cartItemRepository.save(cartItem);
  }

  async findAll(user: User) {
    return this.cartItemRepository.find({
      where: { user },
      relations: ['store_product', 'store_product.store'],
    });
  }

  async remove(user: User, id: number) {
    const cartItem = await this.findOne(user, id);
    await this.cartItemRepository.delete(cartItem.id);

    return { message: '장바구니 상품 삭제 완료', cartItem };
  }

  private async findOne(user: User, id: number) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id, user_id: user.id },
      relations: ['store_product', 'store_product.product'],
    });

    if (!cartItem) {
      throw new NotFoundException('장바구니 아이템을 찾을 수 없습니다.');
    }

    return cartItem;
  }

  async removeByStoreProductIds(user_id: number, store_product_ids: number[]) {
    await this.cartItemRepository.delete({ user_id, store_product_id: In(store_product_ids) });
  }
}
