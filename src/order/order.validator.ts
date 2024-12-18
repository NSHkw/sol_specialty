import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';

@Injectable()
export class OrderValidator {
  constructor(private readonly orderRepository: OrderRepository) {}
}
