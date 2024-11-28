import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, ShipStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { StoreProduct } from 'src/store-product/entities/store-product.entity';
import { CartItemService } from 'src/cart-item/cart-item.service';

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
  async create(user: User, createOrderDto: CreateOrderDto) {
    const { order_address, order_method, order_items } = createOrderDto;

    const order = this.orderRepository.create({
      user_id: user.id,
      order_address: order_address,
      order_method: order_method,
      order_date: new Date(),
    });

    const savedOrder = await this.orderRepository.save(order);

    // 주문할 상품 찾기
    const storeProducts = await this.storeProductRepository.findByIds(
      order_items.map((item) => item.store_product_id),
    );

    let total_cash = 0;

    const orderItems = order_items.map((item) => {
      const storeProduct = storeProducts.find((product) => product.id === item.store_product_id);

      if (!storeProduct) {
        throw new NotFoundException('존재하지 않는 상품');
      }

      if (storeProduct.stock < item.quantity) {
        throw new BadRequestException('재고가 부족');
      }

      total_cash += storeProduct.price * item.quantity;

      return this.orderItemRepository.create({
        order_id: savedOrder.id,
        store_product_id: item.store_product_id,
        quantity: item.quantity,
      });
    });

    await this.orderItemRepository.save(orderItems);

    await Promise.all(
      createOrderDto.order_items.map((item) => {
        const storeProduct = storeProducts.find((product) => product.id === item.store_product_id);
        storeProduct.stock -= item.quantity;
        return this.storeProductRepository.save(storeProduct);
      }),
    );

    if (createOrderDto.from_cart) {
      await this.cartItemService.removeByStoreProductIds(
        user.id,
        order_items.map((item) => item.store_product_id),
      );
    }

    savedOrder.total_cash = total_cash;
    await this.orderRepository.save(savedOrder);

    return this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['order_items'],
    });
  }

  // 결제하기
  async pay(user: User, id: number) {
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
  findAll(user: User) {
    return this.orderRepository.find({
      where: { user_id: user.id },
      relations: ['order_items'],
    });
  }

  // 주문 하나 조회하기
  async findOne(user: User, id: number) {
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
    const order = await this.findOne(user, id);
    return order.status;
  }

  // 주문 취소하기
  async cancel(user: User, id: number) {
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

    // 재고 복구
    const orderItems = await this.orderItemRepository.find({
      where: { order_id: id },
      relations: ['store_product'],
    });

    await Promise.all(
      orderItems.map(async (item) => {
        const storeProduct = item.store_product;
        storeProduct.stock += item.quantity;
        await this.storeProductRepository.save(storeProduct);
      }),
    );

    order.status = ShipStatus.ORDER_CANCELLED;
    await this.orderRepository.save(order);

    return { message: '주문 취소 완료', order };
  }
}
