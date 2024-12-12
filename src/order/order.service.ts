import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderType, ShipStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { StoreProduct } from '../store-product/entities/store-product.entity';
import { CartItemService } from '../cart-item/cart-item.service';
import { AuthUtils } from '../common/utils/auth.utils';
import { DirectOrderDto } from './dto/direct-order.dto';
import { CartOrderDto } from './dto/cart-order.dto';

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
  async createDirectOrder(user: User, createOrderDto: DirectOrderDto) {
    AuthUtils.validateLogin(user);
    const { store_product_id, quantity } = createOrderDto;

    // 단일 상품 구매 시 재고 확인
    const storeProduct = await this.storeProductRepository.findOne({
      where: { id: store_product_id },
    });

    if (!storeProduct) {
      throw new NotFoundException('상품이 존재하지 않습니다');
    }

    if (storeProduct.stock < quantity) {
      throw new BadRequestException('재고가 부족합니다');
    }

    return this.processOrder(user, createOrderDto, OrderType.DIRECT);
  }

  async createCartOrder(user: User, createOrderDto: CartOrderDto) {
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

    return this.processOrder(user, createOrderDto, OrderType.CART);
  }

  private async processOrder(
    user: User,
    orderDto: DirectOrderDto | CartOrderDto,
    orderType: OrderType,
  ) {
    const { order_address, order_method } = orderDto;

    // 1. 주문 기본 정보 생성
    const order = this.orderRepository.create({
      user_id: user.id,
      order_address,
      order_method,
      order_type: orderType,
      order_date: new Date(),
    });

    const savedOrder = await this.orderRepository.save(order);

    try {
      // 2. 재고 확인 및 주문 상품 처리 (트랜잭션)
      await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
        let total_cash = 0;
        const orderItems = [];

        if (orderType === OrderType.DIRECT) {
          const directDto = orderDto as DirectOrderDto;
          const storeProduct = await transactionalEntityManager.findOne(StoreProduct, {
            where: { id: directDto.store_product_id },
          });

          if (!storeProduct) {
            throw new BadRequestException('상품 존재 X');
          }

          storeProduct.stock -= directDto.quantity;
          await transactionalEntityManager.save(StoreProduct, storeProduct);

          total_cash = storeProduct.price * directDto.quantity;
          orderItems.push(
            this.orderItemRepository.create({
              order_id: savedOrder.id,
              store_product_id: directDto.store_product_id,
              quantity: directDto.quantity,
            }),
          );
        } else {
          const cartDto = orderDto as CartOrderDto;
          const storeProducts = await transactionalEntityManager.findByIds(
            StoreProduct,
            cartDto.order_items.map((item) => item.store_product_id),
          );

          for (const item of cartDto.order_items) {
            const storeProduct = storeProducts.find((p) => p.id === item.store_product_id);

            if (!storeProduct || storeProduct.stock < item.quantity) {
              throw new BadRequestException('재고 부족 or 상품 존재 X');
            }

            storeProduct.stock -= item.quantity;
            await transactionalEntityManager.save(StoreProduct, storeProduct);

            total_cash += storeProduct.price * item.quantity;
            orderItems.push(
              this.orderItemRepository.create({
                order_id: savedOrder.id,
                store_product_id: item.store_product_id,
                quantity: item.quantity,
              }),
            );
          }
        }

        await transactionalEntityManager.save(OrderItem, orderItems);
        savedOrder.total_cash = total_cash;
        await transactionalEntityManager.save(Order, savedOrder);
      });

      // 3. 장바구니 비우기 (장바구니 주문인 경우에만)
      if (orderType === OrderType.CART) {
        const cartDto = orderDto as CartOrderDto;
        await this.cartItemService.removeByStoreProductIds(
          user.id,
          cartDto.order_items.map((item) => item.store_product_id),
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

    const currentUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    const order = await this.orderRepository.findOne({
      where: { id, user_id: user.id },
    });

    if (!order) {
      throw new NotFoundException('ID 해당 주문 X');
    }

    if (order.status !== ShipStatus.PAYMENT_WAITING) {
      throw new BadRequestException('결제 불가');
    }

    // 디버깅을 위한 로그 추가
    console.log('Current user cash:', currentUser.cash);
    console.log('Order total cash:', order.total_cash);

    // 값이 유효한 숫자인지 확인
    if (isNaN(order.total_cash)) {
      throw new BadRequestException('주문 금액이 유효하지 않습니다');
    }

    if (isNaN(currentUser.cash)) {
      throw new BadRequestException('사용자 잔액이 유효하지 않습니다');
    }

    if (currentUser.cash < order.total_cash) {
      throw new BadRequestException('잔액 부족');
    }

    // 계산 전 값들을 숫자로 확실하게 변환
    const newCash = Number(currentUser.cash) - Number(order.total_cash);

    if (isNaN(newCash)) {
      throw new BadRequestException('잔액 계산 중 오류가 발생했습니다');
    }

    currentUser.cash = newCash;
    await this.userRepository.save(currentUser);
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
