import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrderType } from './entities/order.entity';

@ApiTags('Order')
@ApiBearerAuth('access-token')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 주문하기, 장바구니에 있는 물품들 선택 주문, 결제하기, 유저의 모든 주문 조회하기, 주문 하나 조회하기, 주문의 배송 상태 확인하기, 주문 취소하기

  // 주문하기
  @Post('direct')
  @UseGuards(JwtAuthGuard)
  async createDirectOrder(@GetUser() user: User, @Body() createOrderDto: CreateOrderDto) {
    createOrderDto.order_type = OrderType.DIRECT;
    return this.orderService.createDirectOrder(user, createOrderDto);
  }

  @Post('cart')
  @UseGuards(JwtAuthGuard)
  async createCartOrder(@GetUser() user: User, @Body() createOrderDto: CreateOrderDto) {
    createOrderDto.order_type = OrderType.CART;
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
    return this.orderService.findAll(user);
  }

  // 주문 하나 조회하기
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@GetUser() user: User, @Param('id') id: number) {
    return this.orderService.findOne(user, id);
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
    return this.orderService.cancel(user, id);
  }
}
