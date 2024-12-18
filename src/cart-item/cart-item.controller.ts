// src/cart-item/cart-item.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';
import { CartItemResponse } from './types/cart-item.type';

@ApiTags('CartItem')
@ApiBearerAuth('access-token')
@Controller('cart-item')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  // 장바구니에 물품 추가하기
  @Post(':store_id')
  @UseGuards(JwtAuthGuard)
  async create(
    @GetUser() user: User,
    @Param('store_id') store_id: number,
    @Body() createCartItemDto: CreateCartItemDto,
  ): Promise<CartItem> {
    return this.cartItemService.putInCart(user, store_id, createCartItemDto);
  }

  // 장바구니 모든 물품 조회하기
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@GetUser() user: User): Promise<CartItem[]> {
    return await this.cartItemService.findAll(user);
  }

  // 장바구니 내 물품 개수 수정하기
  @Patch(':id')
  async update(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    return await this.cartItemService.update(user, id, updateCartItemDto);
  }

  // 장바구니 물품 삭제하기
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@GetUser() user: User, @Param('id') id: number): Promise<CartItemResponse> {
    return this.cartItemService.remove(user, id);
  }
}
