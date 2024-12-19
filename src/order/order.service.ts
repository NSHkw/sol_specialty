// src/order/order.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { Order, OrderType, ShipStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { StoreProduct } from '../store-product/entities/store-product.entity';
import { CartItemService } from '../cart-item/cart-item.service';
import { AuthUtils } from '../common/utils/auth.utils';
import { DirectOrderDto } from './dto/direct-order.dto';
import { CartOrderDto } from './dto/cart-order.dto';
import { OrderInterface } from './interfaces/order.interface';
import { OrderRepository } from './order.repository';
import { StoreProductRepository } from '../store-product/store-product.repository';
import { UserRepository } from '../user/user.repository';
import { OrderResponse } from './types/order.type';
import { OrderValidator } from './order.validator';
import { EntityManager, In } from 'typeorm';
import { CartItem } from '../cart-item/entities/cart-item.entity';

@Injectable()
export class OrderService implements OrderInterface {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly storeProductRepository: StoreProductRepository,
    private readonly userRepository: UserRepository,
    private readonly cartItemService: CartItemService,
    private readonly orderValidator: OrderValidator,
  ) {}

  // 주문하기, 유저의 모든 주문 조회하기, 주문 하나 조회하기, 주문의 배송 상태 확인하기, 주문 취소하기

  // 주문하기
  async createDirectOrder(
    user: User,
    createOrderDto: DirectOrderDto,
  ): Promise<OrderResponse<Order>> {
    AuthUtils.validateLogin(user);
    await this.orderValidator.validateStockForDirectOrder(createOrderDto);

    const order = await this.processOrder(user, createOrderDto, OrderType.DIRECT);

    return {
      message: '바로 주문 생성',
      data: order,
    };
  }

  async createCartOrder(user: User, createOrderDto: CartOrderDto) {
    AuthUtils.validateLogin(user);
    await this.orderValidator.validateStockForCartOrder(createOrderDto);
    await this.validateCartItems(user, createOrderDto);

    const order = await this.processOrder(user, createOrderDto, OrderType.CART);

    return {
      message: '장바구니 주문 생성',
      data: order,
    };
  }

  private async processDirectOrderItems(
    order: Order,
    orderDto: DirectOrderDto,
    manager: EntityManager,
  ): Promise<void> {
    const { store_product_id, quantity } = orderDto;
    const storeProduct = await manager.findOne(StoreProduct, {
      where: { id: store_product_id },
    });

    storeProduct.stock -= orderDto.quantity;
    await manager.save(StoreProduct, storeProduct);

    const orderItem = manager.create(OrderItem, { order_id: order.id, store_product_id, quantity });
    await manager.save(OrderItem, orderItem);
    order.total_cash = storeProduct.price * quantity;
    await manager.save(Order, order);
  }

  private async processCartOrderItems(
    order: Order,
    orderDto: CartOrderDto,
    manager: EntityManager,
  ): Promise<void> {
    let total_cash = 0;
    const orderItems = [];

    const storeProducts = await manager.findByIds(
      StoreProduct,
      orderDto.order_items.map((item) => item.store_product_id),
    );

    for (const item of orderDto.order_items) {
      const storeProduct = storeProducts.find((p) => p.id === item.store_product_id);

      storeProduct.stock -= item.quantity;
      await manager.save(StoreProduct, storeProduct);

      total_cash += storeProduct.price * item.quantity;
      orderItems.push(
        manager.create(OrderItem, {
          order_id: order.id,
          store_product_id: item.store_product_id,
          quantity: item.quantity,
        }),
      );
    }

    await manager.save(OrderItem, orderItems);
    order.total_cash = total_cash;
    await manager.save(Order, order);
  }

  private async processOrder(
    user: User,
    orderDto: DirectOrderDto | CartOrderDto,
    orderType: OrderType,
  ) {
    const { order_address, order_method } = orderDto;
    const manager = this.orderRepository.getManager();

    // 트랜잭션 시작 전에 기본 주문 생성
    const order = manager.create(Order, {
      user_id: user.id,
      order_address,
      order_method,
      order_type: orderType,
      order_date: new Date(),
    });

    try {
      // 2. 재고 확인 및 주문 상품 처리 (트랜잭션)
      await manager.transaction(async (tmanager) => {
        await tmanager.save(order);
        if (orderType === OrderType.DIRECT) {
          await this.processDirectOrderItems(order, orderDto as DirectOrderDto, tmanager);
        } else {
          await this.processCartOrderItems(order, orderDto as CartOrderDto, tmanager);
        }
        // 3. 장바구니 비우기 (장바구니 주문인 경우에만)
        if (orderType === OrderType.CART) {
          await this.clearCartItems(tmanager, user.id, orderDto as CartOrderDto);
        }
      });

      return manager.findOne(Order, {
        where: { id: order.id },
        relations: ['order_items'],
      });
    } catch (error) {
      // 주문 실패 시 주문 정보 삭제
      await manager.remove(order);
      throw error;
    }
  }

  private async clearCartItems(
    manager: EntityManager,
    user_id: number,
    orderDto: CartOrderDto,
  ): Promise<void> {
    await manager.delete(CartItem, {
      user_id,
      store_product_id: In(orderDto.order_items.map((item) => item.store_product_id)),
    });
  }

  private async validateCartItems(user: User, orderDto: CartOrderDto): Promise<void> {
    const cartItems = await this.cartItemService.findAll(user);
    const cartItemMap = new Map(cartItems.map((item) => [item.store_product_id, item]));

    for (const orderItem of orderDto.order_items) {
      const cartItem = cartItemMap.get(orderItem.store_product_id);
      if (!cartItem) {
        throw new BadRequestException('장바구니에 없는 상품은 주문할 수 없습니다');
      }
      if (cartItem.quantity < orderItem.quantity) {
        throw new BadRequestException('장바구니의 수량보다 많이 주문할 수 없습니다');
      }
    }
  }

  // 결제하기
  async pay(user: User, order_id: number): Promise<OrderResponse<Order>> {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const manager = this.orderRepository.getManager();

    try {
      await manager.transaction(async (tmanager) => {
        const [currentUser, order] = await Promise.all([
          tmanager.findOne(User, { where: { id: user.id } }),
          tmanager.findOne(Order, { where: { id: order_id, user_id: user.id } }),
        ]);

        if (!order) {
          throw new NotFoundException('주문 찾을 수 없음');
        }

        this.orderValidator.validateOrderStatus(order, [ShipStatus.PAYMENT_WAITING]);
        await this.orderValidator.validateUserBalance(currentUser, order.total_cash);

        currentUser.cash -= order.total_cash;
        order.status = ShipStatus.ORDER_COMPLETED;

        await Promise.all([tmanager.save(currentUser), tmanager.save(order)]);
      });
      return {
        message: '결제 완료',
        data: await this.orderRepository.findOrderById(order_id),
      };
    } catch (error) {
      throw error;
    }
  }

  // 유저의 모든 주문 조회하기
  async findAllOrder(user: User): Promise<Order[]> {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    return this.orderRepository.findOrderByUserId(user.id, ['order_items']);
  }

  // 주문 하나 조회하기
  async findOneDetailOrder(user: User, order_id: number): Promise<Order> {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const order = await this.orderRepository.findOrderByUserAndId(user.id, order_id, [
      'user',
      'order_items',
    ]);

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    return order;
  }

  // 주문의 배송 상태 확인하기
  async getOrderStatus(user: User, order_id: number): Promise<Order['status']> {
    const order = await this.findOneDetailOrder(user, order_id);
    return order.status;
  }

  // 주문 취소하기
  async cancelOrder(user: User, order_id: number): Promise<OrderResponse<Order>> {
    // 로그인 체크
    AuthUtils.validateLogin(user);
    const manager = this.orderRepository.getManager();

    try {
      return await manager.transaction(async (tmanager) => {
        const order = await this.orderRepository.findOrderByUserAndId(user.id, order_id, [
          'order_items',
          'order_items.store_product',
          'order_items.store_product.store',
        ]);
        if (!order) {
          throw new NotFoundException('주문 찾을 수 없음');
        }

        this.orderValidator.validateOrderStatus(order, [
          ShipStatus.ORDER_COMPLETED,
          ShipStatus.PAYMENT_WAITING,
        ]);

        await this.processCancellation(tmanager, user, order);

        return {
          message: '주문 취소',
          data: order,
        };
      });
    } catch (error) {
      throw error;
    }
  }

  private async processCancellation(
    manager: EntityManager,
    user: User,
    order: Order,
  ): Promise<void> {
    if (order.status === ShipStatus.ORDER_COMPLETED) {
      await this.processRefund(manager, user, order.total_cash);
    }

    await this.restoreOrderItems(manager, user, order);

    order.status = ShipStatus.ORDER_CANCELLED;
    await manager.save(order);
  }

  private async processRefund(manager: EntityManager, user: User, amount: number): Promise<void> {
    user.cash += amount;
    await manager.save(user);
  }

  private async restoreOrderItems(manager: EntityManager, user: User, order: Order): Promise<void> {
    await Promise.all(
      order.order_items.map(async (item) => {
        const storeProduct = await manager.findOne(StoreProduct, {
          where: { id: item.store_product_id },
        });
        storeProduct.stock += item.quantity;
        await manager.save(StoreProduct, storeProduct);

        if (order.order_type === OrderType.CART) {
          const cartItem = manager.create(CartItem, {
            user_id: user.id,
            store_id: item.store_product.store_id,
            store_product_id: item.store_product_id,
            quantity: item.quantity,
          });
          await manager.save(CartItem, cartItem);
        }
      }),
    );
  }
}
