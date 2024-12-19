// src/order/order.controller.ts
import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DirectOrderDto } from './dto/direct-order.dto';
import { CartOrderDto } from './dto/cart-order.dto';

@ApiTags('Order')
@ApiBearerAuth('access-token')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 주문하기, 장바구니에 있는 물품들 선택 주문, 결제하기, 유저의 모든 주문 조회하기, 주문 하나 조회하기, 주문의 배송 상태 확인하기, 주문 취소하기

  // 주문하기
  @Post('direct')
  @UseGuards(JwtAuthGuard)
  async createDirectOrder(@GetUser() user: User, @Body() createOrderDto: DirectOrderDto) {
    return this.orderService.createDirectOrder(user, createOrderDto);
  }

  @Post('cart')
  @UseGuards(JwtAuthGuard)
  async createCartOrder(@GetUser() user: User, @Body() createOrderDto: CartOrderDto) {
    return this.orderService.createCartOrder(user, createOrderDto);
  }

  // 결제하기
  @Post(':id/pay')
  @UseGuards(JwtAuthGuard)
  async pay(@GetUser() user: User, @Param('id') id: number) {
    return this.orderService.pay(user, id);
  }

  // 유저의 모든 주문 조회하기
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@GetUser() user: User) {
    return this.orderService.findAllOrder(user);
  }

  // 주문 하나 조회하기
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@GetUser() user: User, @Param('id') id: number) {
    return this.orderService.findOneDetailOrder(user, id);
  }

  // 주문의 배송 상태 확인하기
  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  async getOrderStatus(@GetUser() user: User, @Param('id') id: number) {
    return this.orderService.getOrderStatus(user, id);
  }

  // 주문 취소하기
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async cancel(@GetUser() user: User, @Param('id') id: number) {
    return this.orderService.cancelOrder(user, id);
  }
}
