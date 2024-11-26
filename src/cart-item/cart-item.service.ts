import { Injectable } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CartItemService {
  create(user: User, createCartItemDto: CreateCartItemDto) {
    return 'This action adds a new cartItem';
  }

  findAll(user: User) {
    return `This action returns all cartItem`;
  }

  findOne(user: User, id: number) {
    return `This action returns a #${id} cartItem`;
  }

  update(user: User, id: number, updateCartItemDto: UpdateCartItemDto) {
    return `This action updates a #${id} cartItem`;
  }

  remove(user: User, id: number) {
    return `This action removes a #${id} cartItem`;
  }
}
