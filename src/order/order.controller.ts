import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 주문하기, 유저의 모든 주문 조회하기, 주문 하나 조회하기, 주문의 배송 상태 확인하기, 주문 취소하기

  // 주문하기
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@GetUser() user: User, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(user, createOrderDto);
  }

  // 유저의 모든 주문 조회하기
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@GetUser() user: User) {
    return this.orderService.findAll(user);
  }

  // 주문 하나 조회하기
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@GetUser() user: User, @Param('id') id: number) {
    return this.orderService.findOne(user, id);
  }

  // 주문의 배송 상태 확인하기

  // 주문 취소하기
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@GetUser() user: User, @Param('id') id: number) {
    return this.orderService.remove(user, id);
  }
}
