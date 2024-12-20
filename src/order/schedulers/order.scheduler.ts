// src/order/schedulers/order.scheduler.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Order, ShipStatus } from '../entities/order.entity';

@Injectable()
export class OrderScheduler {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async updateOrderStatus() {
    // 각 상태별 기준 시간 출력
    const orderCompletedTime = new Date(Date.now() - 1 * 60 * 1000);
    const shipWaitingTime = new Date(Date.now() - 2 * 60 * 1000);
    const shippingTime = new Date(Date.now() - 3 * 60 * 1000);

    const orders = await this.orderRepository.find({
      where: [
        {
          status: ShipStatus.ORDER_COMPLETED,
          updated_at: LessThan(orderCompletedTime),
        },
        {
          status: ShipStatus.SHIP_WAITING,
          updated_at: LessThan(shipWaitingTime),
        },
        {
          status: ShipStatus.SHIPPING,
          updated_at: LessThan(shippingTime),
        },
      ],
    });

    for (const order of orders) {
      switch (order.status) {
        case ShipStatus.ORDER_COMPLETED:
          order.status = ShipStatus.SHIP_WAITING;
          break;
        case ShipStatus.SHIP_WAITING:
          order.status = ShipStatus.SHIPPING;
          break;
        case ShipStatus.SHIPPING:
          order.status = ShipStatus.DELIVERY_COMPLETED;
          break;
      }

      await this.orderRepository.save(order);
    }
  }
}
