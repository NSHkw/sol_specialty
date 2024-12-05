import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('CartItem')
@ApiBearerAuth('access-token')
@Controller('cart-item')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  // 장바구니에 물품 추가하기, 장바구니 모든 물품 조회하기, 장바구니 물품 삭제하기

  // 장바구니에 물품 추가하기
  // param에 store_id도 추가해야 할 것 같음
  @Post(':store_id')
  @UseGuards(JwtAuthGuard)
  async create(
    @GetUser() user: User,
    @Param('store_id') store_id: number,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    return this.cartItemService.create(user, store_id, createCartItemDto);
  }

  // 장바구니 모든 물품 조회하기
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@GetUser() user: User) {
    return this.cartItemService.findAll(user);
  }

  // 장바구니 물품 삭제하기
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@GetUser() user: User, @Param('id') id: number) {
    return this.cartItemService.remove(user, id);
  }

  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartItemService.update(user, id, updateCartItemDto);
  }
}
