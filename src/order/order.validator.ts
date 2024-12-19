// src/order/order.validator.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DirectOrderDto } from './dto/direct-order.dto';
import { StoreProductRepository } from '../store-product/store-product.repository';
import { CartOrderDto } from './dto/cart-order.dto';
import { User } from '../user/entities/user.entity';
import { CartItemService } from '../cart-item/cart-item.service';
import { Order, ShipStatus } from './entities/order.entity';

@Injectable()
export class OrderValidator {
  constructor(
    private readonly storeProductRepository: StoreProductRepository,
    private readonly cartItemService: CartItemService,
  ) {}

  async validateStockForDirectOrder(orderDto: DirectOrderDto): Promise<void> {
    const storeProduct = await this.storeProductRepository.findOne({
      id: orderDto.store_product_id,
    });

    if (!storeProduct) {
      throw new NotFoundException('상품 존재 X');
    }

    if (storeProduct.stock < orderDto.quantity) {
      throw new BadRequestException('재고 부족');
    }
  }

  async validateStockForCartOrder(orderDto: CartOrderDto): Promise<void> {
    for (const item of orderDto.order_items) {
      const storeProduct = await this.storeProductRepository.findOne({ id: item.store_product_id });

      if (!storeProduct) {
        throw new NotFoundException(`상품 Id ${item.store_product_id}가 존재 X`);
      }
      if (storeProduct.stock < item.quantity) {
        throw new BadRequestException(`상품 ${storeProduct.product_name}의 재고 부족`);
      }
    }
  }

  async validateUserBalance(user: User, total: number): Promise<void> {
    if (user.cash < total) {
      throw new BadRequestException('잔액 부족');
    }
  }

  validateOrderStatus(order: Order, allowedStatuses: ShipStatus[]): void {
    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException('잘못된 주문 상태');
    }
  }
}
