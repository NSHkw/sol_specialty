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

  // cron: 정해진 시간에 자동으로 작업 실행하게 해주는 스케줄러 데코레이터
  @Cron(CronExpression.EVERY_MINUTE) // 매 1분마다 아래 함수를 실행하라는 데코레이터
  async updateOrderStatus() {
    const orders = await this.orderRepository.find({
      where: [
        {
          status: ShipStatus.ORDER_COMPLETED,
          order_date: LessThan(new Date(Date.now() - 1 * 60 * 1000)), // 각 주문별 시간 추적이 필요 (less than으로 시작 조건 추가, 1분)
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
    // 주문 상태 흐름
    // ShipStatus.PAYMENT_WAITING   결제 대기
    // ↓
    // ShipStatus.ORDER_COMPLETED   결제 완료
    // ↓
    // ShipStatus.SHIP_WAITING     배송 대기
    // ↓
    // ShipStatus.SHIPPING         배송 중
    // ↓
    // ShipStatus.DELIVERY_COMPLETED  배송 완료
  }
}
