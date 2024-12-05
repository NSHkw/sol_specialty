import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderType, ShipStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { StoreProduct } from 'src/store-product/entities/store-product.entity';
import { CartItemService } from 'src/cart-item/cart-item.service';
import { AuthUtils } from 'src/common/utils/auth.utils';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(StoreProduct)
    private readonly storeProductRepository: Repository<StoreProduct>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly cartItemService: CartItemService,
  ) {}

  // 주문하기, 유저의 모든 주문 조회하기, 주문 하나 조회하기, 주문의 배송 상태 확인하기, 주문 취소하기

  // 주문하기
  async createDirectOrder(user: User, createOrderDto: CreateOrderDto) {
    AuthUtils.validateLogin(user);

    // 단일 상품 구매 시 재고 확인
    const storeProduct = await this.storeProductRepository.findOne({
      where: { id: createOrderDto.order_items[0].store_product_id },
    });

    if (!storeProduct) {
      throw new NotFoundException('상품이 존재하지 않습니다');
    }

    if (storeProduct.stock < createOrderDto.order_items[0].quantity) {
      throw new BadRequestException('재고가 부족합니다');
    }

    return this.processOrder(user, createOrderDto);
  }

  async createCartOrder(user: User, createOrderDto: CreateOrderDto) {
    AuthUtils.validateLogin(user);

    // 장바구니 상품들의 실제 존재 여부 확인
    const cartItems = await this.cartItemService.findAll(user);
    const cartItemMap = new Map(cartItems.map((item) => [item.store_product_id, item]));

    // 장바구니에 있는 상품만 주문 가능하도록 검증
    for (const orderItem of createOrderDto.order_items) {
      const cartItem = cartItemMap.get(orderItem.store_product_id);
      if (!cartItem) {
        throw new BadRequestException('장바구니에 없는 상품은 주문할 수 없습니다');
      }
      if (cartItem.quantity < orderItem.quantity) {
        throw new BadRequestException('장바구니의 수량보다 많이 주문할 수 없습니다');
      }
    }

    return this.processOrder(user, createOrderDto);
  }

  private async processOrder(user: User, createOrderDto: CreateOrderDto) {
    const { order_address, order_method, order_items, order_type } = createOrderDto;

    // 1. 주문 기본 정보 생성
    const order = this.orderRepository.create({
      user_id: user.id,
      order_address,
      order_method,
      order_type,
      order_date: new Date(),
    });

    const savedOrder = await this.orderRepository.save(order);

    try {
      // 2. 재고 확인 및 주문 상품 처리 (트랜잭션)
      await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
        const storeProducts = await transactionalEntityManager.findByIds(
          StoreProduct,
          order_items.map((item) => item.store_product_id),
        );

        let total_cash = 0;
        const orderItems = [];

        for (const item of order_items) {
          const storeProduct = storeProducts.find((p) => p.id === item.store_product_id);

          if (!storeProduct || storeProduct.stock < item.quantity) {
            throw new BadRequestException('재고 부족 또는 상품이 존재하지 않습니다');
          }

          // 재고 감소
          storeProduct.stock -= item.quantity;
          await transactionalEntityManager.save(StoreProduct, storeProduct);

          // 주문 상품 생성
          total_cash += storeProduct.price * item.quantity;
          orderItems.push(
            this.orderItemRepository.create({
              order_id: savedOrder.id,
              store_product_id: item.store_product_id,
              quantity: item.quantity,
            }),
          );
        }

        await transactionalEntityManager.save(OrderItem, orderItems);

        // 총 금액 업데이트
        savedOrder.total_cash = total_cash;
        await transactionalEntityManager.save(Order, savedOrder);
      });

      // 3. 장바구니 비우기 (장바구니 주문인 경우에만)
      if (order_type === OrderType.CART) {
        await this.cartItemService.removeByStoreProductIds(
          user.id,
          order_items.map((item) => item.store_product_id),
        );
      }

      return this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['order_items'],
      });
    } catch (error) {
      // 주문 실패 시 주문 정보 삭제
      await this.orderRepository.remove(savedOrder);
      throw error;
    }
  }

  // 결제하기
  async pay(user: User, id: number) {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const order = await this.orderRepository.findOne({
      where: { id, user_id: user.id },
    });

    if (order.status !== ShipStatus.PAYMENT_WAITING) {
      throw new BadRequestException('결제 불가');
    }

    if (user.cash < order.total_cash) {
      throw new BadRequestException('잔액 부족');
    }

    if (!order) {
      throw new NotFoundException('ID 해당 주문 X');
    }

    user.cash -= order.total_cash;
    await this.userRepository.save(user);
    order.status = ShipStatus.ORDER_COMPLETED;
    await this.orderRepository.save(order);

    return order;
  }

  // 유저의 모든 주문 조회하기
  async findAll(user: User) {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    return this.orderRepository.find({
      where: { user_id: user.id },
      relations: ['order_items'],
    });
  }

  // 주문 하나 조회하기
  async findOne(user: User, id: number) {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const order = await this.orderRepository.findOne({
      where: { id, user_id: user.id },
      relations: ['user', 'order_items'],
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    return order;
  }

  // 주문의 배송 상태 확인하기
  async getOrderStatus(user: User, id: number) {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const order = await this.findOne(user, id);
    return order.status;
  }

  // 주문 취소하기
  async cancel(user: User, id: number) {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const order = await this.findOne(user, id);

    if (
      order.status !== ShipStatus.ORDER_COMPLETED &&
      order.status !== ShipStatus.PAYMENT_WAITING
    ) {
      throw new BadRequestException('주문 취소 불가능');
    }

    // 결제 완료 상태였다면 환불 처리
    if (order.status === ShipStatus.ORDER_COMPLETED) {
      user.cash += order.total_cash;
      await this.userRepository.save(user);
    }

    // 재고 복구 및 장바구니 복원
    const orderItems = await this.orderItemRepository.find({
      where: { order_id: id },
      relations: ['store_product', 'store_product.store'],
    });

    await Promise.all(
      orderItems.map(async (item) => {
        // 재고 복구
        const storeProduct = item.store_product;
        storeProduct.stock += item.quantity;
        await this.storeProductRepository.save(storeProduct);

        // 장바구니 주문이었던 경우에만 장바구니에 다시 추가
        if (order.order_type === OrderType.CART) {
          await this.cartItemService.create(user, item.store_product.store_id, {
            store_product_id: item.store_product_id,
            quantity: item.quantity,
          });
        }
      }),
    );

    order.status = ShipStatus.ORDER_CANCELLED;
    await this.orderRepository.save(order);

    return { message: '주문 취소 완료', order };
  }
}
