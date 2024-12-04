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
    const orders = await this.orderRepository.find({
      where: [
        {
          status: ShipStatus.ORDER_COMPLETED,
          order_date: LessThan(new Date(Date.now() - 1 * 60 * 1000)),
        },
        {
          status: ShipStatus.SHIP_WAITING,
          updated_at: LessThan(new Date(Date.now() - 1 * 60 * 1000)),
        },
        {
          status: ShipStatus.SHIPPING,
          updated_at: LessThan(new Date(Date.now() - 1 * 60 * 1000)),
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
