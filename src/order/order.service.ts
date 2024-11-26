import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class OrderService {
  create(user: User, createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }

  findAll(user: User) {
    return `This action returns all order`;
  }

  findOne(user: User, id: number) {
    return `This action returns a #${id} order`;
  }

  remove(user: User, id: number) {
    return `This action removes a #${id} order`;
  }
}
