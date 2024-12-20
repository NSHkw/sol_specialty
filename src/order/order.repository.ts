// src/order/order.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, ShipStatus } from './entities/order.entity';
import { EntityManager, Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create(orderData);
    return this.orderRepository.save(order);
  }

  async createOrderItem(orderItemData: Partial<OrderItem>): Promise<OrderItem> {
    const orderItem = this.orderItemRepository.create(orderItemData);
    return this.orderItemRepository.save(orderItem);
  }

  async findOrderById(id: number, relations: string[] = []): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id },
      relations,
    });
  }

  async findOrderByUserAndId(
    user_id: number,
    order_id: number,
    relations: string[] = [],
  ): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id: order_id, user_id },
      relations,
    });
  }

  async findOrderByUserId(user_id, relations: string[] = []): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user_id },
      relations,
    });
  }

  async findOrderItems(order_id: number, relations: string[] = []): Promise<OrderItem[]> {
    return this.orderItemRepository.find({
      where: { order_id },
      relations,
    });
  }

  async saveOrder(order: Order): Promise<Order> {
    return this.orderRepository.save(order);
  }

  async saveOrderItems(orderItems: OrderItem[]): Promise<OrderItem[]> {
    return this.orderItemRepository.save(orderItems);
  }

  async removeOrder(order: Order): Promise<void> {
    await this.orderRepository.remove(order);
  }

  async updateOrderStatus(order_id: number, status: ShipStatus): Promise<void> {
    await this.orderRepository.update(order_id, { status });
  }

  async findOrderWithDetails(order_id: number): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id: order_id },
      relations: ['user', 'order_items', 'order_items.store_product'],
    });
  }

  async updateOrder(order_id: number, updateData: Partial<Order>): Promise<void> {
    await this.orderRepository.update(order_id, updateData);
  }

  getManager(): EntityManager {
    return this.orderRepository.manager;
  }
}
